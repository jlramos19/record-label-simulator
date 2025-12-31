import { fetchRolloutStrategyTemplateByFingerprint, fetchRolloutStrategyTemplateById, fetchTrackRolloutInstanceByTrackId, listRolloutStrategyTemplates as listTemplatesFromDb, upsertRolloutStrategyTemplate, upsertTrackRolloutInstance } from "./db.js";
const TRACK_ROLLOUT_WEIGHT_KEYS = ["interviews", "live", "eyeriSocial", "tour"];
const TRACK_ROLLOUT_TOGGLE_KEYS = ["musicVideoOn", "tourTieInOn", "primeTimeLiveOn", "isSingle"];
const TRACK_ROLLOUT_FOCUS_KEYS = ["interviews", "live", "eyeriSocial", "tour", "musicVideo"];
const TRACK_ROLLOUT_FOCUS_LABELS = {
    interviews: "Interviews",
    live: "Live performance",
    eyeriSocial: "eyeriSocial",
    tour: "Tour",
    musicVideo: "Music video"
};
const DEFAULT_WEIGHTS = { interviews: 25, live: 25, eyeriSocial: 25, tour: 25 };
const DEFAULT_TOGGLES = {
    musicVideoOn: false,
    tourTieInOn: false,
    primeTimeLiveOn: false,
    isSingle: true
};
const PREMADE_DATA_PATH = "data/rollout_premades.json";
function clampNumber(value, min, max) {
    const safe = Number.isFinite(value) ? value : 0;
    return Math.max(min, Math.min(max, safe));
}
function normalizeToggleValue(value) {
    return Boolean(value);
}
function normalizeToggles(toggles) {
    const next = { ...DEFAULT_TOGGLES };
    TRACK_ROLLOUT_TOGGLE_KEYS.forEach((key) => {
        next[key] = normalizeToggleValue(toggles?.[key]);
    });
    return next;
}
function sanitizeWeights(weights) {
    const next = {};
    TRACK_ROLLOUT_WEIGHT_KEYS.forEach((key) => {
        next[key] = clampNumber(weights?.[key], 0, 100);
    });
    return next;
}
function scaleWeights(weights) {
    const values = TRACK_ROLLOUT_WEIGHT_KEYS.map((key) => weights[key] || 0);
    const sum = values.reduce((total, value) => total + value, 0);
    if (!sum)
        return { weights: { ...DEFAULT_WEIGHTS }, sum: 100, rawSum: 0 };
    const scale = 100 / sum;
    const scaled = values.map((value) => value * scale);
    const rounded = scaled.map((value) => Math.round(value));
    const remainders = scaled.map((value) => value - Math.floor(value));
    let remainder = 100 - rounded.reduce((total, value) => total + value, 0);
    if (remainder !== 0) {
        const indices = TRACK_ROLLOUT_WEIGHT_KEYS.map((_, index) => index);
        if (remainder > 0) {
            indices.sort((a, b) => {
                if (remainders[b] !== remainders[a])
                    return remainders[b] - remainders[a];
                return a - b;
            });
            for (let i = 0; i < remainder; i += 1) {
                const index = indices[i % indices.length];
                rounded[index] += 1;
            }
        }
        else {
            indices.sort((a, b) => {
                if (remainders[a] !== remainders[b])
                    return remainders[a] - remainders[b];
                return b - a;
            });
            let remaining = Math.abs(remainder);
            let cursor = 0;
            while (remaining > 0 && cursor < indices.length * 3) {
                const index = indices[cursor % indices.length];
                if (rounded[index] > 0) {
                    rounded[index] -= 1;
                    remaining -= 1;
                }
                cursor += 1;
            }
        }
    }
    const normalized = {};
    TRACK_ROLLOUT_WEIGHT_KEYS.forEach((key, index) => {
        normalized[key] = rounded[index];
    });
    return { weights: normalized, sum: 100, rawSum: sum };
}
function normalizeWeights(weights, { bucket = false } = {}) {
    const clamped = sanitizeWeights(weights);
    if (bucket) {
        TRACK_ROLLOUT_WEIGHT_KEYS.forEach((key) => {
            clamped[key] = Math.round(clamped[key] / 5) * 5;
        });
    }
    return scaleWeights(clamped);
}
function deriveFocuses(weights) {
    const safe = sanitizeWeights(weights);
    const entries = TRACK_ROLLOUT_WEIGHT_KEYS.map((key) => ({ key, value: safe[key] }));
    const sum = entries.reduce((total, entry) => total + entry.value, 0);
    if (!sum) {
        return { primary: "interviews", secondary: "live" };
    }
    let primary = entries[0].key;
    let primaryValue = entries[0].value;
    entries.forEach((entry) => {
        if (entry.value > primaryValue) {
            primary = entry.key;
            primaryValue = entry.value;
        }
    });
    const secondaryEntries = entries.filter((entry) => entry.key !== primary);
    secondaryEntries.sort((a, b) => {
        if (b.value !== a.value)
            return b.value - a.value;
        return TRACK_ROLLOUT_WEIGHT_KEYS.indexOf(a.key) - TRACK_ROLLOUT_WEIGHT_KEYS.indexOf(b.key);
    });
    const secondary = secondaryEntries[0];
    if (!secondary)
        return { primary, secondary: null };
    if (secondary.value >= 25 && primaryValue - secondary.value <= 15) {
        return { primary, secondary: secondary.key };
    }
    return { primary, secondary: null };
}
function isValidFocus(value) {
    return TRACK_ROLLOUT_FOCUS_KEYS.includes(value);
}
function resolveFocusPair({ weights, primaryFocus, secondaryFocus }) {
    const primary = isValidFocus(primaryFocus) ? primaryFocus : null;
    const secondary = isValidFocus(secondaryFocus) ? secondaryFocus : null;
    if (primary) {
        return { primary, secondary: secondary && secondary !== primary ? secondary : null };
    }
    return deriveFocuses(weights);
}
function focusLabel(focus) {
    if (!focus)
        return "Focus";
    return TRACK_ROLLOUT_FOCUS_LABELS[focus] || focus;
}
function buildName(primary, secondary) {
    if (!primary)
        return "Focus";
    const primaryLabel = focusLabel(primary);
    if (secondary) {
        return `${primaryLabel} + ${focusLabel(secondary)} focus`;
    }
    return `${primaryLabel} focus`;
}
function buildFingerprint({ primary, secondary, weights, toggles }) {
    const resolved = normalizeWeights(weights, { bucket: true }).weights;
    const flags = normalizeToggles(toggles);
    const secondaryLabel = secondary || "none";
    return [
        `p=${primary};s=${secondaryLabel}`,
        `w=i:${resolved.interviews},l:${resolved.live},s:${resolved.eyeriSocial},t:${resolved.tour}`,
        `t=video:${flags.musicVideoOn ? 1 : 0},tour:${flags.tourTieInOn ? 1 : 0},prime:${flags.primeTimeLiveOn ? 1 : 0},single:${flags.isSingle ? 1 : 0}`
    ].join("|");
}
function buildId(prefix) {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function buildTemplateRecord({ templateId = null, createdAt = null, createdSource = "player_saved", weights = DEFAULT_WEIGHTS, toggles = DEFAULT_TOGGLES, primaryFocus = null, secondaryFocus = null } = {}) {
    const bucketed = normalizeWeights(weights, { bucket: true }).weights;
    const focus = resolveFocusPair({ weights: bucketed, primaryFocus, secondaryFocus });
    const fingerprint = buildFingerprint({
        primary: focus.primary,
        secondary: focus.secondary,
        weights: bucketed,
        toggles
    });
    return {
        template_id: templateId || buildId("RT"),
        name: buildName(focus.primary, focus.secondary),
        primary_focus: focus.primary,
        secondary_focus: focus.secondary,
        weights_json: bucketed,
        toggles_json: normalizeToggles(toggles),
        created_source: createdSource,
        fingerprint,
        created_at_ts: Number.isFinite(createdAt) ? createdAt : Date.now()
    };
}
async function listTrackRolloutTemplates() {
    const templates = await listTemplatesFromDb();
    return templates.slice().sort((a, b) => {
        const sourceA = a?.created_source === "premade" ? 0 : 1;
        const sourceB = b?.created_source === "premade" ? 0 : 1;
        if (sourceA !== sourceB)
            return sourceA - sourceB;
        return String(a?.name || "").localeCompare(String(b?.name || ""));
    });
}
let templateCache = null;
let templateCacheUpdatedAt = 0;
function setTrackRolloutTemplateCache(templates) {
    templateCache = Array.isArray(templates) ? templates.slice() : [];
    templateCacheUpdatedAt = Date.now();
}
function getTrackRolloutTemplateCache() {
    return templateCache;
}
function getTrackRolloutTemplateCacheUpdatedAt() {
    return templateCacheUpdatedAt;
}
async function fetchTrackRolloutTemplateById(templateId) {
    return fetchRolloutStrategyTemplateById(templateId);
}
async function saveTrackRolloutTemplate({ weights, toggles, primaryFocus, secondaryFocus, createdSource = "player_saved" } = {}) {
    const record = buildTemplateRecord({
        weights,
        toggles,
        primaryFocus,
        secondaryFocus,
        createdSource
    });
    const existing = await fetchRolloutStrategyTemplateByFingerprint(record.fingerprint);
    if (existing) {
        return { template: existing, created: false, fingerprint: record.fingerprint };
    }
    await upsertRolloutStrategyTemplate(record);
    return { template: record, created: true, fingerprint: record.fingerprint };
}
async function loadPremadeRolloutTemplates() {
    try {
        const response = await fetch(PREMADE_DATA_PATH, { cache: "no-store" });
        if (!response.ok)
            return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    }
    catch (error) {
        console.warn("[track-rollout] Premade rollout templates unavailable.", error);
        return [];
    }
}
async function ensurePremadeRolloutTemplates() {
    const premades = await loadPremadeRolloutTemplates();
    if (!premades.length)
        return { created: 0, updated: 0, total: 0 };
    let created = 0;
    let updated = 0;
    for (const entry of premades) {
        const record = buildTemplateRecord({
            weights: entry?.weights || DEFAULT_WEIGHTS,
            toggles: entry?.toggles || DEFAULT_TOGGLES,
            primaryFocus: entry?.primary_focus || null,
            secondaryFocus: entry?.secondary_focus || null,
            createdSource: "premade"
        });
        const existing = await fetchRolloutStrategyTemplateByFingerprint(record.fingerprint);
        if (existing) {
            const next = {
                ...record,
                template_id: existing.template_id,
                created_at_ts: existing.created_at_ts || record.created_at_ts
            };
            await upsertRolloutStrategyTemplate(next);
            updated += 1;
        }
        else {
            await upsertRolloutStrategyTemplate(record);
            created += 1;
        }
    }
    return { created, updated, total: premades.length };
}
async function saveTrackRolloutInstance({ trackId, templateId = null, weights = DEFAULT_WEIGHTS, toggles = DEFAULT_TOGGLES, primaryFocus = null, secondaryFocus = null, status = "draft" } = {}) {
    if (!trackId)
        return null;
    const normalized = normalizeWeights(weights, { bucket: false }).weights;
    const focus = resolveFocusPair({ weights: normalized, primaryFocus, secondaryFocus });
    const existing = await fetchTrackRolloutInstanceByTrackId(trackId);
    const instance = {
        instance_id: existing?.instance_id || buildId("TRI"),
        track_id: trackId,
        template_id: templateId || null,
        primary_focus: focus.primary,
        secondary_focus: focus.secondary,
        weights_json: normalized,
        toggles_json: normalizeToggles(toggles),
        status: status || "draft",
        updated_at_ts: Date.now()
    };
    await upsertTrackRolloutInstance(instance);
    return instance;
}
export { TRACK_ROLLOUT_WEIGHT_KEYS, TRACK_ROLLOUT_TOGGLE_KEYS, TRACK_ROLLOUT_FOCUS_KEYS, TRACK_ROLLOUT_FOCUS_LABELS, DEFAULT_WEIGHTS as TRACK_ROLLOUT_DEFAULT_WEIGHTS, DEFAULT_TOGGLES as TRACK_ROLLOUT_DEFAULT_TOGGLES, sanitizeWeights, normalizeWeights, deriveFocuses, resolveFocusPair, focusLabel, buildName, buildFingerprint, listTrackRolloutTemplates, fetchTrackRolloutTemplateById, saveTrackRolloutTemplate, setTrackRolloutTemplateCache, getTrackRolloutTemplateCache, getTrackRolloutTemplateCacheUpdatedAt, ensurePremadeRolloutTemplates, saveTrackRolloutInstance, fetchTrackRolloutInstanceByTrackId as fetchTrackRolloutInstance };
//# sourceMappingURL=track-rollout.js.map