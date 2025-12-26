// @ts-nocheck
import { storeChartSnapshot } from "./db.js";
import { DEFAULT_PROMO_TYPE, PROMO_TYPE_DETAILS, getPromoTypeDetails } from "./promo_types.js";
import { useCalendarProjection } from "./calendar.js";
import { uiHooks } from "./game/ui-hooks.js";
import { ACT_NAMES, CREATOR_NAME_PARTS, ERA_NAME_TEMPLATES, LABEL_NAMES, NAME_PARTS, PROJECT_TITLE_TEMPLATES, PROJECT_TITLES } from "./game/names.js";
const QUARTERS_PER_HOUR = typeof globalThis.QUARTERS_PER_HOUR === "number" ? globalThis.QUARTERS_PER_HOUR : 4;
const QUARTER_HOUR_MS = typeof globalThis.QUARTER_HOUR_MS === "number"
    ? globalThis.QUARTER_HOUR_MS
    : (typeof globalThis.HOUR_MS === "number" ? globalThis.HOUR_MS : 3600000) / QUARTERS_PER_HOUR;
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
const QUARTER_TICK_FRAME_LIMIT = 48 * QUARTERS_PER_HOUR;
const QUARTER_TICK_WARNING_THRESHOLD = 12 * QUARTERS_PER_HOUR;
const WEEKLY_UPDATE_WARN_MS = 50;
const QUARTER_TICK_WARN_MS = 25;
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
const COMMUNITY_LABEL_RANKING_LIMITS = [3, 8];
const COMMUNITY_LABEL_RANKING_DEFAULT = 8;
const COMMUNITY_TREND_RANKING_LIMITS = [3, 40];
const COMMUNITY_TREND_RANKING_DEFAULT = 40;
const COMMUNITY_LEGACY_RANKING_LIMITS = [8, 40];
const TREND_DETAIL_COUNT = 3;
const TREND_WINDOW_WEEKS = 4;
const MARKET_TRACK_ACTIVE_LIMIT = 600;
const MARKET_TRACK_ARCHIVE_LIMIT = 2400;
const AUDIENCE_TASTE_WINDOW_WEEKS = 8;
const AUDIENCE_ALIGNMENT_SCORE_SCALE = 42;
const AUDIENCE_BASE_WEIGHT = 0.45;
const AUDIENCE_CHART_WEIGHT = 0.35;
const AUDIENCE_RELEASE_WEIGHT = 0.2;
const AUDIENCE_PREF_DRIFT = 0.35;
const AUDIENCE_ICONIC_RISK_BOOST = 0.12;
const AUDIENCE_TREND_BONUS = 4;
const AUDIENCE_PREF_LIMIT = 3;
const WEEKLY_SCHEDULE = {
    releaseProcessing: { day: 5, hour: 0, minute: 0 },
    trendsUpdate: { day: 5, hour: 12, minute: 0 },
    chartUpdate: { day: 6, hour: 0, minute: 0 }
};
const ROLLOUT_EVENT_SCHEDULE = { day: 2, hour: 12, minute: 0 };
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
const RIVAL_COMPETE_CASH_BUFFER = Math.round(STARTING_CASH * 0.1);
const RIVAL_COMPETE_DROP_COST = 1200;
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
    Performer: "Recorder",
    Recorder: "Recorder",
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
            { name: "Recorder", actions: [{ verb: "record", detail: "Record demos that set the track Mood.", status: "live" }] },
            { name: "Producer", actions: [{ verb: "produce", detail: "Master recordings to lock Genre and base Quality.", status: "live" }] }
        ]
    },
    {
        role: "Act",
        occupations: [
            { name: "Promoter", actions: [{ verb: "promote", detail: "Run promo pushes for an Act alone or an Act plus content.", status: "live" }] }
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
            totalQuarters: 0,
            speed: "pause",
            secPerHourPlay: 2.5,
            secPerHourFast: 1,
            secPerQuarterPlay: 2.5 / QUARTERS_PER_HOUR,
            secPerQuarterFast: 1 / QUARTERS_PER_HOUR,
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
        audienceBias: { updatedWeek: null, nations: {}, regions: {} },
        genreRanking: [],
        charts: { global: [], nations: { Annglora: [], Bytenza: [], Crowlya: [] }, regions: {} },
        rivals: [],
        quests: [],
        events: [],
        resourceTickLedger: { hours: [], pendingHour: null },
        ui: {
            activeChart: "global",
            trendScopeType: "global",
            trendScopeTarget: "Annglora",
            labelRankingLimit: COMMUNITY_LABEL_RANKING_DEFAULT,
            trendRankingLimit: COMMUNITY_TREND_RANKING_DEFAULT,
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
            promoBudgets: Object.keys(PROMO_TYPE_DETAILS).reduce((acc, typeId) => {
                acc[typeId] = PROMO_TYPE_DETAILS[typeId].cost;
                return acc;
            }, {}),
            promoSlots: { actId: null, trackId: null },
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
    const totalQuarters = Number.isFinite(state.time?.totalQuarters) ? state.time.totalQuarters : null;
    const totalHours = typeof state.time?.totalHours === "number" ? state.time.totalHours : 0;
    const epoch = typeof state.time?.epochMs === "number" ? state.time.epochMs : BASE_EPOCH;
    if (Number.isFinite(totalQuarters)) {
        return epoch - totalQuarters * QUARTER_HOUR_MS;
    }
    return epoch - totalHours * HOUR_MS;
}
function applyGameMode(modeId) {
    const mode = getGameMode(modeId);
    const startEpochMs = Date.UTC(mode.startYear, 0, 1, 0, 0, 0);
    state.time.epochMs = startEpochMs;
    state.time.startEpochMs = startEpochMs;
    state.time.totalHours = 0;
    state.time.totalQuarters = 0;
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
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
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
function namePartText(part) {
    if (!part)
        return "";
    if (typeof part === "string")
        return part;
    if (typeof part === "object" && part.romanized)
        return String(part.romanized);
    return String(part);
}
function namePartHangul(part) {
    if (!part || typeof part === "string")
        return "";
    return String(part.hangul || "");
}
function pickBytenzaGivenPart(parts) {
    if (!parts)
        return null;
    const given2 = Array.isArray(parts.given2) ? parts.given2 : [];
    const given3 = Array.isArray(parts.given3) ? parts.given3 : [];
    const given4 = Array.isArray(parts.given4) ? parts.given4 : [];
    const fallback = Array.isArray(parts.given) ? parts.given : [];
    const roll = Math.random();
    if (roll < 0.85 && given2.length)
        return pickOne(given2);
    if (roll < 0.975 && given3.length)
        return pickOne(given3);
    if (given4.length)
        return pickOne(given4);
    if (given2.length)
        return pickOne(given2);
    if (given3.length)
        return pickOne(given3);
    if (fallback.length)
        return pickOne(fallback);
    return null;
}
function splitCreatorNameParts(name, country) {
    const cleaned = String(name || "").trim();
    if (!cleaned)
        return { givenName: "", surname: "" };
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (!parts.length)
        return { givenName: "", surname: "" };
    if (country === "Bytenza") {
        return {
            surname: parts[0] || "",
            givenName: parts.slice(1).join(" ").trim()
        };
    }
    return {
        givenName: parts[0] || "",
        surname: parts.slice(1).join(" ").trim()
    };
}
function formatCreatorFullName(country, givenName, surname) {
    const given = String(givenName || "").trim();
    const family = String(surname || "").trim();
    if (country === "Bytenza") {
        return `${family}${given ? ` ${given}` : ""}`.trim();
    }
    return `${given}${family ? ` ${family}` : ""}`.trim();
}
function buildCreatorNameParts(country, existingNames) {
    const parts = CREATOR_NAME_PARTS[country] || CREATOR_NAME_PARTS.Annglora;
    const existing = new Set(existingNames.filter(Boolean));
    for (let i = 0; i < 24; i += 1) {
        const givenPart = country === "Bytenza"
            ? (pickBytenzaGivenPart(parts) || pickOne(parts.given))
            : pickOne(parts.given);
        const surnamePart = pickOne(parts.surname);
        const givenName = namePartText(givenPart);
        const surname = namePartText(surnamePart);
        const name = formatCreatorFullName(country, givenName, surname);
        if (existing.has(name))
            continue;
        const givenNameHangul = namePartHangul(givenPart) || null;
        const surnameHangul = namePartHangul(surnamePart) || null;
        const nameHangul = country === "Bytenza" && surnameHangul && givenNameHangul
            ? `${surnameHangul}${givenNameHangul}`
            : null;
        return {
            name,
            givenName,
            surname,
            nameHangul,
            givenNameHangul,
            surnameHangul
        };
    }
    const fallbackGivenPart = country === "Bytenza"
        ? (pickBytenzaGivenPart(parts) || pickOne(parts.given))
        : pickOne(parts.given);
    const fallbackSurnamePart = pickOne(parts.surname);
    const fallbackGiven = namePartText(fallbackGivenPart);
    const fallbackSurname = namePartText(fallbackSurnamePart);
    const baseName = formatCreatorFullName(country, fallbackGiven, fallbackSurname);
    const suffix = existing.has(baseName) ? " II" : "";
    const name = `${baseName}${suffix}`.trim();
    const fallbackGivenHangul = namePartHangul(fallbackGivenPart) || null;
    const fallbackSurnameHangul = namePartHangul(fallbackSurnamePart) || null;
    const baseHangul = country === "Bytenza" && fallbackSurnameHangul && fallbackGivenHangul
        ? `${fallbackSurnameHangul}${fallbackGivenHangul}`
        : null;
    const nameHangul = baseHangul ? `${baseHangul}${suffix}`.trim() : null;
    return {
        name,
        givenName: fallbackGiven,
        surname: fallbackSurname,
        nameHangul,
        givenNameHangul: fallbackGivenHangul,
        surnameHangul: fallbackSurnameHangul
    };
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
function staminaRequirement(role) {
    const stage = STAGES.find((entry) => entry.role === role);
    return stage ? stage.stamina : 0;
}
function commitSlotChange({ updateStats = false } = {}) {
    uiHooks.renderSlots?.();
    uiHooks.refreshPromoTypes?.();
    if (updateStats)
        uiHooks.renderStats?.();
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
    if (targetId === "promo-act")
        return state.ui.promoSlots.actId;
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
    if (targetId === "promo-act")
        state.ui.promoSlots.actId = value;
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
        const scheduled = track ? state.releaseQueue.find((entry) => entry.trackId === track.id) : null;
        const isReleased = Boolean(track && track.status === "Released" && track.marketId);
        if (!track || (!isReleased && !scheduled)) {
            shakeSlot(targetId);
            logEvent("Promo slot requires a scheduled or released Track ID.", "warn");
            return;
        }
        const era = track.eraId ? getEraById(track.eraId) : null;
        if (!era || era.status !== "Active") {
            shakeSlot(targetId);
            logEvent("Promo slot requires a track from an active era.", "warn");
            return;
        }
    }
    if (entityType === "act" && targetId === "promo-act") {
        const act = getAct(entityId);
        if (!act) {
            shakeSlot(targetId);
            logEvent("Act not found for promo slot.", "warn");
            return;
        }
        const era = getLatestActiveEraForAct(act.id);
        if (!era || era.status !== "Active") {
            shakeSlot(targetId);
            logEvent("Promo slot requires an act with an active era.", "warn");
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
function formatMoney(amount) {
    const sign = amount < 0 ? "-" : "";
    const abs = Math.abs(amount);
    return `${sign}$${abs.toLocaleString("en-US")}`;
}
function roundMoney(value) {
    return Math.round(value * 100) / 100;
}
function formatCount(value) {
    return Math.round(value).toLocaleString("en-US");
}
function formatHourCountdown(value) {
    if (!Number.isFinite(value))
        return "-";
    const rounded = Math.max(0, Math.round(value * QUARTERS_PER_HOUR) / QUARTERS_PER_HOUR);
    const text = rounded.toFixed(2).replace(/\.00$/, "").replace(/0$/, "");
    return text;
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
const WEEK_ANCHOR_CACHE = {
    startEpochMs: null,
    anchorEpochMs: null,
    offsetQuarters: 0
};
function getWeekAnchorData() {
    const startEpochMs = getStartEpochMsFromState();
    if (!Number.isFinite(startEpochMs)) {
        return { anchorEpochMs: startEpochMs, offsetQuarters: 0 };
    }
    if (WEEK_ANCHOR_CACHE.startEpochMs !== startEpochMs) {
        const date = new Date(startEpochMs);
        const offsetMs = (((date.getUTCDay() * 24 + date.getUTCHours()) * 60 + date.getUTCMinutes()) * 60
            + date.getUTCSeconds()) * 1000 + date.getUTCMilliseconds();
        WEEK_ANCHOR_CACHE.startEpochMs = startEpochMs;
        WEEK_ANCHOR_CACHE.anchorEpochMs = startEpochMs - offsetMs;
        WEEK_ANCHOR_CACHE.offsetQuarters = Math.round(offsetMs / QUARTER_HOUR_MS);
    }
    return WEEK_ANCHOR_CACHE;
}
function getWeekAnchorEpochMs() {
    return getWeekAnchorData().anchorEpochMs;
}
function getWeekAnchorOffsetQuarters() {
    return getWeekAnchorData().offsetQuarters;
}
function weekIndex() {
    const totalQuarters = Number.isFinite(state.time?.totalQuarters)
        ? state.time.totalQuarters
        : Math.floor((state.time?.totalHours || 0) * QUARTERS_PER_HOUR);
    const anchorOffset = getWeekAnchorOffsetQuarters();
    return Math.floor((totalQuarters + anchorOffset) / (WEEK_HOURS * QUARTERS_PER_HOUR));
}
function weekIndexForEpochMs(epochMs) {
    const startEpoch = getWeekAnchorEpochMs();
    return Math.floor((epochMs - startEpoch) / (WEEK_HOURS * HOUR_MS));
}
function getUtcDayHourMinute(epochMs) {
    const date = new Date(epochMs);
    const minute = date.getUTCMinutes();
    return {
        day: date.getUTCDay(),
        hour: date.getUTCHours(),
        minute,
        quarter: Math.floor(minute / 15)
    };
}
function isScheduledTime(epochMs, schedule) {
    const current = getUtcDayHourMinute(epochMs);
    const targetMinute = Number.isFinite(schedule.minute) ? schedule.minute : 0;
    return current.day === schedule.day && current.hour === schedule.hour && current.minute === targetMinute;
}
function hoursUntilNextScheduledTime(schedule, epochMs = state.time.epochMs) {
    const current = getUtcDayHourMinute(epochMs);
    const targetMinute = Number.isFinite(schedule.minute) ? schedule.minute : 0;
    const dayDelta = (schedule.day - current.day + 7) % 7;
    const hourDelta = schedule.hour - current.hour;
    const minuteDelta = targetMinute - current.minute;
    let totalMinutes = dayDelta * 24 * 60 + hourDelta * 60 + minuteDelta;
    if (totalMinutes <= 0)
        totalMinutes += WEEK_HOURS * 60;
    return totalMinutes / 60;
}
function getReleaseAsapHours(epochMs = state.time.epochMs) {
    return hoursUntilNextScheduledTime(WEEKLY_SCHEDULE.releaseProcessing, epochMs);
}
function getReleaseAsapAt(epochMs = state.time.epochMs) {
    return epochMs + getReleaseAsapHours(epochMs) * HOUR_MS;
}
function getUtcDayIndex(epochMs) {
    return getUtcDayHourMinute(epochMs).day;
}
function startOfDayEpochMs(epochMs) {
    return Math.floor(epochMs / DAY_MS) * DAY_MS;
}
function endOfDayEpochMs(epochMs) {
    return startOfDayEpochMs(epochMs) + DAY_MS;
}
function weekStartEpochMs(weekNumber) {
    const safeWeek = Math.max(1, Math.floor(Number(weekNumber) || 1));
    return getWeekAnchorEpochMs() + (safeWeek - 1) * WEEK_HOURS * HOUR_MS;
}
function rolloutReleaseTimestampForWeek(weekNumber) {
    const weekStart = weekStartEpochMs(weekNumber);
    const targetMinute = Number.isFinite(WEEKLY_SCHEDULE.releaseProcessing.minute)
        ? WEEKLY_SCHEDULE.releaseProcessing.minute
        : 0;
    return weekStart
        + WEEKLY_SCHEDULE.releaseProcessing.day * DAY_MS
        + WEEKLY_SCHEDULE.releaseProcessing.hour * HOUR_MS
        + targetMinute * 60000;
}
function rolloutEventTimestampForWeek(weekNumber, eventIndex = 0) {
    const weekStart = weekStartEpochMs(weekNumber);
    const targetMinute = Number.isFinite(ROLLOUT_EVENT_SCHEDULE.minute) ? ROLLOUT_EVENT_SCHEDULE.minute : 0;
    const base = weekStart
        + ROLLOUT_EVENT_SCHEDULE.day * DAY_MS
        + ROLLOUT_EVENT_SCHEDULE.hour * HOUR_MS
        + targetMinute * 60000;
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
function listBroadcastStudios() {
    return Array.isArray(BROADCAST_STUDIOS) ? BROADCAST_STUDIOS : [];
}
function getBroadcastStudioDefaultId() {
    return listBroadcastStudios()[0]?.id || null;
}
function getBroadcastStudioById(studioId) {
    if (!studioId)
        return null;
    return listBroadcastStudios().find((studio) => studio.id === studioId) || null;
}
function broadcastSlotsForDay(dayIndex) {
    const studios = listBroadcastStudios();
    if (studios.length) {
        return studios.reduce((sum, studio) => sum + (studio.slotSchedule?.[dayIndex] || 0), 0);
    }
    return BROADCAST_SLOT_SCHEDULE[dayIndex] || 0;
}
function getBroadcastStudioAvailability(studioId, epochMs = state.time.epochMs) {
    const studio = getBroadcastStudioById(studioId);
    const dayIndex = getUtcDayIndex(epochMs);
    if (!studio) {
        const fallbackCapacity = BROADCAST_SLOT_SCHEDULE[dayIndex] || 0;
        return { capacity: fallbackCapacity, inUse: 0, available: fallbackCapacity, dayIndex };
    }
    const facilities = ensurePromoFacilities();
    const defaultStudioId = getBroadcastStudioDefaultId();
    const active = (facilities.broadcast?.bookings || []).filter((booking) => {
        if (booking.endsAt <= epochMs || booking.startsAt > epochMs)
            return false;
        const bookingStudioId = booking.studioId || defaultStudioId;
        return bookingStudioId === studio.id;
    });
    const capacity = studio.slotSchedule?.[dayIndex] || 0;
    const inUse = active.length;
    return { capacity, inUse, available: Math.max(0, capacity - inUse), dayIndex };
}
function getPromoTypeMeta(typeId) {
    return PROMO_TYPE_DETAILS[typeId] || getPromoTypeDetails(typeId);
}
function getPromoFacilityForType(typeId) {
    const details = getPromoTypeMeta(typeId);
    if (details?.facility)
        return details.facility;
    if (typeId === "livePerformance" || typeId === "interview")
        return "broadcast";
    if (typeId === "musicVideo" || typeId === "eyeriSocialAd")
        return "filming";
    return null;
}
function getBroadcastProgramById(programId) {
    if (!programId || !Array.isArray(BROADCAST_PROGRAMS))
        return null;
    return BROADCAST_PROGRAMS.find((program) => program.id === programId) || null;
}
function trackMatchesChartEntry(entry, trackId) {
    if (!entry || !trackId)
        return false;
    if (entry.track?.id === trackId)
        return true;
    if (entry.trackId === trackId)
        return true;
    return false;
}
function isTrackCharting(trackId) {
    if (!trackId)
        return false;
    if ((state.charts.global || []).some((entry) => trackMatchesChartEntry(entry, trackId)))
        return true;
    if (NATIONS.some((nation) => (state.charts.nations[nation] || []).some((entry) => trackMatchesChartEntry(entry, trackId)))) {
        return true;
    }
    if (REGION_DEFS.some((region) => (state.charts.regions[region.id] || []).some((entry) => trackMatchesChartEntry(entry, trackId)))) {
        return true;
    }
    return false;
}
function findActChartingTrack(actId, minQuality = 0) {
    if (!actId)
        return null;
    const candidates = state.tracks
        .filter((track) => track.actId === actId && track.status === "Released")
        .filter((track) => (track.quality || 0) >= minQuality)
        .filter((track) => isTrackCharting(track.id));
    if (!candidates.length)
        return null;
    return candidates.sort((a, b) => (b.quality || 0) - (a.quality || 0))[0];
}
function scoreBroadcastStudioFit(studio, { alignment, theme, mood, labelCountry }) {
    if (!studio)
        return -1;
    const audience = studio.audience || {};
    let score = 0;
    const scopeType = studio.scope?.type;
    const scopeId = studio.scope?.id;
    if (scopeType === "global")
        score += 1;
    if (scopeType === "nation" && labelCountry && scopeId === labelCountry)
        score += 3;
    if (scopeType === "region" && labelCountry) {
        const region = REGION_DEFS.find((entry) => entry.id === scopeId);
        if (region && region.nation === labelCountry)
            score += 2;
        if (Array.isArray(studio.scope?.regions) && studio.scope.regions.some((id) => REGION_DEFS.find((entry) => entry.id === id)?.nation === labelCountry)) {
            score += 1;
        }
    }
    if (alignment && Array.isArray(audience.alignment) && audience.alignment.includes(alignment))
        score += 3;
    if (theme && Array.isArray(audience.themes) && audience.themes.includes(theme))
        score += 2;
    if (mood && Array.isArray(audience.moods) && audience.moods.includes(mood))
        score += 1;
    return score;
}
function selectBroadcastStudioForPromo({ studioId, act, track, epochMs }) {
    const labelCountry = state.label?.country;
    const target = {
        alignment: track?.alignment || act?.alignment || null,
        theme: track?.theme || null,
        mood: track?.mood || null,
        labelCountry
    };
    if (studioId) {
        const availability = getBroadcastStudioAvailability(studioId, epochMs);
        return availability.available > 0 ? { studioId, availability } : null;
    }
    const studios = listBroadcastStudios();
    const scored = studios.map((studio) => {
        const availability = getBroadcastStudioAvailability(studio.id, epochMs);
        if (availability.available <= 0)
            return null;
        return { studioId: studio.id, availability, score: scoreBroadcastStudioFit(studio, target) };
    }).filter(Boolean);
    if (!scored.length)
        return null;
    scored.sort((a, b) => b.score - a.score);
    return scored[0];
}
function resolveBroadcastProgramForPromo(promoType, { actId, trackId }) {
    const details = getPromoTypeMeta(promoType);
    const programId = details?.broadcastProgramId;
    const program = getBroadcastProgramById(programId);
    if (!program)
        return { ok: true, program: null, eligibleTrack: null };
    const selectedTrack = trackId ? getTrack(trackId) : null;
    const minQuality = Number.isFinite(program.minQuality) ? program.minQuality : 0;
    const candidateTrack = selectedTrack
        || findActChartingTrack(actId, minQuality);
    if (program.requiresCharting) {
        if (!candidateTrack) {
            return { ok: false, program, reason: `${program.label} requires charting content for the Act.` };
        }
        if (!isTrackCharting(candidateTrack.id)) {
            return { ok: false, program, reason: `${program.label} requires a charting track.` };
        }
    }
    if (minQuality > 0) {
        if (!candidateTrack || (candidateTrack.quality || 0) < minQuality) {
            return { ok: false, program, reason: `${program.label} requires quality ${minQuality}+ content.` };
        }
    }
    return { ok: true, program, eligibleTrack: candidateTrack };
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
        ? broadcastSlotsForDay(dayIndex)
        : FILMING_STUDIO_SLOTS;
    const inUse = active.length;
    return { capacity, inUse, available: Math.max(0, capacity - inUse), dayIndex };
}
function reservePromoFacilitySlot(facilityId, promoType, trackId, options = {}) {
    if (!facilityId)
        return { ok: true, booking: null };
    const now = state.time.epochMs;
    const actId = options.actId || (trackId ? getTrack(trackId)?.actId : null);
    const facilities = ensurePromoFacilities();
    if (facilityId === "broadcast") {
        const programResult = resolveBroadcastProgramForPromo(promoType, { actId, trackId });
        if (!programResult.ok) {
            return { ok: false, reason: programResult.reason || "Broadcast program requirements not met." };
        }
        const studioPick = selectBroadcastStudioForPromo({
            studioId: options.studioId,
            act: actId ? getAct(actId) : null,
            track: trackId ? getTrack(trackId) : null,
            epochMs: now
        });
        if (!studioPick || studioPick.availability.available <= 0) {
            return { ok: false, reason: "No Broadcast Studio slots available today." };
        }
        const booking = {
            id: uid("PB"),
            facility: facilityId,
            promoType,
            trackId: trackId || null,
            actId: actId || null,
            studioId: studioPick.studioId,
            programId: programResult.program?.id || null,
            startsAt: now,
            endsAt: endOfDayEpochMs(now)
        };
        facilities[facilityId].bookings.push(booking);
        return { ok: true, booking, availability: studioPick.availability };
    }
    const availability = getPromoFacilityAvailability(facilityId, now);
    if (availability.available <= 0) {
        return {
            ok: false,
            reason: `No ${promoFacilityLabel(facilityId)} slots available today.`
        };
    }
    const booking = {
        id: uid("PF"),
        facility: facilityId,
        promoType,
        trackId: trackId || null,
        actId: actId || null,
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
    uiHooks.renderEventLog?.();
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
    const outcomeLine = era.outcome ? `Outcome: ${era.outcome}.` : "";
    postSocial({
        handle: "@eyeriStories",
        title: "Era complete",
        lines: [
            `${labelHandle}'s ${actHandle} closed the "${era.name}" era.`,
            `Status: Complete | Week ${era.completedWeek}.`,
            outcomeLine
        ].filter(Boolean),
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
    const labelName = state.label?.name;
    const archived = Array.isArray(state.meta?.marketTrackArchive) ? state.meta.marketTrackArchive : [];
    const releasePool = state.marketTracks.concat(archived);
    const releases = releasePool.filter((entry) => {
        const releasedAt = entry?.releasedAt;
        if (!Number.isFinite(releasedAt) || releasedAt < startAt || releasedAt > endAt)
            return false;
        const isPlayer = entry.isPlayer || (labelName && entry.label === labelName);
        if (!isPlayer)
            return false;
        if (entry.eraId)
            return entry.eraId === era.id;
        return entry.actId === era.actId;
    });
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
function getEraReleasedTracks(era) {
    if (!era)
        return [];
    return state.tracks.filter((track) => track.status === "Released" && track.eraId === era.id);
}
function dominantValue(values, fallback = null) {
    const counts = {};
    values.filter(Boolean).forEach((value) => {
        counts[value] = (counts[value] || 0) + 1;
    });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (entries.length)
        return entries[0][0];
    return fallback;
}
function summarizeEraEconomy(era) {
    const tracks = getEraReleasedTracks(era);
    const summary = {
        trackCount: tracks.length,
        revenue: 0,
        productionCost: 0,
        distributionFees: 0,
        promoCost: 0,
        costs: 0,
        profit: 0,
        alignment: null,
        genre: null
    };
    tracks.forEach((track) => {
        const economy = ensureTrackEconomy(track);
        if (!economy)
            return;
        summary.revenue += economy.revenue || 0;
        summary.productionCost += economy.productionCost || 0;
        summary.distributionFees += economy.distributionFees || 0;
        summary.promoCost += economy.promoCost || 0;
    });
    summary.costs = summary.productionCost + summary.distributionFees + summary.promoCost;
    summary.profit = summary.revenue - summary.costs;
    const actAlignment = getAct(era?.actId)?.alignment || state.label?.alignment || "Neutral";
    summary.alignment = dominantValue(tracks.map((track) => track.alignment), actAlignment || "Neutral");
    summary.genre = dominantValue(tracks.map((track) => track.genre), null);
    return summary;
}
function evaluateEraOutcome(era) {
    if (!era)
        return null;
    const summary = summarizeEraEconomy(era);
    const priorEraCount = state.era.history.filter((entry) => entry.actId === era.actId).length;
    const hasPrior = priorEraCount > 0;
    let outcome = "Flop";
    const profitable = summary.trackCount > 0 && summary.profit >= 0;
    if (profitable) {
        if (!hasPrior) {
            outcome = "Successful";
        }
        else if (summary.alignment === "Risky") {
            outcome = "Iconic";
        }
        else if (summary.alignment === "Safe") {
            outcome = "Mid";
        }
        else {
            outcome = "Successful";
        }
    }
    return { ...summary, outcome, hasPrior };
}
function applyEraOutcome(era) {
    const result = evaluateEraOutcome(era);
    if (!result)
        return null;
    era.outcome = result.outcome;
    era.outcomeStats = {
        trackCount: result.trackCount,
        revenue: result.revenue,
        productionCost: result.productionCost,
        distributionFees: result.distributionFees,
        promoCost: result.promoCost,
        costs: result.costs,
        profit: result.profit,
        alignment: result.alignment,
        genre: result.genre,
        hasPrior: result.hasPrior
    };
    return result;
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
    const nameParts = buildCreatorNameParts(origin, existing);
    return {
        id: uid("CR"),
        ...nameParts,
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
    if (!creator.givenName || !creator.surname) {
        const parsed = splitCreatorNameParts(creator.name, creator.country);
        if (!creator.givenName)
            creator.givenName = parsed.givenName;
        if (!creator.surname)
            creator.surname = parsed.surname;
    }
    if (!creator.name) {
        creator.name = formatCreatorFullName(creator.country, creator.givenName, creator.surname);
    }
    if (typeof creator.nameHangul !== "string" || !creator.nameHangul.trim())
        creator.nameHangul = null;
    if (typeof creator.givenNameHangul !== "string" || !creator.givenNameHangul.trim())
        creator.givenNameHangul = null;
    if (typeof creator.surnameHangul !== "string" || !creator.surnameHangul.trim())
        creator.surnameHangul = null;
    if (!creator.nameHangul && creator.country === "Bytenza" && creator.surnameHangul && creator.givenNameHangul) {
        creator.nameHangul = `${creator.surnameHangul}${creator.givenNameHangul}`;
    }
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
function setCreatorSignLockout(creatorId, lockedUntilEpochMs, reason = null) {
    if (!creatorId)
        return;
    ensureCccState();
    if (!Number.isFinite(lockedUntilEpochMs))
        return;
    const entry = { lockedUntilEpochMs };
    if (reason && typeof reason === "object") {
        entry.reason = reason.label || reason.code || null;
        entry.reasonCode = reason.code || null;
        entry.reasonDetail = reason.detail || null;
    }
    state.ccc.signLockoutsByCreatorId[creatorId] = entry;
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
function buildCreatorSignContext(creator) {
    const focusThemes = Array.isArray(state.label?.focusThemes) ? state.label.focusThemes : [];
    const focusMoods = Array.isArray(state.label?.focusMoods) ? state.label.focusMoods : [];
    const themeMatch = Boolean(creator.prefThemes?.some((theme) => focusThemes.includes(theme)));
    const moodMatch = Boolean(creator.prefMoods?.some((mood) => focusMoods.includes(mood)));
    const skillHigh = creator.skill >= 85;
    const skillLow = creator.skill <= 60;
    const pressure = marketPressureForRole(creator.role);
    let chance = 0.7;
    if (themeMatch)
        chance += 0.08;
    if (moodMatch)
        chance += 0.05;
    if (skillHigh)
        chance -= 0.08;
    if (skillLow)
        chance += 0.05;
    chance += pressure.acceptanceDelta;
    return {
        chance: clamp(chance, 0.35, 0.9),
        focusThemes,
        focusMoods,
        themeMatch,
        moodMatch,
        skillHigh,
        skillLow,
        pressure
    };
}
function creatorSignAcceptanceChance(creator) {
    return buildCreatorSignContext(creator).chance;
}
function formatPreferenceList(items, fallback) {
    if (!Array.isArray(items) || !items.length)
        return fallback;
    return items.slice(0, 2).join(" / ");
}
function describeCreatorSignDecline(creator, context) {
    const reasons = [];
    const themePrefs = formatPreferenceList(creator.prefThemes, "their themes");
    const moodPrefs = formatPreferenceList(creator.prefMoods, "their moods");
    const focusSet = (context.focusThemes?.length || 0) + (context.focusMoods?.length || 0) > 0;
    if (!focusSet) {
        reasons.push({
            code: "FOCUS_UNSET",
            weight: 2.6,
            label: "Focus undefined",
            text: "label focus is undefined; wants clearer direction"
        });
    }
    else if (!context.themeMatch && !context.moodMatch) {
        reasons.push({
            code: "FOCUS_MISMATCH",
            weight: 3,
            label: "Focus mismatch",
            text: `focus mismatch with ${themePrefs} / ${moodPrefs}`
        });
    }
    else {
        if (!context.themeMatch) {
            reasons.push({
                code: "THEME_MISMATCH",
                weight: 2.2,
                label: "Theme mismatch",
                text: `wants more ${themePrefs} themes`
            });
        }
        if (!context.moodMatch) {
            reasons.push({
                code: "MOOD_MISMATCH",
                weight: 1.8,
                label: "Mood mismatch",
                text: `wants more ${moodPrefs} moods`
            });
        }
    }
    if (context.skillHigh) {
        reasons.push({
            code: "HIGH_SKILL",
            weight: 2.4,
            label: "High expectations",
            text: "holding out for a premium offer"
        });
    }
    const marketHeadwind = context.pressure?.acceptanceDelta < -0.02;
    if (marketHeadwind) {
        reasons.push({
            code: "MARKET_HEAT",
            weight: 2,
            label: "Hot market",
            text: `${roleLabel(creator.role)} market is hot`
        });
    }
    if (!reasons.length) {
        reasons.push({
            code: "NOT_A_FIT",
            weight: 1,
            label: "Not a fit",
            text: "not a fit right now"
        });
    }
    reasons.sort((a, b) => b.weight - a.weight);
    const primary = reasons[0];
    const secondary = reasons.slice(1).find((reason) => reason.weight >= primary.weight * 0.75);
    const detail = secondary ? `${primary.text}; ${secondary.text}` : primary.text;
    return { code: primary.code, label: primary.label, detail };
}
function resolveCreatorSignDecision(creator) {
    const context = buildCreatorSignContext(creator);
    const roll = Math.random();
    if (roll < context.chance) {
        return { accepted: true, chance: context.chance, roll };
    }
    return { accepted: false, chance: context.chance, roll, decline: describeCreatorSignDecline(creator, context) };
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
    const decision = resolveCreatorSignDecision(creator);
    if (!decision.accepted) {
        const lockedUntilEpochMs = nextMidnightEpochMs(now);
        const decline = decision.decline || { code: "REJECTED", label: "Declined", detail: "" };
        const detail = decline.detail ? `: ${decline.detail}` : " the offer";
        setCreatorSignLockout(creatorId, lockedUntilEpochMs, decline);
        logEvent(`Creator ${creator.name} declined${detail}. Next attempt after the 12AM refresh.`, "warn");
        return { ok: false, kind: "REJECTED", reason: decline.code || "REJECTED", detail: decline.detail, cost, lockedUntilEpochMs };
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
        memberIds,
        promoWeeks: 0,
        lastPromoAt: null
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
        uiHooks.renderMarket?.();
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
        aiPlan: {
            lastPlannedWeek: null,
            lastHuskId: null,
            lastPlannedAt: null,
            activeHuskId: null,
            huskSource: null,
            windowStartWeekIndex: null,
            windowEndWeekIndex: null,
            competitive: false
        }
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
function ensureTrackEconomy(track) {
    if (!track)
        return null;
    if (!track.economy || typeof track.economy !== "object")
        track.economy = {};
    const economy = track.economy;
    economy.productionCost = Math.round(economy.productionCost || 0);
    economy.distributionFees = Math.round(economy.distributionFees || 0);
    economy.promoCost = Math.round(economy.promoCost || 0);
    economy.revenue = Math.round(economy.revenue || 0);
    economy.chartPoints = Math.round(economy.chartPoints || 0);
    economy.sales = Math.round(economy.sales || 0);
    economy.streaming = Math.round(economy.streaming || 0);
    economy.airplay = Math.round(economy.airplay || 0);
    economy.social = Math.round(economy.social || 0);
    economy.lastWeek = Number.isFinite(economy.lastWeek) ? economy.lastWeek : null;
    economy.lastRevenue = Math.round(economy.lastRevenue || 0);
    economy.lastChartPoints = Math.round(economy.lastChartPoints || 0);
    economy.lastMetrics = economy.lastMetrics && typeof economy.lastMetrics === "object" ? economy.lastMetrics : null;
    return economy;
}
function recordTrackProductionCost(track, cost) {
    const economy = ensureTrackEconomy(track);
    if (!economy || !Number.isFinite(cost) || cost <= 0)
        return;
    economy.productionCost = Math.round(economy.productionCost + cost);
}
function recordTrackDistributionFee(track, fee) {
    const economy = ensureTrackEconomy(track);
    if (!economy || !Number.isFinite(fee) || fee <= 0)
        return;
    economy.distributionFees = Math.round(economy.distributionFees + fee);
}
function recordTrackPromoCost(track, cost) {
    const economy = ensureTrackEconomy(track);
    if (!economy || !Number.isFinite(cost) || cost <= 0)
        return;
    economy.promoCost = Math.round(economy.promoCost + cost);
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
            outcome: typeof era.outcome === "string" ? era.outcome : null,
            outcomeStats: era.outcomeStats || null,
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
    const outcome = applyEraOutcome(era);
    archiveEra(era, "Ended");
    generateEraRolloutHusk(era);
    if (state.ui.focusEraId === era.id)
        state.ui.focusEraId = null;
    const outcomeLabel = outcome?.outcome ? ` | Outcome: ${outcome.outcome}` : "";
    logEvent(`Era ended: ${era.name}${reason ? ` (${reason})` : ""}${outcomeLabel}.`);
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
    uiHooks.renderSlots?.();
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
        logEvent("Not enough cash to create sheet music.", "warn");
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
        marketId: null,
        promo: {
            preReleaseWeeks: 0,
            musicVideoUsed: false
        }
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
    recordTrackProductionCost(track, sheetCost);
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
        logEvent("Select a Mood to create the demo recording.", "warn");
        return false;
    }
    if (Array.isArray(MOODS) && !MOODS.includes(mood)) {
        shakeField("moodSelect");
        logEvent("Select a valid Mood to create the demo recording.", "warn");
        return false;
    }
    const selectedPerformers = listFromIds(performerIds);
    const assignedPerformers = selectedPerformers.length
        ? normalizeRoleIds(selectedPerformers, "Performer")
        : getTrackRoleIds(track, "Performer");
    if (!assignedPerformers.length) {
        shakeSlot(`${TRACK_ROLE_TARGETS.Performer}-1`);
        logEvent("Assign a Recorder ID to create the demo recording.", "warn");
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
        logEvent("Not enough cash to create the demo recording.", "warn");
        return false;
    }
    track.creators.performerIds = assignedPerformers;
    track.mood = mood;
    track.status = "In Production";
    refreshTrackQuality(track, 1);
    if (!scheduleStage(track, 1))
        return false;
    state.label.cash -= stageCost;
    recordTrackProductionCost(track, stageCost);
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
        logEvent("Assign a Producer ID to create the master recording.", "warn");
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
        logEvent("Not enough cash to create the master recording.", "warn");
        return false;
    }
    track.creators.producerIds = assignedProducers;
    track.alignment = resolvedAlignment;
    track.status = "In Production";
    refreshTrackQuality(track, 2);
    if (!scheduleStage(track, 2))
        return false;
    state.label.cash -= stageCost;
    recordTrackProductionCost(track, stageCost);
    return true;
}
function initWorkOrderStaminaMeta(order, stage, { legacyPaid = false } = {}) {
    if (!order || !stage)
        return;
    const hours = Number.isFinite(order.hours) ? order.hours : stage.hours || 1;
    const totalTicks = Math.max(1, Math.ceil(hours * QUARTERS_PER_HOUR));
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
function getReleaseDistributionFee(distribution) {
    const fee = Number.isFinite(ECONOMY_BASELINES?.physicalReleaseFee) ? ECONOMY_BASELINES.physicalReleaseFee : 0;
    if (distribution === "Physical" || distribution === "Both")
        return Math.max(0, fee);
    return 0;
}
function applyReleaseDistributionFee(distribution) {
    const fee = getReleaseDistributionFee(distribution);
    if (!fee)
        return { ok: true, fee: 0 };
    if (state.label.cash < fee)
        return { ok: false, fee };
    state.label.cash -= fee;
    return { ok: true, fee };
}
function estimatePhysicalUnitPrice(projectType = "Single") {
    const base = Number.isFinite(ECONOMY_BASELINES?.physicalSingle) ? ECONOMY_BASELINES.physicalSingle : 4.99;
    const typeKey = String(projectType || "Single").toLowerCase();
    const multipliers = { single: 1, ep: 1.55, album: 2.25 };
    const multiplier = multipliers[typeKey] || 1;
    return roundMoney(base * multiplier);
}
function estimatePhysicalUnitCost(projectType = "Single") {
    const ratio = Number.isFinite(ECONOMY_BASELINES?.physicalUnitCostRatio) ? ECONOMY_BASELINES.physicalUnitCostRatio : 0.35;
    const unitPrice = estimatePhysicalUnitPrice(projectType);
    return roundMoney(Math.max(0.5, unitPrice * ratio));
}
function recommendPhysicalRun(track, { act = null, label = state.label } = {}) {
    if (!track) {
        return {
            units: 0,
            unitPrice: 0,
            unitCost: 0,
            estimatedCost: 0,
            estimatedGross: 0,
            estimatedNet: 0,
            demandUnits: 0,
            budgetCap: null,
            isBudgetCapped: false
        };
    }
    const projectType = track.projectType || "Single";
    const unitPrice = estimatePhysicalUnitPrice(projectType);
    const unitCost = estimatePhysicalUnitCost(projectType);
    const fans = Math.max(0, label?.fans || 0);
    const baseDemand = Math.pow(Math.max(1, fans), 0.6) * 0.35;
    const qualitySeed = Number.isFinite(track.quality) && track.quality > 0
        ? track.quality
        : (Number.isFinite(track.qualityPotential) ? track.qualityPotential : 60);
    const qualityFactor = clamp(0.6 + qualitySeed / 120, 0.6, 1.4);
    const derivedGenre = track.genre || (track.theme && track.mood ? makeGenre(track.theme, track.mood) : "");
    const trendMatch = track.trendAtRelease || (derivedGenre && state.trends.includes(derivedGenre));
    const trendFactor = trendMatch ? 1.15 : 0.9;
    const typeKey = String(projectType).toLowerCase();
    const projectFactor = typeKey === "album" ? 2.1 : typeKey === "ep" ? 1.5 : 1;
    const memberCount = Math.max(1, act?.memberIds?.length || 1);
    const actFactor = clamp(0.95 + Math.min(memberCount, 5) * 0.05, 0.95, 1.2);
    const alignmentFactor = act?.alignment && track.alignment && act.alignment === track.alignment ? 1.05 : 1;
    const promoWeeks = Math.max(0, track.promo?.preReleaseWeeks || 0);
    const promoFactor = clamp(1 + promoWeeks * 0.05, 1, 1.25);
    const basePrice = Number.isFinite(ECONOMY_BASELINES?.physicalSingle) ? ECONOMY_BASELINES.physicalSingle : 4.99;
    const priceFactor = clamp(1.05 - (unitPrice / basePrice) * 0.08, 0.75, 1.05);
    let demandUnits = baseDemand * qualityFactor * trendFactor * projectFactor * actFactor * alignmentFactor * promoFactor * priceFactor;
    const roundTo = Number.isFinite(ECONOMY_BASELINES?.physicalRunRound) ? ECONOMY_BASELINES.physicalRunRound : 50;
    const minUnits = Number.isFinite(ECONOMY_BASELINES?.physicalRunMin) ? ECONOMY_BASELINES.physicalRunMin : 200;
    const maxUnits = Number.isFinite(ECONOMY_BASELINES?.physicalRunMax) ? ECONOMY_BASELINES.physicalRunMax : 25000;
    const budgetCap = unitCost > 0 && label?.cash ? Math.floor(label.cash / (unitCost * 1.1)) : Infinity;
    if (Number.isFinite(budgetCap))
        demandUnits = Math.min(demandUnits, Math.max(0, budgetCap));
    const roundedUnits = roundTo ? Math.round(demandUnits / roundTo) * roundTo : Math.round(demandUnits);
    let units = roundedUnits;
    if (Number.isFinite(budgetCap) && budgetCap < minUnits) {
        units = roundTo ? Math.round(budgetCap / roundTo) * roundTo : Math.round(budgetCap);
    }
    else {
        units = clamp(units, minUnits, maxUnits);
    }
    units = Math.max(0, units);
    const setupFee = getReleaseDistributionFee("Physical");
    const estimatedCost = roundMoney(units * unitCost + setupFee);
    const estimatedGross = roundMoney(units * unitPrice);
    const estimatedNet = roundMoney(estimatedGross - estimatedCost);
    return {
        units,
        unitPrice,
        unitCost,
        estimatedCost,
        estimatedGross,
        estimatedNet,
        demandUnits: Math.round(demandUnits),
        budgetCap: Number.isFinite(budgetCap) ? budgetCap : null,
        isBudgetCapped: Number.isFinite(budgetCap) && demandUnits >= budgetCap
    };
}
function releaseTrack(track, note, distribution, { chargeFee = false } = {}) {
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
    const dist = distribution || track.distribution || "Digital";
    let feeNote = "";
    if (chargeFee) {
        const feeResult = applyReleaseDistributionFee(dist);
        if (!feeResult.ok) {
            logEvent(`Cannot release track: insufficient funds for ${dist} distribution fee (${formatMoney(feeResult.fee)}).`, "warn");
            return false;
        }
        if (feeResult.fee) {
            recordTrackDistributionFee(track, feeResult.fee);
            feeNote = ` Distribution fee: ${formatMoney(feeResult.fee)}.`;
        }
    }
    ensureEraForTrack(track, "Release");
    track.status = "Released";
    track.releasedAt = state.time.epochMs;
    track.trendAtRelease = state.trends.includes(track.genre);
    track.distribution = dist;
    const preReleaseWeeks = Math.max(0, track.promo?.preReleaseWeeks || 0);
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
        promoWeeks: preReleaseWeeks
    };
    track.marketId = marketEntry.id;
    state.marketTracks.push(marketEntry);
    if (track.promo)
        track.promo.preReleaseWeeks = 0;
    markCreatorRelease(getTrackCreatorIds(track), track.releasedAt);
    logEvent(`Released "${track.title}" to market${note ? ` (${note})` : ""}.${feeNote}`);
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
    const feeResult = applyReleaseDistributionFee(dist);
    if (!feeResult.ok) {
        logEvent(`Cannot schedule release: insufficient funds for ${dist} distribution fee (${formatMoney(feeResult.fee)}).`, "warn");
        return false;
    }
    if (feeResult.fee) {
        recordTrackDistributionFee(track, feeResult.fee);
    }
    const releaseNote = note || dist;
    state.releaseQueue.push({ id: uid("RQ"), trackId: track.id, releaseAt, note: releaseNote, distribution: dist });
    if (isReady)
        track.status = "Scheduled";
    ensureEraForTrack(track, "Release scheduled");
    const feeNote = feeResult.fee ? ` Distribution fee: ${formatMoney(feeResult.fee)}.` : "";
    logEvent(`Scheduled "${track.title}" for release in ${scheduleHours}h.${feeNote}`);
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
    const feeResult = applyReleaseDistributionFee(dist);
    if (!feeResult.ok) {
        return { ok: false, reason: `Insufficient funds for ${dist} distribution fee (${formatMoney(feeResult.fee)}).`, fee: feeResult.fee };
    }
    if (feeResult.fee) {
        recordTrackDistributionFee(track, feeResult.fee);
    }
    const releaseNote = note || dist;
    const entry = {
        id: uid("RQ"),
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
        const feeNote = feeResult.fee ? ` Distribution fee: ${formatMoney(feeResult.fee)}.` : "";
        logEvent(`Scheduled "${track.title}" for release on ${formatDate(releaseAt)}.${feeNote}`);
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
            ? broadcastSlotsForDay(dayIndex)
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
function ensureAudienceBiasStore() {
    if (!state.audienceBias || typeof state.audienceBias !== "object") {
        state.audienceBias = { updatedWeek: null, nations: {}, regions: {} };
    }
    if (typeof state.audienceBias.updatedWeek !== "number")
        state.audienceBias.updatedWeek = null;
    if (!state.audienceBias.nations || typeof state.audienceBias.nations !== "object") {
        state.audienceBias.nations = {};
    }
    if (!state.audienceBias.regions || typeof state.audienceBias.regions !== "object") {
        state.audienceBias.regions = {};
    }
    return state.audienceBias;
}
function normalizeAlignmentWeights(weights) {
    const safe = {};
    let total = 0;
    ALIGNMENTS.forEach((alignment) => {
        const value = Math.max(0, Number(weights?.[alignment] || 0));
        safe[alignment] = value;
        total += value;
    });
    if (!total) {
        const even = 1 / ALIGNMENTS.length;
        ALIGNMENTS.forEach((alignment) => {
            safe[alignment] = even;
        });
        return safe;
    }
    ALIGNMENTS.forEach((alignment) => {
        safe[alignment] = safe[alignment] / total;
    });
    return safe;
}
function defaultAlignmentWeights(baseAlignment) {
    const base = ALIGNMENTS.includes(baseAlignment) ? baseAlignment : "Neutral";
    const baseWeight = 0.55;
    const otherWeight = (1 - baseWeight) / (ALIGNMENTS.length - 1);
    const weights = {};
    ALIGNMENTS.forEach((alignment) => {
        weights[alignment] = alignment === base ? baseWeight : otherWeight;
    });
    return normalizeAlignmentWeights(weights);
}
function blendAlignmentWeights(previous, target, drift) {
    const safePrev = normalizeAlignmentWeights(previous);
    const safeTarget = normalizeAlignmentWeights(target);
    const step = clamp(Number(drift) || 0, 0, 1);
    const blended = {};
    ALIGNMENTS.forEach((alignment) => {
        blended[alignment] = safePrev[alignment] * (1 - step) + safeTarget[alignment] * step;
    });
    return normalizeAlignmentWeights(blended);
}
function alignmentWeightsFromEntries(entries) {
    const totals = { Safe: 0, Neutral: 0, Risky: 0 };
    (entries || []).forEach((entry) => {
        const track = entry?.track || entry;
        const alignment = ALIGNMENTS.includes(track?.alignment) ? track.alignment : "Neutral";
        const weight = Number.isFinite(entry?.score) ? Math.max(1, entry.score) : 1;
        totals[alignment] = (totals[alignment] || 0) + weight;
    });
    return normalizeAlignmentWeights(totals);
}
function preferenceCountsFromEntries(entries, valueFn) {
    const counts = {};
    (entries || []).forEach((entry) => {
        const track = entry?.track || entry;
        const value = valueFn(track);
        if (!value)
            return;
        const weight = Number.isFinite(entry?.score) ? Math.max(1, entry.score) : 1;
        counts[value] = (counts[value] || 0) + weight;
    });
    return counts;
}
function buildPreferenceListFromEntries(entries, valueFn, fallbackList, limit = AUDIENCE_PREF_LIMIT) {
    const counts = preferenceCountsFromEntries(entries, valueFn);
    const ordered = Object.entries(counts).sort((a, b) => b[1] - a[1]).map((entry) => entry[0]);
    const picks = ordered.slice(0, limit);
    const fallback = Array.isArray(fallbackList) ? fallbackList : [fallbackList];
    fallback.filter(Boolean).forEach((value) => {
        if (picks.length >= limit)
            return;
        if (!picks.includes(value))
            picks.push(value);
    });
    return picks.length ? picks : fallback.filter(Boolean).slice(0, limit);
}
function baseAudienceProfile(scopeId) {
    const regionProfile = REGION_PROFILES?.[scopeId];
    if (regionProfile) {
        return {
            alignment: regionProfile.alignment,
            themes: [regionProfile.theme],
            moods: Array.isArray(regionProfile.moods) ? regionProfile.moods.slice() : []
        };
    }
    const nationProfile = NATION_PROFILES?.[scopeId] || NATION_PROFILES.Annglora;
    return {
        alignment: nationProfile.alignment,
        themes: [nationProfile.theme],
        moods: Array.isArray(nationProfile.moods) ? nationProfile.moods.slice() : []
    };
}
function computeIconicRiskBoost(currentWeek) {
    const history = Array.isArray(state.era?.history) ? state.era.history : [];
    if (!history.length)
        return 0;
    const recent = history.filter((era) => {
        if (!Number.isFinite(era.completedWeek))
            return false;
        const weeksAgo = currentWeek - era.completedWeek;
        return weeksAgo >= 0 && weeksAgo < AUDIENCE_TASTE_WINDOW_WEEKS;
    });
    if (!recent.length)
        return 0;
    const iconicCount = recent.filter((era) => era.outcome === "Iconic").length;
    const share = iconicCount / recent.length;
    return clamp(share * AUDIENCE_ICONIC_RISK_BOOST, 0, AUDIENCE_ICONIC_RISK_BOOST);
}
function buildAudienceBiasEntry({ baseProfile, chartEntries, releaseEntries, previous, riskBoost }) {
    const baseWeights = defaultAlignmentWeights(baseProfile.alignment);
    const chartWeights = alignmentWeightsFromEntries(chartEntries);
    const releaseWeights = alignmentWeightsFromEntries(releaseEntries);
    let target = normalizeAlignmentWeights({
        Safe: baseWeights.Safe * AUDIENCE_BASE_WEIGHT
            + chartWeights.Safe * AUDIENCE_CHART_WEIGHT
            + releaseWeights.Safe * AUDIENCE_RELEASE_WEIGHT,
        Neutral: baseWeights.Neutral * AUDIENCE_BASE_WEIGHT
            + chartWeights.Neutral * AUDIENCE_CHART_WEIGHT
            + releaseWeights.Neutral * AUDIENCE_RELEASE_WEIGHT,
        Risky: baseWeights.Risky * AUDIENCE_BASE_WEIGHT
            + chartWeights.Risky * AUDIENCE_CHART_WEIGHT
            + releaseWeights.Risky * AUDIENCE_RELEASE_WEIGHT
    });
    if (riskBoost > 0) {
        target.Risky += riskBoost;
        target.Safe = Math.max(0, target.Safe - riskBoost * 0.6);
        target.Neutral = Math.max(0, target.Neutral - riskBoost * 0.4);
        target = normalizeAlignmentWeights(target);
    }
    const previousWeights = previous?.alignmentWeights || baseWeights;
    const alignmentWeights = blendAlignmentWeights(previousWeights, target, AUDIENCE_PREF_DRIFT);
    const combinedEntries = (chartEntries || []).concat(releaseEntries || []);
    const themes = buildPreferenceListFromEntries(combinedEntries, (track) => track?.theme, baseProfile.themes);
    const moods = buildPreferenceListFromEntries(combinedEntries, (track) => track?.mood, baseProfile.moods);
    const baseGenres = (baseProfile.themes[0] && baseProfile.moods.length)
        ? baseProfile.moods.map((mood) => makeGenre(baseProfile.themes[0], mood)).filter(Boolean)
        : [];
    const trendGenres = buildPreferenceListFromEntries(combinedEntries, (track) => track?.genre, baseGenres);
    return {
        alignmentWeights,
        themes,
        moods,
        trendGenres,
        updatedAt: state.time.epochMs
    };
}
function updateAudienceBiasFromCharts() {
    const bias = ensureAudienceBiasStore();
    const currentWeek = weekIndex() + 1;
    if (bias.updatedWeek === currentWeek)
        return;
    const currentWeekIndex = weekIndex();
    const minWeekIndex = currentWeekIndex - (AUDIENCE_TASTE_WINDOW_WEEKS - 1);
    const riskBoost = computeIconicRiskBoost(currentWeek);
    const marketTracks = Array.isArray(state.marketTracks) ? state.marketTracks : [];
    NATIONS.forEach((nation) => {
        const baseProfile = baseAudienceProfile(nation);
        const chartEntries = state.charts?.nations?.[nation] || [];
        const releaseEntries = marketTracks.filter((entry) => {
            if (entry.country !== nation)
                return false;
            if (!Number.isFinite(entry.releasedAt))
                return false;
            return weekIndexForEpochMs(entry.releasedAt) >= minWeekIndex;
        });
        bias.nations[nation] = buildAudienceBiasEntry({
            baseProfile,
            chartEntries,
            releaseEntries,
            previous: bias.nations[nation],
            riskBoost
        });
    });
    REGION_DEFS.forEach((region) => {
        const baseProfile = baseAudienceProfile(region.id);
        const chartEntries = state.charts?.regions?.[region.id] || [];
        const releaseEntries = marketTracks.filter((entry) => {
            if (entry.country !== region.nation)
                return false;
            if (!Number.isFinite(entry.releasedAt))
                return false;
            return weekIndexForEpochMs(entry.releasedAt) >= minWeekIndex;
        });
        bias.regions[region.id] = buildAudienceBiasEntry({
            baseProfile,
            chartEntries,
            releaseEntries,
            previous: bias.regions[region.id],
            riskBoost
        });
    });
    bias.updatedWeek = currentWeek;
}
function getAudienceProfile(scopeId) {
    const baseProfile = baseAudienceProfile(scopeId);
    const bias = ensureAudienceBiasStore();
    const biasEntry = bias.regions?.[scopeId] || bias.nations?.[scopeId] || null;
    const alignmentWeights = biasEntry?.alignmentWeights
        ? normalizeAlignmentWeights(biasEntry.alignmentWeights)
        : defaultAlignmentWeights(baseProfile.alignment);
    const themes = Array.isArray(biasEntry?.themes) && biasEntry.themes.length
        ? biasEntry.themes
        : baseProfile.themes;
    const moods = Array.isArray(biasEntry?.moods) && biasEntry.moods.length
        ? biasEntry.moods
        : baseProfile.moods;
    const trendGenres = Array.isArray(biasEntry?.trendGenres) ? biasEntry.trendGenres : [];
    return {
        alignmentWeights,
        themes,
        moods,
        trendGenres,
        baseAlignment: baseProfile.alignment
    };
}
function scoreTrack(track, regionName) {
    const audience = getAudienceProfile(regionName);
    let score = track.quality;
    const alignment = ALIGNMENTS.includes(track.alignment) ? track.alignment : "Neutral";
    const alignmentWeight = Number(audience.alignmentWeights?.[alignment]);
    const baseline = 1 / ALIGNMENTS.length;
    const delta = Number.isFinite(alignmentWeight) ? alignmentWeight - baseline : 0;
    score += Math.round(delta * AUDIENCE_ALIGNMENT_SCORE_SCALE);
    if (audience.themes.includes(track.theme))
        score += 8;
    if (audience.moods.includes(track.mood))
        score += 6;
    if (audience.trendGenres.includes(track.genre))
        score += AUDIENCE_TREND_BONUS;
    score += state.trends.includes(track.genre) ? 10 : 0;
    score += track.promoWeeks > 0 ? 10 : 0;
    const actPromoWeeks = track.actId ? (getAct(track.actId)?.promoWeeks || 0) : 0;
    score += actPromoWeeks > 0 ? Math.min(6, actPromoWeeks * 2) : 0;
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
    const start = getWeekAnchorEpochMs() + (week - 1) * WEEK_HOURS * HOUR_MS;
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
    ensureAudienceBiasStore();
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
    const audience = { nations: {}, regions: {} };
    NATIONS.forEach((nation) => {
        audience.nations[nation] = getAudienceProfile(nation);
    });
    REGION_DEFS.forEach((region) => {
        audience.regions[region.id] = getAudienceProfile(region.id);
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
            audience,
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
function scopeTypeLabel(scopeType) {
    if (scopeType === "nation")
        return "National";
    if (scopeType === "region")
        return "Regional";
    return "Global";
}
function scopePlaceLabel(scopeType, target) {
    if (scopeType === "nation")
        return target || "Nation";
    if (scopeType === "region") {
        const region = REGION_DEFS.find((entry) => entry.id === target);
        return region ? region.label : target || "Region";
    }
    return "Gaia";
}
function formatScopeLabel(scopeType, target) {
    const place = scopePlaceLabel(scopeType, target);
    const scope = scopeTypeLabel(scopeType);
    return place ? `${place} (${scope})` : scope;
}
function chartScopeLabel(chartKey) {
    if (chartKey === "global")
        return formatScopeLabel("global");
    if (NATIONS.includes(chartKey))
        return formatScopeLabel("nation", chartKey);
    return formatScopeLabel("region", chartKey);
}
function chartScopeHandle(scopeType, target) {
    const place = scopePlaceLabel(scopeType, target) || scopeTypeLabel(scopeType) || "Gaia";
    return handleFromName(`${place}Charts`, "GaiaCharts");
}
function trendScopeLabel(scopeType, target) {
    return formatScopeLabel(scopeType, target);
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
    const week = weekIndex() + 1;
    playerScores.forEach((entry) => {
        const trackId = entry.track?.trackId;
        if (!trackId)
            return;
        const track = getTrack(trackId);
        if (!track)
            return;
        const economy = ensureTrackEconomy(track);
        if (!economy)
            return;
        const metrics = entry.metrics || {};
        economy.sales = Math.round(economy.sales + Math.max(0, metrics.sales || 0));
        economy.streaming = Math.round(economy.streaming + Math.max(0, metrics.streaming || 0));
        economy.airplay = Math.round(economy.airplay + Math.max(0, metrics.airplay || 0));
        economy.social = Math.round(economy.social + Math.max(0, metrics.social || 0));
        const weeklyRevenue = Math.round(Math.max(0, entry.score) * 22 * difficulty.revenueMult);
        economy.revenue = Math.round(economy.revenue + weeklyRevenue);
        economy.lastRevenue = weeklyRevenue;
        economy.lastMetrics = metrics;
        economy.lastWeek = week;
    });
    (state.charts.global || []).forEach((entry) => {
        const trackId = entry.track?.trackId;
        if (!trackId || !entry.track?.isPlayer)
            return;
        const track = getTrack(trackId);
        if (!track)
            return;
        const economy = ensureTrackEconomy(track);
        if (!economy)
            return;
        const points = Math.max(1, CHART_SIZES.global + 1 - entry.rank);
        economy.chartPoints = Math.round(economy.chartPoints + points);
        economy.lastChartPoints = points;
    });
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
        const cash = typeof rival.cash === "number" ? rival.cash : STARTING_CASH;
        const leased = Math.max(0, used - ownedSlots);
        if (!leased)
            return;
        const reserve = RIVAL_COMPETE_CASH_BUFFER;
        const reservable = Math.max(0, cash - reserve);
        const maxLeased = costPerSlotWeek > 0 ? Math.floor(reservable / costPerSlotWeek) : leased;
        const affordableLeased = Math.min(leased, Math.max(0, maxLeased));
        if (!affordableLeased)
            return;
        rival.cash = Math.round(cash - affordableLeased * costPerSlotWeek);
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
        uiHooks.showEndScreen?.("You Won", [
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
    uiHooks.showEndScreen?.(title, lines);
    state.meta.endShown = true;
    saveToActiveSlot();
    if (result === "loss") {
        archiveLossGame(reason, endedSlot);
    }
    session.activeSlot = null;
    sessionStorage.removeItem("rls_active_slot");
    uiHooks.openMainMenu?.();
    uiHooks.renderLossArchives?.();
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
    uiHooks.openOverlay?.("bailoutModal");
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
                story: `Gaia tip: deliver a ${formatGenreKeyLabel(genre)} track to steer the week.`,
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
    state.acts.forEach((act) => {
        act.promoWeeks = Math.max(0, (act.promoWeeks || 0) - 1);
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
function estimateRivalOperatingCost(rival, reserveCash = 0) {
    if (!rival)
        return 0;
    const rate = getStudioLeaseRate();
    if (!rate)
        return 0;
    const hourly = STAGES.reduce((sum, stage) => {
        const hours = Math.max(1, stage.hours || 1);
        return sum + stage.cost / hours;
    }, 0) / STAGES.length;
    const costPerSlotWeek = Math.round(hourly * WEEK_HOURS * rate);
    if (!costPerSlotWeek)
        return 0;
    const cap = STUDIO_CAP_PER_LABEL;
    const ownedSlots = clamp(Math.round(rival.studio?.slots || STARTING_STUDIO_SLOTS), 0, cap);
    const momentum = typeof rival.momentum === "number" ? rival.momentum : 0.35;
    const used = clamp(Math.round(cap * momentum), 0, cap);
    const desiredLeased = Math.max(0, used - ownedSlots);
    const walletCash = rival.wallet?.cash ?? rival.cash ?? 0;
    const reserve = Number.isFinite(reserveCash) ? Math.max(0, reserveCash) : 0;
    const reservable = Math.max(0, walletCash - reserve);
    const maxLeased = costPerSlotWeek > 0 ? Math.floor(reservable / costPerSlotWeek) : desiredLeased;
    const leased = clamp(Math.min(desiredLeased, maxLeased), 0, desiredLeased);
    return leased * costPerSlotWeek;
}
function scoreHuskForRival(husk, rival, trends) {
    const context = normalizeHuskContext(husk);
    const walletCash = rival.wallet?.cash ?? rival.cash ?? 0;
    const budgetCost = estimateHuskPromoBudget(husk, walletCash);
    const reserveCash = Number.isFinite(budgetCost) ? budgetCost + RIVAL_COMPETE_DROP_COST : 0;
    const operatingCost = estimateRivalOperatingCost(rival, reserveCash);
    const availableCash = Math.max(0, walletCash - operatingCost);
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
            : clamp(availableCash / budgetCost, 0, 1);
    const outcomeScore = clamp(context.outcomeScore / 100, 0, 1);
    const score = trendScore * 40 + alignmentScore * 30 + budgetScore * 20 + outcomeScore * 10;
    const eligible = budgetCost === 0 || budgetCost <= availableCash;
    return { score, eligible, budgetCost, availableCash, operatingCost };
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
    if (!eligible.length)
        return null;
    eligible.sort((a, b) => {
        if (a.score !== b.score)
            return b.score - a.score;
        return b.jitter - a.jitter;
    });
    return eligible[0].husk;
}
function huskWindowWeeks(husk) {
    const steps = normalizeHuskCadence(husk?.cadence);
    if (!steps.length)
        return 1;
    const maxOffset = steps.reduce((max, step) => Math.max(max, step.weekOffset || 0), 0);
    return Math.max(1, maxOffset + 1);
}
function applyRivalHuskFocus(rival, husk) {
    if (!rival || !husk)
        return;
    const context = normalizeHuskContext(husk);
    const tags = Array.isArray(context.trendTags) ? context.trendTags : [];
    if (!tags.length)
        return;
    const themes = tags.map((genre) => themeFromGenre(genre)).filter(Boolean);
    const moods = tags.map((genre) => moodFromGenre(genre)).filter(Boolean);
    if (!Array.isArray(rival.focusThemes))
        rival.focusThemes = [];
    if (!Array.isArray(rival.focusMoods))
        rival.focusMoods = [];
    rival.focusThemes = uniqueList([...rival.focusThemes, ...themes]).slice(-4);
    rival.focusMoods = uniqueList([...rival.focusMoods, ...moods]).slice(-4);
}
function selectCompetitiveAnchorRival(rivals) {
    if (!Array.isArray(rivals) || !rivals.length)
        return null;
    const dominantId = state.meta?.seedInfo?.dominantLabelId || null;
    const dominant = dominantId ? rivals.find((rival) => rival.id === dominantId) : null;
    if (dominant)
        return dominant;
    const sorted = rivals.slice().sort((a, b) => {
        const momentumA = typeof a.momentum === "number" ? a.momentum : 0;
        const momentumB = typeof b.momentum === "number" ? b.momentum : 0;
        if (momentumA !== momentumB)
            return momentumB - momentumA;
        const cashA = a.wallet?.cash ?? a.cash ?? 0;
        const cashB = b.wallet?.cash ?? b.cash ?? 0;
        if (cashA !== cashB)
            return cashB - cashA;
        const idA = String(a.id || a.name || "");
        const idB = String(b.id || b.name || "");
        return idA.localeCompare(idB);
    });
    return sorted[0] || null;
}
function isRivalCompetitiveEligible(rival, husk) {
    if (!rival || !husk)
        return false;
    const walletCash = rival.wallet?.cash ?? rival.cash ?? 0;
    const promoBudget = estimateHuskPromoBudget(husk, walletCash);
    if (promoBudget === Number.POSITIVE_INFINITY)
        return false;
    const required = RIVAL_COMPETE_CASH_BUFFER + RIVAL_COMPETE_DROP_COST + promoBudget;
    const operatingCost = estimateRivalOperatingCost(rival, required);
    const availableCash = Math.max(0, walletCash - operatingCost);
    return availableCash >= required;
}
function getActiveRivalPlan(rival, currentWeekIndex, now = state.time.epochMs) {
    if (!rival?.aiPlan || typeof rival.aiPlan !== "object")
        return null;
    const startWeek = rival.aiPlan.windowStartWeekIndex;
    const endWeek = rival.aiPlan.windowEndWeekIndex;
    if (!Number.isFinite(startWeek) || !Number.isFinite(endWeek))
        return null;
    if (currentWeekIndex > endWeek)
        return null;
    const endReleaseAt = rolloutReleaseTimestampForWeek(endWeek + 1);
    if (Number.isFinite(endReleaseAt) && endReleaseAt <= now)
        return null;
    return rival.aiPlan;
}
function getRivalPlanStartWeekIndex(epochMs = state.time.epochMs) {
    return weekIndexForEpochMs(getReleaseAsapAt(epochMs));
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
function promoFacilityCapacityForEpochMs(facilityId, epochMs) {
    const dayIndex = getUtcDayIndex(epochMs);
    if (facilityId === "broadcast")
        return broadcastSlotsForDay(dayIndex);
    if (facilityId === "filming")
        return FILMING_STUDIO_SLOTS;
    return 0;
}
function countScheduledPromoEventsForFacility(facilityId, epochMs) {
    if (!facilityId)
        return 0;
    const dayStart = startOfDayEpochMs(epochMs);
    const dayEnd = endOfDayEpochMs(epochMs);
    const rivalCount = state.rivalReleaseQueue.filter((entry) => {
        if ((entry.queueType || "release") !== "promo")
            return false;
        if (getPromoFacilityForType(entry.promoType) !== facilityId)
            return false;
        return Number.isFinite(entry.releaseAt) && entry.releaseAt >= dayStart && entry.releaseAt < dayEnd;
    }).length;
    const labelCount = Array.isArray(state.scheduledEvents)
        ? state.scheduledEvents.filter((entry) => {
            if (entry.status === "Cancelled")
                return false;
            if (entry.facilityId !== facilityId)
                return false;
            return Number.isFinite(entry.scheduledAt) && entry.scheduledAt >= dayStart && entry.scheduledAt < dayEnd;
        }).length
        : 0;
    return rivalCount + labelCount;
}
function canScheduleRivalPromoStep(rival, promoType, promoAt, promoBudgetSlots, promoScheduled) {
    if (!rival)
        return false;
    if (!Number.isFinite(promoBudgetSlots) || promoBudgetSlots <= promoScheduled)
        return false;
    const facilityId = getPromoFacilityForType(promoType);
    if (!facilityId)
        return true;
    const capacity = promoFacilityCapacityForEpochMs(facilityId, promoAt);
    if (capacity <= 0)
        return false;
    const scheduled = countScheduledPromoEventsForFacility(facilityId, promoAt);
    return scheduled < capacity;
}
function scheduleHuskForRival(rival, husk, options = {}) {
    if (!husk)
        return;
    const steps = normalizeHuskCadence(husk.cadence);
    if (!steps.length)
        return;
    const now = state.time.epochMs;
    const walletCash = rival.wallet?.cash ?? rival.cash ?? 0;
    const promoBudget = computeAutoPromoBudget(walletCash, AI_PROMO_BUDGET_PCT);
    const promoBudgetSlots = promoBudget ? Math.floor(walletCash / promoBudget) : 0;
    let promoScheduled = 0;
    const planWeek = Number.isFinite(options.planWeek) ? options.planWeek : weekIndex();
    const baseWeekIndex = Number.isFinite(options.startWeekIndex)
        ? options.startWeekIndex
        : getRivalPlanStartWeekIndex(now);
    const endWeekIndex = Number.isFinite(options.endWeekIndex) ? options.endWeekIndex : null;
    const allowPromo = options.allowPromo !== false;
    const safeBaseWeekIndex = Math.max(baseWeekIndex, getRivalPlanStartWeekIndex(now));
    steps.forEach((step, index) => {
        const weekOffset = Number.isFinite(step.weekOffset) ? Math.max(0, step.weekOffset) : 0;
        const targetWeekIndex = safeBaseWeekIndex + weekOffset;
        if (Number.isFinite(endWeekIndex) && targetWeekIndex > endWeekIndex)
            return;
        if (step.kind === "release") {
            if (hasRivalQueueEntry(rival.name, "release", targetWeekIndex))
                return;
            const releaseAt = rolloutReleaseTimestampForWeek(targetWeekIndex + 1);
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
        if (!allowPromo || !promoBudget)
            return;
        if (hasRivalQueueEntry(rival.name, "promo", targetWeekIndex))
            return;
        const weekStart = weekStartEpochMs(targetWeekIndex + 1);
        let promoAt = weekStart + step.day * DAY_MS + step.hour * HOUR_MS;
        while (promoAt <= now) {
            promoAt += WEEK_HOURS * HOUR_MS;
        }
        if (!canScheduleRivalPromoStep(rival, step.promoType || HUSK_PROMO_DEFAULT_TYPE, promoAt, promoBudgetSlots, promoScheduled)) {
            return;
        }
        state.rivalReleaseQueue.push(planRivalPromoEntry({
            rival,
            husk,
            promoAt,
            stepIndex: index,
            planWeek,
            promoType: step.promoType || HUSK_PROMO_DEFAULT_TYPE
        }));
        promoScheduled += 1;
    });
}
function generateRivalReleases() {
    if (!Array.isArray(state.rivals) || !state.rivals.length)
        return;
    const huskLibrary = buildHuskLibrary();
    const fallbackHusk = HUSK_STARTERS[0] || null;
    const anchor = selectCompetitiveAnchorRival(state.rivals);
    const currentWeek = weekIndex();
    state.rivals.forEach((rival) => {
        if (!rival)
            return;
        if (!rival.aiPlan) {
            rival.aiPlan = {
                lastPlannedWeek: null,
                lastHuskId: null,
                lastPlannedAt: null,
                activeHuskId: null,
                huskSource: null,
                windowStartWeekIndex: null,
                windowEndWeekIndex: null,
                competitive: false
            };
        }
        if (rival.aiPlan.lastPlannedWeek === currentWeek)
            return;
        const force = anchor && rival.id === anchor.id;
        let husk = null;
        let planWeekIndex = null;
        let planEndWeekIndex = null;
        const activePlan = getActiveRivalPlan(rival, currentWeek);
        if (activePlan && activePlan.activeHuskId) {
            husk = huskLibrary.find((entry) => entry.id === activePlan.activeHuskId) || fallbackHusk;
            planWeekIndex = activePlan.windowStartWeekIndex;
            planEndWeekIndex = activePlan.windowEndWeekIndex;
        }
        if (!husk) {
            husk = selectHuskForRival(rival, huskLibrary) || fallbackHusk;
        }
        if (!husk) {
            rival.aiPlan.competitive = false;
            rival.aiPlan.lastPlannedWeek = currentWeek;
            rival.aiPlan.lastPlannedAt = state.time.epochMs;
            return;
        }
        applyRivalHuskFocus(rival, husk);
        const eligible = isRivalCompetitiveEligible(rival, husk);
        if (!eligible && !force) {
            rival.aiPlan.competitive = false;
            rival.aiPlan.activeHuskId = null;
            rival.aiPlan.huskSource = null;
            rival.aiPlan.windowStartWeekIndex = null;
            rival.aiPlan.windowEndWeekIndex = null;
            rival.aiPlan.lastPlannedWeek = currentWeek;
            rival.aiPlan.lastHuskId = husk.id;
            rival.aiPlan.lastPlannedAt = state.time.epochMs;
            return;
        }
        if (!activePlan || !activePlan.activeHuskId || activePlan.activeHuskId !== husk.id) {
            const startWeekIndex = getRivalPlanStartWeekIndex(state.time.epochMs);
            const windowWeeks = huskWindowWeeks(husk);
            planWeekIndex = startWeekIndex;
            planEndWeekIndex = startWeekIndex + windowWeeks - 1;
            rival.aiPlan.activeHuskId = husk.id;
            rival.aiPlan.huskSource = husk.source;
            rival.aiPlan.windowStartWeekIndex = planWeekIndex;
            rival.aiPlan.windowEndWeekIndex = planEndWeekIndex;
        }
        rival.aiPlan.competitive = true;
        rival.aiPlan.lastPlannedWeek = currentWeek;
        rival.aiPlan.lastHuskId = husk.id;
        rival.aiPlan.lastPlannedAt = state.time.epochMs;
        scheduleHuskForRival(rival, husk, {
            planWeek: Number.isFinite(planWeekIndex) ? planWeekIndex : currentWeek,
            startWeekIndex: planWeekIndex,
            endWeekIndex: planEndWeekIndex,
            allowPromo: force || eligible
        });
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
            applyEraOutcome(era);
            archiveEra(era, era.status || "Ended");
            generateEraRolloutHusk(era);
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
                const outcome = applyEraOutcome(era);
                archiveEra(era, "Complete");
                const outcomeLabel = outcome?.outcome ? ` | Outcome: ${outcome.outcome}` : "";
                logEvent(`Era complete: ${era.name}${outcomeLabel}.`);
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
    const selectedTypes = Array.from(new Set(rawTypes)).filter(Boolean);
    if (!selectedTypes.length)
        return;
    const usableTypes = track.promo?.musicVideoUsed
        ? selectedTypes.filter((typeId) => typeId !== "musicVideo")
        : selectedTypes;
    if (!usableTypes.length)
        return;
    const walletCash = state.label.wallet?.cash ?? state.label.cash;
    const budget = computeAutoPromoBudget(walletCash, autoPromoBudgetPct());
    const totalCost = budget * usableTypes.length;
    if (!budget || walletCash < totalCost || state.label.cash < totalCost)
        return;
    const facilityNeeds = promoFacilityNeeds(usableTypes);
    for (const [facilityId, count] of Object.entries(facilityNeeds)) {
        const availability = getPromoFacilityAvailability(facilityId);
        if (availability.available < count)
            return;
    }
    for (const promoType of usableTypes) {
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
    recordTrackPromoCost(track, totalCost);
    const boostWeeks = promoWeeksFromBudget(budget);
    market.promoWeeks = Math.max(market.promoWeeks || 0, boostWeeks);
    state.meta.promoRuns = (state.meta.promoRuns || 0) + usableTypes.length;
    const promoIds = [
        ...(track.creators?.songwriterIds || []),
        ...(track.creators?.performerIds || []),
        ...(track.creators?.producerIds || [])
    ].filter(Boolean);
    markCreatorPromo(promoIds);
    if (usableTypes.includes("musicVideo")) {
        if (!track.promo || typeof track.promo !== "object")
            track.promo = {};
        track.promo.musicVideoUsed = true;
    }
    const spendNote = usableTypes.length > 1 ? `${formatMoney(totalCost)} total` : formatMoney(totalCost);
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
    const startTime = nowMs();
    const week = weekIndex() + 1;
    ensureMarketCreators();
    decayCreatorMarketHeat();
    processCreatorInactivity();
    updateCreatorSkillDecay();
    processRivalCreatorInactivity();
    recruitRivalCreators();
    generateRivalReleases();
    const { globalScores } = computeChartsLocal();
    updateAudienceBiasFromCharts();
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
    uiHooks.renderAll?.();
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
    postSocial({ handle: chartScopeHandle("global"), title: `Annual Winner ${year}`, lines: [`${winner} secured the year with ${formatCount(topPoints)} points.`, `Tie-break: ${resolvedBy}`], type: "system", order: 1 });
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
        state.resourceTickLedger = { hours: [], pendingHour: null };
    }
    if (!Array.isArray(state.resourceTickLedger.hours)) {
        state.resourceTickLedger.hours = [];
    }
    state.resourceTickLedger.hours.push({ ts: state.time.epochMs, ...summary });
    state.resourceTickLedger.hours = state.resourceTickLedger.hours.filter(Boolean).slice(-RESOURCE_TICK_LEDGER_LIMIT);
}
function getQuarterHourRegenSlice(quarterIndex) {
    const base = Math.floor(STAMINA_REGEN_PER_HOUR / QUARTERS_PER_HOUR);
    const remainder = STAMINA_REGEN_PER_HOUR % QUARTERS_PER_HOUR;
    if (base <= 0 && remainder <= 0)
        return 0;
    return base + (quarterIndex < remainder ? 1 : 0);
}
function recordQuarterHourSummary(summary, quarterIndex) {
    if (!state.resourceTickLedger || typeof state.resourceTickLedger !== "object") {
        state.resourceTickLedger = { hours: [], pendingHour: null };
    }
    if (!state.resourceTickLedger.pendingHour || typeof state.resourceTickLedger.pendingHour !== "object") {
        state.resourceTickLedger.pendingHour = {
            regenTotal: 0,
            regenCount: 0,
            spendTotal: 0,
            spendCount: 0,
            overuseCount: 0,
            departuresFlagged: 0
        };
    }
    const pending = state.resourceTickLedger.pendingHour;
    pending.regenTotal += summary.regenTotal || 0;
    pending.regenCount += summary.regenCount || 0;
    pending.spendTotal += summary.spendTotal || 0;
    pending.spendCount += summary.spendCount || 0;
    pending.overuseCount += summary.overuseCount || 0;
    pending.departuresFlagged += summary.departuresFlagged || 0;
    if (quarterIndex === QUARTERS_PER_HOUR - 1) {
        const hourlySummary = { ...pending };
        recordResourceTickSummary(hourlySummary);
        state.resourceTickLedger.pendingHour = null;
        return hourlySummary;
    }
    return null;
}
function applyQuarterHourResourceTick(activeOrders = [], dayIndex = null) {
    const busyIds = new Set();
    activeOrders.forEach((order) => {
        getWorkOrderCreatorIds(order).forEach((id) => busyIds.add(id));
    });
    const quarterIndex = ((state.time.totalQuarters || 0) - 1 + QUARTERS_PER_HOUR) % QUARTERS_PER_HOUR;
    const regenSlice = getQuarterHourRegenSlice(quarterIndex);
    let regenTotal = 0;
    let regenCount = 0;
    state.creators.forEach((creator) => {
        if (busyIds.has(creator.id))
            return;
        const before = creator.stamina;
        creator.stamina = clampStamina(creator.stamina + regenSlice);
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
    const summary = {
        regenTotal,
        regenCount,
        spendTotal,
        spendCount,
        overuseCount,
        departuresFlagged
    };
    const hourlySummary = recordQuarterHourSummary(summary, quarterIndex);
    if (hourlySummary && (hourlySummary.regenTotal || hourlySummary.spendTotal)) {
        logEvent(`Hourly stamina: +${formatCount(hourlySummary.regenTotal)} regen (${hourlySummary.regenCount} idle) | -${formatCount(hourlySummary.spendTotal)} spend (${hourlySummary.spendCount} active).`);
    }
}
async function runQuarterHourTick() {
    const prevDayIndex = Math.floor(state.time.epochMs / DAY_MS);
    state.time.totalQuarters = Number.isFinite(state.time.totalQuarters) ? state.time.totalQuarters + 1 : 1;
    state.time.totalHours = Math.floor(state.time.totalQuarters / QUARTERS_PER_HOUR);
    state.time.epochMs += QUARTER_HOUR_MS;
    const currentDayIndex = Math.floor(state.time.epochMs / DAY_MS);
    const activeOrders = state.workOrders.filter((order) => order.status === "In Progress");
    applyQuarterHourResourceTick(activeOrders, prevDayIndex);
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
let advanceQuartersQueue = Promise.resolve();
async function advanceQuarters(quarters, { renderQuarterly = true, renderAfter = !renderQuarterly } = {}) {
    if (state.meta.gameOver)
        return;
    if (!Number.isFinite(quarters) || quarters <= 0)
        return;
    const totalQuarters = Math.ceil(quarters);
    advanceQuartersQueue = advanceQuartersQueue.then(async () => {
        if (state.meta.gameOver)
            return;
        for (let i = 0; i < totalQuarters; i += 1) {
            try {
                await runQuarterHourTick();
                if (renderQuarterly)
                    uiHooks.renderAll?.({ save: false });
            }
            catch (error) {
                console.error("runQuarterHourTick error:", error);
            }
        }
        if (renderAfter) {
            uiHooks.renderAll?.({ save: false });
        }
        else if (!renderQuarterly) {
            uiHooks.renderTime?.();
        }
    }).catch((error) => {
        console.error("advanceQuarters error:", error);
    });
    return advanceQuartersQueue;
}
async function advanceHours(hours, options = {}) {
    if (!Number.isFinite(hours) || hours <= 0)
        return;
    const renderQuarterly = typeof options.renderQuarterly === "boolean"
        ? options.renderQuarterly
        : typeof options.renderHourly === "boolean"
            ? options.renderHourly
            : true;
    const renderAfter = typeof options.renderAfter === "boolean" ? options.renderAfter : !renderQuarterly;
    const quarters = Math.ceil(hours * QUARTERS_PER_HOUR);
    return advanceQuarters(quarters, { renderQuarterly, renderAfter });
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
    uiHooks.refreshSelectOptions?.();
    await computeCharts();
    uiHooks.renderAll?.({ save: false });
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
    let secPerQuarter = Infinity;
    if (state.time.speed === "play")
        secPerQuarter = state.time.secPerQuarterPlay;
    if (state.time.speed === "fast")
        secPerQuarter = state.time.secPerQuarterFast;
    if (secPerQuarter !== Infinity) {
        const queuedIterations = Math.floor(state.time.acc / secPerQuarter);
        if (queuedIterations > QUARTER_TICK_WARNING_THRESHOLD) {
            console.warn(`[perf] tick queued ${queuedIterations} quarter-hour iterations (speed=${state.time.speed}, acc=${state.time.acc.toFixed(3)}, secPerQuarter=${secPerQuarter}).`);
        }
        state.time.acc += dt;
        let iterationsThisFrame = 0;
        while (state.time.acc >= secPerQuarter && iterationsThisFrame < QUARTER_TICK_FRAME_LIMIT) {
            state.time.acc -= secPerQuarter;
            advanceQuarters(1);
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
    generateRivalReleases();
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
        uiHooks.refreshSelectOptions?.();
        const chartResult = await computeCharts();
        maybeSeedTrendLedger(chartResult?.globalScores);
        uiHooks.renderAll?.();
        if (!data && typeof window !== "undefined" && typeof window.resetViewLayout === "function") {
            window.resetViewLayout();
        }
        uiHooks.closeMainMenu?.();
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
            labelRankingLimit: COMMUNITY_LABEL_RANKING_DEFAULT,
            trendRankingLimit: COMMUNITY_TREND_RANKING_DEFAULT,
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
            promoSlots: { actId: null, trackId: null },
            activeView: "charts"
        };
    }
    if (!state.ui.activeChart)
        state.ui.activeChart = "global";
    if (!state.ui.trendScopeType)
        state.ui.trendScopeType = "global";
    if (!state.ui.trendScopeTarget)
        state.ui.trendScopeTarget = defaultTrendNation();
    const legacyRanking = applyLegacyCommunityRankingLimit(state.ui.communityRankingLimit);
    if (legacyRanking) {
        if (typeof state.ui.labelRankingLimit === "undefined")
            state.ui.labelRankingLimit = legacyRanking.label;
        if (typeof state.ui.trendRankingLimit === "undefined")
            state.ui.trendRankingLimit = legacyRanking.trend;
    }
    state.ui.labelRankingLimit = normalizeCommunityLabelRankingLimit(state.ui.labelRankingLimit);
    state.ui.trendRankingLimit = normalizeCommunityTrendRankingLimit(state.ui.trendRankingLimit);
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
    if (!state.ui.promoBudgets || typeof state.ui.promoBudgets !== "object") {
        state.ui.promoBudgets = {};
    }
    Object.keys(PROMO_TYPE_DETAILS).forEach((typeId) => {
        const budget = state.ui.promoBudgets[typeId];
        if (!Number.isFinite(budget) || budget <= 0) {
            state.ui.promoBudgets[typeId] = PROMO_TYPE_DETAILS[typeId].cost;
        }
    });
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
        state.ui.promoSlots = { actId: null, trackId: null };
    if (typeof state.ui.promoSlots.actId !== "string")
        state.ui.promoSlots.actId = state.ui.promoSlots.actId || null;
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
    state.acts = state.acts.filter(Boolean).map((act) => {
        if (!Array.isArray(act.memberIds))
            act.memberIds = [];
        if (typeof act.promoWeeks !== "number")
            act.promoWeeks = 0;
        if (typeof act.lastPromoAt !== "number")
            act.lastPromoAt = null;
        return act;
    });
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
            rival.aiPlan = {
                lastPlannedWeek: null,
                lastHuskId: null,
                lastPlannedAt: null,
                activeHuskId: null,
                huskSource: null,
                windowStartWeekIndex: null,
                windowEndWeekIndex: null,
                competitive: false
            };
        }
        if (typeof rival.aiPlan.lastPlannedWeek !== "number")
            rival.aiPlan.lastPlannedWeek = null;
        if (typeof rival.aiPlan.lastHuskId !== "string")
            rival.aiPlan.lastHuskId = null;
        if (typeof rival.aiPlan.lastPlannedAt !== "number")
            rival.aiPlan.lastPlannedAt = null;
        if (typeof rival.aiPlan.activeHuskId !== "string")
            rival.aiPlan.activeHuskId = null;
        if (typeof rival.aiPlan.huskSource !== "string")
            rival.aiPlan.huskSource = null;
        if (typeof rival.aiPlan.windowStartWeekIndex !== "number")
            rival.aiPlan.windowStartWeekIndex = null;
        if (typeof rival.aiPlan.windowEndWeekIndex !== "number")
            rival.aiPlan.windowEndWeekIndex = null;
        if (typeof rival.aiPlan.competitive !== "boolean")
            rival.aiPlan.competitive = false;
    });
    if (!state.trends)
        state.trends = [];
    if (!state.resourceTickLedger || typeof state.resourceTickLedger !== "object") {
        state.resourceTickLedger = { hours: [], pendingHour: null };
    }
    if (!Array.isArray(state.resourceTickLedger.hours))
        state.resourceTickLedger.hours = [];
    if (state.resourceTickLedger.pendingHour && typeof state.resourceTickLedger.pendingHour !== "object") {
        state.resourceTickLedger.pendingHour = null;
    }
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
        if (typeof era.outcome !== "string")
            era.outcome = era.outcome || null;
        if (!era.outcomeStats || typeof era.outcomeStats !== "object")
            era.outcomeStats = null;
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
        if (typeof era.outcome !== "string")
            era.outcome = era.outcome || null;
        if (!era.outcomeStats || typeof era.outcomeStats !== "object")
            era.outcomeStats = null;
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
    ensureAudienceBiasStore();
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
            if (!track.promo || typeof track.promo !== "object")
                track.promo = {};
            if (typeof track.promo.preReleaseWeeks !== "number")
                track.promo.preReleaseWeeks = 0;
            if (typeof track.promo.musicVideoUsed !== "boolean")
                track.promo.musicVideoUsed = false;
            if (typeof track.stageIndex !== "number") {
                track.stageIndex = track.status === "Ready" ? STAGES.length : 0;
            }
            if (!track.genre && track.theme && track.mood && ["Ready", "Scheduled", "Released"].includes(track.status)) {
                track.genre = makeGenre(track.theme, track.mood);
            }
            if (track.modifier && !track.modifier.id)
                track.modifier = getModifier(track.modifier);
            ensureTrackEconomy(track);
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
    if (typeof state.time.secPerQuarterPlay !== "number" || state.time.secPerQuarterPlay <= 0) {
        const basis = Number.isFinite(state.time.secPerHourPlay) ? state.time.secPerHourPlay : timeDefaults.secPerHourPlay;
        state.time.secPerQuarterPlay = basis / QUARTERS_PER_HOUR;
    }
    if (typeof state.time.secPerQuarterFast !== "number" || state.time.secPerQuarterFast <= 0) {
        const basis = Number.isFinite(state.time.secPerHourFast) ? state.time.secPerHourFast : timeDefaults.secPerHourFast;
        state.time.secPerQuarterFast = basis / QUARTERS_PER_HOUR;
    }
    if (typeof state.time.epochMs !== "number" || Number.isNaN(state.time.epochMs)) {
        state.time.epochMs = timeDefaults.epochMs;
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
    if (typeof state.time.totalQuarters !== "number" || Number.isNaN(state.time.totalQuarters)) {
        if (Number.isFinite(state.time.totalHours)) {
            state.time.totalQuarters = Math.max(0, Math.round(state.time.totalHours * QUARTERS_PER_HOUR));
        }
        else {
            const delta = state.time.epochMs - state.time.startEpochMs;
            state.time.totalQuarters = Math.max(0, Math.round(delta / QUARTER_HOUR_MS));
        }
    }
    state.time.totalHours = Math.max(0, Math.floor(state.time.totalQuarters / QUARTERS_PER_HOUR));
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
    return {
        distribution: plan.distribution,
        releaseAt: getReleaseAsapAt(state.time.epochMs)
    };
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
function normalizeCommunityLabelRankingLimit(value) {
    const parsed = Number(value);
    return COMMUNITY_LABEL_RANKING_LIMITS.includes(parsed) ? parsed : COMMUNITY_LABEL_RANKING_DEFAULT;
}
function normalizeCommunityTrendRankingLimit(value) {
    const parsed = Number(value);
    return COMMUNITY_TREND_RANKING_LIMITS.includes(parsed) ? parsed : COMMUNITY_TREND_RANKING_DEFAULT;
}
function applyLegacyCommunityRankingLimit(value) {
    const legacy = Number(value);
    if (!COMMUNITY_LEGACY_RANKING_LIMITS.includes(legacy))
        return null;
    return {
        label: legacy === 8 ? 8 : COMMUNITY_LABEL_RANKING_DEFAULT,
        trend: legacy === 8 ? 3 : COMMUNITY_TREND_RANKING_DEFAULT
    };
}
function getCommunityLabelRankingLimit() {
    if (!state.ui)
        state.ui = {};
    const normalized = normalizeCommunityLabelRankingLimit(state.ui.labelRankingLimit);
    state.ui.labelRankingLimit = normalized;
    return normalized;
}
function getCommunityTrendRankingLimit() {
    if (!state.ui)
        state.ui = {};
    const normalized = normalizeCommunityTrendRankingLimit(state.ui.trendRankingLimit);
    state.ui.trendRankingLimit = normalized;
    return normalized;
}
function getTopActSnapshot() {
    const entries = state.marketTracks.filter((track) => track.isPlayer && track.actId);
    if (!entries.length)
        return null;
    const scores = {};
    entries.forEach((track) => {
        const actPromoWeeks = track.actId ? (getAct(track.actId)?.promoWeeks || 0) : 0;
        const score = track.quality + Math.max(0, 12 - track.weeksOnChart) * 5 + track.promoWeeks * 4 + actPromoWeeks * 2;
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
        const rival = getRivalByName(entry.label);
        const labelCountry = rival?.country || entry.country || state.label.country;
        const labelColor = countryColor(labelCountry);
        return {
            id: entry.id,
            ts: entry.releaseAt,
            title,
            actName: entry.actName || (isPromo ? "Promotion" : "Unknown"),
            label: entry.label,
            labelColor,
            showLabel: true,
            kind: isPromo ? "rivalPromo" : "rivalScheduled",
            typeLabel: isPromo ? "Rival Promo" : "Rival Scheduled",
            distribution: isPromo ? promoLabel : (entry.distribution || "Digital")
        };
    });
    const rivalReleased = state.marketTracks
        .filter((entry) => !entry.isPlayer)
        .map((entry) => {
        const rival = getRivalByName(entry.label);
        const labelCountry = rival?.country || entry.country || state.label.country;
        const labelColor = countryColor(labelCountry);
        return {
            id: entry.id,
            ts: entry.releasedAt,
            title: entry.title,
            actName: entry.actName || "Unknown",
            label: entry.label,
            labelColor,
            showLabel: true,
            kind: "rivalReleased",
            typeLabel: "Rival Released",
            distribution: entry.distribution || "Digital"
        };
    });
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
function buildCalendarProjection({ pastWeeks = 1, futureWeeks = 4, anchorWeekIndex = null } = {}) {
    const tab = state.ui.calendarTab || "label";
    const filters = state.ui.calendarFilters || {};
    const anchor = Number.isFinite(anchorWeekIndex) ? anchorWeekIndex : getCalendarAnchorWeekIndex();
    return useCalendarProjection({
        startEpochMs: getWeekAnchorEpochMs(),
        anchorWeekIndex: anchor,
        pastWeeks,
        futureWeeks,
        activeWeeks: 4,
        tab,
        filters,
        sources: buildCalendarSources()
    });
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
function weekNumberFromEpochMs(epochMs) {
    if (!Number.isFinite(epochMs))
        return null;
    const startEpochMs = getWeekAnchorEpochMs();
    const offset = epochMs - startEpochMs;
    if (!Number.isFinite(offset))
        return null;
    return Math.max(1, Math.floor(offset / (WEEK_HOURS * HOUR_MS)) + 1);
}
function shortRegionLabel(region) {
    if (!region)
        return "";
    const nation = region.nation || "";
    const id = region.id || "";
    const label = region.label || id || "";
    if (!label)
        return "";
    const lowerId = id.toLowerCase();
    if (lowerId.includes("elsewhere")) {
        const base = nation ? `${nation} Elsewhere` : "Elsewhere";
        return `${base} Regional`.trim();
    }
    if (lowerId.includes("capital")) {
        const base = label.replace(/capital/gi, "").trim() || label;
        return `${base} Regional`.trim();
    }
    return `${label} Regional`.trim();
}
function buildTrackHistoryScopes() {
    const scopes = [{ scope: "global", label: "Global", title: formatScopeLabel("global") }];
    NATIONS.forEach((nation) => {
        scopes.push({ scope: `nation:${nation}`, label: nation, title: formatScopeLabel("nation", nation) });
    });
    REGION_DEFS.forEach((region) => {
        const label = shortRegionLabel(region) || region.id;
        scopes.push({ scope: `region:${region.id}`, label, title: formatScopeLabel("region", region.id) });
    });
    return scopes;
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
export { ACHIEVEMENTS, ACHIEVEMENT_TARGET, CREATOR_FALLBACK_EMOJI, CREATOR_FALLBACK_ICON, DAY_MS, DEFAULT_GAME_DIFFICULTY, DEFAULT_GAME_MODE, DEFAULT_TRACK_SLOT_VISIBLE, MARKET_ROLES, QUARTERS_PER_HOUR, RESOURCE_TICK_LEDGER_LIMIT, ROLE_ACTIONS, ROLE_ACTION_STATUS, STAGE_STUDIO_LIMIT, STAMINA_OVERUSE_LIMIT, STUDIO_COLUMN_SLOT_COUNT, TRACK_ROLE_KEYS, TRACK_ROLE_TARGETS, TREND_DETAIL_COUNT, UNASSIGNED_CREATOR_EMOJI, UNASSIGNED_CREATOR_LABEL, UNASSIGNED_SLOT_LABEL, WEEKLY_SCHEDULE, acceptBailout, addRolloutStrategyDrop, addRolloutStrategyEvent, advanceHours, alignmentClass, assignToSlot, assignTrackAct, attemptSignCreator, buildCalendarProjection, buildMarketCreators, buildStudioEntries, buildTrackHistoryScopes, chartScopeLabel, chartWeightsForScope, clamp, clearSlot, collectTrendRanking, commitSlotChange, computeCharts, computePopulationSnapshot, countryColor, countryDemonym, createRolloutStrategyForEra, createTrack, creatorInitials, currentYear, declineBailout, deleteSlot, endEraById, ensureMarketCreators, ensureTrackSlotArrays, ensureTrackSlotVisibility, expandRolloutStrategy, formatCount, formatDate, formatGenreKeyLabel, formatGenreLabel, formatHourCountdown, formatMoney, formatShortDate, formatWeekRangeLabel, getAct, getActiveEras, getAdjustedStageHours, getAdjustedTotalStageHours, getBusyCreatorIds, getCommunityLabelRankingLimit, getCommunityTrendRankingLimit, getCreator, getCreatorPortraitUrl, getCreatorSignLockout, getCreatorStaminaSpentToday, getCrewStageStats, getEraById, getFocusedEra, getGameDifficulty, getGameMode, getLabelRanking, getLossArchives, getModifier, getOwnedStudioSlots, getPromoFacilityAvailability, getPromoFacilityForType, getReleaseAsapAt, getReleaseAsapHours, getReleaseDistributionFee, getRivalByName, getRolloutPlanningEra, getRolloutStrategiesForEra, getRolloutStrategyById, getSlotData, getSlotGameMode, getSlotValue, getStageCost, getStageStudioAvailable, getStudioAvailableSlots, getStudioMarketSnapshot, getStudioUsageCounts, getTopActSnapshot, getTopTrendGenre, getTrack, getTrackRoleIds, getTrackRoleIdsFromSlots, getWorkOrderCreatorIds, handleFromName, hoursUntilNextScheduledTime, isMasteringTrack, listFromIds, listGameDifficulties, listGameModes, loadLossArchives, loadSlot, logEvent, makeAct, makeActName, makeEraName, makeGenre, makeLabelName, makeProjectTitle, makeTrackTitle, markCreatorPromo, recordTrackPromoCost, markUiLogStart, moodFromGenre, normalizeCreator, normalizeRoleIds, parseTrackRoleTarget, pickDistinct, postCreatorSigned, pruneCreatorSignLockouts, qualityGrade, rankCandidates, recommendActForTrack, recommendPhysicalRun, recommendReleasePlan, recommendTrackPlan, releaseTrack, releasedTracks, reservePromoFacilitySlot, resetState, roleLabel, safeAvatarUrl, saveToActiveSlot, scheduleRelease, scoreGrade, session, setFocusEraById, setSelectedRolloutStrategyId, setSlotTarget, setTimeSpeed, shortGameModeLabel, slugify, staminaRequirement, startDemoStage, startEraForAct, startGameLoop, startMasterStage, state, syncLabelWallets, themeFromGenre, trackKey, trackRoleLimit, trendAlignmentLeader, uid, weekIndex, weekNumberFromEpochMs, };
