// @ts-nocheck
import { fetchChartSnapshot, listChartWeeks, storeChartSnapshot } from "./db.js";
import { DEFAULT_PROMO_TYPE, PROMO_TYPE_DETAILS, getPromoTypeDetails } from "./promo_types.js";
import { CalendarView, useCalendarProjection } from "./calendar.js";
const LIVE_SYNC_INTERVAL_MS = 500;
const session = {
    activeSlot: null,
    prevSpeed: null,
    uiLogStart: 0,
    lastSlotPayload: null,
    lastLiveSyncAt: 0
};
const UI_EVENT_LOG_KEY = "rls_ui_event_log_v1";
const LOSS_ARCHIVE_KEY = "rls_loss_archive_v1";
const LOSS_ARCHIVE_LIMIT = 3;
const SEED_CALIBRATION_KEY = "rls_seed_calibration_v1";
const HOURLY_TICK_FRAME_LIMIT = 48;
const HOURLY_TICK_WARNING_THRESHOLD = 12;
const WEEKLY_UPDATE_WARN_MS = 50;
const HOURLY_TICK_WARN_MS = 25;
const TICK_FRAME_WARN_MS = 33;
const STATE_VERSION = 4;
const STARTING_CASH = 50000;
const STARTING_STUDIO_SLOTS = 2;
const STAGE_STUDIO_LIMIT = 3;
const STUDIO_COLUMN_SLOT_COUNT = 5;
const STAMINA_OVERUSE_LIMIT = 200;
const STAMINA_OVERUSE_STRIKES = 1;
const STAMINA_REGEN_PER_HOUR = 50;
const RESOURCE_TICK_LEDGER_LIMIT = 24;
const SEED_CALIBRATION_YEAR = 2400;
const COMMUNITY_RANKING_LIMITS = [8, 40];
const COMMUNITY_RANKING_DEFAULT = 40;
const TREND_DETAIL_COUNT = 3;
const TREND_WINDOW_WEEKS = 4;
const MARKET_TRACK_ACTIVE_LIMIT = 600;
const MARKET_TRACK_ARCHIVE_LIMIT = 2400;
const WEEKLY_SCHEDULE = {
    releaseProcessing: { day: 5, hour: 0 },
    trendsUpdate: { day: 5, hour: 12 },
    chartUpdate: { day: 6, hour: 0 }
};
const ROLLOUT_EVENT_SCHEDULE = { day: 2, hour: 12 };
const ROLLOUT_BLOCK_LOG_COOLDOWN_HOURS = 24;
const UNASSIGNED_SLOT_LABEL = "?";
const UNASSIGNED_CREATOR_LABEL = "Unassigned";
const CREATOR_FALLBACK_ICON = "person";
const CREATOR_FALLBACK_EMOJI = "👤";
const UNASSIGNED_CREATOR_EMOJI = "❓👤";
const GAME_MODES = {
    founding: {
        id: "founding",
        label: "Founding Era (2025)",
        startYear: 2025,
        seeded: false,
        description: "Start in 2025 and build the industry before modern play."
    },
    modern: {
        id: "modern",
        label: "Modern Era (2400)",
        startYear: 2400,
        seeded: true,
        description: "Start in 2400 with seeded history and a mature market."
    }
};
const DEFAULT_GAME_MODE = "founding";
const GAME_DIFFICULTIES = {
    easy: {
        id: "easy",
        label: "Easy",
        description: "More runway with higher revenue and cheaper upkeep.",
        startingCash: 80000,
        revenueMult: 1.25,
        upkeepMult: 0.85,
        bailoutAmount: 15000000
    },
    medium: {
        id: "medium",
        label: "Medium",
        description: "Balanced cashflow with a modest cushion.",
        startingCash: 65000,
        revenueMult: 1.12,
        upkeepMult: 0.92,
        bailoutAmount: 12000000
    },
    hard: {
        id: "hard",
        label: "Hard",
        description: "Tighter cashflow with slimmer margins.",
        startingCash: STARTING_CASH,
        revenueMult: 1,
        upkeepMult: 1,
        bailoutAmount: 10000000
    }
};
const DEFAULT_GAME_DIFFICULTY = "medium";
const AUTO_PROMO_BUDGET_PCT = 0.05;
const AUTO_PROMO_MIN_BUDGET = 100;
const AUTO_PROMO_RIVAL_TYPE = "eyeriSocialPost";
const AI_PROMO_BUDGET_PCT = AUTO_PROMO_BUDGET_PCT;
const HUSK_PROMO_DEFAULT_TYPE = AUTO_PROMO_RIVAL_TYPE;
const HUSK_PROMO_DAY = 6;
const HUSK_PROMO_HOUR = 12;
const HUSK_MAX_RELEASE_STEPS = 4;
const TRACK_ROLE_KEYS = {
    Songwriter: "songwriterIds",
    Performer: "performerIds",
    Producer: "producerIds"
};
const TRACK_ROLE_TARGETS = {
    Songwriter: "track-writer",
    Performer: "track-performer",
    Producer: "track-producer"
};
const TRACK_ROLE_TARGET_PATTERN = /^track-(writer|performer|producer)(?:-(\d+))?$/;
const TRACK_ROLE_MATCH = {
    writer: "Songwriter",
    performer: "Performer",
    producer: "Producer"
};
const TRACK_CREW_RULES = {
    Songwriter: { stepMinutes: 12, slotsPerTier: 5, maxPieces: 3 },
    Performer: { stepMinutes: 24, slotsPerTier: 5, maxPieces: 2 },
    Producer: { stepMinutes: 36, slotsPerTier: 5, maxPieces: 1 }
};
const ROLE_LABELS = {
    Songwriter: "Songwriter",
    Performer: "Performer",
    Producer: "Producer"
};
const CCC_SORT_OPTIONS = [
    "default",
    "quality-desc",
    "quality-asc",
    "theme-asc",
    "theme-desc",
    "mood-asc",
    "mood-desc"
];
const ROLE_ACTION_STATUS = {
    live: { label: "Live", className: "badge" },
    simulated: { label: "Simulated", className: "badge warn" },
    placeholder: { label: "Placeholder", className: "badge danger" }
};
const ROLE_ACTIONS = [
    {
        role: "Member",
        occupations: [
            {
                name: "Personnel",
                note: "Priority order for new Members.",
                actions: [
                    { label: "Factory Personnel", verb: "manufacture", detail: "Produce physical inventory and packaging.", status: "placeholder", priority: 1 },
                    { label: "Shopping Center Personnel", verb: "distribute", detail: "Move inventory to stores and sell to consumers.", status: "placeholder", priority: 2 },
                    { label: "Broadcast Corporation Personnel", verb: "present", detail: "Program broadcasts that surface new content.", status: "placeholder", priority: 3 }
                ]
            },
            {
                name: "Consumer",
                actions: [
                    { verb: "buy", detail: "Purchase released content from Shopping Centers.", status: "simulated" },
                    { verb: "stream", detail: "Listen at home; drives weekly chart demand.", status: "simulated" },
                    { verb: "attend", detail: "Attend live events and performances at Venues.", status: "simulated" },
                    { verb: "rate", detail: "Score content after consuming it.", status: "simulated" }
                ]
            },
            {
                name: "Critic",
                actions: [
                    { verb: "review", detail: "Rate content quality using Alignment and preferences.", status: "simulated" }
                ]
            }
        ]
    },
    {
        role: "Creator",
        occupations: [
            { name: "Songwriter", actions: [{ verb: "write", detail: "Draft sheet music from Themes in Create view.", status: "live" }] },
            { name: "Performer", actions: [{ verb: "perform", detail: "Record demos that set the track Mood.", status: "live" }] },
            { name: "Producer", actions: [{ verb: "produce", detail: "Master recordings to lock Genre and base Quality.", status: "live" }] }
        ]
    },
    {
        role: "Act",
        occupations: [
            { name: "Promoter", actions: [{ verb: "promote", detail: "Run promo pushes for released tracks and eras.", status: "live" }] }
        ]
    },
    {
        role: "CEO",
        occupations: [
            {
                name: "Music Executive",
                actions: [
                    { verb: "negotiate", detail: "Contracts with Creators (auto-resolved on sign).", status: "simulated" },
                    { verb: "sign", detail: "Creators to the Record Label via the CCC.", status: "live" },
                    { verb: "form", detail: "Acts from signed Creators in Harmony Hub.", status: "live" },
                    { verb: "place", detail: "Creators in track and act slots.", status: "live" },
                    { verb: "release", detail: "Schedule ready tracks in Release Desk.", status: "live" },
                    { verb: "terminate", detail: "A contract with a Creator.", status: "placeholder" },
                    { verb: "rent", detail: "Lease studios and structures for production.", status: "placeholder" },
                    { verb: "conduct", detail: "Launch and manage Eras with Acts.", status: "live" },
                    { verb: "plan", detail: "Tours and live circuits.", status: "placeholder" }
                ]
            }
        ]
    }
];
const DEFAULT_TRACK_SLOT_VISIBLE = 3;
function trackRoleLimit(role) {
    const limit = TRACK_ROLE_LIMITS?.[role];
    return Number.isFinite(limit) ? limit : 1;
}
function roleLabel(role) {
    return ROLE_LABELS[role] || role;
}
function nowMs() {
    return typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now();
}
function logDuration(label, startTime, thresholdMs, context = "") {
    const durationMs = nowMs() - startTime;
    if (durationMs > thresholdMs) {
        const contextSuffix = context ? ` ${context}` : "";
        console.warn(`[perf] ${label} took ${durationMs.toFixed(2)}ms${contextSuffix}.`);
    }
    return durationMs;
}
function buildEmptyTrackSlotList(role) {
    return Array.from({ length: trackRoleLimit(role) }, () => null);
}
function buildDefaultTrackSlotVisibility() {
    return {
        Songwriter: Math.min(DEFAULT_TRACK_SLOT_VISIBLE, trackRoleLimit("Songwriter")),
        Performer: Math.min(DEFAULT_TRACK_SLOT_VISIBLE, trackRoleLimit("Performer")),
        Producer: Math.min(DEFAULT_TRACK_SLOT_VISIBLE, trackRoleLimit("Producer"))
    };
}
function ensureTrackSlotArrays() {
    if (!state.ui.trackSlots) {
        state.ui.trackSlots = {
            actId: null,
            songwriterIds: buildEmptyTrackSlotList("Songwriter"),
            performerIds: buildEmptyTrackSlotList("Performer"),
            producerIds: buildEmptyTrackSlotList("Producer")
        };
    }
    ["Songwriter", "Performer", "Producer"].forEach((role) => {
        const key = TRACK_ROLE_KEYS[role];
        const limit = trackRoleLimit(role);
        const current = Array.isArray(state.ui.trackSlots[key]) ? state.ui.trackSlots[key].slice(0, limit) : [];
        while (current.length < limit)
            current.push(null);
        state.ui.trackSlots[key] = current;
    });
}
function parseTrackRoleTarget(targetId) {
    const match = TRACK_ROLE_TARGET_PATTERN.exec(targetId || "");
    if (!match)
        return null;
    const role = TRACK_ROLE_MATCH[match[1]];
    if (!role)
        return null;
    const index = match[2] ? Math.max(0, Number(match[2]) - 1) : 0;
    return { role, key: TRACK_ROLE_KEYS[role], index };
}
function listFromIds(ids) {
    return Array.isArray(ids) ? ids.filter(Boolean) : [];
}
function ensureTrackSlotVisibility() {
    if (!state.ui.trackSlotVisible) {
        state.ui.trackSlotVisible = buildDefaultTrackSlotVisibility();
    }
    ["Songwriter", "Performer", "Producer"].forEach((role) => {
        const limit = trackRoleLimit(role);
        const current = Number(state.ui.trackSlotVisible[role]);
        const fallback = Math.min(DEFAULT_TRACK_SLOT_VISIBLE, limit);
        const safeCurrent = Number.isFinite(current) ? current : fallback;
        const key = TRACK_ROLE_KEYS[role];
        const assigned = listFromIds(state.ui.trackSlots?.[key]).length;
        const next = Math.max(fallback, Math.min(limit, Math.max(safeCurrent, assigned)));
        state.ui.trackSlotVisible[role] = next;
    });
}
function normalizeRoleIds(ids, role) {
    const unique = [...new Set(listFromIds(ids))];
    return unique.slice(0, trackRoleLimit(role));
}
function getTrackRoleIdsFromSlots(role) {
    ensureTrackSlotArrays();
    if (typeof state.ui.slotTarget === "string") {
        const match = TRACK_ROLE_TARGET_PATTERN.exec(state.ui.slotTarget);
        if (match && !match[2]) {
            const role = TRACK_ROLE_MATCH[match[1]];
            if (role) {
                state.ui.slotTarget = `${TRACK_ROLE_TARGETS[role]}-1`;
            }
        }
    }
    const key = TRACK_ROLE_KEYS[role];
    return listFromIds(state.ui.trackSlots[key]);
}
function getTrackRoleIds(track, role) {
    if (!track?.creators)
        return [];
    const key = TRACK_ROLE_KEYS[role];
    const ids = listFromIds(track.creators[key]);
    if (ids.length)
        return ids;
    const legacyId = role === "Songwriter"
        ? track.creators.songwriterId
        : role === "Performer"
            ? track.creators.performerId
            : track.creators.producerId;
    return legacyId ? [legacyId] : [];
}
function getCrewStageStats(stageIndex, crewCount = 1) {
    const stage = STAGES[stageIndex];
    if (!stage) {
        return { crewCount: 0, minutesPerPiece: 0, pieces: 0, hours: 0 };
    }
    const rule = TRACK_CREW_RULES[stage.role] || { stepMinutes: 0, slotsPerTier: 1, maxPieces: 1 };
    const baseHours = Math.max(1, stage.hours || 1);
    const baseMinutes = baseHours * 60;
    const cappedCount = clamp(Math.floor(crewCount || 0), 1, trackRoleLimit(stage.role));
    const tierIndex = Math.floor((cappedCount - 1) / rule.slotsPerTier);
    const withinTier = (cappedCount - 1) % rule.slotsPerTier;
    const pieces = Math.min(rule.maxPieces, tierIndex + 1);
    const minutesPerPiece = Math.max(1, baseMinutes - rule.stepMinutes * withinTier);
    const crewMultiplier = (minutesPerPiece / baseMinutes) / pieces;
    const hours = Math.max(0.05, baseHours * crewMultiplier);
    return { crewCount: cappedCount, minutesPerPiece, pieces, hours };
}
function getGameMode(modeId) {
    return GAME_MODES[modeId] || GAME_MODES[DEFAULT_GAME_MODE];
}
function listGameModes() {
    return Object.values(GAME_MODES);
}
function getGameDifficulty(difficultyId) {
    return GAME_DIFFICULTIES[difficultyId] || GAME_DIFFICULTIES[DEFAULT_GAME_DIFFICULTY];
}
function listGameDifficulties() {
    return Object.values(GAME_DIFFICULTIES);
}
function normalizeDifficultyId(difficultyId) {
    return GAME_DIFFICULTIES[difficultyId] ? difficultyId : DEFAULT_GAME_DIFFICULTY;
}
function shortGameModeLabel(label) {
    if (!label)
        return "";
    return label.replace(/\s*\(\d+\)\s*$/, "");
}
function getGameModeFromStartYear(startYear) {
    if (!Number.isFinite(startYear))
        return null;
    const modeId = startYear >= GAME_MODES.modern.startYear ? "modern" : "founding";
    return getGameMode(modeId);
}
function getSlotGameMode(data) {
    if (!data)
        return null;
    const modeId = typeof data?.meta?.gameMode === "string" ? data.meta.gameMode : null;
    if (modeId)
        return getGameMode(modeId);
    const startYear = Number.isFinite(data?.meta?.startYear)
        ? data.meta.startYear
        : Number.isFinite(data?.time?.startEpochMs)
            ? new Date(data.time.startEpochMs).getUTCFullYear()
            : Number.isFinite(data?.time?.epochMs)
                ? new Date(data.time.epochMs).getUTCFullYear()
                : null;
    return getGameModeFromStartYear(startYear);
}
function makeDefaultState() {
    const difficulty = getGameDifficulty(DEFAULT_GAME_DIFFICULTY);
    const startingCash = difficulty.startingCash;
    return {
        time: {
            epochMs: BASE_EPOCH,
            startEpochMs: BASE_EPOCH,
            totalHours: 0,
            speed: "pause",
            secPerHourPlay: 2.5,
            secPerHourFast: 1,
            acc: 0,
            lastTick: null,
            lastYear: new Date(BASE_EPOCH).getUTCFullYear()
        },
        label: {
            name: "Hann Record Label",
            alignment: "Neutral",
            cash: startingCash,
            wallet: { cash: startingCash },
            fans: 0,
            focusThemes: [],
            focusMoods: [],
            country: "Annglora"
        },
        studio: { slots: STARTING_STUDIO_SLOTS, inUse: 0 },
        creators: [],
        acts: [],
        marketCreators: [],
        ccc: { signLockoutsByCreatorId: {} },
        tracks: [],
        workOrders: [],
        releaseQueue: [],
        scheduledEvents: [],
        marketTracks: [],
        trends: [],
        trendRanking: [],
        trendAlignmentScores: {},
        trendLedger: { weeks: [] },
        genreRanking: [],
        charts: { global: [], nations: { Annglora: [], Bytenza: [], Crowlya: [] }, regions: {} },
        rivals: [],
        quests: [],
        events: [],
        resourceTickLedger: { hours: [] },
        ui: {
            activeChart: "global",
            trendScopeType: "global",
            trendScopeTarget: "Annglora",
            genreTheme: "All",
            genreMood: "All",
            slotTarget: null,
            createStage: "sheet",
            createTrackId: null,
            createTrackIds: { demo: null, master: null },
            recommendAllMode: "solo",
            createHelpOpen: false,
            createAdvancedOpen: false,
            trackPanelTab: "active",
            actSlots: { lead: null, member2: null, member3: null },
            trackSlots: {
                actId: null,
                songwriterIds: buildEmptyTrackSlotList("Songwriter"),
                performerIds: buildEmptyTrackSlotList("Performer"),
                producerIds: buildEmptyTrackSlotList("Producer")
            },
            trackSlotVisible: buildDefaultTrackSlotVisibility(),
            focusEraId: null,
            eraSlots: { actId: null },
            promoType: DEFAULT_PROMO_TYPE,
            promoTypes: [DEFAULT_PROMO_TYPE],
            promoSlots: { trackId: null },
            socialSlots: { trackId: null },
            viewContext: {
                actId: null,
                eraId: null,
                releaseId: null,
                projectId: null,
                plannedReleaseIds: [],
                selectedRolloutTemplateId: null,
                rolloutStrategyId: null
            },
            eraPlan: {
                actId: null,
                goals: "",
                themeTarget: "Any",
                moodTarget: "Any",
                cadence: "Weekly",
                scheduleNote: "",
                rolloutTemplateId: null,
                plannedReleaseIds: []
            },
            chartHistoryWeek: null,
            chartHistorySnapshot: null,
            socialShowInternal: false,
            socialFilters: {
                creator: true,
                quest: true,
                track: true,
                promo: true,
                era: true,
                economy: true,
                system: true,
                chart: true,
                contract: true,
                receipt: true,
                ccc: true
            },
            cccFilters: {
                Songwriter: true,
                Performer: true,
                Producer: true
            },
            cccThemeFilter: "All",
            cccMoodFilter: "All",
            cccSort: "default",
            studioFilters: {
                owned: true,
                unowned: true,
                occupied: true,
                unoccupied: true
            },
            studioOwnerFilter: "all",
            calendarTab: "label",
            calendarFilters: {
                labelScheduled: true,
                labelReleased: true,
                rivalScheduled: true,
                rivalReleased: true
            },
            calendarWeekIndex: null,
            sidePanelRestore: {},
            activeView: "dashboard"
        },
        era: { active: [], history: [] },
        rolloutStrategies: [],
        economy: {
            lastRevenue: 0,
            lastUpkeep: 0,
            lastWeek: 0,
            leaseFeesWeek: 0,
            creatorMarketHeat: { Songwriter: 0, Performer: 0, Producer: 0 }
        },
        lastWeekIndex: 0,
        population: { snapshot: null, lastUpdateYear: 0, lastUpdateAt: null, campaignSplit: null, campaignSplitStage: null },
        social: { posts: [] },
        promoFacilities: {
            broadcast: { bookings: [] },
            filming: { bookings: [] }
        },
        rivalReleaseQueue: [],
        meta: {
            savedAt: null,
            version: STATE_VERSION,
            annualWinners: [],
            questIdCounter: 0,
            chartHistoryLastWeek: null,
            achievements: 0,
            achievementsUnlocked: [],
            achievementsLocked: false,
            marketTrackArchive: [],
            bailoutUsed: false,
            bailoutPending: false,
            exp: 0,
            promoRuns: 0,
            cumulativeLabelPoints: {},
            difficulty: difficulty.id,
            gameMode: DEFAULT_GAME_MODE,
            startYear: getGameMode(DEFAULT_GAME_MODE).startYear,
            seedCalibration: null,
            gameOver: null,
            winState: null,
            winShown: false,
            endShown: false,
            autoSave: { enabled: false, minutes: 5, lastSavedAt: null },
            autoRollout: { enabled: false, lastCheckedAt: null, budgetPct: AUTO_PROMO_BUDGET_PCT },
            keepEraRolloutHusks: true
        }
    };
}
const state = makeDefaultState();
function getStartEpochMsFromState() {
    if (state.time && typeof state.time.startEpochMs === "number")
        return state.time.startEpochMs;
    const totalHours = typeof state.time?.totalHours === "number" ? state.time.totalHours : 0;
    const epoch = typeof state.time?.epochMs === "number" ? state.time.epochMs : BASE_EPOCH;
    return epoch - totalHours * HOUR_MS;
}
function applyGameMode(modeId) {
    const mode = getGameMode(modeId);
    const startEpochMs = Date.UTC(mode.startYear, 0, 1, 0, 0, 0);
    state.time.epochMs = startEpochMs;
    state.time.startEpochMs = startEpochMs;
    state.time.totalHours = 0;
    state.time.lastYear = mode.startYear;
    if (!state.meta)
        state.meta = {};
    state.meta.gameMode = mode.id;
    state.meta.startYear = mode.startYear;
    return mode;
}
function applyDifficulty(difficultyId, { resetCash = false } = {}) {
    const difficulty = getGameDifficulty(difficultyId);
    if (!state.meta)
        state.meta = {};
    state.meta.difficulty = difficulty.id;
    if (resetCash && state.label) {
        state.label.cash = difficulty.startingCash;
        if (!state.label.wallet)
            state.label.wallet = { cash: state.label.cash };
        state.label.wallet.cash = state.label.cash;
    }
    return difficulty;
}
function loadSeedCalibration() {
    if (typeof localStorage === "undefined")
        return null;
    const raw = localStorage.getItem(SEED_CALIBRATION_KEY);
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
function saveSeedCalibration(calibration) {
    if (!calibration || typeof localStorage === "undefined")
        return;
    localStorage.setItem(SEED_CALIBRATION_KEY, JSON.stringify(calibration));
}
function populationBoundsForYear(prevPop, year, floor) {
    let min = floor;
    let max = POPULATION_CAP;
    if (year >= 3000) {
        const band = POPULATION_POST3000_BAND;
        min = Math.max(min, Math.round(prevPop * (1 - band)));
        max = Math.min(max, Math.round(prevPop * (1 + band)));
    }
    return { min, max };
}
function populationRateForCadence(year, tier, cadenceYears) {
    if (!cadenceYears || cadenceYears <= 1)
        return yearlyPopulationRate(year, tier);
    const offset = year - POPULATION_START_YEAR;
    if (offset % cadenceYears !== 0)
        return 0;
    return yearlyPopulationRate(year, tier);
}
function applyPopulationYear(pop, year, cadenceYears, altRateFn) {
    const tier = pop >= POPULATION_TIER_2 ? 3 : pop >= POPULATION_TIER_1 ? 2 : 1;
    const rate = typeof altRateFn === "function"
        ? altRateFn(year, tier)
        : populationRateForCadence(year, tier, cadenceYears);
    const next = Math.round(pop * (1 + rate));
    let floor = POPULATION_START;
    if (next >= POPULATION_TIER_1)
        floor = Math.max(floor, POPULATION_TIER_1);
    if (next >= POPULATION_TIER_2)
        floor = Math.max(floor, POPULATION_TIER_2);
    const bounds = populationBoundsForYear(pop, year, floor);
    const clamped = clamp(next, bounds.min, bounds.max);
    return { next: clamped, violated: next < bounds.min || next > bounds.max };
}
// Simple balance / A-B test helper: compare baseline yearly population progression
function runPopulationABTest({ startYear = POPULATION_START_YEAR, endYear = POPULATION_START_YEAR + 50, altRateFn = null, altCadenceYears = 4, runs = 1 } = {}) {
    // runs: number of stochastic runs to average
    const baseline = [];
    const alt = [];
    let baseViolations = 0;
    let altViolations = 0;
    for (let r = 0; r < runs; r += 1) {
        let popBase = POPULATION_START;
        let popAlt = POPULATION_START;
        for (let y = startYear + 1; y <= endYear; y += 1) {
            const baseStep = applyPopulationYear(popBase, y, 1, null);
            popBase = baseStep.next;
            if (baseStep.violated)
                baseViolations += 1;
            const altStep = applyPopulationYear(popAlt, y, altCadenceYears, altRateFn);
            popAlt = altStep.next;
            if (altStep.violated)
                altViolations += 1;
        }
        baseline.push(popBase);
        alt.push(popAlt);
    }
    const avg = (arr) => Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
    const baseAvg = avg(baseline);
    const altAvg = avg(alt);
    const summary = `yearly ${formatCount(baseAvg)} vs ${altCadenceYears}-year ${formatCount(altAvg)} over ${endYear - startYear} years`;
    logEvent(`Balance A/B: ${summary}.`);
    return { baseAvg, altAvg, baseline, alt, summary, baseViolations, altViolations };
}
let idCounter = 0;
const $ = (id) => document.getElementById(id);
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
function openOverlay(id) {
    const el = $(id);
    if (!el)
        return;
    el.style.display = "flex";
    el.setAttribute("aria-hidden", "false");
}
function closeOverlay(id) {
    const el = $(id);
    if (!el)
        return;
    el.style.display = "none";
    el.setAttribute("aria-hidden", "true");
}
function showEndScreen(title, lines) {
    const titleEl = $("endTitle");
    const listEl = $("endMessage");
    if (!titleEl || !listEl)
        return;
    titleEl.textContent = title;
    listEl.innerHTML = lines.map((line) => `
    <div class="list-item">
      <div class="item-title">${line.title}</div>
      ${line.detail ? `<div class="muted">${line.detail}</div>` : ""}
    </div>
  `).join("");
    openOverlay("endModal");
}
function uid(prefix) {
    idCounter += 1;
    return `${prefix}${idCounter}`;
}
function pickOne(list) {
    return list[rand(0, list.length - 1)];
}
function pickDistinct(list, count) {
    const copy = list.slice();
    const out = [];
    while (out.length < count && copy.length) {
        out.push(copy.splice(rand(0, copy.length - 1), 1)[0]);
    }
    return out;
}
function clampSkill(value) {
    return clamp(Math.round(value), SKILL_MIN, SKILL_MAX);
}
function clampQuality(value) {
    return clamp(Math.round(value), QUALITY_MIN, QUALITY_MAX);
}
function clampStamina(value) {
    return clamp(Math.round(value), 0, STAMINA_MAX);
}
function staminaRatio(creator) {
    if (!creator)
        return 0;
    const stamina = clampStamina(creator.stamina ?? 0);
    return STAMINA_MAX ? clamp(stamina / STAMINA_MAX, 0, 1) : 0;
}
function skillWithStamina(creator) {
    const ratio = staminaRatio(creator);
    const factor = 0.7 + 0.3 * ratio;
    return (creator?.skill ?? 0) * factor;
}
function averageSkill(list, { staminaAdjusted = false } = {}) {
    if (!list.length)
        return 0;
    const sum = list.reduce((total, creator) => (total + (staminaAdjusted ? skillWithStamina(creator) : (creator?.skill ?? 0))), 0);
    return sum / list.length;
}
function getCreatorStaminaSpentToday(creator) {
    if (!creator)
        return 0;
    if (typeof creator.staminaSpentToday === "number")
        return creator.staminaSpentToday;
    return creator.staminaUsedToday || 0;
}
function setCreatorStaminaSpentToday(creator, value) {
    if (!creator)
        return 0;
    const next = Math.max(0, Math.round(value || 0));
    creator.staminaSpentToday = next;
    creator.staminaUsedToday = next;
    return next;
}
function resetCreatorDailyUsage(creator, dayIndex) {
    if (!creator)
        return;
    creator.lastUsageDay = dayIndex;
    creator.lastOveruseDay = null;
    setCreatorStaminaSpentToday(creator, 0);
}
const DAY_MS = HOUR_MS * 24;
const WEEK_MS = DAY_MS * 7;
const YEAR_MS = DAY_MS * 365;
const CREATOR_INACTIVITY_MS = YEAR_MS * 2;
const CREATOR_SKILL_GAIN_BY_STAGE = [0.15, 0.25, 0.4];
const CREATOR_SKILL_DECAY_GRACE_WEEKS = 6;
const CREATOR_SKILL_DECAY_STEP_WEEKS = 2;
const CREATOR_MARKET_HEAT_MAX = 10;
const CREATOR_MARKET_HEAT_DECAY = 0.85;
const CREATOR_MARKET_HEAT_STEP = 1;
const STAGE_COST_CREW_STEP = 0.1;
const STAGE_COST_SKILL_MIN = 0.85;
const STAGE_COST_SKILL_MAX = 1.45;
const MARKET_MIN_PER_ROLE = 10;
const RIVAL_MIN_PER_ROLE = 10;
const MARKET_ROLES = ["Songwriter", "Performer", "Producer"];
const CREATOR_ROSTER_CAP = 125;
const STUDIO_CAP_PER_LABEL = 50;
const ACHIEVEMENT_TARGET = 12;
function currentYear() {
    return new Date(state.time.epochMs).getUTCFullYear();
}
function releasedTracks() {
    return state.tracks.filter((track) => track.status === "Released");
}
function releasedProjectCount() {
    const projects = new Set();
    releasedTracks().forEach((track) => {
        const name = track.projectName || `${track.title} - Single`;
        if (name)
            projects.add(name);
    });
    return projects.size;
}
function averageReleasedQuality(minCount) {
    const released = releasedTracks();
    if (released.length < minCount)
        return 0;
    const sum = released.reduce((total, track) => total + track.quality, 0);
    return sum / released.length;
}
function playerHasGlobalRank(maxRank) {
    return (state.charts.global || []).some((entry) => entry.track.isPlayer && entry.rank <= maxRank);
}
function playerHasNationRank(maxRank) {
    return NATIONS.some((nation) => (state.charts.nations[nation] || []).some((entry) => entry.track.isPlayer && entry.rank <= maxRank));
}
function playerHasRegionRank(maxRank) {
    return REGION_DEFS.some((region) => (state.charts.regions[region.id] || []).some((entry) => entry.track.isPlayer && entry.rank <= maxRank));
}
const ACHIEVEMENTS = [
    {
        id: "REQ-01",
        label: "Global No.1",
        desc: "Land a track at #1 on the Global chart.",
        exp: 2200,
        target: 1,
        check: () => playerHasGlobalRank(1),
        progress: () => {
            const ranks = (state.charts.global || []).filter((entry) => entry.track.isPlayer).map((entry) => entry.rank);
            return ranks.length ? Math.min(...ranks) : null;
        }
    },
    {
        id: "REQ-02",
        label: "National Top 3",
        desc: "Reach Top 3 on any national chart.",
        exp: 1600,
        target: 3,
        check: () => playerHasNationRank(3),
        progress: () => {
            const ranks = [];
            NATIONS.forEach((nation) => {
                (state.charts.nations[nation] || []).forEach((entry) => {
                    if (entry.track.isPlayer)
                        ranks.push(entry.rank);
                });
            });
            return ranks.length ? Math.min(...ranks) : null;
        }
    },
    {
        id: "REQ-03",
        label: "Regional Top 5",
        desc: "Reach Top 5 on any regional chart.",
        exp: 1400,
        target: 5,
        check: () => playerHasRegionRank(5),
        progress: () => {
            const ranks = [];
            REGION_DEFS.forEach((region) => {
                (state.charts.regions[region.id] || []).forEach((entry) => {
                    if (entry.track.isPlayer)
                        ranks.push(entry.rank);
                });
            });
            return ranks.length ? Math.min(...ranks) : null;
        }
    },
    {
        id: "REQ-04",
        label: "Quality Gold",
        desc: "Release a track with 90+ quality.",
        exp: 1700,
        target: 90,
        check: () => releasedTracks().some((track) => track.quality >= 90),
        progress: () => {
            const released = releasedTracks().map((track) => track.quality);
            return released.length ? Math.max(...released) : 0;
        }
    },
    {
        id: "REQ-05",
        label: "Catalog Depth",
        desc: "Release 12 tracks.",
        exp: 2000,
        target: 12,
        check: () => releasedTracks().length >= 12,
        progress: () => releasedTracks().length
    },
    {
        id: "REQ-06",
        label: "Era Complete",
        desc: "Complete one full Era cycle.",
        exp: 1500,
        target: 1,
        check: () => state.era.history.length >= 1,
        progress: () => state.era.history.length
    },
    {
        id: "REQ-07",
        label: "Trend Rider",
        desc: "Release a track that matched a live trend.",
        exp: 1500,
        target: 1,
        check: () => releasedTracks().some((track) => track.trendAtRelease),
        progress: () => releasedTracks().filter((track) => track.trendAtRelease).length
    },
    {
        id: "REQ-08",
        label: "Audience Reach",
        desc: "Capture at least 4% of Gaia's population.",
        exp: 1800,
        target: 4,
        check: () => {
            const snapshot = computePopulationSnapshot();
            return snapshot.total > 0 && state.label.fans >= snapshot.total * 0.04;
        },
        progress: () => {
            const snapshot = computePopulationSnapshot();
            return snapshot.total ? (state.label.fans / snapshot.total) * 100 : 0;
        }
    },
    {
        id: "REQ-09",
        label: "Roster Builder",
        desc: "Sign at least 8 creators.",
        exp: 1500,
        target: 8,
        check: () => state.creators.length >= 8,
        progress: () => state.creators.length
    },
    {
        id: "REQ-10",
        label: "Project Variety",
        desc: "Release tracks across 4 different projects.",
        exp: 1600,
        target: 4,
        check: () => releasedProjectCount() >= 4,
        progress: () => releasedProjectCount()
    },
    {
        id: "REQ-11",
        label: "Profit Week",
        desc: "Hit a weekly net of $40,000 or more.",
        exp: 1800,
        target: 40000,
        check: () => state.economy.lastRevenue - state.economy.lastUpkeep >= 40000,
        progress: () => state.economy.lastRevenue - state.economy.lastUpkeep
    },
    {
        id: "REQ-12",
        label: "Promo Push",
        desc: "Run 5 promo pushes.",
        exp: 1500,
        target: 5,
        check: () => state.meta.promoRuns >= 5,
        progress: () => state.meta.promoRuns
    }
];
function awardExp(amount, note, silent = false) {
    const value = Math.max(0, Math.round(amount || 0));
    if (!value)
        return;
    state.meta.exp = Math.max(0, state.meta.exp + value);
    if (note && !silent) {
        logEvent(`${note} (+${value} EXP).`);
    }
}
function unlockAchievement(definition) {
    if (state.meta.achievementsLocked)
        return;
    if (state.meta.achievementsUnlocked.includes(definition.id))
        return;
    state.meta.achievementsUnlocked.push(definition.id);
    state.meta.achievements = state.meta.achievementsUnlocked.length;
    awardExp(definition.exp, `Achievement unlocked: ${definition.label}`);
}
function evaluateAchievements() {
    if (state.meta.achievementsLocked)
        return;
    ACHIEVEMENTS.forEach((definition) => {
        if (definition.check())
            unlockAchievement(definition);
    });
    state.meta.achievements = state.meta.achievementsUnlocked.length;
}
function pickUniqueName(list, existingNames, suffix) {
    const existing = new Set(existingNames.filter(Boolean));
    const available = list.filter((name) => !existing.has(name));
    if (available.length)
        return pickOne(available);
    return `${pickOne(list)} ${suffix || "II"}`;
}
function seededPickUniqueName(list, existingNames, suffix, rng) {
    const existing = new Set(existingNames.filter(Boolean));
    const available = list.filter((name) => !existing.has(name));
    if (available.length)
        return seededPick(available, rng);
    return `${seededPick(list, rng)} ${suffix || "II"}`;
}
function buildCreatorName(country, existingNames) {
    const parts = CREATOR_NAME_PARTS[country] || CREATOR_NAME_PARTS.Annglora;
    const existing = new Set(existingNames.filter(Boolean));
    for (let i = 0; i < 24; i += 1) {
        const given = pickOne(parts.given);
        const surname = pickOne(parts.surname);
        const name = country === "Bytenza" ? `${surname} ${given}` : `${given} ${surname}`;
        if (!existing.has(name))
            return name;
    }
    const fallback = `${pickOne(parts.given)} ${pickOne(parts.surname)}`;
    return existing.has(fallback) ? `${fallback} II` : fallback;
}
function buildCompositeName(prefixes, suffixes, existingNames, fallbackList, suffix) {
    const existing = new Set(existingNames.filter(Boolean));
    for (let i = 0; i < 24; i += 1) {
        const name = `${pickOne(prefixes)} ${pickOne(suffixes)}`.replace(/\s+/g, " ").trim();
        if (!existing.has(name))
            return name;
    }
    return pickUniqueName(fallbackList, existingNames, suffix);
}
function buildCompositeNameSeeded(prefixes, suffixes, existingNames, fallbackList, suffix, rng) {
    const existing = new Set(existingNames.filter(Boolean));
    for (let i = 0; i < 24; i += 1) {
        const name = `${seededPick(prefixes, rng)} ${seededPick(suffixes, rng)}`.replace(/\s+/g, " ").trim();
        if (!existing.has(name))
            return name;
    }
    return seededPickUniqueName(fallbackList, existingNames, suffix, rng);
}
function fillTemplate(template, tokens) {
    return template
        .replace("{verb}", tokens.verb)
        .replace("{noun}", tokens.noun)
        .replace("{prefix}", tokens.prefix)
        .replace("{suffix}", tokens.suffix)
        .replace("{act}", tokens.act)
        .replace(/\s+/g, " ")
        .trim();
}
function makeGenre(theme, mood) {
    if (!theme || !mood)
        return "";
    return `${theme} / ${mood}`;
}
function formatGenreLabel(theme, mood) {
    if (!theme || !mood)
        return "-";
    return `${theme.toLowerCase()} but it's ${mood.toLowerCase()}`;
}
function formatGenreKeyLabel(genre) {
    if (!genre)
        return "-";
    const parts = genre.split(" / ");
    if (parts.length !== 2)
        return genre;
    return formatGenreLabel(parts[0], parts[1]);
}
function themeFromGenre(genre) {
    if (!genre)
        return "";
    return genre.split(" / ")[0];
}
function moodFromGenre(genre) {
    if (!genre)
        return "";
    return genre.split(" / ")[1];
}
function themeColor(theme) {
    return THEME_COLORS[theme] || "var(--accent)";
}
function countryColor(country) {
    return COUNTRY_COLORS[country] || "var(--accent)";
}
const ACCESSIBLE_TEXT = { dark: "#0b0f14", light: "#ffffff" };
function resolveCssColor(value) {
    const raw = String(value || "").trim();
    if (!raw || !raw.startsWith("var("))
        return raw;
    const match = raw.match(/var\((--[^)]+)\)/);
    if (!match || typeof document === "undefined")
        return raw;
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim();
    return resolved || raw;
}
function parseColorToRgb(value) {
    const color = resolveCssColor(value);
    if (!color)
        return null;
    if (color.startsWith("#")) {
        let hex = color.slice(1).trim();
        if (hex.length === 3) {
            hex = hex.split("").map((ch) => ch + ch).join("");
        }
        if (hex.length === 8)
            hex = hex.slice(0, 6);
        if (hex.length !== 6)
            return null;
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return { r, g, b };
    }
    const rgbMatch = color.match(/^rgba?\(([^)]+)\)$/);
    if (!rgbMatch)
        return null;
    const parts = rgbMatch[1].split(",").map((part) => Number.parseFloat(part.trim()));
    if (parts.length < 3 || parts.some((part) => Number.isNaN(part)))
        return null;
    return { r: parts[0], g: parts[1], b: parts[2] };
}
function relativeLuminance(rgb) {
    const toLinear = (value) => {
        const channel = value / 255;
        return channel <= 0.03928
            ? channel / 12.92
            : Math.pow((channel + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);
}
function contrastRatio(a, b) {
    const lighter = Math.max(a, b);
    const darker = Math.min(a, b);
    return (lighter + 0.05) / (darker + 0.05);
}
function pickAccessibleTextColor(bgColor) {
    const bg = parseColorToRgb(bgColor);
    const dark = parseColorToRgb(ACCESSIBLE_TEXT.dark);
    const light = parseColorToRgb(ACCESSIBLE_TEXT.light);
    if (!bg || !dark || !light)
        return ACCESSIBLE_TEXT.dark;
    const bgLum = relativeLuminance(bg);
    const darkContrast = contrastRatio(bgLum, relativeLuminance(dark));
    const lightContrast = contrastRatio(bgLum, relativeLuminance(light));
    return lightContrast >= darkContrast ? ACCESSIBLE_TEXT.light : ACCESSIBLE_TEXT.dark;
}
function countryDemonym(country) {
    if (!country)
        return "Unknown";
    return COUNTRY_DEMONYMS[country] || country;
}
function alignmentClass(alignment) {
    return alignment ? alignment.toLowerCase() : "neutral";
}
function slugify(text) {
    return String(text || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
}
function getModifier(id) {
    return MODIFIERS.find((mod) => mod.id === id) || MODIFIERS[0];
}
function resolveModifier(modifier) {
    if (!modifier)
        return null;
    if (typeof modifier === "string")
        return getModifier(modifier);
    if (modifier && typeof modifier === "object") {
        if (modifier.id) {
            const resolved = MODIFIERS.find((mod) => mod.id === modifier.id);
            return resolved || modifier;
        }
        if (typeof modifier.hoursDelta === "number")
            return modifier;
    }
    return null;
}
function getAdjustedStageHours(stageIndex, modifier, crewCount = 1) {
    const stage = STAGES[stageIndex];
    if (!stage)
        return 0;
    const baseHours = getCrewStageStats(stageIndex, crewCount).hours;
    const resolved = resolveModifier(modifier);
    const hoursDelta = resolved?.hoursDelta || 0;
    return Math.max(0.05, baseHours + hoursDelta);
}
function getAdjustedTotalStageHours(modifier, crewCounts = {}) {
    return STAGES.reduce((sum, stage, index) => {
        const count = crewCounts[stage.role]
            || crewCounts[index]
            || 1;
        return sum + getAdjustedStageHours(index, modifier, count);
    }, 0);
}
function renderAlignmentTag(alignment) {
    const cls = alignmentClass(alignment);
    return `<span class="tag ${cls}"><span class="tag-dot"></span>${alignment}</span>`;
}
function renderThemeTag(theme) {
    const cls = `theme-${slugify(theme)}`;
    return `<span class="tag ${cls}"><span class="tag-dot"></span>${theme}</span>`;
}
function renderCountryTag(country) {
    const cls = `country-${slugify(country)}`;
    return `<span class="tag ${cls}"><span class="tag-dot"></span>${country}</span>`;
}
function renderNationalityPill(country) {
    const color = countryColor(country);
    const textColor = pickAccessibleTextColor(color);
    const demonym = countryDemonym(country);
    return `<span class="pill country-pill" style="color:${textColor}; border-color:${color}; background:${color};">${demonym}</span>`;
}
function renderLabelTag(label, country) {
    const color = countryColor(country);
    const textColor = country === "Bytenza" ? "#f4f1ea" : "#0b0f14";
    return `<span class="tag" style="color:${textColor}; border-color:${color}; background:${color};"><span class="tag-dot" style="background:${textColor};"></span>${label}</span>`;
}
const MOOD_EMOJIS = {
    Cheering: "🌞",
    Saddening: "💧",
    Angering: "💢",
    Energizing: "⚡",
    Calming: "🕊️",
    Thrilling: "🔥",
    Uplifting: "⬆️",
    Boring: "▫",
    Daring: "❓"
};
function renderMoodTag(mood) {
    const emoji = MOOD_EMOJIS[mood] || "❓";
    return `<span class="tag mood"><span class="mood-emoji">${emoji}</span>${mood}</span>`;
}
function renderMoodLabel(mood) {
    const emoji = MOOD_EMOJIS[mood] || "❓";
    return `<span class="tag mood">${mood} <span class="mood-emoji">${emoji}</span></span>`;
}
function staminaRequirement(role) {
    const stage = STAGES.find((entry) => entry.role === role);
    return stage ? stage.stamina : 0;
}
function getSlotElement(targetId) {
    return document.querySelector(`[data-slot-target="${targetId}"]`);
}
function shakeElement(el) {
    if (!el)
        return;
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
    window.setTimeout(() => {
        el.classList.remove("shake");
    }, 320);
}
function shakeSlot(targetId) {
    shakeElement(getSlotElement(targetId));
}
function shakeField(fieldId) {
    const el = $(fieldId);
    if (!el)
        return;
    const field = el.closest(".field") || el;
    shakeElement(field);
}
function describeSlot(targetId) {
    const slot = getSlotElement(targetId);
    if (!slot)
        return targetId || "-";
    const label = slot.querySelector(".slot-label");
    return label ? label.textContent : targetId;
}
function commitSlotChange({ updateStats = false } = {}) {
    renderSlots();
    if (updateStats)
        renderStats();
    if (typeof window !== "undefined" && window.updateRecommendations) {
        window.updateRecommendations();
    }
    saveToActiveSlot();
}
function ejectLowStaminaTrackSlots() {
    ensureTrackSlotArrays();
    const cleared = [];
    ["Songwriter", "Performer", "Producer"].forEach((role) => {
        const key = TRACK_ROLE_KEYS[role];
        const req = staminaRequirement(role);
        const list = state.ui.trackSlots[key] || [];
        list.forEach((id, index) => {
            if (!id)
                return;
            const creator = getCreator(id);
            if (!creator || creator.stamina >= req)
                return;
            list[index] = null;
            cleared.push({ role, creator });
        });
    });
    if (!cleared.length)
        return;
    const names = [...new Set(cleared.map((entry) => entry.creator?.name).filter(Boolean))];
    if (names.length) {
        logEvent(`Removed low-stamina creators from track slots: ${names.join(", ")}.`, "warn");
    }
    commitSlotChange();
}
function setSlotTarget(targetId) {
    state.ui.slotTarget = targetId;
    commitSlotChange({ updateStats: true });
}
function getSlotValue(targetId) {
    if (targetId === "act-lead")
        return state.ui.actSlots.lead;
    if (targetId === "act-member2")
        return state.ui.actSlots.member2;
    if (targetId === "act-member3")
        return state.ui.actSlots.member3;
    if (targetId === "track-act")
        return state.ui.trackSlots.actId;
    if (targetId === "era-act")
        return state.ui.eraSlots.actId;
    if (targetId === "promo-track")
        return state.ui.promoSlots.trackId;
    if (targetId === "social-track")
        return state.ui.socialSlots.trackId;
    const trackRole = parseTrackRoleTarget(targetId);
    if (trackRole) {
        ensureTrackSlotArrays();
        const list = state.ui.trackSlots[trackRole.key] || [];
        return list[trackRole.index] || null;
    }
    return null;
}
function setSlotValue(targetId, value) {
    if (targetId === "act-lead")
        state.ui.actSlots.lead = value;
    if (targetId === "act-member2")
        state.ui.actSlots.member2 = value;
    if (targetId === "act-member3")
        state.ui.actSlots.member3 = value;
    if (targetId === "track-act")
        state.ui.trackSlots.actId = value;
    if (targetId === "era-act")
        state.ui.eraSlots.actId = value;
    if (targetId === "promo-track")
        state.ui.promoSlots.trackId = value;
    if (targetId === "social-track")
        state.ui.socialSlots.trackId = value;
    const trackRole = parseTrackRoleTarget(targetId);
    if (trackRole) {
        ensureTrackSlotArrays();
        const list = state.ui.trackSlots[trackRole.key] || [];
        if (trackRole.index >= list.length)
            return;
        if (value) {
            const dupIndex = list.findIndex((id) => id === value);
            if (dupIndex !== -1 && dupIndex !== trackRole.index)
                list[dupIndex] = null;
        }
        list[trackRole.index] = value || null;
    }
}
function assignToSlot(targetId, entityType, entityId) {
    const slot = getSlotElement(targetId);
    if (!slot)
        return;
    if (slot.classList.contains("disabled")) {
        shakeSlot(targetId);
        logEvent("This slot is disabled for Solo Acts.", "warn");
        return;
    }
    const expectedType = slot.dataset.slotType;
    if (expectedType !== entityType) {
        shakeSlot(targetId);
        logEvent(`Slot expects ${expectedType} ID.`, "warn");
        return;
    }
    if (entityType === "creator") {
        const creator = getCreator(entityId);
        if (!creator) {
            shakeSlot(targetId);
            logEvent("Creator not found.", "warn");
            return;
        }
        const role = slot.dataset.slotRole;
        if (role && creator.role !== role) {
            shakeSlot(targetId);
            logEvent(`${creator.name} is not a ${roleLabel(role)}.`, "warn");
            return;
        }
        const trackRole = parseTrackRoleTarget(targetId);
        if (trackRole) {
            const req = staminaRequirement(trackRole.role);
            if (creator.stamina < req) {
                shakeSlot(targetId);
                logEvent(`${creator.name} needs ${req} stamina for ${roleLabel(trackRole.role)} slots.`, "warn");
                return;
            }
        }
    }
    if (entityType === "track" && targetId === "promo-track") {
        const track = getTrack(entityId);
        if (!track || track.status !== "Released") {
            shakeSlot(targetId);
            logEvent("Promo slot requires a released Track ID.", "warn");
            return;
        }
        const era = track.eraId ? getEraById(track.eraId) : null;
        if (!era || era.status !== "Active") {
            shakeSlot(targetId);
            logEvent("Promo slot requires a track from an active era.", "warn");
            return;
        }
    }
    setSlotValue(targetId, entityId);
    commitSlotChange();
}
function clearSlot(targetId) {
    setSlotValue(targetId, null);
    commitSlotChange();
}
function ensureTrackSlotGrid() {
    const grid = $("trackSlotGrid");
    if (!grid || grid.dataset.built === "true")
        return;
    grid.dataset.built = "true";
    grid.innerHTML = "";
    const roles = [
        { role: "Songwriter", target: TRACK_ROLE_TARGETS.Songwriter },
        { role: "Performer", target: TRACK_ROLE_TARGETS.Performer },
        { role: "Producer", target: TRACK_ROLE_TARGETS.Producer }
    ];
    roles.forEach((entry) => {
        const limit = trackRoleLimit(entry.role);
        const group = document.createElement("div");
        group.className = "slot-role-group";
        group.dataset.slotRoleGroup = entry.role;
        const head = document.createElement("div");
        head.className = "slot-group-head";
        const header = document.createElement("div");
        header.className = "slot-group-label";
        header.dataset.slotGroupLabel = entry.role;
        header.textContent = `${roleLabel(entry.role)} Slots (0/${limit})`;
        const actions = document.createElement("div");
        actions.className = "slot-group-actions";
        actions.innerHTML = `
      <button type="button" class="ghost mini" data-slot-more="${entry.role}">Add Slot</button>
      <button type="button" class="ghost mini" data-slot-less="${entry.role}">Show Less</button>
    `;
        head.appendChild(header);
        head.appendChild(actions);
        group.appendChild(head);
        const slotGrid = document.createElement("div");
        slotGrid.className = "slot-role-grid";
        slotGrid.dataset.slotRoleGrid = entry.role;
        group.appendChild(slotGrid);
        const columns = Math.max(1, Math.ceil(limit / STUDIO_COLUMN_SLOT_COUNT));
        // Studio columns render five slots each to mirror studio capacity.
        for (let col = 0; col < columns; col += 1) {
            const columnLabel = document.createElement("div");
            columnLabel.className = "slot-column-label";
            columnLabel.dataset.slotColumnLabel = `${entry.role}-${col + 1}`;
            columnLabel.dataset.slotRole = entry.role;
            columnLabel.dataset.slotColumnStart = String(col * STUDIO_COLUMN_SLOT_COUNT + 1);
            columnLabel.textContent = `Studio ${col + 1}`;
            slotGrid.appendChild(columnLabel);
            for (let row = 0; row < STUDIO_COLUMN_SLOT_COUNT; row += 1) {
                const index = col * STUDIO_COLUMN_SLOT_COUNT + row + 1;
                if (index > limit)
                    break;
                const slot = document.createElement("div");
                slot.className = "id-slot";
                slot.dataset.slotTarget = `${entry.target}-${index}`;
                slot.dataset.slotType = "creator";
                slot.dataset.slotRole = entry.role;
                slot.dataset.slotGroup = "track";
                slot.dataset.slotIndex = String(index);
                const label = `${roleLabel(entry.role)} Slot`;
                slot.innerHTML = `
          <div class="slot-label">${label} ${index}</div>
          <div class="slot-id">
            <div class="slot-avatar" aria-hidden="true"></div>
            <div class="slot-value">${UNASSIGNED_CREATOR_LABEL}</div>
          </div>
          <div class="slot-actions">
            <button type="button" class="ghost mini" data-slot-recommend="${entry.target}-${index}">Recommend</button>
            <button type="button" class="ghost mini" data-slot-clear="${entry.target}-${index}">Clear</button>
          </div>
        `;
                slotGrid.appendChild(slot);
            }
        }
        grid.appendChild(group);
    });
}
function applyTrackSlotVisibility() {
    const grid = $("trackSlotGrid");
    if (!grid)
        return;
    ensureTrackSlotVisibility();
    ["Songwriter", "Performer", "Producer"].forEach((role) => {
        const limit = trackRoleLimit(role);
        const key = TRACK_ROLE_KEYS[role];
        const assigned = listFromIds(state.ui.trackSlots?.[key]).length;
        const fallback = Math.min(DEFAULT_TRACK_SLOT_VISIBLE, limit);
        const current = Number(state.ui.trackSlotVisible?.[role]);
        const desired = Number.isFinite(current) ? current : fallback;
        const visibleCount = Math.max(fallback, Math.min(limit, Math.max(desired, assigned)));
        state.ui.trackSlotVisible[role] = visibleCount;
        const label = grid.querySelector(`[data-slot-group-label="${role}"]`);
        if (label)
            label.textContent = `${roleLabel(role)} Slots (${assigned}/${limit})`;
        grid.querySelectorAll(`.id-slot[data-slot-role="${role}"]`).forEach((slot) => {
            const index = Number(slot.dataset.slotIndex || "0");
            slot.classList.toggle("hidden", index > visibleCount);
        });
        grid.querySelectorAll(`.slot-column-label[data-slot-role="${role}"]`).forEach((column) => {
            const start = Number(column.dataset.slotColumnStart || "0");
            column.classList.toggle("hidden", start > visibleCount);
        });
        const moreBtn = grid.querySelector(`[data-slot-more="${role}"]`);
        if (moreBtn)
            moreBtn.disabled = visibleCount >= limit;
        const lessBtn = grid.querySelector(`[data-slot-less="${role}"]`);
        if (lessBtn)
            lessBtn.disabled = visibleCount <= Math.max(fallback, assigned);
    });
}
function renderSlots() {
    ensureTrackSlotGrid();
    ensureTrackSlotArrays();
    applyTrackSlotVisibility();
    const activeTarget = state.ui.slotTarget;
    document.querySelectorAll(".id-slot").forEach((slot) => {
        const target = slot.dataset.slotTarget;
        slot.classList.toggle("active", target === activeTarget);
    });
    const actLead = getCreator(state.ui.actSlots.lead);
    const actMember2 = getCreator(state.ui.actSlots.member2);
    const actMember3 = getCreator(state.ui.actSlots.member3);
    const trackAct = getAct(state.ui.trackSlots.actId);
    const eraAct = getAct(state.ui.eraSlots.actId);
    const promoTrack = state.marketTracks.find((entry) => entry.trackId === state.ui.promoSlots.trackId)
        || getTrack(state.ui.promoSlots.trackId);
    const socialTrack = getTrack(state.ui.socialSlots.trackId);
    const unassignedLabel = UNASSIGNED_SLOT_LABEL;
    const unassignedCreatorLabel = UNASSIGNED_CREATOR_LABEL;
    if ($("actLeadSlot"))
        $("actLeadSlot").textContent = actLead ? actLead.name : unassignedCreatorLabel;
    if ($("actMember2Slot"))
        $("actMember2Slot").textContent = actMember2 ? actMember2.name : unassignedCreatorLabel;
    if ($("actMember3Slot"))
        $("actMember3Slot").textContent = actMember3 ? actMember3.name : unassignedCreatorLabel;
    if ($("trackActSlot"))
        $("trackActSlot").textContent = trackAct ? trackAct.name : unassignedLabel;
    if ($("eraActSlot"))
        $("eraActSlot").textContent = eraAct ? eraAct.name : unassignedLabel;
    if ($("promoTrackSlot"))
        $("promoTrackSlot").textContent = promoTrack ? promoTrack.title : unassignedLabel;
    if ($("socialTrackSlot"))
        $("socialTrackSlot").textContent = socialTrack ? socialTrack.title : unassignedLabel;
    document.querySelectorAll(".id-slot").forEach((slot) => {
        const target = slot.dataset.slotTarget;
        const type = slot.dataset.slotType;
        const value = getSlotValue(target);
        const valueEl = slot.querySelector(".slot-value");
        const avatarEl = slot.querySelector(".slot-avatar");
        if (!valueEl)
            return;
        if (type === "creator") {
            const creator = value ? getCreator(value) : null;
            valueEl.textContent = creator ? creator.name : unassignedCreatorLabel;
            if (avatarEl) {
                const portraitUrl = creator ? getCreatorPortraitUrl(creator) : null;
                const hasImage = Boolean(portraitUrl);
                avatarEl.classList.toggle("has-image", hasImage);
                avatarEl.classList.toggle("is-empty", !creator);
                avatarEl.classList.toggle("has-symbols", !hasImage);
                if (hasImage) {
                    avatarEl.style.backgroundImage = `url("${safeAvatarUrl(portraitUrl)}")`;
                    avatarEl.textContent = "";
                }
                else {
                    avatarEl.style.backgroundImage = "";
                    avatarEl.innerHTML = renderCreatorFallbackSymbols({ unassigned: !creator });
                }
            }
        }
        else if (type === "act") {
            const act = value ? getAct(value) : null;
            valueEl.textContent = act ? act.name : unassignedLabel;
            if (avatarEl) {
                avatarEl.classList.remove("has-image");
                avatarEl.classList.remove("is-empty");
                avatarEl.style.backgroundImage = "";
                avatarEl.textContent = "";
            }
        }
        else if (type === "track") {
            const track = value ? getTrack(value) : null;
            valueEl.textContent = track ? track.title : unassignedLabel;
            if (avatarEl) {
                avatarEl.classList.remove("has-image");
                avatarEl.classList.remove("is-empty");
                avatarEl.style.backgroundImage = "";
                avatarEl.textContent = "";
            }
        }
    });
    document.querySelectorAll("[data-slot-group-label]").forEach((label) => {
        const role = label.dataset.slotGroupLabel;
        if (!role)
            return;
        const limit = trackRoleLimit(role);
        const assigned = getTrackRoleIdsFromSlots(role).length;
        label.textContent = `${roleLabel(role)} Slots (${assigned}/${limit})`;
    });
    const createStage = state.ui.activeView === "create" ? (state.ui.createStage || "sheet") : null;
    const stageRole = createStage === "demo"
        ? "Performer"
        : createStage === "master"
            ? "Producer"
            : createStage === "sheet"
                ? "Songwriter"
                : null;
    document.querySelectorAll(".slot-role-group").forEach((group) => {
        const role = group.dataset.slotRoleGroup;
        group.classList.toggle("is-active", !!stageRole && role === stageRole);
    });
    const solo = $("actTypeSelect") && $("actTypeSelect").value === "Solo Act";
    ["act-member2", "act-member3"].forEach((target) => {
        const slot = getSlotElement(target);
        if (slot)
            slot.classList.toggle("disabled", solo);
    });
    if (typeof window !== "undefined" && window.ensureSlotDropdowns) {
        window.ensureSlotDropdowns();
    }
    if (typeof window !== "undefined" && window.updateSlotDropdowns) {
        window.updateSlotDropdowns();
    }
}
function formatMoney(amount) {
    const sign = amount < 0 ? "-" : "";
    const abs = Math.abs(amount);
    return `${sign}$${abs.toLocaleString("en-US")}`;
}
function formatCount(value) {
    return Math.round(value).toLocaleString("en-US");
}
function formatHour(hour) {
    if (hour === 0)
        return "12AM";
    if (hour < 12)
        return `${hour}AM`;
    if (hour === 12)
        return "12PM";
    return `${hour - 12}PM`;
}
function formatDate(epochMs) {
    const d = new Date(epochMs);
    const dayName = DAYS[d.getUTCDay()];
    const monthName = MONTHS[d.getUTCMonth()];
    const day = String(d.getUTCDate()).padStart(2, "0");
    const year = d.getUTCFullYear();
    const hour = d.getUTCHours();
    return `${dayName} - ${monthName} ${day}, ${year} - ${formatHour(hour)}`;
}
function syncLabelWallets() {
    if (state.label) {
        if (!state.label.wallet)
            state.label.wallet = { cash: 0 };
        state.label.wallet.cash = state.label.cash;
    }
    if (Array.isArray(state.rivals)) {
        state.rivals.forEach((rival) => {
            if (typeof rival.cash !== "number")
                rival.cash = STARTING_CASH;
            if (!rival.wallet)
                rival.wallet = { cash: rival.cash };
            rival.wallet.cash = rival.cash;
            if (!rival.studio)
                rival.studio = { slots: STARTING_STUDIO_SLOTS };
            if (typeof rival.studio.slots !== "number")
                rival.studio.slots = STARTING_STUDIO_SLOTS;
        });
    }
}
function weekIndex() {
    return Math.floor(state.time.totalHours / WEEK_HOURS);
}
function weekIndexForEpochMs(epochMs) {
    const startEpoch = getStartEpochMsFromState();
    return Math.floor((epochMs - startEpoch) / (WEEK_HOURS * HOUR_MS));
}
function getUtcDayHour(epochMs) {
    const date = new Date(epochMs);
    return { day: date.getUTCDay(), hour: date.getUTCHours() };
}
function isScheduledTime(epochMs, schedule) {
    const current = getUtcDayHour(epochMs);
    return current.day === schedule.day && current.hour === schedule.hour;
}
function hoursUntilNextScheduledTime(schedule, epochMs = state.time.epochMs) {
    const current = getUtcDayHour(epochMs);
    const dayDelta = (schedule.day - current.day + 7) % 7;
    const hourDelta = schedule.hour - current.hour;
    let total = dayDelta * 24 + hourDelta;
    if (total <= 0)
        total += WEEK_HOURS;
    return total;
}
function getReleaseAsapHours(epochMs = state.time.epochMs) {
    return hoursUntilNextScheduledTime(WEEKLY_SCHEDULE.releaseProcessing, epochMs);
}
function getReleaseAsapAt(epochMs = state.time.epochMs) {
    return epochMs + getReleaseAsapHours(epochMs) * HOUR_MS;
}
function getUtcDayIndex(epochMs) {
    return getUtcDayHour(epochMs).day;
}
function startOfDayEpochMs(epochMs) {
    return Math.floor(epochMs / DAY_MS) * DAY_MS;
}
function endOfDayEpochMs(epochMs) {
    return startOfDayEpochMs(epochMs) + DAY_MS;
}
function weekStartEpochMs(weekNumber) {
    const safeWeek = Math.max(1, Math.floor(Number(weekNumber) || 1));
    return getStartEpochMsFromState() + (safeWeek - 1) * WEEK_HOURS * HOUR_MS;
}
function rolloutReleaseTimestampForWeek(weekNumber) {
    const weekStart = weekStartEpochMs(weekNumber);
    return weekStart + WEEKLY_SCHEDULE.releaseProcessing.day * DAY_MS + WEEKLY_SCHEDULE.releaseProcessing.hour * HOUR_MS;
}
function rolloutEventTimestampForWeek(weekNumber, eventIndex = 0) {
    const weekStart = weekStartEpochMs(weekNumber);
    const base = weekStart + ROLLOUT_EVENT_SCHEDULE.day * DAY_MS + ROLLOUT_EVENT_SCHEDULE.hour * HOUR_MS;
    const offset = Math.max(0, Math.floor(eventIndex || 0));
    return base + offset * HOUR_MS;
}
function ensurePromoFacilities() {
    if (!state.promoFacilities || typeof state.promoFacilities !== "object") {
        state.promoFacilities = { broadcast: { bookings: [] }, filming: { bookings: [] } };
    }
    if (!Array.isArray(state.promoFacilities.broadcast?.bookings)) {
        state.promoFacilities.broadcast = { bookings: [] };
    }
    if (!Array.isArray(state.promoFacilities.filming?.bookings)) {
        state.promoFacilities.filming = { bookings: [] };
    }
    return state.promoFacilities;
}
function getPromoFacilityForType(typeId) {
    if (typeId === "livePerformance" || typeId === "interview")
        return "broadcast";
    if (typeId === "musicVideo" || typeId === "eyeriSocialAd")
        return "filming";
    return null;
}
function promoFacilityLabel(facilityId) {
    if (facilityId === "broadcast")
        return "Broadcast Studio";
    if (facilityId === "filming")
        return "Filming Studio";
    return "Facility";
}
function getPromoFacilityAvailability(facilityId, epochMs = state.time.epochMs) {
    const facilities = ensurePromoFacilities();
    const dayIndex = getUtcDayIndex(epochMs);
    const bookings = facilities[facilityId]?.bookings || [];
    const active = bookings.filter((booking) => booking.endsAt > epochMs && booking.startsAt <= epochMs);
    const capacity = facilityId === "broadcast"
        ? (BROADCAST_SLOT_SCHEDULE[dayIndex] || 0)
        : FILMING_STUDIO_SLOTS;
    const inUse = active.length;
    return { capacity, inUse, available: Math.max(0, capacity - inUse), dayIndex };
}
function reservePromoFacilitySlot(facilityId, promoType, trackId) {
    if (!facilityId)
        return { ok: true, booking: null };
    const now = state.time.epochMs;
    const availability = getPromoFacilityAvailability(facilityId, now);
    if (availability.available <= 0) {
        return {
            ok: false,
            reason: `No ${promoFacilityLabel(facilityId)} slots available today.`
        };
    }
    const facilities = ensurePromoFacilities();
    const booking = {
        id: uid(facilityId === "broadcast" ? "PB" : "PF"),
        facility: facilityId,
        promoType,
        trackId,
        startsAt: now,
        endsAt: endOfDayEpochMs(now)
    };
    facilities[facilityId].bookings.push(booking);
    return { ok: true, booking, availability };
}
function promoFacilityNeeds(typeIds) {
    const list = Array.isArray(typeIds) ? typeIds : [typeIds];
    return list.reduce((acc, typeId) => {
        if (!typeId)
            return acc;
        const facility = getPromoFacilityForType(typeId);
        if (!facility)
            return acc;
        acc[facility] = (acc[facility] || 0) + 1;
        return acc;
    }, {});
}
function autoPromoBudgetPct() {
    const raw = state.meta?.autoRollout?.budgetPct;
    if (typeof raw !== "number" || Number.isNaN(raw))
        return AUTO_PROMO_BUDGET_PCT;
    return clamp(raw, 0, 1);
}
function computeAutoPromoBudget(cash, pct = AUTO_PROMO_BUDGET_PCT) {
    const safeCash = Number.isFinite(cash) ? Math.max(0, cash) : 0;
    const safePct = clamp(pct, 0, 1);
    if (!safeCash || safePct <= 0)
        return 0;
    const target = Math.floor(safeCash * safePct);
    const budget = Math.max(AUTO_PROMO_MIN_BUDGET, target);
    if (budget > safeCash)
        return 0;
    return budget;
}
function promoWeeksFromBudget(budget) {
    return clamp(Math.floor(budget / 1200) + 1, 1, 4);
}
function expirePromoFacilityBookings() {
    const now = state.time.epochMs;
    const facilities = ensurePromoFacilities();
    ["broadcast", "filming"].forEach((key) => {
        const entries = facilities[key]?.bookings || [];
        facilities[key].bookings = entries.filter((booking) => booking.endsAt > now);
    });
}
function logEvent(text, kind = "info") {
    state.events.unshift({ ts: state.time.epochMs, text, kind });
    if (state.events.length > 80)
        state.events.pop();
    renderEventLog();
}
function loadUiEventLog() {
    const raw = localStorage.getItem(UI_EVENT_LOG_KEY);
    if (!raw)
        return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}
function markUiLogStart() {
    session.uiLogStart = loadUiEventLog().length;
}
function loadLossArchives() {
    const raw = localStorage.getItem(LOSS_ARCHIVE_KEY);
    if (!raw)
        return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}
function saveLossArchives(entries) {
    localStorage.setItem(LOSS_ARCHIVE_KEY, JSON.stringify(entries));
}
function getLossArchives() {
    return loadLossArchives();
}
function handleFromName(name, fallback) {
    const cleaned = String(name || "").replace(/[^a-zA-Z0-9]+/g, "");
    const base = cleaned || fallback || "Gaia";
    return `@${base.slice(0, 32)}`;
}
function normalizeHandle(handle) {
    const raw = String(handle || "@Gaia");
    const withAt = raw.startsWith("@") ? raw : `@${raw}`;
    return withAt.slice(0, 32);
}
function labelContactInfo() {
    const labelName = state.label.name || "Record Label";
    const country = state.label.country || "Annglora";
    const slug = slugify(labelName) || "label";
    return {
        labelName,
        labelEmail: `no-reply@${slug}.ann`,
        labelPhone: "(001) 420-6969",
        labelAddress: [
            "1001 West 2nd Street, Floor 1",
            `${labelName} Campus`,
            "Bloomville, Audora",
            `${country} 1001`
        ],
        playerName: state.meta.playerName || "CEO",
        playerEmail: state.meta.playerEmail || "playername@email.ann",
        playerPhone: "(001) 555-1919",
        playerAddress: [
            "1919 East 19th Street",
            "Gleaming Meadows",
            "Bloomville, Audora",
            `${country} 1007`
        ]
    };
}
function postSocial({ handle, title, lines, text, type, order }) {
    if (!state.social)
        state.social = { posts: [] };
    const post = {
        id: uid("PS"),
        ts: state.time.epochMs,
        handle: normalizeHandle(handle || "@Gaia"),
        title: title || null,
        lines: Array.isArray(lines) ? lines : [],
        text: text || null,
        type: type || "system",
        order: order || 0
    };
    state.social.posts.unshift(post);
    if (state.social.posts.length > 140)
        state.social.posts.pop();
}
// Expose for data templates loaded as non-module scripts.
try {
    if (typeof window !== "undefined") {
        window.postSocial = postSocial;
    }
}
catch (e) {
    // ignore
}
function postQuestEmail(quest) {
    const contact = labelContactInfo();
    const labelHandle = handleFromName(contact.labelName, "Label");
    const subject = `Quest: ${quest.text}`;
    const expReward = Math.round(quest.expReward ?? (quest.reward / 8));
    postSocial({
        handle: labelHandle,
        title: `Email: ${subject}`,
        lines: [
            `From: ${contact.labelName}`,
            `Email: ${contact.labelEmail}`,
            `Phone: ${contact.labelPhone}`,
            "Address:",
            ...contact.labelAddress,
            `To: ${contact.playerName}`,
            `Phone: ${contact.playerPhone}`,
            `Email: ${contact.playerEmail}`,
            "Address:",
            ...contact.playerAddress,
            `Subject: ${subject}`,
            `Dear ${contact.playerName},`,
            quest.story,
            `Objective: ${quest.text}.`,
            `Reward: ${formatMoney(quest.reward)} + ${formatCount(expReward)} EXP.`,
            "Best,",
            `${contact.labelName} CEO`
        ],
        type: "quest",
        order: 1
    });
}
function postQuestComplete(quest) {
    const expReward = Math.round(quest.expReward ?? (quest.reward / 8));
    postSocial({
        handle: "@eyeriStories",
        title: `Quest complete: ${quest.id}`,
        lines: [
            `${state.label.name} fulfilled "${quest.text}".`,
            `Reward issued: ${formatMoney(quest.reward)} + ${formatCount(expReward)} EXP.`
        ],
        type: "quest",
        order: 2
    });
}
function postContractEmail(creator, signCost) {
    const contact = labelContactInfo();
    const creatorSlug = slugify(creator.name) || "creator";
    const subject = `Welcome: Creator at ${contact.labelName}`;
    const startDate = formatDate(state.time.epochMs);
    postSocial({
        handle: handleFromName(contact.labelName, "Label"),
        title: `Email: ${subject}`,
        lines: [
            `From: ${contact.labelName}`,
            `Email: ${contact.labelEmail}`,
            `Phone: ${contact.labelPhone}`,
            "Address:",
            ...contact.labelAddress,
            `To: ${creator.name}`,
            "Phone: (001) 555-1919",
            `Email: ${creatorSlug}@email.ann`,
            "Address:",
            ...contact.playerAddress,
            `Subject: ${subject}`,
            `Hello, ${creator.name}!`,
            `Welcome to ${contact.labelName} as our new ${roleLabel(creator.role)}, starting ${startDate}.`,
            `Reward: Signing bonus ${formatMoney(signCost || 0)}.`,
            "Best,",
            `${contact.labelName} CEO`
        ],
        type: "contract",
        order: 1
    });
}
function postCreatorSigned(creator, signCost) {
    const labelHandle = handleFromName(state.label.name, "Label");
    const creatorHandle = handleFromName(creator.name, "Creator");
    postContractEmail(creator, signCost);
    postSocial({
        handle: "@CreatorsChamber",
        title: "Creator signing",
        lines: [
            `The Music Executive ${state.label.name} tried to negotiate a contract with the Creator ${creator.name}, and signed them.`,
            `${labelHandle} welcomed ${creatorHandle}.`
        ],
        type: "ccc",
        order: 2
    });
}
function postTrackRelease(track) {
    const act = getAct(track.actId);
    const actHandle = act ? handleFromName(act.name, "Act") : "@Act";
    const labelHandle = handleFromName(state.label.name, "Label");
    postSocial({
        handle: "@eyeriStories",
        title: "Release alert",
        lines: [
            `${labelHandle}'s ${actHandle} released "${track.title}".`,
            `Genre: ${track.genre} | Quality ${track.quality}.`
        ],
        type: "track",
        order: 2
    });
}
function postEraComplete(era) {
    const act = getAct(era.actId);
    const actHandle = act ? handleFromName(act.name, "Act") : "@Act";
    const labelHandle = handleFromName(state.label.name, "Label");
    postSocial({
        handle: "@eyeriStories",
        title: "Era complete",
        lines: [
            `${labelHandle}'s ${actHandle} closed the "${era.name}" era.`,
            `Status: Complete | Week ${era.completedWeek}.`
        ],
        type: "era",
        order: 2
    });
}
function generateEraRolloutHusk(era) {
    if (!era || state.meta?.keepEraRolloutHusks === false)
        return null;
    if (era.rolloutHuskGenerated)
        return null;
    const startAt = Number.isFinite(era.startedAt)
        ? era.startedAt
        : weekStartEpochMs(Number.isFinite(era.startedWeek) ? era.startedWeek : weekIndex() + 1);
    const endAt = Number.isFinite(era.completedAt) ? era.completedAt : state.time.epochMs;
    const startWeek = Number.isFinite(era.startedWeek)
        ? era.startedWeek
        : weekNumberFromEpochMs(startAt) || weekIndex() + 1;
    const endWeek = Number.isFinite(era.completedWeek)
        ? era.completedWeek
        : weekNumberFromEpochMs(endAt) || startWeek;
    const weekCount = Math.max(1, endWeek - startWeek + 1);
    const strategy = {
        id: uid("RS"),
        actId: era.actId,
        eraId: era.id,
        weeks: buildRolloutWeeks(weekCount),
        status: "Archived",
        createdAt: state.time.epochMs,
        source: "GeneratedAtEraEnd",
        autoRun: false
    };
    const occurrences = [];
    const releases = state.marketTracks.filter((entry) => entry.isPlayer
        && Number.isFinite(entry.releasedAt)
        && entry.releasedAt >= startAt
        && entry.releasedAt <= endAt
        && (entry.eraId === era.id || (!entry.eraId && entry.actId === era.actId)));
    releases.forEach((entry) => {
        occurrences.push({
            type: "drop",
            ts: entry.releasedAt,
            contentId: entry.trackId || null
        });
    });
    const scheduledEvents = ensureScheduledEventsStore().filter((entry) => Number.isFinite(entry.scheduledAt)
        && entry.scheduledAt >= startAt
        && entry.scheduledAt <= endAt
        && (entry.eraId === era.id || (!entry.eraId && entry.actId === era.actId))
        && entry.status !== "Cancelled");
    scheduledEvents.forEach((entry) => {
        occurrences.push({
            type: "event",
            ts: entry.completedAt || entry.scheduledAt,
            actionType: entry.actionType,
            contentId: entry.contentId || null
        });
    });
    occurrences.sort((a, b) => a.ts - b.ts);
    occurrences.forEach((occurrence) => {
        const weekNumber = weekNumberFromEpochMs(occurrence.ts);
        if (!weekNumber)
            return;
        const weekIndex = weekNumber - startWeek;
        if (weekIndex < 0 || weekIndex >= strategy.weeks.length)
            return;
        if (occurrence.type === "drop") {
            const drop = makeRolloutDrop(occurrence.contentId);
            drop.status = "Completed";
            drop.completedAt = occurrence.ts;
            drop.scheduledAt = occurrence.ts;
            strategy.weeks[weekIndex].drops.push(drop);
            return;
        }
        const eventItem = makeRolloutEvent(occurrence.actionType, occurrence.contentId);
        eventItem.status = "Completed";
        eventItem.completedAt = occurrence.ts;
        eventItem.scheduledAt = occurrence.ts;
        strategy.weeks[weekIndex].events.push(eventItem);
    });
    ensureRolloutStrategies().push(strategy);
    era.rolloutHuskGenerated = true;
    return strategy;
}
const ALIGNMENT_THEME_PRIORITIES = {
    Safe: ["Freedom", "Morality"],
    Neutral: ["Loyalty"],
    Risky: ["Ambition", "Power"]
};
function uniqueList(list) {
    return [...new Set((list || []).filter((item) => typeof item === "string" && item.trim()))];
}
function fillDistinct(list, pool, count) {
    const picks = list.slice(0, count);
    if (picks.length >= count)
        return picks;
    const available = pool.filter((item) => !picks.includes(item));
    if (available.length) {
        picks.push(...pickDistinct(available, Math.min(count - picks.length, available.length)));
    }
    return picks.slice(0, count);
}
function normalizeStartPreferences(preferences = {}) {
    const themes = fillDistinct(uniqueList(preferences.themes).filter((theme) => THEMES.includes(theme)), THEMES, 2);
    const moods = fillDistinct(uniqueList(preferences.moods).filter((mood) => MOODS.includes(mood)), MOODS, 2);
    return { themes, moods };
}
function pickPreferredThemes({ alignment, focusThemes } = {}) {
    const aligned = ALIGNMENT_THEME_PRIORITIES[alignment] || [];
    const alignmentThemes = uniqueList(aligned).filter((theme) => THEMES.includes(theme));
    const focus = uniqueList(focusThemes).filter((theme) => THEMES.includes(theme));
    const combined = uniqueList([...alignmentThemes, ...focus]);
    if (!combined.length)
        return pickDistinct(THEMES, 2);
    const picks = [];
    if (alignmentThemes.length) {
        picks.push(...pickDistinct(alignmentThemes, 1));
    }
    const remaining = combined.filter((theme) => !picks.includes(theme));
    return fillDistinct(picks, remaining.length ? remaining : THEMES, 2);
}
function pickPreferredMoods(focusMoods) {
    const preferred = uniqueList(focusMoods).filter((mood) => MOODS.includes(mood));
    if (!preferred.length)
        return pickDistinct(MOODS, 2);
    if (preferred.length >= 2)
        return pickDistinct(preferred, 2);
    return fillDistinct(preferred, MOODS, 2);
}
function makeCreator(role, existingNames, country, options = {}) {
    const alignment = ALIGNMENTS.includes(options.alignment) ? options.alignment : "";
    const hasThemePrefs = alignment || (Array.isArray(options.focusThemes) && options.focusThemes.length);
    const hasMoodPrefs = Array.isArray(options.focusMoods) && options.focusMoods.length;
    const themes = hasThemePrefs
        ? pickPreferredThemes({ alignment, focusThemes: options.focusThemes })
        : pickDistinct(THEMES, 2);
    const moods = hasMoodPrefs ? pickPreferredMoods(options.focusMoods) : pickDistinct(MOODS, 2);
    const existing = existingNames
        || [...state.creators.map((creator) => creator.name), ...state.marketCreators.map((creator) => creator.name)];
    const origin = country || pickOne(NATIONS);
    return {
        id: uid("CR"),
        name: buildCreatorName(origin, existing),
        role,
        skill: clampSkill(rand(55, 92)),
        stamina: STAMINA_MAX,
        prefThemes: themes,
        prefMoods: moods,
        country: origin,
        portraitUrl: null
    };
}
function normalizeCreator(creator) {
    creator.skill = clampSkill(creator.skill ?? 60);
    creator.stamina = clampStamina(creator.stamina ?? STAMINA_MAX);
    if (!creator.prefThemes?.length)
        creator.prefThemes = pickDistinct(THEMES, 2);
    if (!creator.prefMoods?.length)
        creator.prefMoods = pickDistinct(MOODS, 2);
    if (!creator.country)
        creator.country = pickOne(NATIONS);
    const now = typeof state?.time?.epochMs === "number" ? state.time.epochMs : Date.now();
    if (typeof creator.lastActivityAt !== "number")
        creator.lastActivityAt = now;
    if (typeof creator.lastReleaseAt !== "number")
        creator.lastReleaseAt = null;
    if (typeof creator.lastPromoAt !== "number")
        creator.lastPromoAt = null;
    if (typeof creator.staminaSpentToday !== "number") {
        creator.staminaSpentToday = typeof creator.staminaUsedToday === "number" ? creator.staminaUsedToday : 0;
    }
    if (typeof creator.staminaUsedToday !== "number")
        creator.staminaUsedToday = creator.staminaSpentToday;
    if (typeof creator.lastUsageDay !== "number") {
        creator.lastUsageDay = Math.floor((creator.lastActivityAt || now) / DAY_MS);
    }
    if (typeof creator.overuseStrikes !== "number")
        creator.overuseStrikes = 0;
    if (typeof creator.lastOveruseDay !== "number")
        creator.lastOveruseDay = null;
    if (typeof creator.skillProgress !== "number")
        creator.skillProgress = 0;
    if (typeof creator.skillDecayApplied !== "number")
        creator.skillDecayApplied = 0;
    if (!creator.departurePending)
        creator.departurePending = null;
    if (typeof creator.portraitUrl !== "string") {
        creator.portraitUrl = creator.portraitUrl ? String(creator.portraitUrl) : null;
    }
    if (creator.portraitUrl && !creator.portraitUrl.trim())
        creator.portraitUrl = null;
    return creator;
}
function addCreatorSkillProgress(creator, amount) {
    if (!creator || !Number.isFinite(amount) || amount <= 0)
        return;
    if (typeof creator.skillProgress !== "number")
        creator.skillProgress = 0;
    creator.skillProgress += amount;
    const whole = Math.floor(creator.skillProgress);
    if (whole <= 0)
        return;
    creator.skillProgress -= whole;
    creator.skill = clampSkill((creator.skill ?? 0) + whole);
}
function applyCreatorSkillGain(creator, stageIndex, qualityPotential) {
    if (!creator)
        return;
    const base = CREATOR_SKILL_GAIN_BY_STAGE[stageIndex] ?? 0.1;
    if (!base)
        return;
    const quality = Number.isFinite(qualityPotential) ? clamp(qualityPotential, 0, QUALITY_MAX) : 60;
    const factor = 0.6 + (quality / QUALITY_MAX) * 0.4;
    addCreatorSkillProgress(creator, base * factor);
}
function resetCreatorSkillDecay(creator) {
    if (!creator)
        return;
    creator.skillDecayApplied = 0;
}
function applyCreatorSkillDecay(creator, now) {
    if (!creator)
        return;
    const lastActivity = typeof creator.lastActivityAt === "number" ? creator.lastActivityAt : now;
    const weeksInactive = Math.floor((now - lastActivity) / WEEK_MS);
    if (weeksInactive <= CREATOR_SKILL_DECAY_GRACE_WEEKS) {
        creator.skillDecayApplied = 0;
        return;
    }
    const steps = Math.floor((weeksInactive - CREATOR_SKILL_DECAY_GRACE_WEEKS) / CREATOR_SKILL_DECAY_STEP_WEEKS);
    const applied = creator.skillDecayApplied || 0;
    const delta = steps - applied;
    if (delta <= 0)
        return;
    creator.skillDecayApplied = steps;
    creator.skill = clampSkill((creator.skill ?? 0) - delta);
}
function updateCreatorSkillDecay(now = state.time?.epochMs) {
    const stamp = Number.isFinite(now) ? now : Date.now();
    state.creators.forEach((creator) => {
        applyCreatorSkillDecay(creator, stamp);
    });
}
function ensureCreatorMarketHeat() {
    if (!state.economy) {
        state.economy = { lastRevenue: 0, lastUpkeep: 0, lastWeek: 0, leaseFeesWeek: 0 };
    }
    if (!state.economy.creatorMarketHeat || typeof state.economy.creatorMarketHeat !== "object") {
        state.economy.creatorMarketHeat = { Songwriter: 0, Performer: 0, Producer: 0 };
        return;
    }
    MARKET_ROLES.forEach((role) => {
        if (typeof state.economy.creatorMarketHeat[role] !== "number") {
            state.economy.creatorMarketHeat[role] = 0;
        }
    });
}
function getCreatorMarketHeat(role) {
    ensureCreatorMarketHeat();
    if (!role)
        return 0;
    return state.economy.creatorMarketHeat[role] || 0;
}
function bumpCreatorMarketHeat(role, amount = CREATOR_MARKET_HEAT_STEP) {
    if (!role)
        return;
    ensureCreatorMarketHeat();
    const current = state.economy.creatorMarketHeat[role] || 0;
    state.economy.creatorMarketHeat[role] = clamp(current + amount, 0, CREATOR_MARKET_HEAT_MAX);
}
function decayCreatorMarketHeat() {
    ensureCreatorMarketHeat();
    MARKET_ROLES.forEach((role) => {
        const current = state.economy.creatorMarketHeat[role] || 0;
        const next = current * CREATOR_MARKET_HEAT_DECAY;
        state.economy.creatorMarketHeat[role] = Math.max(0, Math.round(next * 100) / 100);
    });
}
function marketPressureForRole(role) {
    ensureCreatorMarketHeat();
    const pool = Array.isArray(state.marketCreators) ? state.marketCreators : [];
    const supply = pool.filter((creator) => creator.role === role).length;
    const baseline = MARKET_MIN_PER_ROLE || 1;
    const supplyRatio = baseline ? supply / baseline : 1;
    const supplyPressure = clamp(1 - supplyRatio, -0.4, 0.6);
    const heat = getCreatorMarketHeat(role);
    const heatPressure = clamp(heat / CREATOR_MARKET_HEAT_MAX, 0, 1) * 0.4;
    const costMultiplier = clamp(1 + supplyPressure * 0.6 + heatPressure, 0.7, 1.6);
    const acceptanceDelta = clamp(-supplyPressure * 0.08 - heatPressure * 0.05, -0.15, 0.1);
    return { costMultiplier, acceptanceDelta, supplyRatio, heat };
}
function getStageCost(stageIndex, modifier, creatorIds = []) {
    const stage = STAGES[stageIndex];
    if (!stage)
        return 0;
    const resolved = resolveModifier(modifier);
    const modifierCost = typeof resolved?.costDelta === "number" ? resolved.costDelta : 0;
    const crew = listFromIds(creatorIds)
        .map((id) => getCreator(id))
        .filter((creator) => creator && creator.role === stage.role);
    const crewCount = Math.max(1, crew.length || 0);
    const avgSkill = crew.length ? averageSkill(crew) : SKILL_MIN;
    const crewMultiplier = 1 + STAGE_COST_CREW_STEP * Math.max(0, crewCount - 1);
    const skillMultiplier = clamp(STAGE_COST_SKILL_MIN + (avgSkill / SKILL_MAX) * (STAGE_COST_SKILL_MAX - STAGE_COST_SKILL_MIN), STAGE_COST_SKILL_MIN, STAGE_COST_SKILL_MAX);
    const raw = stage.cost * crewMultiplier * skillMultiplier + modifierCost;
    return Math.max(0, Math.round(raw));
}
function computeSignCost(creator) {
    const roleFactor = creator.role === "Producer" ? 1.2 : creator.role === "Songwriter" ? 0.95 : 1.05;
    const base = 900 + creator.skill * 40;
    const pressure = marketPressureForRole(creator.role);
    return clamp(Math.round(base * roleFactor * pressure.costMultiplier), 900, 9000);
}
function ensureCccState() {
    if (!state.ccc)
        state.ccc = { signLockoutsByCreatorId: {} };
    if (!state.ccc.signLockoutsByCreatorId)
        state.ccc.signLockoutsByCreatorId = {};
}
function nextMidnightEpochMs(epochMs) {
    const now = new Date(epochMs);
    return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0);
}
function pruneCreatorSignLockouts(nowEpochMs) {
    ensureCccState();
    const lockouts = state.ccc.signLockoutsByCreatorId;
    Object.keys(lockouts).forEach((id) => {
        const entry = lockouts[id];
        if (!entry || !Number.isFinite(entry.lockedUntilEpochMs) || entry.lockedUntilEpochMs <= nowEpochMs) {
            delete lockouts[id];
        }
    });
}
function getCreatorSignLockout(creatorId, nowEpochMs = state.time.epochMs) {
    ensureCccState();
    const lockout = state.ccc.signLockoutsByCreatorId[creatorId];
    if (!lockout || !Number.isFinite(lockout.lockedUntilEpochMs))
        return null;
    if (lockout.lockedUntilEpochMs <= nowEpochMs) {
        delete state.ccc.signLockoutsByCreatorId[creatorId];
        return null;
    }
    return lockout;
}
function isCreatorSignLocked(creatorId, nowEpochMs = state.time.epochMs) {
    return !!getCreatorSignLockout(creatorId, nowEpochMs);
}
function setCreatorSignLockout(creatorId, lockedUntilEpochMs) {
    if (!creatorId)
        return;
    ensureCccState();
    if (!Number.isFinite(lockedUntilEpochMs))
        return;
    state.ccc.signLockoutsByCreatorId[creatorId] = { lockedUntilEpochMs };
}
function clearCreatorSignLockout(creatorId) {
    if (!creatorId)
        return;
    ensureCccState();
    delete state.ccc.signLockoutsByCreatorId[creatorId];
}
function clearCreatorSignLockouts() {
    ensureCccState();
    state.ccc.signLockoutsByCreatorId = {};
}
function creatorSignAcceptanceChance(creator) {
    let chance = 0.7;
    const focusThemes = Array.isArray(state.label.focusThemes) ? state.label.focusThemes : [];
    const focusMoods = Array.isArray(state.label.focusMoods) ? state.label.focusMoods : [];
    if (creator.prefThemes?.some((theme) => focusThemes.includes(theme)))
        chance += 0.08;
    if (creator.prefMoods?.some((mood) => focusMoods.includes(mood)))
        chance += 0.05;
    if (creator.skill >= 85)
        chance -= 0.08;
    if (creator.skill <= 60)
        chance += 0.05;
    const pressure = marketPressureForRole(creator.role);
    chance += pressure.acceptanceDelta;
    return clamp(chance, 0.35, 0.9);
}
function creatorAcceptsOffer(creator) {
    return Math.random() < creatorSignAcceptanceChance(creator);
}
function attemptSignCreator({ creatorId, recordLabelId, nowEpochMs } = {}) {
    const now = Number.isFinite(nowEpochMs) ? nowEpochMs : state.time.epochMs;
    if (!creatorId) {
        logEvent("Creator signing failed: invalid creator ID.", "warn");
        return { ok: false, kind: "INVALID", reason: "INVALID_ID" };
    }
    const index = state.marketCreators.findIndex((creator) => creator.id === creatorId);
    if (index === -1) {
        logEvent("Creator signing failed: creator is no longer available.", "warn");
        return { ok: false, kind: "INVALID", reason: "NOT_AVAILABLE" };
    }
    if (state.creators.some((creator) => creator.id === creatorId)) {
        logEvent("Creator signing failed: creator is already signed.", "warn");
        return { ok: false, kind: "INVALID", reason: "ALREADY_SIGNED" };
    }
    if (isCreatorSignLocked(creatorId, now)) {
        logEvent("Creator signing locked until the next CCC refresh at 12AM.", "warn");
        return { ok: false, kind: "PRECONDITION", reason: "LOCKED" };
    }
    if (state.creators.length >= CREATOR_ROSTER_CAP) {
        logEvent(`Roster full: max ${CREATOR_ROSTER_CAP} creators signed.`, "warn");
        return { ok: false, kind: "PRECONDITION", reason: "ROSTER_FULL" };
    }
    const creator = state.marketCreators[index];
    const cost = creator.signCost || computeSignCost(creator);
    if (!creator.signCost)
        creator.signCost = cost;
    if (state.label.cash < cost) {
        logEvent("Not enough cash to sign this creator.", "warn");
        return { ok: false, kind: "PRECONDITION", reason: "INSUFFICIENT_FUNDS", cost };
    }
    if (!creatorAcceptsOffer(creator)) {
        const lockedUntilEpochMs = nextMidnightEpochMs(now);
        setCreatorSignLockout(creatorId, lockedUntilEpochMs);
        logEvent(`Creator ${creator.name} rejected the signing attempt. Next attempt after the 12AM refresh.`, "warn");
        return { ok: false, kind: "REJECTED", reason: "REJECTED", cost, lockedUntilEpochMs };
    }
    state.marketCreators.splice(index, 1);
    state.label.cash -= cost;
    creator.signCost = undefined;
    clearCreatorSignLockout(creatorId);
    state.creators.push(normalizeCreator(creator));
    bumpCreatorMarketHeat(creator.role);
    logEvent(`Signed ${creator.name} (${roleLabel(creator.role)}) for ${formatMoney(cost)}.`);
    postCreatorSigned(creator, cost);
    return { ok: true, cost, recordLabelId, creatorId };
}
function getTrackCreatorIds(track) {
    if (!track?.creators)
        return [];
    const ids = [
        ...getTrackRoleIds(track, "Songwriter"),
        ...getTrackRoleIds(track, "Performer"),
        ...getTrackRoleIds(track, "Producer")
    ];
    return [...new Set(ids.filter(Boolean))];
}
function getWorkOrderCreatorIds(order) {
    if (!order)
        return [];
    if (Array.isArray(order.creatorIds) && order.creatorIds.length)
        return order.creatorIds;
    return order.creatorId ? [order.creatorId] : [];
}
function getBusyCreatorIds(status) {
    const ids = new Set();
    state.workOrders.forEach((order) => {
        if (status && order.status !== status)
            return;
        getWorkOrderCreatorIds(order).forEach((id) => ids.add(id));
    });
    return ids;
}
function markCreatorActivityById(creatorId, atMs = state.time.epochMs) {
    const creator = getCreator(creatorId);
    if (!creator)
        return;
    creator.lastActivityAt = atMs;
    resetCreatorSkillDecay(creator);
}
function markCreatorRelease(creatorIds, atMs = state.time.epochMs) {
    if (!Array.isArray(creatorIds))
        return;
    creatorIds.forEach((id) => {
        const creator = getCreator(id);
        if (!creator)
            return;
        creator.lastReleaseAt = atMs;
        creator.lastActivityAt = atMs;
        resetCreatorSkillDecay(creator);
    });
}
function markCreatorPromo(creatorIds, atMs = state.time.epochMs) {
    if (!Array.isArray(creatorIds))
        return;
    creatorIds.forEach((id) => {
        const creator = getCreator(id);
        if (!creator)
            return;
        creator.lastPromoAt = atMs;
        creator.lastActivityAt = atMs;
        resetCreatorSkillDecay(creator);
    });
}
function describeOveruseContext(context = {}) {
    const parts = [];
    if (context.stageName)
        parts.push(context.stageName);
    const track = context.trackId ? getTrack(context.trackId) : null;
    if (track)
        parts.push(`"${track.title}"`);
    if (context.orderId)
        parts.push(`order ${context.orderId}`);
    return parts.length ? parts.join(" ") : "unknown work";
}
function updateCreatorOveruse(creator, staminaCost, context = {}) {
    if (!creator || !staminaCost)
        return { strikeApplied: false, departureFlagged: false };
    const dayIndex = Number.isFinite(context.dayIndex)
        ? context.dayIndex
        : Math.floor(state.time.epochMs / DAY_MS);
    if (creator.lastUsageDay !== dayIndex) {
        resetCreatorDailyUsage(creator, dayIndex);
    }
    const prev = getCreatorStaminaSpentToday(creator);
    const next = setCreatorStaminaSpentToday(creator, prev + staminaCost);
    if (prev > STAMINA_OVERUSE_LIMIT || next <= STAMINA_OVERUSE_LIMIT) {
        return { strikeApplied: false, departureFlagged: false };
    }
    if (creator.lastOveruseDay === dayIndex) {
        return { strikeApplied: false, departureFlagged: false };
    }
    creator.overuseStrikes = (creator.overuseStrikes || 0) + 1;
    creator.lastOveruseDay = dayIndex;
    const detail = describeOveruseContext(context);
    logEvent(`Overuse strike: ${creator.name} [${creator.id}] (${roleLabel(creator.role)}) spent ${formatCount(next)} stamina today (limit ${STAMINA_OVERUSE_LIMIT}). Trigger: ${detail}.`, "warn");
    let departureFlagged = false;
    if (creator.overuseStrikes >= STAMINA_OVERUSE_STRIKES) {
        if (!creator.departurePending) {
            creator.departurePending = { reason: "overuse", flaggedAt: state.time.epochMs };
            departureFlagged = true;
            logEvent(`${creator.name} [${creator.id}] entered departure risk from overuse (strikes ${creator.overuseStrikes}/${STAMINA_OVERUSE_STRIKES}, spent ${formatCount(next)} today).`, "warn");
        }
    }
    return { strikeApplied: true, departureFlagged };
}
function creatorPreferredGenres(creator) {
    const list = [];
    creator.prefThemes.forEach((theme) => {
        creator.prefMoods.forEach((mood) => {
            list.push(formatGenreLabel(theme, mood));
        });
    });
    return list;
}
function makeActName() {
    const existing = state.acts.map((act) => act.name);
    return buildCompositeName(NAME_PARTS.actPrefix, NAME_PARTS.actSuffix, existing, ACT_NAMES, "Collective");
}
function makeLabelName() {
    const existing = [state.label.name];
    return buildCompositeName(NAME_PARTS.labelPrefix, NAME_PARTS.labelSuffix, existing, LABEL_NAMES, "Records");
}
function makeEraName(actName) {
    const template = pickOne(ERA_NAME_TEMPLATES);
    const composed = fillTemplate(template, {
        act: actName,
        prefix: pickOne(NAME_PARTS.projectPrefix),
        suffix: pickOne(NAME_PARTS.projectSuffix),
        noun: pickOne(NAME_PARTS.trackNoun),
        verb: pickOne(NAME_PARTS.trackVerb)
    });
    return composed;
}
function makeAct({ name, type, alignment, memberIds }) {
    return {
        id: uid("AC"),
        name,
        type,
        alignment,
        memberIds
    };
}
function getAct(id) {
    return state.acts.find((act) => act.id === id);
}
function seedActs() {
    if (state.acts.length || !state.creators.length)
        return;
    const members = state.creators.slice(0, Math.min(3, state.creators.length)).map((creator) => creator.id);
    const type = members.length > 1 ? "Group Act" : "Solo Act";
    state.acts.push(makeAct({
        name: makeActName(),
        type,
        alignment: state.label.alignment,
        memberIds: members
    }));
}
function buildMarketCreators(options = {}) {
    const list = [];
    const existing = () => [...state.creators.map((creator) => creator.name), ...list.map((creator) => creator.name)];
    MARKET_ROLES.forEach((role) => {
        for (let i = 0; i < MARKET_MIN_PER_ROLE; i += 1) {
            const creator = normalizeCreator(makeCreator(role, existing(), null, options));
            creator.signCost = computeSignCost(creator);
            list.push(creator);
        }
    });
    return list;
}
function ensureMarketCreators(options = {}, { replenish = true } = {}) {
    if (!Array.isArray(state.marketCreators))
        state.marketCreators = [];
    if (!Array.isArray(state.creators))
        state.creators = [];
    state.marketCreators = state.marketCreators.filter((creator) => creator && typeof creator === "object" && creator.role);
    state.marketCreators = state.marketCreators.map((creator) => {
        const next = normalizeCreator(creator);
        next.signCost = computeSignCost(next);
        return next;
    });
    if (!replenish)
        return;
    const existing = () => [...state.creators.map((creator) => creator.name), ...state.marketCreators.map((creator) => creator.name)];
    MARKET_ROLES.forEach((role) => {
        const current = state.marketCreators.filter((creator) => creator.role === role).length;
        const missing = Math.max(0, MARKET_MIN_PER_ROLE - current);
        for (let i = 0; i < missing; i += 1) {
            const creator = normalizeCreator(makeCreator(role, existing(), null, options));
            creator.signCost = computeSignCost(creator);
            state.marketCreators.push(creator);
        }
    });
}
function refreshDailyMarket() {
    clearCreatorSignLockouts();
    state.marketCreators = buildMarketCreators();
    ensureMarketCreators();
    if (state.ui?.activeView === "world") {
        renderMarket();
    }
}
function buildRivals() {
    return AI_LABELS.map((label) => ({
        id: label.id,
        name: label.name,
        alignment: label.alignment,
        country: label.country,
        focusThemes: label.focusThemes,
        focusMoods: label.focusMoods,
        momentum: 0.5,
        seedBonus: 0,
        cash: STARTING_CASH,
        wallet: { cash: STARTING_CASH },
        studio: { slots: STARTING_STUDIO_SLOTS },
        creators: [],
        aiPlan: { lastPlannedWeek: null, lastHuskId: null, lastPlannedAt: null }
    }));
}
function seedTrends() {
    const combos = [];
    THEMES.forEach((theme) => {
        MOODS.forEach((mood) => {
            if (mood !== "Boring")
                combos.push(makeGenre(theme, mood));
        });
    });
    return pickDistinct(combos, 3);
}
function makeSeededRng(seed) {
    let t = seed >>> 0;
    return () => {
        t += 0x6D2B79F5;
        let x = t;
        x = Math.imul(x ^ (x >>> 15), x | 1);
        x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
}
function hashString(value) {
    const raw = String(value || "");
    let hash = 2166136261;
    for (let i = 0; i < raw.length; i += 1) {
        hash ^= raw.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}
function makeStableSeed(parts) {
    return hashString(Array.isArray(parts) ? parts.join("|") : parts);
}
function seededRand(min, max, rng) {
    return Math.floor(rng() * (max - min + 1)) + min;
}
function seededPick(list, rng) {
    return list[seededRand(0, list.length - 1, rng)];
}
function ensureSeedCatalog() {
    if (Array.isArray(state.meta.seedCatalog) && state.meta.seedCatalog.length) {
        return state.meta.seedCatalog;
    }
    const baseSeed = 940331;
    state.meta.seedCatalog = AI_LABELS.map((label, idx) => ({
        id: `seed-${label.id}`,
        dominantLabelId: label.id,
        variantSeed: baseSeed + idx * 10103
    }));
    return state.meta.seedCatalog;
}
function simulateSeedHistory(startYear, endYear, rng, labelNames, dominantLabelId) {
    const dominantName = state.rivals.find((rival) => rival.id === dominantLabelId)?.name || null;
    const cumulative = {};
    labelNames.forEach((name) => { cumulative[name] = 0; });
    const winners = [];
    for (let year = startYear; year <= endYear; year += 1) {
        const scores = labelNames.map((name) => {
            const base = seededRand(220, 520, rng);
            const variance = seededRand(-40, 40, rng);
            const dominance = dominantName && name === dominantName ? Math.round(base * 0.18) : 0;
            const points = Math.max(40, base + variance + dominance);
            return { name, points };
        });
        scores.sort((a, b) => b.points - a.points);
        scores.forEach((entry) => { cumulative[entry.name] += entry.points; });
        winners.push({ year, label: scores[0].name, points: scores[0].points });
    }
    return { startYear, endYear, cumulative, winners };
}
function captureSeedCalibration(year, labelScores) {
    if (state.meta.gameMode !== "founding")
        return;
    if (year !== SEED_CALIBRATION_YEAR)
        return;
    const calibration = {
        year,
        capturedAt: state.time.epochMs,
        labelScores: labelScores || {},
        trends: Array.isArray(state.trends) ? state.trends.slice() : [],
        marketTrackCount: state.marketTracks?.length || 0,
        rivalMomentum: state.rivals.map((rival) => ({
            id: rival.id,
            name: rival.name,
            momentum: rival.momentum || 0,
            seedBonus: rival.seedBonus || 0,
            creators: Array.isArray(rival.creators) ? rival.creators.length : 0
        }))
    };
    state.meta.seedCalibration = calibration;
    saveSeedCalibration(calibration);
    logEvent("Seed calibration captured for 2400 kickoff.");
}
function seedWorldHistory() {
    const baselineSeed = 2025;
    const baselineRng = makeSeededRng(baselineSeed);
    const seedCatalog = ensureSeedCatalog();
    const preset = seedCatalog[rand(0, seedCatalog.length - 1)];
    const variantSeed = preset?.variantSeed || Math.floor(Date.now() % 1000000);
    const variantRng = makeSeededRng(variantSeed);
    const labelNames = state.rivals.map((rival) => rival.name);
    const baseline = simulateSeedHistory(2025, 2200, baselineRng, labelNames, null);
    const variant = simulateSeedHistory(2200, 2400, variantRng, labelNames, preset?.dominantLabelId || null);
    const calibration = loadSeedCalibration();
    state.meta.seedInfo = {
        baselineSeed,
        variantSeed,
        dominantLabelId: preset?.dominantLabelId || null,
        baselineRange: [baseline.startYear, baseline.endYear],
        variantRange: [variant.startYear, variant.endYear],
        calibration: calibration ? { year: calibration.year, capturedAt: calibration.capturedAt } : null
    };
    state.meta.seedHistory = { baseline, variant };
    if (calibration)
        state.meta.seedCalibration = calibration;
    const maxPoints = Math.max(...Object.values(variant.cumulative));
    const scaledCumulative = {};
    Object.entries(variant.cumulative).forEach(([label, points]) => {
        const ratio = maxPoints ? points / maxPoints : 0;
        scaledCumulative[label] = Math.round(200 + ratio * 800);
    });
    state.meta.cumulativeLabelPoints = scaledCumulative;
    state.rivals.forEach((rival) => {
        const ratio = maxPoints ? (variant.cumulative[rival.name] || 0) / maxPoints : 0;
        rival.momentum = clamp(0.35 + ratio * 0.45, 0.35, 0.95);
        rival.seedBonus = rival.id === preset?.dominantLabelId ? 0.12 : 0;
    });
    state.marketTracks = [];
    seedMarketTracks({
        rng: variantRng,
        count: Math.max(CHART_SIZES.global, 120),
        dominantLabelId: preset?.dominantLabelId || null
    });
}
function makeTrackTitle(theme, mood) {
    return makeTrackTitleByCountry(theme, mood, state.label.country || "Annglora");
}
function trackPoolByLang(lang) {
    if (lang === "es")
        return TRACK_TITLES_ES;
    if (lang === "kr")
        return TRACK_TITLES_KR;
    return TRACK_TITLES_EN;
}
function pickTrackLanguage(country) {
    const weights = COUNTRY_LANGUAGE_WEIGHTS[country] || COUNTRY_LANGUAGE_WEIGHTS.Annglora;
    const roll = Math.random();
    let acc = 0;
    for (const entry of weights) {
        acc += entry.weight;
        if (roll <= acc)
            return entry.lang;
    }
    return weights[0]?.lang || "en";
}
function pickTrackLanguageSeeded(country, rng) {
    const weights = COUNTRY_LANGUAGE_WEIGHTS[country] || COUNTRY_LANGUAGE_WEIGHTS.Annglora;
    const roll = typeof rng === "function" ? rng() : Math.random();
    let acc = 0;
    for (const entry of weights) {
        acc += entry.weight;
        if (roll <= acc)
            return entry.lang;
    }
    return weights[0]?.lang || "en";
}
function makeTrackTitleByCountry(theme, mood, country) {
    const existing = [
        ...state.tracks.map((track) => track.title),
        ...state.marketTracks.map((track) => track.title)
    ];
    const lang = pickTrackLanguage(country);
    const pool = trackPoolByLang(lang);
    const base = pickUniqueName(pool, existing, "II");
    if (theme && mood && Math.random() < 0.35) {
        return `${base} (${formatGenreLabel(theme, mood)})`;
    }
    return base;
}
function makeTrackTitleByCountrySeeded(theme, mood, country, rng) {
    const existing = [
        ...state.tracks.map((track) => track.title),
        ...state.marketTracks.map((track) => track.title)
    ];
    const lang = pickTrackLanguageSeeded(country, rng);
    const pool = trackPoolByLang(lang);
    const base = seededPickUniqueName(pool, existing, "II", rng);
    if (theme && mood && rng && rng() < 0.35) {
        return `${base} (${formatGenreLabel(theme, mood)})`;
    }
    return base;
}
function makeRivalActName() {
    const existing = state.marketTracks.map((track) => track.actName);
    return buildCompositeName(NAME_PARTS.actPrefix, NAME_PARTS.actSuffix, existing, ACT_NAMES, "Unit");
}
function makeRivalActNameSeeded(rng) {
    const existing = state.marketTracks.map((track) => track.actName);
    return buildCompositeNameSeeded(NAME_PARTS.actPrefix, NAME_PARTS.actSuffix, existing, ACT_NAMES, "Unit", rng);
}
function makeProjectTitle() {
    const existing = [
        ...state.tracks.map((track) => track.projectName).filter(Boolean),
        ...state.marketTracks.map((track) => track.projectName).filter(Boolean)
    ];
    const composed = fillTemplate(pickOne(PROJECT_TITLE_TEMPLATES), {
        prefix: pickOne(NAME_PARTS.projectPrefix),
        suffix: pickOne(NAME_PARTS.projectSuffix)
    });
    return existing.includes(composed)
        ? pickUniqueName(PROJECT_TITLES, existing, "Edition")
        : pickUniqueName([composed, ...PROJECT_TITLES], existing, "Edition");
}
function makeProjectTitleSeeded(rng) {
    const existing = [
        ...state.tracks.map((track) => track.projectName).filter(Boolean),
        ...state.marketTracks.map((track) => track.projectName).filter(Boolean)
    ];
    const composed = fillTemplate(seededPick(PROJECT_TITLE_TEMPLATES, rng), {
        prefix: seededPick(NAME_PARTS.projectPrefix, rng),
        suffix: seededPick(NAME_PARTS.projectSuffix, rng)
    });
    return existing.includes(composed)
        ? seededPickUniqueName(PROJECT_TITLES, existing, "Edition", rng)
        : seededPickUniqueName([composed, ...PROJECT_TITLES], existing, "Edition", rng);
}
function computeQualityPotential(track) {
    const writers = getTrackRoleIds(track, "Songwriter").map((id) => getCreator(id)).filter(Boolean);
    const performers = getTrackRoleIds(track, "Performer").map((id) => getCreator(id)).filter(Boolean);
    const producers = getTrackRoleIds(track, "Producer").map((id) => getCreator(id)).filter(Boolean);
    const matchRate = (list, matches) => {
        if (!list.length)
            return 0;
        const hits = list.filter(matches).length;
        return hits / list.length;
    };
    let score = 40 + rand(-5, 5);
    score += averageSkill(writers, { staminaAdjusted: true }) * 0.2;
    score += averageSkill(performers, { staminaAdjusted: true }) * 0.2;
    score += averageSkill(producers, { staminaAdjusted: true }) * 0.3;
    if (track.theme) {
        score += matchRate(writers, (creator) => creator.prefThemes.includes(track.theme)) * 3;
        score += matchRate(producers, (creator) => creator.prefThemes.includes(track.theme)) * 3;
    }
    if (track.mood) {
        score += matchRate(performers, (creator) => creator.prefMoods.includes(track.mood)) * 3;
    }
    if (track.mood === "Boring")
        score -= 12;
    if (track.modifier?.qualityDelta)
        score += track.modifier.qualityDelta;
    return clampQuality(score);
}
function refreshTrackQuality(track, stageIndex) {
    track.qualityPotential = computeQualityPotential(track);
    const stage = STAGES[stageIndex];
    const progress = stage ? stage.progress : 1;
    track.quality = Math.round(track.qualityPotential * progress);
}
function scoreGrade(score) {
    if (score >= 95)
        return "S";
    if (score >= 90)
        return "A";
    if (score >= 80)
        return "B";
    if (score >= 70)
        return "C";
    if (score >= 60)
        return "D";
    return "F";
}
function qualityGrade(score) {
    return scoreGrade(score);
}
function getCreator(id) {
    return state.creators.find((c) => c.id === id);
}
function getTrack(id) {
    return state.tracks.find((t) => t.id === id);
}
function assignTrackAct(trackId, actId) {
    const track = getTrack(trackId);
    if (!track) {
        logEvent("Track not found for assignment.", "warn");
        return false;
    }
    if (track.status === "Released") {
        logEvent("Cannot change Act after release.", "warn");
        return false;
    }
    if (!actId) {
        logEvent("Select an Act to assign.", "warn");
        return false;
    }
    const act = getAct(actId);
    if (!act) {
        logEvent("Act not found for assignment.", "warn");
        return false;
    }
    const prevAct = track.actId;
    track.actId = act.id;
    if (prevAct && prevAct !== act.id) {
        track.eraId = null;
    }
    logEvent(`Assigned "${track.title}" to Act "${act.name}".`);
    return true;
}
function isTrackPipelineActive(track) {
    return track.status === "In Production" || track.status === "Awaiting Demo" || track.status === "Awaiting Master";
}
function isMasteringTrack(track) {
    return track.stageIndex === 2 && (track.status === "Awaiting Master" || track.status === "In Production");
}
function getOwnedStudioSlots() {
    return clamp(Math.round(state.studio.slots || 0), 0, STUDIO_CAP_PER_LABEL);
}
function getStudioUsageCounts() {
    const ownedSlots = getOwnedStudioSlots();
    let owned = 0;
    let leased = 0;
    state.workOrders.forEach((order) => {
        if (order.status !== "In Progress")
            return;
        const slot = Number.isFinite(order.studioSlot) ? order.studioSlot : null;
        if (!slot)
            return;
        if (slot <= ownedSlots) {
            owned += 1;
        }
        else {
            leased += 1;
        }
    });
    return { owned, leased, total: owned + leased };
}
function getStudioUsageCount() {
    return getStudioUsageCounts().total;
}
function getLeasedStudioUsage() {
    return getStudioUsageCounts().leased;
}
function syncStudioUsage() {
    const inUse = getStudioUsageCount();
    state.studio.inUse = inUse;
    return inUse;
}
function getStageStudioUsage(stageIndex) {
    return state.workOrders.filter((order) => order.status === "In Progress" && order.stageIndex === stageIndex).length;
}
function getStageStudioAvailable(stageIndex) {
    return Math.max(0, STAGE_STUDIO_LIMIT - getStageStudioUsage(stageIndex));
}
function getActiveStudioSlots() {
    const used = new Set();
    state.workOrders.forEach((order) => {
        if (order.status === "In Progress" && Number.isFinite(order.studioSlot)) {
            used.add(order.studioSlot);
        }
    });
    return used;
}
function findAvailableStudioSlot(usedSlots) {
    const used = usedSlots || getActiveStudioSlots();
    const ownedSlots = getOwnedStudioSlots();
    const market = getStudioMarketSnapshot();
    const maxSlot = Math.min(STUDIO_CAP_PER_LABEL, ownedSlots + getLeasedStudioUsage() + market.available);
    for (let i = 1; i <= maxSlot; i += 1) {
        if (!used.has(i))
            return i;
    }
    return null;
}
function syncWorkOrderStudioSlots() {
    const inProgress = state.workOrders.filter((order) => order.status === "In Progress");
    const used = new Set();
    const ownedSlots = getOwnedStudioSlots();
    const market = getStudioMarketSnapshot();
    const maxSlot = Math.min(STUDIO_CAP_PER_LABEL, ownedSlots + getLeasedStudioUsage() + market.available);
    inProgress.forEach((order) => {
        const slot = Number.isFinite(order.studioSlot) ? order.studioSlot : null;
        if (slot && slot <= maxSlot && !used.has(slot)) {
            used.add(slot);
        }
        else {
            order.studioSlot = null;
        }
    });
    inProgress.forEach((order) => {
        if (Number.isFinite(order.studioSlot))
            return;
        const slot = findAvailableStudioSlot(used);
        if (!slot)
            return;
        order.studioSlot = slot;
        used.add(slot);
    });
    state.studio.inUse = inProgress.length;
}
function getStudioAvailableSlots() {
    const counts = getStudioUsageCounts();
    const ownedSlots = getOwnedStudioSlots();
    const ownedAvailable = Math.max(0, ownedSlots - counts.owned);
    const market = getStudioMarketSnapshot();
    const marketAvailable = Math.max(0, market.available);
    const maxAdditional = Math.max(0, STUDIO_CAP_PER_LABEL - counts.total);
    return Math.min(ownedAvailable + marketAvailable, maxAdditional);
}
function estimateRivalStudioUsage() {
    const cap = STUDIO_CAP_PER_LABEL;
    return state.rivals.reduce((sum, rival) => {
        const momentum = typeof rival.momentum === "number" ? rival.momentum : 0.35;
        const used = clamp(Math.round(cap * momentum), 1, cap);
        return sum + used;
    }, 0);
}
function getStudioMarketSnapshot() {
    const capPerLabel = STUDIO_CAP_PER_LABEL;
    const total = capPerLabel * (state.rivals.length + 1);
    const rivals = estimateRivalStudioUsage();
    const ownedSlots = getOwnedStudioSlots();
    const leasedUsage = getLeasedStudioUsage();
    const player = clamp(ownedSlots + leasedUsage, 0, capPerLabel);
    const available = Math.max(0, total - rivals - player);
    return { total, rivals, player, available, capPerLabel };
}
function getStudioLeaseRate() {
    const buildCost = ECONOMY_BASELINES.studioBuildCost || 0;
    const leaseCost = ECONOMY_BASELINES.studioLease4y || 0;
    if (!buildCost || !leaseCost)
        return 0;
    const baseRate = leaseCost / buildCost;
    const market = getStudioMarketSnapshot();
    const availability = market.total ? market.available / market.total : 0;
    const scarcity = clamp(1 - availability, 0, 1);
    // Lease rates flex with market availability using the documented interest band.
    const interestMin = 0.0002;
    const interestMax = 0.5;
    const interest = interestMin + (interestMax - interestMin) * scarcity;
    const discount = availability * 0.1;
    const multiplier = clamp(1 + interest - discount, 0.85, 1.5);
    return baseRate * multiplier;
}
function queueStudioLeaseFee(stage, hours) {
    if (!stage || !state.economy)
        return 0;
    const rate = getStudioLeaseRate();
    if (!rate)
        return 0;
    const baseHours = Math.max(1, stage.hours || 1);
    const billedHours = Math.max(1, Number.isFinite(hours) ? hours : baseHours);
    const hourlyRate = stage.cost / baseHours;
    const fee = Math.round(hourlyRate * billedHours * rate);
    if (fee > 0) {
        if (typeof state.economy.leaseFeesWeek !== "number")
            state.economy.leaseFeesWeek = 0;
        state.economy.leaseFeesWeek = Math.round(state.economy.leaseFeesWeek + fee);
    }
    return fee;
}
function getActiveEras() {
    return Array.isArray(state.era.active) ? state.era.active : [];
}
function getEraById(id) {
    if (!id)
        return null;
    const active = getActiveEras().find((era) => era.id === id);
    if (active)
        return active;
    return state.era.history.find((era) => era.id === id) || null;
}
function getFocusedEra() {
    const focusId = state.ui.focusEraId;
    if (!focusId)
        return null;
    const active = getActiveEras().filter((era) => era.status === "Active");
    const focus = active.find((era) => era.id === focusId) || null;
    if (!focus)
        state.ui.focusEraId = null;
    return focus;
}
function getFocusEraForAct(actId) {
    if (!actId)
        return null;
    const focus = getFocusedEra();
    if (!focus || focus.actId !== actId)
        return null;
    return focus;
}
function setFocusEraById(eraId) {
    if (!eraId) {
        state.ui.focusEraId = null;
        return null;
    }
    const focus = getActiveEras().find((era) => era.id === eraId && era.status === "Active") || null;
    state.ui.focusEraId = focus ? focus.id : null;
    return focus;
}
function getLatestActiveEraForAct(actId) {
    const active = getActiveEras().filter((era) => era.actId === actId && era.status === "Active");
    if (!active.length)
        return null;
    return active.reduce((latest, era) => {
        const latestStamp = latest.startedAt ?? latest.startedWeek ?? 0;
        const eraStamp = era.startedAt ?? era.startedWeek ?? 0;
        return eraStamp >= latestStamp ? era : latest;
    }, active[0]);
}
function normalizeEraContent(era) {
    if (!Array.isArray(era.contentTypes))
        era.contentTypes = [];
    if (!Array.isArray(era.contentItems))
        era.contentItems = [];
}
function registerEraContent(era, type, id) {
    if (!era)
        return;
    normalizeEraContent(era);
    if (type && !era.contentTypes.includes(type)) {
        era.contentTypes.push(type);
    }
    if (type && id && !era.contentItems.some((item) => item.type === type && item.id === id)) {
        era.contentItems.push({ type, id });
    }
}
function ensureRolloutStrategies() {
    if (!Array.isArray(state.rolloutStrategies))
        state.rolloutStrategies = [];
    return state.rolloutStrategies;
}
function ensureScheduledEventsStore() {
    if (!Array.isArray(state.scheduledEvents))
        state.scheduledEvents = [];
    return state.scheduledEvents;
}
function rolloutWeekCountFromEra(era) {
    const weeks = Array.isArray(era?.rolloutWeeks) ? era.rolloutWeeks : (ROLLOUT_PRESETS[1]?.weeks || []);
    const total = weeks.reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
    return Math.max(1, Math.floor(total || 0));
}
function buildRolloutWeeks(count) {
    const total = Math.max(1, Math.floor(Number(count) || 0));
    return Array.from({ length: total }, () => ({ drops: [], events: [] }));
}
function makeRolloutDrop(contentId) {
    return {
        id: uid("RD"),
        contentId,
        contentType: "Track",
        status: "Planned",
        scheduledAt: null,
        completedAt: null,
        lastAttemptAt: null,
        lastAttemptReason: null
    };
}
function makeRolloutEvent(actionType, contentId) {
    return {
        id: uid("RE"),
        actionType,
        contentId: contentId || null,
        status: "Planned",
        scheduledAt: null,
        completedAt: null,
        lastAttemptAt: null,
        lastAttemptReason: null
    };
}
function createRolloutStrategyForEra(era, { source = "PlayerPlanned", status = "Draft" } = {}) {
    if (!era)
        return null;
    const strategy = {
        id: uid("RS"),
        actId: era.actId,
        eraId: era.id,
        weeks: buildRolloutWeeks(rolloutWeekCountFromEra(era)),
        status,
        createdAt: state.time.epochMs,
        source,
        autoRun: false
    };
    ensureRolloutStrategies().push(strategy);
    era.rolloutStrategyId = strategy.id;
    return strategy;
}
function getRolloutStrategyById(id) {
    if (!id)
        return null;
    return ensureRolloutStrategies().find((strategy) => strategy.id === id) || null;
}
function getRolloutStrategiesForEra(eraId) {
    if (!eraId)
        return [];
    return ensureRolloutStrategies().filter((strategy) => strategy.eraId === eraId);
}
function getRolloutPlanningEra() {
    const focus = getFocusedEra();
    if (focus)
        return focus;
    const active = getActiveEras().filter((era) => era.status === "Active");
    return active.length === 1 ? active[0] : null;
}
function setSelectedRolloutStrategyId(strategyId) {
    if (!state.ui.viewContext) {
        state.ui.viewContext = {
            actId: null,
            eraId: null,
            releaseId: null,
            projectId: null,
            plannedReleaseIds: [],
            selectedRolloutTemplateId: null,
            rolloutStrategyId: null
        };
    }
    if (typeof state.ui.viewContext.rolloutStrategyId !== "string") {
        state.ui.viewContext.rolloutStrategyId = null;
    }
    state.ui.viewContext.rolloutStrategyId = strategyId || null;
    const strategy = getRolloutStrategyById(strategyId);
    if (strategy) {
        const era = getEraById(strategy.eraId);
        if (era)
            era.rolloutStrategyId = strategy.id;
    }
    return strategy;
}
function startEraForAct({ actId, name, rolloutId, contentType, contentId, source }) {
    const act = getAct(actId);
    const rollout = ROLLOUT_PRESETS.find((preset) => preset.id === rolloutId)
        || ROLLOUT_PRESETS[1];
    const eraName = name || makeEraName(act ? act.name : "New Act");
    const era = {
        id: uid("ER"),
        name: eraName,
        actId,
        rolloutId: rollout.id,
        rolloutWeeks: rollout.weeks.slice(),
        stageIndex: 0,
        stageWeek: 0,
        weeksElapsed: 0,
        startedWeek: weekIndex() + 1,
        startedAt: state.time.epochMs,
        status: "Active",
        completedWeek: null,
        completedAt: null,
        contentTypes: [],
        contentItems: [],
        rolloutStrategyId: null,
        rolloutHuskGenerated: false
    };
    registerEraContent(era, contentType, contentId);
    state.era.active.push(era);
    logEvent(`Era started: ${eraName}${source ? ` (${source})` : ""}.`);
    return era;
}
function archiveEra(era, status) {
    if (!era)
        return;
    if (status)
        era.status = status;
    if (!era.completedWeek)
        era.completedWeek = weekIndex() + 1;
    if (!era.completedAt)
        era.completedAt = state.time.epochMs;
    if (!state.era.history.some((entry) => entry.id === era.id)) {
        state.era.history.push({
            id: era.id,
            name: era.name,
            actId: era.actId,
            completedWeek: era.completedWeek,
            completedAt: era.completedAt,
            status: era.status || status || "Ended",
            contentTypes: era.contentTypes || [],
            rolloutId: era.rolloutId || null,
            rolloutWeeks: Array.isArray(era.rolloutWeeks) ? era.rolloutWeeks.slice() : null,
            startedWeek: era.startedWeek || null,
            startedAt: era.startedAt || null,
            rolloutStrategyId: era.rolloutStrategyId || null
        });
    }
}
function endEraById(eraId, reason) {
    const active = getActiveEras();
    const index = active.findIndex((era) => era.id === eraId);
    if (index === -1)
        return null;
    const [era] = active.splice(index, 1);
    era.status = "Ended";
    era.completedWeek = weekIndex() + 1;
    era.completedAt = state.time.epochMs;
    archiveEra(era, "Ended");
    generateEraRolloutHusk(era);
    if (state.ui.focusEraId === era.id)
        state.ui.focusEraId = null;
    logEvent(`Era ended: ${era.name}${reason ? ` (${reason})` : ""}.`);
    return era;
}
function ensureEraForTrack(track, source) {
    if (!track)
        return null;
    const actId = track.actId;
    if (!actId)
        return null;
    const existing = track.eraId ? getEraById(track.eraId) : null;
    if (existing && existing.status === "Active") {
        registerEraContent(existing, "Track", track.id);
        return existing;
    }
    const focused = getFocusEraForAct(actId);
    if (focused) {
        track.eraId = focused.id;
        registerEraContent(focused, "Track", track.id);
        return focused;
    }
    const era = startEraForAct({
        actId,
        contentType: "Track",
        contentId: track.id,
        source
    });
    track.eraId = era.id;
    return era;
}
function resolveRolloutWeekIndex(strategy, weekNumber) {
    if (!strategy || !Array.isArray(strategy.weeks))
        return null;
    const index = Math.floor(Number(weekNumber) || 0) - 1;
    if (!Number.isFinite(index) || index < 0 || index >= strategy.weeks.length)
        return null;
    return index;
}
function rolloutEventLabel(actionType) {
    const details = actionType && PROMO_TYPE_DETAILS[actionType] ? PROMO_TYPE_DETAILS[actionType] : null;
    if (details?.label)
        return details.label;
    return actionType || "Event";
}
function addRolloutStrategyDrop(strategyId, weekNumber, contentId) {
    const strategy = getRolloutStrategyById(strategyId);
    if (!strategy)
        return false;
    const weekIndex = resolveRolloutWeekIndex(strategy, weekNumber);
    if (weekIndex === null) {
        logEvent("Rollout week is out of range.", "warn");
        return false;
    }
    const track = getTrack(contentId);
    if (!track) {
        logEvent("Drop requires a valid Track ID.", "warn");
        return false;
    }
    const week = strategy.weeks[weekIndex];
    if (week.drops.some((drop) => drop.contentId === track.id)) {
        logEvent("Drop already exists in this rollout week.", "warn");
        return false;
    }
    week.drops.push(makeRolloutDrop(track.id));
    logEvent(`Rollout week ${weekIndex + 1}: added drop "${track.title}".`);
    return true;
}
function addRolloutStrategyEvent(strategyId, weekNumber, actionType, contentId) {
    const strategy = getRolloutStrategyById(strategyId);
    if (!strategy)
        return false;
    const weekIndex = resolveRolloutWeekIndex(strategy, weekNumber);
    if (weekIndex === null) {
        logEvent("Rollout week is out of range.", "warn");
        return false;
    }
    if (!actionType) {
        logEvent("Event requires an action type.", "warn");
        return false;
    }
    if (contentId) {
        const track = getTrack(contentId);
        if (!track) {
            logEvent("Event content ID not found.", "warn");
            return false;
        }
    }
    strategy.weeks[weekIndex].events.push(makeRolloutEvent(actionType, contentId));
    logEvent(`Rollout week ${weekIndex + 1}: added ${rolloutEventLabel(actionType)} event.`);
    return true;
}
function getRivalByName(name) {
    return state.rivals.find((rival) => rival.name === name);
}
function creatorHasActiveAct(creatorId) {
    const memberActs = state.acts.filter((act) => act.memberIds.includes(creatorId));
    if (!memberActs.length)
        return false;
    const activeEraActIds = new Set(getActiveEras().filter((era) => era.status === "Active").map((era) => era.actId));
    return memberActs.some((act) => activeEraActIds.has(act.id));
}
function creatorHasActiveWork(creatorId) {
    return getBusyCreatorIds().has(creatorId);
}
function detachCreatorFromContent(creatorId) {
    state.acts.forEach((act) => {
        act.memberIds = act.memberIds.filter((id) => id !== creatorId);
    });
    state.tracks.forEach((track) => {
        if (!track.creators)
            return;
        if (Array.isArray(track.creators.songwriterIds)) {
            track.creators.songwriterIds = track.creators.songwriterIds.filter((id) => id !== creatorId);
        }
        if (Array.isArray(track.creators.performerIds)) {
            track.creators.performerIds = track.creators.performerIds.filter((id) => id !== creatorId);
        }
        if (Array.isArray(track.creators.producerIds)) {
            track.creators.producerIds = track.creators.producerIds.filter((id) => id !== creatorId);
        }
        if (track.creators.songwriterId === creatorId)
            track.creators.songwriterId = null;
        if (track.creators.performerId === creatorId)
            track.creators.performerId = null;
        if (track.creators.producerId === creatorId)
            track.creators.producerId = null;
    });
    if (state.ui?.actSlots) {
        if (state.ui.actSlots.lead === creatorId)
            state.ui.actSlots.lead = null;
        if (state.ui.actSlots.member2 === creatorId)
            state.ui.actSlots.member2 = null;
        if (state.ui.actSlots.member3 === creatorId)
            state.ui.actSlots.member3 = null;
    }
    if (state.ui?.trackSlots) {
        ensureTrackSlotArrays();
        ["songwriterIds", "performerIds", "producerIds"].forEach((key) => {
            if (!Array.isArray(state.ui.trackSlots[key]))
                return;
            state.ui.trackSlots[key] = state.ui.trackSlots[key].map((id) => (id === creatorId ? null : id));
        });
    }
}
function returnCreatorToMarket(creator, reason) {
    if (!creator)
        return;
    const returned = normalizeCreator({
        ...creator,
        lastActivityAt: state.time.epochMs,
        lastReleaseAt: null,
        lastPromoAt: null,
        departurePending: null,
        overuseStrikes: 0,
        staminaSpentToday: 0,
        staminaUsedToday: 0,
        lastUsageDay: Math.floor(state.time.epochMs / DAY_MS),
        lastOveruseDay: null
    });
    returned.signCost = computeSignCost(returned);
    state.marketCreators.push(returned);
    logEvent(`${creator.name} returned to the CCC (${reason}).`);
    postSocial({
        handle: "@CreatorsChamber",
        title: "Creator available",
        lines: [
            `${creator.name} is back in the community chamber.`,
            `Reason: ${reason}.`
        ],
        type: "ccc",
        order: 2
    });
    ensureMarketCreators();
}
function removeCreatorFromLabel(creator, reason) {
    if (!creator)
        return;
    detachCreatorFromContent(creator.id);
    state.creators = state.creators.filter((entry) => entry.id !== creator.id);
    returnCreatorToMarket(creator, reason);
    renderSlots();
}
function processCreatorDepartures() {
    const busyIds = getBusyCreatorIds();
    const pending = state.creators.filter((creator) => creator.departurePending && !busyIds.has(creator.id));
    if (!pending.length)
        return;
    pending.forEach((creator) => {
        const departure = creator.departurePending || {};
        const reason = departure.reason || "departure";
        const flaggedAt = Number.isFinite(departure.flaggedAt) ? departure.flaggedAt : null;
        if (reason === "overuse") {
            const flaggedLabel = flaggedAt ? formatDate(flaggedAt) : "Unknown time";
            logEvent(`${creator.name} [${creator.id}] left the label due to overuse (strikes ${creator.overuseStrikes}/${STAMINA_OVERUSE_STRIKES}, flagged ${flaggedLabel}).`, "warn");
        }
        creator.departurePending = null;
        removeCreatorFromLabel(creator, reason);
    });
}
function processCreatorInactivity() {
    const now = state.time.epochMs;
    const busyIds = getBusyCreatorIds();
    state.creators.forEach((creator) => {
        if (creator.departurePending)
            return;
        if (busyIds.has(creator.id))
            return;
        if (creatorHasActiveAct(creator.id))
            return;
        const lastActivity = typeof creator.lastActivityAt === "number" ? creator.lastActivityAt : 0;
        const releaseAt = typeof creator.lastReleaseAt === "number" ? creator.lastReleaseAt : 0;
        const promoAt = typeof creator.lastPromoAt === "number" ? creator.lastPromoAt : 0;
        const recentRelease = Math.max(releaseAt || 0, promoAt || 0);
        if (now - lastActivity < CREATOR_INACTIVITY_MS)
            return;
        if (recentRelease && now - recentRelease < CREATOR_INACTIVITY_MS)
            return;
        creator.departurePending = { reason: "inactivity", flaggedAt: now };
    });
    processCreatorDepartures();
}
function ensureRivalRoster(rival) {
    if (!rival.creators)
        rival.creators = [];
    if (!Array.isArray(rival.creators))
        rival.creators = [];
}
function buildRivalCreator(role, rival, trendTheme, trendMood) {
    const existing = [
        ...state.creators.map((creator) => creator.name),
        ...state.marketCreators.map((creator) => creator.name),
        ...rival.creators.map((creator) => creator.name)
    ];
    const creator = normalizeCreator(makeCreator(role, existing, rival.country));
    if (trendTheme)
        creator.prefThemes = pickDistinct([trendTheme, ...THEMES], 2);
    if (trendMood)
        creator.prefMoods = pickDistinct([trendMood, ...MOODS], 2);
    creator.signCost = computeSignCost(creator);
    return creator;
}
function rivalHasTrendCoverage(rival, theme, mood) {
    if (!theme || !mood)
        return false;
    return rival.creators.some((creator) => creator.prefThemes?.includes(theme) && creator.prefMoods?.includes(mood));
}
function pickTrendTarget(trends) {
    if (!trends.length)
        return { theme: "", mood: "" };
    const trend = pickOne(trends);
    return { theme: themeFromGenre(trend), mood: moodFromGenre(trend) };
}
function takeMarketRecruit(role, trendTheme, trendMood) {
    const themedIndex = state.marketCreators.findIndex((creator) => {
        if (creator.role !== role)
            return false;
        if (trendTheme && !creator.prefThemes?.includes(trendTheme))
            return false;
        if (trendMood && !creator.prefMoods?.includes(trendMood))
            return false;
        return true;
    });
    if (themedIndex >= 0)
        return state.marketCreators.splice(themedIndex, 1)[0];
    const roleIndex = state.marketCreators.findIndex((creator) => creator.role === role);
    if (roleIndex >= 0)
        return state.marketCreators.splice(roleIndex, 1)[0];
    return null;
}
function pickRivalCreatorForRole(rival, role, theme, mood) {
    const pool = rival.creators.filter((creator) => creator.role === role);
    if (!pool.length)
        return null;
    const themed = pool.filter((creator) => {
        const themeMatch = theme ? creator.prefThemes?.includes(theme) : true;
        const moodMatch = mood ? creator.prefMoods?.includes(mood) : true;
        return themeMatch && moodMatch;
    });
    const candidates = themed.length ? themed : pool;
    let best = candidates[0];
    let bestReleaseAt = typeof best.lastReleaseAt === "number" ? best.lastReleaseAt : -Infinity;
    let bestActivityAt = typeof best.lastActivityAt === "number" ? best.lastActivityAt : -Infinity;
    for (let i = 1; i < candidates.length; i += 1) {
        const candidate = candidates[i];
        const releaseAt = typeof candidate.lastReleaseAt === "number" ? candidate.lastReleaseAt : -Infinity;
        const activityAt = typeof candidate.lastActivityAt === "number" ? candidate.lastActivityAt : -Infinity;
        if (releaseAt < bestReleaseAt || (releaseAt === bestReleaseAt && activityAt < bestActivityAt)) {
            best = candidate;
            bestReleaseAt = releaseAt;
            bestActivityAt = activityAt;
        }
    }
    return best;
}
function pickRivalReleaseCrew(rival, theme, mood) {
    return [
        pickRivalCreatorForRole(rival, "Songwriter", theme, mood),
        pickRivalCreatorForRole(rival, "Performer", theme, mood),
        pickRivalCreatorForRole(rival, "Producer", theme, mood)
    ].filter(Boolean);
}
function recruitRivalCreators() {
    const trends = Array.isArray(state.trends) ? state.trends : [];
    state.rivals.forEach((rival) => {
        ensureRivalRoster(rival);
        const counts = MARKET_ROLES.reduce((acc, role) => {
            acc[role] = rival.creators.filter((creator) => creator.role === role).length;
            return acc;
        }, {});
        const signed = [];
        const addRecruit = (role, trendTheme, trendMood) => {
            const recruit = takeMarketRecruit(role, trendTheme, trendMood)
                || buildRivalCreator(role, rival, trendTheme, trendMood);
            rival.creators.push(recruit);
            signed.push({ role: recruit.role, name: recruit.name, trendTheme });
            bumpCreatorMarketHeat(recruit.role);
            counts[role] = (counts[role] || 0) + 1;
        };
        MARKET_ROLES.forEach((role) => {
            let missing = Math.max(0, RIVAL_MIN_PER_ROLE - counts[role]);
            while (missing > 0) {
                const { theme, mood } = pickTrendTarget(trends);
                addRecruit(role, theme, mood);
                missing -= 1;
            }
        });
        const needsCoverage = trends.some((trend) => {
            const theme = themeFromGenre(trend);
            const mood = moodFromGenre(trend);
            return !rival.creators.some((creator) => creator.prefThemes?.includes(theme) && creator.prefMoods?.includes(mood));
        });
        if (needsCoverage) {
            const { theme, mood } = pickTrendTarget(trends);
            const neededRole = MARKET_ROLES.slice().sort((a, b) => counts[a] - counts[b])[0];
            addRecruit(neededRole, theme, mood);
        }
        if (!signed.length)
            return;
        if (signed.length === 1) {
            const entry = signed[0];
            logEvent(`${rival.name} signed ${entry.name} (${roleLabel(entry.role)}) to chase ${entry.trendTheme || "new"} trends.`);
            return;
        }
        const roleCounts = signed.reduce((acc, entry) => {
            acc[entry.role] = (acc[entry.role] || 0) + 1;
            return acc;
        }, {});
        const detail = Object.entries(roleCounts).map(([role, count]) => `${roleLabel(role)} +${count}`).join(", ");
        logEvent(`${rival.name} signed ${signed.length} creators (${detail}).`);
    });
    ensureMarketCreators();
}
function markRivalReleaseActivity(labelName, releasedAt, creatorIds = []) {
    const rival = getRivalByName(labelName);
    if (!rival || !Array.isArray(rival.creators) || !rival.creators.length)
        return;
    const ids = Array.isArray(creatorIds) && creatorIds.length
        ? creatorIds
        : [pickOne(rival.creators).id];
    ids.forEach((id) => {
        const creator = rival.creators.find((entry) => entry.id === id);
        if (!creator)
            return;
        creator.lastReleaseAt = releasedAt;
        creator.lastActivityAt = releasedAt;
    });
}
function markRivalPromoActivity(labelName, promoAt, creatorIds = []) {
    const rival = getRivalByName(labelName);
    if (!rival || !Array.isArray(rival.creators) || !rival.creators.length)
        return;
    const ids = Array.isArray(creatorIds) && creatorIds.length
        ? creatorIds
        : [pickOne(rival.creators).id];
    ids.forEach((id) => {
        const creator = rival.creators.find((entry) => entry.id === id);
        if (!creator)
            return;
        creator.lastPromoAt = promoAt;
        creator.lastActivityAt = promoAt;
    });
}
function processRivalCreatorInactivity() {
    const now = state.time.epochMs;
    state.rivals.forEach((rival) => {
        if (!Array.isArray(rival.creators))
            return;
        const remaining = [];
        rival.creators.forEach((creator) => {
            const lastActivity = typeof creator.lastActivityAt === "number" ? creator.lastActivityAt : 0;
            const releaseAt = typeof creator.lastReleaseAt === "number" ? creator.lastReleaseAt : 0;
            const promoAt = typeof creator.lastPromoAt === "number" ? creator.lastPromoAt : 0;
            const recentRelease = Math.max(releaseAt || 0, promoAt || 0);
            if (now - lastActivity < CREATOR_INACTIVITY_MS) {
                remaining.push(creator);
                return;
            }
            if (recentRelease && now - recentRelease < CREATOR_INACTIVITY_MS) {
                remaining.push(creator);
                return;
            }
            returnCreatorToMarket(creator, "inactivity");
        });
        rival.creators = remaining;
    });
}
function createTrack({ title, theme, alignment, songwriterIds, performerIds, producerIds, actId, projectName, projectType, modifierId }) {
    if (getStageStudioAvailable(0) <= 0) {
        logEvent("No studio slots available for sheet music. Wait for a studio to free up.", "warn");
        return null;
    }
    if (getStudioAvailableSlots() <= 0) {
        logEvent("No studio slots available. Finish a production or expand capacity first.", "warn");
        return null;
    }
    const resolvedActId = actId && getAct(actId) ? actId : null;
    if (actId && !resolvedActId) {
        logEvent("Act not found; leaving content unassigned.", "warn");
    }
    const focusEra = resolvedActId ? getFocusEraForAct(resolvedActId) : null;
    const activeEra = resolvedActId ? (focusEra || getLatestActiveEraForAct(resolvedActId)) : null;
    const modifier = getModifier(modifierId);
    const resolvedAlignment = alignment || state.label.alignment || "Neutral";
    const normalizedSongwriters = normalizeRoleIds(songwriterIds, "Songwriter");
    const normalizedPerformers = normalizeRoleIds(performerIds, "Performer");
    const normalizedProducers = normalizeRoleIds(producerIds, "Producer");
    const sheetCost = getStageCost(0, modifier, normalizedSongwriters);
    if (state.label.cash < sheetCost) {
        logEvent("Not enough cash to start sheet music.", "warn");
        return null;
    }
    const track = {
        id: uid("TR"),
        title,
        theme,
        mood: null,
        alignment: resolvedAlignment,
        genre: "",
        actId: resolvedActId,
        projectName,
        projectType: projectType || "Single",
        eraId: activeEra ? activeEra.id : null,
        modifier: modifier && modifier.id !== "None" ? modifier : null,
        distribution: "Digital",
        creators: {
            songwriterIds: normalizedSongwriters,
            performerIds: normalizedPerformers,
            producerIds: normalizedProducers
        },
        stageIndex: 0,
        status: "In Production",
        qualityPotential: 0,
        quality: 0,
        completedAt: null,
        releasedAt: null,
        marketId: null
    };
    refreshTrackQuality(track, 0);
    state.tracks.push(track);
    if (activeEra)
        registerEraContent(activeEra, "Track", track.id);
    if (!scheduleStage(track, 0)) {
        state.tracks = state.tracks.filter((entry) => entry.id !== track.id);
        return null;
    }
    state.label.cash -= sheetCost;
    return track;
}
function scheduleStage(track, stageIndex) {
    if (!track) {
        logEvent("Cannot start production: track missing.", "warn");
        return false;
    }
    const stage = STAGES[stageIndex];
    if (!stage) {
        logEvent(`Cannot start production: unknown stage ${stageIndex}.`, "warn");
        return false;
    }
    const creatorIds = normalizeRoleIds(getTrackRoleIds(track, stage.role), stage.role);
    if (!creatorIds.length) {
        const slotTarget = `${TRACK_ROLE_TARGETS[stage.role]}-1`;
        shakeSlot(slotTarget);
        logEvent(`Cannot start ${stage.name}: missing ${roleLabel(stage.role)} assignment.`, "warn");
        return false;
    }
    // Validate crew IDs before scheduling to avoid orphaned work orders.
    const crew = creatorIds
        .map((id) => getCreator(id))
        .filter((creator) => creator && creator.role === stage.role);
    if (!crew.length) {
        logEvent(`Cannot start ${stage.name}: no valid ${roleLabel(stage.role)} assigned.`, "warn");
        return false;
    }
    if (crew.length !== creatorIds.length) {
        logEvent(`Some ${roleLabel(stage.role)} slots were invalid and skipped.`, "warn");
    }
    const crewIds = crew.map((creator) => creator.id);
    const adjustedHours = getAdjustedStageHours(stageIndex, track.modifier, crewIds.length);
    if (!Number.isFinite(adjustedHours) || adjustedHours <= 0) {
        logEvent(`Cannot start ${stage.name}: invalid schedule duration.`, "warn");
        return false;
    }
    const order = {
        id: uid("WO"),
        trackId: track.id,
        stageIndex,
        stageName: stage.name,
        creatorId: crewIds[0],
        creatorIds: crewIds,
        startAt: null,
        endAt: null,
        hours: adjustedHours,
        status: "Queued"
    };
    state.workOrders.push(order);
    tryStartWorkOrder(order);
    return true;
}
function startDemoStage(track, mood, performerIds) {
    if (!track)
        return false;
    if (track.status !== "Awaiting Demo" || track.stageIndex !== 1) {
        logEvent("Track is not ready for demo recording.", "warn");
        return false;
    }
    if (!mood) {
        shakeField("moodSelect");
        logEvent("Select a Mood to start the demo recording.", "warn");
        return false;
    }
    if (Array.isArray(MOODS) && !MOODS.includes(mood)) {
        shakeField("moodSelect");
        logEvent("Select a valid Mood to start the demo recording.", "warn");
        return false;
    }
    const selectedPerformers = listFromIds(performerIds);
    const assignedPerformers = selectedPerformers.length
        ? normalizeRoleIds(selectedPerformers, "Performer")
        : getTrackRoleIds(track, "Performer");
    if (!assignedPerformers.length) {
        shakeSlot(`${TRACK_ROLE_TARGETS.Performer}-1`);
        logEvent("Assign a Performer ID to start the demo recording.", "warn");
        return false;
    }
    const availableStudios = getStudioAvailableSlots();
    if (availableStudios <= 0) {
        logEvent("No studio slots available. Finish a production or expand capacity first.", "warn");
        return false;
    }
    if (getStageStudioAvailable(1) <= 0) {
        logEvent("No studio slots available for demo recording. Wait for a studio to free up.", "warn");
        return false;
    }
    const stageCost = getStageCost(1, track.modifier, assignedPerformers);
    if (state.label.cash < stageCost) {
        logEvent("Not enough cash to start the demo recording.", "warn");
        return false;
    }
    track.creators.performerIds = assignedPerformers;
    track.mood = mood;
    track.status = "In Production";
    refreshTrackQuality(track, 1);
    if (!scheduleStage(track, 1))
        return false;
    state.label.cash -= stageCost;
    return true;
}
function startMasterStage(track, producerIds, alignment) {
    if (!track)
        return false;
    if (track.status !== "Awaiting Master" || track.stageIndex !== 2) {
        logEvent("Track is not ready for mastering.", "warn");
        return false;
    }
    if (!track.mood) {
        logEvent("Demo recording must assign a Mood before mastering.", "warn");
        return false;
    }
    const selectedProducers = listFromIds(producerIds);
    const assignedProducers = selectedProducers.length
        ? normalizeRoleIds(selectedProducers, "Producer")
        : getTrackRoleIds(track, "Producer");
    if (!assignedProducers.length) {
        shakeSlot(`${TRACK_ROLE_TARGETS.Producer}-1`);
        logEvent("Assign a Producer ID to start mastering.", "warn");
        return false;
    }
    const resolvedAlignment = alignment || track.alignment || state.label.alignment;
    if (!resolvedAlignment) {
        shakeField("trackAlignment");
        logEvent("Select a Content Alignment before mastering.", "warn");
        return false;
    }
    if (Array.isArray(ALIGNMENTS) && !ALIGNMENTS.includes(resolvedAlignment)) {
        shakeField("trackAlignment");
        logEvent("Select a valid Content Alignment before mastering.", "warn");
        return false;
    }
    const availableStudios = getStudioAvailableSlots();
    if (availableStudios <= 0) {
        logEvent("No studio slots available. Finish a production or expand capacity first.", "warn");
        return false;
    }
    if (getStageStudioAvailable(2) <= 0) {
        logEvent("No studio slots available for mastering. Wait for a studio to free up.", "warn");
        return false;
    }
    const stageCost = getStageCost(2, track.modifier, assignedProducers);
    if (state.label.cash < stageCost) {
        logEvent("Not enough cash to start mastering.", "warn");
        return false;
    }
    track.creators.producerIds = assignedProducers;
    track.alignment = resolvedAlignment;
    track.status = "In Production";
    refreshTrackQuality(track, 2);
    if (!scheduleStage(track, 2))
        return false;
    state.label.cash -= stageCost;
    return true;
}
function initWorkOrderStaminaMeta(order, stage, { legacyPaid = false } = {}) {
    if (!order || !stage)
        return;
    const hours = Number.isFinite(order.hours) ? order.hours : stage.hours || 1;
    const totalTicks = Math.max(1, Math.ceil(hours || 1));
    const perTick = Math.floor(stage.stamina / totalTicks);
    const remainder = stage.stamina % totalTicks;
    if (!order.staminaTickMeta || typeof order.staminaTickMeta !== "object") {
        order.staminaTickMeta = {};
    }
    order.staminaTickMeta.totalTicks = totalTicks;
    order.staminaTickMeta.perTick = perTick;
    order.staminaTickMeta.remainder = remainder;
    if (!order.staminaTickMeta.ticksApplied || typeof order.staminaTickMeta.ticksApplied !== "object") {
        order.staminaTickMeta.ticksApplied = {};
    }
    if (legacyPaid)
        order.staminaTickMeta.legacyPaid = true;
}
function consumeWorkOrderStaminaSlice(order, stage, creator) {
    if (!order || !stage || !creator)
        return 0;
    if (!order.staminaTickMeta)
        initWorkOrderStaminaMeta(order, stage);
    const meta = order.staminaTickMeta;
    if (meta.legacyPaid)
        return 0;
    const applied = meta.ticksApplied?.[creator.id] || 0;
    if (applied >= meta.totalTicks)
        return 0;
    const slice = meta.perTick + (applied < meta.remainder ? 1 : 0);
    meta.ticksApplied[creator.id] = applied + 1;
    if (slice <= 0)
        return 0;
    creator.stamina = clampStamina(creator.stamina - slice);
    return slice;
}
function logProducerAssignment(crew, stage, order) {
    if (!stage || stage.role !== "Producer")
        return;
    const crewIds = new Set(crew.map((creator) => creator.id));
    const alternatives = state.creators.filter((creator) => {
        if (creator.role !== "Producer")
            return false;
        if (crewIds.has(creator.id))
            return false;
        if (creator.stamina < stage.stamina)
            return false;
        if (getCreatorStaminaSpentToday(creator) + stage.stamina > STAMINA_OVERUSE_LIMIT)
            return false;
        return !getBusyCreatorIds("In Progress").has(creator.id);
    });
    const details = crew.map((creator) => {
        const spent = getCreatorStaminaSpentToday(creator);
        const projected = spent + stage.stamina;
        return `${creator.name} [${creator.id}] (stamina ${creator.stamina}, spent ${formatCount(spent)}/${STAMINA_OVERUSE_LIMIT}, projected ${formatCount(projected)})`;
    }).join(" | ");
    const track = order?.trackId ? getTrack(order.trackId) : null;
    const trackLabel = track ? ` "${track.title}"` : "";
    logEvent(`Producer assignment (${stage.name})${trackLabel}: ${details}. Alternatives under limit: ${alternatives.length}.`);
    const overLimit = crew.some((creator) => getCreatorStaminaSpentToday(creator) + stage.stamina > STAMINA_OVERUSE_LIMIT);
    if (overLimit) {
        logEvent(`Producer assignment exceeds daily limit (${STAMINA_OVERUSE_LIMIT}). Consider rotating Producers or pausing to reset at 12AM.`, "warn");
    }
}
function tryStartWorkOrder(order) {
    const stage = STAGES[order.stageIndex];
    if (order.status !== "Queued")
        return;
    const currentInUse = syncStudioUsage();
    if (getStudioAvailableSlots() <= 0)
        return;
    if (getStageStudioAvailable(order.stageIndex) <= 0)
        return;
    const creatorIds = getWorkOrderCreatorIds(order);
    const crew = creatorIds.map((id) => getCreator(id)).filter(Boolean);
    if (!crew.length)
        return;
    if (crew.some((creator) => creator.stamina < stage.stamina))
        return;
    const usedSlots = getActiveStudioSlots();
    const assignedSlot = Number.isFinite(order.studioSlot) && !usedSlots.has(order.studioSlot)
        ? order.studioSlot
        : findAvailableStudioSlot(usedSlots);
    if (!assignedSlot)
        return;
    const ownedSlots = getOwnedStudioSlots();
    if (assignedSlot > ownedSlots) {
        queueStudioLeaseFee(stage, order.hours || stage.hours);
    }
    order.creatorIds = crew.map((creator) => creator.id);
    order.creatorId = order.creatorIds[0];
    crew.forEach((creator) => {
        markCreatorActivityById(creator.id);
    });
    initWorkOrderStaminaMeta(order, stage);
    ejectLowStaminaTrackSlots();
    order.status = "In Progress";
    order.studioSlot = assignedSlot;
    order.startAt = state.time.epochMs;
    order.endAt = state.time.epochMs + (order.hours || stage.hours) * HOUR_MS;
    state.studio.inUse = Math.max(0, currentInUse + 1);
    const track = getTrack(order.trackId);
    if (track) {
        const lead = crew[0];
        const crewLabel = crew.length > 1 ? `${lead.name} +${crew.length - 1}` : lead.name;
        logEvent(`${crewLabel} started ${stage.name} on "${track.title}".`);
    }
    logProducerAssignment(crew, stage, order);
}
function processWorkOrders() {
    const now = state.time.epochMs;
    let progressed = true;
    while (progressed) {
        progressed = false;
        const completedIds = new Set();
        state.workOrders.forEach((order) => {
            if (order.status === "In Progress" && order.endAt <= now) {
                order.status = "Done";
                state.studio.inUse = Math.max(0, state.studio.inUse - 1);
                completeStage(order);
                completedIds.add(order.id);
                progressed = true;
            }
        });
        if (completedIds.size) {
            state.workOrders = state.workOrders.filter((order) => !completedIds.has(order.id));
        }
        state.workOrders.forEach((order) => tryStartWorkOrder(order));
    }
}
function completeStage(order) {
    const track = getTrack(order.trackId);
    if (!track)
        return;
    const stage = STAGES[order.stageIndex];
    const crewIds = getWorkOrderCreatorIds(order);
    crewIds.forEach((id) => {
        const creator = getCreator(id);
        if (creator)
            applyCreatorSkillGain(creator, order.stageIndex, track.qualityPotential);
    });
    const nextIndex = order.stageIndex + 1;
    track.quality = Math.round(track.qualityPotential * (stage?.progress || 1));
    if (nextIndex < STAGES.length) {
        track.stageIndex = nextIndex;
        track.status = nextIndex === 1 ? "Awaiting Demo" : "Awaiting Master";
        logEvent(`${stage.name} complete: "${track.title}". Ready for ${STAGES[nextIndex].name}.`);
        return;
    }
    track.stageIndex = STAGES.length;
    track.status = "Ready";
    track.completedAt = state.time.epochMs;
    track.quality = track.qualityPotential;
    track.genre = makeGenre(track.theme, track.mood);
    const queuedRelease = state.releaseQueue.some((entry) => entry.trackId === track.id);
    if (queuedRelease)
        track.status = "Scheduled";
    logEvent(`Track ready${queuedRelease ? " and queued for release" : ""}: "${track.title}" (${qualityGrade(track.quality)}).`);
}
function releaseTrack(track, note, distribution) {
    if (!track || !track.actId || !getAct(track.actId)) {
        if (track && track.status === "Scheduled")
            track.status = "Ready";
        logEvent("Cannot release track: assign an Act first.", "warn");
        return false;
    }
    if (!track.genre) {
        logEvent("Cannot release track without a content genre.", "warn");
        return false;
    }
    ensureEraForTrack(track, "Release");
    track.status = "Released";
    track.releasedAt = state.time.epochMs;
    track.trendAtRelease = state.trends.includes(track.genre);
    track.distribution = distribution || track.distribution || "Digital";
    const act = getAct(track.actId);
    const era = track.eraId ? getEraById(track.eraId) : null;
    const projectName = track.projectName || `${track.title} - Single`;
    const marketEntry = {
        id: uid("MK"),
        trackId: track.id,
        title: track.title,
        label: state.label.name,
        actId: track.actId,
        actName: act ? act.name : "Unknown Act",
        eraId: track.eraId || null,
        eraName: era ? era.name : null,
        projectName,
        isPlayer: true,
        theme: track.theme,
        mood: track.mood,
        alignment: track.alignment,
        country: state.label.country || "Annglora",
        quality: track.quality,
        genre: track.genre,
        distribution: track.distribution,
        releasedAt: track.releasedAt,
        weeksOnChart: 0,
        promoWeeks: 0
    };
    track.marketId = marketEntry.id;
    state.marketTracks.push(marketEntry);
    markCreatorRelease(getTrackCreatorIds(track), track.releasedAt);
    logEvent(`Released "${track.title}" to market${note ? ` (${note})` : ""}.`);
    postTrackRelease(track);
    markRolloutDropsReleasedByTrack(track.id, track.releasedAt);
    return true;
}
function scheduleRelease(track, hoursFromNow, distribution, note) {
    if (!track || !track.actId || !getAct(track.actId)) {
        logEvent("Cannot schedule release: assign an Act first.", "warn");
        return false;
    }
    const isReady = track.status === "Ready";
    const isMastering = isMasteringTrack(track);
    if (!isReady && !isMastering) {
        logEvent("Only Ready or Mastering tracks can be scheduled for release.", "warn");
        return false;
    }
    if (!track.genre && track.theme && track.mood) {
        track.genre = makeGenre(track.theme, track.mood);
    }
    if (!track.genre) {
        logEvent("Cannot schedule release without a content genre.", "warn");
        return false;
    }
    if (state.releaseQueue.some((entry) => entry.trackId === track.id)) {
        logEvent("Track is already scheduled for release.", "warn");
        return false;
    }
    let scheduleHours = Number.isFinite(hoursFromNow) ? hoursFromNow : 0;
    if (scheduleHours <= 0) {
        logEvent("Scheduled releases must target a future time. Defaulting to +1h.", "warn");
        scheduleHours = 1;
    }
    const releaseAt = state.time.epochMs + scheduleHours * HOUR_MS;
    const dist = distribution || "Digital";
    const releaseNote = note || dist;
    state.releaseQueue.push({ id: uid("RL"), trackId: track.id, releaseAt, note: releaseNote, distribution: dist });
    if (isReady)
        track.status = "Scheduled";
    ensureEraForTrack(track, "Release scheduled");
    logEvent(`Scheduled "${track.title}" for release in ${scheduleHours}h.`);
    return true;
}
function scheduleReleaseAt(track, releaseAt, { distribution, note, rolloutMeta, suppressLog = false } = {}) {
    if (!track || !track.actId || !getAct(track.actId)) {
        return { ok: false, reason: "Track missing Act assignment." };
    }
    const isReady = track.status === "Ready";
    const isMastering = isMasteringTrack(track);
    if (!isReady && !isMastering) {
        return { ok: false, reason: "Track not release-ready." };
    }
    if (!track.genre && track.theme && track.mood) {
        track.genre = makeGenre(track.theme, track.mood);
    }
    if (!track.genre) {
        return { ok: false, reason: "Track missing genre." };
    }
    const existing = state.releaseQueue.find((entry) => entry.trackId === track.id);
    if (existing) {
        return { ok: true, alreadyScheduled: true, entry: existing };
    }
    const now = state.time.epochMs;
    if (!Number.isFinite(releaseAt) || releaseAt <= now) {
        return { ok: false, reason: "Release window is in the past." };
    }
    const dist = distribution || track.distribution || "Digital";
    const releaseNote = note || dist;
    const entry = {
        id: uid("RL"),
        trackId: track.id,
        releaseAt,
        note: releaseNote,
        distribution: dist,
        ...(rolloutMeta || {})
    };
    state.releaseQueue.push(entry);
    if (isReady)
        track.status = "Scheduled";
    ensureEraForTrack(track, "Release scheduled");
    if (!suppressLog) {
        logEvent(`Scheduled "${track.title}" for release on ${formatDate(releaseAt)}.`);
    }
    return { ok: true, entry };
}
function processReleaseQueue() {
    const now = state.time.epochMs;
    const remaining = [];
    state.releaseQueue.forEach((entry) => {
        if (entry.releaseAt <= now) {
            const track = getTrack(entry.trackId);
            if (!track)
                return;
            if (track.status === "Released")
                return;
            if (track.status === "Ready" || track.status === "Scheduled") {
                releaseTrack(track, entry.note, entry.distribution);
                return;
            }
            remaining.push(entry);
        }
        else {
            remaining.push(entry);
        }
    });
    state.releaseQueue = remaining;
}
function shouldLogRolloutBlock(item, reason, mode) {
    if (mode === "manual")
        return true;
    if (!item)
        return true;
    if (item.lastAttemptReason !== reason)
        return true;
    const lastAt = Number.isFinite(item.lastAttemptAt) ? item.lastAttemptAt : 0;
    if (!lastAt)
        return true;
    const cooldownMs = ROLLOUT_BLOCK_LOG_COOLDOWN_HOURS * HOUR_MS;
    return state.time.epochMs - lastAt >= cooldownMs;
}
function recordRolloutBlock(item, reason, mode, label) {
    if (!item)
        return;
    item.status = "Blocked";
    item.lastAttemptAt = state.time.epochMs;
    item.lastAttemptReason = reason;
    if (shouldLogRolloutBlock(item, reason, mode)) {
        logEvent(`${label} blocked: ${reason}`, "warn");
    }
}
function markRolloutDropScheduled(drop, scheduledAt) {
    if (!drop)
        return;
    drop.status = "Scheduled";
    drop.scheduledAt = scheduledAt;
    drop.lastAttemptReason = null;
}
function markRolloutDropCompleted(drop, completedAt) {
    if (!drop)
        return;
    drop.status = "Completed";
    drop.completedAt = completedAt;
    drop.lastAttemptReason = null;
}
function markRolloutEventScheduled(eventItem, scheduledAt) {
    if (!eventItem)
        return;
    eventItem.status = "Scheduled";
    eventItem.scheduledAt = scheduledAt;
    eventItem.lastAttemptReason = null;
}
function markRolloutEventCompleted(eventItem, completedAt) {
    if (!eventItem)
        return;
    eventItem.status = "Completed";
    eventItem.completedAt = completedAt;
    eventItem.lastAttemptReason = null;
}
function markRolloutDropsReleasedByTrack(trackId, releasedAt) {
    if (!trackId)
        return;
    ensureRolloutStrategies().forEach((strategy) => {
        strategy.weeks?.forEach((week) => {
            week?.drops?.forEach((drop) => {
                if (drop?.contentId === trackId) {
                    markRolloutDropCompleted(drop, releasedAt);
                }
            });
        });
    });
}
function markRolloutEventStatusFromSchedule(entry) {
    if (!entry?.rolloutStrategyId || !entry?.rolloutItemId)
        return;
    const strategy = getRolloutStrategyById(entry.rolloutStrategyId);
    if (!strategy)
        return;
    strategy.weeks?.forEach((week) => {
        week?.events?.forEach((eventItem) => {
            if (eventItem?.id === entry.rolloutItemId) {
                markRolloutEventCompleted(eventItem, entry.completedAt || entry.scheduledAt);
            }
        });
    });
}
function countScheduledFacilityUsage(facilityId, epochMs) {
    if (!facilityId)
        return 0;
    const start = startOfDayEpochMs(epochMs);
    const end = endOfDayEpochMs(epochMs);
    return ensureScheduledEventsStore().filter((entry) => entry.facilityId === facilityId
        && entry.scheduledAt >= start
        && entry.scheduledAt < end
        && entry.status === "Scheduled").length;
}
function scheduleRolloutDrop(strategy, era, weekIndex, drop, mode) {
    if (!strategy || !drop)
        return { ok: false, skipped: true };
    if (strategy.status === "Archived") {
        recordRolloutBlock(drop, "Strategy is archived.", mode, "Rollout drop");
        return { ok: false, blocked: true };
    }
    if (drop.status === "Completed")
        return { ok: true, completed: true };
    if (drop.status === "Scheduled")
        return { ok: true, alreadyScheduled: true };
    if (!era || era.status !== "Active") {
        recordRolloutBlock(drop, "Era is not active.", mode, "Rollout drop");
        return { ok: false, blocked: true };
    }
    const track = getTrack(drop.contentId);
    if (!track) {
        recordRolloutBlock(drop, "Track not found.", mode, "Rollout drop");
        return { ok: false, blocked: true };
    }
    if (track.status === "Released") {
        markRolloutDropCompleted(drop, track.releasedAt || state.time.epochMs);
        return { ok: true, completed: true };
    }
    const existing = state.releaseQueue.find((entry) => entry.trackId === track.id);
    if (existing) {
        markRolloutDropScheduled(drop, existing.releaseAt);
        return { ok: true, alreadyScheduled: true };
    }
    const isReady = track.status === "Ready";
    const isMastering = isMasteringTrack(track);
    if (!isReady && !isMastering) {
        recordRolloutBlock(drop, "Track not release-ready.", mode, "Rollout drop");
        return { ok: false, blocked: true };
    }
    if (!track.genre && track.theme && track.mood) {
        track.genre = makeGenre(track.theme, track.mood);
    }
    if (!track.genre) {
        recordRolloutBlock(drop, "Track missing genre.", mode, "Rollout drop");
        return { ok: false, blocked: true };
    }
    const baseWeek = Number.isFinite(era.startedWeek) ? era.startedWeek : weekIndex() + 1;
    const weekNumber = baseWeek + Math.max(0, weekIndex);
    const releaseAt = rolloutReleaseTimestampForWeek(weekNumber);
    if (releaseAt <= state.time.epochMs) {
        recordRolloutBlock(drop, "Release window is in the past.", mode, "Rollout drop");
        return { ok: false, blocked: true };
    }
    const result = scheduleReleaseAt(track, releaseAt, {
        distribution: track.distribution,
        note: "Rollout Strategy",
        rolloutMeta: {
            rolloutStrategyId: strategy.id,
            rolloutItemId: drop.id,
            rolloutWeekIndex: weekIndex
        },
        suppressLog: mode !== "manual"
    });
    if (!result.ok) {
        recordRolloutBlock(drop, result.reason || "Release scheduling failed.", mode, "Rollout drop");
        return { ok: false, blocked: true };
    }
    markRolloutDropScheduled(drop, result.entry?.releaseAt || releaseAt);
    return { ok: true, scheduled: true };
}
function scheduleRolloutEvent(strategy, era, weekIndex, eventItem, eventIndex, mode) {
    if (!strategy || !eventItem)
        return { ok: false, skipped: true };
    if (strategy.status === "Archived") {
        recordRolloutBlock(eventItem, "Strategy is archived.", mode, "Rollout event");
        return { ok: false, blocked: true };
    }
    if (eventItem.status === "Completed")
        return { ok: true, completed: true };
    if (eventItem.status === "Scheduled")
        return { ok: true, alreadyScheduled: true };
    if (!era || era.status !== "Active") {
        recordRolloutBlock(eventItem, "Era is not active.", mode, "Rollout event");
        return { ok: false, blocked: true };
    }
    if (!eventItem.actionType) {
        recordRolloutBlock(eventItem, "Event action type missing.", mode, "Rollout event");
        return { ok: false, blocked: true };
    }
    let track = null;
    if (eventItem.contentId) {
        track = getTrack(eventItem.contentId);
        if (!track) {
            recordRolloutBlock(eventItem, "Event content not found.", mode, "Rollout event");
            return { ok: false, blocked: true };
        }
        if (track.status !== "Released" || !track.marketId) {
            recordRolloutBlock(eventItem, "Event requires a released track.", mode, "Rollout event");
            return { ok: false, blocked: true };
        }
    }
    const baseWeek = Number.isFinite(era.startedWeek) ? era.startedWeek : weekIndex() + 1;
    const weekNumber = baseWeek + Math.max(0, weekIndex);
    const eventAt = rolloutEventTimestampForWeek(weekNumber, eventIndex);
    if (eventAt <= state.time.epochMs) {
        recordRolloutBlock(eventItem, "Event window is in the past.", mode, "Rollout event");
        return { ok: false, blocked: true };
    }
    const existing = ensureScheduledEventsStore().find((entry) => entry.rolloutItemId === eventItem.id);
    if (existing) {
        markRolloutEventScheduled(eventItem, existing.scheduledAt);
        return { ok: true, alreadyScheduled: true };
    }
    const facilityId = getPromoFacilityForType(eventItem.actionType);
    if (facilityId) {
        const dayIndex = getUtcDayIndex(eventAt);
        const capacity = facilityId === "broadcast"
            ? (BROADCAST_SLOT_SCHEDULE[dayIndex] || 0)
            : FILMING_STUDIO_SLOTS;
        const used = countScheduledFacilityUsage(facilityId, eventAt);
        if (used >= capacity) {
            recordRolloutBlock(eventItem, `No ${promoFacilityLabel(facilityId)} slots available on ${DAYS[dayIndex]}.`, mode, "Rollout event");
            return { ok: false, blocked: true };
        }
    }
    const entry = {
        id: uid("SE"),
        scheduledAt: eventAt,
        actionType: eventItem.actionType,
        contentId: eventItem.contentId || null,
        actId: strategy.actId,
        eraId: strategy.eraId,
        status: "Scheduled",
        facilityId: facilityId || null,
        rolloutStrategyId: strategy.id,
        rolloutItemId: eventItem.id,
        rolloutWeekIndex: weekIndex
    };
    ensureScheduledEventsStore().push(entry);
    markRolloutEventScheduled(eventItem, eventAt);
    if (mode === "manual") {
        logEvent(`Scheduled rollout event: ${rolloutEventLabel(eventItem.actionType)} on ${formatDate(eventAt)}.`);
    }
    return { ok: true, scheduled: true };
}
function expandRolloutStrategy(strategyId, { mode = "manual" } = {}) {
    const strategy = getRolloutStrategyById(strategyId);
    if (!strategy) {
        if (mode === "manual")
            logEvent("Rollout strategy not found.", "warn");
        return null;
    }
    const era = getEraById(strategy.eraId);
    if (!era) {
        if (mode === "manual")
            logEvent("Rollout strategy requires an active era.", "warn");
        return null;
    }
    let scheduled = 0;
    let blocked = 0;
    let completed = 0;
    let alreadyScheduled = 0;
    const weeks = Array.isArray(strategy.weeks) ? strategy.weeks : [];
    weeks.forEach((week, weekIndex) => {
        const drops = Array.isArray(week?.drops) ? week.drops : [];
        const events = Array.isArray(week?.events) ? week.events : [];
        drops.forEach((drop) => {
            const result = scheduleRolloutDrop(strategy, era, weekIndex, drop, mode);
            if (result?.scheduled)
                scheduled += 1;
            else if (result?.completed)
                completed += 1;
            else if (result?.alreadyScheduled)
                alreadyScheduled += 1;
            else if (result?.blocked)
                blocked += 1;
        });
        events.forEach((eventItem, eventIndex) => {
            const result = scheduleRolloutEvent(strategy, era, weekIndex, eventItem, eventIndex, mode);
            if (result?.scheduled)
                scheduled += 1;
            else if (result?.completed)
                completed += 1;
            else if (result?.alreadyScheduled)
                alreadyScheduled += 1;
            else if (result?.blocked)
                blocked += 1;
        });
    });
    if (scheduled > 0 && strategy.status === "Draft")
        strategy.status = "Active";
    if (mode === "manual") {
        const summary = `Rollout expanded: ${scheduled} scheduled, ${alreadyScheduled} already scheduled, ${completed} completed, ${blocked} blocked.`;
        logEvent(summary);
    }
    return { scheduled, alreadyScheduled, completed, blocked };
}
function runAutoRolloutStrategies() {
    const strategies = ensureRolloutStrategies().filter((strategy) => strategy.autoRun && strategy.status !== "Archived");
    strategies.forEach((strategy) => {
        expandRolloutStrategy(strategy.id, { mode: "auto" });
    });
}
function processScheduledEvents() {
    const now = state.time.epochMs;
    const entries = ensureScheduledEventsStore();
    entries.forEach((entry) => {
        if (entry.status !== "Scheduled")
            return;
        if (!Number.isFinite(entry.scheduledAt))
            return;
        if (entry.scheduledAt > now)
            return;
        entry.status = "Completed";
        entry.completedAt = now;
        const track = entry.contentId ? getTrack(entry.contentId) : null;
        const label = rolloutEventLabel(entry.actionType);
        const detail = track ? ` for "${track.title}"` : "";
        logEvent(`Scheduled event executed: ${label}${detail}.`);
        markRolloutEventStatusFromSchedule(entry);
    });
}
function scoreTrack(track, regionName) {
    const region = REGION_PROFILES[regionName] || NATION_PROFILES[regionName] || NATION_PROFILES.Annglora;
    let score = track.quality;
    score += track.alignment === region.alignment ? 12 : -6;
    score += track.theme === region.theme ? 8 : 0;
    score += region.moods.includes(track.mood) ? 6 : 0;
    score += state.trends.includes(track.genre) ? 10 : 0;
    score += track.promoWeeks > 0 ? 10 : 0;
    score += rand(-4, 4);
    const decay = Math.max(0.4, 1 - track.weeksOnChart * 0.05);
    return Math.round(score * decay);
}
function roundToAudienceChunk(value) {
    const chunk = 1000;
    return Math.ceil(Math.max(0, value) / chunk) * chunk;
}
function normalizeChartWeights(weights) {
    const safe = weights || CHART_WEIGHTS;
    const total = Math.max(0, safe.sales || 0)
        + Math.max(0, safe.streaming || 0)
        + Math.max(0, safe.airplay || 0)
        + Math.max(0, safe.social || 0);
    if (!total)
        return { ...CHART_WEIGHTS };
    return {
        sales: Math.max(0, safe.sales || 0) / total,
        streaming: Math.max(0, safe.streaming || 0) / total,
        airplay: Math.max(0, safe.airplay || 0) / total,
        social: Math.max(0, safe.social || 0) / total
    };
}
function blendChartWeights(primary, secondary, primaryShare) {
    const a = normalizeChartWeights(primary);
    const b = normalizeChartWeights(secondary);
    const share = clamp(primaryShare, 0, 1);
    return normalizeChartWeights({
        sales: a.sales * share + b.sales * (1 - share),
        streaming: a.streaming * share + b.streaming * (1 - share),
        airplay: a.airplay * share + b.airplay * (1 - share),
        social: a.social * share + b.social * (1 - share)
    });
}
function chartWeightsForRegion(regionId) {
    const regionWeights = REGION_CONSUMPTION_WEIGHTS?.[regionId];
    return normalizeChartWeights(regionWeights || CHART_WEIGHTS);
}
function chartWeightsForNation(nation) {
    const regions = REGION_DEFS.filter((region) => region.nation === nation);
    if (!regions.length)
        return normalizeChartWeights(CHART_WEIGHTS);
    const capital = regions.find((region) => region.id.includes("Capital")) || regions[0];
    const elsewhere = regions.find((region) => region.id.includes("Elsewhere")) || regions[1] || capital;
    return blendChartWeights(chartWeightsForRegion(capital.id), chartWeightsForRegion(elsewhere.id), REGION_CAPITAL_SHARE);
}
function chartWeightsForGlobal() {
    const snapshot = computePopulationSnapshot();
    const total = snapshot.total || 0;
    if (!total)
        return normalizeChartWeights(CHART_WEIGHTS);
    const weights = snapshot.nations.reduce((acc, nation) => {
        const share = nation.total / total;
        const nationWeights = chartWeightsForNation(nation.nation);
        acc.sales += nationWeights.sales * share;
        acc.streaming += nationWeights.streaming * share;
        acc.airplay += nationWeights.airplay * share;
        acc.social += nationWeights.social * share;
        return acc;
    }, { sales: 0, streaming: 0, airplay: 0, social: 0 });
    return normalizeChartWeights(weights);
}
function chartWeightsForScope(scopeId) {
    if (scopeId === "global")
        return chartWeightsForGlobal();
    if (NATIONS.includes(scopeId))
        return chartWeightsForNation(scopeId);
    return chartWeightsForRegion(scopeId);
}
function buildChartMetrics(score, weights = CHART_WEIGHTS) {
    const normalized = normalizeChartWeights(weights);
    const base = Math.max(0, score) * 1200;
    return {
        sales: roundToAudienceChunk(base * normalized.sales),
        streaming: roundToAudienceChunk(base * normalized.streaming),
        airplay: roundToAudienceChunk(base * normalized.airplay),
        social: roundToAudienceChunk(base * normalized.social)
    };
}
function trackKey(entry) {
    return entry.trackId || entry.id || entry.title;
}
function updateChartHistory(entry, scope, rank) {
    if (!entry.chartHistory)
        entry.chartHistory = {};
    const history = entry.chartHistory[scope] || { peak: rank, weeks: 0 };
    history.peak = history.peak ? Math.min(history.peak, rank) : rank;
    history.weeks = history.weeks + 1;
    entry.chartHistory[scope] = history;
    return history;
}
function formatShortDate(ms) {
    const d = new Date(ms);
    const month = MONTHS[d.getUTCMonth()] || "Month";
    const day = String(d.getUTCDate()).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${month.slice(0, 3)} ${day}, ${year}`;
}
function formatWeekRangeLabel(week) {
    const start = getStartEpochMsFromState() + (week - 1) * WEEK_HOURS * HOUR_MS;
    const end = start + WEEK_HOURS * HOUR_MS - 1;
    return `Week ${week} | ${formatShortDate(start)} - ${formatShortDate(end)}`;
}
function buildChartSnapshot(scope, entries) {
    const ts = state.time.epochMs;
    const week = weekIndex() + 1;
    return {
        id: `${scope}-${ts}`,
        scope,
        ts,
        week,
        entries: entries.map((entry) => ({
            rank: entry.rank,
            lastRank: entry.lastRank,
            peak: entry.peak,
            woc: entry.woc,
            score: entry.score,
            metrics: entry.metrics,
            trackId: entry.track?.id || entry.track?.trackId || null,
            marketId: entry.track?.marketId || null,
            title: entry.track?.title || "",
            projectName: entry.track?.projectName || "",
            label: entry.track?.label || "",
            actId: entry.track?.actId || null,
            actName: entry.track?.actName || "",
            country: entry.track?.country || "",
            theme: entry.track?.theme || "",
            mood: entry.track?.mood || "",
            alignment: entry.track?.alignment || "",
            genre: entry.track?.genre || "",
            projectType: entry.track?.projectType || "",
            distribution: entry.track?.distribution || "",
            isPlayer: !!entry.track?.isPlayer
        }))
    };
}
let chartWorker = null;
let chartWorkerRequestId = 0;
const chartWorkerRequests = new Map();
function rejectChartWorkerRequests(error) {
    chartWorkerRequests.forEach((entry) => entry.reject(error));
    chartWorkerRequests.clear();
}
function getChartWorker() {
    if (chartWorker || typeof Worker === "undefined")
        return chartWorker;
    try {
        chartWorker = new Worker(new URL("./chartWorker.js", import.meta.url), { type: "module" });
        chartWorker.addEventListener("message", (event) => {
            const message = event?.data || {};
            const pending = chartWorkerRequests.get(message.id);
            if (!pending)
                return;
            chartWorkerRequests.delete(message.id);
            if (message.type === "chartsComputed" || message.type === "snapshotsPersisted") {
                pending.resolve(message.payload);
                return;
            }
            pending.reject(new Error("Unknown chart worker response."));
        });
        chartWorker.addEventListener("messageerror", (event) => {
            console.error("Chart worker message error:", event);
            rejectChartWorkerRequests(new Error("Chart worker message error."));
        });
        chartWorker.addEventListener("error", (event) => {
            console.error("Chart worker error:", event);
            rejectChartWorkerRequests(new Error("Chart worker error."));
        });
    }
    catch (error) {
        console.error("Chart worker init failed:", error);
        chartWorker = null;
    }
    return chartWorker;
}
function requestChartWorker(type, payload) {
    const worker = getChartWorker();
    if (!worker)
        return Promise.reject(new Error("Chart worker unavailable."));
    chartWorkerRequestId += 1;
    const id = chartWorkerRequestId;
    return new Promise((resolve, reject) => {
        chartWorkerRequests.set(id, { resolve, reject });
        worker.postMessage({ type, id, payload });
    });
}
function queueChartSnapshotPersistence(snapshots) {
    if (!Array.isArray(snapshots) || !snapshots.length)
        return false;
    const worker = getChartWorker();
    if (worker) {
        requestChartWorker("persistSnapshots", { snapshots }).catch(() => {
            snapshots.forEach((snapshot) => {
                storeChartSnapshot(snapshot).catch(() => { });
            });
        });
        return true;
    }
    snapshots.forEach((snapshot) => {
        storeChartSnapshot(snapshot).catch(() => { });
    });
    return true;
}
function buildChartWorkerPayload() {
    const trackMap = new Map();
    const tracks = [];
    state.marketTracks.forEach((track) => {
        const key = trackKey(track);
        trackMap.set(key, track);
        tracks.push({
            key,
            quality: track.quality,
            alignment: track.alignment,
            theme: track.theme,
            mood: track.mood,
            genre: track.genre,
            promoWeeks: track.promoWeeks,
            weeksOnChart: track.weeksOnChart
        });
    });
    const nationWeights = {};
    const regionWeights = {};
    NATIONS.forEach((nation) => {
        nationWeights[nation] = chartWeightsForNation(nation);
    });
    REGION_DEFS.forEach((region) => {
        regionWeights[region.id] = chartWeightsForRegion(region.id);
    });
    return {
        payload: {
            tracks,
            nations: NATIONS,
            regionIds: REGION_DEFS.map((region) => region.id),
            chartSizes: CHART_SIZES,
            weights: {
                global: chartWeightsForGlobal(),
                nations: nationWeights,
                regions: regionWeights
            },
            profiles: { nations: NATION_PROFILES, regions: REGION_PROFILES },
            trends: state.trends,
            defaultWeights: CHART_WEIGHTS
        },
        trackMap
    };
}
function applyChartWorkerResults(result, trackMap) {
    const charts = result?.charts || {};
    const globalScores = [];
    NATIONS.forEach((nation) => {
        const prev = state.charts.nations[nation] || [];
        const ordered = Array.isArray(charts.nations?.[nation]) ? charts.nations[nation] : [];
        state.charts.nations[nation] = ordered.map((entry, index) => {
            const track = trackMap.get(entry.key);
            if (!track)
                return null;
            const prevEntry = prev.find((p) => trackKey(p.track) === entry.key);
            const history = updateChartHistory(track, nation, index + 1);
            return {
                rank: index + 1,
                lastRank: prevEntry ? prevEntry.rank : null,
                peak: history.peak,
                woc: history.weeks,
                track,
                score: entry.score,
                metrics: entry.metrics
            };
        }).filter(Boolean);
    });
    REGION_DEFS.forEach((region) => {
        const prev = state.charts.regions[region.id] || [];
        const ordered = Array.isArray(charts.regions?.[region.id]) ? charts.regions[region.id] : [];
        state.charts.regions[region.id] = ordered.map((entry, index) => {
            const track = trackMap.get(entry.key);
            if (!track)
                return null;
            const prevEntry = prev.find((p) => trackKey(p.track) === entry.key);
            const history = updateChartHistory(track, region.id, index + 1);
            return {
                rank: index + 1,
                lastRank: prevEntry ? prevEntry.rank : null,
                peak: history.peak,
                woc: history.weeks,
                track,
                score: entry.score,
                metrics: entry.metrics
            };
        }).filter(Boolean);
    });
    const prevGlobal = state.charts.global || [];
    const orderedGlobal = Array.isArray(charts.global) ? charts.global : [];
    state.charts.global = orderedGlobal.map((entry, index) => {
        const track = trackMap.get(entry.key);
        if (!track)
            return null;
        const prevEntry = prevGlobal.find((p) => trackKey(p.track) === entry.key);
        const history = updateChartHistory(track, "global", index + 1);
        return {
            rank: index + 1,
            lastRank: prevEntry ? prevEntry.rank : null,
            peak: history.peak,
            woc: history.weeks,
            track,
            score: entry.score,
            metrics: entry.metrics
        };
    }).filter(Boolean);
    (result?.globalScores || []).forEach((entry) => {
        const track = trackMap.get(entry.key);
        if (!track)
            return;
        globalScores.push({ track, score: entry.score, metrics: entry.metrics });
    });
    persistChartHistorySnapshots();
    return { globalScores };
}
function persistChartHistorySnapshots() {
    const week = weekIndex() + 1;
    if (state.meta.chartHistoryLastWeek === week)
        return;
    const snapshots = [];
    snapshots.push(buildChartSnapshot("global", state.charts.global || []));
    NATIONS.forEach((nation) => {
        snapshots.push(buildChartSnapshot(`nation:${nation}`, state.charts.nations[nation] || []));
    });
    REGION_DEFS.forEach((region) => {
        snapshots.push(buildChartSnapshot(`region:${region.id}`, state.charts.regions[region.id] || []));
    });
    if (queueChartSnapshotPersistence(snapshots)) {
        state.meta.chartHistoryLastWeek = week;
    }
}
function archiveMarketTracks(entries) {
    if (!Array.isArray(entries) || !entries.length)
        return;
    if (!Array.isArray(state.meta.marketTrackArchive))
        state.meta.marketTrackArchive = [];
    const now = state.time?.epochMs || Date.now();
    const archived = entries
        .filter(Boolean)
        .map((entry) => ({
        id: entry.id || entry.trackId || uid("MKA"),
        trackId: entry.trackId || null,
        title: entry.title || "",
        label: entry.label || "",
        actId: entry.actId || null,
        actName: entry.actName || "",
        releasedAt: entry.releasedAt || now,
        archivedAt: now,
        genre: entry.genre || "",
        country: entry.country || "",
        chartHistory: entry.chartHistory || {},
    }));
    state.meta.marketTrackArchive = state.meta.marketTrackArchive.concat(archived).slice(-MARKET_TRACK_ARCHIVE_LIMIT);
}
function paginateMarketTracks() {
    if (!Array.isArray(state.marketTracks)) {
        state.marketTracks = [];
        return state.marketTracks;
    }
    const ordered = state.marketTracks.slice().sort((a, b) => (a.releasedAt || 0) - (b.releasedAt || 0));
    const overflow = Math.max(0, ordered.length - MARKET_TRACK_ACTIVE_LIMIT);
    if (overflow > 0) {
        const archived = ordered.slice(0, overflow);
        archiveMarketTracks(archived);
        state.marketTracks = ordered.slice(overflow);
    }
    else {
        state.marketTracks = ordered;
    }
    return state.marketTracks;
}
function computeChartsLocal(marketTracks = paginateMarketTracks()) {
    const nationScores = {};
    const regionScores = {};
    const nationWeights = {};
    const regionWeights = {};
    NATIONS.forEach((nation) => {
        nationScores[nation] = [];
        nationWeights[nation] = chartWeightsForNation(nation);
    });
    REGION_DEFS.forEach((region) => {
        regionScores[region.id] = [];
        regionWeights[region.id] = chartWeightsForRegion(region.id);
    });
    const globalWeights = chartWeightsForGlobal();
    const globalScores = [];
    marketTracks.forEach((track) => {
        let sum = 0;
        NATIONS.forEach((nation) => {
            const score = scoreTrack(track, nation);
            const metrics = buildChartMetrics(score, nationWeights[nation]);
            nationScores[nation].push({ track, score, metrics });
            sum += score;
        });
        const avg = Math.round(sum / NATIONS.length);
        globalScores.push({ track, score: avg, metrics: buildChartMetrics(avg, globalWeights) });
        REGION_DEFS.forEach((region) => {
            const score = scoreTrack(track, region.id);
            regionScores[region.id].push({ track, score, metrics: buildChartMetrics(score, regionWeights[region.id]) });
        });
    });
    NATIONS.forEach((nation) => {
        const prev = state.charts.nations[nation] || [];
        const ordered = nationScores[nation].sort((a, b) => b.score - a.score).slice(0, CHART_SIZES.nation);
        state.charts.nations[nation] = ordered.map((entry, index) => {
            const prevEntry = prev.find((p) => trackKey(p.track) === trackKey(entry.track));
            const history = updateChartHistory(entry.track, nation, index + 1);
            return {
                rank: index + 1,
                lastRank: prevEntry ? prevEntry.rank : null,
                peak: history.peak,
                woc: history.weeks,
                track: entry.track,
                score: entry.score,
                metrics: entry.metrics
            };
        });
    });
    REGION_DEFS.forEach((region) => {
        const prev = state.charts.regions[region.id] || [];
        const ordered = regionScores[region.id].sort((a, b) => b.score - a.score).slice(0, CHART_SIZES.region);
        state.charts.regions[region.id] = ordered.map((entry, index) => {
            const prevEntry = prev.find((p) => trackKey(p.track) === trackKey(entry.track));
            const history = updateChartHistory(entry.track, region.id, index + 1);
            return {
                rank: index + 1,
                lastRank: prevEntry ? prevEntry.rank : null,
                peak: history.peak,
                woc: history.weeks,
                track: entry.track,
                score: entry.score,
                metrics: entry.metrics
            };
        });
    });
    const prevGlobal = state.charts.global || [];
    const orderedGlobal = globalScores.sort((a, b) => b.score - a.score).slice(0, CHART_SIZES.global);
    state.charts.global = orderedGlobal.map((entry, index) => {
        const prevEntry = prevGlobal.find((p) => trackKey(p.track) === trackKey(entry.track));
        const history = updateChartHistory(entry.track, "global", index + 1);
        return {
            rank: index + 1,
            lastRank: prevEntry ? prevEntry.rank : null,
            peak: history.peak,
            woc: history.weeks,
            track: entry.track,
            score: entry.score,
            metrics: entry.metrics
        };
    });
    persistChartHistorySnapshots();
    return { globalScores };
}
async function computeCharts() {
    const worker = getChartWorker();
    if (!worker)
        return computeChartsLocal();
    const { payload, trackMap } = buildChartWorkerPayload();
    try {
        const result = await requestChartWorker("computeCharts", payload);
        if (!result?.charts)
            return computeChartsLocal();
        return applyChartWorkerResults(result, trackMap);
    }
    catch (error) {
        console.error("Chart worker failed, falling back to main thread:", error);
        return computeChartsLocal();
    }
}
function buildGenreRanking(totals) {
    const entries = [];
    THEMES.forEach((theme, themeIndex) => {
        MOODS.forEach((mood, moodIndex) => {
            if (mood === "Boring")
                return;
            const genre = makeGenre(theme, mood);
            entries.push({
                genre,
                score: totals[genre] || 0,
                themeIndex,
                moodIndex
            });
        });
    });
    entries.sort((a, b) => {
        if (b.score !== a.score)
            return b.score - a.score;
        if (a.themeIndex !== b.themeIndex)
            return a.themeIndex - b.themeIndex;
        return a.moodIndex - b.moodIndex;
    });
    return entries.map((entry) => entry.genre);
}
function buildTrendSnapshot(entries) {
    const totals = {};
    const alignmentScores = {};
    (entries || []).forEach((entry) => {
        const track = entry?.track;
        if (!track?.genre)
            return;
        if (track.mood === "Boring")
            return;
        const score = Number.isFinite(entry.score) ? entry.score : 0;
        totals[track.genre] = (totals[track.genre] || 0) + score;
        const alignment = ALIGNMENTS.includes(track.alignment) ? track.alignment : "Neutral";
        if (!alignmentScores[track.genre]) {
            alignmentScores[track.genre] = {};
            ALIGNMENTS.forEach((key) => {
                alignmentScores[track.genre][key] = 0;
            });
        }
        const weight = Math.max(0, score);
        alignmentScores[track.genre][alignment] += weight;
    });
    const ranking = Object.entries(totals)
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0]);
    return { ranking, totals, alignmentScores };
}
function buildTrendLedgerSnapshot(entries, week) {
    const snapshot = buildTrendSnapshot(entries);
    const chartGenres = [];
    const seen = new Set();
    (entries || []).forEach((entry) => {
        const genre = entry?.track?.genre;
        if (!genre || seen.has(genre))
            return;
        seen.add(genre);
        chartGenres.push(genre);
    });
    return {
        week,
        updatedAt: state.time.epochMs,
        totals: snapshot.totals,
        alignmentScores: snapshot.alignmentScores,
        chartGenres
    };
}
function recordTrendLedgerSnapshot(entries) {
    if (!state.trendLedger || typeof state.trendLedger !== "object") {
        state.trendLedger = { weeks: [] };
    }
    const week = weekIndex() + 1;
    const nextSnapshot = buildTrendLedgerSnapshot(entries, week);
    const weeks = Array.isArray(state.trendLedger.weeks) ? state.trendLedger.weeks : [];
    const deduped = weeks.filter((snapshot) => snapshot && snapshot.week !== week);
    deduped.push(nextSnapshot);
    deduped.sort((a, b) => a.week - b.week);
    state.trendLedger.weeks = deduped.slice(-TREND_WINDOW_WEEKS);
}
function aggregateTrendLedger(weeks) {
    const totals = {};
    const alignmentScores = {};
    const chartGenres = new Set();
    (weeks || []).forEach((snapshot) => {
        if (!snapshot)
            return;
        Object.entries(snapshot.totals || {}).forEach(([genre, score]) => {
            totals[genre] = (totals[genre] || 0) + (Number.isFinite(score) ? score : 0);
        });
        Object.entries(snapshot.alignmentScores || {}).forEach(([genre, scores]) => {
            if (!alignmentScores[genre]) {
                alignmentScores[genre] = {};
                ALIGNMENTS.forEach((key) => {
                    alignmentScores[genre][key] = 0;
                });
            }
            ALIGNMENTS.forEach((alignment) => {
                alignmentScores[genre][alignment] += Number(scores?.[alignment] || 0);
            });
        });
        (snapshot.chartGenres || []).forEach((genre) => {
            if (genre)
                chartGenres.add(genre);
        });
    });
    return { totals, alignmentScores, chartGenres: Array.from(chartGenres) };
}
function getTrendLedgerWindow() {
    const weeks = state.trendLedger?.weeks;
    if (!Array.isArray(weeks))
        return [];
    return weeks.slice(-TREND_WINDOW_WEEKS);
}
function refreshTrendsFromLedger() {
    const windowWeeks = getTrendLedgerWindow();
    if (!windowWeeks.length) {
        if (!Array.isArray(state.trendRanking) || !state.trendRanking.length) {
            state.trendRanking = Array.isArray(state.trends) ? state.trends.slice() : [];
        }
        return;
    }
    const aggregate = aggregateTrendLedger(windowWeeks);
    const ranking = Object.entries(aggregate.totals)
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0]);
    if (!ranking.length)
        return;
    state.trendRanking = ranking;
    state.trends = ranking.slice(0, TREND_DETAIL_COUNT);
    state.trendAlignmentScores = aggregate.alignmentScores;
    state.genreRanking = buildGenreRanking(aggregate.totals);
}
function resolveTrendSeedEntries(globalScores) {
    if (Array.isArray(globalScores) && globalScores.length)
        return globalScores;
    if (Array.isArray(state.charts?.global) && state.charts.global.length) {
        return state.charts.global.map((entry) => ({
            track: entry.track,
            score: entry.score,
            metrics: entry.metrics
        }));
    }
    return [];
}
function maybeSeedTrendLedger(globalScores) {
    const mode = getSlotGameMode(state);
    if (!mode?.seeded)
        return false;
    const weeks = state.trendLedger?.weeks;
    if (Array.isArray(weeks) && weeks.length)
        return false;
    const entries = resolveTrendSeedEntries(globalScores);
    if (!entries.length)
        return false;
    recordTrendLedgerSnapshot(entries);
    refreshTrendsFromLedger();
    return true;
}
function defaultTrendNation() {
    const labelCountry = state.label?.country;
    if (labelCountry && NATIONS.includes(labelCountry))
        return labelCountry;
    return NATIONS[0] || "";
}
function defaultTrendRegion() {
    const labelCountry = state.label?.country;
    const regions = Array.isArray(REGION_DEFS) ? REGION_DEFS : [];
    const match = regions.find((region) => region.nation === labelCountry);
    return match ? match.id : regions[0]?.id || "";
}
function normalizeTrendScope() {
    const valid = new Set(["global", "nation", "region"]);
    if (!valid.has(state.ui.trendScopeType))
        state.ui.trendScopeType = "global";
    if (!state.ui.trendScopeTarget)
        state.ui.trendScopeTarget = defaultTrendNation();
    if (state.ui.trendScopeType === "nation") {
        if (!NATIONS.includes(state.ui.trendScopeTarget))
            state.ui.trendScopeTarget = defaultTrendNation();
        return;
    }
    if (state.ui.trendScopeType === "region") {
        const regionIds = REGION_DEFS.map((region) => region.id);
        if (!regionIds.includes(state.ui.trendScopeTarget))
            state.ui.trendScopeTarget = defaultTrendRegion();
    }
}
function trendScopeLabel(scopeType, target) {
    if (scopeType === "nation")
        return target || "Nation";
    if (scopeType === "region") {
        const region = REGION_DEFS.find((entry) => entry.id === target);
        return region ? region.label : target || "Region";
    }
    return "Global (Gaia)";
}
function trendAlignmentLeader(genre, alignmentScores) {
    const scores = alignmentScores?.[genre];
    if (!scores)
        return null;
    let topAlignment = "";
    let topScore = -Infinity;
    let total = 0;
    ALIGNMENTS.forEach((alignment) => {
        const score = scores[alignment] || 0;
        total += score;
        if (score > topScore) {
            topScore = score;
            topAlignment = alignment;
        }
    });
    if (!topAlignment || topScore <= 0 || total <= 0)
        return null;
    return { alignment: topAlignment, share: Math.round((topScore / total) * 100) };
}
function updateEconomy(globalScores) {
    const playerScores = globalScores.filter((entry) => entry.track.isPlayer);
    let revenue = 0;
    playerScores.forEach((entry) => {
        revenue += Math.max(0, entry.score) * 22;
    });
    revenue = Math.round(revenue);
    const difficulty = getGameDifficulty(state.meta?.difficulty);
    revenue = Math.round(revenue * difficulty.revenueMult);
    const ownedSlots = getOwnedStudioSlots();
    const leaseFees = Math.max(0, Math.round(state.economy.leaseFeesWeek || 0));
    const upkeepBase = state.creators.length * 150 + ownedSlots * 600 + leaseFees;
    const upkeep = Math.round(upkeepBase * difficulty.upkeepMult);
    state.label.cash = Math.round(state.label.cash + revenue - upkeep);
    state.economy.lastRevenue = revenue;
    state.economy.lastUpkeep = upkeep;
    state.economy.lastWeek = weekIndex() + 1;
    state.economy.leaseFeesWeek = 0;
    logEvent(`Week ${weekIndex() + 1} report: +${formatMoney(revenue)} revenue, -${formatMoney(upkeep)} upkeep.`);
    postSocial({
        handle: "@eyeriStats",
        title: `Week ${weekIndex() + 1} Market Report`,
        lines: [
            `Revenue ${formatMoney(revenue)} | Upkeep ${formatMoney(upkeep)}`,
            `Net ${formatMoney(revenue - upkeep)}`
        ],
        type: "economy",
        order: 2
    });
}
function updateLabelReach() {
    const chartEntries = (state.charts.global || []).filter((entry) => entry.track.isPlayer);
    const points = chartEntries.reduce((sum, entry) => sum + Math.max(1, CHART_SIZES.global + 1 - entry.rank), 0);
    const snapshot = computePopulationSnapshot();
    const gain = points * 1500 + state.tracks.filter((track) => track.status === "Released").length * 40;
    state.label.fans = clamp(state.label.fans + gain, 0, snapshot.total);
}
function computeLabelScoresFromCharts() {
    const scores = {};
    (state.charts.global || []).forEach((entry) => {
        const points = Math.max(1, CHART_SIZES.global + 1 - entry.rank);
        scores[entry.track.label] = (scores[entry.track.label] || 0) + points;
    });
    return scores;
}
function updateCumulativeLabelPoints(scores) {
    Object.entries(scores).forEach(([label, points]) => {
        state.meta.cumulativeLabelPoints[label] = (state.meta.cumulativeLabelPoints[label] || 0) + points;
    });
}
function updateRivalMomentum(scores) {
    state.rivals.forEach((rival) => {
        const points = scores[rival.name] || 0;
        const momentum = clamp(0.4 + points / (CHART_SIZES.global * 1.5), 0.35, 0.9);
        const bonus = typeof rival.seedBonus === "number" ? rival.seedBonus : 0;
        rival.momentum = clamp(momentum + bonus, 0.35, 0.95);
    });
}
function applyRivalStudioLeaseCosts() {
    const rate = getStudioLeaseRate();
    if (!rate)
        return;
    const hourly = STAGES.reduce((sum, stage) => {
        const hours = Math.max(1, stage.hours || 1);
        return sum + stage.cost / hours;
    }, 0) / STAGES.length;
    const costPerSlotWeek = Math.round(hourly * WEEK_HOURS * rate);
    if (!costPerSlotWeek)
        return;
    const cap = STUDIO_CAP_PER_LABEL;
    state.rivals.forEach((rival) => {
        const ownedSlots = clamp(Math.round(rival.studio?.slots || STARTING_STUDIO_SLOTS), 0, cap);
        const momentum = typeof rival.momentum === "number" ? rival.momentum : 0.35;
        const used = clamp(Math.round(cap * momentum), 0, cap);
        const leased = Math.max(0, used - ownedSlots);
        if (!leased)
            return;
        const cash = typeof rival.cash === "number" ? rival.cash : STARTING_CASH;
        rival.cash = Math.round(cash - leased * costPerSlotWeek);
        if (!rival.wallet)
            rival.wallet = { cash: rival.cash };
        rival.wallet.cash = rival.cash;
    });
}
function topLabelFromScores(scores) {
    const ordered = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    if (!ordered.length)
        return { label: null, points: 0 };
    return { label: ordered[0][0], points: ordered[0][1] };
}
function topCumulativeLabel() {
    const ordered = Object.entries(state.meta.cumulativeLabelPoints || {}).sort((a, b) => b[1] - a[1]);
    if (!ordered.length)
        return { label: null, points: 0 };
    return { label: ordered[0][0], points: ordered[0][1] };
}
function isMonopoly(scores) {
    const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    if (!entries.length)
        return false;
    const total = entries.reduce((sum, entry) => sum + entry[1], 0);
    const [topLabel, topScore] = entries[0];
    const runnerUp = entries[1]?.[1] || 0;
    const share = total ? topScore / total : 0;
    return topLabel === state.label.name && share >= MONOPOLY_SHARE && topScore >= runnerUp * 1.4;
}
function announceWin(reason) {
    if (state.meta.winState)
        return;
    state.meta.winState = { reason, year: currentYear(), exp: state.meta.exp };
    logEvent(`Victory secured: ${reason}.`);
    if (!state.meta.winShown) {
        state.meta.winShown = true;
        showEndScreen("You Won", [
            { title: reason, detail: `EXP ${formatCount(state.meta.exp)} | ${formatDate(state.time.epochMs)}` },
            { title: "Continue Play", detail: "You can keep playing until Year 4000." }
        ]);
    }
}
function archiveLossGame(reason, slotIndex) {
    const now = Date.now();
    const uiLog = loadUiEventLog();
    const start = Number.isFinite(session.uiLogStart) ? session.uiLogStart : 0;
    const uiEvents = start > 0 ? uiLog.slice(start) : uiLog.slice();
    let snapshot = null;
    try {
        snapshot = JSON.parse(JSON.stringify(state));
    }
    catch {
        snapshot = null;
    }
    const entry = {
        id: `loss-${now}`,
        createdAt: now,
        slot: slotIndex || null,
        label: state.label?.name || "Unknown Label",
        result: "loss",
        reason,
        difficulty: state.meta?.difficulty || DEFAULT_GAME_DIFFICULTY,
        year: currentYear(),
        week: weekIndex() + 1,
        exp: state.meta?.exp || 0,
        cash: state.label?.cash ?? 0,
        gameTime: state.time?.epochMs || null,
        savedAt: state.meta?.savedAt || null,
        uiEvents,
        simEvents: Array.isArray(state.events) ? state.events.slice(0) : [],
        snapshot
    };
    const archives = loadLossArchives();
    archives.push(entry);
    archives.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    const pruned = archives.slice(-LOSS_ARCHIVE_LIMIT);
    saveLossArchives(pruned);
    return entry;
}
function finalizeGame(result, reason) {
    if (state.meta.gameOver)
        return;
    const endedSlot = session.activeSlot;
    state.meta.gameOver = { result, reason, year: currentYear(), exp: state.meta.exp };
    setTimeSpeed("pause");
    const title = result === "win" ? "You Won" : "Game Over - You Lost";
    const lines = [
        { title: reason, detail: `EXP ${formatCount(state.meta.exp)} | End ${formatDate(state.time.epochMs)}` }
    ];
    if (result === "loss") {
        lines.push({ title: "Loss archived", detail: `Saved to Loss Archives (last ${LOSS_ARCHIVE_LIMIT}).` });
        const cash = formatMoney(state.label?.cash ?? 0);
        logEvent(`Loss recorded: ${reason} | Week ${weekIndex() + 1} | Year ${currentYear()} | Cash ${cash}.`, "warn");
    }
    lines.push({ title: "Select a new slot", detail: "Pick a game slot in the main menu to keep playing." });
    showEndScreen(title, lines);
    state.meta.endShown = true;
    saveToActiveSlot();
    if (result === "loss") {
        archiveLossGame(reason, endedSlot);
    }
    session.activeSlot = null;
    sessionStorage.removeItem("rls_active_slot");
    openMainMenu();
    renderLossArchives();
}
function applyBailoutIfNeeded() {
    if (state.label.cash > 0)
        return;
    if (state.meta.bailoutUsed) {
        finalizeGame("loss", "Bankruptcy after bailout.");
        return;
    }
    if (state.meta.bailoutPending)
        return;
    state.meta.bailoutPending = true;
    state.time.speed = "pause";
    logEvent("Bailout offer available. Accept to continue or decline to lose the game.", "warn");
    openOverlay("bailoutModal");
}
function acceptBailout() {
    if (state.meta.bailoutUsed || !state.meta.bailoutPending)
        return false;
    state.meta.bailoutUsed = true;
    state.meta.bailoutPending = false;
    state.meta.achievementsLocked = true;
    const difficulty = getGameDifficulty(state.meta?.difficulty);
    state.label.cash = difficulty.bailoutAmount;
    logEvent(`Bailout accepted: debt cleared and ${formatMoney(difficulty.bailoutAmount)} granted. Achievements locked.`, "warn");
    return true;
}
function declineBailout() {
    if (!state.meta.bailoutPending || state.meta.bailoutUsed)
        return false;
    state.meta.bailoutPending = false;
    finalizeGame("loss", "Bankruptcy after declining bailout.");
    return true;
}
function checkWinLoss(scores) {
    if (state.meta.gameOver)
        return;
    const year = currentYear();
    const achievements = Math.max(state.meta.achievementsUnlocked.length, state.meta.achievements || 0);
    const monopoly = isMonopoly(scores);
    if (year < 3000) {
        if (!state.meta.winState && achievements >= ACHIEVEMENT_TARGET && !monopoly) {
            announceWin("Completed 12 CEO Requests without monopoly.");
        }
    }
    else if (year < 4000) {
        if (!state.meta.winState && (achievements >= ACHIEVEMENT_TARGET || monopoly)) {
            announceWin(monopoly ? "Reached monopoly status." : "Completed 12 CEO Requests.");
        }
    }
    if (year >= 4000) {
        const currentTop = topLabelFromScores(scores).label;
        const cumulativeTop = topCumulativeLabel().label;
        const victory = Boolean(state.meta.winState) || monopoly
            || currentTop === state.label.name || cumulativeTop === state.label.name;
        finalizeGame(victory ? "win" : "loss", victory ? "Final Year 4000 verdict." : "Not #1 at Year 4000.");
    }
}
function nextQuestId() {
    state.meta.questIdCounter += 1;
    return `CEO-${String(state.meta.questIdCounter).padStart(2, "0")}`;
}
function makeQuest(template, existingTypes) {
    const week = weekIndex() + 1;
    return template(week, existingTypes);
}
function questTemplates() {
    return [
        (week) => {
            const target = clamp(2 + Math.floor(week / 4), 2, 8);
            const startCount = state.tracks.filter((track) => track.status === "Released").length;
            return {
                id: nextQuestId(),
                type: "releaseCount",
                target,
                progress: 0,
                startCount,
                reward: 1500 + target * 650,
                expReward: 300 + target * 40,
                story: "CEO Directive: Gaia wants fresh releases to keep the charts alive.",
                text: `Release ${target} tracks this cycle`,
                done: false,
                rewarded: false
            };
        },
        () => {
            const genre = state.trends.length ? pickOne(state.trends) : makeGenre(pickOne(THEMES), pickOne(MOODS));
            return {
                id: nextQuestId(),
                type: "trendRelease",
                target: 1,
                progress: 0,
                genre,
                createdAt: state.time.epochMs,
                reward: 3200,
                expReward: 420,
                story: `Topoda Charts tip: deliver a ${formatGenreKeyLabel(genre)} track to steer the week.`,
                text: `Release 1 track in ${formatGenreKeyLabel(genre)}`,
                done: false,
                rewarded: false
            };
        },
        () => {
            const countries = ["Annglora", "Bytenza", "Crowlya"];
            const country = pickOne(countries);
            const target = Math.random() < 0.5 ? 10 : 5;
            return {
                id: nextQuestId(),
                type: "countryTop",
                country,
                target,
                bestRank: null,
                reward: target <= 5 ? 5200 : 3600,
                expReward: target <= 5 ? 520 : 420,
                story: `${country} Critics Council is watching your next move.`,
                text: `Land a track in ${country} Top ${target}`,
                done: false,
                rewarded: false
            };
        },
        (week) => ({
            id: nextQuestId(),
            type: "cash",
            target: 65000 + week * 2500,
            progress: 0,
            reward: 2400,
            expReward: 360,
            story: "eyeriS Corp wants proof of sustainable cashflow this quarter.",
            text: "Reach a cash milestone",
            done: false,
            rewarded: false
        })
    ];
}
function buildQuests() {
    const pool = questTemplates();
    const quests = [];
    while (quests.length < 3) {
        const template = pickOne(pool);
        quests.push(makeQuest(template, quests.map((quest) => quest.type)));
    }
    return quests;
}
function updateQuests() {
    const released = state.tracks.filter((track) => track.status === "Released");
    state.quests.forEach((quest) => {
        if (quest.type === "releaseCount") {
            quest.progress = released.length - quest.startCount;
            quest.done = quest.progress >= quest.target;
        }
        if (quest.type === "trendRelease") {
            quest.progress = released.filter((track) => track.genre === quest.genre && track.releasedAt >= quest.createdAt).length;
            quest.done = quest.progress >= quest.target;
        }
        if (quest.type === "countryTop") {
            const entries = state.charts.nations[quest.country] || [];
            const playerEntry = entries.find((entry) => entry.track.isPlayer);
            quest.bestRank = playerEntry ? playerEntry.rank : quest.bestRank;
            quest.done = quest.bestRank !== null && quest.bestRank <= quest.target;
        }
        if (quest.type === "cash") {
            quest.progress = state.label.cash;
            quest.done = quest.progress >= quest.target;
        }
        if (quest.done && !quest.rewarded) {
            quest.rewarded = true;
            state.label.cash += quest.reward;
            const expGain = Math.round(quest.expReward ?? (quest.reward / 8));
            awardExp(expGain, null, true);
            logEvent(`Quest complete: ${quest.id}. Reward +${formatMoney(quest.reward)} and ${expGain} EXP.`);
            postQuestComplete(quest);
        }
    });
}
function refreshQuestPool() {
    const active = state.quests.filter((quest) => !quest.done);
    const pool = questTemplates();
    const newQuests = [];
    while (active.length < 3) {
        const template = pickOne(pool);
        const quest = makeQuest(template, active.map((quest) => quest.type));
        active.push(quest);
        newQuests.push(quest);
    }
    state.quests = active;
    newQuests.forEach((quest) => postQuestEmail(quest));
}
function ageMarketTracks() {
    const archived = [];
    state.marketTracks.forEach((track) => {
        track.weeksOnChart += 1;
        track.promoWeeks = Math.max(0, track.promoWeeks - 1);
    });
    state.marketTracks = state.marketTracks.filter((track) => {
        if (track.weeksOnChart > 12) {
            archived.push(track);
            return false;
        }
        return true;
    });
    archiveMarketTracks(archived);
    paginateMarketTracks();
}
const HUSK_STARTERS = [
    {
        id: "starter-lite",
        label: "Starter Lite",
        source: "starter",
        cadence: [
            { kind: "release", weekOffset: 0 },
            { kind: "promo", weekOffset: 0, day: HUSK_PROMO_DAY, hour: HUSK_PROMO_HOUR, promoType: HUSK_PROMO_DEFAULT_TYPE }
        ],
        eligibleCategories: { releases: ["Single"], promos: [HUSK_PROMO_DEFAULT_TYPE] },
        context: { alignmentTags: ALIGNMENTS.slice(), trendTags: [], outcomeScore: 38 }
    },
    {
        id: "starter-pulse",
        label: "Starter Pulse",
        source: "starter",
        cadence: [
            { kind: "release", weekOffset: 0 },
            { kind: "promo", weekOffset: 0, day: HUSK_PROMO_DAY, hour: HUSK_PROMO_HOUR, promoType: HUSK_PROMO_DEFAULT_TYPE },
            { kind: "release", weekOffset: 1 },
            { kind: "promo", weekOffset: 1, day: HUSK_PROMO_DAY, hour: HUSK_PROMO_HOUR, promoType: HUSK_PROMO_DEFAULT_TYPE }
        ],
        eligibleCategories: { releases: ["Single"], promos: [HUSK_PROMO_DEFAULT_TYPE] },
        context: { alignmentTags: ALIGNMENTS.slice(), trendTags: [], outcomeScore: 45 }
    },
    {
        id: "starter-surge",
        label: "Starter Surge",
        source: "starter",
        cadence: [
            { kind: "release", weekOffset: 0 },
            { kind: "promo", weekOffset: 0, day: HUSK_PROMO_DAY, hour: HUSK_PROMO_HOUR, promoType: "musicVideo" },
            { kind: "release", weekOffset: 2 },
            { kind: "promo", weekOffset: 2, day: HUSK_PROMO_DAY, hour: HUSK_PROMO_HOUR, promoType: "musicVideo" }
        ],
        eligibleCategories: { releases: ["Single", "EP", "Album"], promos: ["musicVideo"] },
        context: { alignmentTags: ALIGNMENTS.slice(), trendTags: [], outcomeScore: 52 }
    }
];
function normalizeHuskContext(husk) {
    const context = husk?.context || {};
    return {
        alignmentTags: Array.isArray(context.alignmentTags) ? context.alignmentTags.filter(Boolean) : [],
        trendTags: Array.isArray(context.trendTags) ? context.trendTags.filter(Boolean) : [],
        outcomeScore: Number.isFinite(context.outcomeScore) ? clamp(context.outcomeScore, 0, 100) : 0
    };
}
function normalizeHuskCadence(cadence) {
    const list = Array.isArray(cadence) ? cadence : [];
    return list
        .map((step) => ({
        kind: step?.kind === "promo" ? "promo" : "release",
        weekOffset: Number.isFinite(step?.weekOffset) ? Math.max(0, Math.floor(step.weekOffset)) : 0,
        day: Number.isFinite(step?.day) ? clamp(Math.floor(step.day), 0, 6) : HUSK_PROMO_DAY,
        hour: Number.isFinite(step?.hour) ? clamp(Math.floor(step.hour), 0, 23) : HUSK_PROMO_HOUR,
        promoType: step?.promoType || HUSK_PROMO_DEFAULT_TYPE
    }))
        .sort((a, b) => {
        if (a.weekOffset !== b.weekOffset)
            return a.weekOffset - b.weekOffset;
        if (a.kind === b.kind)
            return 0;
        return a.kind === "release" ? -1 : 1;
    });
}
function topTags(list, limit = 3) {
    const counts = {};
    list.forEach((value) => {
        if (!value)
            return;
        counts[value] = (counts[value] || 0) + 1;
    });
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([tag]) => tag);
}
function averageMetric(list, getter, fallback = 0) {
    if (!Array.isArray(list) || !list.length)
        return fallback;
    const total = list.reduce((sum, entry) => sum + getter(entry), 0);
    return total / list.length;
}
function buildEraHusk(era) {
    if (!era || era.status !== "Complete")
        return null;
    const tracks = state.tracks.filter((track) => track.eraId === era.id);
    const marketEntries = state.marketTracks.filter((entry) => entry.eraId === era.id);
    const releaseTimes = [
        ...marketEntries.map((entry) => entry.releasedAt),
        ...tracks.map((track) => track.releasedAt)
    ].filter((stamp) => Number.isFinite(stamp));
    const releaseOffsets = [];
    if (releaseTimes.length) {
        releaseTimes.sort((a, b) => a - b);
        const baseWeek = weekIndexForEpochMs(releaseTimes[0]);
        releaseTimes.forEach((stamp) => {
            const offset = weekIndexForEpochMs(stamp) - baseWeek;
            if (offset >= 0 && !releaseOffsets.includes(offset))
                releaseOffsets.push(offset);
        });
    }
    else if (Array.isArray(era.rolloutWeeks) && era.rolloutWeeks.length) {
        releaseOffsets.push(0);
    }
    if (!releaseOffsets.length)
        return null;
    releaseOffsets.sort((a, b) => a - b);
    const trimmedOffsets = releaseOffsets.slice(0, HUSK_MAX_RELEASE_STEPS);
    const releaseSteps = trimmedOffsets.map((offset) => ({ kind: "release", weekOffset: offset }));
    const promoSteps = trimmedOffsets.map((offset) => ({
        kind: "promo",
        weekOffset: offset,
        day: HUSK_PROMO_DAY,
        hour: HUSK_PROMO_HOUR,
        promoType: HUSK_PROMO_DEFAULT_TYPE
    }));
    const cadence = normalizeHuskCadence([...releaseSteps, ...promoSteps]);
    const genres = [
        ...tracks.map((track) => track.genre),
        ...marketEntries.map((entry) => entry.genre)
    ];
    const alignments = [
        ...tracks.map((track) => track.alignment),
        ...marketEntries.map((entry) => entry.alignment)
    ].filter(Boolean);
    const releaseTypes = Array.from(new Set(tracks.map((track) => track.projectType).filter(Boolean)));
    const qualitySources = tracks.concat(marketEntries);
    const qualityAvg = averageMetric(qualitySources, (entry) => clampQuality(entry.quality || 0), 55);
    const weeksAvg = averageMetric(marketEntries, (entry) => entry.weeksOnChart || 0, 0);
    const peakAvg = averageMetric(marketEntries, (entry) => entry.chartHistory?.global?.peak || 0, 0);
    const peakScore = peakAvg ? clamp(100 - peakAvg, 0, 100) : 50;
    const longevityScore = clamp(weeksAvg * 8, 0, 100);
    const outcomeScore = Math.round(qualityAvg * 0.5 + peakScore * 0.3 + longevityScore * 0.2);
    return {
        id: `era-${era.id}`,
        label: `${era.name} Husk`,
        source: "era",
        cadence,
        eligibleCategories: {
            releases: releaseTypes.length ? releaseTypes : ["Single"],
            promos: [HUSK_PROMO_DEFAULT_TYPE]
        },
        context: {
            alignmentTags: Array.from(new Set(alignments)),
            trendTags: topTags(genres, 4),
            outcomeScore
        }
    };
}
function buildHuskLibrary() {
    const starters = HUSK_STARTERS.map((husk) => ({
        ...husk,
        cadence: normalizeHuskCadence(husk.cadence),
        context: normalizeHuskContext(husk)
    }));
    const eraHusks = Array.isArray(state.era?.history)
        ? state.era.history.map((era) => buildEraHusk(era)).filter(Boolean)
        : [];
    const byId = new Map();
    starters.concat(eraHusks).forEach((husk) => {
        if (!husk?.id)
            return;
        if (!byId.has(husk.id))
            byId.set(husk.id, husk);
    });
    return Array.from(byId.values());
}
function estimateHuskPromoBudget(husk, walletCash) {
    const steps = normalizeHuskCadence(husk?.cadence);
    const promoSteps = steps.filter((step) => step.kind === "promo");
    if (!promoSteps.length)
        return 0;
    const perPromo = computeAutoPromoBudget(walletCash, AI_PROMO_BUDGET_PCT);
    if (!perPromo)
        return Number.POSITIVE_INFINITY;
    return perPromo * promoSteps.length;
}
function scoreHuskForRival(husk, rival, trends) {
    const context = normalizeHuskContext(husk);
    const walletCash = rival.wallet?.cash ?? rival.cash ?? 0;
    const budgetCost = estimateHuskPromoBudget(husk, walletCash);
    const trendList = Array.isArray(trends) ? trends : [];
    let trendScore = 0.35;
    if (trendList.length) {
        if (context.trendTags.length) {
            const matches = context.trendTags.filter((tag) => trendList.includes(tag)).length;
            trendScore = context.trendTags.length ? matches / context.trendTags.length : 0.35;
        }
        else {
            trendScore = 0.45;
        }
    }
    let alignmentScore = 0.5;
    if (context.alignmentTags.length) {
        alignmentScore = context.alignmentTags.includes(rival.alignment) ? 1 : 0;
    }
    const budgetScore = budgetCost === 0
        ? 1
        : budgetCost === Number.POSITIVE_INFINITY
            ? 0
            : clamp(walletCash / budgetCost, 0, 1);
    const outcomeScore = clamp(context.outcomeScore / 100, 0, 1);
    const score = trendScore * 40 + alignmentScore * 30 + budgetScore * 20 + outcomeScore * 10;
    const eligible = budgetCost === 0 || budgetCost <= walletCash;
    return { score, eligible, budgetCost };
}
function selectHuskForRival(rival, husks) {
    const trendList = Array.isArray(state.trends) ? state.trends : [];
    const currentWeek = weekIndex();
    const scored = husks.map((husk) => {
        const { score, eligible } = scoreHuskForRival(husk, rival, trendList);
        const seed = makeStableSeed([currentWeek, rival.id, husk.id]);
        const rng = makeSeededRng(seed);
        return { husk, score, eligible, jitter: rng() * 0.01 };
    });
    const eligible = scored.filter((entry) => entry.eligible);
    const pool = eligible.length ? eligible : scored;
    if (!pool.length)
        return null;
    pool.sort((a, b) => {
        if (a.score !== b.score)
            return b.score - a.score;
        return b.jitter - a.jitter;
    });
    return pool[0].husk;
}
function safeSeededPick(list, rng, fallbackList = []) {
    const pool = Array.isArray(list) && list.length ? list : fallbackList;
    if (!pool.length)
        return "";
    return seededPick(pool, rng);
}
function pickRivalThemeMood(rival, husk, rng) {
    const focusThemes = Array.isArray(rival.focusThemes) && rival.focusThemes.length ? rival.focusThemes : THEMES;
    const focusMoods = Array.isArray(rival.focusMoods) && rival.focusMoods.length ? rival.focusMoods : MOODS;
    let theme = safeSeededPick(focusThemes, rng, THEMES);
    let mood = safeSeededPick(focusMoods, rng, MOODS);
    const trendList = Array.isArray(state.trends) ? state.trends : [];
    if (trendList.length) {
        const context = normalizeHuskContext(husk);
        const trendPool = context.trendTags.length
            ? trendList.filter((genre) => context.trendTags.includes(genre))
            : trendList;
        if (trendPool.length) {
            const trendGenre = seededPick(trendPool, rng);
            const trendTheme = themeFromGenre(trendGenre);
            const trendMood = moodFromGenre(trendGenre);
            if (trendTheme && trendMood && (rivalHasTrendCoverage(rival, trendTheme, trendMood) || rng() < 0.45)) {
                theme = trendTheme;
                mood = trendMood;
            }
        }
    }
    if (!theme)
        theme = safeSeededPick(THEMES, rng, THEMES);
    if (!mood)
        mood = safeSeededPick(MOODS, rng, MOODS);
    return { theme, mood };
}
function hasRivalQueueEntry(label, queueType, targetWeekIndex) {
    return state.rivalReleaseQueue.some((entry) => {
        if (entry.label !== label)
            return false;
        const kind = entry.queueType || "release";
        if (kind !== queueType)
            return false;
        return weekIndexForEpochMs(entry.releaseAt) === targetWeekIndex;
    });
}
function planRivalReleaseEntry({ rival, husk, releaseAt, stepIndex, planWeek }) {
    const seed = makeStableSeed([planWeek, rival.id, husk.id, stepIndex, "release"]);
    const rng = makeSeededRng(seed);
    const { theme, mood } = pickRivalThemeMood(rival, husk, rng);
    const momentum = typeof rival.momentum === "number" ? rival.momentum : 0.5;
    const outcomeBoost = Math.round((normalizeHuskContext(husk).outcomeScore - 50) / 10);
    let quality = clampQuality(seededRand(55, 92, rng) + Math.round(momentum * 8) + outcomeBoost);
    if (mood === "Boring")
        quality = clampQuality(quality - 12);
    const genre = makeGenre(theme, mood);
    const releasePlan = recommendReleasePlan({ genre, quality });
    const crew = pickRivalReleaseCrew(rival, theme, mood);
    return {
        id: uid("RR"),
        queueType: "release",
        huskId: husk.id,
        huskSource: husk.source,
        planWeek,
        releaseAt,
        title: makeTrackTitleByCountrySeeded(theme, mood, rival.country, rng),
        label: rival.name,
        actName: makeRivalActNameSeeded(rng),
        projectName: makeProjectTitleSeeded(rng),
        theme,
        mood,
        alignment: rival.alignment,
        country: rival.country,
        quality,
        genre,
        distribution: releasePlan.distribution,
        creatorIds: crew.map((creator) => creator.id)
    };
}
function planRivalPromoEntry({ rival, husk, promoAt, stepIndex, planWeek, promoType }) {
    const seed = makeStableSeed([planWeek, rival.id, husk.id, stepIndex, "promo"]);
    const rng = makeSeededRng(seed);
    const details = getPromoTypeDetails(promoType);
    return {
        id: uid("RP"),
        queueType: "promo",
        huskId: husk.id,
        huskSource: husk.source,
        planWeek,
        releaseAt: promoAt,
        title: details.label,
        actName: "Promotion",
        label: rival.name,
        promoType,
        promoSeed: rng()
    };
}
function scheduleHuskForRival(rival, husk) {
    if (!husk)
        return;
    const steps = normalizeHuskCadence(husk.cadence);
    if (!steps.length)
        return;
    const now = state.time.epochMs;
    const walletCash = rival.wallet?.cash ?? rival.cash ?? 0;
    const promoBudget = computeAutoPromoBudget(walletCash, AI_PROMO_BUDGET_PCT);
    const planWeek = weekIndex();
    const baseReleaseAt = getReleaseAsapAt(now);
    const baseWeekIndex = weekIndexForEpochMs(baseReleaseAt);
    steps.forEach((step, index) => {
        const weekOffset = Number.isFinite(step.weekOffset) ? Math.max(0, step.weekOffset) : 0;
        const targetWeekIndex = baseWeekIndex + weekOffset;
        if (step.kind === "release") {
            if (hasRivalQueueEntry(rival.name, "release", targetWeekIndex))
                return;
            const releaseAt = baseReleaseAt + weekOffset * WEEK_HOURS * HOUR_MS;
            if (releaseAt <= now)
                return;
            state.rivalReleaseQueue.push(planRivalReleaseEntry({
                rival,
                husk,
                releaseAt,
                stepIndex: index,
                planWeek
            }));
            return;
        }
        if (!promoBudget)
            return;
        if (hasRivalQueueEntry(rival.name, "promo", targetWeekIndex))
            return;
        const weekStart = getStartEpochMsFromState() + targetWeekIndex * WEEK_HOURS * HOUR_MS;
        let promoAt = weekStart + step.day * DAY_MS + step.hour * HOUR_MS;
        while (promoAt <= now) {
            promoAt += WEEK_HOURS * HOUR_MS;
        }
        state.rivalReleaseQueue.push(planRivalPromoEntry({
            rival,
            husk,
            promoAt,
            stepIndex: index,
            planWeek,
            promoType: step.promoType || HUSK_PROMO_DEFAULT_TYPE
        }));
    });
}
function generateRivalReleases() {
    if (!Array.isArray(state.rivals) || !state.rivals.length)
        return;
    const huskLibrary = buildHuskLibrary();
    const fallbackHusk = HUSK_STARTERS[0] || null;
    state.rivals.forEach((rival) => {
        if (!rival)
            return;
        if (!rival.aiPlan)
            rival.aiPlan = { lastPlannedWeek: null, lastHuskId: null, lastPlannedAt: null };
        const currentWeek = weekIndex();
        if (rival.aiPlan.lastPlannedWeek === currentWeek)
            return;
        const husk = selectHuskForRival(rival, huskLibrary) || fallbackHusk;
        if (!husk)
            return;
        scheduleHuskForRival(rival, husk);
        rival.aiPlan.lastPlannedWeek = currentWeek;
        rival.aiPlan.lastHuskId = husk.id;
        rival.aiPlan.lastPlannedAt = state.time.epochMs;
    });
}
function processRivalPromoEntry(entry) {
    const rival = getRivalByName(entry.label);
    if (!rival)
        return false;
    const promoType = entry.promoType || AUTO_PROMO_RIVAL_TYPE;
    const market = pickRivalAutoPromoTrack(rival);
    if (!market || (market.promoWeeks || 0) > 0)
        return false;
    const walletCash = rival.wallet?.cash ?? rival.cash;
    const budget = computeAutoPromoBudget(walletCash, AI_PROMO_BUDGET_PCT);
    if (!budget || walletCash < budget || rival.cash < budget)
        return false;
    const facilityId = getPromoFacilityForType(promoType);
    if (facilityId) {
        const reservation = reservePromoFacilitySlot(facilityId, promoType, market.trackId);
        if (!reservation.ok)
            return false;
    }
    rival.cash -= budget;
    if (!rival.wallet)
        rival.wallet = { cash: rival.cash };
    rival.wallet.cash = rival.cash;
    const boostWeeks = promoWeeksFromBudget(budget);
    market.promoWeeks = Math.max(market.promoWeeks || 0, boostWeeks);
    markRivalPromoActivity(rival.name, state.time.epochMs);
    return true;
}
function processRivalReleaseQueue() {
    if (!Array.isArray(state.rivalReleaseQueue) || !state.rivalReleaseQueue.length)
        return;
    const now = state.time.epochMs;
    const remaining = [];
    state.rivalReleaseQueue.forEach((entry) => {
        if (entry.releaseAt <= now) {
            const queueType = entry.queueType || "release";
            if (queueType === "promo") {
                processRivalPromoEntry(entry);
                return;
            }
            state.marketTracks.push({
                id: uid("MK"),
                trackId: null,
                title: entry.title,
                label: entry.label,
                actId: null,
                actName: entry.actName,
                projectName: entry.projectName,
                isPlayer: false,
                theme: entry.theme,
                mood: entry.mood,
                alignment: entry.alignment,
                country: entry.country,
                quality: entry.quality,
                genre: entry.genre,
                distribution: entry.distribution || "Digital",
                releasedAt: entry.releaseAt,
                weeksOnChart: 0,
                promoWeeks: 0
            });
            markRivalReleaseActivity(entry.label, entry.releaseAt, entry.creatorIds);
        }
        else {
            remaining.push(entry);
        }
    });
    state.rivalReleaseQueue = remaining;
}
function advanceEraWeek() {
    const active = getActiveEras();
    if (!active.length)
        return;
    const stillActive = [];
    active.forEach((era) => {
        if (era.status !== "Active") {
            archiveEra(era, era.status || "Ended");
            return;
        }
        era.weeksElapsed += 1;
        era.stageWeek += 1;
        const stageWeeks = era.rolloutWeeks || ROLLOUT_PRESETS[1].weeks;
        if (era.stageWeek >= stageWeeks[era.stageIndex]) {
            era.stageIndex += 1;
            era.stageWeek = 0;
            if (era.stageIndex >= ERA_STAGES.length) {
                era.status = "Complete";
                era.completedWeek = weekIndex() + 1;
                era.completedAt = state.time.epochMs;
                archiveEra(era, "Complete");
                logEvent(`Era complete: ${era.name}.`);
                postEraComplete(era);
                generateEraRolloutHusk(era);
                return;
            }
            logEvent(`Era shift: ${era.name} moved to ${ERA_STAGES[era.stageIndex]}.`);
        }
        stillActive.push(era);
    });
    state.era.active = stillActive;
}
function runAutoPromoForPlayer() {
    if (!state.meta.autoRollout || !state.meta.autoRollout.enabled)
        return;
    const trackId = state.ui?.promoSlots?.trackId;
    if (!trackId)
        return;
    const track = getTrack(trackId);
    if (!track || track.status !== "Released" || !track.marketId)
        return;
    const era = track.eraId ? getEraById(track.eraId) : null;
    if (!era || era.status !== "Active")
        return;
    const market = state.marketTracks.find((entry) => entry.id === track.marketId);
    if (!market || (market.promoWeeks || 0) > 0)
        return;
    const rawTypes = Array.isArray(state.ui?.promoTypes) && state.ui.promoTypes.length
        ? state.ui.promoTypes
        : [state.ui?.promoType || DEFAULT_PROMO_TYPE];
    const selectedTypes = Array.from(new Set(rawTypes));
    if (!selectedTypes.length)
        return;
    const walletCash = state.label.wallet?.cash ?? state.label.cash;
    const budget = computeAutoPromoBudget(walletCash, autoPromoBudgetPct());
    const totalCost = budget * selectedTypes.length;
    if (!budget || walletCash < totalCost || state.label.cash < totalCost)
        return;
    const facilityNeeds = promoFacilityNeeds(selectedTypes);
    for (const [facilityId, count] of Object.entries(facilityNeeds)) {
        const availability = getPromoFacilityAvailability(facilityId);
        if (availability.available < count)
            return;
    }
    for (const promoType of selectedTypes) {
        const facilityId = getPromoFacilityForType(promoType);
        if (!facilityId)
            continue;
        const reservation = reservePromoFacilitySlot(facilityId, promoType, track.id);
        if (!reservation.ok)
            return;
    }
    state.label.cash -= totalCost;
    if (state.label.wallet)
        state.label.wallet.cash = state.label.cash;
    const boostWeeks = promoWeeksFromBudget(budget);
    market.promoWeeks = Math.max(market.promoWeeks || 0, boostWeeks);
    state.meta.promoRuns = (state.meta.promoRuns || 0) + selectedTypes.length;
    const promoIds = [
        ...(track.creators?.songwriterIds || []),
        ...(track.creators?.performerIds || []),
        ...(track.creators?.producerIds || [])
    ].filter(Boolean);
    markCreatorPromo(promoIds);
    const spendNote = selectedTypes.length > 1 ? `${formatMoney(totalCost)} total` : formatMoney(totalCost);
    logEvent(`Auto promo funded for "${track.title}" (+${boostWeeks} weeks, ${spendNote}).`);
}
function pickRivalAutoPromoTrack(rival) {
    if (!rival)
        return null;
    const candidates = state.marketTracks.filter((entry) => !entry.isPlayer
        && entry.label === rival.name
        && (entry.promoWeeks || 0) <= 0);
    if (!candidates.length)
        return null;
    return candidates.reduce((latest, entry) => {
        const latestStamp = latest?.releasedAt || 0;
        const entryStamp = entry?.releasedAt || 0;
        return entryStamp >= latestStamp ? entry : latest;
    }, candidates[0]);
}
function hasScheduledRivalPromo(rival, weeksAhead = 1) {
    if (!rival)
        return false;
    const now = state.time.epochMs;
    const currentWeek = weekIndexForEpochMs(now);
    const maxWeek = currentWeek + Math.max(0, weeksAhead);
    return state.rivalReleaseQueue.some((entry) => {
        if (entry.label !== rival.name)
            return false;
        const kind = entry.queueType || "release";
        if (kind !== "promo")
            return false;
        if (!Number.isFinite(entry.releaseAt) || entry.releaseAt <= now)
            return false;
        return weekIndexForEpochMs(entry.releaseAt) <= maxWeek;
    });
}
function runAutoPromoForRivals() {
    if (!Array.isArray(state.rivals) || !state.rivals.length)
        return;
    const pct = AI_PROMO_BUDGET_PCT;
    state.rivals.forEach((rival) => {
        if (hasScheduledRivalPromo(rival, 1))
            return;
        const market = pickRivalAutoPromoTrack(rival);
        if (!market)
            return;
        const walletCash = rival.wallet?.cash ?? rival.cash;
        const budget = computeAutoPromoBudget(walletCash, pct);
        if (!budget || walletCash < budget || rival.cash < budget)
            return;
        const promoType = AUTO_PROMO_RIVAL_TYPE;
        const facilityId = getPromoFacilityForType(promoType);
        if (facilityId) {
            const reservation = reservePromoFacilitySlot(facilityId, promoType, market.trackId);
            if (!reservation.ok)
                return;
        }
        rival.cash -= budget;
        if (!rival.wallet)
            rival.wallet = { cash: rival.cash };
        rival.wallet.cash = rival.cash;
        const boostWeeks = promoWeeksFromBudget(budget);
        market.promoWeeks = Math.max(market.promoWeeks || 0, boostWeeks);
        markRivalPromoActivity(rival.name, state.time.epochMs);
    });
}
function maybeRunAutoPromo() {
    runAutoPromoForRivals();
    if (!state.meta.autoRollout || !state.meta.autoRollout.enabled)
        return;
    state.meta.autoRollout.lastCheckedAt = state.time.epochMs;
    runAutoPromoForPlayer();
}
function weeklyUpdate() {
    const week = weekIndex() + 1;
    ensureMarketCreators();
    decayCreatorMarketHeat();
    processCreatorInactivity();
    updateCreatorSkillDecay();
    processRivalCreatorInactivity();
    recruitRivalCreators();
    generateRivalReleases();
    const { globalScores } = computeChartsLocal();
    const labelScores = computeLabelScoresFromCharts();
    updateCumulativeLabelPoints(labelScores);
    updateRivalMomentum(labelScores);
    applyRivalStudioLeaseCosts();
    recordTrendLedgerSnapshot(globalScores);
    updateEconomy(globalScores);
    awardExp(Math.min(300, Math.round(state.economy.lastRevenue / 500)), null, true);
    updateLabelReach();
    updateQuests();
    refreshQuestPool();
    advanceEraWeek();
    ageMarketTracks();
    maybeRunAutoPromo();
    processCreatorDepartures();
    applyBailoutIfNeeded();
    evaluateAchievements();
    checkWinLoss(labelScores);
    renderAll();
    logDuration("weeklyUpdate", startTime, WEEKLY_UPDATE_WARN_MS, `(week ${week})`);
}
async function onYearTick(year) {
    // Annual snapshot and deterministic tie-resolution for awards
    logEvent(`Year ${year} tick.`);
    refreshPopulationSnapshot(year);
    logEvent(`Population update: Year ${year}.`);
    // Recompute charts and label scores to determine annual leader
    const { globalScores } = await computeCharts();
    const labelScores = computeLabelScoresFromCharts();
    updateCumulativeLabelPoints(labelScores);
    captureSeedCalibration(year, labelScores);
    // Determine top labels
    const entries = Object.entries(labelScores).sort((a, b) => b[1] - a[1]);
    if (!entries.length)
        return;
    const topPoints = entries[0][1];
    const tied = entries.filter((e) => e[1] === topPoints).map((e) => e[0]);
    let winner = tied[0];
    let resolvedBy = "score";
    if (tied.length > 1) {
        // Use cumulative points as first tiebreaker
        const cumScores = tied.map((label) => ({ label, points: state.meta.cumulativeLabelPoints[label] || 0 }));
        cumScores.sort((a, b) => b.points - a.points);
        if (cumScores[0].points !== cumScores[1]?.points) {
            winner = cumScores[0].label;
            resolvedBy = "cumulative";
        }
        else {
            // Last resort: deterministic alphabetical order
            winner = tied.sort()[0];
            resolvedBy = "alphabetical";
        }
    }
    state.meta.annualWinners = state.meta.annualWinners || [];
    state.meta.annualWinners.push({ year, label: winner, points: topPoints, resolvedBy });
    logEvent(`Annual Winner ${year}: ${winner} (${formatCount(topPoints)} points) [${resolvedBy}].`);
    postSocial({ handle: "@TopodaCharts", title: `Annual Winner ${year}`, lines: [`${winner} secured the year with ${formatCount(topPoints)} points.`, `Tie-break: ${resolvedBy}`], type: "system", order: 1 });
    // Run end-of-year economy/housekeeping: award EXP, refresh quests
    awardExp(1200, `Year ${year} Season End`, true);
    // Reconcile win/loss state
    checkWinLoss(labelScores);
    // Persist snapshot
    saveToActiveSlot();
}
async function runYearTicksIfNeeded(year) {
    const current = typeof year === "number" ? year : currentYear();
    if (typeof state.time.lastYear === "undefined") {
        state.time.lastYear = current;
        return;
    }
    if (current === state.time.lastYear)
        return;
    for (let y = state.time.lastYear + 1; y <= current; y += 1) {
        try {
            await onYearTick(y);
        }
        catch (e) {
            console.error("onYearTick error:", e);
        }
    }
    state.time.lastYear = current;
}
async function runScheduledWeeklyEvents(now) {
    if (isScheduledTime(now, WEEKLY_SCHEDULE.releaseProcessing)) {
        logEvent("Release day processing window open.");
        processReleaseQueue();
        processRivalReleaseQueue();
    }
    if (isScheduledTime(now, WEEKLY_SCHEDULE.trendsUpdate)) {
        refreshTrendsFromLedger();
        logEvent("Trends refreshed for the week.");
    }
    if (isScheduledTime(now, WEEKLY_SCHEDULE.chartUpdate)) {
        state.lastWeekIndex = weekIndex();
        await weeklyUpdate();
    }
}
function resetDailyUsageForCreators(dayIndex) {
    state.creators.forEach((creator) => resetCreatorDailyUsage(creator, dayIndex));
}
function recordResourceTickSummary(summary) {
    if (!state.resourceTickLedger || typeof state.resourceTickLedger !== "object") {
        state.resourceTickLedger = { hours: [] };
    }
    if (!Array.isArray(state.resourceTickLedger.hours)) {
        state.resourceTickLedger.hours = [];
    }
    state.resourceTickLedger.hours.push({ ts: state.time.epochMs, ...summary });
    state.resourceTickLedger.hours = state.resourceTickLedger.hours.filter(Boolean).slice(-RESOURCE_TICK_LEDGER_LIMIT);
}
function applyHourlyResourceTick(activeOrders = [], dayIndex = null) {
    const busyIds = new Set();
    activeOrders.forEach((order) => {
        getWorkOrderCreatorIds(order).forEach((id) => busyIds.add(id));
    });
    let regenTotal = 0;
    let regenCount = 0;
    state.creators.forEach((creator) => {
        if (busyIds.has(creator.id))
            return;
        const before = creator.stamina;
        creator.stamina = clampStamina(creator.stamina + STAMINA_REGEN_PER_HOUR);
        const delta = creator.stamina - before;
        if (delta > 0) {
            regenTotal += delta;
            regenCount += 1;
        }
    });
    let spendTotal = 0;
    let spendCount = 0;
    let overuseCount = 0;
    let departuresFlagged = 0;
    activeOrders.forEach((order) => {
        const stage = STAGES[order.stageIndex];
        if (!stage)
            return;
        if (!order.staminaTickMeta) {
            const legacyPaid = Boolean(order.staminaPaidUpfront);
            initWorkOrderStaminaMeta(order, stage, { legacyPaid });
        }
        if (order.staminaTickMeta?.legacyPaid)
            return;
        const creatorIds = getWorkOrderCreatorIds(order);
        creatorIds.forEach((id) => {
            const creator = getCreator(id);
            if (!creator)
                return;
            const spent = consumeWorkOrderStaminaSlice(order, stage, creator);
            if (!spent)
                return;
            spendTotal += spent;
            spendCount += 1;
            const result = updateCreatorOveruse(creator, spent, {
                orderId: order.id,
                trackId: order.trackId,
                stageName: stage.name,
                dayIndex
            });
            if (result.strikeApplied)
                overuseCount += 1;
            if (result.departureFlagged)
                departuresFlagged += 1;
        });
    });
    recordResourceTickSummary({
        regenTotal,
        regenCount,
        spendTotal,
        spendCount,
        overuseCount,
        departuresFlagged
    });
    if (regenTotal || spendTotal) {
        logEvent(`Hourly stamina: +${formatCount(regenTotal)} regen (${regenCount} idle) | -${formatCount(spendTotal)} spend (${spendCount} active).`);
    }
}
async function runHourlyTick() {
    const prevDayIndex = Math.floor(state.time.epochMs / DAY_MS);
    state.time.totalHours += 1;
    state.time.epochMs += HOUR_MS;
    const currentDayIndex = Math.floor(state.time.epochMs / DAY_MS);
    const activeOrders = state.workOrders.filter((order) => order.status === "In Progress");
    applyHourlyResourceTick(activeOrders, prevDayIndex);
    if (currentDayIndex !== prevDayIndex) {
        resetDailyUsageForCreators(currentDayIndex);
        refreshDailyMarket();
    }
    processWorkOrders();
    processReleaseQueue();
    processRivalReleaseQueue();
    processScheduledEvents();
    expirePromoFacilityBookings();
    runAutoRolloutStrategies();
    await runScheduledWeeklyEvents(state.time.epochMs);
    runYearTicksIfNeeded(currentYear());
}
let advanceHoursQueue = Promise.resolve();
async function advanceHours(hours, { renderHourly = true, renderAfter = !renderHourly } = {}) {
    if (state.meta.gameOver)
        return;
    if (!Number.isFinite(hours) || hours <= 0)
        return;
    advanceHoursQueue = advanceHoursQueue.then(async () => {
        if (state.meta.gameOver)
            return;
        for (let i = 0; i < hours; i += 1) {
            try {
                await runHourlyTick();
                if (renderHourly)
                    renderAll({ save: false });
            }
            catch (error) {
                console.error("runHourlyTick error:", error);
            }
        }
        if (renderAfter) {
            renderAll({ save: false });
        }
        else if (!renderHourly) {
            renderTime();
        }
    }).catch((error) => {
        console.error("advanceHours error:", error);
    });
    return advanceHoursQueue;
}
async function maybeSyncPausedLiveChanges(now) {
    if (state.time.speed !== "pause")
        return;
    if (!session.activeSlot)
        return;
    if (now - session.lastLiveSyncAt < LIVE_SYNC_INTERVAL_MS)
        return;
    session.lastLiveSyncAt = now;
    const raw = localStorage.getItem(slotKey(session.activeSlot));
    if (!raw || raw === session.lastSlotPayload)
        return;
    let parsed = null;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        return;
    }
    if (!parsed || typeof parsed !== "object")
        return;
    const prevSpeed = state.time.speed;
    const prevView = state.ui?.activeView || null;
    resetState(parsed);
    state.time.speed = prevSpeed;
    if (prevView)
        state.ui.activeView = prevView;
    refreshSelectOptions();
    await computeCharts();
    renderAll({ save: false });
    session.lastSlotPayload = raw;
}
async function tick(now) {
    if (state.time.lastTick === null || Number.isNaN(state.time.lastTick)) {
        state.time.lastTick = now;
        requestAnimationFrame(tick);
        return;
    }
    const frameStart = now;
    const dt = (now - state.time.lastTick) / 1000;
    state.time.lastTick = now;
    let secPerHour = Infinity;
    if (state.time.speed === "play")
        secPerHour = state.time.secPerHourPlay;
    if (state.time.speed === "fast")
        secPerHour = state.time.secPerHourFast;
    if (secPerHour !== Infinity) {
        const queuedIterations = Math.floor(state.time.acc / secPerHour);
        if (queuedIterations > HOURLY_TICK_WARNING_THRESHOLD) {
            console.warn(`[perf] tick queued ${queuedIterations} hourly iterations (speed=${state.time.speed}, acc=${state.time.acc.toFixed(3)}, secPerHour=${secPerHour}).`);
        }
        state.time.acc += dt;
        let iterationsThisFrame = 0;
        while (state.time.acc >= secPerHour && iterationsThisFrame < HOURLY_TICK_FRAME_LIMIT) {
            state.time.acc -= secPerHour;
            advanceHours(1);
        }
    }
    await maybeSyncPausedLiveChanges(now);
    maybeAutoSave();
    requestAnimationFrame(tick);
    logDuration("tick", frameStart, TICK_FRAME_WARN_MS);
}
function maybeAutoSave() {
    if (!session.activeSlot)
        return;
    if (!state.meta.autoSave.enabled)
        return;
    const intervalMs = state.meta.autoSave.minutes * 60000;
    const last = state.meta.autoSave.lastSavedAt || 0;
    if (Date.now() - last < intervalMs)
        return;
    saveToActiveSlot();
    state.meta.autoSave.lastSavedAt = Date.now();
}
function seedMarketTracks({ rng = Math.random, count = 6, dominantLabelId = null } = {}) {
    const rngFn = typeof rng === "function" ? rng : Math.random;
    const dominant = dominantLabelId ? state.rivals.find((rival) => rival.id === dominantLabelId) : null;
    const pickRival = () => {
        if (dominant && rngFn() < 0.45)
            return dominant;
        return seededPick(state.rivals, rngFn);
    };
    for (let i = 0; i < count; i += 1) {
        const rival = pickRival();
        const themePool = rival.focusThemes?.length ? rival.focusThemes : THEMES;
        const moodPool = rival.focusMoods?.length ? rival.focusMoods : MOODS;
        const theme = rngFn() < 0.8 ? seededPick(themePool, rngFn) : seededPick(THEMES, rngFn);
        const mood = rngFn() < 0.8 ? seededPick(moodPool, rngFn) : seededPick(MOODS, rngFn);
        const momentum = typeof rival.momentum === "number" ? rival.momentum : 0.5;
        let quality = clampQuality(seededRand(55, 95, rngFn) + Math.round(momentum * 6));
        if (mood === "Boring")
            quality = clampQuality(quality - 12);
        state.marketTracks.push({
            id: uid("MK"),
            trackId: null,
            title: makeTrackTitleByCountry(theme, mood, rival.country),
            label: rival.name,
            actId: null,
            actName: makeRivalActName(),
            projectName: makeProjectTitle(),
            isPlayer: false,
            theme,
            mood,
            alignment: rival.alignment,
            country: rival.country,
            quality,
            genre: makeGenre(theme, mood),
            weeksOnChart: seededRand(0, 8, rngFn),
            promoWeeks: seededRand(0, 4, rngFn)
        });
    }
}
function slotKey(index) {
    return `${SLOT_PREFIX}${index}`;
}
function getSlotData(index) {
    const raw = localStorage.getItem(slotKey(index));
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
function saveToSlot(index) {
    if (!index)
        return;
    state.meta.savedAt = Date.now();
    if (state.meta.autoSave)
        state.meta.autoSave.lastSavedAt = state.meta.savedAt;
    const payload = JSON.stringify(state);
    localStorage.setItem(slotKey(index), payload);
    if (session.activeSlot === index) {
        session.lastSlotPayload = payload;
    }
}
function saveToActiveSlot() {
    if (!session.activeSlot)
        return;
    saveToSlot(session.activeSlot);
}
function resetState(nextState) {
    Object.assign(state, makeDefaultState(), nextState || {});
    normalizeState();
    state.time.lastTick = null;
    state.time.acc = 0;
}
function seedNewGame(options = {}) {
    const mode = applyGameMode(options.mode || DEFAULT_GAME_MODE);
    applyDifficulty(options.difficulty || DEFAULT_GAME_DIFFICULTY, { resetCash: true });
    const startPrefs = normalizeStartPreferences(options.startPreferences || {});
    state.label.focusThemes = startPrefs.themes;
    state.label.focusMoods = startPrefs.moods;
    const creatorSeedOptions = {
        focusThemes: state.label.focusThemes,
        focusMoods: state.label.focusMoods,
        alignment: state.label.alignment
    };
    const baseCreators = [];
    ["Songwriter", "Performer", "Producer"].forEach((role) => {
        baseCreators.push(makeCreator(role, baseCreators.map((creator) => creator.name), null, creatorSeedOptions));
    });
    state.creators = baseCreators;
    state.marketCreators = buildMarketCreators(creatorSeedOptions);
    ensureMarketCreators(creatorSeedOptions);
    state.rivals = buildRivals();
    state.trends = seedTrends();
    state.trendRanking = state.trends.slice();
    state.trendAlignmentScores = {};
    state.trendLedger = { weeks: [] };
    recruitRivalCreators();
    state.quests = buildQuests();
    state.quests.forEach((quest) => postQuestEmail(quest));
    state.meta.seedInfo = null;
    state.meta.seedHistory = null;
    state.meta.cumulativeLabelPoints = {};
    if (mode.seeded) {
        seedWorldHistory();
    }
    else {
        state.marketTracks = [];
    }
    seedActs();
    syncLabelWallets();
    logEvent("Welcome back, CEO. Your label awaits.");
}
async function loadSlot(index, forceNew = false, options = {}) {
    try {
        const data = forceNew ? null : getSlotData(index);
        resetState(data);
        if (!data)
            seedNewGame({
                mode: options.mode,
                difficulty: options.difficulty,
                startPreferences: options.startPreferences
            });
        session.activeSlot = index;
        session.lastSlotPayload = localStorage.getItem(slotKey(index));
        markUiLogStart();
        sessionStorage.setItem("rls_active_slot", String(index));
        refreshSelectOptions();
        const chartResult = await computeCharts();
        maybeSeedTrendLedger(chartResult?.globalScores);
        renderAll();
        if (!data && typeof window !== "undefined" && typeof window.resetViewLayout === "function") {
            window.resetViewLayout();
        }
        closeMainMenu();
        startGameLoop();
    }
    catch (error) {
        console.error("loadSlot error:", error);
    }
}
function deleteSlot(index) {
    localStorage.removeItem(slotKey(index));
}
function normalizeState() {
    if (!state.ui) {
        state.ui = {
            activeChart: "global",
            trendScopeType: "global",
            trendScopeTarget: defaultTrendNation(),
            genreTheme: "All",
            genreMood: "All",
            slotTarget: null,
            actSlots: { lead: null, member2: null, member3: null },
            trackSlots: {
                actId: null,
                songwriterIds: buildEmptyTrackSlotList("Songwriter"),
                performerIds: buildEmptyTrackSlotList("Performer"),
                producerIds: buildEmptyTrackSlotList("Producer")
            },
            eraSlots: { actId: null },
            promoType: DEFAULT_PROMO_TYPE,
            promoTypes: [DEFAULT_PROMO_TYPE],
            promoSlots: { trackId: null },
            activeView: "charts"
        };
    }
    if (!state.ui.activeChart)
        state.ui.activeChart = "global";
    if (!state.ui.trendScopeType)
        state.ui.trendScopeType = "global";
    if (!state.ui.trendScopeTarget)
        state.ui.trendScopeTarget = defaultTrendNation();
    state.ui.communityRankingLimit = normalizeCommunityRankingLimit(state.ui.communityRankingLimit);
    if (!state.ui.promoType)
        state.ui.promoType = DEFAULT_PROMO_TYPE;
    if (!Array.isArray(state.ui.promoTypes) || !state.ui.promoTypes.length) {
        state.ui.promoTypes = [state.ui.promoType || DEFAULT_PROMO_TYPE];
    }
    else {
        state.ui.promoTypes = state.ui.promoTypes.filter(Boolean);
        if (!state.ui.promoTypes.length) {
            state.ui.promoTypes = [state.ui.promoType || DEFAULT_PROMO_TYPE];
        }
    }
    if (!state.ui.genreTheme)
        state.ui.genreTheme = "All";
    if (!state.ui.genreMood)
        state.ui.genreMood = "All";
    if (!state.ui.actSlots)
        state.ui.actSlots = { lead: null, member2: null, member3: null };
    if (!state.ui.trackSlots) {
        state.ui.trackSlots = {
            actId: null,
            songwriterIds: buildEmptyTrackSlotList("Songwriter"),
            performerIds: buildEmptyTrackSlotList("Performer"),
            producerIds: buildEmptyTrackSlotList("Producer")
        };
    }
    else if (typeof state.ui.trackSlots.songwriterId !== "undefined"
        || typeof state.ui.trackSlots.performerId !== "undefined"
        || typeof state.ui.trackSlots.producerId !== "undefined") {
        const legacy = state.ui.trackSlots;
        state.ui.trackSlots = {
            actId: legacy.actId || null,
            songwriterIds: buildEmptyTrackSlotList("Songwriter"),
            performerIds: buildEmptyTrackSlotList("Performer"),
            producerIds: buildEmptyTrackSlotList("Producer")
        };
        if (legacy.songwriterId)
            state.ui.trackSlots.songwriterIds[0] = legacy.songwriterId;
        if (legacy.performerId)
            state.ui.trackSlots.performerIds[0] = legacy.performerId;
        if (legacy.producerId)
            state.ui.trackSlots.producerIds[0] = legacy.producerId;
    }
    ensureTrackSlotArrays();
    ensureTrackSlotVisibility();
    if (!state.ccc)
        state.ccc = { signLockoutsByCreatorId: {} };
    if (!state.ccc.signLockoutsByCreatorId)
        state.ccc.signLockoutsByCreatorId = {};
    pruneCreatorSignLockouts(Number.isFinite(state.time?.epochMs) ? state.time.epochMs : Date.now());
    if (typeof state.ui.createHelpOpen !== "boolean")
        state.ui.createHelpOpen = false;
    if (typeof state.ui.createAdvancedOpen !== "boolean")
        state.ui.createAdvancedOpen = false;
    if (!state.ui.trackPanelTab
        || (state.ui.trackPanelTab !== "active"
            && state.ui.trackPanelTab !== "archive"
            && state.ui.trackPanelTab !== "history")) {
        state.ui.trackPanelTab = "active";
    }
    if (typeof state.ui.focusEraId === "undefined")
        state.ui.focusEraId = null;
    if (state.ui.focusEraId !== null && typeof state.ui.focusEraId !== "string")
        state.ui.focusEraId = null;
    if (!state.ui.eraSlots)
        state.ui.eraSlots = { actId: null };
    if (!state.ui.promoSlots)
        state.ui.promoSlots = { trackId: null };
    if (!state.ui.socialSlots)
        state.ui.socialSlots = { trackId: null };
    if (typeof state.ui.chartHistoryWeek !== "number")
        state.ui.chartHistoryWeek = null;
    if (typeof state.ui.chartHistorySnapshot === "undefined")
        state.ui.chartHistorySnapshot = null;
    if (!state.meta)
        state.meta = makeDefaultState().meta;
    if (typeof state.meta.chartHistoryLastWeek === "undefined")
        state.meta.chartHistoryLastWeek = null;
    if (!state.ui.viewContext) {
        state.ui.viewContext = {
            actId: null,
            eraId: null,
            releaseId: null,
            projectId: null,
            plannedReleaseIds: [],
            selectedRolloutTemplateId: null,
            rolloutStrategyId: null
        };
    }
    if (!state.ui.eraPlan) {
        state.ui.eraPlan = {
            actId: null,
            goals: "",
            themeTarget: "Any",
            moodTarget: "Any",
            cadence: "Weekly",
            scheduleNote: "",
            rolloutTemplateId: null,
            plannedReleaseIds: []
        };
    }
    if (!state.ui.sidePanelRestore)
        state.ui.sidePanelRestore = {};
    if (!state.ui.activeView)
        state.ui.activeView = "dashboard";
    if (state.ui.activeView === "promotion") {
        state.ui.activeView = "logs";
    }
    else if (state.ui.activeView === "era") {
        state.ui.activeView = "eras";
    }
    if (typeof state.ui.socialShowInternal !== "boolean")
        state.ui.socialShowInternal = false;
    if (!state.ui.socialFilters) {
        state.ui.socialFilters = {
            creator: true,
            quest: true,
            track: true,
            promo: true,
            era: true,
            economy: true,
            system: true,
            chart: true,
            contract: true,
            receipt: true,
            ccc: true
        };
    }
    else {
        const defaults = {
            creator: true,
            quest: true,
            track: true,
            promo: true,
            era: true,
            economy: true,
            system: true,
            chart: true,
            contract: true,
            receipt: true,
            ccc: true
        };
        Object.keys(defaults).forEach((key) => {
            if (typeof state.ui.socialFilters[key] !== "boolean")
                state.ui.socialFilters[key] = defaults[key];
        });
    }
    if (!state.ui.cccFilters) {
        state.ui.cccFilters = {
            Songwriter: true,
            Performer: true,
            Producer: true
        };
    }
    else {
        const defaults = { Songwriter: true, Performer: true, Producer: true };
        Object.keys(defaults).forEach((key) => {
            if (typeof state.ui.cccFilters[key] !== "boolean")
                state.ui.cccFilters[key] = defaults[key];
        });
    }
    if (!state.ui.cccThemeFilter || (state.ui.cccThemeFilter !== "All" && !THEMES.includes(state.ui.cccThemeFilter))) {
        state.ui.cccThemeFilter = "All";
    }
    if (!state.ui.cccMoodFilter || (state.ui.cccMoodFilter !== "All" && !MOODS.includes(state.ui.cccMoodFilter))) {
        state.ui.cccMoodFilter = "All";
    }
    if (!CCC_SORT_OPTIONS.includes(state.ui.cccSort))
        state.ui.cccSort = "default";
    if (!state.ui.studioFilters) {
        state.ui.studioFilters = {
            owned: true,
            unowned: true,
            occupied: true,
            unoccupied: true
        };
    }
    else {
        const defaults = { owned: true, unowned: true, occupied: true, unoccupied: true };
        Object.keys(defaults).forEach((key) => {
            if (typeof state.ui.studioFilters[key] !== "boolean")
                state.ui.studioFilters[key] = defaults[key];
        });
    }
    if (!state.ui.studioOwnerFilter)
        state.ui.studioOwnerFilter = "all";
    if (!state.ui.calendarTab)
        state.ui.calendarTab = "label";
    if (!state.ui.calendarFilters) {
        state.ui.calendarFilters = {
            labelScheduled: true,
            labelReleased: true,
            rivalScheduled: true,
            rivalReleased: true
        };
    }
    else {
        const defaults = {
            labelScheduled: true,
            labelReleased: true,
            rivalScheduled: true,
            rivalReleased: true
        };
        Object.keys(defaults).forEach((key) => {
            if (typeof state.ui.calendarFilters[key] !== "boolean")
                state.ui.calendarFilters[key] = defaults[key];
        });
    }
    if (!Number.isFinite(state.ui.calendarWeekIndex))
        state.ui.calendarWeekIndex = null;
    if (typeof state.ui.slotTarget === "undefined")
        state.ui.slotTarget = null;
    if (!state.ui.createStage || !["sheet", "demo", "master"].includes(state.ui.createStage)) {
        state.ui.createStage = "sheet";
    }
    if (typeof state.ui.createTrackId === "undefined")
        state.ui.createTrackId = null;
    if (!state.ui.createTrackIds || typeof state.ui.createTrackIds !== "object") {
        state.ui.createTrackIds = { demo: state.ui.createTrackId || null, master: null };
    }
    if (typeof state.ui.createTrackIds.demo === "undefined") {
        state.ui.createTrackIds.demo = state.ui.createTrackId || null;
    }
    if (typeof state.ui.createTrackIds.master === "undefined")
        state.ui.createTrackIds.master = null;
    if (!["solo", "collab"].includes(state.ui.recommendAllMode)) {
        state.ui.recommendAllMode = "solo";
    }
    if (!state.studio)
        state.studio = { slots: 2, inUse: 0 };
    if (typeof state.studio.slots !== "number")
        state.studio.slots = 2;
    if (typeof state.studio.inUse !== "number")
        state.studio.inUse = 0;
    state.studio.slots = clamp(Math.round(state.studio.slots), 0, STUDIO_CAP_PER_LABEL);
    state.studio.inUse = Math.max(0, Math.round(state.studio.inUse));
    if (!Array.isArray(state.workOrders))
        state.workOrders = [];
    state.workOrders = state.workOrders.filter(Boolean).map((order) => {
        if (!order.status)
            order.status = "Queued";
        if (typeof order.stageIndex !== "number")
            order.stageIndex = 0;
        const ids = listFromIds(order.creatorIds);
        if (!ids.length && order.creatorId)
            ids.push(order.creatorId);
        order.creatorIds = ids;
        if (order.creatorIds.length)
            order.creatorId = order.creatorIds[0];
        if (order.status !== "In Progress")
            order.studioSlot = null;
        const stage = STAGES[order.stageIndex];
        if (order.status === "In Progress" && stage) {
            if (!order.staminaTickMeta) {
                order.staminaPaidUpfront = true;
                initWorkOrderStaminaMeta(order, stage, { legacyPaid: true });
            }
            else {
                initWorkOrderStaminaMeta(order, stage, { legacyPaid: Boolean(order.staminaTickMeta.legacyPaid) });
            }
        }
        return order;
    });
    syncWorkOrderStudioSlots();
    syncStudioUsage();
    if (!state.acts)
        state.acts = [];
    if (!state.creators)
        state.creators = [];
    state.creators = state.creators.map((creator) => normalizeCreator(creator));
    if (!state.rivals)
        state.rivals = [];
    state.rivals.forEach((rival) => {
        if (typeof rival.seedBonus !== "number")
            rival.seedBonus = 0;
        if (!Array.isArray(rival.creators))
            rival.creators = [];
        if (typeof rival.cash !== "number")
            rival.cash = STARTING_CASH;
        if (!rival.wallet)
            rival.wallet = { cash: rival.cash };
        if (!rival.studio)
            rival.studio = { slots: STARTING_STUDIO_SLOTS };
        if (!rival.aiPlan || typeof rival.aiPlan !== "object") {
            rival.aiPlan = { lastPlannedWeek: null, lastHuskId: null, lastPlannedAt: null };
        }
        if (typeof rival.aiPlan.lastPlannedWeek !== "number")
            rival.aiPlan.lastPlannedWeek = null;
        if (typeof rival.aiPlan.lastHuskId !== "string")
            rival.aiPlan.lastHuskId = null;
        if (typeof rival.aiPlan.lastPlannedAt !== "number")
            rival.aiPlan.lastPlannedAt = null;
    });
    if (!state.trends)
        state.trends = [];
    if (!state.resourceTickLedger || typeof state.resourceTickLedger !== "object") {
        state.resourceTickLedger = { hours: [] };
    }
    if (!Array.isArray(state.resourceTickLedger.hours))
        state.resourceTickLedger.hours = [];
    state.resourceTickLedger.hours = state.resourceTickLedger.hours.filter(Boolean).slice(-RESOURCE_TICK_LEDGER_LIMIT);
    if (!Array.isArray(state.trendRanking)) {
        state.trendRanking = Array.isArray(state.trends) ? state.trends.slice() : [];
    }
    if (!state.trendAlignmentScores || typeof state.trendAlignmentScores !== "object") {
        state.trendAlignmentScores = {};
    }
    if (!state.trendLedger || typeof state.trendLedger !== "object") {
        state.trendLedger = { weeks: [] };
    }
    if (!Array.isArray(state.trendLedger.weeks))
        state.trendLedger.weeks = [];
    state.trendLedger.weeks = state.trendLedger.weeks.filter(Boolean).slice(-TREND_WINDOW_WEEKS);
    if (!state.acts.length && state.creators.length)
        seedActs();
    if (!state.meta)
        state.meta = { savedAt: null, version: STATE_VERSION, questIdCounter: 0 };
    state.meta.version = STATE_VERSION;
    state.meta.difficulty = normalizeDifficultyId(state.meta.difficulty);
    if (typeof state.meta.questIdCounter !== "number")
        state.meta.questIdCounter = 0;
    if (!Array.isArray(state.meta.marketTrackArchive))
        state.meta.marketTrackArchive = [];
    if (!Array.isArray(state.meta.achievementsUnlocked))
        state.meta.achievementsUnlocked = [];
    if (typeof state.meta.achievements !== "number")
        state.meta.achievements = state.meta.achievementsUnlocked.length;
    state.meta.achievements = Math.max(state.meta.achievements, state.meta.achievementsUnlocked.length);
    if (typeof state.meta.achievementsLocked !== "boolean")
        state.meta.achievementsLocked = false;
    if (typeof state.meta.bailoutUsed !== "boolean")
        state.meta.bailoutUsed = false;
    if (typeof state.meta.bailoutPending !== "boolean")
        state.meta.bailoutPending = false;
    if (state.meta.bailoutUsed)
        state.meta.bailoutPending = false;
    if (state.meta.bailoutUsed && !state.meta.achievementsLocked)
        state.meta.achievementsLocked = true;
    if (typeof state.meta.exp !== "number")
        state.meta.exp = 0;
    if (typeof state.meta.promoRuns !== "number")
        state.meta.promoRuns = 0;
    if (!state.meta.cumulativeLabelPoints)
        state.meta.cumulativeLabelPoints = {};
    if (typeof state.meta.winShown !== "boolean")
        state.meta.winShown = false;
    if (typeof state.meta.endShown !== "boolean")
        state.meta.endShown = false;
    if (!state.meta.autoSave)
        state.meta.autoSave = { enabled: false, minutes: 5, lastSavedAt: null };
    if (typeof state.meta.autoSave.minutes !== "number")
        state.meta.autoSave.minutes = 5;
    if (typeof state.meta.autoSave.enabled !== "boolean")
        state.meta.autoSave.enabled = false;
    if (!state.meta.autoRollout) {
        state.meta.autoRollout = { enabled: false, lastCheckedAt: null, budgetPct: AUTO_PROMO_BUDGET_PCT };
    }
    if (typeof state.meta.autoRollout.enabled !== "boolean")
        state.meta.autoRollout.enabled = false;
    if (typeof state.meta.autoRollout.budgetPct !== "number") {
        state.meta.autoRollout.budgetPct = AUTO_PROMO_BUDGET_PCT;
    }
    state.meta.autoRollout.budgetPct = clamp(state.meta.autoRollout.budgetPct, 0, 1);
    if (typeof state.meta.keepEraRolloutHusks !== "boolean")
        state.meta.keepEraRolloutHusks = true;
    if (!state.meta.seedInfo)
        state.meta.seedInfo = null;
    if (!state.meta.seedHistory)
        state.meta.seedHistory = null;
    if (!state.meta.seedCalibration)
        state.meta.seedCalibration = null;
    if (!Array.isArray(state.meta.seedCatalog))
        state.meta.seedCatalog = [];
    if (!state.charts)
        state.charts = { global: [], nations: { Annglora: [], Bytenza: [], Crowlya: [] }, regions: {} };
    if (!state.charts.regions)
        state.charts.regions = {};
    if (!state.economy) {
        state.economy = {
            lastRevenue: 0,
            lastUpkeep: 0,
            lastWeek: 0,
            leaseFeesWeek: 0,
            creatorMarketHeat: { Songwriter: 0, Performer: 0, Producer: 0 }
        };
    }
    if (typeof state.economy.leaseFeesWeek !== "number")
        state.economy.leaseFeesWeek = 0;
    ensureCreatorMarketHeat();
    if (!state.era)
        state.era = { active: [], history: [] };
    if (!Array.isArray(state.era.active)) {
        const legacy = state.era.active ? [state.era.active] : [];
        state.era.active = legacy;
    }
    if (!Array.isArray(state.era.history))
        state.era.history = [];
    state.era.active = state.era.active.filter(Boolean).map((era) => {
        if (!Array.isArray(era.contentTypes))
            era.contentTypes = [];
        if (!Array.isArray(era.contentItems))
            era.contentItems = [];
        if (typeof era.completedWeek !== "number")
            era.completedWeek = null;
        if (typeof era.completedAt !== "number")
            era.completedAt = null;
        if (typeof era.rolloutStrategyId !== "string")
            era.rolloutStrategyId = null;
        if (typeof era.rolloutHuskGenerated !== "boolean")
            era.rolloutHuskGenerated = false;
        return era;
    });
    state.era.history = state.era.history.filter(Boolean).map((era) => {
        if (!Array.isArray(era.contentTypes))
            era.contentTypes = [];
        if (typeof era.completedWeek !== "number")
            era.completedWeek = null;
        if (typeof era.completedAt !== "number")
            era.completedAt = null;
        if (typeof era.rolloutStrategyId !== "string")
            era.rolloutStrategyId = null;
        return era;
    });
    if (!Array.isArray(state.rolloutStrategies))
        state.rolloutStrategies = [];
    state.rolloutStrategies = state.rolloutStrategies.filter(Boolean).map((strategy) => {
        const next = strategy || {};
        if (!next.id)
            next.id = uid("RS");
        if (typeof next.actId !== "string")
            next.actId = next.actId || null;
        if (typeof next.eraId !== "string")
            next.eraId = next.eraId || null;
        if (!Array.isArray(next.weeks) || !next.weeks.length) {
            const era = next.eraId ? getEraById(next.eraId) : null;
            next.weeks = buildRolloutWeeks(rolloutWeekCountFromEra(era));
        }
        if (!next.status)
            next.status = "Draft";
        if (!next.source)
            next.source = "PlayerPlanned";
        if (typeof next.createdAt !== "number")
            next.createdAt = state.time?.epochMs || Date.now();
        if (typeof next.autoRun !== "boolean")
            next.autoRun = false;
        next.weeks = next.weeks.map((week) => {
            const safeWeek = week || {};
            const drops = Array.isArray(safeWeek.drops) ? safeWeek.drops : [];
            const events = Array.isArray(safeWeek.events) ? safeWeek.events : [];
            safeWeek.drops = drops.map((drop) => {
                const nextDrop = drop || {};
                if (!nextDrop.id)
                    nextDrop.id = uid("RD");
                if (!nextDrop.contentType)
                    nextDrop.contentType = "Track";
                if (!nextDrop.status)
                    nextDrop.status = "Planned";
                if (typeof nextDrop.scheduledAt !== "number")
                    nextDrop.scheduledAt = null;
                if (typeof nextDrop.completedAt !== "number")
                    nextDrop.completedAt = null;
                if (typeof nextDrop.lastAttemptAt !== "number")
                    nextDrop.lastAttemptAt = null;
                if (typeof nextDrop.lastAttemptReason !== "string")
                    nextDrop.lastAttemptReason = null;
                return nextDrop;
            });
            safeWeek.events = events.map((eventItem) => {
                const nextEvent = eventItem || {};
                if (!nextEvent.id)
                    nextEvent.id = uid("RE");
                if (!nextEvent.actionType)
                    nextEvent.actionType = DEFAULT_PROMO_TYPE;
                if (!nextEvent.status)
                    nextEvent.status = "Planned";
                if (typeof nextEvent.scheduledAt !== "number")
                    nextEvent.scheduledAt = null;
                if (typeof nextEvent.completedAt !== "number")
                    nextEvent.completedAt = null;
                if (typeof nextEvent.lastAttemptAt !== "number")
                    nextEvent.lastAttemptAt = null;
                if (typeof nextEvent.lastAttemptReason !== "string")
                    nextEvent.lastAttemptReason = null;
                return nextEvent;
            });
            return safeWeek;
        });
        return next;
    });
    if (!Array.isArray(state.scheduledEvents))
        state.scheduledEvents = [];
    state.scheduledEvents = state.scheduledEvents.filter(Boolean).map((entry) => {
        const next = entry || {};
        if (!next.id)
            next.id = uid("SE");
        if (!next.status)
            next.status = "Scheduled";
        if (typeof next.scheduledAt !== "number")
            next.scheduledAt = state.time?.epochMs || Date.now();
        if (typeof next.completedAt !== "number")
            next.completedAt = null;
        if (!next.actionType)
            next.actionType = DEFAULT_PROMO_TYPE;
        if (typeof next.actId !== "string")
            next.actId = next.actId || null;
        if (typeof next.eraId !== "string")
            next.eraId = next.eraId || null;
        if (typeof next.facilityId !== "string")
            next.facilityId = getPromoFacilityForType(next.actionType) || null;
        if (typeof next.rolloutStrategyId !== "string")
            next.rolloutStrategyId = next.rolloutStrategyId || null;
        if (typeof next.rolloutItemId !== "string")
            next.rolloutItemId = next.rolloutItemId || null;
        if (typeof next.rolloutWeekIndex !== "number")
            next.rolloutWeekIndex = null;
        return next;
    });
    if (!state.social)
        state.social = { posts: [] };
    if (!Array.isArray(state.social.posts))
        state.social.posts = [];
    if (!state.promoFacilities || typeof state.promoFacilities !== "object") {
        state.promoFacilities = { broadcast: { bookings: [] }, filming: { bookings: [] } };
    }
    if (!Array.isArray(state.promoFacilities.broadcast?.bookings)) {
        state.promoFacilities.broadcast = { bookings: [] };
    }
    if (!Array.isArray(state.promoFacilities.filming?.bookings)) {
        state.promoFacilities.filming = { bookings: [] };
    }
    state.promoFacilities.broadcast.bookings = state.promoFacilities.broadcast.bookings.filter(Boolean);
    state.promoFacilities.filming.bookings = state.promoFacilities.filming.bookings.filter(Boolean);
    if (!Array.isArray(state.rivalReleaseQueue))
        state.rivalReleaseQueue = [];
    state.rivalReleaseQueue = state.rivalReleaseQueue.filter(Boolean).map((entry) => {
        const next = entry || {};
        const queueType = next.queueType || "release";
        next.queueType = queueType;
        if (queueType === "promo" && !next.promoType)
            next.promoType = AUTO_PROMO_RIVAL_TYPE;
        if (typeof next.releaseAt !== "number")
            next.releaseAt = state.time?.epochMs || Date.now();
        return next;
    });
    if (!state.population)
        state.population = { snapshot: null, lastUpdateYear: 0, lastUpdateAt: null, campaignSplit: null, campaignSplitStage: null };
    if (typeof state.population.lastUpdateYear !== "number") {
        const derivedYear = state.population.lastUpdateAt
            ? new Date(state.population.lastUpdateAt).getUTCFullYear()
            : currentYear();
        state.population.lastUpdateYear = derivedYear;
    }
    if (typeof state.population.lastUpdateAt !== "number")
        state.population.lastUpdateAt = null;
    if (!state.population.campaignSplitStage)
        state.population.campaignSplitStage = null;
    if (state.label && !state.label.country)
        state.label.country = "Annglora";
    if (state.label) {
        if (!Array.isArray(state.label.focusThemes))
            state.label.focusThemes = [];
        if (!Array.isArray(state.label.focusMoods))
            state.label.focusMoods = [];
    }
    normalizeTrendScope();
    if (state.label) {
        state.label.cash = Math.round(state.label.cash ?? 0);
        const snapshot = computePopulationSnapshot();
        state.label.fans = clamp(state.label.fans ?? 0, 0, snapshot.total);
    }
    if (state.marketCreators?.length) {
        state.marketCreators = state.marketCreators.map((creator) => {
            const next = normalizeCreator(creator);
            next.signCost = computeSignCost(next);
            return next;
        });
    }
    if (state.tracks?.length) {
        state.tracks.forEach((track) => {
            if (!track.creators)
                track.creators = {};
            const legacySongwriter = track.creators.songwriterId;
            const legacyPerformer = track.creators.performerId;
            const legacyProducer = track.creators.producerId;
            track.creators.songwriterIds = normalizeRoleIds(track.creators.songwriterIds || (legacySongwriter ? [legacySongwriter] : []), "Songwriter");
            track.creators.performerIds = normalizeRoleIds(track.creators.performerIds || (legacyPerformer ? [legacyPerformer] : []), "Performer");
            track.creators.producerIds = normalizeRoleIds(track.creators.producerIds || (legacyProducer ? [legacyProducer] : []), "Producer");
            track.quality = clampQuality(track.quality ?? 0);
            track.qualityPotential = clampQuality(track.qualityPotential ?? track.quality);
            if (typeof track.trendAtRelease !== "boolean")
                track.trendAtRelease = false;
            if (!track.projectType)
                track.projectType = "Single";
            if (!track.distribution)
                track.distribution = "Digital";
            if (typeof track.stageIndex !== "number") {
                track.stageIndex = track.status === "Ready" ? STAGES.length : 0;
            }
            if (!track.genre && track.theme && track.mood && ["Ready", "Scheduled", "Released"].includes(track.status)) {
                track.genre = makeGenre(track.theme, track.mood);
            }
            if (track.modifier && !track.modifier.id)
                track.modifier = getModifier(track.modifier);
        });
    }
    if (state.marketTracks?.length) {
        state.marketTracks.forEach((entry) => {
            if (!entry.distribution)
                entry.distribution = "Digital";
            if (typeof entry.releasedAt !== "number")
                entry.releasedAt = state.time?.epochMs || Date.now();
            if (typeof entry.isPlayer !== "boolean")
                entry.isPlayer = false;
        });
    }
    if (!Array.isArray(state.releaseQueue))
        state.releaseQueue = [];
    state.releaseQueue = state.releaseQueue.map((entry) => ({
        ...entry,
        distribution: entry.distribution || entry.note || "Digital"
    }));
    const timeDefaults = makeDefaultState().time;
    if (!state.time)
        state.time = { ...timeDefaults };
    state.time = { ...timeDefaults, ...state.time };
    if (state.time.speed !== "pause" && state.time.speed !== "play" && state.time.speed !== "fast") {
        state.time.speed = "pause";
    }
    if (typeof state.time.secPerHourPlay !== "number" || state.time.secPerHourPlay <= 0) {
        state.time.secPerHourPlay = timeDefaults.secPerHourPlay;
    }
    if (typeof state.time.secPerHourFast !== "number" || state.time.secPerHourFast <= 0) {
        state.time.secPerHourFast = timeDefaults.secPerHourFast;
    }
    if (typeof state.time.epochMs !== "number" || Number.isNaN(state.time.epochMs)) {
        state.time.epochMs = timeDefaults.epochMs;
    }
    if (typeof state.time.totalHours !== "number" || Number.isNaN(state.time.totalHours)) {
        state.time.totalHours = timeDefaults.totalHours;
    }
    if (typeof state.time.acc !== "number" || Number.isNaN(state.time.acc)) {
        state.time.acc = 0;
    }
    if (typeof state.time.lastTick === "undefined")
        state.time.lastTick = null;
    if (typeof state.time.lastYear === "undefined" || Number.isNaN(state.time.lastYear)) {
        state.time.lastYear = currentYear();
    }
    if (typeof state.time.startEpochMs !== "number" || Number.isNaN(state.time.startEpochMs)) {
        state.time.startEpochMs = getStartEpochMsFromState();
    }
    if (typeof state.meta.gameMode !== "string") {
        const startYear = state.meta.startYear || new Date(state.time.startEpochMs).getUTCFullYear();
        state.meta.gameMode = startYear >= 2400 ? "modern" : "founding";
        state.meta.startYear = startYear;
    }
    if (typeof state.meta.startYear !== "number") {
        state.meta.startYear = new Date(state.time.startEpochMs).getUTCFullYear();
    }
    syncLabelWallets();
    ensureMarketCreators({}, { replenish: false });
}
function refreshSelectOptions() {
    const labelAlignment = $("labelAlignment");
    if (labelAlignment)
        labelAlignment.innerHTML = ALIGNMENTS.map((a) => `<option value="${a}">${a}</option>`).join("");
    const trackAlignment = $("trackAlignment");
    if (trackAlignment)
        trackAlignment.innerHTML = ALIGNMENTS.map((a) => `<option value="${a}">${a}</option>`).join("");
    const themeSelect = $("themeSelect");
    if (themeSelect)
        themeSelect.innerHTML = THEMES.map((t) => `<option value="${t}">${t}</option>`).join("");
    const moodSelect = $("moodSelect");
    if (moodSelect)
        moodSelect.innerHTML = MOODS.map((m) => `<option value="${m}">${m}</option>`).join("");
    const modifierSelect = $("modifierSelect");
    if (modifierSelect)
        modifierSelect.innerHTML = MODIFIERS.map((mod) => `<option value="${mod.id}">${mod.label}</option>`).join("");
    const actTypeSelect = $("actTypeSelect");
    if (actTypeSelect)
        actTypeSelect.innerHTML = ACT_TYPES.map((type) => `<option value="${type}">${type}</option>`).join("");
    const actAlignmentSelect = $("actAlignmentSelect");
    if (actAlignmentSelect)
        actAlignmentSelect.innerHTML = ALIGNMENTS.map((a) => `<option value="${a}">${a}</option>`).join("");
    const genreThemeFilter = $("genreThemeFilter");
    if (genreThemeFilter) {
        genreThemeFilter.innerHTML = [`<option value="All">All Themes</option>`, ...THEMES.map((t) => `<option value="${t}">${t}</option>`)].join("");
    }
    const genreMoodFilter = $("genreMoodFilter");
    if (genreMoodFilter) {
        genreMoodFilter.innerHTML = [`<option value="All">All Moods</option>`, ...MOODS.map((m) => `<option value="${m}">${m}</option>`)].join("");
    }
    const cccThemeFilter = $("cccThemeFilter");
    if (cccThemeFilter) {
        cccThemeFilter.innerHTML = [`<option value="All">All Themes</option>`, ...THEMES.map((t) => `<option value="${t}">${t}</option>`)].join("");
    }
    const cccMoodFilter = $("cccMoodFilter");
    if (cccMoodFilter) {
        cccMoodFilter.innerHTML = [`<option value="All">All Moods</option>`, ...MOODS.map((m) => `<option value="${m}">${m}</option>`)].join("");
    }
    const trendScopeSelect = $("trendScopeSelect");
    if (trendScopeSelect)
        trendScopeSelect.value = state.ui.trendScopeType || "global";
    const eraRolloutSelect = $("eraRolloutSelect");
    if (eraRolloutSelect) {
        eraRolloutSelect.innerHTML = ROLLOUT_PRESETS.map((preset) => `<option value="${preset.id}">${preset.label}</option>`).join("");
    }
    const eraPlanTheme = $("eraPlanTheme");
    if (eraPlanTheme) {
        eraPlanTheme.innerHTML = [`<option value="Any">Any Theme</option>`, ...THEMES.map((t) => `<option value="${t}">${t}</option>`)].join("");
        eraPlanTheme.value = state.ui.eraPlan?.themeTarget || "Any";
    }
    const eraPlanMood = $("eraPlanMood");
    if (eraPlanMood) {
        eraPlanMood.innerHTML = [`<option value="Any">Any Mood</option>`, ...MOODS.map((m) => `<option value="${m}">${m}</option>`)].join("");
        eraPlanMood.value = state.ui.eraPlan?.moodTarget || "Any";
    }
    const eraPlanRollout = $("eraPlanRollout");
    if (eraPlanRollout) {
        eraPlanRollout.innerHTML = ROLLOUT_PRESETS.map((preset) => `<option value="${preset.id}">${preset.label}</option>`).join("");
        eraPlanRollout.value = state.ui.eraPlan?.rolloutTemplateId || ROLLOUT_PRESETS[1].id;
    }
    const eraPlanCadence = $("eraPlanCadence");
    if (eraPlanCadence) {
        const cadenceOptions = ["Weekly", "Biweekly", "Monthly", "Quarterly"];
        eraPlanCadence.innerHTML = cadenceOptions.map((cadence) => `<option value="${cadence}">${cadence}</option>`).join("");
        eraPlanCadence.value = state.ui.eraPlan?.cadence || "Weekly";
    }
    const eraPlanGoals = $("eraPlanGoals");
    if (eraPlanGoals)
        eraPlanGoals.value = state.ui.eraPlan?.goals || "";
    const eraPlanSchedule = $("eraPlanSchedule");
    if (eraPlanSchedule)
        eraPlanSchedule.value = state.ui.eraPlan?.scheduleNote || "";
    const eraPlanPlannedReleases = $("eraPlanPlannedReleases");
    if (eraPlanPlannedReleases) {
        const planned = state.ui.eraPlan?.plannedReleaseIds || [];
        eraPlanPlannedReleases.value = planned.join(", ");
    }
    const projectTypeSelect = $("projectTypeSelect");
    if (projectTypeSelect && !projectTypeSelect.value)
        projectTypeSelect.value = "Single";
    if (labelAlignment)
        labelAlignment.value = state.label.alignment;
    if (trackAlignment)
        trackAlignment.value = state.label.alignment;
    if (actAlignmentSelect)
        actAlignmentSelect.value = state.label.alignment;
    const eraSeed = getActiveEras()[0];
    if (eraSeed && eraSeed.rolloutId && eraRolloutSelect) {
        eraRolloutSelect.value = eraSeed.rolloutId;
    }
    const labelNameInput = $("labelNameInput");
    if (labelNameInput)
        labelNameInput.value = state.label.name;
    if (genreThemeFilter)
        genreThemeFilter.value = state.ui.genreTheme || "All";
    if (genreMoodFilter)
        genreMoodFilter.value = state.ui.genreMood || "All";
    if (cccThemeFilter)
        cccThemeFilter.value = state.ui.cccThemeFilter || "All";
    if (cccMoodFilter)
        cccMoodFilter.value = state.ui.cccMoodFilter || "All";
    const cccSort = $("cccSort");
    if (cccSort)
        cccSort.value = state.ui.cccSort || "default";
    updateActMemberFields();
    renderSlots();
    updateGenrePreview();
}
function updateActMemberFields() {
    const actTypeSelect = $("actTypeSelect");
    if (!actTypeSelect)
        return;
    const solo = actTypeSelect.value === "Solo Act";
    if (solo) {
        state.ui.actSlots.member2 = null;
        state.ui.actSlots.member3 = null;
        if (state.ui.slotTarget === "act-member2" || state.ui.slotTarget === "act-member3") {
            state.ui.slotTarget = null;
        }
    }
    commitSlotChange();
}
function rankCandidates(role) {
    const busyIds = getBusyCreatorIds("In Progress");
    const req = staminaRequirement(role);
    return state.creators
        .filter((c) => c.role === role)
        .map((creator) => {
        const staminaSpentToday = getCreatorStaminaSpentToday(creator);
        const overuseStrikes = creator.overuseStrikes || 0;
        const projectedSpent = staminaSpentToday + req;
        const overuseRisk = STAMINA_OVERUSE_LIMIT > 0
            ? projectedSpent > STAMINA_OVERUSE_LIMIT
                ? 2
                : projectedSpent >= STAMINA_OVERUSE_LIMIT * 0.75
                    ? 1
                    : 0
            : 0;
        return {
            ...creator,
            staminaSpentToday,
            projectedSpent,
            overuseStrikes,
            overuseRisk,
            ready: creator.stamina >= req,
            busy: busyIds.has(creator.id)
        };
    })
        .sort((a, b) => {
        if (a.ready !== b.ready)
            return a.ready ? -1 : 1;
        if (a.busy !== b.busy)
            return a.busy ? 1 : -1;
        if (a.overuseRisk !== b.overuseRisk)
            return a.overuseRisk - b.overuseRisk;
        if (a.overuseStrikes !== b.overuseStrikes)
            return a.overuseStrikes - b.overuseStrikes;
        if (a.projectedSpent !== b.projectedSpent)
            return a.projectedSpent - b.projectedSpent;
        if (a.skill !== b.skill)
            return b.skill - a.skill;
        if (a.staminaSpentToday !== b.staminaSpentToday)
            return a.staminaSpentToday - b.staminaSpentToday;
        return b.stamina - a.stamina;
    });
}
function pickOveruseSafeCandidate(role) {
    const req = staminaRequirement(role);
    const candidates = rankCandidates(role).filter((creator) => creator.ready);
    const safe = candidates.filter((creator) => getCreatorStaminaSpentToday(creator) + req <= STAMINA_OVERUSE_LIMIT);
    return safe[0] || null;
}
const RECOMMEND_VERSION = 1;
function getTopTrendGenre() {
    if (Array.isArray(state.trendRanking) && state.trendRanking.length)
        return state.trendRanking[0];
    return Array.isArray(state.trends) ? (state.trends[0] || "") : "";
}
function topTrendRecommendation() {
    const top = getTopTrendGenre();
    if (top) {
        return { theme: themeFromGenre(top), mood: moodFromGenre(top), reason: "Top trend this week." };
    }
    return { theme: THEMES[0], mood: MOODS[0], reason: "Defaulting to core genre set." };
}
function recommendActId() {
    if (!state.acts.length)
        return { actId: null, reason: "No acts available yet." };
    const focusEra = getFocusedEra();
    if (focusEra) {
        const focusAct = getAct(focusEra.actId);
        if (focusAct) {
            return { actId: focusAct.id, reason: `Focus era selected (${focusEra.name}).` };
        }
    }
    const scored = state.acts.map((act) => {
        const members = act.memberIds.map((id) => getCreator(id)).filter(Boolean);
        const avgSkill = members.length
            ? Math.round(members.reduce((sum, creator) => sum + creator.skill, 0) / members.length)
            : 0;
        return { act, avgSkill };
    });
    scored.sort((a, b) => {
        if (b.avgSkill !== a.avgSkill)
            return b.avgSkill - a.avgSkill;
        return a.act.name.localeCompare(b.act.name);
    });
    return { actId: scored[0].act.id, reason: `Best average skill (${scored[0].avgSkill}).` };
}
function scoreActGenreMatch(act, theme, mood) {
    const members = act.memberIds.map((id) => getCreator(id)).filter(Boolean);
    const memberCount = members.length;
    if (!memberCount) {
        return {
            act,
            memberCount: 0,
            avgSkill: 0,
            matchScore: 0,
            matchRate: 0,
            exactHits: 0,
            partialHits: 0
        };
    }
    const canExact = Boolean(theme && mood);
    let exactHits = 0;
    let partialHits = 0;
    members.forEach((creator) => {
        const themeMatch = theme ? creator.prefThemes.includes(theme) : false;
        const moodMatch = mood ? creator.prefMoods.includes(mood) : false;
        if (canExact && themeMatch && moodMatch) {
            exactHits += 1;
            partialHits += 1;
            return;
        }
        if (themeMatch || moodMatch)
            partialHits += 1;
    });
    const maxPerMember = canExact ? 3 : 1;
    const matchScore = canExact ? exactHits * 3 + (partialHits - exactHits) : partialHits;
    const matchRate = matchScore / (memberCount * maxPerMember);
    const avgSkill = Math.round(members.reduce((sum, creator) => sum + creator.skill, 0) / memberCount);
    return {
        act,
        memberCount,
        avgSkill,
        matchScore,
        matchRate,
        exactHits,
        partialHits
    };
}
function recommendActForTrack(track) {
    if (!state.acts.length) {
        return { version: RECOMMEND_VERSION, actId: null, reason: "No acts available yet." };
    }
    const theme = track.theme || themeFromGenre(track.genre);
    const mood = track.mood || moodFromGenre(track.genre);
    if (!theme && !mood) {
        const fallback = recommendActId();
        return {
            version: RECOMMEND_VERSION,
            actId: fallback.actId,
            theme: "",
            mood: "",
            genre: "",
            reason: `No genre data to match. ${fallback.reason}`
        };
    }
    const genre = makeGenre(theme, mood);
    const scored = state.acts.map((act) => scoreActGenreMatch(act, theme, mood));
    scored.sort((a, b) => {
        if (b.matchRate !== a.matchRate)
            return b.matchRate - a.matchRate;
        if (b.matchScore !== a.matchScore)
            return b.matchScore - a.matchScore;
        if (b.avgSkill !== a.avgSkill)
            return b.avgSkill - a.avgSkill;
        return a.act.name.localeCompare(b.act.name);
    });
    const top = scored[0];
    if (!top || top.matchScore <= 0) {
        const fallback = recommendActId();
        const label = genre || theme || mood || "this track";
        return {
            version: RECOMMEND_VERSION,
            actId: fallback.actId,
            theme,
            mood,
            genre,
            memberCount: top?.memberCount || 0,
            exactMatches: 0,
            partialMatches: 0,
            reason: `No preference matches for ${label}. ${fallback.reason}`
        };
    }
    const exactPossible = Boolean(theme && mood);
    const partialOnly = top.partialHits - top.exactHits;
    let reason = "";
    if (exactPossible) {
        const parts = [];
        if (top.exactHits)
            parts.push(`${top.exactHits}/${top.memberCount} exact`);
        if (partialOnly)
            parts.push(`${partialOnly}/${top.memberCount} partial`);
        if (!parts.length)
            parts.push("no member preferences aligned");
        reason = `Preference match for ${genre}: ${parts.join(", ")}.`;
    }
    else if (theme) {
        reason = top.partialHits
            ? `Preference match for theme "${theme}": ${top.partialHits}/${top.memberCount} members.`
            : `No preference matches for theme "${theme}".`;
    }
    else {
        reason = top.partialHits
            ? `Preference match for mood "${mood}": ${top.partialHits}/${top.memberCount} members.`
            : `No preference matches for mood "${mood}".`;
    }
    return {
        version: RECOMMEND_VERSION,
        actId: top.act.id,
        theme,
        mood,
        genre,
        memberCount: top.memberCount,
        exactMatches: top.exactHits,
        partialMatches: top.partialHits,
        reason
    };
}
function recommendModifierId(theme, mood, crewIds = []) {
    const trendMatch = state.trends.includes(makeGenre(theme, mood));
    const qualityMod = MODIFIERS.find((mod) => mod.qualityDelta > 0);
    const speedMod = MODIFIERS.find((mod) => mod.hoursDelta < 0);
    if (trendMatch && qualityMod && state.label.cash >= getStageCost(0, qualityMod, crewIds)) {
        return { modifierId: qualityMod.id, reason: "Invest in quality while trend is hot." };
    }
    if (!trendMatch && speedMod && state.label.cash >= getStageCost(0, speedMod, crewIds)) {
        return { modifierId: speedMod.id, reason: "Favor speed on a colder week." };
    }
    return { modifierId: MODIFIERS[0]?.id || "None", reason: "Standard budget tier." };
}
function recommendProjectType(actId) {
    const relevant = actId
        ? state.tracks.filter((track) => track.actId === actId && !isTrackPipelineActive(track))
        : state.tracks.filter((track) => !isTrackPipelineActive(track));
    const count = relevant.length;
    if (count >= 6)
        return { type: "Album", reason: `Catalog depth ${count} supports an album.` };
    if (count >= 3)
        return { type: "EP", reason: `Catalog depth ${count} supports an EP.` };
    return { type: "Single", reason: `Catalog depth ${count} favors a single.` };
}
function recommendTrackPlan() {
    const trend = topTrendRecommendation();
    const actPick = recommendActId();
    const writer = pickOveruseSafeCandidate("Songwriter");
    const performer = pickOveruseSafeCandidate("Performer");
    const producer = pickOveruseSafeCandidate("Producer");
    const modifierPick = recommendModifierId(trend.theme, trend.mood, writer ? [writer.id] : []);
    const projectPick = recommendProjectType(actPick.actId);
    return {
        version: RECOMMEND_VERSION,
        theme: trend.theme,
        mood: trend.mood,
        actId: actPick.actId,
        songwriterId: writer?.id || null,
        performerId: performer?.id || null,
        producerId: producer?.id || null,
        modifierId: modifierPick.modifierId,
        projectType: projectPick.type,
        reasons: [
            trend.reason,
            actPick.reason,
            modifierPick.reason,
            projectPick.reason
        ].filter(Boolean).join(" ")
    };
}
function recommendReleasePlan(track) {
    const trendMatch = state.trends.includes(track.genre);
    if (trendMatch) {
        return {
            version: RECOMMEND_VERSION,
            distribution: "Digital",
            scheduleKey: "now",
            scheduleHours: 0,
            reason: "Trend match favors an immediate digital release."
        };
    }
    if (track.quality >= 85) {
        return {
            version: RECOMMEND_VERSION,
            distribution: "Physical",
            scheduleKey: "fortnight",
            scheduleHours: WEEK_HOURS * 2,
            reason: "High quality warrants a physical rollout."
        };
    }
    return {
        version: RECOMMEND_VERSION,
        distribution: "Digital",
        scheduleKey: "week",
        scheduleHours: WEEK_HOURS,
        reason: "Give one week for prep and momentum."
    };
}
function planRivalRelease(genre, quality) {
    const plan = recommendReleasePlan({ genre, quality });
    const jitter = plan.scheduleKey === "now" ? rand(0, 12) : rand(0, 24);
    return {
        distribution: plan.distribution,
        releaseAt: state.time.epochMs + (plan.scheduleHours + jitter) * HOUR_MS
    };
}
function renderAutoAssignModal() {
    const roles = ["Songwriter", "Performer", "Producer"];
    const blocks = roles.map((role) => {
        const candidates = rankCandidates(role).slice(0, 5);
        const req = staminaRequirement(role);
        const label = roleLabel(role);
        if (!candidates.length) {
            return `
        <div class="auto-assign-role">
          <h3>${label}</h3>
          <div class="muted">No candidates available.</div>
        </div>
      `;
        }
        return `
      <div class="auto-assign-role">
        <h3>${label}</h3>
        ${candidates.map((creator) => {
            const staminaPct = Math.round((creator.stamina / STAMINA_MAX) * 100);
            const overuseSafe = getCreatorStaminaSpentToday(creator) + req <= STAMINA_OVERUSE_LIMIT;
            const canAssign = creator.ready && overuseSafe;
            return `
          <div class="list-item">
            <div class="auto-assign-candidate">
              <div>
                <div class="item-title">${creator.name}</div>
                <div class="bar"><span style="width:${staminaPct}%"></span></div>
                <div class="muted">Stamina ${creator.stamina} / ${STAMINA_MAX}</div>
                <div class="muted">ID ${creator.id} | Skill <span class="grade-text" data-grade="${scoreGrade(creator.skill)}">${creator.skill}</span></div>
              </div>
              <div class="actions">
                ${creator.ready ? "" : `<span class="tag low">Low stamina</span>`}
                ${overuseSafe ? "" : `<span class="tag low">Overuse limit</span>`}
                <button type="button" class="ghost" data-assign-role="${role}" data-assign-id="${creator.id}"${canAssign ? "" : " disabled"}>Assign</button>
              </div>
            </div>
            <div class="muted">Needs ${req} stamina for ${label} stage</div>
          </div>
        `;
        }).join("")}
      </div>
    `;
    });
    $("autoAssignList").innerHTML = blocks.join("");
}
function renderTime() {
    $("timeDisplay").textContent = formatDate(state.time.epochMs);
    $("weekDisplay").textContent = `Week ${weekIndex() + 1}`;
    $("chartCountdown").textContent = `Charts update in ${hoursUntilNextScheduledTime(WEEKLY_SCHEDULE.chartUpdate)}h`;
    const mode = getGameMode(state.meta?.gameMode);
    const modeLabel = shortGameModeLabel(mode.label);
    const modeEl = $("gameModeDisplay");
    if (modeEl) {
        modeEl.textContent = modeLabel || "-";
        if (mode?.id) {
            modeEl.dataset.mode = mode.id;
        }
        else {
            modeEl.removeAttribute("data-mode");
        }
        modeEl.setAttribute("title", mode.label || "");
        modeEl.setAttribute("aria-label", mode.label ? `Game mode: ${mode.label}` : "Game mode");
    }
    const difficulty = getGameDifficulty(state.meta?.difficulty);
    const difficultyEl = $("gameDifficultyDisplay");
    if (difficultyEl) {
        difficultyEl.textContent = difficulty?.label || "-";
        if (difficulty?.id) {
            difficultyEl.dataset.difficulty = difficulty.id;
        }
        else {
            difficultyEl.removeAttribute("data-difficulty");
        }
        difficultyEl.setAttribute("title", difficulty?.label || "");
        difficultyEl.setAttribute("aria-label", difficulty?.label ? `Game difficulty: ${difficulty.label}` : "Game difficulty");
    }
}
function renderFocusEraStatus() {
    const activeEras = getActiveEras().filter((entry) => entry.status === "Active");
    const focusEra = getFocusedEra();
    const fallbackEra = !focusEra && activeEras.length === 1 ? activeEras[0] : null;
    const displayEra = focusEra || fallbackEra;
    const actName = displayEra ? getAct(displayEra.actId)?.name : null;
    const stageName = displayEra ? ERA_STAGES[displayEra.stageIndex] || "Active" : "";
    const baseLabel = displayEra
        ? `${displayEra.name}${actName ? ` (${actName})` : ""}${stageName ? ` | ${stageName}` : ""}`
        : "";
    const headerLabel = focusEra
        ? baseLabel
        : fallbackEra
            ? `${baseLabel} (Auto)`
            : activeEras.length
                ? "Select focus"
                : "No active eras";
    const detailLabel = focusEra
        ? `Focused: ${baseLabel}`
        : fallbackEra
            ? `Auto: ${baseLabel}`
            : activeEras.length
                ? "No focus selected"
                : "No active eras";
    const promoLabel = focusEra
        ? baseLabel
        : fallbackEra
            ? `${baseLabel} (Auto)`
            : activeEras.length
                ? "Select focus"
                : "No active eras";
    const headerEl = $("focusEraDisplay");
    if (headerEl) {
        headerEl.textContent = headerLabel;
        if (displayEra) {
            const stageName = ERA_STAGES[displayEra.stageIndex] || "Active";
            headerEl.title = `Act: ${actName || "Unknown"} | Stage: ${stageName}`;
        }
        else {
            headerEl.title = "";
        }
    }
    const labelEl = $("eraFocusLabel");
    if (labelEl)
        labelEl.textContent = detailLabel;
    const promoEl = $("promoFocusLabel");
    if (promoEl)
        promoEl.textContent = promoLabel;
    const clearBtn = $("eraFocusClear");
    if (clearBtn)
        clearBtn.disabled = !focusEra;
    const promoBtn = $("promoFocusPickBtn");
    if (promoBtn)
        promoBtn.disabled = !displayEra;
}
function renderStats() {
    $("cashDisplay").textContent = formatMoney(state.label.cash);
    const counts = getStudioUsageCounts();
    const ownedSlots = getOwnedStudioSlots();
    const totalSlots = ownedSlots + counts.leased;
    state.studio.inUse = counts.total;
    $("studioDisplay").textContent = `${counts.total} / ${totalSlots}`;
    $("slotDisplay").textContent = session.activeSlot ? `Slot ${session.activeSlot}` : "-";
    $("slotTargetDisplay").textContent = state.ui.slotTarget ? describeSlot(state.ui.slotTarget) : "-";
    if ($("labelNameDisplay")) {
        $("labelNameDisplay").textContent = state.label.name || "Record Label";
    }
    if ($("alignmentDisplay")) {
        $("alignmentDisplay").innerHTML = renderAlignmentTag(state.label.alignment);
    }
    if ($("popularityDisplay")) {
        const ranking = getLabelRanking();
        const index = ranking.findIndex((row) => row[0] === state.label.name);
        $("popularityDisplay").textContent = index >= 0 ? `#${index + 1}` : "Unranked";
    }
    if ($("reachDisplay")) {
        const snapshot = computePopulationSnapshot();
        const reach = snapshot.total ? (state.label.fans / snapshot.total) * 100 : 0;
        $("reachDisplay").textContent = `${reach.toFixed(2)}%`;
    }
    if ($("achievementCount")) {
        const unlockedCount = state.meta.achievementsUnlocked?.length || 0;
        const count = Math.max(unlockedCount, state.meta.achievements || 0);
        $("achievementCount").textContent = `${count} / ${ACHIEVEMENT_TARGET}`;
    }
    if ($("expDisplay")) {
        $("expDisplay").textContent = formatCount(state.meta.exp || 0);
    }
    if ($("bailoutStatus")) {
        if (state.meta.bailoutPending) {
            $("bailoutStatus").textContent = "Bailout offer pending.";
        }
        else if (state.meta.achievementsLocked) {
            $("bailoutStatus").textContent = "Bailout used: achievements locked.";
        }
        else if (state.meta.bailoutUsed) {
            $("bailoutStatus").textContent = "Bailout used.";
        }
        else {
            $("bailoutStatus").textContent = "";
        }
    }
    if ($("winTrackDisplay")) {
        if (state.meta.winState) {
            $("winTrackDisplay").textContent = `Won ${state.meta.winState.year}`;
        }
        else {
            const year = currentYear();
            if (year < 3000)
                $("winTrackDisplay").textContent = "12 Requests (no monopoly)";
            else if (year < 4000)
                $("winTrackDisplay").textContent = "12 Requests or Monopoly";
            else
                $("winTrackDisplay").textContent = "Top Label or Monopoly";
        }
    }
    renderFocusEraStatus();
}
function computeLabelScores() {
    const labelScores = {};
    (state.charts.global || []).forEach((entry) => {
        const points = Math.max(1, CHART_SIZES.global + 1 - entry.rank);
        labelScores[entry.track.label] = (labelScores[entry.track.label] || 0) + points;
    });
    return labelScores;
}
function getLabelRanking(limit) {
    const ranking = Object.entries(computeLabelScores())
        .sort((a, b) => b[1] - a[1]);
    return typeof limit === "number" ? ranking.slice(0, limit) : ranking;
}
function normalizeCommunityRankingLimit(value) {
    const parsed = Number(value);
    return COMMUNITY_RANKING_LIMITS.includes(parsed) ? parsed : COMMUNITY_RANKING_DEFAULT;
}
function getCommunityRankingLimit() {
    if (!state.ui)
        state.ui = {};
    const normalized = normalizeCommunityRankingLimit(state.ui.communityRankingLimit);
    state.ui.communityRankingLimit = normalized;
    return normalized;
}
function buildLabelRankingList({ limit = null, showMore = false } = {}) {
    const fullRanking = getLabelRanking();
    const visible = typeof limit === "number" ? fullRanking.slice(0, limit) : fullRanking;
    if (!visible.length) {
        return { markup: `<div class="muted">No labels yet.</div>`, visibleCount: 0, totalCount: fullRanking.length };
    }
    const list = visible.map((row, index) => {
        const labelName = row[0];
        const points = row[1];
        const country = getRivalByName(labelName)?.country || state.label.country;
        const moreAction = showMore && index === 0
            ? `<button type="button" class="ghost mini" data-ranking-more="labels">More</button>`
            : "";
        return `
      <div class="list-item">
        <div class="list-row">
          <div class="item-title">#${index + 1} ${renderLabelTag(labelName, country)}</div>
          <div class="ranking-actions">
            <span class="muted">${formatCount(points)} pts</span>
            ${moreAction}
          </div>
        </div>
      </div>
    `;
    });
    return { markup: list.join(""), visibleCount: visible.length, totalCount: fullRanking.length };
}
function renderCommunityLabels() {
    const listEl = $("topLabelsWorldList");
    if (!listEl)
        return;
    const limit = getCommunityRankingLimit();
    const { markup, visibleCount, totalCount } = buildLabelRankingList({ limit, showMore: true });
    listEl.innerHTML = markup;
    const meta = $("labelRankingMeta");
    if (meta) {
        if (!totalCount) {
            meta.textContent = "No labels ranked yet.";
        }
        else if (visibleCount >= totalCount) {
            meta.textContent = `Showing ${formatCount(totalCount)} labels.`;
        }
        else {
            meta.textContent = `Showing Top ${formatCount(visibleCount)} of ${formatCount(totalCount)} labels.`;
        }
    }
}
function renderTopBar() {
    const ranking = getLabelRanking(3);
    const labelsMarkup = ranking.length
        ? ranking.map((row, index) => `
        <div class="top-mini-item">
          <span>${index + 1}. ${renderLabelTag(row[0], (getRivalByName(row[0])?.country || state.label.country))}</span>
          <span class="muted">${row[1]} pts</span>
        </div>
      `).join("")
        : `<div class="muted">No labels yet</div>`;
    const trendRanking = Array.isArray(state.trendRanking) && state.trendRanking.length
        ? state.trendRanking
        : (state.trends || []);
    const trendsMarkup = trendRanking.length
        ? trendRanking.slice(0, TREND_DETAIL_COUNT).map((trend, index) => `
        <div class="top-mini-item">
          <span>${index + 1}. ${formatGenreKeyLabel(trend)}</span>
        </div>
      `).join("")
        : `<div class="muted">No trends yet</div>`;
    const headerList = $("topLabelsHeaderList");
    if (headerList)
        headerList.innerHTML = labelsMarkup;
    const trendsList = $("topTrendsHeaderList");
    if (trendsList)
        trendsList.innerHTML = trendsMarkup;
    if ($("topActName")) {
        const topAct = getTopActSnapshot();
        $("topActName").textContent = topAct ? `Top Act: ${topAct.name}` : "Top Act: -";
        $("topActPortrait").textContent = topAct ? topAct.initials : "RLS";
        $("topActPortrait").style.background = topAct ? topAct.color : "";
        $("topActPortrait").style.color = topAct ? topAct.textColor : "";
    }
}
function renderDashboard() {
    const statsEl = $("dashboardStats");
    if (!statsEl)
        return;
    const weekLabel = $("dashboardWeekLabel");
    if (weekLabel)
        weekLabel.textContent = `Week ${weekIndex() + 1}`;
    const dateLabel = $("dashboardDateLabel");
    if (dateLabel)
        dateLabel.textContent = formatDate(state.time.epochMs);
    const activeTracks = state.tracks.filter((track) => track.status !== "Released");
    const releasedTracks = state.tracks.filter((track) => track.status === "Released");
    const activeEras = getActiveEras().filter((entry) => entry.status === "Active");
    const focusEra = getFocusedEra();
    const studioCounts = getStudioUsageCounts();
    const ownedSlots = getOwnedStudioSlots();
    const totalSlots = ownedSlots + studioCounts.leased;
    const topTrend = getTopTrendGenre() || "-";
    const topAct = getTopActSnapshot();
    const stats = [
        { label: "Cash", value: formatMoney(state.label.cash), detail: `Weekly ${formatMoney(state.economy.lastRevenue || 0)}` },
        { label: "Active Tracks", value: formatCount(activeTracks.length), detail: `Released ${formatCount(releasedTracks.length)}` },
        { label: "Creators", value: formatCount(state.creators.length), detail: `Acts ${formatCount(state.acts.length)}` },
        { label: "Studios", value: `${studioCounts.total}/${totalSlots}`, detail: `Owned ${ownedSlots}` },
        { label: "Active Eras", value: formatCount(activeEras.length), detail: focusEra ? `Focus ${focusEra.name}` : "No focus era" },
        { label: "Top Trend", value: topTrend, detail: topAct ? `Top Act ${topAct.name}` : "Top Act -" }
    ];
    statsEl.innerHTML = stats.map((stat) => `
    <div class="dashboard-stat">
      <div class="stat-label">${stat.label}</div>
      <div class="stat-value">${stat.value}</div>
      <div class="tiny muted">${stat.detail}</div>
    </div>
  `).join("");
    const workOrdersEl = $("dashboardWorkOrders");
    if (workOrdersEl) {
        const activeOrders = state.workOrders.filter((order) => order.status === "In Progress");
        if (!activeOrders.length) {
            workOrdersEl.innerHTML = `<div class="muted">No active work orders.</div>`;
        }
        else {
            const now = state.time.epochMs;
            const list = activeOrders
                .slice(0, 5)
                .map((order) => {
                const track = getTrack(order.trackId);
                const crewIds = getWorkOrderCreatorIds(order);
                const crew = crewIds.map((id) => getCreator(id)).filter(Boolean);
                const lead = crew[0] || null;
                const crewLabel = lead ? (crew.length > 1 ? `${lead.name} +${crew.length - 1}` : lead.name) : "Unassigned";
                const stage = STAGES[order.stageIndex];
                const hoursLeft = Math.max(0, Math.ceil((order.endAt - now) / HOUR_MS));
                return `
            <div class="list-item">
              <div class="list-row">
                <div>
                  <div class="item-title">${track ? track.title : "Unknown"}</div>
                  <div class="muted">${stage?.name || "Stage"} | ${crewLabel}</div>
                </div>
                <div class="pill">${hoursLeft}h</div>
              </div>
            </div>
          `;
            });
            workOrdersEl.innerHTML = list.join("");
        }
    }
    const queueEl = $("dashboardReleaseQueue");
    if (queueEl) {
        if (!state.releaseQueue.length) {
            queueEl.innerHTML = `<div class="muted">No releases scheduled.</div>`;
        }
        else {
            const list = state.releaseQueue
                .slice()
                .sort((a, b) => (a.releaseAt || 0) - (b.releaseAt || 0))
                .slice(0, 5)
                .map((entry) => {
                const track = getTrack(entry.trackId);
                const date = entry.releaseAt ? formatDate(entry.releaseAt) : "TBD";
                const distribution = entry.distribution || entry.note || "Digital";
                return `
            <div class="list-item">
              <div class="list-row">
                <div>
                  <div class="item-title">${track ? track.title : "Unknown"}</div>
                  <div class="muted">${date} | ${distribution}</div>
                </div>
              </div>
            </div>
          `;
            });
            queueEl.innerHTML = list.join("");
        }
    }
    const chartsEl = $("dashboardChartsList");
    if (chartsEl) {
        const entries = (state.charts.global || []).slice(0, 5);
        if (!entries.length) {
            chartsEl.innerHTML = `<div class="muted">No chart entries yet.</div>`;
        }
        else {
            chartsEl.innerHTML = entries.map((entry) => `
        <div class="list-item">
          <div class="list-row">
            <div>
              <div class="item-title">#${entry.rank} ${entry.track.title}</div>
              <div class="muted">${entry.track.label} | ${entry.track.genre || "Genre -"} </div>
            </div>
            <div class="pill">${formatCount(entry.score)}</div>
          </div>
        </div>
      `).join("");
        }
    }
    const eraList = $("dashboardEraList");
    if (eraList) {
        if (!activeEras.length) {
            eraList.innerHTML = `<div class="muted">No active eras.</div>`;
        }
        else {
            eraList.innerHTML = activeEras.map((era) => `
        <div class="list-item">
          <div class="list-row">
            <div>
              <div class="item-title">${era.name}</div>
              <div class="muted">${ERA_STAGES[era.stageIndex] || "Active"} | Week ${era.stageWeek}</div>
            </div>
            ${focusEra && focusEra.id === era.id ? `<span class="pill">Focus</span>` : ""}
          </div>
        </div>
      `).join("");
        }
    }
}
function getTopActSnapshot() {
    const entries = state.marketTracks.filter((track) => track.isPlayer && track.actId);
    if (!entries.length)
        return null;
    const scores = {};
    entries.forEach((track) => {
        const score = track.quality + Math.max(0, 12 - track.weeksOnChart) * 5 + track.promoWeeks * 4;
        scores[track.actId] = (scores[track.actId] || 0) + score;
    });
    const bestId = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (!bestId)
        return null;
    const act = getAct(bestId);
    if (!act)
        return null;
    const initials = act.name.split(" ").map((part) => part[0]).slice(0, 3).join("").toUpperCase();
    const color = act.alignment ? `linear-gradient(135deg, ${alignmentColor(act.alignment)}, rgba(255,255,255,0.1))` : "";
    const textColor = act.alignment === "Safe" ? "#0b0f14" : "#f4f1ea";
    return { name: act.name, initials, color, textColor };
}
function alignmentColor(alignment) {
    if (alignment === "Safe")
        return "var(--align-safe)";
    if (alignment === "Risky")
        return "var(--align-risky)";
    return "var(--align-neutral)";
}
function populationStageForYear(year) {
    const stage = POPULATION_STAGES.find((entry) => year >= entry.startYear && year < entry.endYear);
    return stage || POPULATION_STAGES[POPULATION_STAGES.length - 1];
}
function yearNoise(year, salt) {
    const x = Math.sin((year + salt) * 12.9898) * 43758.5453;
    return x - Math.floor(x);
}
function yearlyPopulationRate(year, tier) {
    if (tier === 1) {
        const birth = 0.01 + yearNoise(year, 1) * 0.005;
        const death = 0.0075 + yearNoise(year, 2) * 0.0025;
        return Math.max(0, birth - death);
    }
    if (tier === 2) {
        return -0.002 + yearNoise(year, 3) * 0.006;
    }
    return -0.003 + yearNoise(year, 4) * 0.006;
}
function populationAtYear(year) {
    if (year <= POPULATION_START_YEAR)
        return POPULATION_START;
    let pop = POPULATION_START;
    let floor = POPULATION_START;
    for (let y = POPULATION_START_YEAR + 1; y <= year; y += 1) {
        const tier = pop >= POPULATION_TIER_2 ? 3 : pop >= POPULATION_TIER_1 ? 2 : 1;
        const rate = yearlyPopulationRate(y, tier);
        const next = Math.round(pop * (1 + rate));
        if (next >= POPULATION_TIER_1)
            floor = Math.max(floor, POPULATION_TIER_1);
        if (next >= POPULATION_TIER_2)
            floor = Math.max(floor, POPULATION_TIER_2);
        let min = floor;
        let max = POPULATION_CAP;
        if (y >= 3000) {
            const band = POPULATION_POST3000_BAND;
            min = Math.max(min, Math.round(pop * (1 - band)));
            max = Math.min(max, Math.round(pop * (1 + band)));
        }
        pop = clamp(next, min, max);
    }
    return Math.round(pop / 1000) * 1000;
}
function roundToThousandUp(value) {
    return Math.ceil(value / 1000) * 1000;
}
function normalizeSplit(split) {
    const total = Object.values(split).reduce((sum, value) => sum + value, 0) || 1;
    const normalized = {};
    Object.keys(split).forEach((key) => {
        normalized[key] = split[key] / total;
    });
    return normalized;
}
function campaignEraSplit(stage) {
    if (!state.population) {
        state.population = { snapshot: null, lastUpdateYear: 0, lastUpdateAt: null, campaignSplit: null, campaignSplitStage: null };
    }
    if (state.population.campaignSplit && state.population.campaignSplitStage === stage.id) {
        return state.population.campaignSplit;
    }
    const variance = typeof stage.variancePoints === "number" ? stage.variancePoints : 0.05;
    const base = stage.splits || { Annglora: 0.525, Bytenza: 0.333, Crowlya: 0.142 };
    const seed = stage.startYear || POPULATION_START_YEAR;
    const varied = {};
    NATIONS.forEach((nation, idx) => {
        const noise = yearNoise(seed, idx + 11) * 2 - 1;
        const target = base[nation] || 0;
        varied[nation] = Math.max(0.01, target + noise * variance);
    });
    const normalized = normalizeSplit(varied);
    state.population.campaignSplit = normalized;
    state.population.campaignSplitStage = stage.id;
    return normalized;
}
function populationSplitsForStage(stage) {
    if (stage?.id === "Campaign Era") {
        return campaignEraSplit(stage);
    }
    return stage.splits;
}
function buildPopulationSnapshot(year, totalOverride) {
    const stage = populationStageForYear(year);
    const total = typeof totalOverride === "number" ? totalOverride : populationAtYear(year);
    const splits = populationSplitsForStage(stage);
    const nations = NATIONS.map((nation) => {
        const nationPop = roundToThousandUp(total * splits[nation]);
        const capitalPop = roundToThousandUp(nationPop * REGION_CAPITAL_SHARE);
        const elsewherePop = Math.max(0, nationPop - capitalPop);
        return {
            nation,
            total: nationPop,
            capital: capitalPop,
            elsewhere: elsewherePop
        };
    });
    return { total, stage: stage.id, nations };
}
function refreshPopulationSnapshot(year) {
    if (!state.population) {
        state.population = { snapshot: null, lastUpdateYear: 0, lastUpdateAt: null, campaignSplit: null, campaignSplitStage: null };
    }
    const targetYear = typeof year === "number" ? year : currentYear();
    let total = populationAtYear(targetYear);
    const prev = state.population.snapshot?.total;
    if (typeof prev === "number" && state.population.lastUpdateYear) {
        const step = applyPopulationYear(prev, targetYear, 1, null);
        total = Math.round(step.next / 1000) * 1000;
    }
    state.population.snapshot = buildPopulationSnapshot(targetYear, total);
    state.population.lastUpdateYear = targetYear;
    state.population.lastUpdateAt = state.time.epochMs;
    return state.population.snapshot;
}
function computePopulationSnapshot() {
    if (!state.population) {
        state.population = { snapshot: null, lastUpdateYear: 0, lastUpdateAt: null, campaignSplit: null, campaignSplitStage: null };
    }
    if (!state.population.snapshot) {
        refreshPopulationSnapshot(currentYear());
    }
    return state.population.snapshot;
}
function renderPopulation() {
    if (!$("populationList"))
        return;
    const snapshot = computePopulationSnapshot();
    const stageLabel = snapshot.stage || "Campaign Era";
    const list = [
        `
      <div class="list-item">
          <div class="list-row">
          <div>
          <div class="item-title">Gaia Population</div>
          <div class="muted">${stageLabel} - updates yearly</div>
          </div>
          <div class="pill">${formatCount(snapshot.total)}</div>
        </div>
      </div>
    `
    ];
    snapshot.nations.forEach((nation) => {
        list.push(`
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${nation.nation}</div>
            <div class="muted">Capital ${formatCount(nation.capital)} | Elsewhere ${formatCount(nation.elsewhere)}</div>
          </div>
          <div class="pill">${formatCount(nation.total)}</div>
        </div>
      </div>
    `);
    });
    $("populationList").innerHTML = list.join("");
}
function renderRoleActions() {
    const listEl = $("roleActionsList");
    if (!listEl)
        return;
    const badgeFor = (status) => {
        const meta = ROLE_ACTION_STATUS[status] || ROLE_ACTION_STATUS.placeholder;
        return `<span class="${meta.className}">${meta.label}</span>`;
    };
    const renderAction = (action) => {
        const label = action.label ? `${action.label}${action.priority ? ` (Priority ${action.priority})` : ""}: ` : "";
        return `
      <div class="list-row">
        <div class="muted">${label}${action.verb} - ${action.detail}</div>
        ${badgeFor(action.status)}
      </div>
    `;
    };
    listEl.innerHTML = ROLE_ACTIONS.map((group) => `
    <div class="list-item">
      <div class="item-title">${group.role}</div>
      ${group.occupations.map((occupation) => `
        <div class="muted">${occupation.name}${occupation.note ? ` - ${occupation.note}` : ""}</div>
        ${occupation.actions.map(renderAction).join("")}
      `).join("")}
    </div>
  `).join("");
}
function renderEconomySummary() {
    if (!$("economySummary"))
        return;
    const studioMarket = getStudioMarketSnapshot();
    const summary = [
        `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">Weekly Net</div>
            <div class="muted">Revenue ${formatMoney(state.economy.lastRevenue)} | Upkeep ${formatMoney(state.economy.lastUpkeep)}</div>
          </div>
          <div class="pill">${formatMoney(state.economy.lastRevenue - state.economy.lastUpkeep)}</div>
        </div>
      </div>
    `,
        `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">Studio Availability</div>
            <div class="muted">eyeriS ${formatCount(studioMarket.available)} | Rivals ${formatCount(studioMarket.rivals)} | You ${formatCount(studioMarket.player)}</div>
          </div>
          <div class="pill">${formatCount(studioMarket.total)} total</div>
        </div>
      </div>
    `,
        `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">Baseline Prices</div>
            <div class="muted">Digital Single ${formatMoney(ECONOMY_BASELINES.digitalSingle)} | Physical Single ${formatMoney(ECONOMY_BASELINES.physicalSingle)}</div>
          </div>
          <div class="pill">2025</div>
        </div>
      </div>
    `,
        `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">Studio Lease</div>
            <div class="muted">${formatMoney(ECONOMY_BASELINES.studioLease4y)} every 4 years | Build ${formatMoney(ECONOMY_BASELINES.studioBuildCost)}</div>
          </div>
          <div class="pill">eyeriS</div>
        </div>
      </div>
    `
    ];
    $("economySummary").innerHTML = summary.join("");
}
function renderActiveCampaigns() {
    const listEl = $("activeCampaignList");
    if (!listEl)
        return;
    const active = state.marketTracks.filter((entry) => entry.isPlayer && entry.promoWeeks > 0);
    if (!active.length) {
        listEl.innerHTML = `<div class="muted">No active promo pushes.</div>`;
        return;
    }
    listEl.innerHTML = active.map((entry) => {
        const track = entry.trackId ? getTrack(entry.trackId) : null;
        const title = track ? track.title : entry.title;
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${title}</div>
            <div class="muted">${entry.genre || "-"}</div>
          </div>
          <div class="pill">${entry.promoWeeks}w</div>
        </div>
      </div>
    `;
    }).join("");
}
function renderWallet() {
    const items = [
        `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${state.label.name}</div>
            <div class="muted">Active funds</div>
          </div>
          <div class="pill">${formatMoney(state.label.cash)}</div>
        </div>
      </div>
    `,
        `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">Last Weekly Report</div>
            <div class="muted">Week ${state.economy.lastWeek || 1}</div>
          </div>
          <div class="pill">${formatMoney(state.economy.lastRevenue)} / ${formatMoney(state.economy.lastUpkeep)}</div>
        </div>
      </div>
    `,
        `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">Audience Reach</div>
            <div class="muted">Active awareness</div>
          </div>
          <div class="pill">${formatCount(state.label.fans)}</div>
        </div>
      </div>
    `
    ];
    const el = $("walletDetails");
    if (el)
        el.innerHTML = items.join("");
}
function renderLossArchives() {
    const target = $("usageLedgerList");
    if (!target)
        return;
    const archives = loadLossArchives();
    if (!archives.length) {
        target.innerHTML = `<div class="muted">No loss archives yet.</div>`;
        return;
    }
    const sorted = archives.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    target.innerHTML = sorted.map((entry) => {
        const createdAt = entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "Unknown";
        const slot = entry.slot ? `Slot ${entry.slot}` : "Slot -";
        const week = entry.week ? `Week ${entry.week}` : "Week -";
        const year = entry.year || "-";
        const uiCount = Array.isArray(entry.uiEvents) ? entry.uiEvents.length : 0;
        const simCount = Array.isArray(entry.simEvents) ? entry.simEvents.length : 0;
        const label = entry.label || "Unknown Label";
        const reason = entry.reason || "Loss recorded.";
        const lossId = entry.id || "";
        const gameDate = entry.gameTime ? formatDate(entry.gameTime) : "Unknown";
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${label} - Loss</div>
            <div class="muted">${reason}</div>
            <div class="muted">${slot} | ${week} | Year ${year}</div>
            <div class="muted">Game date ${gameDate}</div>
            <div class="muted">UI ${uiCount} | System ${simCount} | Archived ${createdAt}</div>
          </div>
          <div class="actions">
            <button type="button" class="ghost mini" data-loss-action="download" data-loss-id="${lossId}">Download</button>
          </div>
        </div>
      </div>
    `;
    }).join("");
}
function renderResourceTickSummary() {
    const target = $("resourceTickSummary");
    if (!target)
        return;
    const ledger = state.resourceTickLedger?.hours || [];
    const recent = ledger.slice(-RESOURCE_TICK_LEDGER_LIMIT);
    const totals = recent.reduce((sum, entry) => ({
        regenTotal: sum.regenTotal + (entry.regenTotal || 0),
        spendTotal: sum.spendTotal + (entry.spendTotal || 0),
        overuseCount: sum.overuseCount + (entry.overuseCount || 0),
        departuresFlagged: sum.departuresFlagged + (entry.departuresFlagged || 0)
    }), { regenTotal: 0, spendTotal: 0, overuseCount: 0, departuresFlagged: 0 });
    const dayIndex = Math.floor(state.time.epochMs / DAY_MS);
    const spentToday = state.creators.map((creator) => ({
        creator,
        spent: getCreatorStaminaSpentToday(creator)
    }));
    spentToday.sort((a, b) => b.spent - a.spent);
    const topSpent = spentToday.filter((entry) => entry.spent > 0).slice(0, 5);
    const overuseToday = state.creators.filter((creator) => creator.lastOveruseDay === dayIndex);
    const departureRisks = state.creators.filter((creator) => creator.departurePending?.reason === "overuse");
    const blocks = [];
    blocks.push(`
    <div class="list-item">
      <div class="item-title">Last 24h</div>
      <div class="muted">Regen +${formatCount(totals.regenTotal)} | Spend -${formatCount(totals.spendTotal)}</div>
      <div class="muted">Overuse strikes ${formatCount(totals.overuseCount)} | Departures flagged ${formatCount(totals.departuresFlagged)}</div>
    </div>
  `);
    if (topSpent.length) {
        blocks.push(`
      <div class="list-item">
        <div class="item-title">Top Stamina Spent (Today)</div>
        ${topSpent.map((entry) => `
          <div class="muted">${entry.creator.name} (${roleLabel(entry.creator.role)}) - ${formatCount(entry.spent)} / ${STAMINA_OVERUSE_LIMIT}</div>
        `).join("")}
      </div>
    `);
    }
    else {
        blocks.push(`
      <div class="list-item">
        <div class="item-title">Top Stamina Spent (Today)</div>
        <div class="muted">No stamina spent yet.</div>
      </div>
    `);
    }
    if (overuseToday.length) {
        blocks.push(`
      <div class="list-item">
        <div class="item-title">Overuse Strikes Today</div>
        ${overuseToday.map((creator) => `
          <div class="muted">${creator.name} (${roleLabel(creator.role)}) - strikes ${creator.overuseStrikes}</div>
        `).join("")}
      </div>
    `);
    }
    else {
        blocks.push(`
      <div class="list-item">
        <div class="item-title">Overuse Strikes Today</div>
        <div class="muted">None.</div>
      </div>
    `);
    }
    if (departureRisks.length) {
        blocks.push(`
      <div class="list-item">
        <div class="item-title">Departure Risks</div>
        ${departureRisks.map((creator) => `
          <div class="muted">${creator.name} (${roleLabel(creator.role)}) - strikes ${creator.overuseStrikes}</div>
        `).join("")}
      </div>
    `);
    }
    else {
        blocks.push(`
      <div class="list-item">
        <div class="item-title">Departure Risks</div>
        <div class="muted">None.</div>
      </div>
    `);
    }
    target.innerHTML = blocks.join("");
}
function renderQuickRecipes() {
    if (!$("quickRecipesList"))
        return;
    const recipes = [
        { title: "Songwriting", detail: "Assign Songwriter ID + Theme to draft the sheet music." },
        { title: "Performance", detail: "Assign Performer ID + Mood to craft the demo tone." },
        { title: "Production", detail: "Assign Producer ID to master the track quality." },
        { title: "Release", detail: "Move Ready tracks into Release Desk for scheduling." },
        { title: "Promo Pushes", detail: "Assign a Released Track ID to the Promo Push Slot." }
    ];
    $("quickRecipesList").innerHTML = recipes.map((recipe) => `
    <div class="list-item">
      <div class="item-title">${recipe.title}</div>
      <div class="muted">${recipe.detail}</div>
    </div>
  `).join("");
}
function renderActiveArea() {
    if (!$("activeAreaDisplay"))
        return;
    const activeEras = getActiveEras().filter((entry) => entry.status === "Active");
    const counts = getStudioUsageCounts();
    const ownedSlots = getOwnedStudioSlots();
    const totalSlots = ownedSlots + counts.leased;
    state.studio.inUse = counts.total;
    let era = "No active eras";
    if (activeEras.length === 1) {
        const active = activeEras[0];
        era = `${active.name} (${ERA_STAGES[active.stageIndex] || "Active"})`;
    }
    else if (activeEras.length > 1) {
        const names = activeEras.slice(0, 2).map((entry) => entry.name).join(", ");
        const extra = activeEras.length > 2 ? ` +${activeEras.length - 2}` : "";
        era = `${activeEras.length} active (${names}${extra})`;
    }
    $("activeAreaDisplay").innerHTML = `
    <div class="list-item">
      <div class="list-row">
        <div>
          <div class="item-title">Studios</div>
          <div class="muted">${counts.total} active / ${totalSlots} total</div>
        </div>
        <div class="pill">${totalSlots} rooms</div>
      </div>
    </div>
    <div class="list-item">
      <div class="list-row">
        <div>
          <div class="item-title">Active Era</div>
          <div class="muted">${era}</div>
        </div>
      </div>
    </div>
  `;
}
function renderInventory() {
    if (!$("inventoryList"))
        return;
    const ready = state.tracks.filter((track) => track.status === "Ready" || track.status === "Scheduled");
    if (!ready.length) {
        $("inventoryList").innerHTML = `<div class="muted">No finished content yet.</div>`;
        return;
    }
    $("inventoryList").innerHTML = ready.map((track) => `
    <div class="list-item">
      <div class="list-row">
        <div class="item-main">
          <div class="content-thumb" aria-hidden="true"></div>
          <div>
            <div class="item-title">${track.title}</div>
            <div class="muted">Item: Track  ID ${track.id}</div>
            <div class="muted">${track.status}  ${formatGenreKeyLabel(track.genre)}</div>
          </div>
        </div>
        <div class="pill grade" data-grade="${qualityGrade(track.quality)}">${qualityGrade(track.quality)}</div>
      </div>
    </div>
  `).join("");
}
function getCalendarAnchorWeekIndex() {
    return Number.isFinite(state.ui?.calendarWeekIndex) ? state.ui.calendarWeekIndex : weekIndex();
}
function buildCalendarSources() {
    const labelName = state.label?.name || "Record Label";
    const labelScheduled = state.releaseQueue.map((entry) => {
        const track = getTrack(entry.trackId);
        const act = track ? getAct(track.actId) : null;
        return {
            id: entry.id,
            ts: entry.releaseAt,
            title: track ? track.title : "Unknown Track",
            actName: act ? act.name : "Unknown",
            label: labelName,
            kind: "labelScheduled",
            typeLabel: "Scheduled",
            distribution: entry.distribution || entry.note || "Digital"
        };
    });
    const rolloutEvents = ensureScheduledEventsStore()
        .filter((entry) => Number.isFinite(entry.scheduledAt))
        .map((entry) => {
        const track = entry.contentId ? getTrack(entry.contentId) : null;
        const act = entry.actId ? getAct(entry.actId) : track ? getAct(track.actId) : null;
        const typeLabel = rolloutEventLabel(entry.actionType);
        return {
            id: entry.id,
            ts: entry.scheduledAt,
            title: track ? track.title : typeLabel,
            actName: act ? act.name : "Unknown",
            label: labelName,
            kind: "labelEvent",
            typeLabel
        };
    });
    labelScheduled.push(...rolloutEvents);
    const labelReleased = state.marketTracks
        .filter((entry) => entry.isPlayer)
        .map((entry) => ({
        id: entry.id,
        ts: entry.releasedAt,
        title: entry.title,
        actName: entry.actName || "Unknown",
        label: entry.label || labelName,
        kind: "labelReleased",
        typeLabel: "Released",
        distribution: entry.distribution || "Digital"
    }));
    const rivalScheduled = state.rivalReleaseQueue.map((entry) => {
        const queueType = entry.queueType || "release";
        const isPromo = queueType === "promo";
        const promoLabel = isPromo ? getPromoTypeDetails(entry.promoType).label : null;
        const title = entry.title || (isPromo ? promoLabel : "Unknown Track");
        return {
            id: entry.id,
            ts: entry.releaseAt,
            title,
            actName: entry.actName || (isPromo ? "Promotion" : "Unknown"),
            label: entry.label,
            kind: isPromo ? "rivalPromo" : "rivalScheduled",
            typeLabel: isPromo ? "Rival Promo" : "Rival Scheduled",
            distribution: isPromo ? promoLabel : (entry.distribution || "Digital")
        };
    });
    const rivalReleased = state.marketTracks
        .filter((entry) => !entry.isPlayer)
        .map((entry) => ({
        id: entry.id,
        ts: entry.releasedAt,
        title: entry.title,
        actName: entry.actName || "Unknown",
        label: entry.label,
        kind: "rivalReleased",
        typeLabel: "Rival Released",
        distribution: entry.distribution || "Digital"
    }));
    const eras = getActiveEras()
        .filter((entry) => entry.status === "Active")
        .map((era) => {
        const act = getAct(era.actId);
        const stageName = ERA_STAGES[era.stageIndex] || "Active";
        const content = era.contentTypes?.length ? era.contentTypes.join(", ") : "Unassigned";
        return {
            id: era.id,
            name: era.name,
            actName: act ? act.name : "Unknown",
            stageName,
            startedWeek: era.startedWeek,
            content
        };
    });
    return { labelScheduled, labelReleased, rivalScheduled, rivalReleased, eras };
}
function buildCalendarProjection({ pastWeeks = 1, futureWeeks = 4 } = {}) {
    const tab = state.ui.calendarTab || "label";
    const filters = state.ui.calendarFilters || {};
    return useCalendarProjection({
        startEpochMs: getStartEpochMsFromState(),
        anchorWeekIndex: getCalendarAnchorWeekIndex(),
        pastWeeks,
        futureWeeks,
        activeWeeks: 4,
        tab,
        filters,
        sources: buildCalendarSources()
    });
}
function renderCalendarEraList(eras) {
    if (!eras.length) {
        return `<div class="muted">No active eras on the calendar.</div>`;
    }
    return eras.map((era) => `
    <div class="list-item">
      <div class="item-title">${era.name}</div>
      <div class="muted">Act: ${era.actName} | Stage: ${era.stageName}</div>
      <div class="muted">Started Week ${era.startedWeek} | Content: ${era.content}</div>
    </div>
  `).join("");
}
function renderCalendarView() {
    const grid = $("calendarGrid");
    const list = $("calendarList");
    const eraList = $("calendarEraList");
    const rangeLabel = $("calendarRangeLabel");
    const projection = buildCalendarProjection({ pastWeeks: 0, futureWeeks: 3 });
    if (rangeLabel)
        rangeLabel.textContent = projection.rangeLabel || "";
    if (projection.tab === "eras") {
        if (grid) {
            grid.innerHTML = "";
            grid.classList.add("hidden");
        }
        if (list)
            list.classList.add("hidden");
        if (eraList)
            eraList.classList.remove("hidden");
        renderCalendarList("calendarEraList", projection.weeks.length, projection);
        return;
    }
    if (grid) {
        grid.classList.remove("hidden");
        grid.innerHTML = CalendarView(projection);
    }
    if (eraList) {
        eraList.classList.add("hidden");
        eraList.innerHTML = "";
    }
    if (list)
        list.classList.remove("hidden");
    renderCalendarList("calendarList", projection.weeks.length, projection);
}
function renderCalendarList(targetId, weeks, projectionOverride) {
    const target = $(targetId);
    if (!target)
        return;
    const futureWeeks = Math.max(0, (weeks || 1) - 1);
    const projection = projectionOverride || buildCalendarProjection({ pastWeeks: 0, futureWeeks });
    const tab = projection.tab || "label";
    const filters = projection.filters || {};
    document.querySelectorAll("[data-calendar-tab]").forEach((btn) => {
        if (!btn.dataset.calendarTab)
            return;
        btn.classList.toggle("active", btn.dataset.calendarTab === tab);
    });
    document.querySelectorAll("[data-calendar-filter]").forEach((input) => {
        const key = input.dataset.calendarFilter;
        if (!key || typeof filters[key] !== "boolean")
            return;
        input.checked = filters[key] !== false;
    });
    if (tab === "eras") {
        target.innerHTML = renderCalendarEraList(projection.eras || []);
        return;
    }
    if (!projection.weeks.length) {
        target.innerHTML = `<div class="muted">No scheduled entries.</div>`;
        return;
    }
    target.innerHTML = projection.weeks.map((week) => {
        const entries = Array.isArray(week.events) ? week.events.slice() : [];
        entries.sort((a, b) => a.ts - b.ts);
        const weekLabel = `Week ${week.weekNumber}`;
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${weekLabel}</div>
            <div class="muted">${formatDate(week.start)} - ${formatDate(week.end - HOUR_MS)}</div>
          </div>
          <div class="pill">${entries.length} event(s)</div>
        </div>
        ${entries.map((entry) => {
            const label = entry.label || "Label";
            const actName = entry.actName || "Unknown";
            const title = entry.title || "Untitled";
            const typeLabel = entry.typeLabel || "Event";
            const distribution = entry.distribution || "Digital";
            return `
            <div class="muted">${label} | ${actName} | ${title} (${typeLabel}, ${distribution})</div>
          `;
        }).join("")}
      </div>
    `;
    }).join("");
}
function renderActs() {
    if (!state.acts.length) {
        $("actList").innerHTML = `<div class="muted">No acts yet.</div>`;
        return;
    }
    const list = state.acts.map((act) => {
        const activeEras = getActiveEras().filter((era) => era.actId === act.id && era.status === "Active");
        const historyCount = state.era.history.filter((era) => era.actId === act.id).length;
        const eraLabel = activeEras.length
            ? activeEras.map((era) => `${era.name} (${ERA_STAGES[era.stageIndex] || "Active"})`).join(", ")
            : "None active";
        const members = act.memberIds
            .map((id) => {
            const creator = getCreator(id);
            return creator ? creator.name : "Unknown";
        })
            .join(", ");
        const inputId = `act-rename-${act.id}`;
        return `
      <div class="list-item" data-entity-type="act" data-entity-id="${act.id}" data-entity-name="${act.name}" draggable="true">
          <div class="list-row">
            <div>
              <div class="item-title">${act.name}</div>
              <div class="muted">ID ${act.id} | ${act.type}</div>
              <div class="muted">${renderAlignmentTag(act.alignment)}</div>
            </div>
            <button type="button" class="ghost" data-act-set="${act.id}">Assign</button>
          </div>
        <div class="muted">Members: ${members || "None"}</div>
        <div class="muted">Eras: ${eraLabel}${historyCount ? ` | Past ${historyCount}` : ""}</div>
        <div class="field">
          <label for="${inputId}">Rename Act</label>
          <input id="${inputId}" type="text" value="${act.name}" data-act-input="${act.id}" aria-label="Rename act ${act.name}">
        </div>
        <div class="actions">
          <button type="button" class="ghost" data-act-rename="${act.id}">Save Name</button>
        </div>
      </div>
    `;
    });
    $("actList").innerHTML = list.join("");
}
function creatorInitials(name) {
    if (!name)
        return "ID";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length)
        return "ID";
    const hasHangul = /[\uAC00-\uD7A3]/.test(name);
    if (hasHangul && parts.length > 1) {
        const givenName = parts.slice(1).join(" ").trim();
        if (givenName)
            return givenName;
    }
    const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("");
    return initials || "ID";
}
function renderCreatorFallbackSymbols({ unassigned = false } = {}) {
    const emoji = unassigned ? UNASSIGNED_CREATOR_EMOJI : CREATOR_FALLBACK_EMOJI;
    return `<span class="avatar-symbols" aria-hidden="true"><span class="material-symbols-rounded avatar-icon">${CREATOR_FALLBACK_ICON}</span><span class="avatar-emoji">${emoji}</span></span>`;
}
function safeAvatarUrl(url) {
    if (!url)
        return "";
    return encodeURI(String(url)).replace(/\"/g, "%22").replace(/'/g, "%27");
}
function getCreatorPortraitUrl(creator) {
    const raw = creator?.portraitUrl;
    if (!raw)
        return null;
    const trimmed = String(raw).trim();
    return trimmed ? trimmed : null;
}
function renderCreatorAvatar(creator) {
    const initials = creatorInitials(creator?.name || "");
    const portraitUrl = getCreatorPortraitUrl(creator);
    const hasImage = Boolean(portraitUrl);
    const imageStyle = hasImage ? ` style="background-image: url('${safeAvatarUrl(portraitUrl)}')"` : "";
    const className = hasImage ? "creator-avatar has-image" : "creator-avatar has-symbols";
    const content = hasImage ? initials : renderCreatorFallbackSymbols();
    return `<div class="${className}" aria-hidden="true"${imageStyle}>${content}</div>`;
}
function renderCreators() {
    const busyIds = getBusyCreatorIds("In Progress");
    const pool = state.creators || [];
    const columns = MARKET_ROLES.map((role) => {
        const roleLabelText = roleLabel(role);
        const roleCreators = pool.filter((creator) => creator.role === role);
        const list = roleCreators.map((creator) => {
            const busy = busyIds.has(creator.id);
            const staminaPct = Math.round((creator.stamina / STAMINA_MAX) * 100);
            const skillGrade = scoreGrade(creator.skill);
            const roleText = roleLabel(creator.role);
            const themeCells = creator.prefThemes.map((theme) => renderThemeTag(theme)).join("");
            const moodCells = creator.prefMoods.map((mood) => renderMoodTag(mood)).join("");
            const nationalityPill = renderNationalityPill(creator.country);
            const memberships = state.acts.filter((act) => act.memberIds.includes(creator.id)).map((act) => act.name);
            const actText = memberships.length ? memberships.join(", ") : "No Act";
            return `
        <div class="list-item" data-entity-type="creator" data-entity-id="${creator.id}" data-entity-name="${creator.name}" draggable="true">
          <div class="list-row">
            <div class="creator-card">
              ${renderCreatorAvatar(creator)}
              <div>
                <div class="item-title">${creator.name}</div>
                <div class="bar"><span style="width:${staminaPct}%"></span></div>
                <div class="muted">Stamina ${creator.stamina} / ${STAMINA_MAX}</div>
                <div class="muted">ID ${creator.id} | ${roleText} | Skill <span class="grade-text" data-grade="${skillGrade}">${creator.skill}</span></div>
                <div class="muted">Acts: ${actText}</div>
                <div class="time-row">${nationalityPill}</div>
                <div class="muted">Preferred Themes:</div>
              <div class="time-row">${themeCells}</div>
              <div class="muted">Preferred Moods:</div>
              <div class="time-row">${moodCells}</div>
            </div>
          </div>
          <div class="pill">${busy ? "Busy" : "Ready"}</div>
        </div>
        </div>
      `;
        });
        const emptyMsg = pool.length
            ? `No ${roleLabelText} Creator IDs signed.`
            : "No Creator IDs signed.";
        return `
      <div class="ccc-market-column" data-role="${role}">
        <div class="ccc-market-head">
          <div class="ccc-market-title">${roleLabelText}s</div>
          <div class="tiny muted">${roleCreators.length} signed</div>
        </div>
        <div class="list ccc-market-list">
          ${list.length ? list.join("") : `<div class="muted">${emptyMsg}</div>`}
        </div>
      </div>
    `;
    });
    $("creatorList").innerHTML = columns.join("");
}
function renderMarket() {
    ensureMarketCreators({}, { replenish: false });
    const listEl = $("marketList");
    if (!listEl)
        return;
    const filters = state.ui.cccFilters || {};
    document.querySelectorAll("[data-ccc-filter]").forEach((input) => {
        const key = input.dataset.cccFilter;
        if (!key)
            return;
        input.checked = filters[key] !== false;
    });
    const themeFilter = state.ui.cccThemeFilter || "All";
    const moodFilter = state.ui.cccMoodFilter || "All";
    const sortMode = state.ui.cccSort || "default";
    const themeSelect = $("cccThemeFilter");
    const moodSelect = $("cccMoodFilter");
    const sortSelect = $("cccSort");
    if (themeSelect)
        themeSelect.value = themeFilter;
    if (moodSelect)
        moodSelect.value = moodFilter;
    if (sortSelect)
        sortSelect.value = sortMode;
    const filtersActive = themeFilter !== "All" || moodFilter !== "All";
    const pool = state.marketCreators || [];
    const now = state.time.epochMs;
    pruneCreatorSignLockouts(now);
    const sortCreators = (list) => {
        if (!sortMode || sortMode === "default")
            return list;
        const entries = list.map((creator, index) => ({ creator, index }));
        const byText = (a, b) => a.localeCompare(b);
        const themeKey = (creator) => (creator.prefThemes?.[0] ? creator.prefThemes[0] : "");
        const themeKey2 = (creator) => (creator.prefThemes?.[1] ? creator.prefThemes[1] : "");
        const moodKey = (creator) => (creator.prefMoods?.[0] ? creator.prefMoods[0] : "");
        const moodKey2 = (creator) => (creator.prefMoods?.[1] ? creator.prefMoods[1] : "");
        entries.sort((a, b) => {
            if (sortMode === "quality-desc") {
                return (b.creator.skill || 0) - (a.creator.skill || 0)
                    || byText(a.creator.name || "", b.creator.name || "")
                    || a.index - b.index;
            }
            if (sortMode === "quality-asc") {
                return (a.creator.skill || 0) - (b.creator.skill || 0)
                    || byText(a.creator.name || "", b.creator.name || "")
                    || a.index - b.index;
            }
            if (sortMode === "theme-asc") {
                return byText(themeKey(a.creator), themeKey(b.creator))
                    || byText(themeKey2(a.creator), themeKey2(b.creator))
                    || byText(a.creator.name || "", b.creator.name || "")
                    || a.index - b.index;
            }
            if (sortMode === "theme-desc") {
                return byText(themeKey(b.creator), themeKey(a.creator))
                    || byText(themeKey2(b.creator), themeKey2(a.creator))
                    || byText(a.creator.name || "", b.creator.name || "")
                    || a.index - b.index;
            }
            if (sortMode === "mood-asc") {
                return byText(moodKey(a.creator), moodKey(b.creator))
                    || byText(moodKey2(a.creator), moodKey2(b.creator))
                    || byText(a.creator.name || "", b.creator.name || "")
                    || a.index - b.index;
            }
            if (sortMode === "mood-desc") {
                return byText(moodKey(b.creator), moodKey(a.creator))
                    || byText(moodKey2(b.creator), moodKey2(a.creator))
                    || byText(a.creator.name || "", b.creator.name || "")
                    || a.index - b.index;
            }
            return a.index - b.index;
        });
        return entries.map((entry) => entry.creator);
    };
    const columns = MARKET_ROLES.map((role) => {
        const roleLabelText = roleLabel(role);
        const roleCreators = pool.filter((creator) => creator.role === role);
        const filteredCreators = roleCreators.filter((creator) => {
            const themeMatch = themeFilter === "All" || creator.prefThemes?.includes(themeFilter);
            const moodMatch = moodFilter === "All" || creator.prefMoods?.includes(moodFilter);
            return themeMatch && moodMatch;
        });
        const sortedCreators = sortCreators(filteredCreators);
        const list = sortedCreators.map((creator) => {
            const skillGrade = scoreGrade(creator.skill);
            const staminaPct = Math.round((creator.stamina / STAMINA_MAX) * 100);
            const nationalityPill = renderNationalityPill(creator.country);
            const lockout = getCreatorSignLockout(creator.id, now);
            const isLocked = !!lockout;
            const itemClass = `list-item${isLocked ? " ccc-market-item--failed" : ""}`;
            const buttonState = isLocked ? " disabled" : "";
            const buttonLabel = isLocked ? "Locked until refresh" : `Sign ${formatMoney(creator.signCost || 0)}`;
            const lockoutHint = isLocked ? `<div class="tiny muted">Locked until 12AM refresh</div>` : "";
            const lockoutTitle = isLocked && lockout
                ? ` title="Locked until ${formatDate(lockout.lockedUntilEpochMs)}"`
                : "";
            const themeCells = (creator.prefThemes || []).map((theme) => renderThemeTag(theme)).join("");
            const moodCells = (creator.prefMoods || []).map((mood) => renderMoodTag(mood)).join("");
            return `
        <div class="${itemClass}" data-ccc-creator="${creator.id}">
          <div class="list-row">
            <div class="creator-card">
              ${renderCreatorAvatar(creator)}
              <div>
                <div class="item-title">${creator.name}</div>
                <div class="bar"><span style="width:${staminaPct}%"></span></div>
                <div class="muted">Stamina ${creator.stamina} / ${STAMINA_MAX}</div>
                <div class="muted">ID ${creator.id} | ${roleLabelText} | Skill <span class="grade-text" data-grade="${skillGrade}">${creator.skill}</span></div>
                <div class="time-row">${nationalityPill}</div>
                <div class="muted">Preferred Themes:</div>
                <div class="time-row">${themeCells}</div>
                <div class="muted">Preferred Moods:</div>
                <div class="time-row">${moodCells}</div>
              </div>
            </div>
            <div>
              <button type="button" data-sign="${creator.id}"${buttonState}${lockoutTitle}>${buttonLabel}</button>
              ${lockoutHint}
            </div>
          </div>
        </div>
      `;
        });
        const emptyMsg = filtersActive
            ? `No ${roleLabelText} Creator IDs match the current filters.`
            : pool.length
                ? `No ${roleLabelText} Creator IDs available.`
                : "No Creator IDs available.";
        const columnState = filters[role] === false ? " is-hidden" : "";
        const countLabel = filtersActive
            ? `${sortedCreators.length} of ${roleCreators.length} available`
            : `${roleCreators.length} available`;
        return `
      <div class="ccc-market-column${columnState}" data-role="${role}">
        <div class="ccc-market-head">
          <div class="ccc-market-title">${roleLabelText}s</div>
          <div class="tiny muted">${countLabel}</div>
        </div>
        <div class="list ccc-market-list">
          ${list.length ? list.join("") : `<div class="muted">${emptyMsg}</div>`}
        </div>
      </div>
    `;
    });
    listEl.innerHTML = columns.join("");
}
function renderWorkOrders() {
    const listEl = $("workOrderList");
    if (!listEl)
        return;
    if (!state.workOrders.length) {
        listEl.innerHTML = `<div class="muted">No active work orders.</div>`;
        return;
    }
    const now = state.time.epochMs;
    const list = state.workOrders.map((order) => {
        const track = getTrack(order.trackId);
        const crewIds = getWorkOrderCreatorIds(order);
        const crew = crewIds.map((id) => getCreator(id)).filter(Boolean);
        const lead = crew[0] || null;
        const crewLabel = lead ? (crew.length > 1 ? `${lead.name} +${crew.length - 1}` : lead.name) : "Unassigned";
        const stage = STAGES[order.stageIndex];
        const hoursLeft = order.status === "In Progress" ? Math.max(0, Math.ceil((order.endAt - now) / HOUR_MS)) : "Queued";
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${track ? track.title : "Unknown"}</div>
            <div class="muted">${stage.name} | ${crewLabel}</div>
          </div>
          <div class="pill">${hoursLeft}h</div>
        </div>
      </div>
    `;
    });
    listEl.innerHTML = list.join("");
}
let trackHistoryRequestId = 0;
function weekNumberFromEpochMs(epochMs) {
    if (!Number.isFinite(epochMs))
        return null;
    const startEpochMs = getStartEpochMsFromState();
    const offset = epochMs - startEpochMs;
    if (!Number.isFinite(offset))
        return null;
    return Math.max(1, Math.floor(offset / (WEEK_HOURS * HOUR_MS)) + 1);
}
function shortRegionLabel(region) {
    if (!region)
        return "";
    const nation = region.nation || "";
    const raw = region.id || "";
    let area = raw;
    if (nation && raw.startsWith(nation)) {
        area = raw.slice(nation.length).trim();
    }
    if (!area)
        area = raw;
    const shortArea = area === "Capital" ? "Cap" : area === "Elsewhere" ? "Else" : area;
    const label = nation ? `${nation} ${shortArea}`.trim() : shortArea;
    return label || raw;
}
function buildTrackHistoryScopes() {
    const scopes = [{ scope: "global", label: "Global", title: "Global (Gaia)" }];
    NATIONS.forEach((nation) => {
        scopes.push({ scope: `nation:${nation}`, label: nation, title: `Nation: ${nation}` });
    });
    REGION_DEFS.forEach((region) => {
        const label = shortRegionLabel(region) || region.id;
        scopes.push({ scope: `region:${region.id}`, label, title: region.label || region.id });
    });
    return scopes;
}
function renderTrackHistoryPanel(activeTab) {
    const panel = $("trackHistoryPanel");
    if (!panel || activeTab !== "history")
        return;
    const listEl = $("trackHistoryList");
    if (!listEl)
        return;
    const metaEl = $("trackHistoryMeta");
    const focusEra = getFocusedEra();
    const activeEras = getActiveEras().filter((entry) => entry.status === "Active");
    const fallbackEra = !focusEra && activeEras.length === 1 ? activeEras[0] : null;
    const targetEra = focusEra || fallbackEra;
    if (!targetEra) {
        panel.dataset.historyKey = "";
        panel.dataset.historyStatus = "";
        if (metaEl)
            metaEl.textContent = "Focus an active era to view chart history.";
        listEl.innerHTML = `<div class="muted">No active era selected.</div>`;
        return;
    }
    const tracks = state.tracks.filter((track) => track.status === "Released" && track.eraId === targetEra.id);
    if (metaEl)
        metaEl.textContent = `${targetEra.name} | ${formatCount(tracks.length)} released tracks`;
    if (!tracks.length) {
        panel.dataset.historyKey = "";
        panel.dataset.historyStatus = "";
        listEl.innerHTML = `<div class="muted">No released tracks for ${targetEra.name} yet.</div>`;
        return;
    }
    const chartWeek = Number.isFinite(state.meta?.chartHistoryLastWeek) ? state.meta.chartHistoryLastWeek : weekIndex() + 1;
    const trackKey = tracks.map((track) => track.id).sort().join(",");
    const cacheKey = `${targetEra.id}:${chartWeek}:${trackKey}`;
    if (panel.dataset.historyKey === cacheKey && panel.dataset.historyStatus === "ready") {
        return;
    }
    panel.dataset.historyKey = cacheKey;
    panel.dataset.historyStatus = "loading";
    listEl.innerHTML = `<div class="muted">Loading chart history...</div>`;
    const requestId = ++trackHistoryRequestId;
    (async () => {
        const weeks = await listChartWeeks();
        if (requestId !== trackHistoryRequestId)
            return;
        const currentWeek = weekIndex() + 1;
        let weekNumbers = weeks.map((entry) => entry.week).filter((week) => week <= currentWeek);
        if (!weekNumbers.length) {
            listEl.innerHTML = `<div class="muted">No chart history yet.</div>`;
            panel.dataset.historyStatus = "ready";
            return;
        }
        const releaseWeeks = tracks
            .map((track) => weekNumberFromEpochMs(track.releasedAt))
            .filter((week) => Number.isFinite(week));
        const minWeek = releaseWeeks.length ? Math.min(...releaseWeeks) : null;
        if (minWeek) {
            weekNumbers = weekNumbers.filter((week) => week >= minWeek);
        }
        if (!weekNumbers.length) {
            listEl.innerHTML = `<div class="muted">No chart history yet.</div>`;
            panel.dataset.historyStatus = "ready";
            return;
        }
        weekNumbers.sort((a, b) => b - a);
        const scopes = buildTrackHistoryScopes();
        const snapshotsByWeek = new Map();
        for (const week of weekNumbers) {
            const snapshots = await Promise.all(scopes.map((scope) => fetchChartSnapshot(scope.scope, week)));
            if (requestId !== trackHistoryRequestId)
                return;
            const scopeMap = new Map();
            snapshots.forEach((snapshot, index) => {
                if (snapshot)
                    scopeMap.set(scopes[index].scope, snapshot);
            });
            snapshotsByWeek.set(week, scopeMap);
        }
        if (requestId !== trackHistoryRequestId)
            return;
        const headerCells = scopes.map((scope) => `<th title="${scope.title}">${scope.label}</th>`).join("");
        const historyMarkup = tracks.map((track) => {
            const act = getAct(track.actId);
            const project = track.projectName || `${track.title} - Single`;
            const projectType = track.projectType || "Single";
            const releaseDate = track.releasedAt ? formatShortDate(track.releasedAt) : "TBD";
            const releaseWeek = weekNumberFromEpochMs(track.releasedAt);
            const rows = weekNumbers.map((week) => {
                const weekTitle = formatWeekRangeLabel(week);
                const weekLabel = `Week ${week}`;
                const scopeMap = snapshotsByWeek.get(week);
                const cells = scopes.map((scope) => {
                    const snapshot = scopeMap?.get(scope.scope);
                    const entry = snapshot?.entries?.find((item) => item.trackId === track.id);
                    let value = "-";
                    let cellClass = "chart-rank is-unreleased";
                    if (Number.isFinite(releaseWeek) && week >= releaseWeek) {
                        if (entry && Number.isFinite(entry.rank)) {
                            value = `#${entry.rank}`;
                            cellClass = "chart-rank";
                        }
                        else {
                            value = "DNC";
                            cellClass = "chart-rank is-dnc";
                        }
                    }
                    return `<td class="${cellClass}">${value}</td>`;
                }).join("");
                return `<tr><td title="${weekTitle}">${weekLabel}</td>${cells}</tr>`;
            }).join("");
            return `
        <div class="list-item track-history-item">
          <div class="list-row">
            <div>
              <div class="item-title">${track.title}</div>
              <div class="muted">Act: ${act ? act.name : "Unassigned"} | Project: ${project} (${projectType})</div>
              <div class="muted">Released ${releaseDate} | ${track.distribution || "Digital"}</div>
            </div>
          </div>
          <div class="track-history-table-wrap">
            <table class="chart-table track-history-table">
              <thead>
                <tr>
                  <th>Week</th>
                  ${headerCells}
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        </div>
      `;
        }).join("");
        listEl.innerHTML = historyMarkup;
        panel.dataset.historyStatus = "ready";
    })().catch(() => {
        if (requestId !== trackHistoryRequestId)
            return;
        listEl.innerHTML = `<div class="muted">Chart history unavailable.</div>`;
        panel.dataset.historyStatus = "ready";
    });
}
function renderTracks() {
    const activeView = state.ui.activeView || "";
    const createStage = state.ui.createStage || "sheet";
    const allTracks = state.tracks;
    const archivedTracks = allTracks.filter((track) => track.status === "Released");
    let tracks = allTracks.filter((track) => track.status !== "Released");
    if (activeView === "create") {
        if (createStage === "demo") {
            tracks = tracks.filter((track) => track.status === "Awaiting Demo");
        }
        else if (createStage === "master") {
            tracks = tracks.filter((track) => track.status === "Awaiting Master");
        }
    }
    const trackList = $("trackList");
    if (trackList) {
        if (!tracks.length) {
            let emptyMsg = activeView === "create" && createStage === "demo"
                ? "No sheet music awaiting demo recordings."
                : activeView === "create" && createStage === "master"
                    ? "No demos awaiting mastering."
                    : "No active tracks in catalog.";
            if (archivedTracks.length && emptyMsg === "No active tracks in catalog.") {
                emptyMsg = `${emptyMsg} Released tracks are in the Archive.`;
            }
            trackList.innerHTML = `<div class="muted">${emptyMsg}</div>`;
        }
        else {
            const focusEra = getFocusedEra();
            const now = state.time.epochMs;
            const list = tracks.map((track) => {
                const stageName = track.status === "In Production" ? STAGES[Math.min(track.stageIndex, STAGES.length - 1)].name : track.status;
                const grade = qualityGrade(track.quality);
                const act = getAct(track.actId);
                const project = track.projectName || `${track.title} - Single`;
                const projectType = track.projectType || "Single";
                const themeTag = renderThemeTag(track.theme);
                const alignTag = renderAlignmentTag(track.alignment);
                const actLine = activeView === "create"
                    ? `Project: ${project} (${projectType})`
                    : `Act: ${act ? act.name : "Unassigned"} | Project: ${project} (${projectType})`;
                const era = track.eraId ? getEraById(track.eraId) : null;
                const eraName = era ? era.name : null;
                const focusSuffix = focusEra && era && focusEra.id === era.id ? " | Focus" : "";
                const modifierName = track.modifier ? track.modifier.label : "None";
                const genreLabel = track.genre || "Genre: -";
                const activeOrder = track.status === "In Production"
                    ? state.workOrders.find((order) => order.trackId === track.id && order.status === "In Progress")
                    : null;
                let progressBlock = "";
                if (activeOrder && activeOrder.startAt && activeOrder.endAt) {
                    const total = Math.max(1, activeOrder.endAt - activeOrder.startAt);
                    const progress = clamp((now - activeOrder.startAt) / total, 0, 1);
                    const pct = Math.round(progress * 100);
                    const hoursLeft = Math.max(0, Math.ceil((activeOrder.endAt - now) / HOUR_MS));
                    progressBlock = `
        <div class="bar"><span style="width:${pct}%"></span></div>
        <div class="muted">Progress: ${pct}% • ${hoursLeft}h left</div>
      `;
                }
                else if (track.status === "In Production") {
                    progressBlock = `<div class="muted">Queued for studio time.</div>`;
                }
                return `
      <div class="list-item" data-entity-type="track" data-entity-id="${track.id}" data-entity-name="${track.title}" draggable="true">
        <div class="list-row">
          <div class="item-main">
            <div class="content-thumb" aria-hidden="true"></div>
            <div>
              <div class="item-title">${track.title}</div>
              <div class="muted">ID ${track.id} | Item: Track</div>
              <div class="muted">${genreLabel}</div>
              <div class="muted">${themeTag} ${alignTag}</div>
              <div class="muted">${actLine}</div>
              <div class="muted">Distribution: ${track.distribution || "Digital"}</div>
            </div>
          </div>
          <div class="badge grade" data-grade="${grade}">${grade}</div>
        </div>
        <div class="muted">Status: ${stageName} | Quality ${track.quality}${eraName ? ` | Era: ${eraName}${focusSuffix}` : ""}</div>
        ${progressBlock}
      </div>
    `;
            });
            trackList.innerHTML = list.join("");
        }
    }
    const archiveList = $("trackArchiveList");
    if (!archiveList)
        return;
    if (!archivedTracks.length) {
        archiveList.innerHTML = `<div class="muted">No released tracks yet.</div>`;
        return;
    }
    const sortedArchive = archivedTracks.slice().sort((a, b) => (b.releasedAt || 0) - (a.releasedAt || 0));
    const archiveItems = sortedArchive.map((track) => {
        const act = getAct(track.actId);
        const project = track.projectName || `${track.title} - Single`;
        const projectType = track.projectType || "Single";
        const releaseDate = track.releasedAt ? formatDate(track.releasedAt) : "TBD";
        const grade = qualityGrade(track.quality);
        const genreLabel = track.genre || "Genre: -";
        const actLine = `Act: ${act ? act.name : "Unassigned"} | Project: ${project} (${projectType})`;
        return `
      <div class="list-item" data-entity-type="track" data-entity-id="${track.id}" data-entity-name="${track.title}" draggable="true">
        <div class="list-row">
          <div class="item-main">
            <div class="content-thumb" aria-hidden="true"></div>
            <div>
              <div class="item-title">${track.title}</div>
              <div class="muted">ID ${track.id} | ${genreLabel}</div>
              <div class="muted">${actLine}</div>
              <div class="muted">Released ${releaseDate} | ${track.distribution || "Digital"}</div>
            </div>
          </div>
          <div class="badge grade" data-grade="${grade}">${grade}</div>
        </div>
      </div>
    `;
    });
    archiveList.innerHTML = archiveItems.join("");
    let activeTab = state.ui.trackPanelTab || "active";
    if (activeTab === "history" && !$("trackHistoryPanel")) {
        activeTab = "active";
    }
    document.querySelectorAll("[data-track-tab]").forEach((tab) => {
        const isActive = tab.dataset.trackTab === activeTab;
        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-pressed", String(isActive));
    });
    document.querySelectorAll("[data-track-panel]").forEach((panel) => {
        const isActive = panel.dataset.trackPanel === activeTab;
        panel.classList.toggle("hidden", !isActive);
    });
    renderTrackHistoryPanel(activeTab);
}
function renderRolloutStrategyPlanner() {
    const select = $("rolloutStrategySelect");
    const summary = $("rolloutStrategySummary");
    const weekInput = $("rolloutStrategyWeek");
    const dropInput = $("rolloutStrategyDropId");
    const eventTypeSelect = $("rolloutStrategyEventType");
    const eventContentInput = $("rolloutStrategyEventContent");
    const autoRunToggle = $("rolloutStrategyAutoRun");
    const expandBtn = $("rolloutStrategyExpand");
    const addDropBtn = $("rolloutStrategyAddDrop");
    const addEventBtn = $("rolloutStrategyAddEvent");
    const createBtn = $("rolloutStrategyCreate");
    if (!select || !summary)
        return;
    const era = getRolloutPlanningEra();
    if (!era) {
        select.innerHTML = `<option value="">No active era</option>`;
        summary.innerHTML = `<div class="muted">Focus an active era to plan a rollout strategy.</div>`;
        if (weekInput)
            weekInput.disabled = true;
        if (dropInput)
            dropInput.disabled = true;
        if (eventTypeSelect)
            eventTypeSelect.disabled = true;
        if (eventContentInput)
            eventContentInput.disabled = true;
        if (autoRunToggle)
            autoRunToggle.disabled = true;
        if (expandBtn)
            expandBtn.disabled = true;
        if (addDropBtn)
            addDropBtn.disabled = true;
        if (addEventBtn)
            addEventBtn.disabled = true;
        if (createBtn)
            createBtn.disabled = true;
        return;
    }
    const strategies = getRolloutStrategiesForEra(era.id);
    if (!strategies.length) {
        select.innerHTML = `<option value="">No strategy yet</option>`;
        summary.innerHTML = `<div class="muted">No rollout strategies yet. Click New to create one.</div>`;
        if (weekInput)
            weekInput.disabled = true;
        if (dropInput)
            dropInput.disabled = true;
        if (eventTypeSelect)
            eventTypeSelect.disabled = true;
        if (eventContentInput)
            eventContentInput.disabled = true;
        if (autoRunToggle)
            autoRunToggle.disabled = true;
        if (expandBtn)
            expandBtn.disabled = true;
        if (addDropBtn)
            addDropBtn.disabled = true;
        if (addEventBtn)
            addEventBtn.disabled = true;
        if (createBtn)
            createBtn.disabled = false;
        return;
    }
    select.innerHTML = strategies.map((strategy) => (`<option value="${strategy.id}">${strategy.id} | ${strategy.status}</option>`)).join("");
    const desiredId = state.ui.viewContext?.rolloutStrategyId || era.rolloutStrategyId || strategies[0].id;
    const activeStrategy = strategies.find((strategy) => strategy.id === desiredId) || strategies[0];
    select.value = activeStrategy.id;
    setSelectedRolloutStrategyId(activeStrategy.id);
    if (eventTypeSelect) {
        eventTypeSelect.innerHTML = Object.keys(PROMO_TYPE_DETAILS)
            .map((key) => `<option value="${key}">${PROMO_TYPE_DETAILS[key].label}</option>`)
            .join("");
        if (!eventTypeSelect.value)
            eventTypeSelect.value = DEFAULT_PROMO_TYPE;
    }
    if (weekInput) {
        weekInput.disabled = false;
        weekInput.max = String(activeStrategy.weeks.length);
        const parsed = Math.max(1, Math.min(activeStrategy.weeks.length, Number(weekInput.value) || 1));
        weekInput.value = String(parsed);
    }
    if (dropInput)
        dropInput.disabled = false;
    if (eventTypeSelect)
        eventTypeSelect.disabled = false;
    if (eventContentInput)
        eventContentInput.disabled = false;
    if (autoRunToggle) {
        autoRunToggle.disabled = false;
        autoRunToggle.checked = Boolean(activeStrategy.autoRun);
    }
    if (expandBtn)
        expandBtn.disabled = false;
    if (addDropBtn)
        addDropBtn.disabled = false;
    if (addEventBtn)
        addEventBtn.disabled = false;
    if (createBtn)
        createBtn.disabled = false;
    const header = `
    <div class="list-item">
      <div class="item-title">Strategy ${activeStrategy.id}</div>
      <div class="muted">Status: ${activeStrategy.status} | Source: ${activeStrategy.source} | Weeks: ${activeStrategy.weeks.length}</div>
    </div>
  `;
    const rows = activeStrategy.weeks.map((week, index) => {
        const dropCount = Array.isArray(week.drops) ? week.drops.length : 0;
        const eventCount = Array.isArray(week.events) ? week.events.length : 0;
        return `
      <div class="list-item">
        <div class="item-title">Week ${index + 1}</div>
        <div class="muted">Drops ${dropCount} | Events ${eventCount}</div>
      </div>
    `;
    });
    summary.innerHTML = rows.length ? header + rows.join("") : `${header}<div class="muted">No rollout items yet.</div>`;
}
function renderEraStatus() {
    const eraBox = $("eraStatus");
    if (!eraBox)
        return;
    renderFocusEraStatus();
    const activeEras = getActiveEras().filter((entry) => entry.status === "Active");
    const focusEra = getFocusedEra();
    if (!activeEras.length) {
        eraBox.innerHTML = `<div class="muted">No active Eras. Start one or schedule a release.</div>`;
        renderRolloutStrategyPlanner();
        return;
    }
    eraBox.innerHTML = activeEras.map((era) => {
        const act = getAct(era.actId);
        const stageName = ERA_STAGES[era.stageIndex] || "Complete";
        const stageWeeks = era.rolloutWeeks || ROLLOUT_PRESETS[1].weeks;
        const stageTotal = stageWeeks[era.stageIndex] || 0;
        const stageProgress = `${era.stageWeek}/${stageTotal} weeks`;
        const content = era.contentTypes?.length ? era.contentTypes.join(", ") : "Unassigned";
        const isFocused = focusEra && focusEra.id === era.id;
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${era.name}</div>
            <div class="muted">Act: ${act ? act.name : "Unknown"}</div>
            <div class="muted">Stage: ${stageName} | ${stageProgress}</div>
            <div class="muted">Status: ${era.status} | Started Week ${era.startedWeek}</div>
            <div class="muted">Content: ${content}</div>
          </div>
          <div class="actions">
            ${isFocused ? `<span class="pill">Focused</span>` : `<button type="button" class="ghost mini" data-era-focus="${era.id}">Focus</button>`}
            <button type="button" class="ghost mini" data-era-end="${era.id}">End Era</button>
          </div>
        </div>
      </div>
    `;
    }).join("");
    renderRolloutStrategyPlanner();
}
function renderReleaseDesk() {
    const queuedIds = new Set(state.releaseQueue.map((entry) => entry.trackId));
    const asapAt = getReleaseAsapAt();
    const asapLabel = formatDate(asapAt);
    const readyTracks = state.tracks.filter((track) => {
        if (queuedIds.has(track.id))
            return false;
        if (track.status === "Ready")
            return true;
        return isMasteringTrack(track);
    });
    const readyHtml = readyTracks.length
        ? readyTracks.map((track) => {
            const isReady = track.status === "Ready";
            const isMastering = isMasteringTrack(track);
            const act = getAct(track.actId);
            const actOptions = state.acts.map((entry) => `<option value="${entry.id}"${entry.id === track.actId ? " selected" : ""}>${entry.name}</option>`).join("");
            const actSelect = state.acts.length
                ? `
          <div class="field">
            <label>Assign Act</label>
            <div class="input-row">
              <select data-assign-act="${track.id}">
                <option value="">Select Act</option>
                ${actOptions}
              </select>
              <button type="button" class="ghost mini" data-act-recommend="${track.id}">Recommend</button>
            </div>
          </div>
        `
                : `<div class="muted">No Acts available. Create one in Roster.</div>`;
            const project = track.projectName || `${track.title} - Single`;
            const projectType = track.projectType || "Single";
            const themeTag = renderThemeTag(track.theme);
            const alignTag = renderAlignmentTag(track.alignment);
            const modifierName = track.modifier ? track.modifier.label : "None";
            const derivedGenre = track.genre || makeGenre(track.theme, track.mood);
            const grade = qualityGrade(track.quality);
            const rec = derivedGenre ? recommendReleasePlan({ ...track, genre: derivedGenre }) : recommendReleasePlan(track);
            const recLabel = `${rec.distribution} ${rec.scheduleKey === "now" ? "now" : rec.scheduleKey === "fortnight" ? "+14d" : "+7d"}`;
            const statusLabel = isReady ? "" : track.status === "In Production" ? "Mastering" : "Awaiting Master";
            const genreLabel = derivedGenre || "-";
            const hasAct = Boolean(track.actId);
            const canSchedule = hasAct && (isReady || isMastering);
            return `
        <div class="list-item">
          <div class="list-row">
            <div class="item-main">
              <div class="content-thumb" aria-hidden="true"></div>
              <div>
                <div class="item-title">${track.title}</div>
                <div class="muted">${genreLabel} | <span class="grade-text" data-grade="${grade}">${grade}</span>${isReady ? "" : ` | ${statusLabel}`}</div>
                <div class="muted">${themeTag} ${alignTag}</div>
                <div class="muted">Act: ${act ? act.name : "Unassigned"} | Project: ${project} (${projectType})</div>
                <div class="muted">Modifier: ${modifierName}</div>
                <div class="muted">Recommended: ${recLabel} - ${rec.reason}</div>
                ${actSelect}
              </div>
            </div>
            <div class="time-row">
              <div>
                <button type="button" data-release="asap" data-track="${track.id}"${canSchedule ? "" : " disabled"}>Release ASAP</button>
                <div class="time-meta">${asapLabel} (earliest Friday at midnight)</div>
              </div>
              <button type="button" class="ghost" data-release="week" data-track="${track.id}"${canSchedule ? "" : " disabled"}>+7d</button>
              <button type="button" class="ghost" data-release="fortnight" data-track="${track.id}"${canSchedule ? "" : " disabled"}>+14d</button>
              <button type="button" class="ghost" data-release="recommend" data-track="${track.id}"${canSchedule ? "" : " disabled"}>Use Recommended</button>
            </div>
          </div>
        </div>
      `;
        }).join("")
        : `<div class="muted">No ready or mastering tracks.</div>`;
    $("readyList").innerHTML = readyHtml;
    if (!state.releaseQueue.length) {
        $("releaseQueueList").innerHTML = `<div class="muted">No scheduled releases.</div>`;
        return;
    }
    const queue = state.releaseQueue.map((entry) => {
        const track = getTrack(entry.trackId);
        const date = formatDate(entry.releaseAt);
        const act = track ? getAct(track.actId) : null;
        const project = track ? (track.projectName || `${track.title} - Single`) : "Unknown";
        const projectType = track?.projectType || "Single";
        const distribution = entry.distribution || entry.note || "Digital";
        return `
      <div class="list-item">
        <div class="list-row">
          <div class="item-main">
            <div class="content-thumb" aria-hidden="true"></div>
            <div>
              <div class="item-title">${track ? track.title : "Unknown"}</div>
              <div class="muted">${date} | ${distribution}</div>
              <div class="muted">Act: ${track ? (act ? act.name : "Unassigned") : "Unknown"} | Project: ${project} (${projectType})</div>
            </div>
          </div>
        </div>
      </div>
    `;
    });
    $("releaseQueueList").innerHTML = queue.join("");
}
function collectTrendRanking() {
    const aggregate = aggregateTrendLedger(getTrendLedgerWindow());
    let ranking = Array.isArray(state.trendRanking) && state.trendRanking.length ? state.trendRanking : [];
    if (!ranking.length) {
        ranking = Object.entries(aggregate.totals || {})
            .sort((a, b) => b[1] - a[1])
            .map((entry) => entry[0]);
    }
    const chartPresence = new Set(aggregate.chartGenres || []);
    const visible = ranking.filter((trend) => (aggregate.totals?.[trend] || 0) > 0 && chartPresence.has(trend));
    return { visible, aggregate };
}
function buildTrendRankingList({ limit = null, showMore = false } = {}) {
    const { visible, aggregate } = collectTrendRanking();
    const displayed = typeof limit === "number" ? visible.slice(0, limit) : visible;
    if (!displayed.length) {
        return { markup: `<div class="muted">No trends yet.</div>`, visibleCount: 0, totalCount: visible.length };
    }
    const alignmentScores = aggregate.alignmentScores || {};
    const list = displayed.map((trend, index) => {
        const theme = themeFromGenre(trend);
        const mood = moodFromGenre(trend);
        const isTop = index < TREND_DETAIL_COUNT;
        const leader = isTop ? trendAlignmentLeader(trend, alignmentScores) : null;
        const detail = isTop
            ? `
        <div class="trend-detail">
          <div class="trend-detail-row">
            <span class="trend-detail-pill">Alignment push</span>
            ${leader
                ? `${renderAlignmentTag(leader.alignment)} <span class="muted">${leader.share}% of trend points</span>`
                : `<span class="muted">No clear alignment leader</span>`}
          </div>
        </div>
      `
            : "";
        const moreAction = showMore && index === 0
            ? `<button type="button" class="ghost mini" data-ranking-more="trends">More</button>`
            : "";
        return `
      <div class="list-item trend-item${isTop ? " trend-item--top" : ""}">
        <div class="list-row">
          <div>
            <div class="item-title">#${index + 1} ${formatGenreKeyLabel(trend)}</div>
            <div class="time-row">${renderThemeTag(theme)} ${renderMoodLabel(mood)}</div>
          </div>
          <div class="ranking-actions">
            <div class="badge warn">Hot</div>
            ${moreAction}
          </div>
        </div>
        ${detail}
      </div>
    `;
    });
    return { markup: list.join(""), visibleCount: displayed.length, totalCount: visible.length };
}
function renderTrends() {
    const listEl = $("trendList");
    if (!listEl)
        return;
    const scopeSelect = $("trendScopeSelect");
    const targetSelect = $("trendScopeTarget");
    const targetLabel = $("trendScopeTargetLabel");
    const scopeMeta = $("trendScopeMeta");
    if (scopeSelect) {
        scopeSelect.value = "global";
        scopeSelect.disabled = true;
    }
    if (targetLabel)
        targetLabel.textContent = "Global";
    if (targetSelect) {
        targetSelect.disabled = true;
        targetSelect.innerHTML = `<option value="global">Global</option>`;
    }
    const limit = getCommunityRankingLimit();
    const { markup, visibleCount, totalCount } = buildTrendRankingList({ limit, showMore: true });
    listEl.innerHTML = markup;
    if (scopeMeta) {
        if (!totalCount) {
            scopeMeta.textContent = "No trends available yet.";
        }
        else if (visibleCount >= totalCount) {
            scopeMeta.textContent = `Showing ${formatCount(totalCount)} global trends.`;
        }
        else {
            scopeMeta.textContent = `Showing Global Top ${formatCount(visibleCount)} of ${formatCount(totalCount)} trends.`;
        }
    }
}
function renderCommunityRankings() {
    renderCommunityLabels();
    renderTrends();
}
function renderRankingModal(category) {
    const titleEl = $("rankingModalTitle");
    const listEl = $("rankingModalList");
    const metaEl = $("rankingModalMeta");
    if (!titleEl || !listEl)
        return;
    if (category === "labels") {
        const { markup, totalCount } = buildLabelRankingList();
        titleEl.textContent = "Label Rankings";
        listEl.innerHTML = markup;
        if (metaEl) {
            metaEl.textContent = totalCount
                ? `Showing ${formatCount(totalCount)} ranked labels.`
                : "No labels ranked yet.";
        }
    }
    else if (category === "trends") {
        const { markup, totalCount } = buildTrendRankingList();
        titleEl.textContent = "Trend Rankings";
        listEl.innerHTML = markup;
        if (metaEl) {
            metaEl.textContent = totalCount
                ? `Showing ${formatCount(totalCount)} global trends.`
                : "No trends available yet.";
        }
    }
    openOverlay("rankingModal");
}
function renderCreateTrends() {
    const listEl = $("createTrendList");
    if (!listEl)
        return;
    const ranking = Array.isArray(state.trendRanking) && state.trendRanking.length ? state.trendRanking : (state.trends || []);
    const list = ranking.slice(0, TREND_DETAIL_COUNT).map((trend, index) => {
        const theme = themeFromGenre(trend);
        const mood = moodFromGenre(trend);
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">#${index + 1} ${formatGenreKeyLabel(trend)}</div>
            <div class="time-row">${renderThemeTag(theme)} ${renderMoodLabel(mood)}</div>
          </div>
          <div class="badge warn">Hot</div>
        </div>
      </div>
    `;
    });
    listEl.innerHTML = list.length ? list.join("") : `<div class="muted">No trends yet.</div>`;
}
function renderGenreIndex() {
    const listEl = $("genreList");
    if (!listEl)
        return;
    const themeFilter = state.ui.genreTheme || "All";
    const moodFilter = state.ui.genreMood || "All";
    const list = [];
    THEMES.forEach((theme) => {
        if (themeFilter !== "All" && theme !== themeFilter)
            return;
        MOODS.forEach((mood) => {
            if (moodFilter !== "All" && mood !== moodFilter)
                return;
            const genre = makeGenre(theme, mood);
            const label = formatGenreLabel(theme, mood);
            const hot = state.trends.includes(genre);
            list.push(`
        <div class="list-item">
          <div class="list-row">
            <div>
              <div class="item-title">${label}</div>
              <div class="muted">${genre}</div>
              <div class="muted">${renderThemeTag(theme)}</div>
            </div>
            ${hot ? `<div class="badge warn">Hot</div>` : `<div class="pill">Catalog</div>`}
          </div>
        </div>
      `);
        });
    });
    listEl.innerHTML = list.length ? list.join("") : `<div class="muted">No genres match the filters.</div>`;
}
function buildStudioEntries() {
    const entries = [];
    const playerSlots = getOwnedStudioSlots();
    const playerUsed = Math.min(getStudioUsageCounts().owned, playerSlots);
    for (let i = 1; i <= playerSlots; i += 1) {
        entries.push({
            id: `player-${i}`,
            ownerType: "player",
            ownerId: "player",
            ownerName: state.label.name || "Your Label",
            slotIndex: i,
            slotCount: playerSlots,
            occupied: i <= playerUsed
        });
    }
    const cap = STUDIO_CAP_PER_LABEL;
    state.rivals.forEach((rival) => {
        const momentum = typeof rival.momentum === "number" ? rival.momentum : 0.35;
        const used = clamp(Math.round(cap * momentum), 0, cap);
        for (let i = 1; i <= cap; i += 1) {
            entries.push({
                id: `${rival.id}-${i}`,
                ownerType: "rival",
                ownerId: rival.id,
                ownerName: rival.name,
                slotIndex: i,
                slotCount: cap,
                occupied: i <= used
            });
        }
    });
    return entries;
}
function renderStudiosList() {
    const listEl = $("studioList");
    if (!listEl)
        return;
    const filters = state.ui.studioFilters || {};
    const ownerFilter = state.ui.studioOwnerFilter || "all";
    const restrictToOwned = state.ui.activeView === "create";
    document.querySelectorAll("[data-studio-filter]").forEach((input) => {
        const key = input.dataset.studioFilter;
        if (!key || typeof filters[key] !== "boolean")
            return;
        input.checked = filters[key] !== false;
    });
    const ownerSelect = $("studioOwnerFilter");
    if (ownerSelect) {
        const options = [
            `<option value="all">All rivals</option>`,
            ...state.rivals.map((rival) => `<option value="${rival.id}">${rival.name}</option>`)
        ];
        ownerSelect.innerHTML = options.join("");
        const validOwners = new Set(["all", ...state.rivals.map((rival) => rival.id)]);
        if (!validOwners.has(ownerFilter))
            state.ui.studioOwnerFilter = "all";
        ownerSelect.value = state.ui.studioOwnerFilter || "all";
        ownerSelect.disabled = restrictToOwned || filters.unowned === false;
    }
    const showOwned = restrictToOwned ? true : filters.owned !== false;
    const showUnowned = restrictToOwned ? false : filters.unowned !== false;
    const showOccupied = filters.occupied !== false;
    const showUnoccupied = filters.unoccupied !== false;
    const filtered = buildStudioEntries().filter((entry) => {
        if (entry.ownerType === "player" && !showOwned)
            return false;
        if (entry.ownerType !== "player" && !showUnowned)
            return false;
        if (entry.ownerType !== "player" && ownerFilter !== "all" && entry.ownerId !== ownerFilter)
            return false;
        if (entry.occupied && !showOccupied)
            return false;
        if (!entry.occupied && !showUnoccupied)
            return false;
        return true;
    });
    if (!filtered.length) {
        listEl.innerHTML = `<div class="muted">No studios match the filters.</div>`;
        return;
    }
    listEl.innerHTML = filtered.map((entry) => {
        const ownership = entry.ownerType === "player" ? "Owned" : "Unowned";
        const status = entry.occupied ? "Occupied" : "Available";
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${entry.ownerName} Studio ${entry.slotIndex}</div>
            <div class="muted">${ownership} | Slot ${entry.slotIndex} of ${entry.slotCount}</div>
          </div>
          <div class="pill">${status}</div>
        </div>
      </div>
    `;
    }).join("");
}
function renderCharts() {
    document.querySelectorAll("#chartTabs .tab").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.chart === state.ui.activeChart);
    });
    let entries = [];
    let size = CHART_SIZES.global;
    let scopeLabel = "Global (Gaia)";
    let scopeKey = "global";
    if (state.ui.activeChart === "global") {
        entries = state.charts.global;
        size = CHART_SIZES.global;
        scopeLabel = "Global (Gaia)";
        scopeKey = "global";
    }
    else if (NATIONS.includes(state.ui.activeChart)) {
        entries = state.charts.nations[state.ui.activeChart] || [];
        size = CHART_SIZES.nation;
        scopeLabel = state.ui.activeChart;
        scopeKey = `nation:${state.ui.activeChart}`;
    }
    else {
        entries = state.charts.regions[state.ui.activeChart] || [];
        size = CHART_SIZES.region;
        const region = REGION_DEFS.find((r) => r.id === state.ui.activeChart);
        scopeLabel = region ? region.label : state.ui.activeChart;
        scopeKey = `region:${state.ui.activeChart}`;
    }
    const historyWeek = state.ui.chartHistoryWeek;
    const historySnapshot = state.ui.chartHistorySnapshot;
    let historyMissing = false;
    if (historyWeek) {
        if (historySnapshot && historySnapshot.week === historyWeek && historySnapshot.scope === scopeKey) {
            entries = historySnapshot.entries || [];
        }
        else {
            entries = [];
            historyMissing = true;
        }
    }
    entries = Array.isArray(entries) ? entries : [];
    const weekLabel = formatWeekRangeLabel(historyWeek || (weekIndex() + 1));
    if ($("chartWeekRange"))
        $("chartWeekRange").textContent = weekLabel;
    if ($("chartHistoryNotice")) {
        if (historyWeek && historyMissing) {
            $("chartHistoryNotice").textContent = "History view: no snapshot available for this week.";
        }
        else if (historyWeek) {
            $("chartHistoryNotice").textContent = `History view: ${weekLabel}`;
        }
        else {
            $("chartHistoryNotice").textContent = "";
        }
    }
    const meta = $("chartMeta");
    if (meta) {
        const weights = chartWeightsForScope(state.ui.activeChart || "global");
        const pct = (value) => Math.round(value * 100);
        meta.textContent = `Top ${size} | ${scopeLabel} | Weights S ${pct(weights.sales)}% / Stream ${pct(weights.streaming)}% / Air ${pct(weights.airplay)}% / Social ${pct(weights.social)}%`;
    }
    const globalLocked = state.ui.activeChart === "global" && entries.length < size;
    if (historyMissing) {
        $("chartList").innerHTML = `<div class="muted">No saved chart history for this week and scope.</div>`;
    }
    else if (globalLocked) {
        const remaining = Math.max(0, size - entries.length);
        $("chartList").innerHTML = `<div class="muted">Global chart unlocks when ${formatCount(size)} tracks are in circulation. ${formatCount(remaining)} more needed.</div>`;
    }
    else if (!entries.length) {
        $("chartList").innerHTML = `<div class="muted">No chart data yet.</div>`;
    }
    else {
        const rows = entries.map((entry) => {
            const track = entry.track || entry;
            const labelTag = renderLabelTag(track.label, track.country || "Annglora");
            const alignTag = renderAlignmentTag(track.alignment);
            const actName = track.actName || "-";
            const projectName = track.projectName || "-";
            const lastRank = entry.lastRank ? `LW ${entry.lastRank}` : "LW --";
            const peak = entry.peak ? `Peak ${entry.peak}` : "Peak --";
            const woc = entry.woc ? `WOC ${entry.woc}` : "WOC 0";
            const metrics = entry.metrics || {};
            return `
        <tr>
          <td class="chart-rank">#${entry.rank}</td>
          <td class="chart-title">
            <div class="item-title">${track.title}</div>
            <div class="muted">${track.genre}</div>
          </td>
          <td class="chart-label">${labelTag}</td>
          <td class="chart-act">
            <div>${actName}</div>
            <div class="muted">${projectName}</div>
          </td>
          <td class="chart-align">${alignTag}</td>
          <td class="chart-metrics">
            <div class="muted">${lastRank} | ${peak} | ${woc}</div>
            <div class="muted">Sales ${formatCount(metrics.sales || 0)} | Stream ${formatCount(metrics.streaming || 0)}</div>
            <div class="muted">Air ${formatCount(metrics.airplay || 0)} | Social ${formatCount(metrics.social || 0)}</div>
          </td>
          <td class="chart-score">${entry.score}</td>
        </tr>
      `;
        });
        if (entries.length < size) {
            for (let i = entries.length + 1; i <= size; i += 1) {
                rows.push(`
          <tr class="chart-empty">
            <td class="chart-rank">#${i}</td>
            <td class="chart-title">
              <div class="item-title">N/A</div>
              <div class="muted">N/A</div>
            </td>
            <td class="chart-label"><span class="muted">N/A</span></td>
            <td class="chart-act">
              <div>N/A</div>
              <div class="muted">N/A</div>
            </td>
            <td class="chart-align"><span class="muted">N/A</span></td>
            <td class="chart-metrics">
              <div class="muted">LW -- | Peak -- | WOC 0</div>
              <div class="muted">Sales N/A | Stream N/A</div>
              <div class="muted">Air N/A | Social N/A</div>
            </td>
            <td class="chart-score">N/A</td>
          </tr>
        `);
            }
        }
        const rowMarkup = rows.join("");
        $("chartList").innerHTML = `
      <div class="chart-table-wrap">
        <table class="chart-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Track</th>
              <th>Label</th>
              <th>Act / Project</th>
              <th>Alignment</th>
              <th>Stats</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            ${rowMarkup}
          </tbody>
        </table>
      </div>
    `;
    }
    const ranking = getLabelRanking(3);
    $("labelRankings").innerHTML = ranking.length
        ? ranking.map((row, index) => {
            const rival = getRivalByName(row[0]);
            const country = rival ? rival.country : state.label.country || "Annglora";
            return `
        <div class="list-item">
          <div class="list-row">
            <div>
              <div class="item-title">${index + 1}. ${renderLabelTag(row[0], country)}</div>
            </div>
            <div class="pill">${row[1]} pts</div>
          </div>
        </div>
      `;
        }).join("")
        : "";
}
function renderAchievements() {
    const listEl = $("achievementList");
    const summaryEl = $("achievementSummary");
    if (!listEl)
        return;
    const unlocked = new Set(state.meta.achievementsUnlocked || []);
    const rankIds = new Set(["REQ-01", "REQ-02", "REQ-03"]);
    listEl.innerHTML = ACHIEVEMENTS.map((achievement) => {
        const done = unlocked.has(achievement.id);
        const badgeClass = done ? "badge" : "badge warn";
        let progressText = "";
        if (typeof achievement.progress === "function" && typeof achievement.target !== "undefined") {
            const value = achievement.progress();
            if (rankIds.has(achievement.id)) {
                const best = value === null ? "--" : value;
                progressText = `Best #${best} / Target #${achievement.target}`;
            }
            else if (achievement.id === "REQ-08") {
                progressText = `Reach ${value.toFixed(2)}% / ${achievement.target}%`;
            }
            else if (achievement.id === "REQ-04") {
                progressText = `Best Q ${value} / ${achievement.target}`;
            }
            else if (achievement.id === "REQ-11") {
                progressText = `Net ${formatMoney(value)} / ${formatMoney(achievement.target)}`;
            }
            else {
                progressText = `${formatCount(value)} / ${formatCount(achievement.target)}`;
            }
        }
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${achievement.id} ${achievement.label}</div>
            <div class="muted">${achievement.desc}</div>
          </div>
          <div class="${badgeClass}">${done ? "Done" : "Active"}</div>
        </div>
        <div class="muted">${progressText} | Reward ${formatCount(achievement.exp)} EXP</div>
      </div>
    `;
    }).join("");
    if (summaryEl) {
        const count = Math.max(unlocked.size, state.meta.achievements || 0);
        const lock = state.meta.achievementsLocked ? "Achievements locked after bailout." : "";
        summaryEl.textContent = `CEO Requests ${count} / ${ACHIEVEMENT_TARGET}${lock ? ` | ${lock}` : ""}`;
    }
}
function renderQuests() {
    renderAchievements();
    const questList = $("questList");
    if (!questList)
        return;
    if (!state.quests.length) {
        questList.innerHTML = `<div class="muted">No active quests.</div>`;
        return;
    }
    const list = state.quests.map((quest) => {
        let detail = "";
        if (quest.type === "releaseCount")
            detail = `${quest.progress}/${quest.target} released`;
        if (quest.type === "trendRelease")
            detail = `${quest.progress}/${quest.target} released`;
        if (quest.type === "countryTop")
            detail = quest.bestRank ? `Best rank #${quest.bestRank}` : "No chart entries";
        if (quest.type === "cash")
            detail = `${formatMoney(quest.progress)} / ${formatMoney(quest.target)}`;
        const badgeClass = quest.done ? "badge" : "badge warn";
        const expReward = Math.round(quest.expReward ?? (quest.reward / 8));
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${quest.id}</div>
            <div class="muted">${quest.text}</div>
            <div class="muted">${quest.story}</div>
          </div>
          <div class="${badgeClass}">${quest.done ? "Done" : "Active"}</div>
        </div>
        <div class="muted">${detail} | Reward ${formatMoney(quest.reward)} + ${formatCount(expReward)} EXP</div>
      </div>
    `;
    });
    questList.innerHTML = list.join("");
}
function renderSocialFeed() {
    const listEl = $("socialFeed");
    if (!listEl)
        return;
    const showInternal = state.ui.socialShowInternal !== false;
    const filters = state.ui.socialFilters || {};
    const posts = [];
    if (showInternal) {
        state.events.forEach((entry) => {
            posts.push({
                id: `LOG-${entry.ts}`,
                ts: entry.ts,
                handle: "@System",
                title: entry.text,
                lines: [],
                type: "system",
                order: 3
            });
        });
    }
    (state.social?.posts || []).forEach((post) => {
        posts.push({ ...post, order: post.order || 0 });
    });
    const filtered = posts.filter((post) => {
        const type = post.type || "system";
        return filters[type] !== false;
    });
    filtered.sort((a, b) => (b.ts - a.ts) || (a.order - b.order));
    if (!filtered.length) {
        listEl.innerHTML = `<div class="muted">No eyeriSocial posts yet.</div>`;
        return;
    }
    const summarize = (value) => {
        if (!value)
            return "";
        const text = String(value).replace(/\s+/g, " ").trim();
        return text.length > 120 ? `${text.slice(0, 120)}...` : text;
    };
    listEl.innerHTML = filtered.map((post) => {
        const handle = post.handle || "@Gaia";
        const title = post.title || post.text || "Update";
        const fullLines = post.lines?.length ? post.lines : (post.text && post.title ? [post.text] : []);
        const emailTypes = ["quest", "contract", "receipt"];
        const preview = emailTypes.includes(post.type) ? "" : summarize(fullLines[0] || "");
        return `
      <div class="list-item social-item" data-post-id="${post.id}">
        <div class="list-row">
          <div>
            <div class="item-title">${title}</div>
            <div class="muted">${handle} | ${formatDate(post.ts)}</div>
            ${preview ? `<div class="muted">${preview}</div>` : ""}
          </div>
          <div class="pill">${post.type || "system"}</div>
        </div>
      </div>
    `;
    }).join("");
    const toggle = $("socialShowInternal");
    if (toggle)
        toggle.checked = Boolean(showInternal);
    document.querySelectorAll("[data-social-filter]").forEach((input) => {
        const key = input.dataset.socialFilter;
        if (!key)
            return;
        input.checked = filters[key] !== false;
    });
}
function renderEventLog() {
    renderSocialFeed();
    renderSystemLog();
}
function renderSystemLog() {
    const target = $("eventLogList");
    if (!target)
        return;
    if (!state.events.length) {
        target.innerHTML = `<div class="muted">No system updates yet.</div>`;
        return;
    }
    target.innerHTML = state.events.slice(0, 80).map((entry) => {
        const time = formatDate(entry.ts);
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${entry.kind?.toUpperCase() || "INFO"}</div>
            <div class="muted">${time}</div>
          </div>
        </div>
        <div class="muted">${entry.text}</div>
      </div>
    `;
    }).join("");
}
function renderMainMenu() {
    const list = [];
    for (let i = 1; i <= SLOT_COUNT; i += 1) {
        const data = getSlotData(i);
        const hasData = Boolean(data);
        const labelName = data?.label?.name || "Empty Game Slot";
        const savedAt = data?.meta?.savedAt ? new Date(data.meta.savedAt).toLocaleString() : "Never saved";
        const hours = data?.time?.totalHours || 0;
        const week = Math.floor(hours / WEEK_HOURS) + 1;
        const cash = data?.label?.cash ?? 0;
        const mode = getSlotGameMode(data);
        const modeLabel = mode ? shortGameModeLabel(mode.label) : "";
        const modeTag = mode && modeLabel
            ? `<span class="pill mode-pill" data-mode="${mode.id}" title="${mode.label}">${modeLabel}</span>`
            : "";
        const metaLine = data
            ? `${modeTag ? `${modeTag} ` : ""}Week ${week} | ${formatMoney(cash)} | ${savedAt}`
            : "Start a new label in this game slot.";
        list.push(`
      <div class="slot-card" data-slot-index="${i}" data-slot-has-data="${hasData ? "1" : "0"}" data-slot-default="${hasData ? "continue" : "new"}">
        <div class="slot-row">
          <div>
            <div class="item-title">Game Slot ${i}: ${data ? labelName : "Empty"}</div>
            <div class="muted">${metaLine}</div>
          </div>
          <div class="actions">
            <button type="button" data-slot-action="continue" data-slot-index="${i}" ${hasData ? "" : "disabled"}>Continue</button>
            <button type="button" class="ghost" data-slot-action="new" data-slot-index="${i}">Create New</button>
            ${hasData ? `<button type="button" class="ghost" data-slot-action="delete" data-slot-index="${i}">Delete</button>` : ""}
          </div>
        </div>
      </div>
    `);
    }
    $("slotList").innerHTML = list.join("");
    const closeBtn = $("menuCloseBtn");
    if (closeBtn) {
        closeBtn.disabled = !session.activeSlot;
    }
    const saveBtn = $("menuSaveBtn");
    if (saveBtn) {
        saveBtn.disabled = !session.activeSlot;
    }
    const autoSaveMinutes = $("autoSaveMinutes");
    const autoSaveToggle = $("autoSaveToggle");
    if (autoSaveMinutes && autoSaveToggle) {
        const options = [];
        for (let i = 2; i <= 10; i += 1) {
            options.push(`<option value="${i}">${i} min</option>`);
        }
        autoSaveMinutes.innerHTML = options.join("");
        autoSaveMinutes.value = String(state.meta.autoSave.minutes || 5);
        autoSaveToggle.checked = Boolean(state.meta.autoSave.enabled);
        const disabled = !session.activeSlot;
        autoSaveMinutes.disabled = disabled;
        autoSaveToggle.disabled = disabled;
    }
}
function openMainMenu() {
    document.body.classList.add("menu-open");
    if (state.time.speed !== "pause") {
        session.prevSpeed = state.time.speed;
    }
    setTimeSpeed("pause");
    renderMainMenu();
}
function closeMainMenu() {
    document.body.classList.remove("menu-open");
    if (session.prevSpeed) {
        setTimeSpeed(session.prevSpeed);
        session.prevSpeed = null;
    }
}
function setTimeSpeed(nextSpeed) {
    const speed = nextSpeed === "pause" || nextSpeed === "play" || nextSpeed === "fast" ? nextSpeed : "pause";
    const changed = state.time.speed !== speed;
    state.time.speed = speed;
    if (typeof window !== "undefined" && window.updateTimeControls) {
        window.updateTimeControls();
    }
    if (changed)
        saveToActiveSlot();
}
let gameLoopStarted = false;
function startGameLoop() {
    if (gameLoopStarted)
        return;
    gameLoopStarted = true;
    requestAnimationFrame(tick);
}
function updateGenrePreview() {
    const themeSelect = $("themeSelect");
    const moodSelect = $("moodSelect");
    if (!themeSelect || !moodSelect)
        return;
    const theme = themeSelect.value;
    const mood = moodSelect.value;
    if (!theme || !mood) {
        $("genrePreview").textContent = "Planned Genre: -";
        return;
    }
    $("genrePreview").textContent = `Planned Genre: ${formatGenreLabel(theme, mood)}`;
}
function stageLabelFromId(stageId) {
    if (stageId === "demo")
        return "Demo Recording";
    if (stageId === "master")
        return "Master Recording";
    return "Sheet Music";
}
function stageIndexFromId(stageId) {
    if (stageId === "demo")
        return 1;
    if (stageId === "master")
        return 2;
    return 0;
}
function renderActiveStudiosSelect(stageId, selectId, metaId) {
    const stageKey = stageId || "sheet";
    const select = $(selectId);
    if (!select)
        return;
    const stageIndex = stageIndexFromId(stageKey);
    const stageLabel = stageLabelFromId(stageKey);
    const labelEl = select.closest(".field")?.querySelector("label");
    if (labelEl)
        labelEl.textContent = `Active Studios (${stageLabel})`;
    const active = state.workOrders
        .filter((order) => order.status === "In Progress" && order.stageIndex === stageIndex)
        .map((order) => {
        const track = getTrack(order.trackId);
        const crewIds = getWorkOrderCreatorIds(order);
        const crew = crewIds.map((id) => getCreator(id)).filter(Boolean);
        const lead = crew[0] || null;
        const stageName = STAGES[order.stageIndex]?.name || stageLabel;
        const crewLabel = lead ? (crew.length > 1 ? `${lead.name} +${crew.length - 1}` : lead.name) : null;
        return {
            slot: Number.isFinite(order.studioSlot) ? order.studioSlot : null,
            trackTitle: track ? track.title : "Unknown Track",
            creatorName: crewLabel,
            stageName
        };
    })
        .sort((a, b) => (a.slot || 0) - (b.slot || 0));
    if (!active.length) {
        select.innerHTML = `<option value="">No active studios</option>`;
        select.disabled = true;
    }
    else {
        select.innerHTML = active
            .map((entry, index) => {
            const slotLabel = entry.slot ? `Studio ${entry.slot}` : `Studio ${index + 1}`;
            const creatorLabel = entry.creatorName ? ` | ${entry.creatorName}` : "";
            return `<option value="${entry.slot || index + 1}">${slotLabel} | ${entry.trackTitle}${creatorLabel}</option>`;
        })
            .join("");
        select.disabled = false;
    }
    const meta = $(metaId);
    if (meta) {
        const counts = getStudioUsageCounts();
        const ownedSlots = getOwnedStudioSlots();
        const totalSlots = ownedSlots + counts.leased;
        meta.textContent = `Active ${active.length}/${STAGE_STUDIO_LIMIT} | Global ${counts.total}/${totalSlots}`;
    }
}
function renderCreateStageTrackSelect() {
    const renderStageSelect = (stageId, selectId, metaId) => {
        const select = $(selectId);
        if (!select)
            return;
        const meta = $(metaId);
        const isDemo = stageId === "demo";
        const status = isDemo ? "Awaiting Demo" : "Awaiting Master";
        const tracks = state.tracks.filter((track) => track.status === status);
        if (!tracks.length) {
            select.innerHTML = `<option value="">No tracks awaiting ${isDemo ? "demo recording" : "mastering"}.</option>`;
            select.disabled = true;
            if (state.ui.createTrackIds)
                state.ui.createTrackIds[stageId] = null;
            if (state.ui.createStage === stageId)
                state.ui.createTrackId = null;
            if (meta)
                meta.textContent = `Awaiting ${isDemo ? "demo recordings" : "mastering"}: 0`;
            return;
        }
        select.innerHTML = tracks
            .map((track) => `<option value="${track.id}">${track.title}</option>`)
            .join("");
        const stored = state.ui.createTrackIds ? state.ui.createTrackIds[stageId] : null;
        const preferred = tracks.some((track) => track.id === stored)
            ? stored
            : tracks[0].id;
        if (state.ui.createTrackIds)
            state.ui.createTrackIds[stageId] = preferred;
        if (state.ui.createStage === stageId)
            state.ui.createTrackId = preferred;
        select.value = preferred;
        select.disabled = false;
        if (meta)
            meta.textContent = `Awaiting ${isDemo ? "demo recordings" : "mastering"}: ${tracks.length}`;
    };
    renderStageSelect("demo", "demoTrackSelect", "demoTrackMeta");
    renderStageSelect("master", "masterTrackSelect", "masterTrackMeta");
}
function getSheetStartPlan({ mode, theme, modifierId, cash } = {}) {
    const resolvedMode = mode || state.ui.recommendAllMode || "solo";
    const resolvedTheme = typeof theme === "string"
        ? theme
        : ($("themeSelect") ? $("themeSelect").value : "");
    const resolvedModifierId = typeof modifierId === "string"
        ? modifierId
        : ($("modifierSelect") ? $("modifierSelect").value : "None");
    const modifier = getModifier(resolvedModifierId);
    const assignedSongwriters = [...new Set(getTrackRoleIdsFromSlots("Songwriter"))];
    const req = staminaRequirement("Songwriter");
    const eligibleSongwriters = assignedSongwriters.filter((id) => {
        const creator = getCreator(id);
        return creator && creator.stamina >= req;
    });
    const cashOnHand = Number.isFinite(cash) ? cash : state.label.cash;
    const studioSlotsAvailable = getStudioAvailableSlots();
    const sheetStageSlots = getStageStudioAvailable(0);
    const capacityLimit = Math.min(studioSlotsAvailable, sheetStageSlots);
    const themeReady = !!resolvedTheme;
    if (resolvedMode === "collab") {
        const sheetCrew = assignedSongwriters;
        const sheetCost = sheetCrew.length ? getStageCost(0, modifier, sheetCrew) : 0;
        const canStart = themeReady
            && sheetCrew.length > 0
            && cashOnHand >= sheetCost
            && capacityLimit > 0;
        return {
            mode: resolvedMode,
            themeReady,
            modifier,
            assignedSongwriters,
            eligibleSongwriters,
            startableSongwriters: canStart ? sheetCrew : [],
            startableCount: canStart ? 1 : 0,
            capacityLimit,
            studioSlotsAvailable,
            sheetStageSlots,
            stoppedByCash: themeReady && sheetCrew.length > 0 && cashOnHand < sheetCost,
            stoppedByCapacity: themeReady && sheetCrew.length > 0 && capacityLimit <= 0,
            staminaRequirement: req
        };
    }
    if (!themeReady) {
        return {
            mode: resolvedMode,
            themeReady,
            modifier,
            assignedSongwriters,
            eligibleSongwriters,
            startableSongwriters: [],
            startableCount: 0,
            capacityLimit,
            studioSlotsAvailable,
            sheetStageSlots,
            stoppedByCash: false,
            stoppedByCapacity: false,
            staminaRequirement: req
        };
    }
    let remainingCash = cashOnHand;
    let remainingCapacity = capacityLimit;
    let stoppedByCash = false;
    let stoppedByCapacity = false;
    const startableSongwriters = [];
    for (let i = 0; i < eligibleSongwriters.length; i += 1) {
        if (remainingCapacity <= 0) {
            stoppedByCapacity = true;
            break;
        }
        const songwriterId = eligibleSongwriters[i];
        const stageCost = getStageCost(0, modifier, [songwriterId]);
        if (remainingCash < stageCost) {
            stoppedByCash = true;
            break;
        }
        startableSongwriters.push(songwriterId);
        remainingCash -= stageCost;
        remainingCapacity -= 1;
    }
    return {
        mode: resolvedMode,
        themeReady,
        modifier,
        assignedSongwriters,
        eligibleSongwriters,
        startableSongwriters,
        startableCount: startableSongwriters.length,
        capacityLimit,
        studioSlotsAvailable,
        sheetStageSlots,
        stoppedByCash,
        stoppedByCapacity,
        staminaRequirement: req
    };
}
function getCreateStageAvailability() {
    const theme = $("themeSelect") ? $("themeSelect").value : "";
    const modifierId = $("modifierSelect") ? $("modifierSelect").value : "None";
    const sheetPlan = getSheetStartPlan({ theme, modifierId });
    const sheetReadyCount = sheetPlan.startableCount;
    const studioSlotsAvailable = sheetPlan.studioSlotsAvailable;
    const sheetStageSlots = sheetPlan.sheetStageSlots;
    const sheetCanStart = sheetPlan.startableCount > 0;
    const sheetReason = (() => {
        if (!sheetPlan.themeReady)
            return "Select a Theme to start sheet music.";
        if (!sheetPlan.assignedSongwriters.length)
            return "Assign a Songwriter ID to start sheet music.";
        if (sheetPlan.mode === "solo" && sheetPlan.assignedSongwriters.length && !sheetPlan.eligibleSongwriters.length) {
            return `No available Songwriter creators with ${sheetPlan.staminaRequirement} stamina.`;
        }
        if (sheetStageSlots <= 0)
            return "No studio slots available for sheet music. Wait for a studio to free up.";
        if (studioSlotsAvailable <= 0)
            return "No studio slots available. Finish a production or expand capacity first.";
        if (sheetPlan.stoppedByCash && !sheetPlan.startableCount)
            return "Not enough cash to start sheet music.";
        return "";
    })();
    const demoTracks = state.tracks.filter((track) => track.status === "Awaiting Demo");
    const masterTracks = state.tracks.filter((track) => track.status === "Awaiting Master");
    const demoCount = demoTracks.length;
    const masterCount = masterTracks.length;
    const demoTrackId = (state.ui.createTrackIds ? state.ui.createTrackIds.demo : null)
        || $("demoTrackSelect")?.value
        || null;
    const demoTrack = demoTrackId ? getTrack(demoTrackId) : null;
    const mood = $("moodSelect") ? $("moodSelect").value : "";
    const moodValid = !!mood && (!Array.isArray(MOODS) || MOODS.includes(mood));
    const demoPerformers = getTrackRoleIdsFromSlots("Performer");
    const demoAssigned = demoPerformers.length
        ? normalizeRoleIds(demoPerformers, "Performer")
        : getTrackRoleIds(demoTrack, "Performer");
    const demoCost = demoAssigned.length ? getStageCost(1, demoTrack?.modifier, demoAssigned) : 0;
    const demoReady = demoTrack && demoTrack.status === "Awaiting Demo" && demoTrack.stageIndex === 1;
    const demoStageSlots = getStageStudioAvailable(1);
    const demoCanStart = !!demoReady
        && moodValid
        && demoAssigned.length > 0
        && state.label.cash >= demoCost
        && studioSlotsAvailable > 0
        && demoStageSlots > 0;
    const demoReason = (() => {
        if (!demoCount)
            return "No tracks awaiting demo recording.";
        if (!demoTrackId)
            return "Select a track awaiting demo recording.";
        if (!demoTrack)
            return "Track not found for demo recording.";
        if (!demoReady)
            return "Track is not ready for demo recording.";
        if (!mood)
            return "Select a Mood to start the demo recording.";
        if (!moodValid)
            return "Select a valid Mood to start the demo recording.";
        if (!demoAssigned.length)
            return "Assign a Performer ID to start the demo recording.";
        if (studioSlotsAvailable <= 0)
            return "No studio slots available. Finish a production or expand capacity first.";
        if (demoStageSlots <= 0)
            return "No studio slots available for demo recording. Wait for a studio to free up.";
        if (state.label.cash < demoCost)
            return "Not enough cash to start the demo recording.";
        return "";
    })();
    const masterTrackId = (state.ui.createTrackIds ? state.ui.createTrackIds.master : null)
        || $("masterTrackSelect")?.value
        || null;
    const masterTrack = masterTrackId ? getTrack(masterTrackId) : null;
    const alignmentInput = $("trackAlignment") ? $("trackAlignment").value : "";
    const resolvedAlignment = alignmentInput || masterTrack?.alignment || state.label.alignment || "";
    const alignmentValid = !!resolvedAlignment && (!Array.isArray(ALIGNMENTS) || ALIGNMENTS.includes(resolvedAlignment));
    const masterProducers = getTrackRoleIdsFromSlots("Producer");
    const masterAssigned = masterProducers.length
        ? normalizeRoleIds(masterProducers, "Producer")
        : getTrackRoleIds(masterTrack, "Producer");
    const masterCost = masterAssigned.length ? getStageCost(2, masterTrack?.modifier, masterAssigned) : 0;
    const masterReady = masterTrack
        && masterTrack.status === "Awaiting Master"
        && masterTrack.stageIndex === 2
        && !!masterTrack.mood;
    const masterStageSlots = getStageStudioAvailable(2);
    const masterCanStart = !!masterReady
        && alignmentValid
        && masterAssigned.length > 0
        && state.label.cash >= masterCost
        && studioSlotsAvailable > 0
        && masterStageSlots > 0;
    const masterReason = (() => {
        if (!masterCount)
            return "No tracks awaiting mastering.";
        if (!masterTrackId)
            return "Select a track awaiting mastering.";
        if (!masterTrack)
            return "Track not found for mastering.";
        if (!masterTrack.status || masterTrack.status !== "Awaiting Master" || masterTrack.stageIndex !== 2) {
            return "Track is not ready for mastering.";
        }
        if (!masterTrack.mood)
            return "Demo recording must assign a Mood before mastering.";
        if (!masterAssigned.length)
            return "Assign a Producer ID to start mastering.";
        if (!resolvedAlignment)
            return "Select a Content Alignment before mastering.";
        if (!alignmentValid)
            return "Select a valid Content Alignment before mastering.";
        if (studioSlotsAvailable <= 0)
            return "No studio slots available. Finish a production or expand capacity first.";
        if (masterStageSlots <= 0)
            return "No studio slots available for mastering. Wait for a studio to free up.";
        if (state.label.cash < masterCost)
            return "Not enough cash to start mastering.";
        return "";
    })();
    return {
        sheetReadyCount,
        demoCount,
        masterCount,
        sheetCanStart,
        demoCanStart,
        masterCanStart,
        sheetReason: sheetCanStart ? "" : (sheetReason || "Requirements not met."),
        demoReason: demoCanStart ? "" : (demoReason || "Requirements not met."),
        masterReason: masterCanStart ? "" : (masterReason || "Requirements not met.")
    };
}
function renderCreateStageControls() {
    const stageButtons = document.querySelectorAll("[data-create-stage]");
    if (!stageButtons.length)
        return;
    let stage = state.ui.createStage || "sheet";
    const validStages = ["sheet", "demo", "master"];
    if (!validStages.includes(stage)) {
        logEvent("Unknown creation stage selected. Reverting to Sheet Music.", "warn");
        stage = "sheet";
    }
    state.ui.createStage = stage;
    renderCreateStageTrackSelect();
    const availability = getCreateStageAvailability();
    const sheetCountEl = $("createStageCountSheet");
    if (sheetCountEl)
        sheetCountEl.textContent = `(${availability.sheetReadyCount} available)`;
    const demoCountEl = $("createStageCountDemo");
    if (demoCountEl)
        demoCountEl.textContent = `(${availability.demoCount} available)`;
    const masterCountEl = $("createStageCountMaster");
    if (masterCountEl)
        masterCountEl.textContent = `(${availability.masterCount} available)`;
    stageButtons.forEach((btn) => {
        const id = btn.dataset.createStage;
        if (!id || !validStages.includes(id))
            return;
        const isActive = id === stage;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
        const column = btn.closest(".create-stage-column");
        if (column)
            column.classList.toggle("is-active", isActive);
    });
    const desiredRole = stage === "demo"
        ? "Performer"
        : stage === "master"
            ? "Producer"
            : stage === "sheet"
                ? "Songwriter"
                : null;
    const currentRole = parseTrackRoleTarget(state.ui.slotTarget || "")?.role || null;
    if (desiredRole && currentRole !== desiredRole) {
        state.ui.slotTarget = `${TRACK_ROLE_TARGETS[desiredRole]}-1`;
    }
    if (stage === "demo" || stage === "master") {
        const tracked = state.ui.createTrackIds ? state.ui.createTrackIds[stage] : null;
        state.ui.createTrackId = tracked || null;
    }
    const sheetBtn = $("startSheetBtn");
    if (sheetBtn) {
        sheetBtn.textContent = "Start Sheet Music";
        sheetBtn.disabled = !availability.sheetCanStart;
        sheetBtn.title = availability.sheetCanStart ? "" : availability.sheetReason;
    }
    const sheetReason = $("startSheetReason");
    if (sheetReason) {
        sheetReason.textContent = availability.sheetReason || "";
        sheetReason.classList.toggle("hidden", !availability.sheetReason);
    }
    const demoBtn = $("startDemoBtn");
    if (demoBtn) {
        demoBtn.textContent = "Start Demo Recording";
        demoBtn.disabled = !availability.demoCanStart;
        demoBtn.title = availability.demoCanStart ? "" : availability.demoReason;
    }
    const demoReason = $("startDemoReason");
    if (demoReason) {
        demoReason.textContent = availability.demoReason || "";
        demoReason.classList.toggle("hidden", !availability.demoReason);
    }
    const masterBtn = $("startMasterBtn");
    if (masterBtn) {
        masterBtn.textContent = "Start Master Recording";
        masterBtn.disabled = !availability.masterCanStart;
        masterBtn.title = availability.masterCanStart ? "" : availability.masterReason;
    }
    const masterReason = $("startMasterReason");
    if (masterReason) {
        masterReason.textContent = availability.masterReason || "";
        masterReason.classList.toggle("hidden", !availability.masterReason);
    }
    const recommendSelect = $("recommendAllMode");
    if (recommendSelect)
        recommendSelect.value = state.ui.recommendAllMode || "solo";
    const recommendHelp = $("recommendAllHelp");
    if (recommendHelp) {
        recommendHelp.textContent = stage === "sheet"
            ? "Solo starts separate sheet music for each assigned songwriter. Collab fills one track with everyone."
            : "Solo/collab applies to sheet music only. Demo and master stages always run one track at a time.";
    }
    const advanced = $("createAdvancedOptions");
    if (advanced) {
        const showAdvanced = !!state.ui.createAdvancedOpen;
        advanced.classList.toggle("hidden", !showAdvanced);
    }
    renderActiveStudiosSelect("sheet", "activeStudiosSelectSheet", "activeStudiosMetaSheet");
    renderActiveStudiosSelect("demo", "activeStudiosSelectDemo", "activeStudiosMetaDemo");
    renderActiveStudiosSelect("master", "activeStudiosSelectMaster", "activeStudiosMetaMaster");
}
function renderActiveView(view) {
    const raw = view || state.ui.activeView || "dashboard";
    const active = raw === "promotion" ? "logs" : raw === "era" ? "eras" : raw;
    if (active === "dashboard") {
        renderDashboard();
    }
    else if (active === "charts") {
        renderCharts();
        renderReleaseDesk();
        renderSlots();
    }
    else if (active === "create") {
        renderCreateStageControls();
        renderSlots();
        renderTracks();
        renderCreateTrends();
        updateGenrePreview();
    }
    else if (active === "releases") {
        renderCalendarView();
        renderReleaseDesk();
        renderTracks();
        renderSlots();
    }
    else if (active === "eras") {
        renderEraStatus();
        renderSlots();
        renderTracks();
    }
    else if (active === "roster") {
        renderCreators();
        renderActs();
        renderSlots();
    }
    else if (active === "world") {
        renderMarket();
        renderPopulation();
        renderCommunityRankings();
        renderGenreIndex();
        renderEconomySummary();
        renderQuests();
        renderTopBar();
    }
    else if (active === "logs") {
        renderSlots();
        renderEventLog();
        renderWallet();
        renderResourceTickSummary();
        renderLossArchives();
    }
}
function renderAll({ save = true } = {}) {
    syncLabelWallets();
    renderTime();
    renderStats();
    renderTopBar();
    renderActiveView(state.ui.activeView);
    renderWallet();
    if (typeof window !== "undefined" && window.updateTimeControls) {
        window.updateTimeControls();
    }
    if (typeof window !== "undefined" && window.updateRecommendations) {
        window.updateRecommendations();
    }
    if (save)
        saveToActiveSlot();
}
export { session, state, $, clamp, formatMoney, formatCount, formatDate, openOverlay, closeOverlay, logEvent, makeTrackTitle, makeProjectTitle, makeLabelName, makeActName, makeEraName, handleFromName, makeAct, createTrack, startDemoStage, startMasterStage, getModifier, staminaRequirement, getCrewStageStats, getAdjustedStageHours, getAdjustedTotalStageHours, getStageCost, getAct, getCreator, getTrack, assignTrackAct, getStudioAvailableSlots, getEraById, getActiveEras, getFocusedEra, getRolloutPlanningEra, setFocusEraById, startEraForAct, endEraById, createRolloutStrategyForEra, getRolloutStrategyById, setSelectedRolloutStrategyId, addRolloutStrategyDrop, addRolloutStrategyEvent, expandRolloutStrategy, pickDistinct, uid, weekIndex, getReleaseAsapHours, normalizeCreator, postCreatorSigned, markCreatorPromo, getPromoFacilityForType, getPromoFacilityAvailability, reservePromoFacilitySlot, ensureMarketCreators, attemptSignCreator, listGameModes, DEFAULT_GAME_MODE, listGameDifficulties, DEFAULT_GAME_DIFFICULTY, renderAll, renderStats, renderSlots, renderActs, renderCreators, renderTracks, renderReleaseDesk, renderEraStatus, renderWallet, renderLossArchives, renderResourceTickSummary, renderActiveCampaigns, renderQuickRecipes, renderCalendarView, renderCalendarList, renderCreateStageControls, renderGenreIndex, renderCommunityRankings, renderStudiosList, renderRoleActions, renderCharts, renderSocialFeed, renderMainMenu, updateGenrePreview, formatWeekRangeLabel, renderAutoAssignModal, rankCandidates, getCreatorStaminaSpentToday, STAMINA_OVERUSE_LIMIT, STAMINA_OVERUSE_STRIKES, recommendTrackPlan, recommendActForTrack, recommendReleasePlan, recommendProjectType, getCommunityRankingLimit, renderRankingModal, assignToSlot, shakeElement, shakeSlot, shakeField, clearSlot, getSlotValue, getSlotElement, describeSlot, setSlotTarget, updateActMemberFields, advanceHours, releaseTrack, scheduleRelease, acceptBailout, declineBailout, refreshSelectOptions, computeCharts, buildMarketCreators, startGameLoop, setTimeSpeed, openMainMenu, closeMainMenu, saveToActiveSlot, markUiLogStart, getLossArchives, getSlotData, loadSlot, resetState, deleteSlot };
