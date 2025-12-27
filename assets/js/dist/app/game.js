// @ts-nocheck
import { fetchChartSnapshotsForWeek, listChartWeeks, storeChartSnapshot } from "./db.js";
import { queueChartSnapshotsWrite, queueSaveSlotDelete, queueSaveSlotWrite, readSaveSlotFromExternal } from "./file-storage.js";
import { DEFAULT_PROMO_TYPE, PROMO_TYPE_DETAILS, getPromoTypeDetails } from "./promo_types.js";
import { useCalendarProjection } from "./calendar.js";
import { uiHooks } from "./game/ui-hooks.js";
import { CREATOR_NAME_PARTS, ERA_NAME_TEMPLATES, LABEL_NAMES, NAME_PARTS, PROJECT_TITLE_TEMPLATES, PROJECT_TITLE_TRANSLATIONS, PROJECT_TITLES, generateActNamePair, generateUniqueActNamePairs, getActNameTranslation, hasHangulText, lookupActNameDetails, renderActNameByNation } from "./game/names.js";
import { AI_CREATE_BUDGET_PCT, AI_CREATE_MIN_CASH, AI_PROMO_BUDGET_PCT, AUDIENCE_ALIGNMENT_SCORE_SCALE, AUDIENCE_BASE_WEIGHT, AUDIENCE_CHART_WEIGHT, AUDIENCE_ICONIC_RISK_BOOST, AUDIENCE_PREF_DRIFT, AUDIENCE_PREF_LIMIT, AUDIENCE_RELEASE_WEIGHT, AUDIENCE_TASTE_WINDOW_WEEKS, AUDIENCE_TREND_BONUS, AUTO_CREATE_BUDGET_PCT, AUTO_CREATE_MAX_TRACKS, AUTO_CREATE_MIN_CASH, AUTO_PROMO_BUDGET_PCT, AUTO_PROMO_MIN_BUDGET, AUTO_PROMO_RIVAL_TYPE, CCC_SORT_OPTIONS, COMMUNITY_LABEL_RANKING_DEFAULT, COMMUNITY_LABEL_RANKING_LIMITS, COMMUNITY_LEGACY_RANKING_LIMITS, COMMUNITY_TREND_RANKING_DEFAULT, COMMUNITY_TREND_RANKING_LIMITS, CREATOR_FALLBACK_EMOJI, CREATOR_FALLBACK_ICON, DEFAULT_GAME_DIFFICULTY, DEFAULT_GAME_MODE, DEFAULT_TRACK_SLOT_VISIBLE, GAME_DIFFICULTIES, GAME_MODES, HUSK_MAX_RELEASE_STEPS, HUSK_PROMO_DAY, HUSK_PROMO_DEFAULT_TYPE, HUSK_PROMO_HOUR, PRIME_SHOWCASE_MIN_ACT_PEAK, PRIME_SHOWCASE_MIN_QUALITY, PRIME_SHOWCASE_MIN_TRACK_PEAK, LABEL_DOMINANCE_MAX_BOOST, LABEL_DOMINANCE_MAX_PENALTY, LABEL_DOMINANCE_SMOOTHING, LABEL_DOMINANCE_TARGET_SHARE, LIVE_SYNC_INTERVAL_MS, LOSS_ARCHIVE_KEY, LOSS_ARCHIVE_LIMIT, MARKET_TRACK_ACTIVE_LIMIT, MARKET_TRACK_ARCHIVE_LIMIT, QUARTERS_PER_HOUR, QUARTER_HOUR_MS, QUARTER_TICK_FRAME_LIMIT, QUARTER_TICK_WARNING_THRESHOLD, RESOURCE_TICK_LEDGER_LIMIT, RIVAL_COMPETE_CASH_BUFFER, RIVAL_COMPETE_DROP_COST, ROLE_ACTION_STATUS, ROLE_ACTIONS, ROLLOUT_BLOCK_LOG_COOLDOWN_HOURS, ROLLOUT_EVENT_SCHEDULE, SEED_CALIBRATION_KEY, SEED_CALIBRATION_YEAR, SEED_DOMINANT_MOMENTUM_BONUS, SEED_DOMINANT_PICK_CHANCE, SEED_DOMINANT_SCORE_BONUS_PCT, STARTING_CASH, STARTING_STUDIO_SLOTS, STAGE_STUDIO_LIMIT, STATE_VERSION, STAMINA_OVERUSE_LIMIT, STAMINA_OVERUSE_STRIKES, STAMINA_REGEN_PER_HOUR, STUDIO_COLUMN_SLOT_COUNT, TICK_FRAME_WARN_MS, TRACK_CREW_RULES, TRACK_ROLE_KEYS, TRACK_ROLE_MATCH, TRACK_ROLE_TARGET_PATTERN, TRACK_ROLE_TARGETS, TREND_DETAIL_COUNT, TREND_WINDOW_WEEKS, UI_REACT_ISLANDS_ENABLED, UI_EVENT_LOG_KEY, UNASSIGNED_CREATOR_EMOJI, UNASSIGNED_CREATOR_LABEL, UNASSIGNED_SLOT_LABEL, WEEKLY_SCHEDULE, WEEKLY_UPDATE_WARN_MS } from "./game/config.js";
import { evaluateProjectTrackConstraints as evaluateProjectTrackConstraintsWithTracks, getProjectTrackLimits, normalizeProjectName, normalizeProjectType } from "./game/project-tracks.js";
import { buildDefaultTrackSlotVisibility, buildEmptyTrackSlotList, parseTrackRoleTarget, roleLabel, trackRoleLimit } from "./game/track-roles.js";
import { alignmentClass, countryColor, countryDemonym, formatGenreKeyLabel, formatGenreLabel, makeGenre, moodFromGenre, slugify, themeFromGenre } from "./game/label-utils.js";
const ECONOMY_BASELINES_DEFAULT = { ...ECONOMY_BASELINES };
const ECONOMY_TUNING_DEFAULT = { ...ECONOMY_TUNING };
const ECONOMY_PRICE_MULTIPLIERS_DEFAULT = { ...ECONOMY_PRICE_MULTIPLIERS };
const session = {
    activeSlot: null,
    prevSpeed: null,
    uiLogStart: 0,
    lastSlotPayload: null,
    lastLiveSyncAt: 0
};
const AUTO_PROMO_SLOT_LIMIT = 4;
function buildAutoPromoSlotList() {
    return Array.from({ length: AUTO_PROMO_SLOT_LIMIT }, () => null);
}
function buildAutoPromoBudgetSlots(defaultPct = 0) {
    return Array.from({ length: AUTO_PROMO_SLOT_LIMIT }, (_, index) => (index === 0 ? defaultPct : 0));
}
function evaluateProjectTrackConstraints(projectName, projectType) {
    return evaluateProjectTrackConstraintsWithTracks(state.tracks, projectName, projectType);
}
const RELEASE_TYPE_ALIASES = {
    single: "Single",
    singles: "Single",
    project: "Project",
    "project track": "Project",
    "project-track": "Project",
    album: "Project",
    ep: "Project"
};
function normalizeReleaseType(releaseType, fallbackProjectType) {
    const raw = String(releaseType || "").trim().toLowerCase();
    if (raw && RELEASE_TYPE_ALIASES[raw])
        return RELEASE_TYPE_ALIASES[raw];
    const fallback = normalizeProjectType(fallbackProjectType || "Single");
    return fallback === "Single" ? "Single" : "Project";
}
function resolveTrackReleaseType(track) {
    if (!track)
        return "Single";
    return normalizeReleaseType(track.releaseType, track.projectType);
}
function resolveTrackPricingType(track) {
    const releaseType = resolveTrackReleaseType(track);
    if (releaseType === "Single")
        return "Single";
    return normalizeProjectType(track?.projectType || "Single");
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
            speed: "fast",
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
        inventory: { modifiers: {} },
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
        promoContent: [],
        touring: { drafts: [], bookings: [], lastDraftId: 0 },
        promoCharts: { global: [], nations: { Annglora: [], Bytenza: [], Crowlya: [] }, regions: {} },
        tourCharts: { global: [], nations: { Annglora: [], Bytenza: [], Crowlya: [] }, regions: {} },
        tourChartHistory: {},
        rivals: [],
        quests: [],
        events: [],
        resourceTickLedger: { hours: [], pendingHour: null },
        ui: {
            activeChart: "global",
            chartContentType: "tracks",
            chartPulseScopeType: "global",
            chartPulseScopeTarget: "global",
            chartPulseContentType: "tracks",
            trendScopeType: "global",
            trendScopeTarget: "Annglora",
            labelRankingLimit: COMMUNITY_LABEL_RANKING_DEFAULT,
            trendRankingLimit: COMMUNITY_TREND_RANKING_DEFAULT,
            genreTheme: "All",
            genreMood: "All",
            slotTarget: null,
            createStage: "sheet",
            createMode: "manual",
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
            promoPrimeTime: false,
            promoBudgets: Object.keys(PROMO_TYPE_DETAILS).reduce((acc, typeId) => {
                acc[typeId] = PROMO_TYPE_DETAILS[typeId].cost;
                return acc;
            }, {}),
            promoSlots: { actId: null, projectId: null, trackId: null },
            autoPromoSlots: {
                actIds: buildAutoPromoSlotList(),
                projectIds: buildAutoPromoSlotList(),
                trackIds: buildAutoPromoSlotList()
            },
            tourDraftId: null,
            tourVenueFilters: { nation: "All", regionId: "All", tier: "All" },
            tourBookingWeek: null,
            tourBookingDay: null,
            tourNotice: null,
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
                tourScheduled: true,
                rivalScheduled: true,
                rivalReleased: true
            },
            calendarWeekIndex: null,
            sidePanelRestore: {},
            dashboardFocusPanel: "charts",
            activeView: "dashboard",
            tutorialTab: "loops"
        },
        era: { active: [], history: [] },
        rolloutStrategies: [],
        economy: {
            lastRevenue: 0,
            lastUpkeep: 0,
            lastWeek: 0,
            leaseFeesWeek: 0,
            pendingTouring: { revenue: 0, costs: 0, profit: 0, attendance: 0, fanGain: 0, count: 0 },
            lastTouring: null,
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
            annualAwards: [],
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
            actPopularity: { years: {}, lastUpdateYear: null, lastUpdateWeek: null },
            labelShare: {},
            labelCompetition: {},
            labelShareWeek: null,
            difficulty: difficulty.id,
            gameMode: DEFAULT_GAME_MODE,
            startYear: getGameMode(DEFAULT_GAME_MODE).startYear,
            seedCalibration: null,
            gameOver: null,
            winState: null,
            winShown: false,
            endShown: false,
            cheaterMode: false,
            cheaterEconomyOverrides: { baselines: {}, tuning: {}, priceMultipliers: {} },
            touringBalanceEnabled: false,
            autoSave: { enabled: true, minutes: 2, lastSavedAt: null },
            autoCreate: {
                enabled: false,
                lastRunAt: null,
                minCash: AUTO_CREATE_MIN_CASH,
                budgetPct: AUTO_CREATE_BUDGET_PCT,
                maxTracks: AUTO_CREATE_MAX_TRACKS,
                mode: "solo",
                lastOutcome: null
            },
            autoRollout: {
                enabled: false,
                lastCheckedAt: null,
                budgetPct: AUTO_PROMO_BUDGET_PCT,
                budgetPctSlots: buildAutoPromoBudgetSlots(AUTO_PROMO_BUDGET_PCT)
            },
            keepEraRolloutHusks: true
        }
    };
}
const state = makeDefaultState();
function ensureCheaterEconomyOverrides() {
    if (!state.meta)
        state.meta = makeDefaultState().meta;
    if (!state.meta.cheaterEconomyOverrides || typeof state.meta.cheaterEconomyOverrides !== "object") {
        state.meta.cheaterEconomyOverrides = { baselines: {}, tuning: {}, priceMultipliers: {} };
    }
    const overrides = state.meta.cheaterEconomyOverrides;
    if (!overrides.baselines || typeof overrides.baselines !== "object")
        overrides.baselines = {};
    if (!overrides.tuning || typeof overrides.tuning !== "object")
        overrides.tuning = {};
    if (!overrides.priceMultipliers || typeof overrides.priceMultipliers !== "object")
        overrides.priceMultipliers = {};
    return overrides;
}
function resetCheaterEconomyOverrides() {
    Object.assign(ECONOMY_BASELINES, ECONOMY_BASELINES_DEFAULT);
    Object.assign(ECONOMY_TUNING, ECONOMY_TUNING_DEFAULT);
    Object.assign(ECONOMY_PRICE_MULTIPLIERS, ECONOMY_PRICE_MULTIPLIERS_DEFAULT);
}
function applyCheaterEconomyOverrides() {
    resetCheaterEconomyOverrides();
    if (!state.meta?.cheaterMode)
        return;
    const overrides = ensureCheaterEconomyOverrides();
    const apply = (target, values) => {
        if (!target || typeof target !== "object" || !values || typeof values !== "object")
            return;
        Object.entries(values).forEach(([key, value]) => {
            if (Number.isFinite(value))
                target[key] = value;
        });
    };
    apply(ECONOMY_BASELINES, overrides.baselines);
    apply(ECONOMY_TUNING, overrides.tuning);
    apply(ECONOMY_PRICE_MULTIPLIERS, overrides.priceMultipliers);
}
function setCheaterEconomyOverride(targetKey, valueKey, value) {
    const overrides = ensureCheaterEconomyOverrides();
    const target = overrides[targetKey];
    if (!target || typeof target !== "object")
        return false;
    if (!Number.isFinite(value)) {
        delete target[valueKey];
    }
    else {
        target[valueKey] = value;
    }
    if (state.meta?.cheaterMode)
        applyCheaterEconomyOverrides();
    return true;
}
function setCheaterMode(enabled) {
    const next = Boolean(enabled);
    const prev = Boolean(state.meta?.cheaterMode);
    if (prev === next)
        return;
    if (!state.meta)
        state.meta = makeDefaultState().meta;
    state.meta.cheaterMode = next;
    if (next) {
        logEvent("Cheater mode enabled. Achievements and tasks are disabled while active.", "warn");
    }
    else {
        logEvent("Cheater mode disabled. Achievements and tasks restored.", "info");
        if (!state.quests.length)
            refreshQuestPool();
    }
    applyCheaterEconomyOverrides();
}
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
const ACT_PROMO_WARNING_MS = YEAR_MS / 2;
const ACT_PROMO_WARNING_WEEKS = Math.round(ACT_PROMO_WARNING_MS / WEEK_MS);
const ACT_PROMO_STALE_PENALTY_STEP_WEEKS = 8;
const ACT_PROMO_STALE_PENALTY_STEP = 2;
const ACT_PROMO_STALE_PENALTY_MAX = 10;
const ERA_PROJECT_GAP_WEEKS = ACT_PROMO_WARNING_WEEKS;
const ERA_PROJECT_DELUXE_LIMIT = 3;
const ERA_PROJECT_MAIN_LIMIT = getProjectTrackLimits("Album").max || 32;
const ERA_PROJECT_DELUXE_SUFFIX = " (Deluxe)";
const ERA_TOURING_STAGE_INDEX = ERA_STAGES.indexOf("Legacy");
const PROMO_GAP_PENALTY_PER_TYPE = 3;
const PROMO_GAP_PENALTY_MAX = 9;
const PROMO_TRACK_REQUIRED_TYPES = Object.keys(PROMO_TYPE_DETAILS)
    .filter((typeId) => PROMO_TYPE_DETAILS[typeId]?.requiresTrack);
const TOUR_GOALS = ["balanced"];
const TOUR_GOAL_DEFAULT = "balanced";
const TOUR_LEAD_MIN_WEEKS = 2;
const TOUR_LEAD_MAX_WEEKS = 6;
const TOUR_WEEKLY_MAX_DATES = 2;
const TOUR_REST_DAY_MIN = 1;
const TOUR_TRAVEL_BUFFER_MIN = 1;
const TOUR_WARNING_SELLTHROUGH_LOW = 0.5;
const TOUR_WARNING_SELLTHROUGH_HIGH = 0.95;
const TOUR_BOOKING_SELLTHROUGH_MIN = 0.35;
const TOUR_BOOKING_COST_BUFFER = 1.05;
const TOUR_FAN_GAIN_VISIBILITY = 0.35;
const TOUR_FAN_GAIN_REVENUE = 0.2;
const TOUR_FAN_GAIN_BALANCED = 0.28;
const TOUR_VISIBILITY_PROMO_MAX = 4;
const TOUR_VISIBILITY_PROMO_MIN = 1;
const TOUR_CONCERT_SEGMENT_COUNT = 3;
const TOUR_CONCERT_INTEREST_BASE = 0.9;
const TOUR_CONCERT_INTEREST_MAX = 1.15;
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
const CATHARSIS_LEVEL_COUNT = 10;
const MARKET_CATHARSIS_LEVEL_CAP = 5;
const MARKET_CATHARSIS_LEVEL_WEIGHTS = [
    { level: 1, weight: 30 },
    { level: 2, weight: 25 },
    { level: 3, weight: 20 },
    { level: 4, weight: 15 },
    { level: 5, weight: 10 }
];
const CREATOR_ROSTER_CAP = 125;
const STUDIO_CAP_PER_LABEL = 50;
const ACHIEVEMENT_TARGET = 12;
const RIVAL_REVENUE_MULT = 1;
const RIVAL_UPKEEP_MULT = 0.7;
const RIVAL_AMBITION_FLOOR = 0.35;
const RIVAL_AMBITION_YEAR_BOOST = 0.1;
const RIVAL_AMBITION_QUALITY_BOOST = 6;
const RIVAL_AMBITION_ROSTER_BONUS = 3;
const RIVAL_CASH_BASE = Math.round(STARTING_CASH * 0.4);
const RIVAL_CASH_AMBITION_BOOST = Math.round(STARTING_CASH * 0.5);
const RIVAL_CASH_YEAR_BOOST = Math.round(STARTING_CASH * 0.1);
const CRITIC_SCORE_WEIGHTS = { quality: 0.5, alignment: 0.3, themeMood: 0.2 };
const CRITIC_QUALITY_BLEND = 0.35;
const CRITIC_QUALITY_DELTA_MAX = 12;
const CRITIC_SCORE_JITTER = 3;
const CRITIC_PICK_THRESHOLD = 90;
const CRITIC_SATURATION_WINDOW_WEEKS = 8;
const CRITIC_SATURATION_STEP = 2;
const CRITIC_SATURATION_MAX = 10;
const CRITIC_STRINGENCY_BASE = 1;
const CRITIC_STRINGENCY_ERA_STEP = 0.01;
const CRITIC_STRINGENCY_MAX = 1.15;
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
function labelReleasePool(labelName) {
    if (!labelName)
        return [];
    const active = Array.isArray(state.marketTracks) ? state.marketTracks : [];
    const archived = Array.isArray(state.meta?.marketTrackArchive) ? state.meta.marketTrackArchive : [];
    return active.concat(archived).filter((entry) => entry?.label === labelName);
}
function labelHasGlobalRank(labelName, maxRank) {
    if (!labelName)
        return false;
    return (state.charts.global || []).some((entry) => resolveChartEntryLabel(entry) === labelName && entry.rank <= maxRank);
}
function labelBestGlobalRank(labelName) {
    if (!labelName)
        return null;
    const ranks = (state.charts.global || [])
        .filter((entry) => resolveChartEntryLabel(entry) === labelName)
        .map((entry) => entry.rank)
        .filter((rank) => Number.isFinite(rank));
    return ranks.length ? Math.min(...ranks) : null;
}
function labelHasNationRank(labelName, maxRank) {
    if (!labelName)
        return false;
    return NATIONS.some((nation) => (state.charts.nations[nation] || []).some((entry) => resolveChartEntryLabel(entry) === labelName && entry.rank <= maxRank));
}
function labelBestNationRank(labelName) {
    if (!labelName)
        return null;
    const ranks = [];
    NATIONS.forEach((nation) => {
        (state.charts.nations[nation] || []).forEach((entry) => {
            if (resolveChartEntryLabel(entry) === labelName && Number.isFinite(entry.rank))
                ranks.push(entry.rank);
        });
    });
    return ranks.length ? Math.min(...ranks) : null;
}
function labelHasRegionRank(labelName, maxRank) {
    if (!labelName)
        return false;
    return REGION_DEFS.some((region) => (state.charts.regions[region.id] || []).some((entry) => resolveChartEntryLabel(entry) === labelName && entry.rank <= maxRank));
}
function labelBestRegionRank(labelName) {
    if (!labelName)
        return null;
    const ranks = [];
    REGION_DEFS.forEach((region) => {
        (state.charts.regions[region.id] || []).forEach((entry) => {
            if (resolveChartEntryLabel(entry) === labelName && Number.isFinite(entry.rank))
                ranks.push(entry.rank);
        });
    });
    return ranks.length ? Math.min(...ranks) : null;
}
function labelReleaseCount(labelName) {
    return labelReleasePool(labelName).length;
}
function labelReleasedProjectCount(labelName) {
    const projects = new Set();
    labelReleasePool(labelName).forEach((entry) => {
        const name = entry.projectName || `${entry.title || "Unknown"} - Single`;
        if (name)
            projects.add(name);
    });
    return projects.size;
}
function labelBestQuality(labelName) {
    const qualities = labelReleasePool(labelName)
        .map((entry) => entry.quality)
        .filter((value) => Number.isFinite(value));
    return qualities.length ? Math.max(...qualities) : 0;
}
function labelTrendReleaseCount(labelName) {
    return labelReleasePool(labelName).filter((entry) => entry?.trendAtRelease).length;
}
function labelSharePercent(labelName) {
    if (!labelName)
        return 0;
    const share = state.meta?.labelShare?.[labelName];
    if (Number.isFinite(share))
        return share * 100;
    const scores = computeLabelScoresFromCharts();
    const { shares } = computeLabelShares(scores, { smoothing: 1 });
    return (shares[labelName] || 0) * 100;
}
const CEO_REQUEST_DEFS = [
    { id: "REQ-01", label: "Chart-Topping Track", desc: "Most chart-topping track of the year in Gaia.", exp: 2200 },
    { id: "REQ-02", label: "Best-Selling Track", desc: "Best-selling / most-streamed track of the year in Gaia.", exp: 2000 },
    { id: "REQ-03", label: "Critics' Track", desc: "Most awarded / critically acclaimed track of the year in Gaia.", exp: 2000 },
    { id: "REQ-04", label: "Chart-Topping Project", desc: "Most chart-topping project of the year in Gaia.", exp: 2100 },
    { id: "REQ-05", label: "Best-Selling Project", desc: "Best-selling / most-streamed project of the year in Gaia.", exp: 2000 },
    { id: "REQ-06", label: "Critics' Project", desc: "Most awarded / critically acclaimed project of the year in Gaia.", exp: 2000 },
    { id: "REQ-07", label: "Chart-Topping Promo", desc: "Most chart-topping promotional content of the year in Gaia.", exp: 1800 },
    { id: "REQ-08", label: "Most-Watched Promo", desc: "Best-selling / most-watched promotional content of the year in Gaia.", exp: 1700 },
    { id: "REQ-09", label: "Critics' Promo", desc: "Most awarded / critically acclaimed promotional content of the year in Gaia.", exp: 1700 },
    { id: "REQ-10", label: "Chart-Topping Tour", desc: "Most chart-topping tour of the year in Gaia.", exp: 1900 },
    { id: "REQ-11", label: "Best-Attended Tour", desc: "Best-selling / highest-attended tour of the year in Gaia.", exp: 1800 },
    { id: "REQ-12", label: "Critics' Tour", desc: "Most awarded / critically acclaimed tour of the year in Gaia.", exp: 1800 }
];
const ACHIEVEMENTS = CEO_REQUEST_DEFS.map((definition) => ({
    id: definition.id,
    label: definition.label,
    desc: definition.desc,
    exp: definition.exp,
    target: 1,
    check: () => countAnnualAwardWins(definition.id, state.label.name) >= 1,
    progress: () => countAnnualAwardWins(definition.id, state.label.name)
}));
const RIVAL_ACHIEVEMENTS = CEO_REQUEST_DEFS.map((definition) => ({
    id: definition.id,
    label: definition.label,
    desc: definition.desc,
    exp: definition.exp,
    target: 1,
    check: (rival) => countAnnualAwardWins(definition.id, rival?.name) >= 1,
    progress: (rival) => countAnnualAwardWins(definition.id, rival?.name)
}));
function awardExp(amount, note, silent = false) {
    const value = Math.max(0, Math.round(amount || 0));
    if (!value)
        return;
    state.meta.exp = Math.max(0, state.meta.exp + value);
    if (note && !silent) {
        logEvent(`${note} (+${value} EXP).`);
    }
}
function achievementsDisabled() {
    return Boolean(state.meta?.cheaterMode || state.meta?.achievementsLocked);
}
function unlockAchievement(definition) {
    if (achievementsDisabled())
        return;
    if (state.meta.achievementsUnlocked.includes(definition.id))
        return;
    state.meta.achievementsUnlocked.push(definition.id);
    state.meta.achievements = state.meta.achievementsUnlocked.length;
    awardExp(definition.exp, `Achievement unlocked: ${definition.label}`);
}
function evaluateAchievements() {
    if (achievementsDisabled())
        return;
    ACHIEVEMENTS.forEach((definition) => {
        if (definition.check())
            unlockAchievement(definition);
    });
    state.meta.achievements = state.meta.achievementsUnlocked.length;
}
function achievementProgressRatio(definition, value) {
    if (!definition || typeof definition.target === "undefined")
        return 0;
    if (value === null || typeof value === "undefined")
        return 0;
    const target = Number(definition.target);
    if (!Number.isFinite(target) || target <= 0)
        return 0;
    return clamp(Number(value) / target, 0, 1);
}
function ensureRivalAchievementState(rival) {
    if (!rival)
        return;
    if (!Array.isArray(rival.achievementsUnlocked))
        rival.achievementsUnlocked = [];
    if (typeof rival.achievements !== "number")
        rival.achievements = rival.achievementsUnlocked.length;
    rival.achievements = Math.max(rival.achievements, rival.achievementsUnlocked.length);
    if (typeof rival.achievementsLocked !== "boolean")
        rival.achievementsLocked = false;
    if (typeof rival.achievementFocus !== "string")
        rival.achievementFocus = null;
    if (typeof rival.promoRuns !== "number")
        rival.promoRuns = 0;
    if (typeof rival.eraCompletions !== "number")
        rival.eraCompletions = 0;
    if (typeof rival.ambition !== "number")
        rival.ambition = RIVAL_AMBITION_FLOOR;
    if (!rival.economy || typeof rival.economy !== "object") {
        rival.economy = { lastRevenue: 0, lastUpkeep: 0, lastWeek: 0, lastLeaseFees: 0 };
    }
    if (typeof rival.economy.lastRevenue !== "number")
        rival.economy.lastRevenue = 0;
    if (typeof rival.economy.lastUpkeep !== "number")
        rival.economy.lastUpkeep = 0;
    if (typeof rival.economy.lastWeek !== "number")
        rival.economy.lastWeek = 0;
    if (typeof rival.economy.lastLeaseFees !== "number")
        rival.economy.lastLeaseFees = 0;
}
function unlockRivalAchievement(rival, definition) {
    if (!rival || !definition || rival.achievementsLocked)
        return;
    if (!Array.isArray(rival.achievementsUnlocked))
        rival.achievementsUnlocked = [];
    if (rival.achievementsUnlocked.includes(definition.id))
        return;
    rival.achievementsUnlocked.push(definition.id);
    rival.achievements = rival.achievementsUnlocked.length;
    logEvent(`${rival.name} completed CEO Request ${definition.id}: ${definition.label}.`);
}
function pickRivalAchievementFocus(rival) {
    if (!rival)
        return null;
    const unlocked = new Set(rival.achievementsUnlocked || []);
    const options = RIVAL_ACHIEVEMENTS.filter((definition) => !unlocked.has(definition.id));
    if (!options.length) {
        rival.achievementFocus = null;
        return null;
    }
    const scored = options.map((definition) => {
        const value = typeof definition.progress === "function" ? definition.progress(rival) : 0;
        const ratio = achievementProgressRatio(definition, value);
        const seed = makeStableSeed([weekIndex(), rival.id || rival.name || "", definition.id, "focus"]);
        const rng = makeSeededRng(seed);
        return { id: definition.id, ratio, jitter: rng() * 0.02 };
    });
    scored.sort((a, b) => {
        if (a.ratio !== b.ratio)
            return b.ratio - a.ratio;
        return b.jitter - a.jitter;
    });
    rival.achievementFocus = scored[0].id;
    return rival.achievementFocus;
}
function evaluateRivalAchievements() {
    if (!Array.isArray(state.rivals))
        return;
    state.rivals.forEach((rival) => {
        ensureRivalAchievementState(rival);
        if (rival.achievementsLocked)
            return;
        RIVAL_ACHIEVEMENTS.forEach((definition) => {
            if (definition.check(rival))
                unlockRivalAchievement(rival, definition);
        });
        rival.achievements = rival.achievementsUnlocked.length;
        pickRivalAchievementFocus(rival);
    });
}
function computeRivalAmbition(rival) {
    if (!rival)
        return RIVAL_AMBITION_FLOOR;
    const total = RIVAL_ACHIEVEMENTS.length || ACHIEVEMENT_TARGET;
    const unlocked = Array.isArray(rival.achievementsUnlocked) ? rival.achievementsUnlocked.length : 0;
    const requestPressure = total ? clamp(1 - unlocked / total, 0, 1) : 0;
    const share = state.meta?.labelShare?.[rival.name];
    const targetShare = LABEL_DOMINANCE_TARGET_SHARE;
    const sharePressure = (Number.isFinite(share) && targetShare > 0 && share < targetShare)
        ? clamp((targetShare - share) / targetShare, 0, 1)
        : 0;
    let focusPressure = 0;
    if (rival.achievementFocus) {
        const focus = RIVAL_ACHIEVEMENTS.find((definition) => definition.id === rival.achievementFocus);
        if (focus && typeof focus.progress === "function") {
            const value = focus.progress(rival);
            focusPressure = clamp(1 - achievementProgressRatio(focus, value), 0, 1);
        }
    }
    const yearBoost = currentYear() < 3000 ? RIVAL_AMBITION_YEAR_BOOST : 0;
    const raw = RIVAL_AMBITION_FLOOR + yearBoost + sharePressure * 0.4 + requestPressure * 0.25 + focusPressure * 0.2;
    return clamp(raw, RIVAL_AMBITION_FLOOR, 1);
}
function refreshRivalAmbition() {
    if (!Array.isArray(state.rivals))
        return;
    state.rivals.forEach((rival) => {
        ensureRivalAchievementState(rival);
        if (!rival.achievementFocus)
            pickRivalAchievementFocus(rival);
        rival.ambition = computeRivalAmbition(rival);
    });
}
function ensureRivalCashFloor() {
    if (!Array.isArray(state.rivals))
        return;
    const yearBoost = currentYear() < 3000 ? RIVAL_CASH_YEAR_BOOST : 0;
    state.rivals.forEach((rival) => {
        ensureRivalAchievementState(rival);
        const ambition = clamp(rival.ambition ?? RIVAL_AMBITION_FLOOR, 0, 1);
        const floor = Math.round(RIVAL_CASH_BASE + RIVAL_CASH_AMBITION_BOOST * ambition + yearBoost);
        if (!Number.isFinite(rival.cash))
            rival.cash = STARTING_CASH;
        if (rival.cash < floor) {
            rival.cash = floor;
            if (!rival.wallet)
                rival.wallet = { cash: rival.cash };
            rival.wallet.cash = rival.cash;
        }
    });
}
function updateRivalPlanCompletion(rival, currentWeekIndex = weekIndex()) {
    if (!rival?.aiPlan)
        return false;
    const startWeek = rival.aiPlan.windowStartWeekIndex;
    const endWeek = rival.aiPlan.windowEndWeekIndex;
    if (!Number.isFinite(startWeek) || !Number.isFinite(endWeek))
        return false;
    if (endWeek >= currentWeekIndex)
        return false;
    if (rival.aiPlan.lastCompletedWindow === endWeek)
        return false;
    const releases = labelReleasePool(rival.name);
    const hasRelease = releases.some((entry) => {
        const releaseWeek = weekIndexForEpochMs(entry.releasedAt);
        return Number.isFinite(releaseWeek) && releaseWeek >= startWeek && releaseWeek <= endWeek;
    });
    if (!hasRelease)
        return false;
    rival.eraCompletions = Math.max(0, (rival.eraCompletions || 0) + 1);
    rival.aiPlan.lastCompletedWindow = endWeek;
    return true;
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
function findModifier(id) {
    if (!id)
        return null;
    return MODIFIERS.find((mod) => mod.id === id) || null;
}
function getModifier(id) {
    return findModifier(id) || MODIFIERS[0];
}
function resolveModifier(modifier) {
    if (!modifier)
        return null;
    if (typeof modifier === "string")
        return getModifier(modifier);
    if (modifier && typeof modifier === "object") {
        if (modifier.id) {
            const resolved = findModifier(modifier.id);
            return resolved || modifier;
        }
        if (typeof modifier.hoursDelta === "number")
            return modifier;
    }
    return null;
}
function getModifierInventoryCount(modifierId) {
    if (!modifierId || modifierId === "None")
        return 0;
    const modifiers = state.inventory?.modifiers;
    if (!modifiers || typeof modifiers !== "object")
        return 0;
    const value = modifiers[modifierId];
    if (!Number.isFinite(value))
        return 0;
    return Math.max(0, Math.floor(value));
}
function getOwnedModifierIds() {
    if (!state.inventory || !state.inventory.modifiers || typeof state.inventory.modifiers !== "object")
        return [];
    return Object.entries(state.inventory.modifiers)
        .filter(([, count]) => Number.isFinite(count) && count > 0)
        .map(([id]) => id);
}
function hasModifierTool(modifierId) {
    if (!modifierId || modifierId === "None")
        return true;
    return getModifierInventoryCount(modifierId) > 0;
}
function addModifierTool(modifierId, amount = 1) {
    if (!modifierId || modifierId === "None")
        return false;
    const count = Math.max(0, Math.floor(amount));
    if (!count)
        return false;
    if (!state.inventory || typeof state.inventory !== "object")
        state.inventory = { modifiers: {} };
    if (!state.inventory.modifiers || typeof state.inventory.modifiers !== "object") {
        state.inventory.modifiers = {};
    }
    const current = getModifierInventoryCount(modifierId);
    state.inventory.modifiers[modifierId] = current + count;
    return true;
}
function consumeModifierTool(modifierId, amount = 1) {
    if (!modifierId || modifierId === "None")
        return false;
    const count = Math.max(0, Math.floor(amount));
    if (!count)
        return false;
    const current = getModifierInventoryCount(modifierId);
    if (current < count)
        return false;
    const next = current - count;
    if (!state.inventory || typeof state.inventory !== "object")
        state.inventory = { modifiers: {} };
    if (!state.inventory.modifiers || typeof state.inventory.modifiers !== "object") {
        state.inventory.modifiers = {};
    }
    if (next > 0) {
        state.inventory.modifiers[modifierId] = next;
    }
    else {
        delete state.inventory.modifiers[modifierId];
    }
    return true;
}
function modifierMatchesContent(modifier, { theme, mood, alignment } = {}) {
    if (!modifier)
        return false;
    if (modifier.theme && modifier.theme !== theme)
        return false;
    if (modifier.mood && modifier.mood !== mood)
        return false;
    if (modifier.alignment && modifier.alignment !== alignment)
        return false;
    return true;
}
function getModifierQualityDelta(track, modifier) {
    const resolved = resolveModifier(modifier || track?.modifier);
    if (!resolved || !resolved.qualityDelta)
        return 0;
    const theme = track?.theme || themeFromGenre(track?.genre);
    const mood = track?.mood || moodFromGenre(track?.genre);
    const alignment = track?.alignment || "";
    if ((resolved.theme || resolved.mood || resolved.alignment)
        && !modifierMatchesContent(resolved, { theme, mood, alignment })) {
        return 0;
    }
    return resolved.qualityDelta;
}
function purchaseModifier(modifierId, { inflationMultiplier, quantity } = {}) {
    const resolved = findModifier(modifierId);
    if (!resolved || resolved.id === "None") {
        logEvent("Modifier purchase failed: invalid tool.", "warn");
        return { ok: false, kind: "INVALID", reason: "INVALID_ID" };
    }
    const basePrice = Number.isFinite(resolved.basePrice) ? resolved.basePrice : 0;
    const multiplier = Number.isFinite(inflationMultiplier) ? Math.max(1, inflationMultiplier) : 1;
    const qty = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
    const adjustedCost = Math.round(basePrice * multiplier) * qty;
    if (state.label.cash < adjustedCost) {
        logEvent(`Not enough cash to buy ${resolved.label}.`, "warn");
        return { ok: false, kind: "PRECONDITION", reason: "INSUFFICIENT_FUNDS", cost: adjustedCost, quantity: qty };
    }
    state.label.cash -= adjustedCost;
    addModifierTool(resolved.id, qty);
    const qtyLabel = qty > 1 ? ` x${qty}` : "";
    logEvent(`Purchased ${resolved.label}${qtyLabel} for ${formatMoney(adjustedCost)}.`, "receipt");
    return { ok: true, modifierId: resolved.id, cost: adjustedCost, basePrice, quantity: qty };
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
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("rls:state-changed"));
    }
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
const PROMO_PROJECT_KEY_PREFIX = "project";
function buildPromoProjectKey({ eraId, actId, projectName, projectType }) {
    if (!projectName)
        return null;
    const safeName = encodeURIComponent(String(projectName || ""));
    const safeType = encodeURIComponent(normalizeProjectType(projectType || "Single"));
    const safeAct = encodeURIComponent(String(actId || ""));
    const safeEra = encodeURIComponent(String(eraId || ""));
    return `${PROMO_PROJECT_KEY_PREFIX}:${safeEra}:${safeAct}:${safeName}:${safeType}`;
}
function buildPromoProjectKeyFromTrack(track) {
    if (!track)
        return null;
    const projectName = track.projectName || `${track.title} - Single`;
    const projectType = normalizeProjectType(track.projectType || "Single");
    return buildPromoProjectKey({
        eraId: track.eraId || null,
        actId: track.actId || null,
        projectName,
        projectType
    });
}
function parsePromoProjectKey(value) {
    if (!value || typeof value !== "string")
        return null;
    const parts = value.split(":");
    if (parts[0] !== PROMO_PROJECT_KEY_PREFIX || parts.length < 5)
        return null;
    const [, rawEra, rawAct, rawName, rawType] = parts;
    const projectName = decodeURIComponent(rawName || "").trim();
    const projectType = decodeURIComponent(rawType || "").trim();
    const actId = decodeURIComponent(rawAct || "").trim();
    const eraId = decodeURIComponent(rawEra || "").trim();
    if (!projectName)
        return null;
    return {
        eraId: eraId || null,
        actId: actId || null,
        projectName,
        projectType: projectType || "Single"
    };
}
const AUTO_PROMO_SLOT_TARGET_PATTERN = /^auto-promo-(act|project|track)-(\d+)$/;
function normalizeAutoPromoSlotList(list) {
    const next = Array.isArray(list) ? list.slice(0, AUTO_PROMO_SLOT_LIMIT) : [];
    while (next.length < AUTO_PROMO_SLOT_LIMIT)
        next.push(null);
    return next.map((value) => (typeof value === "string" ? value : null));
}
function normalizeAutoPromoBudgetSlots(list) {
    const next = Array.isArray(list) ? list.slice(0, AUTO_PROMO_SLOT_LIMIT) : [];
    while (next.length < AUTO_PROMO_SLOT_LIMIT)
        next.push(0);
    const normalized = next.map((value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? clamp(parsed, 0, 1) : 0;
    });
    const total = normalized.reduce((sum, value) => sum + value, 0);
    if (total <= 1)
        return normalized;
    const scale = 1 / total;
    return normalized.map((value) => Math.round(value * scale * 1000) / 1000);
}
function ensureAutoPromoSlots() {
    if (!state.ui.autoPromoSlots) {
        state.ui.autoPromoSlots = {
            actIds: buildAutoPromoSlotList(),
            projectIds: buildAutoPromoSlotList(),
            trackIds: buildAutoPromoSlotList()
        };
    }
    state.ui.autoPromoSlots.actIds = normalizeAutoPromoSlotList(state.ui.autoPromoSlots.actIds);
    state.ui.autoPromoSlots.projectIds = normalizeAutoPromoSlotList(state.ui.autoPromoSlots.projectIds);
    state.ui.autoPromoSlots.trackIds = normalizeAutoPromoSlotList(state.ui.autoPromoSlots.trackIds);
    return state.ui.autoPromoSlots;
}
function ensureAutoPromoBudgetSlots() {
    if (!state.meta)
        state.meta = makeDefaultState().meta;
    if (!state.meta.autoRollout) {
        state.meta.autoRollout = {
            enabled: false,
            lastCheckedAt: null,
            budgetPct: AUTO_PROMO_BUDGET_PCT,
            budgetPctSlots: buildAutoPromoBudgetSlots(AUTO_PROMO_BUDGET_PCT)
        };
    }
    state.meta.autoRollout.budgetPctSlots = normalizeAutoPromoBudgetSlots(state.meta.autoRollout.budgetPctSlots);
    return state.meta.autoRollout.budgetPctSlots;
}
function parseAutoPromoSlotTarget(targetId) {
    if (!targetId || typeof targetId !== "string")
        return null;
    const match = AUTO_PROMO_SLOT_TARGET_PATTERN.exec(targetId);
    if (!match)
        return null;
    const index = Number(match[2]) - 1;
    if (!Number.isFinite(index) || index < 0 || index >= AUTO_PROMO_SLOT_LIMIT)
        return null;
    return { kind: match[1], index };
}
function getAutoPromoSlotKey(kind) {
    if (kind === "act")
        return "actIds";
    if (kind === "project")
        return "projectIds";
    if (kind === "track")
        return "trackIds";
    return null;
}
function buildPromoSlotTargetId(scope, kind, index) {
    if (scope === "manual")
        return `promo-${kind}`;
    return `auto-promo-${kind}-${index + 1}`;
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
    if (targetId === "promo-project")
        return state.ui.promoSlots.projectId;
    if (targetId === "promo-track")
        return state.ui.promoSlots.trackId;
    const autoPromoSlot = parseAutoPromoSlotTarget(targetId);
    if (autoPromoSlot) {
        ensureAutoPromoSlots();
        const key = getAutoPromoSlotKey(autoPromoSlot.kind);
        return key ? state.ui.autoPromoSlots[key][autoPromoSlot.index] || null : null;
    }
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
    if (targetId === "promo-project")
        state.ui.promoSlots.projectId = value;
    if (targetId === "promo-track")
        state.ui.promoSlots.trackId = value;
    const autoPromoSlot = parseAutoPromoSlotTarget(targetId);
    if (autoPromoSlot) {
        ensureAutoPromoSlots();
        const key = getAutoPromoSlotKey(autoPromoSlot.kind);
        if (key) {
            const list = state.ui.autoPromoSlots[key];
            if (value) {
                const dupIndex = list.findIndex((id) => id === value);
                if (dupIndex !== -1 && dupIndex !== autoPromoSlot.index)
                    list[dupIndex] = null;
            }
            list[autoPromoSlot.index] = value || null;
        }
    }
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
function getSlotElement(targetId) {
    if (typeof document === "undefined")
        return null;
    return document.querySelector(`[data-slot-target="${targetId}"]`);
}
function shakeElement(el) {
    if (!el)
        return;
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
    const clear = () => {
        el.classList.remove("shake");
    };
    if (typeof window !== "undefined" && typeof window.setTimeout === "function") {
        window.setTimeout(clear, 320);
        return;
    }
    if (typeof setTimeout === "function") {
        setTimeout(clear, 320);
    }
}
function shakeSlot(targetId) {
    shakeElement(getSlotElement(targetId));
}
function shakeField(fieldId) {
    if (typeof document === "undefined")
        return;
    const el = document.getElementById(fieldId);
    if (!el)
        return;
    const field = el.closest(".field") || el;
    shakeElement(field);
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
    const manualPromoKind = targetId === "promo-act"
        ? "act"
        : targetId === "promo-project"
            ? "project"
            : targetId === "promo-track"
                ? "track"
                : null;
    const autoPromoSlot = parseAutoPromoSlotTarget(targetId);
    const promoScope = manualPromoKind ? "manual" : autoPromoSlot ? "auto" : null;
    const promoKind = manualPromoKind || autoPromoSlot?.kind || null;
    const promoIndex = autoPromoSlot?.index ?? 0;
    const promoRow = promoScope === "manual"
        ? {
            actId: state.ui.promoSlots.actId,
            projectId: state.ui.promoSlots.projectId,
            trackId: state.ui.promoSlots.trackId
        }
        : promoScope === "auto"
            ? (() => {
                const slots = ensureAutoPromoSlots();
                return {
                    actId: slots.actIds[promoIndex],
                    projectId: slots.projectIds[promoIndex],
                    trackId: slots.trackIds[promoIndex]
                };
            })()
            : null;
    const promoActTargetId = promoScope ? buildPromoSlotTargetId(promoScope, "act", promoIndex) : null;
    const promoProjectTargetId = promoScope ? buildPromoSlotTargetId(promoScope, "project", promoIndex) : null;
    const promoTrackTargetId = promoScope ? buildPromoSlotTargetId(promoScope, "track", promoIndex) : null;
    let promoActId = null;
    let promoProjectId = null;
    if (entityType === "track" && promoKind === "track") {
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
        const candidateActId = track.actId || era?.actId || null;
        if (candidateActId) {
            const act = getAct(candidateActId);
            const activeEra = act ? getLatestActiveEraForAct(act.id) : null;
            if (act && activeEra && activeEra.status === "Active") {
                promoActId = act.id;
            }
        }
        promoProjectId = buildPromoProjectKeyFromTrack(track);
        if (promoProjectId && promoRow?.projectId && promoRow.projectId !== promoProjectId) {
            logEvent("Promo project updated to match the selected track.", "warn");
        }
    }
    if (entityType === "project" && promoKind === "project") {
        const parsed = parsePromoProjectKey(entityId);
        if (!parsed) {
            shakeSlot(targetId);
            logEvent("Promo slot requires a valid Project ID.", "warn");
            return;
        }
        const era = parsed.eraId ? getEraById(parsed.eraId) : null;
        if (!era || era.status !== "Active") {
            shakeSlot(targetId);
            logEvent("Promo slot requires a project from an active era.", "warn");
            return;
        }
        const actId = parsed.actId || era.actId || null;
        const act = actId ? getAct(actId) : null;
        if (!act) {
            shakeSlot(targetId);
            logEvent("Act not found for promo project.", "warn");
            return;
        }
        promoActId = act.id;
        if (promoRow?.trackId) {
            const activeTrack = getTrack(promoRow.trackId);
            const trackProjectId = buildPromoProjectKeyFromTrack(activeTrack);
            if (trackProjectId && trackProjectId !== entityId) {
                if (promoTrackTargetId)
                    setSlotValue(promoTrackTargetId, null);
                logEvent("Promo track cleared (project mismatch).", "warn");
            }
        }
    }
    if (entityType === "act" && promoKind === "act") {
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
    if (promoActId && promoActTargetId)
        setSlotValue(promoActTargetId, promoActId);
    if (promoProjectId && promoProjectTargetId)
        setSlotValue(promoProjectTargetId, promoProjectId);
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
function formatHourCountdown(value, options) {
    if (!Number.isFinite(value))
        return "-";
    const rounded = Math.max(0, Math.round(value * QUARTERS_PER_HOUR) / QUARTERS_PER_HOUR);
    const fixedText = rounded.toFixed(2);
    const padHours = Number(options?.padHours || 0);
    if (padHours > 0) {
        const [hours, fraction] = fixedText.split(".");
        return `${hours.padStart(padHours, "0")}.${fraction}`;
    }
    return fixedText.replace(/\.00$/, "").replace(/0$/, "");
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
function alignReleaseAtToProcessing(epochMs) {
    if (!Number.isFinite(epochMs))
        return epochMs;
    if (isScheduledTime(epochMs, WEEKLY_SCHEDULE.releaseProcessing))
        return epochMs;
    return getReleaseAsapAt(epochMs);
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
const AUDIENCE_AGE_GROUP_SPAN = 4;
const AUDIENCE_AGE_GROUP_COUNT = 30;
function buildAudienceAgeGroupDefinitions() {
    return Array.from({ length: AUDIENCE_AGE_GROUP_COUNT }, (_, index) => {
        const minAge = index * AUDIENCE_AGE_GROUP_SPAN;
        const maxAge = minAge + AUDIENCE_AGE_GROUP_SPAN - 1;
        const generationIndex = Math.floor(minAge / 16);
        const generationStart = generationIndex * 16;
        const generationLabel = `${generationStart}-${generationStart + 15}`;
        return {
            index,
            minAge,
            maxAge,
            label: `${minAge}-${maxAge}`,
            generationIndex,
            generationLabel
        };
    });
}
const AUDIENCE_AGE_GROUPS = buildAudienceAgeGroupDefinitions();
function buildAudienceAgeGroupWeights() {
    return AUDIENCE_AGE_GROUPS.map((group) => {
        const midpoint = (group.minAge + group.maxAge) / 2;
        const youthCurve = Math.exp(-Math.pow((midpoint - 24) / 18, 2));
        const adultCurve = Math.exp(-Math.pow((midpoint - 45) / 28, 2));
        const base = 0.35 + 0.65 * ((youthCurve + adultCurve) / 2);
        return clamp(base, 0.2, 1.2);
    });
}
function allocateByShare(total, shares) {
    const safeTotal = Math.max(0, Math.round(Number(total) || 0));
    if (!safeTotal)
        return shares.map(() => 0);
    const raw = shares.map((share) => share * safeTotal);
    const rounded = raw.map((value) => Math.round(value));
    let diff = safeTotal - rounded.reduce((sum, value) => sum + value, 0);
    if (diff !== 0) {
        const ranked = raw
            .map((value, index) => ({ index, frac: value - Math.floor(value) }))
            .sort((a, b) => b.frac - a.frac);
        const steps = Math.min(Math.abs(diff), ranked.length);
        for (let i = 0; i < steps; i += 1) {
            const target = ranked[i % ranked.length].index;
            rounded[target] += diff > 0 ? 1 : -1;
        }
    }
    return rounded;
}
function buildAudienceAgeGroupDistribution(total) {
    const safeTotal = Math.max(0, Math.round(Number(total) || 0));
    const weights = buildAudienceAgeGroupWeights();
    const weightSum = weights.reduce((sum, value) => sum + value, 0) || 1;
    const shares = weights.map((value) => value / weightSum);
    const counts = allocateByShare(safeTotal, shares);
    return AUDIENCE_AGE_GROUPS.map((group, index) => ({
        ...group,
        share: shares[index] || 0,
        count: counts[index] || 0
    }));
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
function listPromoTimeframes() {
    return Array.isArray(PROMO_TIMEFRAMES) ? PROMO_TIMEFRAMES : [];
}
function getPromoTimeframeById(timeframeId) {
    if (!timeframeId)
        return null;
    return listPromoTimeframes().find((frame) => frame.id === timeframeId) || null;
}
function getPromoTimeframeForHour(hour) {
    const frames = listPromoTimeframes();
    if (!frames.length)
        return null;
    return frames.find((frame) => hour >= frame.startHour && hour < frame.endHour) || null;
}
function getPromoTimeframeForEpochMs(epochMs) {
    const current = getUtcDayHourMinute(epochMs);
    return getPromoTimeframeForHour(current.hour);
}
function buildPromoTimeframeWindow(dayStartEpochMs, timeframe, isCurrent) {
    if (!timeframe)
        return null;
    const startsAt = dayStartEpochMs + timeframe.startHour * HOUR_MS;
    const endsAt = dayStartEpochMs + timeframe.endHour * HOUR_MS;
    return { timeframe, startsAt, endsAt, isCurrent: Boolean(isCurrent) };
}
function resolvePromoTimeframeWindow(epochMs, { allowFuture = true } = {}) {
    const frames = listPromoTimeframes();
    if (!frames.length)
        return null;
    const dayStart = startOfDayEpochMs(epochMs);
    const hour = getUtcDayHourMinute(epochMs).hour;
    const current = getPromoTimeframeForHour(hour);
    if (current)
        return buildPromoTimeframeWindow(dayStart, current, true);
    if (!allowFuture)
        return null;
    const first = frames[0];
    if (hour < first.startHour) {
        return buildPromoTimeframeWindow(dayStart, first, false);
    }
    const nextDayStart = dayStart + DAY_MS;
    return buildPromoTimeframeWindow(nextDayStart, first, false);
}
function formatPromoTimeframeWindowLabel(window) {
    if (!window?.timeframe)
        return "Timeframe";
    const dayIndex = getUtcDayIndex(window.startsAt);
    const dayLabel = DAYS?.[dayIndex] || "Day";
    const startHour = window.timeframe.startHour % 24;
    const endHour = window.timeframe.endHour % 24;
    return `${dayLabel} ${window.timeframe.label} (${formatHour(startHour)}-${formatHour(endHour)})`;
}
function getBookingTimeframeId(booking) {
    if (booking?.timeframeId)
        return booking.timeframeId;
    if (Number.isFinite(booking?.startsAt)) {
        const frame = getPromoTimeframeForEpochMs(booking.startsAt);
        if (frame?.id)
            return frame.id;
    }
    return listPromoTimeframes()[0]?.id || null;
}
function bookingMatchesWindow(booking, window) {
    if (!booking || !window?.timeframe)
        return false;
    const timeframeId = getBookingTimeframeId(booking);
    if (timeframeId !== window.timeframe.id)
        return false;
    const windowDay = startOfDayEpochMs(window.startsAt);
    const bookingDay = startOfDayEpochMs(Number.isFinite(booking.startsAt) ? booking.startsAt : window.startsAt);
    return windowDay === bookingDay;
}
function getStudioTimeframeSlots(studio, timeframeId) {
    const frame = getPromoTimeframeById(timeframeId);
    if (!frame)
        return 0;
    const overrides = studio?.timeframeSlots;
    if (overrides && typeof overrides === "object") {
        const value = overrides[timeframeId];
        if (Number.isFinite(value))
            return Math.max(0, Math.floor(value));
    }
    return Number.isFinite(frame.slots) ? Math.max(0, Math.floor(frame.slots)) : 0;
}
function listBroadcastStudios() {
    return Array.isArray(BROADCAST_STUDIOS) ? BROADCAST_STUDIOS : [];
}
function listFilmingStudios() {
    return Array.isArray(FILMING_STUDIOS) ? FILMING_STUDIOS : [];
}
function getBroadcastStudioDefaultId() {
    return listBroadcastStudios()[0]?.id || null;
}
function getFilmingStudioDefaultId() {
    return listFilmingStudios()[0]?.id || null;
}
function getBroadcastStudioById(studioId) {
    if (!studioId)
        return null;
    return listBroadcastStudios().find((studio) => studio.id === studioId) || null;
}
function getFilmingStudioById(studioId) {
    if (!studioId)
        return null;
    return listFilmingStudios().find((studio) => studio.id === studioId) || null;
}
function broadcastSlotsForDay(dayIndex) {
    const studios = listBroadcastStudios();
    if (studios.length) {
        const frames = listPromoTimeframes();
        return studios.reduce((sum, studio) => {
            const total = frames.reduce((frameSum, frame) => frameSum + getStudioTimeframeSlots(studio, frame.id), 0);
            return sum + total;
        }, 0);
    }
    return BROADCAST_SLOT_SCHEDULE[dayIndex] || 0;
}
function broadcastSlotsForTimeframe(timeframeId) {
    const studios = listBroadcastStudios();
    if (!studios.length)
        return 0;
    return studios.reduce((sum, studio) => sum + getStudioTimeframeSlots(studio, timeframeId), 0);
}
function filmingSlotsForTimeframe(timeframeId) {
    const studios = listFilmingStudios();
    if (studios.length) {
        return studios.reduce((sum, studio) => sum + getStudioTimeframeSlots(studio, timeframeId), 0);
    }
    const frame = getPromoTimeframeById(timeframeId);
    const fallback = Number.isFinite(frame?.slots) ? frame.slots : 0;
    return Math.max(0, Math.floor(fallback));
}
function promoFacilityCapacityForTimeframe(facilityId, timeframeId) {
    if (!facilityId || !timeframeId)
        return 0;
    if (facilityId === "broadcast")
        return broadcastSlotsForTimeframe(timeframeId);
    if (facilityId === "filming")
        return filmingSlotsForTimeframe(timeframeId);
    return 0;
}
function getBroadcastStudioAvailability(studioId, epochMs = state.time.epochMs) {
    const studio = getBroadcastStudioById(studioId);
    const window = resolvePromoTimeframeWindow(epochMs, { allowFuture: true });
    const dayIndex = getUtcDayIndex(window?.startsAt ?? epochMs);
    if (!studio || !window?.timeframe) {
        const fallbackCapacity = window?.timeframe?.id
            ? broadcastSlotsForTimeframe(window.timeframe.id)
            : BROADCAST_SLOT_SCHEDULE[dayIndex] || 0;
        return {
            capacity: fallbackCapacity,
            inUse: 0,
            available: fallbackCapacity,
            dayIndex,
            timeframeId: window?.timeframe?.id || null,
            timeframeLabel: window?.timeframe?.label || null,
            windowLabel: window ? formatPromoTimeframeWindowLabel(window) : null,
            windowStart: window?.startsAt ?? null,
            windowEnd: window?.endsAt ?? null,
            isUpcoming: Boolean(window && window.startsAt > epochMs)
        };
    }
    const facilities = ensurePromoFacilities();
    const defaultStudioId = getBroadcastStudioDefaultId();
    const active = (facilities.broadcast?.bookings || []).filter((booking) => {
        if (!bookingMatchesWindow(booking, window))
            return false;
        const bookingStudioId = booking.studioId || defaultStudioId;
        return bookingStudioId === studio.id;
    });
    const capacity = getStudioTimeframeSlots(studio, window.timeframe.id);
    const inUse = active.length;
    return {
        capacity,
        inUse,
        available: Math.max(0, capacity - inUse),
        dayIndex,
        timeframeId: window.timeframe.id,
        timeframeLabel: window.timeframe.label,
        windowLabel: formatPromoTimeframeWindowLabel(window),
        windowStart: window.startsAt,
        windowEnd: window.endsAt,
        isUpcoming: window.startsAt > epochMs
    };
}
function getFilmingStudioAvailability(studioId, epochMs = state.time.epochMs) {
    const studio = getFilmingStudioById(studioId);
    const window = resolvePromoTimeframeWindow(epochMs, { allowFuture: true });
    const dayIndex = getUtcDayIndex(window?.startsAt ?? epochMs);
    if (!studio || !window?.timeframe) {
        const fallbackCapacity = window?.timeframe?.id
            ? filmingSlotsForTimeframe(window.timeframe.id)
            : FILMING_STUDIO_SLOTS;
        return {
            capacity: fallbackCapacity,
            inUse: 0,
            available: fallbackCapacity,
            dayIndex,
            timeframeId: window?.timeframe?.id || null,
            timeframeLabel: window?.timeframe?.label || null,
            windowLabel: window ? formatPromoTimeframeWindowLabel(window) : null,
            windowStart: window?.startsAt ?? null,
            windowEnd: window?.endsAt ?? null,
            isUpcoming: Boolean(window && window.startsAt > epochMs)
        };
    }
    const facilities = ensurePromoFacilities();
    const defaultStudioId = getFilmingStudioDefaultId();
    const active = (facilities.filming?.bookings || []).filter((booking) => {
        if (!bookingMatchesWindow(booking, window))
            return false;
        const bookingStudioId = booking.studioId || defaultStudioId;
        return bookingStudioId === studio.id;
    });
    const capacity = getStudioTimeframeSlots(studio, window.timeframe.id);
    const inUse = active.length;
    return {
        capacity,
        inUse,
        available: Math.max(0, capacity - inUse),
        dayIndex,
        timeframeId: window.timeframe.id,
        timeframeLabel: window.timeframe.label,
        windowLabel: formatPromoTimeframeWindowLabel(window),
        windowStart: window.startsAt,
        windowEnd: window.endsAt,
        isUpcoming: window.startsAt > epochMs
    };
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
function bestChartPeak(chartHistory) {
    if (!chartHistory || typeof chartHistory !== "object")
        return null;
    let best = null;
    Object.values(chartHistory).forEach((entry) => {
        const peak = Number(entry?.peak);
        if (!Number.isFinite(peak) || peak <= 0)
            return;
        best = best === null ? peak : Math.min(best, peak);
    });
    return best;
}
function getTrackPrestigePeak(track) {
    if (!track)
        return null;
    const marketEntry = track.marketId
        ? state.marketTracks.find((entry) => entry.id === track.marketId)
        : null;
    const fallbackEntry = state.marketTracks.find((entry) => entry.trackId === track.id);
    return bestChartPeak((marketEntry || fallbackEntry)?.chartHistory);
}
function getActPrestigePeak(actId) {
    if (!actId)
        return null;
    const act = getAct(actId);
    if (!act)
        return null;
    let best = null;
    state.marketTracks.forEach((entry) => {
        if (entry.actId !== actId && entry.actName !== act.name)
            return;
        const peak = bestChartPeak(entry.chartHistory);
        if (!Number.isFinite(peak) || peak <= 0)
            return;
        best = best === null ? peak : Math.min(best, peak);
    });
    return best;
}
function checkPrimeShowcaseEligibility(actId, trackId) {
    if (!actId) {
        return { ok: false, reason: "Select an Act to check Prime Time eligibility.", candidateTrack: null };
    }
    const act = getAct(actId);
    if (!act) {
        return { ok: false, reason: "Act not found for Prime Time eligibility.", candidateTrack: null };
    }
    const selectedTrack = trackId ? getTrack(trackId) : null;
    const candidateTrack = selectedTrack || findActChartingTrack(actId, PRIME_SHOWCASE_MIN_QUALITY);
    if (!candidateTrack) {
        return { ok: false, reason: "Prime Time requires a charting track for the Act.", candidateTrack: null };
    }
    if (!isTrackCharting(candidateTrack.id)) {
        return { ok: false, reason: "Prime Time requires a charting track.", candidateTrack };
    }
    const quality = Number(candidateTrack.quality || 0);
    if (quality < PRIME_SHOWCASE_MIN_QUALITY) {
        return {
            ok: false,
            reason: `Prime Time requires quality ${PRIME_SHOWCASE_MIN_QUALITY}+ content.`,
            candidateTrack
        };
    }
    const actPeak = getActPrestigePeak(actId);
    if (!actPeak || actPeak > PRIME_SHOWCASE_MIN_ACT_PEAK) {
        return {
            ok: false,
            reason: `Prime Time requires an Act with a Top ${PRIME_SHOWCASE_MIN_ACT_PEAK} chart peak.`,
            candidateTrack
        };
    }
    const trackPeak = getTrackPrestigePeak(candidateTrack);
    if (!trackPeak || trackPeak > PRIME_SHOWCASE_MIN_TRACK_PEAK) {
        return {
            ok: false,
            reason: `Prime Time requires a Track with a Top ${PRIME_SHOWCASE_MIN_TRACK_PEAK} chart peak.`,
            candidateTrack
        };
    }
    return { ok: true, reason: "", candidateTrack };
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
function scoreFilmingStudioFit(studio, { labelCountry }) {
    if (!studio)
        return -1;
    const scopeType = studio.scope?.type;
    const scopeId = studio.scope?.id;
    if (scopeType === "region" && labelCountry) {
        const region = REGION_DEFS.find((entry) => entry.id === scopeId);
        if (region && region.nation === labelCountry)
            return 3;
    }
    if (scopeType === "nation" && labelCountry && scopeId === labelCountry)
        return 2;
    if (scopeType === "global")
        return 1;
    return 0;
}
function selectFilmingStudioForPromo({ studioId, act, track, epochMs }) {
    const labelCountry = state.label?.country;
    if (studioId) {
        const availability = getFilmingStudioAvailability(studioId, epochMs);
        return availability.available > 0 ? { studioId, availability } : null;
    }
    const studios = listFilmingStudios();
    const scored = studios.map((studio) => {
        const availability = getFilmingStudioAvailability(studio.id, epochMs);
        if (availability.available <= 0)
            return null;
        return { studioId: studio.id, availability, score: scoreFilmingStudioFit(studio, { labelCountry }) };
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
    if (program.id === "eyeris-prime-showcase") {
        const eligibility = checkPrimeShowcaseEligibility(actId, selectedTrack?.id || candidateTrack?.id || null);
        if (!eligibility.ok) {
            return {
                ok: false,
                program,
                reason: eligibility.reason || `${program.label} eligibility not met.`,
                eligibleTrack: eligibility.candidateTrack || candidateTrack || null
            };
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
    const window = resolvePromoTimeframeWindow(epochMs, { allowFuture: true });
    const dayIndex = getUtcDayIndex(window?.startsAt ?? epochMs);
    const bookings = facilities[facilityId]?.bookings || [];
    const inUse = window
        ? bookings.filter((booking) => bookingMatchesWindow(booking, window)).length
        : 0;
    const capacity = window?.timeframe?.id
        ? promoFacilityCapacityForTimeframe(facilityId, window.timeframe.id)
        : 0;
    return {
        capacity,
        inUse,
        available: Math.max(0, capacity - inUse),
        dayIndex,
        timeframeId: window?.timeframe?.id || null,
        timeframeLabel: window?.timeframe?.label || null,
        windowLabel: window ? formatPromoTimeframeWindowLabel(window) : null,
        windowStart: window?.startsAt ?? null,
        windowEnd: window?.endsAt ?? null,
        isUpcoming: Boolean(window && window.startsAt > epochMs)
    };
}
function reservePromoFacilitySlot(facilityId, promoType, trackId, options = {}) {
    if (!facilityId)
        return { ok: true, booking: null };
    const now = Number.isFinite(options.epochMs) ? options.epochMs : state.time.epochMs;
    const actId = options.actId || (trackId ? getTrack(trackId)?.actId : null);
    const facilities = ensurePromoFacilities();
    const window = resolvePromoTimeframeWindow(now, { allowFuture: true });
    if (!window?.timeframe) {
        return { ok: false, reason: "Promo booking requires a valid timeframe window." };
    }
    const windowLabel = formatPromoTimeframeWindowLabel(window);
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
            return { ok: false, reason: `No Broadcast Studio slots available for ${windowLabel}.` };
        }
        const booking = {
            id: uid("PB"),
            facility: facilityId,
            promoType,
            trackId: trackId || null,
            actId: actId || null,
            studioId: studioPick.studioId,
            programId: programResult.program?.id || null,
            timeframeId: window.timeframe.id,
            timeframeLabel: window.timeframe.label,
            windowLabel,
            startsAt: window.startsAt,
            endsAt: window.endsAt
        };
        facilities[facilityId].bookings.push(booking);
        return { ok: true, booking, availability: studioPick.availability };
    }
    const availability = getPromoFacilityAvailability(facilityId, now);
    if (availability.available <= 0) {
        return {
            ok: false,
            reason: `No ${promoFacilityLabel(facilityId)} slots available for ${windowLabel}.`
        };
    }
    const studioPick = selectFilmingStudioForPromo({
        studioId: options.studioId,
        act: actId ? getAct(actId) : null,
        track: trackId ? getTrack(trackId) : null,
        epochMs: now
    });
    if (!studioPick || studioPick.availability.available <= 0) {
        return {
            ok: false,
            reason: `No Filming Studio slots available for ${windowLabel}.`
        };
    }
    const booking = {
        id: uid("PF"),
        facility: facilityId,
        promoType,
        trackId: trackId || null,
        actId: actId || null,
        studioId: studioPick.studioId,
        timeframeId: window.timeframe.id,
        timeframeLabel: window.timeframe.label,
        windowLabel,
        startsAt: window.startsAt,
        endsAt: window.endsAt
    };
    facilities[facilityId].bookings.push(booking);
    return { ok: true, booking, availability: studioPick.availability };
}
function scheduleManualPromoEvent({ promoType, actId = null, contentId = null, scheduledAt, budget = 0, weeks = 1, targetType = null, label = null, projectName = null, facilityId = null } = {}) {
    if (!Number.isFinite(scheduledAt) || scheduledAt <= state.time.epochMs) {
        return { ok: false, reason: "Scheduled promo time must be in the future." };
    }
    const entry = {
        id: uid("SE"),
        scheduledAt,
        actionType: promoType || DEFAULT_PROMO_TYPE,
        contentId: contentId || null,
        actId: actId || null,
        eraId: null,
        status: "Scheduled",
        facilityId: facilityId || getPromoFacilityForType(promoType) || null,
        source: "manualPromo",
        budget: Math.max(0, Math.round(Number(budget || 0))),
        weeks: Math.max(1, Math.round(Number(weeks || 1))),
        targetType,
        label,
        projectName,
        createdAt: state.time.epochMs,
        completedAt: null
    };
    ensureScheduledEventsStore().push(entry);
    return { ok: true, entry };
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
function autoCreateBudgetPct() {
    const raw = state.meta?.autoCreate?.budgetPct;
    if (typeof raw !== "number" || Number.isNaN(raw))
        return AUTO_CREATE_BUDGET_PCT;
    return clamp(raw, 0, 1);
}
function autoCreateMinCash() {
    const raw = state.meta?.autoCreate?.minCash;
    if (!Number.isFinite(raw))
        return AUTO_CREATE_MIN_CASH;
    return Math.max(0, Math.round(raw));
}
function autoCreateMaxTracks() {
    const raw = state.meta?.autoCreate?.maxTracks;
    const safe = Number.isFinite(raw) ? Math.round(raw) : AUTO_CREATE_MAX_TRACKS;
    return clamp(safe, 1, 5);
}
function autoCreateMode() {
    const mode = state.meta?.autoCreate?.mode;
    return mode === "collab" ? "collab" : "solo";
}
function computeAutoCreateBudget(cash, pct = AUTO_CREATE_BUDGET_PCT, minCash = AUTO_CREATE_MIN_CASH) {
    const safeCash = Number.isFinite(cash) ? Math.max(0, cash) : 0;
    const safePct = clamp(pct, 0, 1);
    const reserve = Math.max(0, Math.round(minCash || 0));
    if (!safeCash || safePct <= 0)
        return 0;
    const target = Math.floor(safeCash * safePct);
    const headroom = Math.max(0, safeCash - reserve);
    const budget = Math.min(target, headroom);
    return budget > 0 ? budget : 0;
}
function rivalCreateBudgetPct(rival) {
    const base = AI_CREATE_BUDGET_PCT;
    const ambition = clamp(rival?.ambition ?? RIVAL_AMBITION_FLOOR, 0, 1);
    const focusBoost = ["REQ-01", "REQ-02", "REQ-03", "REQ-05"].includes(rival?.achievementFocus) ? 0.04 : 0;
    const ambitionBoost = Math.max(0, ambition - RIVAL_AMBITION_FLOOR) * 0.08;
    return clamp(base + focusBoost + ambitionBoost, 0, 0.35);
}
function rivalCreateMinCash() {
    const base = Number.isFinite(AI_CREATE_MIN_CASH) ? AI_CREATE_MIN_CASH : 0;
    return Math.max(0, Math.round(base));
}
function autoPromoBudgetPct() {
    const slotPcts = state.meta?.autoRollout?.budgetPctSlots;
    if (Array.isArray(slotPcts) && slotPcts.length) {
        const total = slotPcts.reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
        if (total > 0)
            return clamp(total, 0, 1);
    }
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
    const step = Number.isFinite(ECONOMY_TUNING?.promoWeekBudgetStep) ? ECONOMY_TUNING.promoWeekBudgetStep : 1200;
    const base = Number.isFinite(ECONOMY_TUNING?.promoWeekBase) ? ECONOMY_TUNING.promoWeekBase : 1;
    const minWeeks = Number.isFinite(ECONOMY_TUNING?.promoWeeksMin) ? ECONOMY_TUNING.promoWeeksMin : 1;
    const maxWeeks = Number.isFinite(ECONOMY_TUNING?.promoWeeksMax) ? ECONOMY_TUNING.promoWeeksMax : 4;
    if (!Number.isFinite(step) || step <= 0)
        return clamp(base, minWeeks, maxWeeks);
    return clamp(Math.floor(budget / step) + base, minWeeks, maxWeeks);
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
    const subject = `Task: ${quest.text}`;
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
        title: `Task complete: ${quest.id}`,
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
function deriveCreatorStageName(creator) {
    if (!creator)
        return "";
    const givenName = String(creator.givenName || "").trim();
    if (givenName)
        return givenName;
    return String(creator.name || "").trim();
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
    const stageName = deriveCreatorStageName(nameParts);
    return {
        id: uid("CR"),
        ...nameParts,
        stageName: stageName || null,
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
    if (typeof creator.stageName !== "string" || !creator.stageName.trim()) {
        const stageName = deriveCreatorStageName(creator);
        creator.stageName = stageName || null;
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
function resolveActKindFromType(type) {
    return type === "solo" || type === "Solo Act" ? "solo" : "group";
}
function resolveActCountryFromMemberIds(memberIds) {
    const countries = listFromIds(memberIds).map((id) => getCreator(id)?.country).filter(Boolean);
    return dominantValue(countries, null);
}
function listActNameKeys(list = state.acts, actKind = null) {
    return list
        .filter((act) => !actKind || resolveActKindFromType(act?.type) === actKind)
        .map((act) => act?.nameKey)
        .filter(Boolean);
}
function makeActNameEntry({ nation, rng, existingKeys, actKind = "group", memberIds } = {}) {
    const resolvedActKind = resolveActKindFromType(actKind);
    const resolvedNation = nation
        || resolveActCountryFromMemberIds(memberIds)
        || state.label.country
        || "Annglora";
    const usedKeys = existingKeys || listActNameKeys(state.acts, resolvedActKind);
    const [pair] = generateUniqueActNamePairs({
        count: 1,
        nation: resolvedNation,
        actKind: resolvedActKind,
        rng,
        existingKeys: usedKeys
    });
    const resolved = pair || generateActNamePair({ nation: resolvedNation, actKind: resolvedActKind, rng });
    return {
        name: renderActNameByNation(resolved.nameKey, resolvedNation, resolvedActKind),
        nameKey: resolved.nameKey
    };
}
function makeActName({ nation, rng, actKind = "group", memberIds } = {}) {
    return makeActNameEntry({ nation, rng, actKind, memberIds }).name;
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
function makeAct({ name, nameKey = null, type, alignment, memberIds }) {
    return {
        id: uid("AC"),
        name,
        nameKey,
        type,
        alignment,
        memberIds,
        promoWeeks: 0,
        lastPromoAt: null,
        promoTypesUsed: {},
        promoTypesLastAt: {}
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
    const actKind = resolveActKindFromType(type);
    const actNameEntry = makeActNameEntry({ actKind, memberIds: members });
    state.acts.push(makeAct({
        name: actNameEntry.name,
        nameKey: actNameEntry.nameKey,
        type,
        alignment: state.label.alignment,
        memberIds: members
    }));
}
function catharsisPointsPerLevel() {
    return Math.max(1, Math.floor(STAMINA_MAX / CATHARSIS_LEVEL_COUNT));
}
function marketCatharsisCap() {
    const step = catharsisPointsPerLevel();
    return Math.min(STAMINA_MAX, step * MARKET_CATHARSIS_LEVEL_CAP - 1);
}
function pickWeightedEntry(list) {
    if (!Array.isArray(list) || !list.length)
        return null;
    const total = list.reduce((sum, entry) => sum + (entry.weight || 0), 0);
    if (total <= 0)
        return list[0];
    let roll = rand(1, total);
    for (const entry of list) {
        roll -= entry.weight || 0;
        if (roll <= 0)
            return entry;
    }
    return list[list.length - 1];
}
function randomMarketCatharsisStamina() {
    const step = catharsisPointsPerLevel();
    const pick = pickWeightedEntry(MARKET_CATHARSIS_LEVEL_WEIGHTS) || { level: 1 };
    const min = Math.max(1, (pick.level - 1) * step);
    const max = Math.min(pick.level * step - 1, marketCatharsisCap());
    return rand(min, Math.max(min, max));
}
function applyMarketCreatorCatharsis(creator) {
    if (!creator)
        return;
    const cap = marketCatharsisCap();
    const current = Number.isFinite(creator.stamina) ? creator.stamina : null;
    if (!Number.isFinite(current) || current > cap) {
        creator.stamina = randomMarketCatharsisStamina();
        return;
    }
    creator.stamina = clampStamina(current);
}
function buildMarketCreators(options = {}) {
    const list = [];
    const existing = () => [...state.creators.map((creator) => creator.name), ...list.map((creator) => creator.name)];
    MARKET_ROLES.forEach((role) => {
        for (let i = 0; i < MARKET_MIN_PER_ROLE; i += 1) {
            const creator = normalizeCreator(makeCreator(role, existing(), null, options));
            applyMarketCreatorCatharsis(creator);
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
        applyMarketCreatorCatharsis(next);
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
            applyMarketCreatorCatharsis(creator);
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
        achievementsUnlocked: [],
        achievements: 0,
        achievementFocus: null,
        promoRuns: 0,
        economy: { lastRevenue: 0, lastUpkeep: 0, lastWeek: 0, lastLeaseFees: 0 },
        ambition: RIVAL_AMBITION_FLOOR,
        eraCompletions: 0,
        aiPlan: {
            lastPlannedWeek: null,
            lastHuskId: null,
            lastPlannedAt: null,
            activeHuskId: null,
            huskSource: null,
            windowStartWeekIndex: null,
            windowEndWeekIndex: null,
            lastCompletedWindow: null,
            dominanceScopeType: null,
            dominanceScopeKey: null,
            dominanceWeekIndex: null,
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
            const dominance = dominantName && name === dominantName ? Math.round(base * SEED_DOMINANT_SCORE_BONUS_PCT) : 0;
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
    refreshLabelCompetition(scaledCumulative, { smoothing: 1 });
    state.rivals.forEach((rival) => {
        const ratio = maxPoints ? (variant.cumulative[rival.name] || 0) / maxPoints : 0;
        rival.momentum = clamp(0.35 + ratio * 0.45, 0.35, 0.95);
        rival.seedBonus = rival.id === preset?.dominantLabelId ? SEED_DOMINANT_MOMENTUM_BONUS : 0;
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
    return base;
}
function listMarketActNameKeys(list = state.marketTracks) {
    return list.map((track) => track?.actNameKey).filter(Boolean);
}
function makeRivalActNameEntry({ nation, rng, existingKeys, actKind = "group" } = {}) {
    const resolvedNation = nation || "Annglora";
    const resolvedActKind = resolveActKindFromType(actKind);
    const usedKeys = existingKeys || listMarketActNameKeys();
    const [pair] = generateUniqueActNamePairs({
        count: 1,
        nation: resolvedNation,
        actKind: resolvedActKind,
        rng,
        existingKeys: usedKeys
    });
    const resolved = pair || generateActNamePair({ nation: resolvedNation, actKind: resolvedActKind, rng });
    return {
        name: renderActNameByNation(resolved.nameKey, resolvedNation, resolvedActKind),
        nameKey: resolved.nameKey
    };
}
function makeRivalActName() {
    return makeRivalActNameEntry().name;
}
function makeRivalActNameSeeded(rng, nation, actKind = "group") {
    return makeRivalActNameEntry({ rng, nation, actKind }).name;
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
    score += getModifierQualityDelta(track);
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
function listRolloutStrategyTemplates() {
    return Array.isArray(ROLLOUT_STRATEGY_TEMPLATES) ? ROLLOUT_STRATEGY_TEMPLATES : [];
}
function getRolloutStrategyTemplateById(templateId) {
    if (!templateId)
        return null;
    return listRolloutStrategyTemplates().find((template) => template.id === templateId) || null;
}
function applyRolloutTemplateToStrategy(strategy, template) {
    if (!strategy || !template)
        return false;
    const steps = normalizeHuskCadence(template.cadence);
    if (!steps.length)
        return false;
    const maxOffset = steps.reduce((max, step) => Math.max(max, step.weekOffset || 0), 0);
    const neededWeeks = Math.max(1, maxOffset + 1);
    if (!Array.isArray(strategy.weeks) || strategy.weeks.length < neededWeeks) {
        strategy.weeks = buildRolloutWeeks(neededWeeks);
    }
    steps.forEach((step) => {
        const weekIndex = Number.isFinite(step.weekOffset) ? step.weekOffset : 0;
        const week = strategy.weeks[weekIndex];
        if (!week)
            return;
        if (step.kind === "release") {
            week.drops.push(makeRolloutDrop(null));
            return;
        }
        week.events.push(makeRolloutEvent(step.promoType || HUSK_PROMO_DEFAULT_TYPE, null));
    });
    if (template.id) {
        strategy.source = `Template:${template.id}`;
    }
    return true;
}
function createRolloutStrategyFromTemplate(era, templateId) {
    const template = getRolloutStrategyTemplateById(templateId);
    if (!template || !era)
        return null;
    const strategy = createRolloutStrategyForEra(era, { source: `Template:${template.id}` });
    if (!strategy)
        return null;
    applyRolloutTemplateToStrategy(strategy, template);
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
        rolloutHuskGenerated: false,
        projectName: null,
        projectType: null,
        projectStatus: "Open",
        projectDeluxeName: null,
        projectClosedAt: null,
        projectClosedReason: null,
        projectLastReleaseAt: null,
        projectLastPromoAt: null
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
            rolloutStrategyId: era.rolloutStrategyId || null,
            projectName: era.projectName || null,
            projectType: era.projectType || null,
            projectStatus: era.projectStatus || null,
            projectDeluxeName: era.projectDeluxeName || null,
            projectClosedAt: era.projectClosedAt || null,
            projectClosedReason: era.projectClosedReason || null,
            projectLastReleaseAt: era.projectLastReleaseAt || null,
            projectLastPromoAt: era.projectLastPromoAt || null
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
function ensureEraProjectState(era) {
    if (!era)
        return null;
    if (typeof era.projectName !== "string")
        era.projectName = era.projectName || null;
    if (typeof era.projectType !== "string")
        era.projectType = era.projectType || null;
    if (typeof era.projectStatus !== "string")
        era.projectStatus = "Open";
    if (typeof era.projectDeluxeName !== "string")
        era.projectDeluxeName = era.projectDeluxeName || null;
    if (typeof era.projectClosedAt !== "number")
        era.projectClosedAt = era.projectClosedAt || null;
    if (typeof era.projectClosedReason !== "string")
        era.projectClosedReason = era.projectClosedReason || null;
    if (typeof era.projectLastReleaseAt !== "number")
        era.projectLastReleaseAt = era.projectLastReleaseAt || null;
    if (typeof era.projectLastPromoAt !== "number")
        era.projectLastPromoAt = era.projectLastPromoAt || null;
    return era;
}
function recordEraProjectReleaseActivity(era, atMs) {
    if (!era)
        return;
    ensureEraProjectState(era);
    const stamp = Number.isFinite(atMs) ? atMs : state.time.epochMs;
    era.projectLastReleaseAt = stamp;
}
function recordEraProjectPromoActivity(track, act, atMs) {
    const stamp = Number.isFinite(atMs) ? atMs : state.time.epochMs;
    const era = track?.eraId
        ? getEraById(track.eraId)
        : act?.id
            ? (getFocusEraForAct(act.id) || getLatestActiveEraForAct(act.id))
            : null;
    if (!era || era.status !== "Active")
        return;
    ensureEraProjectState(era);
    era.projectLastPromoAt = stamp;
}
function getEraProjectActivityAt(era) {
    if (!era)
        return null;
    const stamps = [];
    if (Number.isFinite(era.projectLastReleaseAt))
        stamps.push(era.projectLastReleaseAt);
    if (Number.isFinite(era.projectLastPromoAt))
        stamps.push(era.projectLastPromoAt);
    if (Number.isFinite(era.startedAt))
        stamps.push(era.startedAt);
    if (!stamps.length)
        return null;
    return Math.max(...stamps);
}
function getEraProjectGapWeeks(era, now = state.time.epochMs) {
    const anchor = getEraProjectActivityAt(era);
    if (!Number.isFinite(anchor) || !Number.isFinite(now) || now <= anchor)
        return 0;
    return Math.floor((now - anchor) / WEEK_MS);
}
function isEraProjectStale(era, now = state.time.epochMs) {
    const gap = getEraProjectGapWeeks(era, now);
    return Number.isFinite(gap) && gap >= ERA_PROJECT_GAP_WEEKS;
}
function closeEraProject(era, reason, { log = true } = {}) {
    if (!era)
        return false;
    ensureEraProjectState(era);
    if (era.projectStatus === "Closed")
        return false;
    era.projectStatus = "Closed";
    era.projectClosedReason = reason || "Closed";
    era.projectClosedAt = state.time.epochMs;
    if (log)
        logEvent(`Era project closed: ${era.name}${reason ? ` (${reason})` : ""}.`);
    return true;
}
function isEraTouring(era) {
    if (!era)
        return false;
    if (era.projectStatus === "Touring")
        return true;
    return Number.isFinite(era.stageIndex)
        && ERA_TOURING_STAGE_INDEX >= 0
        && era.stageIndex >= ERA_TOURING_STAGE_INDEX;
}
function openEraTouring(era, { log = true } = {}) {
    if (!era)
        return false;
    ensureEraProjectState(era);
    if (era.projectStatus === "Closed")
        return false;
    if (era.projectStatus !== "Touring") {
        era.projectStatus = "Touring";
        era.projectClosedReason = "Touring";
        if (!Number.isFinite(era.projectClosedAt))
            era.projectClosedAt = state.time.epochMs;
        if (log)
            logEvent(`Touring started for "${era.name}". Deluxe window open.`);
    }
    return true;
}
function isDefaultSingleProjectName(track, projectName) {
    if (!track)
        return false;
    const raw = String(projectName || "").trim();
    if (!raw)
        return false;
    const fallback = `${track.title || ""} - Single`;
    return normalizeProjectName(raw) === normalizeProjectName(fallback);
}
function ensureEraProjectName(era, track) {
    ensureEraProjectState(era);
    if (era.projectName)
        return era.projectName;
    const candidate = String(track?.projectName || "").trim();
    if (candidate && !isDefaultSingleProjectName(track, candidate)) {
        era.projectName = candidate;
    }
    else {
        era.projectName = makeProjectTitle();
    }
    return era.projectName;
}
function ensureEraProjectType(era, track) {
    ensureEraProjectState(era);
    const existing = normalizeProjectType(era.projectType || "");
    if (existing && existing !== "Single") {
        era.projectType = existing;
        return era.projectType;
    }
    const candidate = normalizeProjectType(track?.projectType || "");
    if (candidate && candidate !== "Single") {
        era.projectType = candidate;
        return era.projectType;
    }
    era.projectType = "Album";
    return era.projectType;
}
function ensureEraProjectDeluxeName(era) {
    ensureEraProjectState(era);
    if (!era.projectDeluxeName) {
        const base = era.projectName || "Deluxe Project";
        era.projectDeluxeName = `${base}${ERA_PROJECT_DELUXE_SUFFIX}`;
    }
    return era.projectDeluxeName;
}
function countEraProjectReleasedTracks(eraId, projectName) {
    const normalized = normalizeProjectName(projectName);
    if (!eraId || !normalized)
        return 0;
    return state.tracks.filter((track) => {
        if (track.status !== "Released")
            return false;
        if (track.eraId !== eraId)
            return false;
        return normalizeProjectName(track.projectName) === normalized;
    }).length;
}
function listReleaseEraCandidates(actId, track) {
    const candidates = [];
    const add = (era) => {
        if (!era || era.status !== "Active")
            return;
        if (candidates.some((entry) => entry.id === era.id))
            return;
        candidates.push(era);
    };
    if (track?.eraId)
        add(getEraById(track.eraId));
    add(getFocusEraForAct(actId));
    add(getLatestActiveEraForAct(actId));
    return candidates;
}
function pickReleaseEraForTrack(track, now, { log = true } = {}) {
    if (!track?.actId)
        return null;
    const candidates = listReleaseEraCandidates(track.actId, track);
    for (const era of candidates) {
        ensureEraProjectState(era);
        if (era.projectStatus === "Closed")
            continue;
        if (era.projectStatus === "Open" && isEraProjectStale(era, now)) {
            const gap = getEraProjectGapWeeks(era, now);
            closeEraProject(era, `Inactive ${gap}w`, { log });
            continue;
        }
        if (isEraTouring(era)) {
            openEraTouring(era, { log });
        }
        return era;
    }
    return null;
}
function ensureEraForTrack(track, source, { releaseType = null, mode = "release" } = {}) {
    if (!track)
        return null;
    const actId = track.actId;
    if (!actId)
        return null;
    const now = state.time.epochMs;
    track.releaseType = normalizeReleaseType(releaseType || track.releaseType, track.projectType);
    const logProjectChanges = mode !== "preview";
    let era = pickReleaseEraForTrack(track, now, { log: logProjectChanges });
    if (!era) {
        era = startEraForAct({
            actId,
            contentType: "Track",
            contentId: track.id,
            source
        });
    }
    let attempts = 0;
    while (era && attempts < 2) {
        ensureEraProjectState(era);
        if (isEraTouring(era)) {
            openEraTouring(era, { log: logProjectChanges });
        }
        const projectName = ensureEraProjectName(era, track);
        const projectType = ensureEraProjectType(era, track);
        if (era.projectStatus === "Touring") {
            const deluxeName = ensureEraProjectDeluxeName(era);
            const deluxeReleased = countEraProjectReleasedTracks(era.id, deluxeName);
            if (deluxeReleased >= ERA_PROJECT_DELUXE_LIMIT) {
                closeEraProject(era, `Deluxe cap ${ERA_PROJECT_DELUXE_LIMIT}`, { log: logProjectChanges });
                era = startEraForAct({
                    actId,
                    contentType: "Track",
                    contentId: track.id,
                    source: `${source} (new era)`
                });
                attempts += 1;
                continue;
            }
            track.projectName = deluxeName;
            track.projectType = projectType;
            track.projectEdition = "Deluxe";
        }
        else {
            const releasedCount = countEraProjectReleasedTracks(era.id, projectName);
            if (releasedCount >= ERA_PROJECT_MAIN_LIMIT) {
                closeEraProject(era, `Album cap ${ERA_PROJECT_MAIN_LIMIT}`, { log: logProjectChanges });
                era = startEraForAct({
                    actId,
                    contentType: "Track",
                    contentId: track.id,
                    source: `${source} (new era)`
                });
                attempts += 1;
                continue;
            }
            track.projectName = projectName;
            track.projectType = projectType;
            track.projectEdition = null;
        }
        track.eraId = era.id;
        registerEraContent(era, "Track", track.id);
        return era;
    }
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
            const project = parsePromoProjectKey(contentId);
            const era = project?.eraId ? getEraById(project.eraId) : null;
            if (!project) {
                logEvent("Event content ID not found.", "warn");
                return false;
            }
            if (!era || era.status !== "Active") {
                logEvent("Event project requires an active era.", "warn");
                return false;
            }
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
    const activeEras = getActiveEras().filter((era) => era.status === "Active");
    if (!activeEras.length)
        return false;
    return memberActs.some((act) => {
        const era = activeEras.find((entry) => entry.actId === act.id);
        if (!era)
            return false;
        const weeksStale = getActPromoStalenessWeeks(act, era.startedAt);
        if (Number.isFinite(weeksStale) && weeksStale >= ACT_PROMO_WARNING_WEEKS)
            return false;
        return true;
    });
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
        const ambition = clamp(rival.ambition ?? RIVAL_AMBITION_FLOOR, 0, 1);
        const focusBoost = rival.achievementFocus === "REQ-09" ? 2 : 0;
        const rosterBoost = Math.round(ambition * RIVAL_AMBITION_ROSTER_BONUS) + focusBoost;
        const targetPerRole = RIVAL_MIN_PER_ROLE + rosterBoost;
        const counts = MARKET_ROLES.reduce((acc, role) => {
            acc[role] = rival.creators.filter((creator) => creator.role === role).length;
            return acc;
        }, {});
        const signed = [];
        const addRecruit = (role, trendTheme, trendMood) => {
            if (rival.creators.length >= CREATOR_ROSTER_CAP)
                return;
            const recruit = takeMarketRecruit(role, trendTheme, trendMood)
                || buildRivalCreator(role, rival, trendTheme, trendMood);
            rival.creators.push(recruit);
            signed.push({ role: recruit.role, name: recruit.name, trendTheme });
            bumpCreatorMarketHeat(recruit.role);
            counts[role] = (counts[role] || 0) + 1;
        };
        MARKET_ROLES.forEach((role) => {
            let missing = Math.max(0, targetPerRole - counts[role]);
            while (missing > 0 && rival.creators.length < CREATOR_ROSTER_CAP) {
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
        if (needsCoverage && rival.creators.length < CREATOR_ROSTER_CAP) {
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
    rival.promoRuns = Math.max(0, (rival.promoRuns || 0) + 1);
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
    if (modifier && modifier.id !== "None" && !hasModifierTool(modifier.id)) {
        logEvent(`Modifier unavailable: ${modifier.label}.`, "warn");
        return null;
    }
    const resolvedAlignment = alignment || state.label.alignment || "Neutral";
    const resolvedProjectName = String(projectName || "").trim() || `${title} - Single`;
    const resolvedProjectType = normalizeProjectType(projectType);
    const projectCheck = evaluateProjectTrackConstraints(resolvedProjectName, resolvedProjectType);
    if (!projectCheck.ok) {
        logEvent(projectCheck.reason, "warn");
        return null;
    }
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
        projectName: resolvedProjectName,
        projectType: resolvedProjectType,
        releaseType: normalizeReleaseType(null, resolvedProjectType),
        projectEdition: null,
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
            musicVideoUsed: false,
            typesUsed: {},
            typesLastAt: {}
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
    if (modifier && modifier.id !== "None") {
        consumeModifierTool(modifier.id);
    }
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
    const multipliers = ECONOMY_PRICE_MULTIPLIERS || {};
    const multiplier = Number.isFinite(multipliers[typeKey]) ? multipliers[typeKey] : 1;
    return roundMoney(base * multiplier);
}
function estimatePhysicalUnitCost(projectType = "Single") {
    const ratio = Number.isFinite(ECONOMY_BASELINES?.physicalUnitCostRatio) ? ECONOMY_BASELINES.physicalUnitCostRatio : 0.35;
    const unitPrice = estimatePhysicalUnitPrice(projectType);
    const minCost = Number.isFinite(ECONOMY_TUNING?.physicalUnitCostMin) ? ECONOMY_TUNING.physicalUnitCostMin : 0.5;
    return roundMoney(Math.max(minCost, unitPrice * ratio));
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
    const projectType = resolveTrackPricingType(track);
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
    const era = ensureEraForTrack(track, "Release", { releaseType: track.releaseType, mode: "release" });
    track.status = "Released";
    track.releasedAt = state.time.epochMs;
    recordEraProjectReleaseActivity(era || (track.eraId ? getEraById(track.eraId) : null), track.releasedAt);
    track.trendAtRelease = state.trends.includes(track.genre);
    track.distribution = dist;
    const preReleaseWeeks = Math.max(0, track.promo?.preReleaseWeeks || 0);
    const promoTypesUsed = track.promo?.typesUsed && typeof track.promo.typesUsed === "object"
        ? { ...track.promo.typesUsed }
        : {};
    if (track.promo?.musicVideoUsed && !Number.isFinite(promoTypesUsed.musicVideo)) {
        promoTypesUsed.musicVideo = 1;
    }
    const promoTypesLastAt = track.promo?.typesLastAt && typeof track.promo.typesLastAt === "object"
        ? { ...track.promo.typesLastAt }
        : {};
    const act = getAct(track.actId);
    const resolvedEra = era || (track.eraId ? getEraById(track.eraId) : null);
    const projectName = track.projectName || `${track.title} - Single`;
    const projectType = normalizeProjectType(track.projectType || "Single");
    const creatorCountries = resolveCreatorCountriesFromTrack(track);
    const actCountry = resolveActCountryFromMembers(track.actId);
    const originCountry = actCountry || dominantValue(creatorCountries, null) || state.label.country || "Annglora";
    const marketEntry = {
        id: uid("MK"),
        trackId: track.id,
        title: track.title,
        label: state.label.name,
        actId: track.actId,
        actName: act ? act.name : "Unknown Act",
        actNameKey: act?.nameKey || null,
        eraId: track.eraId || null,
        eraName: resolvedEra ? resolvedEra.name : null,
        projectName,
        projectType,
        isPlayer: true,
        theme: track.theme,
        mood: track.mood,
        alignment: track.alignment,
        country: originCountry,
        actCountry,
        creatorCountries,
        quality: track.quality,
        genre: track.genre,
        distribution: track.distribution,
        trendAtRelease: track.trendAtRelease,
        releasedAt: track.releasedAt,
        weeksOnChart: 0,
        promoWeeks: preReleaseWeeks,
        promoTypesUsed,
        promoTypesLastAt
    };
    applyCriticsReview({ track, marketEntry, log: true });
    track.marketId = marketEntry.id;
    state.marketTracks.push(marketEntry);
    if (track.promo)
        track.promo.preReleaseWeeks = 0;
    markCreatorRelease(getTrackCreatorIds(track), track.releasedAt);
    logEvent(`Released "${track.title}" to market${note ? ` (${note})` : ""}.${feeNote}`);
    postTrackRelease(track);
    markRolloutDropsReleasedByTrack(track.id, track.releasedAt);
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("rls:state-changed"));
    }
    return true;
}
function scheduleRelease(track, hoursFromNow, distribution, note) {
    if (!track || !track.actId || !getAct(track.actId)) {
        logEvent("Cannot schedule release: assign an Act first.", "warn");
        return false;
    }
    const isReady = track.status === "Ready";
    if (!isReady) {
        logEvent("Only Ready (mastered) tracks can be scheduled for release.", "warn");
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
    const requestedAt = state.time.epochMs + scheduleHours * HOUR_MS;
    const releaseAt = alignReleaseAtToProcessing(requestedAt);
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
    ensureEraForTrack(track, "Release scheduled", { releaseType: track.releaseType, mode: "schedule" });
    const feeNote = feeResult.fee ? ` Distribution fee: ${formatMoney(feeResult.fee)}.` : "";
    logEvent(`Scheduled "${track.title}" for release on ${formatDate(releaseAt)}.${feeNote}`);
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("rls:state-changed"));
    }
    return true;
}
function scheduleReleaseAt(track, releaseAt, { distribution, note, rolloutMeta, suppressLog = false } = {}) {
    if (!track || !track.actId || !getAct(track.actId)) {
        return { ok: false, reason: "Track missing Act assignment." };
    }
    const isReady = track.status === "Ready";
    if (!isReady) {
        return { ok: false, reason: "Track must be mastered before scheduling." };
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
    ensureEraForTrack(track, "Release scheduled", { releaseType: track.releaseType, mode: "schedule" });
    if (!suppressLog) {
        const feeNote = feeResult.fee ? ` Distribution fee: ${formatMoney(feeResult.fee)}.` : "";
        logEvent(`Scheduled "${track.title}" for release on ${formatDate(releaseAt)}.${feeNote}`);
    }
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("rls:state-changed"));
    }
    return { ok: true, entry };
}
function processReleaseQueue() {
    const now = state.time.epochMs;
    const previousCount = state.releaseQueue.length;
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
    if (remaining.length !== previousCount && typeof window !== "undefined") {
        window.dispatchEvent(new Event("rls:state-changed"));
    }
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
    const window = resolvePromoTimeframeWindow(epochMs, { allowFuture: false });
    if (!window?.timeframe)
        return 0;
    const dayStart = startOfDayEpochMs(window.startsAt);
    return ensureScheduledEventsStore().filter((entry) => {
        if (entry.facilityId !== facilityId)
            return false;
        if (entry.status !== "Scheduled")
            return false;
        if (!Number.isFinite(entry.scheduledAt))
            return false;
        const entryWindow = resolvePromoTimeframeWindow(entry.scheduledAt, { allowFuture: false });
        if (!entryWindow?.timeframe)
            return false;
        if (entryWindow.timeframe.id !== window.timeframe.id)
            return false;
        return startOfDayEpochMs(entry.scheduledAt) === dayStart;
    }).length;
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
    if (!drop.contentId) {
        recordRolloutBlock(drop, "Drop requires a Track ID.", mode, "Rollout drop");
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
    if (!isReady) {
        recordRolloutBlock(drop, "Track must be mastered before scheduling.", mode, "Rollout drop");
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
    let project = null;
    if (eventItem.contentId) {
        track = getTrack(eventItem.contentId);
        if (!track) {
            project = parsePromoProjectKey(eventItem.contentId);
            if (!project) {
                recordRolloutBlock(eventItem, "Event content not found.", mode, "Rollout event");
                return { ok: false, blocked: true };
            }
            if (project.eraId && era?.id && project.eraId !== era.id) {
                recordRolloutBlock(eventItem, "Project does not belong to this era.", mode, "Rollout event");
                return { ok: false, blocked: true };
            }
            const projectEra = project.eraId ? getEraById(project.eraId) : era;
            if (!projectEra || projectEra.status !== "Active") {
                recordRolloutBlock(eventItem, "Event requires a project from an active era.", mode, "Rollout event");
                return { ok: false, blocked: true };
            }
        }
        else if (track.status !== "Released" || !track.marketId) {
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
        const window = resolvePromoTimeframeWindow(eventAt, { allowFuture: false });
        const capacity = promoFacilityCapacityForEpochMs(facilityId, eventAt);
        const used = countScheduledFacilityUsage(facilityId, eventAt);
        if (used >= capacity) {
            const windowLabel = window ? formatPromoTimeframeWindowLabel(window) : "valid timeframes";
            recordRolloutBlock(eventItem, `No ${promoFacilityLabel(facilityId)} slots available for ${windowLabel}.`, mode, "Rollout event");
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
function resolveScheduledPromoTarget(entry) {
    const act = entry?.actId ? getAct(entry.actId) : null;
    const targetType = entry?.targetType
        || (entry?.contentId && parsePromoProjectKey(entry.contentId) ? "project" : entry?.contentId ? "track" : "act");
    const project = targetType === "project" && entry?.contentId ? parsePromoProjectKey(entry.contentId) : null;
    const track = targetType === "track" && entry?.contentId ? getTrack(entry.contentId) : null;
    return { act, track, project, targetType };
}
function applyScheduledPromoEntry(entry, now) {
    if (!entry)
        return { ok: false, reason: "Scheduled promo missing." };
    const promoType = entry.actionType || DEFAULT_PROMO_TYPE;
    const details = getPromoTypeDetails(promoType);
    const { act, track, project, targetType } = resolveScheduledPromoTarget(entry);
    if (!act)
        return { ok: false, reason: "Scheduled promo requires an Act." };
    if (details.requiresTrack && !track && !project) {
        return { ok: false, reason: `${details.label || "Promo"} requires a track.` };
    }
    if (track && track.actId && track.actId !== act.id) {
        return { ok: false, reason: "Scheduled promo track does not match the Act." };
    }
    if (project && project.actId && project.actId !== act.id) {
        return { ok: false, reason: "Scheduled promo project does not match the Act." };
    }
    if (promoType === "musicVideo" && track && track.status !== "Released") {
        return { ok: false, reason: "Music video promo requires a released track." };
    }
    const projectTargets = project ? listPromoEligibleTracksForProject(project) : [];
    if (project && details.requiresTrack && !projectTargets.length) {
        return { ok: false, reason: "Scheduled promo project has no eligible tracks." };
    }
    const market = track && track.status === "Released"
        ? state.marketTracks.find((entry) => entry.id === track.marketId)
        : null;
    if (track && track.status === "Released" && !market) {
        return { ok: false, reason: "Scheduled promo track is not active on the market." };
    }
    const budget = Math.max(0, Math.round(Number(entry.budget || 0)));
    const weeks = Math.max(1, Math.round(Number(entry.weeks || promoWeeksFromBudget(budget))));
    const boostWeeks = weeks;
    if (track) {
        const promo = track.promo || { preReleaseWeeks: 0, musicVideoUsed: false };
        if (track.status === "Released" && market) {
            market.promoWeeks = Math.max(market.promoWeeks || 0, boostWeeks);
        }
        else {
            promo.preReleaseWeeks = Math.max(promo.preReleaseWeeks || 0, boostWeeks);
        }
        if (promoType === "musicVideo")
            promo.musicVideoUsed = true;
        track.promo = promo;
    }
    else if (projectTargets.length) {
        projectTargets.forEach((entryTrack) => {
            if (entryTrack.status === "Released") {
                const marketEntry = entryTrack.marketId
                    ? state.marketTracks.find((marketEntry) => marketEntry.id === entryTrack.marketId)
                    : state.marketTracks.find((marketEntry) => marketEntry.trackId === entryTrack.id);
                if (marketEntry)
                    marketEntry.promoWeeks = Math.max(marketEntry.promoWeeks || 0, boostWeeks);
                return;
            }
            const promo = entryTrack.promo || { preReleaseWeeks: 0, musicVideoUsed: false };
            promo.preReleaseWeeks = Math.max(promo.preReleaseWeeks || 0, boostWeeks);
            if (promoType === "musicVideo")
                promo.musicVideoUsed = true;
            entryTrack.promo = promo;
        });
    }
    act.promoWeeks = Math.max(act.promoWeeks || 0, boostWeeks);
    state.meta.promoRuns = (state.meta.promoRuns || 0) + 1;
    const promoIds = new Set([...(act.memberIds || [])]);
    if (track) {
        (track.creators?.songwriterIds || []).forEach((id) => promoIds.add(id));
        (track.creators?.performerIds || []).forEach((id) => promoIds.add(id));
        (track.creators?.producerIds || []).forEach((id) => promoIds.add(id));
    }
    else if (projectTargets.length) {
        projectTargets.forEach((entryTrack) => {
            (entryTrack.creators?.songwriterIds || []).forEach((id) => promoIds.add(id));
            (entryTrack.creators?.performerIds || []).forEach((id) => promoIds.add(id));
            (entryTrack.creators?.producerIds || []).forEach((id) => promoIds.add(id));
        });
    }
    const promoIdList = Array.from(promoIds).filter(Boolean);
    if (promoIdList.length)
        markCreatorPromo(promoIdList);
    if (track) {
        recordPromoUsage({ track, market, act, promoType, atMs: now });
    }
    else {
        recordPromoUsage({ act, promoType, atMs: now });
    }
    const promoProjectName = project?.projectName || track?.projectName || entry.projectName || null;
    const postTitle = track?.title || promoProjectName || act.name;
    const releaseDate = (() => {
        if (track?.status === "Released")
            return formatDate(track.releasedAt || now);
        const scheduled = track
            ? state.releaseQueue.find((release) => release.trackId === track.id)
            : null;
        if (scheduled?.releaseAt)
            return formatDate(scheduled.releaseAt);
        if (projectTargets.length) {
            const latest = projectTargets
                .map((entryTrack) => (entryTrack.status === "Released" ? entryTrack.releasedAt : state.releaseQueue.find((release) => release.trackId === entryTrack.id)?.releaseAt))
                .filter(Number.isFinite)
                .sort((a, b) => b - a)[0];
            if (latest)
                return formatDate(latest);
        }
        return formatDate(now);
    })();
    recordPromoContent({
        promoType,
        actId: act.id,
        actName: act.name,
        trackId: track?.id || null,
        marketId: market?.id || null,
        trackTitle: track ? track.title : promoProjectName || act.name,
        projectName: promoProjectName,
        label: entry.label || state.label?.name || "",
        budget,
        weeks,
        isPlayer: true,
        targetType: targetType || (track ? "track" : project ? "project" : "act")
    });
    if (typeof postFromTemplate === "function") {
        postFromTemplate(promoType, {
            trackTitle: postTitle,
            actName: act.name,
            releaseDate,
            channel: track?.distribution || "Broadcast",
            handle: handleFromName(state.label?.name || "Label", "Label"),
            cost: budget,
            requirement: details.requirement
        });
        uiHooks.renderEventLog?.();
    }
    return { ok: true };
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
        if (entry.source === "manualPromo") {
            const result = applyScheduledPromoEntry(entry, now);
            if (!result.ok) {
                entry.status = "Cancelled";
                entry.completedAt = now;
                entry.lastAttemptReason = result.reason || "Promo execution failed.";
                logEvent(`Scheduled promo cancelled: ${entry.lastAttemptReason}`, "warn");
                return;
            }
            entry.status = "Completed";
            entry.completedAt = now;
            const label = rolloutEventLabel(entry.actionType);
            logEvent(`Scheduled promo executed: ${label}.`);
            return;
        }
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
const HOMELAND_ACT_BONUS = 4;
const HOMELAND_CREATOR_BONUS = 1;
const HOMELAND_CREATOR_BONUS_CAP = 6;
const INTERNATIONAL_RELATION_CAP = 4;
const COUNTRY_RELATION_BIAS = {
    Annglora: { Bytenza: -2, Crowlya: 2 },
    Bytenza: { Annglora: -2, Crowlya: 0 },
    Crowlya: { Annglora: 2, Bytenza: 0 }
};
function resolveScopeNation(scopeId) {
    if (!scopeId || scopeId === "global")
        return null;
    if (NATIONS.includes(scopeId))
        return scopeId;
    const region = REGION_DEFS.find((entry) => entry.id === scopeId);
    return region ? region.nation : null;
}
function resolveActCountryFromMembers(actId) {
    const act = actId ? getAct(actId) : null;
    if (!act)
        return null;
    const memberCountries = act.memberIds
        .map((id) => getCreator(id)?.country)
        .filter(Boolean);
    return dominantValue(memberCountries, null);
}
function resolveCreatorCountriesFromTrack(track) {
    if (!track)
        return [];
    if (Array.isArray(track.creatorCountries) && track.creatorCountries.length) {
        return track.creatorCountries.slice();
    }
    const source = track.creators ? track : (track.trackId ? getTrack(track.trackId) : null);
    if (!source?.creators)
        return [];
    const ids = Array.from(new Set(listFromIds(source.creators.songwriterIds)
        .concat(listFromIds(source.creators.performerIds))
        .concat(listFromIds(source.creators.producerIds))));
    return ids.map((id) => getCreator(id)?.country).filter(Boolean);
}
function resolveTrackOriginMeta(track) {
    if (!track)
        return { actCountry: null, creatorCountries: [], originCountries: [] };
    const creatorCountries = resolveCreatorCountriesFromTrack(track);
    const actCountry = track.actCountry || resolveActCountryFromMembers(track.actId) || null;
    const fallback = track.country || null;
    const originCountries = Array.from(new Set([actCountry, ...creatorCountries, fallback].filter(Boolean)));
    return { actCountry: actCountry || fallback, creatorCountries, originCountries };
}
function homelandBonusForScope(originMeta, scopeNation) {
    if (!originMeta || !scopeNation)
        return 0;
    let bonus = 0;
    if (originMeta.actCountry === scopeNation)
        bonus += HOMELAND_ACT_BONUS;
    const creatorMatches = originMeta.creatorCountries.filter((country) => country === scopeNation).length;
    if (creatorMatches) {
        bonus += Math.min(HOMELAND_CREATOR_BONUS_CAP, creatorMatches * HOMELAND_CREATOR_BONUS);
    }
    return bonus;
}
function internationalBiasForScope(originMeta, scopeNation) {
    if (!originMeta || !scopeNation)
        return 0;
    const foreignOrigins = originMeta.originCountries.filter((country) => country && country !== scopeNation);
    if (!foreignOrigins.length)
        return 0;
    const total = foreignOrigins.reduce((sum, country) => {
        const bias = COUNTRY_RELATION_BIAS?.[scopeNation]?.[country];
        return sum + (Number.isFinite(bias) ? bias : 0);
    }, 0);
    if (!Number.isFinite(total) || !total)
        return 0;
    return clamp(total, -INTERNATIONAL_RELATION_CAP, INTERNATIONAL_RELATION_CAP);
}
function labelShareToMultiplier(share) {
    if (!Number.isFinite(share))
        return 1;
    const target = LABEL_DOMINANCE_TARGET_SHARE;
    if (share > target) {
        const overRatio = (share - target) / Math.max(0.001, 1 - target);
        const penalty = clamp(overRatio * LABEL_DOMINANCE_MAX_PENALTY, 0, LABEL_DOMINANCE_MAX_PENALTY);
        return clamp(1 - penalty, 1 - LABEL_DOMINANCE_MAX_PENALTY, 1);
    }
    if (target <= 0)
        return 1;
    const underRatio = (target - share) / target;
    const boost = clamp(underRatio * LABEL_DOMINANCE_MAX_BOOST, 0, LABEL_DOMINANCE_MAX_BOOST);
    return clamp(1 + boost, 1, 1 + LABEL_DOMINANCE_MAX_BOOST);
}
function computeLabelShares(scores, { smoothing = LABEL_DOMINANCE_SMOOTHING } = {}) {
    const safeScores = scores && typeof scores === "object" ? scores : {};
    const labels = collectKnownLabelNames();
    const total = Array.from(labels).reduce((sum, label) => sum + (safeScores[label] || 0), 0);
    const priorShares = state.meta?.labelShare || {};
    const shares = {};
    labels.forEach((label) => {
        const rawShare = total ? (safeScores[label] || 0) / total : 0;
        const prior = Number.isFinite(priorShares[label]) ? priorShares[label] : rawShare;
        shares[label] = clamp(prior + (rawShare - prior) * smoothing, 0, 1);
    });
    return { shares, total };
}
function buildLabelCompetitionMap(shares) {
    const competition = {};
    Object.entries(shares || {}).forEach(([label, share]) => {
        competition[label] = labelShareToMultiplier(share);
    });
    return competition;
}
function refreshLabelCompetition(scores, { smoothing = LABEL_DOMINANCE_SMOOTHING } = {}) {
    const { shares, total } = computeLabelShares(scores, { smoothing });
    const competition = total > 0 ? buildLabelCompetitionMap(shares) : {};
    if (!state.meta)
        state.meta = {};
    state.meta.labelShare = shares;
    state.meta.labelCompetition = competition;
    state.meta.labelShareWeek = weekIndex() + 1;
    return competition;
}
function ensureLabelCompetitionMap() {
    if (!state.meta)
        state.meta = {};
    if (state.meta.labelCompetition && Object.keys(state.meta.labelCompetition).length) {
        return state.meta.labelCompetition;
    }
    const seedScores = state.meta.cumulativeLabelPoints || {};
    const { shares, total } = computeLabelShares(seedScores, { smoothing: 1 });
    const competition = total > 0 ? buildLabelCompetitionMap(shares) : {};
    state.meta.labelShare = shares;
    state.meta.labelCompetition = competition;
    return competition;
}
function getLabelCompetitionMultiplier(label) {
    if (!label)
        return 1;
    const competition = ensureLabelCompetitionMap();
    const multiplier = competition?.[label];
    return Number.isFinite(multiplier) ? multiplier : 1;
}
function resolvePromoTypesUsed(target) {
    if (!target || typeof target !== "object")
        return null;
    if (target.promoTypesUsed && typeof target.promoTypesUsed === "object")
        return target.promoTypesUsed;
    if (target.promo?.typesUsed && typeof target.promo.typesUsed === "object")
        return target.promo.typesUsed;
    return null;
}
function hasPromoTypeUsage(target, typeId) {
    if (!target || !typeId)
        return false;
    const used = resolvePromoTypesUsed(target);
    const count = used && Number.isFinite(used[typeId]) ? used[typeId] : 0;
    if (count > 0)
        return true;
    if (typeId === "musicVideo")
        return !!target?.promo?.musicVideoUsed;
    return false;
}
function recordPromoTypeUsage(target, typeId, atMs = state.time.epochMs) {
    if (!target || !typeId)
        return;
    const stamp = Number.isFinite(atMs) ? atMs : state.time.epochMs;
    if (target.promo && typeof target.promo === "object") {
        if (!target.promo.typesUsed || typeof target.promo.typesUsed !== "object")
            target.promo.typesUsed = {};
        if (!target.promo.typesLastAt || typeof target.promo.typesLastAt !== "object")
            target.promo.typesLastAt = {};
        target.promo.typesUsed[typeId] = (Number(target.promo.typesUsed[typeId]) || 0) + 1;
        target.promo.typesLastAt[typeId] = stamp;
        if (typeId === "musicVideo")
            target.promo.musicVideoUsed = true;
        return;
    }
    if (!target.promoTypesUsed || typeof target.promoTypesUsed !== "object")
        target.promoTypesUsed = {};
    if (!target.promoTypesLastAt || typeof target.promoTypesLastAt !== "object")
        target.promoTypesLastAt = {};
    target.promoTypesUsed[typeId] = (Number(target.promoTypesUsed[typeId]) || 0) + 1;
    target.promoTypesLastAt[typeId] = stamp;
}
function recordPromoUsage({ track = null, market = null, act = null, promoType, atMs = state.time.epochMs } = {}) {
    if (!promoType)
        return;
    const stamp = Number.isFinite(atMs) ? atMs : state.time.epochMs;
    if (track)
        recordPromoTypeUsage(track, promoType, stamp);
    if (market)
        recordPromoTypeUsage(market, promoType, stamp);
    if (act) {
        recordPromoTypeUsage(act, promoType, stamp);
        act.lastPromoAt = stamp;
    }
    if (track || act)
        recordEraProjectPromoActivity(track, act, stamp);
}
function listPromoEligibleTracksForProject(project) {
    if (!project?.projectName)
        return [];
    const targetName = normalizeProjectName(project.projectName);
    const targetType = normalizeProjectType(project.projectType || "Single");
    const scheduledIds = new Set(state.releaseQueue.map((entry) => entry.trackId).filter(Boolean));
    return state.tracks.filter((track) => {
        if (project.eraId && track.eraId !== project.eraId)
            return false;
        if (project.actId && track.actId !== project.actId)
            return false;
        const trackProject = track.projectName || `${track.title} - Single`;
        if (normalizeProjectName(trackProject) !== targetName)
            return false;
        if (normalizeProjectType(track.projectType || "Single") !== targetType)
            return false;
        if (track.status === "Released")
            return true;
        if (track.status === "Scheduled")
            return true;
        return scheduledIds.has(track.id);
    });
}
function getTrackMissingPromoTypes(track, { includeScheduled = false } = {}) {
    if (!track)
        return [];
    const isReleased = track.status === "Released" || Number.isFinite(track.releasedAt);
    const isScheduled = track.status === "Scheduled";
    const isEligible = isReleased || (includeScheduled && isScheduled);
    if (!isEligible)
        return [];
    return PROMO_TRACK_REQUIRED_TYPES.filter((typeId) => {
        if (typeId === "musicVideo" && !isReleased)
            return false;
        return !hasPromoTypeUsage(track, typeId);
    });
}
function getTrackPromoGapPenalty(track) {
    const missing = getTrackMissingPromoTypes(track);
    if (!missing.length)
        return 0;
    return Math.min(PROMO_GAP_PENALTY_MAX, missing.length * PROMO_GAP_PENALTY_PER_TYPE);
}
function resolveActPromoAt(act, fallbackAt) {
    if (!act)
        return null;
    if (Number.isFinite(act.lastPromoAt))
        return act.lastPromoAt;
    if (Number.isFinite(fallbackAt))
        return fallbackAt;
    return null;
}
function getActPromoStalenessWeeks(act, fallbackAt, now = state.time.epochMs) {
    const anchor = resolveActPromoAt(act, fallbackAt);
    if (!Number.isFinite(anchor))
        return null;
    const delta = Math.max(0, Number(now) - anchor);
    return Math.floor(delta / WEEK_MS);
}
function getActPromoStalePenalty(act, fallbackAt, now = state.time.epochMs) {
    const weeksStale = getActPromoStalenessWeeks(act, fallbackAt, now);
    if (!Number.isFinite(weeksStale) || weeksStale < ACT_PROMO_WARNING_WEEKS)
        return 0;
    const steps = Math.floor((weeksStale - ACT_PROMO_WARNING_WEEKS) / ACT_PROMO_STALE_PENALTY_STEP_WEEKS) + 1;
    return Math.min(ACT_PROMO_STALE_PENALTY_MAX, steps * ACT_PROMO_STALE_PENALTY_STEP);
}
function getActPromoStalePenaltyForTrack(track, now = state.time.epochMs) {
    if (!track?.actId)
        return 0;
    const act = getAct(track.actId);
    if (!act)
        return 0;
    const era = track.eraId ? getEraById(track.eraId) : null;
    const fallbackAt = Number.isFinite(era?.startedAt) ? era.startedAt : null;
    return getActPromoStalePenalty(act, fallbackAt, now);
}
function normalizeCriticScopeKey(scopeKey) {
    if (!scopeKey)
        return "global";
    const raw = String(scopeKey);
    if (raw.startsWith("promo:"))
        return raw.slice(6);
    if (raw.startsWith("tour:"))
        return raw.slice(5);
    return raw;
}
function criticScopeWeight(scopeKey) {
    const normalized = normalizeCriticScopeKey(scopeKey);
    if (normalized.startsWith("region:"))
        return 1;
    if (normalized.startsWith("nation:"))
        return 2;
    return 3;
}
function buildGlobalCriticProfile() {
    const alignmentTotals = { Safe: 0, Neutral: 0, Risky: 0 };
    const themeCounts = {};
    const moodCounts = {};
    NATIONS.forEach((nation) => {
        const profile = getAudienceProfile(nation);
        ALIGNMENTS.forEach((alignment) => {
            alignmentTotals[alignment] += Number(profile?.alignmentWeights?.[alignment] || 0);
        });
        (profile?.themes || []).forEach((theme) => {
            if (!theme)
                return;
            themeCounts[theme] = (themeCounts[theme] || 0) + 1;
        });
        (profile?.moods || []).forEach((mood) => {
            if (!mood)
                return;
            moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        });
    });
    const themes = Object.entries(themeCounts)
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0])
        .slice(0, AUDIENCE_PREF_LIMIT);
    const moods = Object.entries(moodCounts)
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0])
        .slice(0, AUDIENCE_PREF_LIMIT);
    return {
        alignmentWeights: normalizeAlignmentWeights(alignmentTotals),
        themes,
        moods
    };
}
function resolveCriticProfile(scopeKey) {
    const normalized = normalizeCriticScopeKey(scopeKey);
    if (normalized === "global")
        return buildGlobalCriticProfile();
    const audience = getAudienceProfile(normalized);
    const baseProfile = baseAudienceProfile(normalized);
    const alignmentWeights = audience?.alignmentWeights
        ? normalizeAlignmentWeights(audience.alignmentWeights)
        : defaultAlignmentWeights(baseProfile?.alignment);
    const themes = Array.isArray(audience?.themes) && audience.themes.length ? audience.themes : baseProfile.themes;
    const moods = Array.isArray(audience?.moods) && audience.moods.length ? audience.moods : baseProfile.moods;
    return { alignmentWeights, themes, moods };
}
function criticAlignmentScore(alignmentWeights, alignment) {
    const weights = normalizeAlignmentWeights(alignmentWeights || defaultAlignmentWeights("Neutral"));
    const target = ALIGNMENTS.includes(alignment) ? alignment : "Neutral";
    const baseline = 1 / ALIGNMENTS.length;
    const delta = weights[target] - baseline;
    return clamp(Math.round(50 + delta * 150), 0, 100);
}
function criticThemeMoodScore(profile, track) {
    const themes = Array.isArray(profile?.themes) ? profile.themes : [];
    const moods = Array.isArray(profile?.moods) ? profile.moods : [];
    const themeScore = themes.includes(track?.theme) ? 100 : 55;
    const moodScore = moods.includes(track?.mood)
        ? 100
        : track?.mood === "Boring"
            ? 30
            : 55;
    return Math.round((themeScore + moodScore) / 2);
}
function criticStringencyForScope(scopeKey) {
    const eraCount = Array.isArray(state.era?.history) ? state.era.history.length : 0;
    const eraBoost = clamp(eraCount * CRITIC_STRINGENCY_ERA_STEP, 0, CRITIC_STRINGENCY_MAX - CRITIC_STRINGENCY_BASE);
    const normalized = normalizeCriticScopeKey(scopeKey);
    const scopeBoost = normalized === "global" ? 0.04 : normalized.startsWith("nation:") ? 0.02 : 0;
    return clamp(CRITIC_STRINGENCY_BASE + eraBoost + scopeBoost, CRITIC_STRINGENCY_BASE, CRITIC_STRINGENCY_MAX);
}
function criticSaturationPenalty(track, { excludeMarketId = null, excludeTrackId = null } = {}) {
    if (!track?.genre)
        return 0;
    const referenceWeek = weekIndexForEpochMs(track.releasedAt || state.time.epochMs);
    const windowStart = referenceWeek - CRITIC_SATURATION_WINDOW_WEEKS;
    const matches = state.marketTracks.filter((entry) => {
        if (!entry || entry.genre !== track.genre)
            return false;
        if (excludeMarketId && entry.id === excludeMarketId)
            return false;
        if (excludeTrackId && entry.trackId === excludeTrackId)
            return false;
        const entryWeek = weekIndexForEpochMs(entry.releasedAt || state.time.epochMs);
        return entryWeek >= windowStart && entryWeek <= referenceWeek;
    });
    const count = Math.max(0, matches.length - 1);
    return Math.min(CRITIC_SATURATION_MAX, count * CRITIC_SATURATION_STEP);
}
function scoreCriticForScope(track, scopeKey, options = {}) {
    if (!track)
        return 0;
    const normalized = normalizeCriticScopeKey(scopeKey);
    const profile = resolveCriticProfile(normalized);
    const qualityScore = resolveTrackQualityScore(track) ?? 0;
    const alignmentScore = criticAlignmentScore(profile.alignmentWeights, track?.alignment);
    const themeMoodScore = criticThemeMoodScore(profile, track);
    const weights = CRITIC_SCORE_WEIGHTS;
    let score = qualityScore * weights.quality
        + alignmentScore * weights.alignment
        + themeMoodScore * weights.themeMood;
    score = score / criticStringencyForScope(normalized);
    score -= criticSaturationPenalty(track, options);
    const seed = makeStableSeed([trackKey(track), normalized, "critics"]);
    const rng = makeSeededRng(seed);
    score += seededRand(-CRITIC_SCORE_JITTER, CRITIC_SCORE_JITTER, rng);
    return clamp(Math.round(score), 0, 100);
}
function buildCriticScoresByScope(track, options = {}) {
    const scores = {};
    const scopes = ["global"]
        .concat(NATIONS.map((nation) => `nation:${nation}`))
        .concat(REGION_DEFS.map((region) => `region:${region.id}`));
    scopes.forEach((scopeKey) => {
        scores[scopeKey] = scoreCriticForScope(track, scopeKey, options);
    });
    return scores;
}
function aggregateCriticScores(scores) {
    if (!scores || typeof scores !== "object")
        return 0;
    let total = 0;
    let weightTotal = 0;
    Object.entries(scores).forEach(([scopeKey, score]) => {
        if (!Number.isFinite(score))
            return;
        const weight = criticScopeWeight(scopeKey);
        total += score * weight;
        weightTotal += weight;
    });
    if (!weightTotal)
        return 0;
    return Math.round(total / weightTotal);
}
function applyCriticsReview({ track = null, marketEntry = null, log = false } = {}) {
    const source = marketEntry || track;
    if (!source)
        return null;
    const existingBase = Number.isFinite(source.qualityBase) ? source.qualityBase : null;
    const baseQuality = existingBase ?? resolveTrackQualityScore(source);
    if (!Number.isFinite(baseQuality) || baseQuality <= 0)
        return null;
    if (Number.isFinite(source.criticScore) && source.criticScores && Number.isFinite(source.qualityFinal)) {
        return { criticScore: source.criticScore, qualityFinal: source.qualityFinal };
    }
    const criticScores = buildCriticScoresByScope(source, {
        excludeMarketId: marketEntry?.id || null,
        excludeTrackId: source.trackId || source.id || null
    });
    const criticScore = aggregateCriticScores(criticScores);
    const deltaRaw = Math.round((criticScore - baseQuality) * CRITIC_QUALITY_BLEND);
    const delta = clamp(deltaRaw, -CRITIC_QUALITY_DELTA_MAX, CRITIC_QUALITY_DELTA_MAX);
    const qualityFinal = clampQuality(baseQuality + delta);
    const criticGrade = scoreGrade(criticScore);
    const apply = (target) => {
        if (!target)
            return;
        if (!Number.isFinite(target.qualityBase))
            target.qualityBase = baseQuality;
        target.qualityFinal = qualityFinal;
        target.quality = qualityFinal;
        target.criticScores = criticScores;
        target.criticScore = criticScore;
        target.criticGrade = criticGrade;
        target.criticDelta = delta;
    };
    apply(track);
    apply(marketEntry);
    if (log) {
        const deltaLabel = delta === 0 ? "no change" : `${delta > 0 ? "+" : ""}${delta} quality`;
        logEvent(`Critics review: ${criticGrade} (${criticScore}) with ${deltaLabel}.`);
    }
    return { criticScore, criticGrade, qualityFinal, criticScores, criticDelta: delta };
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
    const promoGapPenalty = getTrackPromoGapPenalty(track);
    const actStalePenalty = getActPromoStalePenaltyForTrack(track);
    if (promoGapPenalty || actStalePenalty)
        score -= promoGapPenalty + actStalePenalty;
    const scopeNation = resolveScopeNation(regionName);
    if (scopeNation) {
        const originMeta = resolveTrackOriginMeta(track);
        score += homelandBonusForScope(originMeta, scopeNation);
        score += internationalBiasForScope(originMeta, scopeNation);
    }
    score += rand(-4, 4);
    const competitionMultiplier = getLabelCompetitionMultiplier(track.label);
    if (competitionMultiplier !== 1)
        score = Math.round(score * competitionMultiplier);
    const decay = Math.max(0.4, 1 - track.weeksOnChart * 0.05);
    return Math.round(score * decay);
}
function scoreTrackProjected(track, regionName, seedKey) {
    const audience = getAudienceProfile(regionName);
    let score = Number(track.quality || 0);
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
    const promoGapPenalty = getTrackPromoGapPenalty(track);
    const actStalePenalty = getActPromoStalePenaltyForTrack(track);
    if (promoGapPenalty || actStalePenalty)
        score -= promoGapPenalty + actStalePenalty;
    const scopeNation = resolveScopeNation(regionName);
    if (scopeNation) {
        const originMeta = resolveTrackOriginMeta(track);
        score += homelandBonusForScope(originMeta, scopeNation);
        score += internationalBiasForScope(originMeta, scopeNation);
    }
    const jitterSeed = Number.isFinite(seedKey)
        ? seedKey
        : makeStableSeed([regionName, trackKey(track), "projection"]);
    const jitterRng = makeSeededRng(jitterSeed);
    score += seededRand(-4, 4, jitterRng);
    const competitionMultiplier = getLabelCompetitionMultiplier(track.label);
    if (competitionMultiplier !== 1)
        score = Math.round(score * competitionMultiplier);
    const decay = Math.max(0.4, 1 - (track.weeksOnChart || 0) * 0.05);
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
const PROMO_METRIC_META = {
    eyeriSocialPost: { key: "likes", label: "Likes" },
    eyeriSocialAd: { key: "likes", label: "Likes" },
    musicVideo: { key: "views", label: "Views" },
    livePerformance: { key: "concurrent", label: "Concurrent" },
    primeShowcase: { key: "concurrent", label: "Concurrent" },
    interview: { key: "comments", label: "Comments" }
};
function resolvePromoMetricMeta(promoType) {
    return PROMO_METRIC_META[promoType] || { key: "likes", label: "Likes" };
}
function buildPromoEngagementMetrics(metrics) {
    const safe = metrics || {};
    const likes = roundToAudienceChunk(Number(safe.social || 0) * 1.1);
    const views = roundToAudienceChunk(Number(safe.streaming || 0) * 1.2 + Number(safe.airplay || 0) * 0.6);
    const comments = roundToAudienceChunk(Number(safe.social || 0) * 0.35 + Number(safe.airplay || 0) * 0.1);
    const concurrent = roundToAudienceChunk(Number(safe.airplay || 0) * 0.9
        + Number(safe.streaming || 0) * 0.45
        + Number(safe.social || 0) * 0.2);
    return { likes, views, comments, concurrent };
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
        entries: entries.map((entry) => {
            const base = entry.track || entry || {};
            const primary = entry.primaryTrack || {};
            return {
                rank: entry.rank,
                lastRank: entry.lastRank,
                peak: entry.peak,
                woc: entry.woc,
                score: entry.score,
                metrics: entry.metrics,
                contentType: entry.contentType || null,
                promoType: entry.promoType || null,
                promoLabel: entry.promoLabel || null,
                trackCount: entry.trackCount || null,
                primaryTrackId: primary.id || primary.trackId || entry.primaryTrackId || null,
                primaryTrackTitle: primary.title || entry.primaryTrackTitle || null,
                primaryTrackTheme: primary.theme || entry.primaryTrackTheme || null,
                primaryTrackMood: primary.mood || entry.primaryTrackMood || null,
                primaryTrackGenre: primary.genre || entry.primaryTrackGenre || null,
                trackId: entry.track?.id || entry.track?.trackId || entry.trackId || base.trackId || null,
                marketId: entry.track?.marketId || entry.marketId || base.marketId || null,
                title: entry.track?.title || entry.trackTitle || base.title || "",
                projectName: entry.track?.projectName || entry.projectName || base.projectName || "",
                label: entry.track?.label || entry.label || base.label || "",
                actId: entry.track?.actId || entry.actId || base.actId || null,
                actName: entry.track?.actName || entry.actName || base.actName || "",
                actNameKey: entry.track?.actNameKey || entry.actNameKey || base.actNameKey || null,
                country: entry.track?.country || entry.country || base.country || "",
                theme: entry.track?.theme || entry.theme || base.theme || "",
                mood: entry.track?.mood || entry.mood || base.mood || "",
                alignment: entry.track?.alignment || entry.alignment || base.alignment || "",
                genre: entry.track?.genre || entry.genre || base.genre || "",
                quality: Number.isFinite(entry.track?.qualityFinal)
                    ? entry.track.qualityFinal
                    : Number.isFinite(entry.track?.quality)
                        ? entry.track.quality
                        : Number.isFinite(entry.qualityFinal)
                            ? entry.qualityFinal
                            : Number.isFinite(entry.quality)
                                ? entry.quality
                                : Number.isFinite(base.qualityFinal)
                                    ? base.qualityFinal
                                    : Number.isFinite(base.quality)
                                        ? base.quality
                                        : null,
                qualityBase: Number.isFinite(entry.track?.qualityBase)
                    ? entry.track.qualityBase
                    : Number.isFinite(entry.qualityBase)
                        ? entry.qualityBase
                        : Number.isFinite(base.qualityBase)
                            ? base.qualityBase
                            : null,
                qualityFinal: Number.isFinite(entry.track?.qualityFinal)
                    ? entry.track.qualityFinal
                    : Number.isFinite(entry.qualityFinal)
                        ? entry.qualityFinal
                        : Number.isFinite(base.qualityFinal)
                            ? base.qualityFinal
                            : null,
                criticScore: Number.isFinite(entry.track?.criticScore)
                    ? entry.track.criticScore
                    : Number.isFinite(entry.criticScore)
                        ? entry.criticScore
                        : Number.isFinite(base.criticScore)
                            ? base.criticScore
                            : null,
                criticGrade: entry.track?.criticGrade || entry.criticGrade || base.criticGrade || null,
                criticDelta: Number.isFinite(entry.track?.criticDelta)
                    ? entry.track.criticDelta
                    : Number.isFinite(entry.criticDelta)
                        ? entry.criticDelta
                        : Number.isFinite(base.criticDelta)
                            ? base.criticDelta
                            : null,
                criticScores: entry.track?.criticScores
                    || entry.criticScores
                    || base.criticScores
                    || null,
                projectType: entry.track?.projectType || entry.projectType || base.projectType || "",
                distribution: entry.track?.distribution || entry.distribution || base.distribution || "",
                isPlayer: typeof entry.isPlayer === "boolean" ? entry.isPlayer : !!base.isPlayer
            };
        })
    };
}
function buildEmptyChartStore() {
    return { global: [], nations: {}, regions: {} };
}
function ensureChartStoreStructure(store) {
    const target = store && typeof store === "object" ? store : buildEmptyChartStore();
    if (!Array.isArray(target.global))
        target.global = [];
    if (!target.nations || typeof target.nations !== "object")
        target.nations = {};
    NATIONS.forEach((nation) => {
        if (!Array.isArray(target.nations[nation]))
            target.nations[nation] = [];
    });
    if (!target.regions || typeof target.regions !== "object")
        target.regions = {};
    REGION_DEFS.forEach((region) => {
        if (!Array.isArray(target.regions[region.id]))
            target.regions[region.id] = [];
    });
    return target;
}
function ensurePromoContentStore() {
    if (!Array.isArray(state.promoContent))
        state.promoContent = [];
    return state.promoContent;
}
const TOUR_TIER_DEFAULTS = {
    Club: {
        capacityMin: 500,
        capacityMax: 2000,
        baseTicketPrice: 25,
        drawMultiplier: 0.8,
        sponsorBase: 0,
        merchAttachRate: 0.08,
        merchSpendPerFan: 18,
        venueFee: 2000,
        staffingBase: 1500,
        travelBase: 800,
        maxDatesMin: 8,
        maxDatesMax: 12
    },
    Theater: {
        capacityMin: 2000,
        capacityMax: 5000,
        baseTicketPrice: 35,
        drawMultiplier: 0.95,
        sponsorBase: 2000,
        merchAttachRate: 0.1,
        merchSpendPerFan: 22,
        venueFee: 6000,
        staffingBase: 3000,
        travelBase: 1500,
        maxDatesMin: 10,
        maxDatesMax: 16
    },
    Amphitheater: {
        capacityMin: 6000,
        capacityMax: 10000,
        baseTicketPrice: 50,
        drawMultiplier: 1,
        sponsorBase: 8000,
        merchAttachRate: 0.12,
        merchSpendPerFan: 26,
        venueFee: 14000,
        staffingBase: 5500,
        travelBase: 3500,
        maxDatesMin: 12,
        maxDatesMax: 20
    },
    Arena: {
        capacityMin: 11000,
        capacityMax: 40000,
        baseTicketPrice: 70,
        drawMultiplier: 1.1,
        sponsorBase: 25000,
        merchAttachRate: 0.15,
        merchSpendPerFan: 30,
        venueFee: 30000,
        staffingBase: 10000,
        travelBase: 8000,
        maxDatesMin: 14,
        maxDatesMax: 24
    },
    Stadium: {
        capacityMin: 41000,
        capacityMax: 200000,
        baseTicketPrice: 95,
        drawMultiplier: 1.2,
        sponsorBase: 100000,
        merchAttachRate: 0.18,
        merchSpendPerFan: 35,
        venueFee: 75000,
        staffingBase: 22000,
        travelBase: 18000,
        maxDatesMin: 10,
        maxDatesMax: 18
    }
};
const TOUR_TIER_REQUIREMENTS = {
    Club: { minActPeak: null, minFans: 0, minSellThrough: TOUR_BOOKING_SELLTHROUGH_MIN },
    Theater: { minActPeak: 200, minFans: 8000, minSellThrough: Math.max(0.32, TOUR_BOOKING_SELLTHROUGH_MIN) },
    Amphitheater: { minActPeak: 120, minFans: 20000, minSellThrough: Math.max(0.38, TOUR_BOOKING_SELLTHROUGH_MIN) },
    Arena: { minActPeak: 60, minFans: 75000, minSellThrough: Math.max(0.42, TOUR_BOOKING_SELLTHROUGH_MIN) },
    Stadium: { minActPeak: 25, minFans: 160000, minSellThrough: Math.max(0.5, TOUR_BOOKING_SELLTHROUGH_MIN) }
};
function ensureTouringStore() {
    if (!state.touring || typeof state.touring !== "object") {
        state.touring = { drafts: [], bookings: [], lastDraftId: 0 };
    }
    if (!Array.isArray(state.touring.drafts))
        state.touring.drafts = [];
    if (!Array.isArray(state.touring.bookings))
        state.touring.bookings = [];
    if (typeof state.touring.lastDraftId !== "number")
        state.touring.lastDraftId = 0;
    return state.touring;
}
function touringBalanceEnabled() {
    if (!state.meta)
        state.meta = makeDefaultState().meta;
    if (typeof state.meta.touringBalanceEnabled !== "boolean") {
        state.meta.touringBalanceEnabled = false;
    }
    return state.meta.touringBalanceEnabled;
}
function setTouringBalanceEnabled(enabled) {
    if (!state.meta)
        state.meta = makeDefaultState().meta;
    state.meta.touringBalanceEnabled = Boolean(enabled);
    return state.meta.touringBalanceEnabled;
}
function listTourDrafts() {
    return ensureTouringStore().drafts;
}
function getTourDraftById(draftId) {
    if (!draftId)
        return null;
    return listTourDrafts().find((draft) => draft.id === draftId) || null;
}
function getSelectedTourDraft() {
    const draftId = state.ui?.tourDraftId || null;
    return draftId ? getTourDraftById(draftId) : null;
}
function selectTourDraft(draftId) {
    if (!state.ui)
        state.ui = {};
    state.ui.tourDraftId = draftId || null;
    return getSelectedTourDraft();
}
function normalizeTourGoal(goal) {
    if (goal === "visibility" || goal === "revenue")
        return TOUR_GOAL_DEFAULT;
    if (TOUR_GOALS.includes(goal))
        return goal;
    return TOUR_GOAL_DEFAULT;
}
function createTourDraft({ name, actId, eraId, goal, anchorTrackIds, anchorProjectId, window, notes } = {}) {
    const touring = ensureTouringStore();
    touring.lastDraftId = Math.max(0, Math.round(Number(touring.lastDraftId) || 0) + 1);
    const act = actId ? getAct(actId) : null;
    const defaultName = act ? `${act.name} Tour` : `Tour Draft ${touring.lastDraftId}`;
    const draft = {
        id: uid("TD"),
        name: typeof name === "string" && name.trim() ? name.trim() : defaultName,
        actId: actId || null,
        eraId: eraId || null,
        goal: normalizeTourGoal(goal),
        anchorTrackIds: Array.isArray(anchorTrackIds) ? anchorTrackIds.filter(Boolean) : [],
        anchorProjectId: typeof anchorProjectId === "string" ? anchorProjectId : null,
        window: {
            startWeek: Number.isFinite(window?.startWeek) ? Math.round(window.startWeek) : null,
            endWeek: Number.isFinite(window?.endWeek) ? Math.round(window.endWeek) : null
        },
        legs: [],
        notes: typeof notes === "string" ? notes : "",
        status: "Draft",
        createdAt: state.time?.epochMs || Date.now(),
        updatedAt: state.time?.epochMs || Date.now()
    };
    touring.drafts.push(draft);
    selectTourDraft(draft.id);
    return draft;
}
function updateTourDraft(draftId, updates = {}) {
    const draft = getTourDraftById(draftId);
    if (!draft)
        return null;
    if (typeof updates.name === "string")
        draft.name = updates.name.trim() || draft.name;
    if (typeof updates.actId === "string" || updates.actId === null)
        draft.actId = updates.actId;
    if (typeof updates.eraId === "string" || updates.eraId === null)
        draft.eraId = updates.eraId;
    if (typeof updates.goal === "string")
        draft.goal = normalizeTourGoal(updates.goal);
    if (Array.isArray(updates.anchorTrackIds))
        draft.anchorTrackIds = updates.anchorTrackIds.filter(Boolean);
    if (typeof updates.anchorProjectId === "string" || updates.anchorProjectId === null)
        draft.anchorProjectId = updates.anchorProjectId;
    if (updates.window && typeof updates.window === "object") {
        if (updates.window.startWeek === null)
            draft.window.startWeek = null;
        if (Number.isFinite(updates.window.startWeek))
            draft.window.startWeek = Math.round(updates.window.startWeek);
        if (updates.window.endWeek === null)
            draft.window.endWeek = null;
        if (Number.isFinite(updates.window.endWeek))
            draft.window.endWeek = Math.round(updates.window.endWeek);
    }
    if (typeof updates.notes === "string")
        draft.notes = updates.notes;
    draft.updatedAt = state.time?.epochMs || Date.now();
    return draft;
}
function deleteTourDraft(draftId) {
    const touring = ensureTouringStore();
    const before = touring.drafts.length;
    touring.drafts = touring.drafts.filter((draft) => draft.id !== draftId);
    touring.bookings = touring.bookings.filter((booking) => booking.tourId !== draftId);
    if (state.ui?.tourDraftId === draftId)
        state.ui.tourDraftId = null;
    return touring.drafts.length !== before;
}
function listTourBookings({ tourId = null, actId = null } = {}) {
    const bookings = ensureTouringStore().bookings || [];
    return bookings.filter((booking) => {
        if (!booking)
            return false;
        if (tourId && booking.tourId !== tourId)
            return false;
        if (actId && booking.actId !== actId)
            return false;
        return true;
    });
}
function listMarketTracksForAct(actId, eraId = null) {
    return (state.marketTracks || []).filter((track) => {
        if (!track || !track.isPlayer)
            return false;
        if (actId && track.actId !== actId)
            return false;
        if (eraId && track.eraId !== eraId)
            return false;
        return true;
    });
}
function resolveTourAnchor(draft, actId, eraId) {
    const marketTracks = listMarketTracksForAct(actId, eraId);
    if (!marketTracks.length) {
        return { primary: null, anchors: [], projectName: null };
    }
    let anchors = [];
    if (Array.isArray(draft?.anchorTrackIds) && draft.anchorTrackIds.length) {
        anchors = draft.anchorTrackIds
            .map((id) => marketTracks.find((track) => track.trackId === id || track.id === id))
            .filter(Boolean);
    }
    let projectName = null;
    if (!anchors.length && draft?.anchorProjectId) {
        const parsed = parsePromoProjectKey(draft.anchorProjectId);
        projectName = parsed?.projectName || draft.anchorProjectId;
        const normalized = normalizeProjectName(projectName);
        anchors = marketTracks.filter((track) => normalizeProjectName(track.projectName || "") === normalized);
    }
    if (!anchors.length) {
        const sorted = marketTracks.slice().sort((a, b) => (b.releasedAt || 0) - (a.releasedAt || 0));
        anchors = sorted.length ? [sorted[0]] : [];
    }
    const primary = anchors[0] || null;
    if (!projectName && primary?.projectName)
        projectName = primary.projectName;
    return { primary, anchors, projectName };
}
function estimateTourPopularityMultiplier(actId, eraId) {
    const tracks = listMarketTracksForAct(actId, eraId);
    if (!tracks.length)
        return 0.7;
    const scores = tracks.map((track) => {
        const quality = Number.isFinite(track.quality) ? track.quality : 60;
        const freshness = Math.max(0, 12 - (track.weeksOnChart || 0));
        const promoWeeks = Math.max(0, track.promoWeeks || 0);
        return quality + freshness * 4 + promoWeeks * 4;
    });
    const avg = scores.reduce((sum, value) => sum + value, 0) / scores.length;
    return clamp(avg / 80, 0.6, 1.5);
}
function tourRegionPriceIndex(venue) {
    const regionId = venue?.regionId || "";
    if (regionId.includes("Capital"))
        return 1.1;
    if (regionId.includes("Elsewhere"))
        return 0.95;
    return 1;
}
function tourQualityPremium(quality) {
    const base = 0.9 + (Number(quality || 60) - 60) / 150;
    return clamp(base, 0.9, 1.2);
}
function tourEraMomentum(era) {
    if (!era)
        return 0.9;
    const stageIndex = Number.isFinite(era.stageIndex) ? era.stageIndex : 0;
    const weeks = Number.isFinite(era.weeksElapsed) ? era.weeksElapsed : 0;
    return clamp(0.85 + stageIndex * 0.07 + weeks * 0.01, 0.8, 1.25);
}
function tourLeadWeeks(scheduledAt) {
    if (!Number.isFinite(scheduledAt))
        return 0;
    const delta = scheduledAt - state.time.epochMs;
    return Math.max(0, delta / WEEK_MS);
}
function resolveChartEntryMeta(entry) {
    const track = entry?.track || entry?.anchor || null;
    return {
        actId: track?.actId || entry?.actId || null,
        actNameKey: track?.actNameKey || entry?.actNameKey || null,
        trackId: track?.trackId || track?.id || entry?.trackId || null
    };
}
function bestChartRankForAct(entries, { actId, actNameKey, trackId } = {}) {
    let best = null;
    (entries || []).forEach((entry) => {
        if (!entry)
            return;
        const meta = resolveChartEntryMeta(entry);
        const isActMatch = (actId && meta.actId === actId) || (actNameKey && meta.actNameKey === actNameKey);
        const isTrackMatch = trackId && meta.trackId === trackId;
        if (!isActMatch && !isTrackMatch)
            return;
        const rank = Number(entry.rank || entry.peak || 0);
        if (!Number.isFinite(rank) || rank <= 0)
            return;
        best = best === null ? rank : Math.min(best, rank);
    });
    return best;
}
function chartRankBoost(rank, size, minBoost, maxBoost) {
    if (!Number.isFinite(rank) || rank <= 0)
        return 0;
    const span = Math.max(1, Number(size || 1) - 1);
    const pct = clamp(1 - (rank - 1) / span, 0, 1);
    return minBoost + pct * (maxBoost - minBoost);
}
function resolveTourChartingBoost({ actId, actNameKey, trackId, regionId, nation }) {
    const regionEntries = regionId ? state.charts?.regions?.[regionId] || [] : [];
    const nationEntries = nation ? state.charts?.nations?.[nation] || [] : [];
    const globalEntries = state.charts?.global || [];
    const regionRank = bestChartRankForAct(regionEntries, { actId, actNameKey, trackId });
    const nationRank = bestChartRankForAct(nationEntries, { actId, actNameKey, trackId });
    const globalRank = bestChartRankForAct(globalEntries, { actId, actNameKey, trackId });
    const regionBoost = chartRankBoost(regionRank, CHART_SIZES?.region || 40, 0.05, 0.2);
    const nationBoost = chartRankBoost(nationRank, CHART_SIZES?.nation || 100, 0.04, 0.14);
    const globalBoost = chartRankBoost(globalRank, CHART_SIZES?.global || 200, 0.03, 0.12);
    const boost = Math.max(regionBoost, nationBoost * 0.85, globalBoost * 0.7);
    return clamp(1 + boost, 0.9, 1.25);
}
function resolveAgeGroupsForScope(scopeId, snapshot) {
    if (!snapshot)
        return [];
    if (!scopeId || scopeId === "global")
        return snapshot.ageGroups || [];
    if (NATIONS.includes(scopeId)) {
        return snapshot.nations?.find((entry) => entry.nation === scopeId)?.ageGroups || snapshot.ageGroups || [];
    }
    const region = REGION_DEFS.find((entry) => entry.id === scopeId);
    if (region && NATIONS.includes(region.nation)) {
        return snapshot.nations?.find((entry) => entry.nation === region.nation)?.ageGroups || snapshot.ageGroups || [];
    }
    return snapshot.ageGroups || [];
}
function pickConcertInterestSegments(scopeId, groupCount, epochMs) {
    const total = Math.max(1, Math.floor(groupCount || 0));
    const picks = new Set();
    const week = Number.isFinite(epochMs) ? weekIndexForEpochMs(epochMs) + 1 : weekIndex() + 1;
    const seed = makeStableSeed([scopeId || "global", week, "concert-segments"]);
    const rng = makeSeededRng(seed);
    const target = Math.min(TOUR_CONCERT_SEGMENT_COUNT, total);
    while (picks.size < target) {
        picks.add(Math.floor(rng() * total));
    }
    return picks;
}
function resolveConcertInterestMultiplier(scopeId, epochMs) {
    const snapshot = computePopulationSnapshot();
    const groups = resolveAgeGroupsForScope(scopeId, snapshot);
    if (!groups.length)
        return 1;
    const picks = pickConcertInterestSegments(scopeId, groups.length, epochMs);
    const total = Number(snapshot.total || 0) || groups.reduce((sum, group) => sum + Number(group.count || 0), 0) || 1;
    let activeShare = 0;
    groups.forEach((group, index) => {
        if (!picks.has(index))
            return;
        const share = Number.isFinite(group.share) ? group.share : Math.max(0, Number(group.count || 0) / total);
        activeShare += share;
    });
    const base = TOUR_CONCERT_INTEREST_BASE;
    const max = TOUR_CONCERT_INTEREST_MAX;
    const boost = clamp(activeShare / 0.35, 0, 1) * (max - base);
    return clamp(base + boost, base, max);
}
function computeTourProjection({ draft, act, era, venue, scheduledAt, anchor }) {
    const tier = getTourTierConfig(venue?.tier) || TOUR_TIER_DEFAULTS.Club;
    const capacity = Math.max(1, Number(venue?.capacity || tier.capacityMin || 500));
    const basePopularity = estimateTourPopularityMultiplier(act?.id || "", era?.id || null);
    const labelFans = Math.max(0, state.label?.fans || 0);
    const fanBoost = 1 + Math.log1p(labelFans / 50000) * 0.25;
    const baseDemand = Math.max(500, Math.round(4000 * basePopularity * fanBoost));
    const anchorGenre = anchor?.genre || "";
    const trendFit = state.trends.includes(anchorGenre) ? 1.1 : 0.95;
    const regionAffinity = anchor?.country && venue?.nation && anchor.country === venue.nation ? 1.08 : 0.96;
    const leadWeeks = tourLeadWeeks(scheduledAt);
    const announceLead = clamp(leadWeeks / TOUR_LEAD_MAX_WEEKS, 0.5, 1.2);
    const promoWeeks = Math.max(0, (anchor?.promoWeeks || 0) + (act?.promoWeeks || 0));
    const promoScale = 5000;
    const promoEfficiency = 0.35;
    const promoLift = 1 + Math.log1p((promoWeeks * (ECONOMY_TUNING?.promoWeekBudgetStep || 1200)) / promoScale) * promoEfficiency;
    const momentum = tourEraMomentum(era);
    const chartingBoost = resolveTourChartingBoost({
        actId: act?.id || null,
        actNameKey: act?.nameKey || null,
        trackId: anchor?.trackId || anchor?.id || null,
        regionId: venue?.regionId || null,
        nation: venue?.nation || null
    });
    const concertInterest = resolveConcertInterestMultiplier(venue?.regionId || venue?.nation || "global", scheduledAt);
    const desiredAttendance = baseDemand
        * trendFit
        * regionAffinity
        * announceLead
        * tier.drawMultiplier
        * promoLift
        * momentum
        * chartingBoost
        * concertInterest;
    const sellThrough = clamp(desiredAttendance / capacity, 0.2, 1.1);
    const attendance = Math.min(capacity, roundToAudienceChunk(capacity * sellThrough));
    const regionPriceIndex = tourRegionPriceIndex(venue);
    const qualityPremium = tourQualityPremium(anchor?.quality);
    const ticketPrice = roundMoney(tier.baseTicketPrice * regionPriceIndex * qualityPremium);
    const grossTicket = Math.round(attendance * ticketPrice);
    const merch = Math.round(attendance * tier.merchAttachRate * tier.merchSpendPerFan);
    const sponsorship = Math.round((tier.sponsorBase || 0) * momentum);
    const revenue = Math.round(grossTicket + merch + sponsorship);
    const staffing = Math.round(tier.staffingBase + attendance * 0.4);
    const travel = Math.round(tier.travelBase);
    const production = Math.round(attendance * 0.5);
    const marketing = Math.round(grossTicket * 0.03);
    const costs = Math.round((tier.venueFee || 0) + staffing + travel + production + marketing);
    const profit = Math.round(revenue - costs);
    return {
        attendance,
        sellThrough,
        desiredAttendance: Math.round(desiredAttendance),
        ticketPrice,
        grossTicket,
        merch,
        sponsorship,
        revenue,
        costs,
        profit
    };
}
function buildTourWarnings({ actId, venue, scheduledAt, projection, draftId }) {
    const warnings = [];
    const sellThrough = projection?.sellThrough;
    if (Number.isFinite(sellThrough) && sellThrough < TOUR_WARNING_SELLTHROUGH_LOW) {
        warnings.push({ code: "TOUR_UNDERBOOKED", message: "Projected sell-through below 50%." });
    }
    if (Number.isFinite(sellThrough) && sellThrough > TOUR_WARNING_SELLTHROUGH_HIGH) {
        warnings.push({ code: "TOUR_OVERBOOKED", message: "Projected sell-through above 95%." });
    }
    const leadWeeks = tourLeadWeeks(scheduledAt);
    if (leadWeeks > 0 && leadWeeks < TOUR_LEAD_MIN_WEEKS) {
        warnings.push({ code: "TOUR_LEAD_SHORT", message: "Lead time below 2 weeks." });
    }
    if (leadWeeks > TOUR_LEAD_MAX_WEEKS) {
        warnings.push({ code: "TOUR_LEAD_LONG", message: "Lead time above 6 weeks." });
    }
    const weekNumber = weekIndexForEpochMs(scheduledAt) + 1;
    const sameWeek = listTourBookings({ tourId: draftId, actId })
        .filter((booking) => weekIndexForEpochMs(booking.scheduledAt) + 1 === weekNumber);
    if (sameWeek.length >= TOUR_WEEKLY_MAX_DATES) {
        warnings.push({ code: "TOUR_WEEKLY_CAP", message: "More than 2 dates scheduled in the same week." });
    }
    const dayKey = tourDayKey(scheduledAt);
    const neighbors = listTourBookings({ tourId: draftId, actId })
        .filter((booking) => Math.abs(tourDayKey(booking.scheduledAt) - dayKey) <= DAY_MS * TOUR_REST_DAY_MIN);
    if (neighbors.length) {
        warnings.push({ code: "TOUR_REST_DAY", message: "Less than 1 rest day between tour dates." });
    }
    const travelConflicts = listTourBookings({ tourId: draftId, actId })
        .filter((booking) => booking.venueId !== venue?.id && Math.abs(tourDayKey(booking.scheduledAt) - dayKey) <= DAY_MS * TOUR_TRAVEL_BUFFER_MIN);
    if (travelConflicts.length) {
        warnings.push({ code: "TOUR_TRAVEL_BUFFER", message: "Travel buffer below 1 day between regions." });
    }
    return warnings;
}
function getTourTierRequirement(tier) {
    if (!tier)
        return { minActPeak: null, minFans: 0, minSellThrough: TOUR_BOOKING_SELLTHROUGH_MIN };
    return TOUR_TIER_REQUIREMENTS[tier] || { minActPeak: null, minFans: 0, minSellThrough: TOUR_BOOKING_SELLTHROUGH_MIN };
}
function evaluateTourBookingEligibility({ act, venue, projection }) {
    if (!act || !venue) {
        return { ok: false, reason: "Tour eligibility requires an Act and venue.", code: "TOUR_TIER_LOCKED" };
    }
    const tierReq = getTourTierRequirement(venue.tier);
    if (Number.isFinite(tierReq.minActPeak) && tierReq.minActPeak > 0) {
        const actPeak = getActPrestigePeak(act.id);
        if (!Number.isFinite(actPeak) || actPeak > tierReq.minActPeak) {
            return {
                ok: false,
                reason: `Tour tier requires a Top ${tierReq.minActPeak} chart peak.`,
                code: "TOUR_TIER_LOCKED"
            };
        }
    }
    const fanTotal = Math.max(0, Number(state.label?.fans || 0));
    if (Number.isFinite(tierReq.minFans) && fanTotal < tierReq.minFans) {
        return {
            ok: false,
            reason: `Tour tier requires ${formatCount(tierReq.minFans)} label fans.`,
            code: "TOUR_TIER_LOCKED"
        };
    }
    const sellThrough = Number(projection?.sellThrough || 0);
    if (Number.isFinite(tierReq.minSellThrough) && sellThrough < tierReq.minSellThrough) {
        return {
            ok: false,
            reason: "Projected sell-through below booking threshold.",
            code: "TOUR_DEMAND_LOW"
        };
    }
    const costs = Math.max(0, Math.round(Number(projection?.costs || 0)));
    if (costs > 0) {
        const budgetNeed = Math.round(costs * TOUR_BOOKING_COST_BUFFER);
        const cash = Math.max(0, Number(state.label?.wallet?.cash ?? state.label?.cash ?? 0));
        if (cash < budgetNeed) {
            return {
                ok: false,
                reason: `Insufficient cash for booking costs (${formatMoney(budgetNeed)}).`,
                code: "TOUR_BUDGET_SHORT"
            };
        }
    }
    return { ok: true };
}
function validateTourBooking({ draft, venue, scheduledAt }) {
    if (!draft)
        return { ok: false, reason: "Select a tour draft first.", code: "TOUR_NO_DRAFT" };
    if (!draft.actId)
        return { ok: false, reason: "Tour draft requires an Act.", code: "TOUR_NO_ACT" };
    const act = getAct(draft.actId);
    if (!act)
        return { ok: false, reason: "Tour Act not found.", code: "TOUR_NO_ACT" };
    const era = draft.eraId ? getEraById(draft.eraId) : getLatestActiveEraForAct(act.id);
    if (!era || era.status !== "Active") {
        return { ok: false, reason: "Touring requires an active Era.", code: "TOUR_NO_ACTIVE_ERA" };
    }
    const releases = listMarketTracksForAct(act.id, era.id);
    if (!releases.length) {
        return { ok: false, reason: "Touring requires released Project or Track content.", code: "TOUR_NO_RELEASED_CONTENT" };
    }
    if (!venue)
        return { ok: false, reason: "Select a venue for this date.", code: "TOUR_NO_VENUE" };
    if (!Number.isFinite(scheduledAt)) {
        return { ok: false, reason: "Tour date is invalid.", code: "TOUR_INVALID_DATE" };
    }
    if (scheduledAt <= state.time.epochMs) {
        return { ok: false, reason: "Tour date must be in the future.", code: "TOUR_PAST_DATE" };
    }
    const weekNumber = weekIndexForEpochMs(scheduledAt) + 1;
    const startWeek = Number.isFinite(draft.window?.startWeek) ? draft.window.startWeek : null;
    const endWeek = Number.isFinite(draft.window?.endWeek) ? draft.window.endWeek : null;
    if (Number.isFinite(startWeek) && weekNumber < startWeek) {
        return { ok: false, reason: "Tour date is before the tour window.", code: "TOUR_DATE_OUTSIDE_WINDOW" };
    }
    if (Number.isFinite(endWeek) && weekNumber > endWeek) {
        return { ok: false, reason: "Tour date is after the tour window.", code: "TOUR_DATE_OUTSIDE_WINDOW" };
    }
    const availability = getTourVenueAvailability(venue.id, scheduledAt);
    if (availability.available <= 0) {
        return { ok: false, reason: "Venue slots are full for this date.", code: "TOUR_VENUE_FULL" };
    }
    const dayKey = tourDayKey(scheduledAt);
    const conflicts = listTourBookings({ actId: act.id }).filter((booking) => tourDayKey(booking.scheduledAt) === dayKey);
    if (conflicts.length) {
        return { ok: false, reason: "Act already booked for this date.", code: "TOUR_SLOT_CONFLICT" };
    }
    const anchor = resolveTourAnchor(draft, act.id, era.id);
    const projection = computeTourProjection({
        draft,
        act,
        era,
        venue,
        scheduledAt,
        anchor: anchor.primary
    });
    const eligibility = evaluateTourBookingEligibility({ act, venue, projection });
    if (!eligibility.ok) {
        return { ok: false, reason: eligibility.reason, code: eligibility.code, act, era, releases, projection, anchor };
    }
    return { ok: true, act, era, releases, projection, anchor };
}
function bookTourDate({ draftId, venueId, weekNumber, dayIndex }) {
    const draft = getTourDraftById(draftId);
    const venue = getTourVenueById(venueId);
    const day = Number.isFinite(dayIndex) ? clamp(Math.round(dayIndex), 0, 6) : 0;
    const week = Number.isFinite(weekNumber) ? Math.max(1, Math.round(weekNumber)) : null;
    if (!week)
        return { ok: false, reason: "Select a valid tour week.", code: "TOUR_INVALID_WEEK" };
    const scheduledAt = weekStartEpochMs(week) + day * DAY_MS;
    const validation = validateTourBooking({ draft, venue, scheduledAt });
    if (!validation.ok) {
        const draftName = draft?.name || "Tour";
        logEvent(`Tour booking blocked (${draftName}): ${validation.reason} (${validation.code}).`, "warn");
        return validation;
    }
    const { act, era } = validation;
    const anchor = validation.anchor || resolveTourAnchor(draft, act.id, era.id);
    const projection = validation.projection || computeTourProjection({
        draft,
        act,
        era,
        venue,
        scheduledAt,
        anchor: anchor.primary
    });
    const warnings = buildTourWarnings({ actId: act.id, venue, scheduledAt, projection, draftId: draft.id });
    const booking = {
        id: uid("TB"),
        tourId: draft.id,
        tourName: draft.name || "",
        actId: act.id,
        actName: act.name,
        actNameKey: act.nameKey || null,
        eraId: era.id,
        eraName: era.name,
        goal: normalizeTourGoal(draft.goal),
        anchorTrackId: anchor.primary?.trackId || null,
        anchorProjectName: anchor.projectName || null,
        venueId: venue.id,
        venueLabel: venue.label,
        tier: venue.tier,
        capacity: venue.capacity,
        regionId: venue.regionId,
        nation: venue.nation,
        scheduledAt,
        weekNumber: week,
        dayIndex: day,
        status: "Booked",
        projection,
        warnings,
        createdAt: state.time?.epochMs || Date.now(),
        updatedAt: state.time?.epochMs || Date.now(),
        label: state.label?.name || "Record Label",
        alignment: act.alignment || state.label?.alignment || "Neutral",
        country: venue.nation || state.label?.country || "Annglora"
    };
    ensureTouringStore().bookings.push(booking);
    draft.status = "Booked";
    logEvent(`Tour booked: ${act.name} at ${venue.label} (Week ${week}, ${DAYS[day]}).`);
    return { ok: true, booking };
}
function removeTourBooking(bookingId) {
    const touring = ensureTouringStore();
    const before = touring.bookings.length;
    const removed = touring.bookings.find((booking) => booking.id === bookingId) || null;
    touring.bookings = touring.bookings.filter((booking) => booking.id !== bookingId);
    const changed = touring.bookings.length !== before;
    if (changed && removed) {
        if (removed.tourId) {
            const draft = getTourDraftById(removed.tourId);
            if (draft && !listTourBookings({ tourId: removed.tourId }).length) {
                draft.status = "Draft";
            }
        }
        logEvent(`Tour date removed: ${removed.actName || "Act"} at ${removed.venueLabel || "venue"}.`, "info");
    }
    return changed;
}
function autoGenerateTourDates({ draftId, count = null, startWeek = null, endWeek = null, filters = {} } = {}) {
    const draft = getTourDraftById(draftId);
    if (!draft)
        return { ok: false, reason: "Select a tour draft first." };
    if (!draft.actId)
        return { ok: false, reason: "Tour draft requires an Act." };
    const act = getAct(draft.actId);
    if (!act)
        return { ok: false, reason: "Tour Act not found." };
    const era = draft.eraId ? getEraById(draft.eraId) : getLatestActiveEraForAct(act.id);
    if (!era || era.status !== "Active")
        return { ok: false, reason: "Touring requires an active Era." };
    const releases = listMarketTracksForAct(act.id, era.id);
    if (!releases.length)
        return { ok: false, reason: "Touring requires released Project or Track content." };
    const fallbackStart = Number.isFinite(draft.window?.startWeek) ? draft.window.startWeek : weekIndex() + 1;
    const fallbackEnd = Number.isFinite(draft.window?.endWeek) ? draft.window.endWeek : fallbackStart + 5;
    const windowStart = Math.max(1, Math.round(Number.isFinite(startWeek) ? startWeek : fallbackStart));
    const windowEnd = Math.max(windowStart, Math.round(Number.isFinite(endWeek) ? endWeek : fallbackEnd));
    const maxCandidates = Math.max(1, (windowEnd - windowStart + 1) * TOUR_WEEKLY_MAX_DATES);
    const targetCount = Math.min(Math.max(1, Math.round(Number(count) || Math.min(8, maxCandidates))), maxCandidates);
    const filterNation = filters.nation || (filters.nation !== "" ? filters.nation : null);
    const filterRegion = filters.regionId || (filters.regionId !== "" ? filters.regionId : null);
    const filterTier = filters.tier || (filters.tier !== "" ? filters.tier : null);
    const venues = listTourVenues({
        nation: filterNation && filterNation !== "All" ? filterNation : null,
        regionId: filterRegion && filterRegion !== "All" ? filterRegion : null,
        tier: filterTier && filterTier !== "All" ? filterTier : null
    });
    if (!venues.length)
        return { ok: false, reason: "No venues available for the selected filters." };
    const tierOrder = listTourTiers();
    const tierIndex = (tier) => {
        const index = tierOrder.indexOf(tier);
        return index >= 0 ? index : tierOrder.length;
    };
    venues.sort((a, b) => {
        const tierDelta = tierIndex(a.tier) - tierIndex(b.tier);
        if (tierDelta !== 0)
            return tierDelta;
        return (a.capacity || 0) - (b.capacity || 0);
    });
    const dayOrder = [5, 6, 4, 3, 2, 1, 0];
    const booked = [];
    const weekCounts = {};
    const hasRestConflict = (scheduledAt) => {
        const dayKey = tourDayKey(scheduledAt);
        return listTourBookings({ actId: act.id })
            .concat(booked)
            .some((booking) => Math.abs(tourDayKey(booking.scheduledAt) - dayKey) <= DAY_MS * TOUR_REST_DAY_MIN);
    };
    for (let week = windowStart; week <= windowEnd && booked.length < targetCount; week += 1) {
        if (!Number.isFinite(weekCounts[week])) {
            const existingWeekCount = listTourBookings({ tourId: draft.id })
                .filter((booking) => weekIndexForEpochMs(booking.scheduledAt) + 1 === week).length;
            weekCounts[week] = existingWeekCount;
        }
        for (const day of dayOrder) {
            if (booked.length >= targetCount)
                break;
            if (weekCounts[week] >= TOUR_WEEKLY_MAX_DATES)
                break;
            const scheduledAt = weekStartEpochMs(week) + day * DAY_MS;
            if (scheduledAt <= state.time.epochMs)
                continue;
            if (hasRestConflict(scheduledAt))
                continue;
            let best = null;
            venues.forEach((venue) => {
                const validation = validateTourBooking({ draft, venue, scheduledAt });
                if (!validation.ok)
                    return;
                const projection = validation.projection;
                if (!projection)
                    return;
                const score = Number(projection.profit || 0);
                if (!best || score > best.score) {
                    best = { venue, score };
                }
            });
            if (!best)
                continue;
            const result = bookTourDate({ draftId: draft.id, venueId: best.venue.id, weekNumber: week, dayIndex: day });
            if (result.ok && result.booking) {
                booked.push(result.booking);
                weekCounts[week] += 1;
            }
        }
    }
    if (!booked.length) {
        return { ok: false, reason: "No eligible tour dates found in the selected window." };
    }
    const projectionSummary = booked.reduce((sum, booking) => sum + Number(booking.projection?.revenue || 0), 0);
    logEvent(`Auto-generated ${booked.length} tour date${booked.length === 1 ? "" : "s"} (Projected revenue ${formatMoney(projectionSummary)}).`);
    return { ok: true, booked, projectedRevenue: projectionSummary };
}
function applyTourVisibilityBoost(booking) {
    if (!booking)
        return;
    const attendance = Number(booking.projection?.attendance || booking.attendance || 0);
    if (!attendance)
        return;
    const boostWeeks = clamp(Math.round(attendance / 15000) + 1, TOUR_VISIBILITY_PROMO_MIN, TOUR_VISIBILITY_PROMO_MAX);
    const act = booking.actId ? getAct(booking.actId) : null;
    if (act)
        act.promoWeeks = Math.max(act.promoWeeks || 0, boostWeeks);
    const marketTracks = listMarketTracksForAct(booking.actId, booking.eraId);
    if (!marketTracks.length)
        return;
    if (booking.anchorProjectName) {
        const normalized = normalizeProjectName(booking.anchorProjectName);
        marketTracks.forEach((track) => {
            if (normalizeProjectName(track.projectName || "") !== normalized)
                return;
            track.promoWeeks = Math.max(track.promoWeeks || 0, boostWeeks);
        });
        return;
    }
    if (booking.anchorTrackId) {
        const entry = marketTracks.find((track) => track.trackId === booking.anchorTrackId || track.id === booking.anchorTrackId);
        if (entry)
            entry.promoWeeks = Math.max(entry.promoWeeks || 0, boostWeeks);
        return;
    }
    marketTracks.forEach((track) => {
        track.promoWeeks = Math.max(track.promoWeeks || 0, boostWeeks);
    });
}
function resolveTourBookings(now = state.time.epochMs) {
    const touring = ensureTouringStore();
    const balanceEnabled = touringBalanceEnabled();
    const pending = {
        revenue: 0,
        costs: 0,
        profit: 0,
        attendance: 0,
        fanGain: 0,
        count: 0
    };
    touring.bookings.forEach((booking) => {
        if (!booking || booking.status !== "Booked")
            return;
        if (!Number.isFinite(booking.scheduledAt) || booking.scheduledAt > now)
            return;
        const projection = booking.projection || {};
        const attendance = Number(projection.attendance || 0);
        const revenue = Number(projection.revenue || 0);
        const costs = Number(projection.costs || 0);
        const profit = Number(projection.profit || 0);
        booking.attendance = attendance;
        booking.revenue = revenue;
        booking.costs = costs;
        booking.profit = profit;
        booking.status = "Completed";
        booking.resolvedAt = now;
        pending.attendance += attendance;
        pending.revenue += revenue;
        pending.costs += costs;
        pending.profit += profit;
        pending.count += 1;
        logEvent(`Tour completed: ${booking.actName} at ${booking.venueLabel} (${formatMoney(profit)} net).`);
        if (balanceEnabled) {
            const gainRate = TOUR_FAN_GAIN_BALANCED;
            const gain = Math.round(attendance * gainRate);
            pending.fanGain += gain;
            const snapshot = computePopulationSnapshot();
            state.label.fans = clamp(state.label.fans + gain, 0, snapshot.total);
            applyTourVisibilityBoost(booking);
        }
    });
    if (pending.count) {
        if (!state.economy)
            state.economy = {};
        if (balanceEnabled) {
            if (!state.economy.pendingTouring || typeof state.economy.pendingTouring !== "object") {
                state.economy.pendingTouring = { revenue: 0, costs: 0, profit: 0, attendance: 0, fanGain: 0, count: 0 };
            }
            state.economy.pendingTouring.revenue += pending.revenue;
            state.economy.pendingTouring.costs += pending.costs;
            state.economy.pendingTouring.profit += pending.profit;
            state.economy.pendingTouring.attendance += pending.attendance;
            state.economy.pendingTouring.fanGain += pending.fanGain;
            state.economy.pendingTouring.count += pending.count;
        }
        state.economy.lastTouring = { ...pending, week: weekIndex() + 1, balanceApplied: balanceEnabled };
        if (!balanceEnabled) {
            logEvent(`Touring balance is disabled; ${pending.count} date${pending.count === 1 ? "" : "s"} resolved without wallet impact.`, "info");
        }
    }
    return pending;
}
function computeTourDraftSummary(draftId) {
    const bookings = listTourBookings({ tourId: draftId });
    const summary = {
        attendance: 0,
        revenue: 0,
        costs: 0,
        profit: 0,
        count: 0,
        warnings: []
    };
    bookings.forEach((booking) => {
        const projection = booking.projection || {};
        summary.attendance += Number(projection.attendance || 0);
        summary.revenue += Number(projection.revenue || 0);
        summary.costs += Number(projection.costs || 0);
        summary.profit += Number(projection.profit || 0);
        summary.count += 1;
        if (Array.isArray(booking.warnings))
            summary.warnings.push(...booking.warnings);
    });
    return summary;
}
function ensurePromoChartsStore() {
    state.promoCharts = ensureChartStoreStructure(state.promoCharts);
    return state.promoCharts;
}
function ensureTourChartsStore() {
    state.tourCharts = ensureChartStoreStructure(state.tourCharts);
    return state.tourCharts;
}
function ensureTourHistoryStore() {
    if (!state.tourChartHistory || typeof state.tourChartHistory !== "object")
        state.tourChartHistory = {};
    return state.tourChartHistory;
}
function listTourTiers() {
    const tiers = typeof TOUR_TIER_CONFIG === "object" ? TOUR_TIER_CONFIG : TOUR_TIER_DEFAULTS;
    return Object.keys(tiers || TOUR_TIER_DEFAULTS);
}
function getTourTierConfig(tier) {
    if (!tier)
        return null;
    if (typeof TOUR_TIER_CONFIG === "object" && TOUR_TIER_CONFIG[tier])
        return TOUR_TIER_CONFIG[tier];
    return TOUR_TIER_DEFAULTS[tier] || null;
}
function listTourVenues({ regionId = null, nation = null, tier = null } = {}) {
    const list = Array.isArray(TOUR_VENUE_CATALOG) ? TOUR_VENUE_CATALOG : [];
    return list.filter((venue) => {
        if (!venue || !venue.id)
            return false;
        if (regionId && venue.regionId !== regionId)
            return false;
        if (nation && venue.nation !== nation)
            return false;
        if (tier && venue.tier !== tier)
            return false;
        return true;
    });
}
function getTourVenueById(venueId) {
    if (!venueId)
        return null;
    return listTourVenues().find((venue) => venue.id === venueId) || null;
}
function tourVenueSlotsPerDay(venue) {
    const slots = Number(venue?.slotsPerDay);
    if (Number.isFinite(slots) && slots > 0)
        return Math.round(slots);
    return 1;
}
function tourDayKey(epochMs) {
    if (!Number.isFinite(epochMs))
        return null;
    return startOfDayEpochMs(epochMs);
}
function getTourVenueAvailability(venueId, epochMs) {
    const venue = getTourVenueById(venueId);
    if (!venue)
        return { capacity: 0, used: 0, available: 0, dayKey: null };
    const dayKey = tourDayKey(epochMs);
    const bookings = ensureTouringStore().bookings || [];
    const used = bookings.filter((booking) => booking?.venueId === venueId && tourDayKey(booking?.scheduledAt) === dayKey).length;
    const capacity = tourVenueSlotsPerDay(venue);
    return { capacity, used, available: Math.max(0, capacity - used), dayKey };
}
function promoEntryWeeksRemaining(entry, currentWeek) {
    const createdWeek = Number.isFinite(entry?.createdWeek) ? entry.createdWeek : currentWeek;
    const weeks = Number.isFinite(entry?.weeks) ? Math.max(1, Math.round(entry.weeks)) : 1;
    const elapsed = currentWeek - createdWeek;
    return Math.max(0, weeks - elapsed);
}
function promoEntryAgeWeeks(entry, currentWeek) {
    const createdWeek = Number.isFinite(entry?.createdWeek) ? entry.createdWeek : currentWeek;
    return Math.max(0, currentWeek - createdWeek);
}
function resolvePromoBaseTrack(entry) {
    if (!entry)
        return null;
    if (entry.marketId) {
        const market = state.marketTracks.find((track) => track.id === entry.marketId);
        if (market)
            return market;
    }
    if (entry.trackId) {
        const track = getTrack(entry.trackId);
        if (track)
            return track;
        const market = state.marketTracks.find((candidate) => candidate.trackId === entry.trackId);
        if (market)
            return market;
    }
    const actId = entry.actId || null;
    const actName = entry.actName || null;
    if (entry.projectName) {
        const projectKey = normalizeProjectName(entry.projectName);
        const matchesAct = (track) => {
            if (actId && track.actId !== actId)
                return false;
            if (actName && track.actName !== actName)
                return false;
            return true;
        };
        const candidates = state.marketTracks.filter((track) => {
            if (!matchesAct(track))
                return false;
            return normalizeProjectName(track.projectName || "") === projectKey;
        });
        if (candidates.length) {
            return candidates.reduce((latest, track) => {
                const latestStamp = latest?.releasedAt || latest?.completedAt || 0;
                const nextStamp = track?.releasedAt || track?.completedAt || 0;
                return nextStamp >= latestStamp ? track : latest;
            }, candidates[0]);
        }
        const internal = state.tracks.filter((track) => {
            if (actId && track.actId !== actId)
                return false;
            const trackProject = track.projectName || `${track.title} - Single`;
            return normalizeProjectName(trackProject) === projectKey;
        });
        if (internal.length) {
            return internal.reduce((latest, track) => {
                const latestStamp = latest?.releasedAt || latest?.completedAt || 0;
                const nextStamp = track?.releasedAt || track?.completedAt || 0;
                return nextStamp >= latestStamp ? track : latest;
            }, internal[0]);
        }
    }
    if (actId || actName) {
        const candidates = state.marketTracks.filter((track) => (actId && track.actId === actId) || (actName && track.actName === actName));
        if (candidates.length) {
            return candidates.reduce((latest, track) => {
                const latestStamp = latest?.releasedAt || latest?.completedAt || 0;
                const nextStamp = track?.releasedAt || track?.completedAt || 0;
                return nextStamp >= latestStamp ? track : latest;
            }, candidates[0]);
        }
        if (actId) {
            const internal = state.tracks.filter((track) => track.actId === actId);
            if (internal.length) {
                return internal.reduce((latest, track) => {
                    const latestStamp = latest?.releasedAt || latest?.completedAt || 0;
                    const nextStamp = track?.releasedAt || track?.completedAt || 0;
                    return nextStamp >= latestStamp ? track : latest;
                }, internal[0]);
            }
        }
    }
    return null;
}
function buildPromoFallbackTrack(entry, act) {
    const focusThemes = Array.isArray(state.label?.focusThemes) ? state.label.focusThemes.filter(Boolean) : [];
    const focusMoods = Array.isArray(state.label?.focusMoods) ? state.label.focusMoods.filter(Boolean) : [];
    const themePool = Array.isArray(THEMES) ? THEMES : [];
    const moodPool = Array.isArray(MOODS) ? MOODS.filter((mood) => mood !== "Boring") : [];
    const theme = focusThemes[0] || themePool[0] || "Hope";
    const mood = focusMoods[0] || moodPool[0] || "Warm";
    const genre = theme && mood ? makeGenre(theme, mood) : "";
    const actId = act?.id || entry.actId || null;
    const actName = act?.name || entry.actName || "Unknown";
    const actNameKey = act?.nameKey || entry.actNameKey || null;
    const label = entry.label || state.label?.name || "Unknown";
    const alignment = act?.alignment || state.label?.alignment || "Neutral";
    const country = entry.country
        || (actId ? resolveActCountryFromMembers(actId) : null)
        || state.label?.country
        || "Annglora";
    return {
        id: null,
        title: actName,
        projectName: entry.projectName || "",
        actId,
        actName,
        actNameKey,
        label,
        alignment,
        theme,
        mood,
        genre,
        quality: 60,
        country,
        promoWeeks: 0,
        weeksOnChart: 0
    };
}
function buildPromoAnchorTrack(entry, currentWeek) {
    const base = resolvePromoBaseTrack(entry);
    const act = entry.actId ? getAct(entry.actId) : null;
    const fallback = buildPromoFallbackTrack(entry, act);
    const anchor = { ...fallback, ...(base || {}) };
    const resolvedQuality = resolveTrackQualityScore(anchor) ?? resolveTrackQualityScore(fallback) ?? fallback.quality;
    anchor.quality = clampQuality(Number.isFinite(resolvedQuality) ? resolvedQuality : 60);
    anchor.alignment = ALIGNMENTS.includes(anchor.alignment) ? anchor.alignment : fallback.alignment;
    anchor.theme = anchor.theme || fallback.theme;
    anchor.mood = anchor.mood || fallback.mood;
    anchor.genre = anchor.genre || fallback.genre || (anchor.theme && anchor.mood ? makeGenre(anchor.theme, anchor.mood) : "");
    anchor.label = anchor.label || entry.label || fallback.label;
    anchor.actId = anchor.actId || entry.actId || fallback.actId || null;
    anchor.actName = anchor.actName || entry.actName || fallback.actName || "";
    anchor.actNameKey = anchor.actNameKey || entry.actNameKey || fallback.actNameKey || null;
    anchor.country = anchor.country || entry.country || fallback.country || "Annglora";
    anchor.isPlayer = typeof entry.isPlayer === "boolean" ? entry.isPlayer : !!anchor.isPlayer;
    anchor.promoWeeks = Math.max(0, promoEntryWeeksRemaining(entry, currentWeek));
    anchor.weeksOnChart = Math.max(0, promoEntryAgeWeeks(entry, currentWeek));
    return anchor;
}
function recordPromoContent({ promoType, actId = null, actName = null, actNameKey = null, trackId = null, marketId = null, trackTitle = null, projectName = null, label = null, budget = 0, weeks = 1, isPlayer = null, targetType = null } = {}) {
    const list = ensurePromoContentStore();
    const resolvedType = promoType || DEFAULT_PROMO_TYPE;
    const details = getPromoTypeDetails(resolvedType);
    const act = actId ? getAct(actId) : null;
    const market = marketId ? state.marketTracks.find((entry) => entry.id === marketId) : null;
    const track = trackId ? getTrack(trackId) : null;
    const base = market || track || null;
    const resolvedLabel = label || base?.label || (isPlayer ? state.label?.name : "") || "";
    const resolvedActId = act?.id || actId || base?.actId || null;
    const resolvedActName = actName || act?.name || base?.actName || "Unknown";
    const resolvedActNameKey = actNameKey || act?.nameKey || base?.actNameKey || null;
    const resolvedIsPlayer = typeof isPlayer === "boolean"
        ? isPlayer
        : !!base?.isPlayer || (resolvedLabel && resolvedLabel === state.label?.name);
    const resolvedTrackTitle = trackTitle || base?.title || "";
    const resolvedProjectName = projectName || base?.projectName || "";
    const resolvedTargetType = targetType
        || (trackId || marketId || base?.trackId ? "track" : resolvedProjectName ? "project" : "act");
    const resolvedCountry = base?.country
        || (resolvedActId ? resolveActCountryFromMembers(resolvedActId) : null)
        || state.label?.country
        || "Annglora";
    const resolvedAlignment = base?.alignment || act?.alignment || state.label?.alignment || "Neutral";
    const resolvedTheme = base?.theme || "";
    const resolvedMood = base?.mood || "";
    const resolvedGenre = base?.genre || "";
    const entry = {
        id: uid("PRC"),
        promoType: resolvedType,
        promoLabel: details.label,
        actId: resolvedActId,
        actName: resolvedActName,
        actNameKey: resolvedActNameKey,
        trackId: track?.id || trackId || base?.trackId || null,
        marketId: market?.id || marketId || base?.marketId || null,
        trackTitle: resolvedTrackTitle,
        projectName: resolvedProjectName,
        targetType: resolvedTargetType,
        label: resolvedLabel,
        country: resolvedCountry,
        alignment: resolvedAlignment,
        theme: resolvedTheme,
        mood: resolvedMood,
        genre: resolvedGenre,
        quality: Number.isFinite(base?.quality) ? base.quality : null,
        budget: Math.round(Number(budget || 0)),
        weeks: Math.max(1, Math.round(Number(weeks || 1))),
        createdWeek: weekIndex() + 1,
        createdAt: state.time.epochMs,
        isPlayer: resolvedIsPlayer,
        chartHistory: {}
    };
    list.push(entry);
    return entry;
}
function buildPromoChartList(entries, scopeId, scopeKey, size, prevEntries, currentWeek) {
    if (!entries.length)
        return [];
    const scored = entries.map((entry) => {
        const anchor = buildPromoAnchorTrack(entry, currentWeek);
        const remaining = promoEntryWeeksRemaining(entry, currentWeek);
        const baseScore = scoreTrack(anchor, scopeId);
        const budgetBoost = Math.round(Math.max(0, Number(entry.budget || 0)) / 600);
        const durationBoost = Math.round(Math.max(0, remaining) * 2);
        const score = Math.max(0, Math.round(baseScore + budgetBoost + durationBoost));
        const weights = chartWeightsForScope(scopeId);
        const baseMetrics = buildChartMetrics(score, weights);
        const engagement = buildPromoEngagementMetrics(baseMetrics);
        const metricMeta = resolvePromoMetricMeta(entry.promoType);
        const primary = engagement[metricMeta.key] || 0;
        const metrics = { ...baseMetrics, ...engagement, primary, primaryLabel: metricMeta.label, primaryKey: metricMeta.key };
        return { entry, anchor, metrics, score: primary };
    });
    const ordered = scored.sort((a, b) => b.score - a.score).slice(0, size);
    return ordered.map((item, index) => {
        const prevEntry = prevEntries.find((prev) => prev.id === item.entry.id);
        const history = updateChartHistory(item.entry, scopeKey, index + 1);
        const anchor = item.anchor || {};
        return {
            id: item.entry.id,
            promoType: item.entry.promoType,
            promoLabel: item.entry.promoLabel,
            actId: item.entry.actId || anchor.actId || null,
            actName: item.entry.actName || anchor.actName || "Unknown",
            actNameKey: item.entry.actNameKey || anchor.actNameKey || null,
            trackId: item.entry.trackId || anchor.trackId || null,
            marketId: item.entry.marketId || anchor.marketId || null,
            trackTitle: item.entry.trackTitle || (item.entry.trackId ? anchor.title : "") || "",
            projectName: item.entry.projectName || (item.entry.trackId ? anchor.projectName : "") || "",
            label: item.entry.label || anchor.label || "",
            country: item.entry.country || anchor.country || "Annglora",
            alignment: item.entry.alignment || anchor.alignment || "Neutral",
            theme: item.entry.theme || anchor.theme || "",
            mood: item.entry.mood || anchor.mood || "",
            genre: item.entry.genre || anchor.genre || "",
            isPlayer: typeof item.entry.isPlayer === "boolean" ? item.entry.isPlayer : !!anchor.isPlayer,
            score: item.score,
            metrics: item.metrics,
            rank: index + 1,
            lastRank: prevEntry ? prevEntry.rank : null,
            peak: history.peak,
            woc: history.weeks,
            contentType: "promotions"
        };
    });
}
function computePromoCharts() {
    const currentWeek = weekIndex() + 1;
    const entries = ensurePromoContentStore();
    const activeEntries = [];
    state.promoContent = entries.filter((entry) => {
        if (!entry || typeof entry !== "object")
            return false;
        const remaining = promoEntryWeeksRemaining(entry, currentWeek);
        if (remaining <= 0)
            return false;
        activeEntries.push(entry);
        return true;
    });
    const prevCharts = state.promoCharts || buildEmptyChartStore();
    const prevGlobal = Array.isArray(prevCharts.global) ? prevCharts.global.slice() : [];
    const prevNations = {};
    const prevRegions = {};
    NATIONS.forEach((nation) => {
        prevNations[nation] = Array.isArray(prevCharts.nations?.[nation]) ? prevCharts.nations[nation].slice() : [];
    });
    REGION_DEFS.forEach((region) => {
        prevRegions[region.id] = Array.isArray(prevCharts.regions?.[region.id]) ? prevCharts.regions[region.id].slice() : [];
    });
    const charts = ensurePromoChartsStore();
    charts.global = buildPromoChartList(activeEntries, "global", "promo:global", CHART_SIZES.global, prevGlobal, currentWeek);
    NATIONS.forEach((nation) => {
        charts.nations[nation] = buildPromoChartList(activeEntries, nation, `promo:nation:${nation}`, CHART_SIZES.nation, prevNations[nation], currentWeek);
    });
    REGION_DEFS.forEach((region) => {
        charts.regions[region.id] = buildPromoChartList(activeEntries, region.id, `promo:region:${region.id}`, CHART_SIZES.region, prevRegions[region.id], currentWeek);
    });
}
function tourActKey(entry) {
    if (entry?.actId)
        return entry.actId;
    if (entry?.actNameKey)
        return entry.actNameKey;
    const actName = entry?.actName || "Unknown";
    const label = entry?.label || "Unknown";
    return `${actName}::${label}`;
}
function ensureTourHistoryEntry(entry) {
    const history = ensureTourHistoryStore();
    const key = entry.actKey;
    if (!history[key]) {
        history[key] = {
            actId: entry.actId || null,
            actName: entry.actName || "",
            actNameKey: entry.actNameKey || null,
            label: entry.label || "",
            chartHistory: {}
        };
    }
    if (!history[key].chartHistory || typeof history[key].chartHistory !== "object")
        history[key].chartHistory = {};
    if (entry.actId && !history[key].actId)
        history[key].actId = entry.actId;
    if (entry.actName && !history[key].actName)
        history[key].actName = entry.actName;
    if (entry.actNameKey && !history[key].actNameKey)
        history[key].actNameKey = entry.actNameKey;
    if (entry.label && !history[key].label)
        history[key].label = entry.label;
    return history[key];
}
function resolveTourBookingAnchorTrack(booking) {
    if (!booking)
        return null;
    if (booking.anchorTrackId) {
        return resolveMarketEntryByTrackId(booking.anchorTrackId) || getTrack(booking.anchorTrackId) || null;
    }
    if (!booking.anchorProjectName)
        return null;
    const normalized = normalizeProjectName(booking.anchorProjectName);
    const marketTracks = Array.isArray(state.marketTracks) ? state.marketTracks : [];
    const matches = [];
    const addIfMatch = (entry) => {
        if (!entry)
            return;
        if (normalizeProjectName(entry.projectName || "") !== normalized)
            return;
        if (booking.actId && entry.actId && entry.actId !== booking.actId)
            return;
        matches.push(entry);
    };
    marketTracks.forEach(addIfMatch);
    if (Array.isArray(state.meta?.marketTrackArchive)) {
        state.meta.marketTrackArchive.forEach(addIfMatch);
    }
    if (!matches.length && booking.actId) {
        const fallback = [];
        const addAny = (entry) => {
            if (!entry)
                return;
            if (normalizeProjectName(entry.projectName || "") !== normalized)
                return;
            fallback.push(entry);
        };
        marketTracks.forEach(addAny);
        if (Array.isArray(state.meta?.marketTrackArchive)) {
            state.meta.marketTrackArchive.forEach(addAny);
        }
        matches.push(...fallback);
    }
    if (!matches.length)
        return null;
    return matches.reduce((latest, entry) => {
        const latestStamp = latest?.releasedAt || latest?.completedAt || 0;
        const nextStamp = entry?.releasedAt || entry?.completedAt || 0;
        return nextStamp >= latestStamp ? entry : latest;
    }, matches[0]);
}
function buildTourChartEntry(booking, now) {
    if (!booking || !Number.isFinite(booking.scheduledAt))
        return null;
    if (booking.status !== "Completed" && booking.scheduledAt > now)
        return null;
    const projection = booking.projection || {};
    const attendance = Number(booking.attendance || projection.attendance || 0);
    const revenue = Number(booking.revenue || projection.revenue || 0);
    const costs = Number(booking.costs || projection.costs || 0);
    const profit = Number(booking.profit || projection.profit || 0);
    const grossTicket = Number(projection.grossTicket || 0);
    const merch = Number(projection.merch || 0);
    const sponsorship = Number(projection.sponsorship || 0);
    const primaryTrack = resolveTourBookingAnchorTrack(booking);
    const label = booking.label || primaryTrack?.label || state.label?.name || "Unknown Label";
    const alignment = booking.alignment || primaryTrack?.alignment || state.label?.alignment || "Neutral";
    const country = booking.country || primaryTrack?.country || state.label?.country || "Annglora";
    const trackId = primaryTrack?.trackId || null;
    const marketId = primaryTrack?.id || null;
    return {
        actId: booking.actId || primaryTrack?.actId || null,
        actName: booking.actName || primaryTrack?.actName || "Unknown",
        actNameKey: booking.actNameKey || primaryTrack?.actNameKey || null,
        label,
        alignment,
        country,
        nation: booking.nation || primaryTrack?.country || country,
        regionId: booking.regionId || null,
        isPlayer: label === state.label?.name,
        primaryTrack,
        primaryTrackId: trackId,
        trackId,
        marketId,
        score: attendance,
        metrics: {
            attendance,
            revenue,
            costs,
            profit,
            grossTicket,
            merch,
            sponsorship
        }
    };
}
function listTourChartEntries(weekNumber, now = state.time.epochMs) {
    const targetWeek = Number.isFinite(weekNumber) ? weekNumber : weekIndex() + 1;
    return listTourBookings().filter((booking) => {
        if (!booking || !Number.isFinite(booking.scheduledAt))
            return false;
        const bookingWeek = weekIndexForEpochMs(booking.scheduledAt) + 1;
        if (bookingWeek !== targetWeek)
            return false;
        if (booking.status === "Completed")
            return true;
        return booking.status === "Booked" && booking.scheduledAt <= now;
    }).map((booking) => buildTourChartEntry(booking, now)).filter(Boolean);
}
function buildTourChartList(entries, scopeKey, size, prevEntries) {
    if (!entries.length)
        return [];
    const grouped = new Map();
    entries.forEach((entry) => {
        const track = entry.primaryTrack || entry.track || entry;
        if (!entry)
            return;
        const actId = entry.actId || track?.actId || null;
        const actName = entry.actName || track?.actName || "Unknown";
        const actNameKey = entry.actNameKey || track?.actNameKey || null;
        const label = entry.label || track?.label || "Unknown";
        const key = tourActKey({ actId, actName, actNameKey, label });
        const metrics = entry.metrics || {};
        const score = Number(entry.score || metrics.attendance || 0);
        const existing = grouped.get(key) || {
            actKey: key,
            actId,
            actName,
            actNameKey,
            label,
            alignment: entry.alignment || track?.alignment || state.label?.alignment || "Neutral",
            country: entry.country || track?.country || "Annglora",
            dateCount: 0,
            primaryTrack: track || null,
            primaryScore: score,
            metrics: { attendance: 0, revenue: 0, costs: 0, profit: 0, grossTicket: 0, merch: 0, sponsorship: 0 },
            score: 0,
            primaryTrackId: entry.primaryTrackId || null,
            marketId: entry.marketId || null
        };
        existing.dateCount += 1;
        if (Number.isFinite(score)) {
            existing.score += score;
            if (!existing.primaryTrack || score > existing.primaryScore) {
                existing.primaryTrack = track;
                existing.primaryScore = score;
                existing.primaryTrackId = entry.primaryTrackId || existing.primaryTrackId;
                existing.marketId = entry.marketId || existing.marketId;
            }
        }
        existing.metrics.attendance += Number(metrics.attendance || 0);
        existing.metrics.revenue += Number(metrics.revenue || 0);
        existing.metrics.costs += Number(metrics.costs || 0);
        existing.metrics.profit += Number(metrics.profit || 0);
        existing.metrics.grossTicket += Number(metrics.grossTicket || 0);
        existing.metrics.merch += Number(metrics.merch || 0);
        existing.metrics.sponsorship += Number(metrics.sponsorship || 0);
        grouped.set(key, existing);
    });
    const aggregated = Array.from(grouped.values()).map((entry) => ({
        ...entry,
        metrics: { ...entry.metrics },
        score: Number(entry.score || 0),
        primaryTrackTitle: entry.primaryTrack?.title || "",
        primaryTrackTheme: entry.primaryTrack?.theme || "",
        primaryTrackMood: entry.primaryTrack?.mood || "",
        primaryTrackGenre: entry.primaryTrack?.genre || ""
    }));
    const ordered = aggregated.sort((a, b) => b.score - a.score).slice(0, size);
    return ordered.map((entry, index) => {
        const prevEntry = prevEntries.find((prev) => prev.actKey === entry.actKey);
        const historyEntry = ensureTourHistoryEntry(entry);
        const history = updateChartHistory(historyEntry, scopeKey, index + 1);
        return {
            ...entry,
            rank: index + 1,
            lastRank: prevEntry ? prevEntry.rank : null,
            peak: history.peak,
            woc: history.weeks,
            contentType: "tours"
        };
    });
}
function computeTourCharts() {
    const week = weekIndex() + 1;
    const entries = listTourChartEntries(week);
    const prevCharts = state.tourCharts || buildEmptyChartStore();
    const prevGlobal = Array.isArray(prevCharts.global) ? prevCharts.global.slice() : [];
    const prevNations = {};
    const prevRegions = {};
    NATIONS.forEach((nation) => {
        prevNations[nation] = Array.isArray(prevCharts.nations?.[nation]) ? prevCharts.nations[nation].slice() : [];
    });
    REGION_DEFS.forEach((region) => {
        prevRegions[region.id] = Array.isArray(prevCharts.regions?.[region.id]) ? prevCharts.regions[region.id].slice() : [];
    });
    const charts = ensureTourChartsStore();
    charts.global = buildTourChartList(entries, "tour:global", CHART_SIZES.global, prevGlobal);
    NATIONS.forEach((nation) => {
        const scoped = entries.filter((entry) => entry.nation === nation);
        charts.nations[nation] = buildTourChartList(scoped, `tour:nation:${nation}`, CHART_SIZES.nation, prevNations[nation]);
    });
    REGION_DEFS.forEach((region) => {
        const scoped = entries.filter((entry) => entry.regionId === region.id);
        charts.regions[region.id] = buildTourChartList(scoped, `tour:region:${region.id}`, CHART_SIZES.region, prevRegions[region.id]);
    });
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
    queueChartSnapshotsWrite(snapshots);
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
        const originMeta = resolveTrackOriginMeta(track);
        trackMap.set(key, track);
        tracks.push({
            key,
            quality: track.quality,
            alignment: track.alignment,
            theme: track.theme,
            mood: track.mood,
            genre: track.genre,
            promoWeeks: track.promoWeeks,
            promoGapPenalty: getTrackPromoGapPenalty(track),
            actPromoStalePenalty: getActPromoStalePenaltyForTrack(track),
            weeksOnChart: track.weeksOnChart,
            label: track.label,
            country: track.country,
            actCountry: originMeta.actCountry,
            creatorCountries: originMeta.creatorCountries
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
    const labelCompetition = ensureLabelCompetitionMap();
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
            defaultWeights: CHART_WEIGHTS,
            labelCompetition,
            regionDefs: REGION_DEFS
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
    computePromoCharts();
    computeTourCharts();
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
    snapshots.push(buildChartSnapshot("promo:global", state.promoCharts?.global || []));
    NATIONS.forEach((nation) => {
        snapshots.push(buildChartSnapshot(`promo:nation:${nation}`, state.promoCharts?.nations?.[nation] || []));
    });
    REGION_DEFS.forEach((region) => {
        snapshots.push(buildChartSnapshot(`promo:region:${region.id}`, state.promoCharts?.regions?.[region.id] || []));
    });
    snapshots.push(buildChartSnapshot("tour:global", state.tourCharts?.global || []));
    NATIONS.forEach((nation) => {
        snapshots.push(buildChartSnapshot(`tour:nation:${nation}`, state.tourCharts?.nations?.[nation] || []));
    });
    REGION_DEFS.forEach((region) => {
        snapshots.push(buildChartSnapshot(`tour:region:${region.id}`, state.tourCharts?.regions?.[region.id] || []));
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
        actNameKey: entry.actNameKey || null,
        projectName: entry.projectName || "",
        projectType: normalizeProjectType(entry.projectType || "Single"),
        releasedAt: entry.releasedAt || now,
        archivedAt: now,
        theme: entry.theme || "",
        mood: entry.mood || "",
        alignment: entry.alignment || "",
        quality: Number.isFinite(entry.quality) ? entry.quality : 0,
        qualityBase: Number.isFinite(entry.qualityBase) ? entry.qualityBase : (Number.isFinite(entry.quality) ? entry.quality : 0),
        qualityFinal: Number.isFinite(entry.qualityFinal) ? entry.qualityFinal : (Number.isFinite(entry.quality) ? entry.quality : 0),
        genre: entry.genre || "",
        distribution: entry.distribution || "Digital",
        trendAtRelease: Boolean(entry.trendAtRelease),
        isPlayer: Boolean(entry.isPlayer),
        country: entry.country || "",
        actCountry: entry.actCountry || null,
        creatorCountries: Array.isArray(entry.creatorCountries) ? entry.creatorCountries.slice() : [],
        criticScore: Number.isFinite(entry.criticScore) ? entry.criticScore : null,
        criticGrade: typeof entry.criticGrade === "string" ? entry.criticGrade : null,
        criticDelta: Number.isFinite(entry.criticDelta) ? entry.criticDelta : null,
        criticScores: entry.criticScores && typeof entry.criticScores === "object" ? { ...entry.criticScores } : null,
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
    computePromoCharts();
    computeTourCharts();
    persistChartHistorySnapshots();
    return { globalScores };
}
function buildProjectedMarketTracks(targetEpochMs) {
    const safeEpoch = Number.isFinite(targetEpochMs) ? targetEpochMs : state.time.epochMs;
    const nowWeek = weekIndex();
    const targetWeek = weekIndexForEpochMs(safeEpoch);
    const weekDelta = Math.max(0, targetWeek - nowWeek);
    const marketTracks = Array.isArray(state.marketTracks) ? state.marketTracks : [];
    const ordered = marketTracks.slice().sort((a, b) => (a.releasedAt || 0) - (b.releasedAt || 0));
    const overflow = Math.max(0, ordered.length - MARKET_TRACK_ACTIVE_LIMIT);
    const active = overflow > 0 ? ordered.slice(overflow) : ordered;
    const projected = [];
    const seen = new Set();
    active.forEach((entry) => {
        const clone = { ...entry };
        const key = trackKey(clone);
        if (key)
            seen.add(key);
        if (clone.trackId) {
            const track = getTrack(clone.trackId);
            if (track) {
                if (!clone.projectName)
                    clone.projectName = track.projectName || clone.projectName;
                if (!clone.projectType)
                    clone.projectType = track.projectType || clone.projectType;
            }
        }
        clone.weeksOnChart = Math.max(0, Number(clone.weeksOnChart || 0) + weekDelta);
        projected.push(clone);
    });
    if (Array.isArray(state.releaseQueue)) {
        state.releaseQueue.forEach((entry) => {
            if (!Number.isFinite(entry.releaseAt) || entry.releaseAt > safeEpoch)
                return;
            const track = getTrack(entry.trackId);
            if (!track || track.status === "Released")
                return;
            const key = trackKey({ trackId: track.id, id: track.id, title: track.title });
            if (key && seen.has(key))
                return;
            const act = track.actId ? getAct(track.actId) : null;
            const projectName = track.projectName || `${track.title} - Single`;
            const creatorCountries = resolveCreatorCountriesFromTrack(track);
            const actCountry = resolveActCountryFromMembers(track.actId);
            const originCountry = actCountry || dominantValue(creatorCountries, null) || state.label.country || "Annglora";
            const era = track.eraId ? getEraById(track.eraId) : null;
            const weeksOnChart = Math.max(0, weekIndexForEpochMs(safeEpoch) - weekIndexForEpochMs(entry.releaseAt));
            const promoTypesUsed = track.promo?.typesUsed && typeof track.promo.typesUsed === "object"
                ? { ...track.promo.typesUsed }
                : {};
            if (track.promo?.musicVideoUsed && !Number.isFinite(promoTypesUsed.musicVideo)) {
                promoTypesUsed.musicVideo = 1;
            }
            const promoTypesLastAt = track.promo?.typesLastAt && typeof track.promo.typesLastAt === "object"
                ? { ...track.promo.typesLastAt }
                : {};
            projected.push({
                id: uid("MKP"),
                trackId: track.id,
                title: track.title,
                label: state.label.name,
                actId: track.actId,
                actName: act ? act.name : "Unknown Act",
                actNameKey: act?.nameKey || null,
                eraId: track.eraId || null,
                eraName: era ? era.name : null,
                projectName,
                projectType: track.projectType || "Single",
                isPlayer: true,
                theme: track.theme,
                mood: track.mood,
                alignment: track.alignment,
                country: originCountry,
                actCountry,
                creatorCountries,
                quality: track.quality,
                genre: track.genre,
                distribution: entry.distribution || track.distribution || "Digital",
                releasedAt: entry.releaseAt,
                weeksOnChart,
                promoWeeks: Math.max(0, track.promo?.preReleaseWeeks || 0),
                promoTypesUsed,
                promoTypesLastAt
            });
            if (key)
                seen.add(key);
        });
    }
    if (Array.isArray(state.rivalReleaseQueue)) {
        state.rivalReleaseQueue.forEach((entry) => {
            const queueType = entry.queueType || "release";
            if (queueType === "promo")
                return;
            if (!Number.isFinite(entry.releaseAt) || entry.releaseAt > safeEpoch)
                return;
            const key = trackKey(entry);
            if (key && seen.has(key))
                return;
            const rival = getRivalByName(entry.label);
            const creatorCountries = [];
            if (rival && Array.isArray(entry.creatorIds)) {
                entry.creatorIds.forEach((id) => {
                    const creator = rival.creators?.find((member) => member.id === id);
                    if (creator?.country)
                        creatorCountries.push(creator.country);
                });
            }
            if (!creatorCountries.length && entry.country)
                creatorCountries.push(entry.country);
            const actCountry = entry.country || dominantValue(creatorCountries, null);
            const title = entry.title || "Unknown Track";
            const projectName = entry.projectName || `${title} - Single`;
            const projectType = normalizeProjectType(entry.projectType || "Single");
            const weeksOnChart = Math.max(0, weekIndexForEpochMs(safeEpoch) - weekIndexForEpochMs(entry.releaseAt));
            projected.push({
                id: entry.id || uid("MKP"),
                trackId: null,
                title,
                label: entry.label || "Unknown",
                actId: null,
                actName: entry.actName || "Unknown",
                actNameKey: entry.actNameKey || null,
                projectName,
                projectType,
                isPlayer: false,
                theme: entry.theme,
                mood: entry.mood,
                alignment: entry.alignment,
                country: entry.country || actCountry || "Annglora",
                actCountry,
                creatorCountries,
                quality: entry.quality,
                genre: entry.genre,
                distribution: entry.distribution || "Digital",
                releasedAt: entry.releaseAt,
                weeksOnChart,
                promoWeeks: 0
            });
            if (key)
                seen.add(key);
        });
    }
    return projected;
}
function computeChartProjectionForScope({ targetEpochMs, scopeType = "global", scopeTarget = "global", limit = null } = {}) {
    const safeEpoch = Number.isFinite(targetEpochMs) ? targetEpochMs : state.time.epochMs;
    const scope = scopeType === "global" ? "global" : scopeTarget;
    const chartSize = scopeType === "region" ? CHART_SIZES.region : scopeType === "nation" ? CHART_SIZES.nation : CHART_SIZES.global;
    const cap = typeof limit === "number" ? Math.max(0, Math.min(limit, chartSize)) : chartSize;
    const weights = scopeType === "global" ? chartWeightsForGlobal() : chartWeightsForScope(scope);
    const seedBase = makeStableSeed([safeEpoch, scopeType, scopeTarget, "projection"]);
    const marketTracks = buildProjectedMarketTracks(safeEpoch);
    if (!marketTracks.length || !cap)
        return [];
    const scores = marketTracks.map((track) => {
        if (scopeType === "global") {
            const count = Math.max(1, NATIONS.length);
            const sum = NATIONS.reduce((acc, nation) => {
                const seed = makeStableSeed([seedBase, trackKey(track), nation]);
                return acc + scoreTrackProjected(track, nation, seed);
            }, 0);
            const avg = Math.round(sum / count);
            return { track, score: avg, metrics: buildChartMetrics(avg, weights) };
        }
        const seed = makeStableSeed([seedBase, trackKey(track), scope]);
        const score = scoreTrackProjected(track, scope, seed);
        return { track, score, metrics: buildChartMetrics(score, weights) };
    });
    return scores
        .sort((a, b) => b.score - a.score)
        .slice(0, cap)
        .map((entry, index) => ({
        rank: index + 1,
        track: entry.track,
        score: entry.score,
        metrics: entry.metrics
    }));
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
function normalizeChartPulseScope() {
    const valid = new Set(["global", "nation", "region"]);
    if (!valid.has(state.ui.chartPulseScopeType))
        state.ui.chartPulseScopeType = "global";
    if (state.ui.chartPulseScopeType === "global") {
        state.ui.chartPulseScopeTarget = "global";
        return;
    }
    if (!state.ui.chartPulseScopeTarget) {
        state.ui.chartPulseScopeTarget = state.ui.chartPulseScopeType === "region"
            ? defaultTrendRegion()
            : defaultTrendNation();
    }
    if (state.ui.chartPulseScopeType === "nation") {
        if (!NATIONS.includes(state.ui.chartPulseScopeTarget))
            state.ui.chartPulseScopeTarget = defaultTrendNation();
        return;
    }
    const regionIds = REGION_DEFS.map((region) => region.id);
    if (!regionIds.includes(state.ui.chartPulseScopeTarget))
        state.ui.chartPulseScopeTarget = defaultTrendRegion();
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
    const revenueRate = Number.isFinite(ECONOMY_TUNING?.revenuePerChartPoint)
        ? ECONOMY_TUNING.revenuePerChartPoint
        : 22;
    let revenue = 0;
    playerScores.forEach((entry) => {
        revenue += Math.max(0, entry.score) * revenueRate;
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
        const weeklyRevenue = Math.round(Math.max(0, entry.score) * revenueRate * difficulty.revenueMult);
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
    const upkeepPerCreator = Number.isFinite(ECONOMY_TUNING?.upkeepPerCreator)
        ? ECONOMY_TUNING.upkeepPerCreator
        : 150;
    const upkeepPerStudio = Number.isFinite(ECONOMY_TUNING?.upkeepPerOwnedStudio)
        ? ECONOMY_TUNING.upkeepPerOwnedStudio
        : 600;
    const upkeepBase = state.creators.length * upkeepPerCreator + ownedSlots * upkeepPerStudio + leaseFees;
    const upkeep = Math.round(upkeepBase * difficulty.upkeepMult);
    const touringPending = state.economy?.pendingTouring || {};
    const touringRevenue = Math.round(Number(touringPending.revenue || 0));
    const touringCosts = Math.round(Number(touringPending.costs || 0));
    const touringProfit = Math.round(Number(touringPending.profit || touringRevenue - touringCosts));
    const touringCount = Math.max(0, Math.round(Number(touringPending.count || 0)));
    const applyTouring = touringBalanceEnabled() && touringCount > 0;
    const totalRevenue = revenue + (applyTouring ? touringRevenue : 0);
    const totalUpkeep = upkeep + (applyTouring ? touringCosts : 0);
    state.label.cash = Math.round(state.label.cash + totalRevenue - totalUpkeep);
    state.economy.lastRevenue = revenue;
    state.economy.lastUpkeep = upkeep;
    state.economy.lastWeek = weekIndex() + 1;
    state.economy.leaseFeesWeek = 0;
    if (!state.economy.pendingTouring || typeof state.economy.pendingTouring !== "object") {
        state.economy.pendingTouring = { revenue: 0, costs: 0, profit: 0, attendance: 0, fanGain: 0, count: 0 };
    }
    else {
        state.economy.pendingTouring.revenue = 0;
        state.economy.pendingTouring.costs = 0;
        state.economy.pendingTouring.profit = 0;
        state.economy.pendingTouring.attendance = 0;
        state.economy.pendingTouring.fanGain = 0;
        state.economy.pendingTouring.count = 0;
    }
    let report = `Week ${weekIndex() + 1} report: +${formatMoney(revenue)} revenue, -${formatMoney(upkeep)} upkeep.`;
    if (touringCount) {
        report += applyTouring
            ? ` Touring net ${formatMoney(touringProfit)} from ${touringCount} date${touringCount === 1 ? "" : "s"}.`
            : ` Touring balance disabled; ${touringCount} date${touringCount === 1 ? "" : "s"} netted ${formatMoney(touringProfit)} (no wallet impact).`;
    }
    logEvent(report);
    const reportLines = [
        `Revenue ${formatMoney(revenue)} | Upkeep ${formatMoney(upkeep)}`,
        `Net ${formatMoney(totalRevenue - totalUpkeep)}`
    ];
    if (touringCount) {
        reportLines.push(applyTouring
            ? `Touring ${formatMoney(touringRevenue)} | Costs ${formatMoney(touringCosts)} | Net ${formatMoney(touringProfit)}`
            : `Touring net ${formatMoney(touringProfit)} (balance off)`);
    }
    postSocial({
        handle: "@eyeriStats",
        title: `Week ${weekIndex() + 1} Market Report`,
        lines: reportLines,
        type: "economy",
        order: 2
    });
}
function updateRivalEconomy(globalScores) {
    if (!Array.isArray(state.rivals))
        return;
    const scores = Array.isArray(globalScores) ? globalScores : [];
    const revenueRate = Number.isFinite(ECONOMY_TUNING?.revenuePerChartPoint)
        ? ECONOMY_TUNING.revenuePerChartPoint
        : 22;
    const upkeepPerCreator = Number.isFinite(ECONOMY_TUNING?.upkeepPerCreator)
        ? ECONOMY_TUNING.upkeepPerCreator
        : 150;
    const upkeepPerStudio = Number.isFinite(ECONOMY_TUNING?.upkeepPerOwnedStudio)
        ? ECONOMY_TUNING.upkeepPerOwnedStudio
        : 600;
    const week = weekIndex() + 1;
    state.rivals.forEach((rival) => {
        ensureRivalAchievementState(rival);
        const labelScores = scores.filter((entry) => resolveChartEntryLabel(entry) === rival.name);
        let revenue = 0;
        labelScores.forEach((entry) => {
            revenue += Math.max(0, entry.score) * revenueRate;
        });
        revenue = Math.round(revenue * RIVAL_REVENUE_MULT);
        const ownedSlots = clamp(Math.round(rival.studio?.slots || STARTING_STUDIO_SLOTS), 0, STUDIO_CAP_PER_LABEL);
        const upkeepBase = (rival.creators?.length || 0) * upkeepPerCreator + ownedSlots * upkeepPerStudio;
        const upkeep = Math.round(upkeepBase * RIVAL_UPKEEP_MULT);
        rival.cash = Math.round((rival.cash ?? STARTING_CASH) + revenue - upkeep);
        if (!rival.wallet)
            rival.wallet = { cash: rival.cash };
        rival.wallet.cash = rival.cash;
        const leaseFees = Math.max(0, Math.round(rival.economy.lastLeaseFees || 0));
        rival.economy.lastRevenue = revenue;
        rival.economy.lastUpkeep = upkeep + leaseFees;
        rival.economy.lastWeek = week;
    });
}
function updateLabelReach() {
    const chartEntries = (state.charts.global || []).filter((entry) => entry.track.isPlayer);
    const points = chartEntries.reduce((sum, entry) => sum + Math.max(1, CHART_SIZES.global + 1 - entry.rank), 0);
    const snapshot = computePopulationSnapshot();
    const gain = points * 1500 + state.tracks.filter((track) => track.status === "Released").length * 40;
    state.label.fans = clamp(state.label.fans + gain, 0, snapshot.total);
}
const LABEL_SCORE_WEIGHTS = {
    tracks: { global: 1, nation: 0.55, region: 0.35 },
    promos: { global: 0.4, nation: 0.3, region: 0.2 },
    tours: { global: 0.4, nation: 0.3, region: 0.2 }
};
const ACT_POPULARITY_WEIGHTS = {
    tracks: { global: 1, nation: 0.55, region: 0.35 },
    promos: { global: 0.4, nation: 0.3, region: 0.2 },
    tours: { global: 0.4, nation: 0.3, region: 0.2 }
};
function resolveChartEntryLabel(entry) {
    if (!entry)
        return "";
    if (entry.label)
        return entry.label;
    if (entry.track?.label)
        return entry.track.label;
    return "";
}
function addLabelScores(scores, entries, size, weight) {
    if (!Array.isArray(entries) || !entries.length || !weight)
        return;
    entries.forEach((entry, index) => {
        if (!entry)
            return;
        const label = resolveChartEntryLabel(entry);
        if (!label)
            return;
        const rank = Number.isFinite(entry.rank) ? entry.rank : index + 1;
        const points = Math.max(1, size + 1 - rank) * weight;
        scores[label] = (scores[label] || 0) + points;
    });
}
function computeLabelScoresFromCharts() {
    const scores = {};
    addLabelScores(scores, state.charts.global || [], CHART_SIZES.global, LABEL_SCORE_WEIGHTS.tracks.global);
    NATIONS.forEach((nation) => {
        addLabelScores(scores, state.charts.nations?.[nation] || [], CHART_SIZES.nation, LABEL_SCORE_WEIGHTS.tracks.nation);
    });
    REGION_DEFS.forEach((region) => {
        addLabelScores(scores, state.charts.regions?.[region.id] || [], CHART_SIZES.region, LABEL_SCORE_WEIGHTS.tracks.region);
    });
    addLabelScores(scores, state.promoCharts?.global || [], CHART_SIZES.global, LABEL_SCORE_WEIGHTS.promos.global);
    NATIONS.forEach((nation) => {
        addLabelScores(scores, state.promoCharts?.nations?.[nation] || [], CHART_SIZES.nation, LABEL_SCORE_WEIGHTS.promos.nation);
    });
    REGION_DEFS.forEach((region) => {
        addLabelScores(scores, state.promoCharts?.regions?.[region.id] || [], CHART_SIZES.region, LABEL_SCORE_WEIGHTS.promos.region);
    });
    addLabelScores(scores, state.tourCharts?.global || [], CHART_SIZES.global, LABEL_SCORE_WEIGHTS.tours.global);
    NATIONS.forEach((nation) => {
        addLabelScores(scores, state.tourCharts?.nations?.[nation] || [], CHART_SIZES.nation, LABEL_SCORE_WEIGHTS.tours.nation);
    });
    REGION_DEFS.forEach((region) => {
        addLabelScores(scores, state.tourCharts?.regions?.[region.id] || [], CHART_SIZES.region, LABEL_SCORE_WEIGHTS.tours.region);
    });
    return scores;
}
function resolveChartEntryAct(entry) {
    if (!entry) {
        return {
            actId: null,
            actName: "",
            actNameKey: null,
            label: "",
            country: "",
            isPlayer: false
        };
    }
    const base = entry.track || entry;
    const actId = entry.actId || base.actId || null;
    const actName = entry.actName || base.actName || "";
    const actNameKey = entry.actNameKey || base.actNameKey || null;
    const label = entry.label || base.label || "";
    const country = entry.country || base.country || "";
    const isPlayer = typeof entry.isPlayer === "boolean"
        ? entry.isPlayer
        : typeof base.isPlayer === "boolean"
            ? base.isPlayer
            : (label && state.label?.name ? label === state.label.name : false);
    return { actId, actName, actNameKey, label, country, isPlayer };
}
function actPopularityKey(info) {
    if (!info)
        return "";
    if (info.actId)
        return `act:${info.actId}`;
    if (info.actNameKey)
        return `actkey:${info.actNameKey}`;
    const name = info.actName ? String(info.actName).trim() : "";
    const label = info.label ? String(info.label).trim() : "";
    if (!name && !label)
        return "";
    return `actname:${name || "Unknown"}::${label || "Unknown"}`;
}
function ensureActPopularityLedger() {
    if (!state.meta)
        state.meta = makeDefaultState().meta;
    if (!state.meta.actPopularity || typeof state.meta.actPopularity !== "object") {
        state.meta.actPopularity = { years: {}, lastUpdateYear: null, lastUpdateWeek: null };
    }
    const ledger = state.meta.actPopularity;
    if (!ledger.years || typeof ledger.years !== "object")
        ledger.years = {};
    if (typeof ledger.lastUpdateYear !== "number")
        ledger.lastUpdateYear = null;
    if (typeof ledger.lastUpdateWeek !== "number")
        ledger.lastUpdateWeek = null;
    return ledger;
}
function ensureActPopularityYear(year) {
    const ledger = ensureActPopularityLedger();
    const key = String(year);
    if (!ledger.years[key] || typeof ledger.years[key] !== "object") {
        ledger.years[key] = { acts: {}, totalWeeks: 0 };
    }
    const entry = ledger.years[key];
    if (!entry.acts || typeof entry.acts !== "object")
        entry.acts = {};
    if (typeof entry.totalWeeks !== "number")
        entry.totalWeeks = 0;
    return entry;
}
function addActPopularityPoints(yearEntry, actInfo, points, kind, week, seen) {
    if (!yearEntry || !actInfo || !Number.isFinite(points) || points <= 0)
        return;
    const actKey = actPopularityKey(actInfo);
    if (!actKey)
        return;
    const fallbackName = actInfo.actName ? actInfo.actName : "Unknown Act";
    const fallbackNameKey = actInfo.actNameKey || null;
    const fallbackLabel = actInfo.label ? actInfo.label : "Unknown Label";
    const fallbackCountry = actInfo.country ? actInfo.country : "";
    let entry = yearEntry.acts[actKey];
    if (!entry) {
        entry = {
            actId: actInfo.actId || null,
            actName: fallbackName,
            actNameKey: fallbackNameKey,
            label: fallbackLabel,
            country: fallbackCountry,
            points: 0,
            trackPoints: 0,
            promoPoints: 0,
            tourPoints: 0,
            weeksActive: 0,
            lastWeek: null,
            isPlayer: !!actInfo.isPlayer
        };
        yearEntry.acts[actKey] = entry;
    }
    if (!entry.country && fallbackCountry)
        entry.country = fallbackCountry;
    if (!entry.actNameKey && fallbackNameKey)
        entry.actNameKey = fallbackNameKey;
    entry.points += points;
    if (kind === "tracks")
        entry.trackPoints += points;
    if (kind === "promos")
        entry.promoPoints += points;
    if (kind === "tours")
        entry.tourPoints += points;
    if (actInfo.isPlayer)
        entry.isPlayer = true;
    if (!seen.has(actKey)) {
        entry.weeksActive += 1;
        seen.add(actKey);
    }
    entry.lastWeek = week;
}
function addActPopularityFromEntries(yearEntry, entries, size, weight, kind, week, seen) {
    if (!Array.isArray(entries) || !entries.length || !Number.isFinite(weight) || weight <= 0)
        return;
    entries.forEach((entry, index) => {
        if (!entry)
            return;
        const rank = Number.isFinite(entry.rank) ? entry.rank : index + 1;
        const points = Math.max(1, size + 1 - rank) * weight;
        const actInfo = resolveChartEntryAct(entry);
        addActPopularityPoints(yearEntry, actInfo, points, kind, week, seen);
    });
}
function updateActPopularityLedger({ year = currentYear(), week = weekIndex() + 1 } = {}) {
    if (!Number.isFinite(year) || !Number.isFinite(week))
        return;
    const ledger = ensureActPopularityLedger();
    if (ledger.lastUpdateYear === year && ledger.lastUpdateWeek === week)
        return;
    const yearEntry = ensureActPopularityYear(year);
    const seen = new Set();
    addActPopularityFromEntries(yearEntry, state.charts.global || [], CHART_SIZES.global, ACT_POPULARITY_WEIGHTS.tracks.global, "tracks", week, seen);
    NATIONS.forEach((nation) => {
        addActPopularityFromEntries(yearEntry, state.charts.nations?.[nation] || [], CHART_SIZES.nation, ACT_POPULARITY_WEIGHTS.tracks.nation, "tracks", week, seen);
    });
    REGION_DEFS.forEach((region) => {
        addActPopularityFromEntries(yearEntry, state.charts.regions?.[region.id] || [], CHART_SIZES.region, ACT_POPULARITY_WEIGHTS.tracks.region, "tracks", week, seen);
    });
    addActPopularityFromEntries(yearEntry, state.promoCharts?.global || [], CHART_SIZES.global, ACT_POPULARITY_WEIGHTS.promos.global, "promos", week, seen);
    NATIONS.forEach((nation) => {
        addActPopularityFromEntries(yearEntry, state.promoCharts?.nations?.[nation] || [], CHART_SIZES.nation, ACT_POPULARITY_WEIGHTS.promos.nation, "promos", week, seen);
    });
    REGION_DEFS.forEach((region) => {
        addActPopularityFromEntries(yearEntry, state.promoCharts?.regions?.[region.id] || [], CHART_SIZES.region, ACT_POPULARITY_WEIGHTS.promos.region, "promos", week, seen);
    });
    addActPopularityFromEntries(yearEntry, state.tourCharts?.global || [], CHART_SIZES.global, ACT_POPULARITY_WEIGHTS.tours.global, "tours", week, seen);
    NATIONS.forEach((nation) => {
        addActPopularityFromEntries(yearEntry, state.tourCharts?.nations?.[nation] || [], CHART_SIZES.nation, ACT_POPULARITY_WEIGHTS.tours.nation, "tours", week, seen);
    });
    REGION_DEFS.forEach((region) => {
        addActPopularityFromEntries(yearEntry, state.tourCharts?.regions?.[region.id] || [], CHART_SIZES.region, ACT_POPULARITY_WEIGHTS.tours.region, "tours", week, seen);
    });
    yearEntry.totalWeeks = Math.max(yearEntry.totalWeeks, week);
    ledger.lastUpdateYear = year;
    ledger.lastUpdateWeek = week;
}
function getActPopularityLeaderboard(year = currentYear()) {
    const ledger = ensureActPopularityLedger();
    const yearEntry = ledger.years?.[String(year)];
    if (!yearEntry)
        return { year, entries: [], totalWeeks: 0 };
    const entries = Object.values(yearEntry.acts || {});
    entries.sort((a, b) => {
        const diff = (b.points || 0) - (a.points || 0);
        if (diff !== 0)
            return diff;
        return String(a.actName || "").localeCompare(String(b.actName || ""));
    });
    return { year, entries, totalWeeks: yearEntry.totalWeeks || 0 };
}
function updateCumulativeLabelPoints(scores) {
    Object.entries(scores).forEach(([label, points]) => {
        state.meta.cumulativeLabelPoints[label] = (state.meta.cumulativeLabelPoints[label] || 0) + points;
    });
}
function updateRivalMomentum(scores, competition = ensureLabelCompetitionMap()) {
    state.rivals.forEach((rival) => {
        const points = scores[rival.name] || 0;
        const momentum = clamp(0.4 + points / (CHART_SIZES.global * 1.5), 0.35, 0.9);
        const competitionMultiplier = Number.isFinite(competition?.[rival.name]) ? competition[rival.name] : 1;
        const bonus = typeof rival.seedBonus === "number" ? rival.seedBonus : 0;
        rival.momentum = clamp(momentum * competitionMultiplier + bonus, 0.35, 0.95);
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
        if (!rival.economy || typeof rival.economy !== "object") {
            rival.economy = { lastRevenue: 0, lastUpkeep: 0, lastWeek: 0, lastLeaseFees: 0 };
        }
        rival.economy.lastLeaseFees = 0;
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
        const leaseFees = Math.round(affordableLeased * costPerSlotWeek);
        rival.economy.lastLeaseFees = leaseFees;
        rival.cash = Math.round(cash - leaseFees);
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
function monopolyChartLabel(scopeKey, contentType) {
    const scopeLabel = chartScopeLabel(scopeKey);
    const typeLabel = contentType === "promotions" ? "Promotions" : contentType === "tours" ? "Tours" : "Tracks";
    return `${scopeLabel} ${typeLabel} chart`;
}
function detectChartMonopoly(entries, size) {
    if (!Array.isArray(entries) || entries.length < size)
        return null;
    let label = "";
    for (let i = 0; i < entries.length; i += 1) {
        const entryLabel = resolveChartEntryLabel(entries[i]);
        if (!entryLabel)
            return null;
        if (!label) {
            label = entryLabel;
            continue;
        }
        if (entryLabel !== label)
            return null;
    }
    return label || null;
}
function findChartMonopoly() {
    const checks = [];
    checks.push({ entries: state.charts.global, size: CHART_SIZES.global, scope: "global", type: "tracks" });
    NATIONS.forEach((nation) => {
        checks.push({ entries: state.charts.nations?.[nation] || [], size: CHART_SIZES.nation, scope: nation, type: "tracks" });
    });
    REGION_DEFS.forEach((region) => {
        checks.push({ entries: state.charts.regions?.[region.id] || [], size: CHART_SIZES.region, scope: region.id, type: "tracks" });
    });
    checks.push({ entries: state.promoCharts?.global || [], size: CHART_SIZES.global, scope: "global", type: "promotions" });
    NATIONS.forEach((nation) => {
        checks.push({ entries: state.promoCharts?.nations?.[nation] || [], size: CHART_SIZES.nation, scope: nation, type: "promotions" });
    });
    REGION_DEFS.forEach((region) => {
        checks.push({ entries: state.promoCharts?.regions?.[region.id] || [], size: CHART_SIZES.region, scope: region.id, type: "promotions" });
    });
    checks.push({ entries: state.tourCharts?.global || [], size: CHART_SIZES.global, scope: "global", type: "tours" });
    NATIONS.forEach((nation) => {
        checks.push({ entries: state.tourCharts?.nations?.[nation] || [], size: CHART_SIZES.nation, scope: nation, type: "tours" });
    });
    REGION_DEFS.forEach((region) => {
        checks.push({ entries: state.tourCharts?.regions?.[region.id] || [], size: CHART_SIZES.region, scope: region.id, type: "tours" });
    });
    for (let i = 0; i < checks.length; i += 1) {
        const check = checks[i];
        const label = detectChartMonopoly(check.entries, check.size);
        if (label) {
            return { label, chart: monopolyChartLabel(check.scope, check.type) };
        }
    }
    return null;
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
function rivalAchievementCount(rival) {
    if (!rival)
        return 0;
    const unlocked = Array.isArray(rival.achievementsUnlocked) ? rival.achievementsUnlocked.length : 0;
    return Math.max(unlocked, rival.achievements || 0);
}
function findRivalAchievementWinner() {
    if (!Array.isArray(state.rivals))
        return null;
    const contenders = state.rivals
        .map((rival) => ({ rival, count: rivalAchievementCount(rival) }))
        .filter((entry) => entry.count >= ACHIEVEMENT_TARGET);
    if (!contenders.length)
        return null;
    contenders.sort((a, b) => b.count - a.count || String(a.rival.name || "").localeCompare(String(b.rival.name || "")));
    const winner = contenders[0].rival;
    return { label: winner?.name || "Rival label", count: contenders[0].count };
}
function checkWinLoss(scores) {
    if (state.meta.gameOver)
        return;
    const year = currentYear();
    const achievements = Math.max(state.meta.achievementsUnlocked.length, state.meta.achievements || 0);
    const monopoly = findChartMonopoly();
    if (monopoly) {
        logEvent(`Monopoly rule triggered: ${monopoly.label} occupies the ${monopoly.chart}.`, "warn");
        finalizeGame("loss", `Monopoly rule: ${monopoly.label} occupies the ${monopoly.chart}.`);
        return;
    }
    if (year < 3000) {
        if (!state.meta.winState && achievements >= ACHIEVEMENT_TARGET) {
            announceWin("Completed 12 CEO Requests without monopoly.");
        }
    }
    else if (year < 4000) {
        if (!state.meta.winState && achievements >= ACHIEVEMENT_TARGET) {
            announceWin("Completed 12 CEO Requests.");
        }
    }
    if (!state.meta.winState) {
        const rivalWinner = findRivalAchievementWinner();
        if (rivalWinner) {
            logEvent(`${rivalWinner.label} completed ${ACHIEVEMENT_TARGET} CEO Requests before you.`, "warn");
            finalizeGame("loss", `${rivalWinner.label} completed ${ACHIEVEMENT_TARGET} CEO Requests before you.`);
            return;
        }
    }
    if (year >= 4000) {
        const currentTop = topLabelFromScores(scores).label;
        const cumulativeTop = topCumulativeLabel().label;
        const victory = Boolean(state.meta.winState)
            || currentTop === state.label.name || cumulativeTop === state.label.name;
        finalizeGame(victory ? "win" : "loss", victory ? "Final Year 4000 verdict." : "Not #1 at Year 4000.");
    }
}
const QUEST_FOCUS_REQUESTS = {
    tracks: ["REQ-01", "REQ-02", "REQ-03"],
    projects: ["REQ-04", "REQ-05", "REQ-06"],
    promos: ["REQ-07", "REQ-08", "REQ-09"],
    tours: ["REQ-10", "REQ-11", "REQ-12"]
};
function questFocusRequests(group) {
    const list = QUEST_FOCUS_REQUESTS[group];
    return Array.isArray(list) ? list.slice() : [];
}
function countReleasedProjects(projectType) {
    const targetType = projectType ? normalizeProjectType(projectType) : null;
    const keys = new Set();
    state.tracks.forEach((track) => {
        if (track.status !== "Released")
            return;
        const type = normalizeProjectType(track.projectType || "Single");
        if (targetType && type !== targetType)
            return;
        const name = normalizeProjectName(track.projectName || `${track.title || "Unknown"} - Single`);
        keys.add(`${name}::${type}`);
    });
    return keys.size;
}
function countPlayerTourBookings() {
    const bookings = Array.isArray(state.touring?.bookings) ? state.touring.bookings : [];
    const label = state.label?.name || "";
    return bookings.filter((booking) => booking?.label === label).length;
}
function pickQuestChartScope() {
    const roll = Math.random();
    if (roll < 0.65)
        return { scopeType: "global", scopeTarget: "global" };
    const labelNation = NATIONS.includes(state.label?.country) ? state.label.country : NATIONS[0];
    return { scopeType: "nation", scopeTarget: labelNation || "Annglora" };
}
function questChartTarget(scopeType, week) {
    if (scopeType === "nation") {
        if (week < 80)
            return 10;
        if (week < 200)
            return 5;
        return 3;
    }
    if (week < 80)
        return 20;
    if (week < 200)
        return 10;
    return 5;
}
function questChartEntries(scopeType, scopeTarget) {
    if (scopeType === "nation")
        return state.charts.nations?.[scopeTarget] || [];
    if (scopeType === "region")
        return state.charts.regions?.[scopeTarget] || [];
    return state.charts.global || [];
}
function isPlayerChartEntry(entry) {
    if (!entry)
        return false;
    if (entry.track?.isPlayer || entry.isPlayer)
        return true;
    const label = resolveChartEntryLabel(entry);
    return Boolean(label && label === state.label?.name);
}
function bestPlayerChartRank(entries) {
    const ranks = (entries || [])
        .filter((entry) => isPlayerChartEntry(entry))
        .map((entry) => entry.rank)
        .filter((rank) => Number.isFinite(rank));
    return ranks.length ? Math.min(...ranks) : null;
}
function pickQuestTemplate(pool, usedGroups = [], usedTypes = []) {
    if (!pool.length)
        return null;
    const unlocked = new Set(state.meta?.achievementsUnlocked || []);
    const remaining = pool.filter((template) => !usedTypes.includes(template.type));
    const withoutGroup = remaining.filter((template) => !usedGroups.includes(template.focusGroup));
    const supportsLocked = (template) => (template.focusRequests || []).some((id) => !unlocked.has(id));
    const preferred = withoutGroup.filter(supportsLocked);
    const fallbackGroup = withoutGroup.length ? withoutGroup : remaining;
    const fallbackPreferred = fallbackGroup.filter(supportsLocked);
    const finalPool = preferred.length ? preferred : (fallbackPreferred.length ? fallbackPreferred : fallbackGroup);
    return finalPool.length ? pickOne(finalPool) : pickOne(pool);
}
function nextQuestId() {
    state.meta.questIdCounter += 1;
    return `CEO-${String(state.meta.questIdCounter).padStart(2, "0")}`;
}
function makeQuest(template) {
    const week = weekIndex() + 1;
    const quest = template.build(week);
    quest.id = nextQuestId();
    quest.type = template.type || quest.type;
    quest.focusGroup = template.focusGroup || quest.focusGroup || null;
    if (!Array.isArray(quest.focusRequests)) {
        quest.focusRequests = Array.isArray(template.focusRequests) ? template.focusRequests.slice() : [];
    }
    if (!Number.isFinite(quest.createdAt))
        quest.createdAt = state.time.epochMs;
    if (typeof quest.done !== "boolean")
        quest.done = false;
    if (typeof quest.rewarded !== "boolean")
        quest.rewarded = false;
    return quest;
}
function questTemplates() {
    const hasReleasedTracks = state.tracks.some((track) => track.status === "Released");
    const hasActiveEra = getActiveEras().some((entry) => entry.status === "Active");
    const templates = [
        {
            type: "releaseCount",
            focusGroup: "tracks",
            focusRequests: questFocusRequests("tracks"),
            build: (week) => {
                const target = clamp(2 + Math.floor(week / 4), 2, 8);
                const startCount = state.tracks.filter((track) => track.status === "Released").length;
                return {
                    target,
                    progress: 0,
                    startCount,
                    reward: 1500 + target * 650,
                    expReward: 300 + target * 40,
                    story: "CEO Directive: ship new tracks to build chart momentum.",
                    text: `Release ${target} tracks this cycle`
                };
            }
        },
        {
            type: "trendRelease",
            focusGroup: "tracks",
            focusRequests: questFocusRequests("tracks"),
            build: () => {
                const genre = state.trends.length ? pickOne(state.trends) : makeGenre(pickOne(THEMES), pickOne(MOODS));
                return {
                    target: 1,
                    progress: 0,
                    genre,
                    createdAt: state.time.epochMs,
                    reward: 3200,
                    expReward: 420,
                    story: `Gaia tip: deliver a ${formatGenreKeyLabel(genre)} track to steer the week.`,
                    text: `Release 1 track in ${formatGenreKeyLabel(genre)}`
                };
            }
        },
        {
            type: "chartTop",
            focusGroup: "tracks",
            focusRequests: questFocusRequests("tracks"),
            build: (week) => {
                const { scopeType, scopeTarget } = pickQuestChartScope();
                const target = questChartTarget(scopeType, week);
                const scopeLabel = formatScopeLabel(scopeType, scopeTarget);
                const reward = target <= 5 ? 5200 : target <= 10 ? 4200 : 3200;
                const expReward = target <= 5 ? 520 : target <= 10 ? 460 : 420;
                return {
                    scopeType,
                    scopeTarget,
                    target,
                    bestRank: null,
                    reward,
                    expReward,
                    story: `CEO Directive: climb ${scopeLabel} charts to pressure yearly awards.`,
                    text: `Land a track in ${scopeLabel} Top ${target}`
                };
            }
        },
        {
            type: "projectRelease",
            focusGroup: "projects",
            focusRequests: questFocusRequests("projects"),
            build: (week) => {
                const options = week < 12 ? ["Single", "EP"] : ["EP", "Album"];
                const projectType = pickOne(options);
                const target = 1;
                const startCount = countReleasedProjects(projectType);
                return {
                    projectType,
                    target,
                    progress: 0,
                    startCount,
                    reward: 3600,
                    expReward: 440,
                    story: "CEO Directive: map a project arc to win project awards.",
                    text: `Release a ${projectType} project`
                };
            }
        },
        {
            type: "promoRuns",
            focusGroup: "promos",
            focusRequests: questFocusRequests("promos"),
            isAvailable: () => hasReleasedTracks,
            build: (week) => {
                const target = clamp(1 + Math.floor(week / 10), 1, 4);
                const startCount = Math.max(0, Math.round(state.meta?.promoRuns || 0));
                return {
                    target,
                    progress: 0,
                    startCount,
                    reward: 2400 + target * 420,
                    expReward: 360 + target * 40,
                    story: "CEO Directive: flood the feeds to earn promo awards.",
                    text: `Launch ${target} promo campaign${target === 1 ? "" : "s"}`
                };
            }
        },
        {
            type: "tourBookings",
            focusGroup: "tours",
            focusRequests: questFocusRequests("tours"),
            isAvailable: () => hasReleasedTracks && hasActiveEra,
            build: (week) => {
                const target = clamp(1 + Math.floor(week / 16), 1, 4);
                const startCount = countPlayerTourBookings();
                return {
                    target,
                    progress: 0,
                    startCount,
                    reward: 3000 + target * 500,
                    expReward: 420 + target * 40,
                    story: "CEO Directive: lock tour dates to chase touring awards.",
                    text: `Book ${target} tour date${target === 1 ? "" : "s"}`
                };
            }
        }
    ];
    return templates.filter((template) => !template.isAvailable || template.isAvailable());
}
function buildQuests() {
    const pool = questTemplates();
    if (!pool.length) {
        logEvent("Quest pool is empty; no quests generated.", "warn");
        return [];
    }
    const targetCount = Math.min(3, pool.length);
    const quests = [];
    const usedGroups = [];
    const usedTypes = [];
    let attempts = 0;
    while (quests.length < targetCount && attempts < 12) {
        const template = pickQuestTemplate(pool, usedGroups, usedTypes);
        if (!template)
            break;
        quests.push(makeQuest(template));
        usedGroups.push(template.focusGroup);
        usedTypes.push(template.type);
        attempts += 1;
    }
    if (quests.length < targetCount) {
        logEvent(`Quest pool shortfall: ${quests.length}/${targetCount} quests seeded.`, "warn");
    }
    return quests;
}
function updateQuests() {
    if (state.meta?.cheaterMode)
        return;
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
            const bestRank = bestPlayerChartRank(entries);
            quest.bestRank = bestRank !== null ? bestRank : quest.bestRank;
            quest.done = quest.bestRank !== null && quest.bestRank <= quest.target;
        }
        if (quest.type === "chartTop") {
            const scopeType = quest.scopeType || "global";
            const scopeTarget = quest.scopeTarget || "global";
            const entries = questChartEntries(scopeType, scopeTarget);
            const bestRank = bestPlayerChartRank(entries);
            quest.bestRank = bestRank !== null ? bestRank : quest.bestRank;
            quest.done = quest.bestRank !== null && quest.bestRank <= quest.target;
        }
        if (quest.type === "projectRelease") {
            const current = countReleasedProjects(quest.projectType);
            quest.progress = current - (quest.startCount || 0);
            quest.done = quest.progress >= quest.target;
        }
        if (quest.type === "promoRuns") {
            const current = Math.max(0, Math.round(state.meta?.promoRuns || 0));
            quest.progress = current - (quest.startCount || 0);
            quest.done = quest.progress >= quest.target;
        }
        if (quest.type === "tourBookings") {
            const current = countPlayerTourBookings();
            quest.progress = current - (quest.startCount || 0);
            quest.done = quest.progress >= quest.target;
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
            logEvent(`Task complete: ${quest.id}. Reward +${formatMoney(quest.reward)} and ${expGain} EXP.`);
            postQuestComplete(quest);
        }
    });
}
function refreshQuestPool() {
    if (state.meta?.cheaterMode)
        return;
    const active = state.quests.filter((quest) => !quest.done);
    const pool = questTemplates();
    if (!pool.length) {
        logEvent("Quest pool is empty; no quests refreshed.", "warn");
        return;
    }
    const newQuests = [];
    const targetCount = Math.min(3, pool.length);
    const usedGroups = active.map((quest) => quest.focusGroup).filter(Boolean);
    const usedTypes = active.map((quest) => quest.type).filter(Boolean);
    let attempts = 0;
    while (active.length < targetCount && attempts < 12) {
        const template = pickQuestTemplate(pool, usedGroups, usedTypes);
        if (!template)
            break;
        const quest = makeQuest(template);
        active.push(quest);
        newQuests.push(quest);
        usedGroups.push(template.focusGroup);
        usedTypes.push(template.type);
        attempts += 1;
    }
    if (active.length < targetCount) {
        logEvent(`Quest pool shortfall: ${active.length}/${targetCount} quests active.`, "warn");
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
const DEFAULT_HUSK_STARTERS = [
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
const HUSK_STARTERS = Array.isArray(ROLLOUT_STRATEGY_TEMPLATES) && ROLLOUT_STRATEGY_TEMPLATES.length
    ? ROLLOUT_STRATEGY_TEMPLATES.map((template) => ({
        ...template,
        source: template?.source || "starter"
    }))
    : DEFAULT_HUSK_STARTERS;
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
    const focusTrendBias = ["REQ-01", "REQ-02", "REQ-03", "REQ-07"].includes(rival?.achievementFocus);
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
            const wantsTrend = focusTrendBias && rng() < 0.75;
            if (trendTheme && trendMood && (wantsTrend || rivalHasTrendCoverage(rival, trendTheme, trendMood) || rng() < 0.45)) {
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
    const ambition = clamp(rival.ambition ?? RIVAL_AMBITION_FLOOR, 0, 1);
    const outcomeBoost = Math.round((normalizeHuskContext(husk).outcomeScore - 50) / 10);
    const ambitionBoost = Math.round(ambition * RIVAL_AMBITION_QUALITY_BOOST);
    const focusBoost = rival.achievementFocus === "REQ-04" ? 4 : 0;
    let quality = clampQuality(seededRand(55, 92, rng) + Math.round(momentum * 8) + outcomeBoost + ambitionBoost + focusBoost);
    if (mood === "Boring")
        quality = clampQuality(quality - 12);
    const genre = makeGenre(theme, mood);
    const releasePlan = recommendReleasePlan({ genre, quality });
    const crew = pickRivalReleaseCrew(rival, theme, mood);
    const projectType = normalizeProjectType("Single");
    const actKind = crew.length > 1 ? "group" : "solo";
    const rivalAct = makeRivalActNameEntry({ rng, nation: rival.country, actKind });
    return {
        id: uid("RR"),
        queueType: "release",
        huskId: husk.id,
        huskSource: husk.source,
        planWeek,
        releaseAt,
        title: makeTrackTitleByCountrySeeded(theme, mood, rival.country, rng),
        label: rival.name,
        actName: rivalAct.name,
        actNameKey: rivalAct.nameKey,
        projectName: makeProjectTitleSeeded(rng),
        projectType,
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
        actNameKey: null,
        label: rival.name,
        promoType,
        promoSeed: rng()
    };
}
function promoFacilityCapacityForEpochMs(facilityId, epochMs) {
    const window = resolvePromoTimeframeWindow(epochMs, { allowFuture: false });
    if (!window?.timeframe)
        return 0;
    return promoFacilityCapacityForTimeframe(facilityId, window.timeframe.id);
}
function countScheduledPromoEventsForFacility(facilityId, epochMs) {
    if (!facilityId)
        return 0;
    const window = resolvePromoTimeframeWindow(epochMs, { allowFuture: false });
    if (!window?.timeframe)
        return 0;
    const dayStart = startOfDayEpochMs(window.startsAt);
    const timeframeId = window.timeframe.id;
    const rivalCount = state.rivalReleaseQueue.filter((entry) => {
        if ((entry.queueType || "release") !== "promo")
            return false;
        if (getPromoFacilityForType(entry.promoType) !== facilityId)
            return false;
        if (!Number.isFinite(entry.releaseAt))
            return false;
        const entryWindow = resolvePromoTimeframeWindow(entry.releaseAt, { allowFuture: false });
        if (!entryWindow?.timeframe)
            return false;
        if (entryWindow.timeframe.id !== timeframeId)
            return false;
        return startOfDayEpochMs(entry.releaseAt) === dayStart;
    }).length;
    const labelCount = Array.isArray(state.scheduledEvents)
        ? state.scheduledEvents.filter((entry) => {
            if (entry.status === "Cancelled")
                return false;
            if (entry.facilityId !== facilityId)
                return false;
            if (!Number.isFinite(entry.scheduledAt))
                return false;
            const entryWindow = resolvePromoTimeframeWindow(entry.scheduledAt, { allowFuture: false });
            if (!entryWindow?.timeframe)
                return false;
            if (entryWindow.timeframe.id !== timeframeId)
                return false;
            return startOfDayEpochMs(entry.scheduledAt) === dayStart;
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
function buildRivalReleaseBudget(rival) {
    const walletCash = rival?.wallet?.cash ?? rival?.cash ?? 0;
    const pct = rivalCreateBudgetPct(rival);
    const minCash = rivalCreateMinCash();
    const budgetCap = computeAutoCreateBudget(walletCash, pct, minCash);
    return {
        budgetCap,
        spent: 0,
        minCash,
        pct,
        blockedReason: ""
    };
}
function spendRivalReleaseBudget(rival, budget, dropCost) {
    if (!budget)
        return { ok: true };
    const cost = Number.isFinite(dropCost) ? Math.max(0, dropCost) : 0;
    if (!cost)
        return { ok: false, reason: "drop cost is 0." };
    const budgetLeft = budget.budgetCap - budget.spent;
    if (cost > budgetLeft) {
        return { ok: false, reason: `budget cap ${formatMoney(budgetLeft)} below drop cost ${formatMoney(cost)}.` };
    }
    if (rival.cash - cost < budget.minCash) {
        return { ok: false, reason: `cash reserve ${formatMoney(budget.minCash)} blocks drop cost ${formatMoney(cost)}.` };
    }
    rival.cash = Math.round(rival.cash - cost);
    if (!rival.wallet)
        rival.wallet = { cash: rival.cash };
    rival.wallet.cash = rival.cash;
    budget.spent += cost;
    return { ok: true };
}
function rivalReleaseCrewCapacity(rival) {
    if (!rival || !Array.isArray(rival.creators) || !rival.creators.length)
        return 0;
    const counts = MARKET_ROLES.map((role) => rival.creators.filter((creator) => creator.role === role).length);
    const minCount = counts.length ? Math.min(...counts) : 0;
    if (!Number.isFinite(minCount) || minCount <= 0)
        return 0;
    const ambition = clamp(rival.ambition ?? RIVAL_AMBITION_FLOOR, 0, 1);
    const multiplier = 1 + Math.max(0, ambition - RIVAL_AMBITION_FLOOR) * 0.4;
    return Math.max(1, Math.floor(minCount * multiplier));
}
function scheduleHuskForRival(rival, husk, options = {}) {
    if (!husk)
        return null;
    const steps = normalizeHuskCadence(husk.cadence);
    if (!steps.length)
        return null;
    const now = state.time.epochMs;
    const walletCash = rival.wallet?.cash ?? rival.cash ?? 0;
    const promoBudget = computeAutoPromoBudget(walletCash, AI_PROMO_BUDGET_PCT);
    const promoBudgetSlots = promoBudget ? Math.floor(walletCash / promoBudget) : 0;
    let promoScheduled = 0;
    const budget = options.budget || null;
    const releaseCost = Number.isFinite(options.releaseCost) ? options.releaseCost : RIVAL_COMPETE_DROP_COST;
    const stats = { releases: 0, promos: 0, blockedReason: "" };
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
            const spendResult = spendRivalReleaseBudget(rival, budget, releaseCost);
            if (!spendResult.ok) {
                if (!stats.blockedReason)
                    stats.blockedReason = spendResult.reason || "release budget blocked.";
                if (budget && !budget.blockedReason)
                    budget.blockedReason = stats.blockedReason;
                return;
            }
            state.rivalReleaseQueue.push(planRivalReleaseEntry({
                rival,
                husk,
                releaseAt,
                stepIndex: index,
                planWeek
            }));
            stats.releases += 1;
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
        stats.promos += 1;
    });
    return stats;
}
function shouldRivalPursueMonopoly(rival) {
    if (!rival || !rival.aiPlan?.competitive)
        return false;
    const focus = rival.achievementFocus;
    if (["REQ-01", "REQ-02", "REQ-03"].includes(focus))
        return true;
    const ambition = clamp(rival.ambition ?? RIVAL_AMBITION_FLOOR, 0, 1);
    return ambition >= 0.75;
}
function chartEntriesForScope(scopeType, scopeKey) {
    if (!state.charts)
        return [];
    if (scopeType === "global")
        return state.charts.global || [];
    if (scopeType === "nation")
        return state.charts.nations?.[scopeKey] || [];
    if (scopeType === "region")
        return state.charts.regions?.[scopeKey] || [];
    return [];
}
function countLabelEntries(entries, labelName) {
    if (!labelName || !Array.isArray(entries))
        return 0;
    return entries.filter((entry) => resolveChartEntryLabel(entry) === labelName).length;
}
function countRivalQueuedReleases(labelName, targetWeekIndex) {
    if (!labelName || !Number.isFinite(targetWeekIndex))
        return 0;
    return state.rivalReleaseQueue.filter((entry) => {
        if (!entry || entry.label !== labelName)
            return false;
        const kind = entry.queueType || "release";
        if (kind !== "release")
            return false;
        if (!Number.isFinite(entry.releaseAt))
            return false;
        return weekIndexForEpochMs(entry.releaseAt) === targetWeekIndex;
    }).length;
}
function pickRivalDominanceRegion(rival) {
    const nation = NATIONS.includes(rival?.country) ? rival.country : NATIONS[0];
    const regions = REGION_DEFS.filter((region) => region.nation === nation);
    if (!regions.length)
        return null;
    if (rival?.aiPlan?.dominanceScopeType === "region") {
        const existing = regions.find((region) => region.id === rival.aiPlan.dominanceScopeKey);
        if (existing)
            return existing;
    }
    const scored = regions.map((region) => {
        const entries = state.charts.regions?.[region.id] || [];
        return { region, count: countLabelEntries(entries, rival.name) };
    });
    scored.sort((a, b) => b.count - a.count);
    return scored[0]?.region || null;
}
function selectRivalDominanceTarget(rival) {
    if (!rival)
        return null;
    const focus = rival.achievementFocus;
    if (focus === "REQ-01") {
        return { scopeType: "global", scopeKey: "global", size: CHART_SIZES.global };
    }
    if (focus === "REQ-02") {
        const nation = NATIONS.includes(rival.country) ? rival.country : NATIONS[0];
        return { scopeType: "nation", scopeKey: nation, size: CHART_SIZES.nation };
    }
    if (focus === "REQ-03") {
        const region = pickRivalDominanceRegion(rival);
        if (region)
            return { scopeType: "region", scopeKey: region.id, size: CHART_SIZES.region };
    }
    const region = pickRivalDominanceRegion(rival);
    if (region)
        return { scopeType: "region", scopeKey: region.id, size: CHART_SIZES.region };
    const nation = NATIONS.includes(rival.country) ? rival.country : NATIONS[0];
    return { scopeType: "nation", scopeKey: nation, size: CHART_SIZES.nation };
}
function scheduleRivalDominancePush(rival, husk, options = {}) {
    if (!rival || !husk)
        return { releases: 0, target: null, reason: "no rival/husk." };
    const target = options.target || selectRivalDominanceTarget(rival);
    if (!target)
        return { releases: 0, target: null, reason: "no target scope." };
    const budget = options.budget || null;
    if (!budget || budget.budgetCap <= 0) {
        return { releases: 0, target, reason: "release budget is 0." };
    }
    const targetWeekIndex = Number.isFinite(options.targetWeekIndex)
        ? options.targetWeekIndex
        : getRivalPlanStartWeekIndex(state.time.epochMs);
    const chartCount = countLabelEntries(chartEntriesForScope(target.scopeType, target.scopeKey), rival.name);
    const queuedCount = countRivalQueuedReleases(rival.name, targetWeekIndex);
    const needed = Math.max(0, target.size - chartCount - queuedCount);
    if (!needed)
        return { releases: 0, target, reason: "chart coverage met." };
    const crewCap = rivalReleaseCrewCapacity(rival);
    if (!crewCap)
        return { releases: 0, target, reason: "no release crew capacity." };
    const releaseCost = Number.isFinite(options.releaseCost) ? options.releaseCost : RIVAL_COMPETE_DROP_COST;
    const budgetLeft = budget.budgetCap - budget.spent;
    const maxByBudget = releaseCost > 0 ? Math.floor(budgetLeft / releaseCost) : 0;
    const maxDrops = Math.min(needed, crewCap, maxByBudget);
    if (!maxDrops)
        return { releases: 0, target, reason: "release budget blocked." };
    const planWeek = Number.isFinite(options.planWeek) ? options.planWeek : weekIndex();
    const stepBase = Number.isFinite(options.stepOffset) ? options.stepOffset : 0;
    const releaseAt = rolloutReleaseTimestampForWeek(targetWeekIndex + 1);
    if (releaseAt <= state.time.epochMs) {
        return { releases: 0, target, reason: "release window already passed." };
    }
    let added = 0;
    let blockedReason = "";
    for (let i = 0; i < maxDrops; i += 1) {
        const spendResult = spendRivalReleaseBudget(rival, budget, releaseCost);
        if (!spendResult.ok) {
            blockedReason = spendResult.reason || "release budget blocked.";
            break;
        }
        state.rivalReleaseQueue.push(planRivalReleaseEntry({
            rival,
            husk,
            releaseAt,
            stepIndex: stepBase + i,
            planWeek
        }));
        added += 1;
    }
    if (added && rival.aiPlan) {
        rival.aiPlan.dominanceScopeType = target.scopeType;
        rival.aiPlan.dominanceScopeKey = target.scopeKey;
        rival.aiPlan.dominanceWeekIndex = targetWeekIndex;
    }
    return { releases: added, target, reason: blockedReason };
}
function generateRivalReleases() {
    if (!Array.isArray(state.rivals) || !state.rivals.length)
        return;
    const huskLibrary = buildHuskLibrary();
    const fallbackHusk = HUSK_STARTERS[0] || null;
    const currentWeek = weekIndex();
    let plannedThisWeek = false;
    let eligibleCount = 0;
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
                lastCompletedWindow: null,
                dominanceScopeType: null,
                dominanceScopeKey: null,
                dominanceWeekIndex: null,
                competitive: false
            };
        }
        if (rival.aiPlan.lastPlannedWeek === currentWeek)
            return;
        plannedThisWeek = true;
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
        if (!eligible) {
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
        eligibleCount += 1;
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
        const budget = buildRivalReleaseBudget(rival);
        const planWeek = Number.isFinite(planWeekIndex) ? planWeekIndex : currentWeek;
        const startWeekIndex = Number.isFinite(planWeekIndex)
            ? planWeekIndex
            : getRivalPlanStartWeekIndex(state.time.epochMs);
        const scheduleStats = scheduleHuskForRival(rival, husk, {
            planWeek,
            startWeekIndex,
            endWeekIndex: planEndWeekIndex,
            allowPromo: eligible,
            budget,
            releaseCost: RIVAL_COMPETE_DROP_COST
        });
        if (scheduleStats?.blockedReason && !scheduleStats.releases && rival.aiPlan.competitive) {
            logEvent(`${rival.name} release plan paused: ${scheduleStats.blockedReason}`, "warn");
        }
        if (shouldRivalPursueMonopoly(rival)) {
            const priorWeek = rival.aiPlan.dominanceWeekIndex;
            const priorScope = rival.aiPlan.dominanceScopeKey;
            const priorType = rival.aiPlan.dominanceScopeType;
            const dominanceStats = scheduleRivalDominancePush(rival, husk, {
                planWeek,
                targetWeekIndex: startWeekIndex,
                budget,
                releaseCost: RIVAL_COMPETE_DROP_COST,
                stepOffset: scheduleStats?.releases || 0
            });
            if (dominanceStats?.releases) {
                const scopeKey = dominanceStats.target?.scopeType === "global"
                    ? "global"
                    : dominanceStats.target?.scopeKey;
                const scopeLabel = scopeKey ? chartScopeLabel(scopeKey) : "chart";
                const scopeChanged = priorWeek !== rival.aiPlan.dominanceWeekIndex
                    || priorScope !== rival.aiPlan.dominanceScopeKey
                    || priorType !== rival.aiPlan.dominanceScopeType;
                if (scopeChanged) {
                    logEvent(`${rival.name} queued ${dominanceStats.releases} dominance drops for the ${scopeLabel} chart.`);
                }
            }
        }
    });
    if (plannedThisWeek && eligibleCount === 0) {
        logEvent("Rival rollout skipped: no labels passed the budget gate this week.", "warn");
    }
}
function collectRivalProjectMarkets(rival, anchorMarket) {
    if (!rival || !anchorMarket)
        return [];
    const projectName = anchorMarket.projectName || "";
    if (!projectName)
        return [anchorMarket];
    const key = normalizeProjectName(projectName);
    const matches = state.marketTracks.filter((entry) => {
        if (!entry || entry.label !== rival.name)
            return false;
        return normalizeProjectName(entry.projectName || "") === key;
    });
    return matches.length ? matches : [anchorMarket];
}
function processRivalPromoEntry(entry) {
    const rival = getRivalByName(entry.label);
    if (!rival)
        return false;
    const promoType = entry.promoType || AUTO_PROMO_RIVAL_TYPE;
    const market = pickRivalAutoPromoTrack(rival);
    if (!market || (market.promoWeeks || 0) > 0)
        return false;
    const projectMarkets = collectRivalProjectMarkets(rival, market);
    const isProjectPromo = projectMarkets.length > 1 && market.projectName;
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
    projectMarkets.forEach((entryMarket) => {
        entryMarket.promoWeeks = Math.max(entryMarket.promoWeeks || 0, boostWeeks);
        recordPromoUsage({ market: entryMarket, promoType, atMs: state.time.epochMs });
    });
    recordPromoContent({
        promoType,
        actId: market.actId || null,
        actName: market.actName || null,
        actNameKey: market.actNameKey || null,
        trackId: market.trackId || null,
        marketId: market.id,
        trackTitle: isProjectPromo ? market.projectName : market.title,
        projectName: market.projectName || null,
        label: market.label || rival.name,
        budget,
        weeks: boostWeeks,
        isPlayer: false,
        targetType: isProjectPromo ? "project" : "track"
    });
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
            const rival = getRivalByName(entry.label);
            const creatorCountries = [];
            if (rival && Array.isArray(entry.creatorIds)) {
                entry.creatorIds.forEach((id) => {
                    const creator = rival.creators?.find((member) => member.id === id);
                    if (creator?.country)
                        creatorCountries.push(creator.country);
                });
            }
            if (!creatorCountries.length && entry.country)
                creatorCountries.push(entry.country);
            const actCountry = entry.country || dominantValue(creatorCountries, null);
            const trendAtRelease = Array.isArray(state.trends) && entry.genre ? state.trends.includes(entry.genre) : false;
            const projectType = normalizeProjectType(entry.projectType || "Single");
            const marketEntry = {
                id: uid("MK"),
                trackId: null,
                title: entry.title,
                label: entry.label,
                actId: null,
                actName: entry.actName,
                actNameKey: entry.actNameKey || null,
                projectName: entry.projectName,
                projectType,
                isPlayer: false,
                theme: entry.theme,
                mood: entry.mood,
                alignment: entry.alignment,
                country: entry.country || actCountry || "Annglora",
                actCountry,
                creatorCountries,
                quality: entry.quality,
                genre: entry.genre,
                distribution: entry.distribution || "Digital",
                trendAtRelease,
                releasedAt: entry.releaseAt,
                weeksOnChart: 0,
                promoWeeks: 0
            };
            applyCriticsReview({ marketEntry });
            state.marketTracks.push(marketEntry);
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
            if (isEraTouring(era)) {
                openEraTouring(era);
            }
            logEvent(`Era shift: ${era.name} moved to ${ERA_STAGES[era.stageIndex]}.`);
        }
        stillActive.push(era);
    });
    state.era.active = stillActive;
}
function runAutoCreateContent() {
    if (!state.meta?.autoCreate || !state.meta.autoCreate.enabled)
        return;
    const now = state.time.epochMs;
    const walletCash = state.label.wallet?.cash ?? state.label.cash ?? 0;
    const minCash = autoCreateMinCash();
    const budgetPct = autoCreateBudgetPct();
    const budgetCap = computeAutoCreateBudget(walletCash, budgetPct, minCash);
    const maxTracks = autoCreateMaxTracks();
    const mode = autoCreateMode();
    const updateOutcome = (status, message, stats = {}) => {
        state.meta.autoCreate.lastRunAt = now;
        state.meta.autoCreate.lastOutcome = {
            at: now,
            status,
            message,
            created: stats.created || 0,
            demoStarted: stats.demoStarted || 0,
            masterStarted: stats.masterStarted || 0,
            actsAssigned: stats.actsAssigned || 0,
            spent: stats.spent || 0,
            budgetCap
        };
    };
    const busyIds = getBusyCreatorIds("In Progress");
    const pickCreatorId = (role, preferredId = null) => {
        const req = staminaRequirement(role);
        if (preferredId) {
            const creator = getCreator(preferredId);
            if (creator && creator.role === role
                && creator.stamina >= req
                && getCreatorStaminaSpentToday(creator) + req <= STAMINA_OVERUSE_LIMIT
                && !busyIds.has(creator.id)) {
                return creator.id;
            }
        }
        const candidates = rankCandidates(role)
            .filter((creator) => creator.ready && !creator.busy)
            .filter((creator) => getCreatorStaminaSpentToday(creator) + req <= STAMINA_OVERUSE_LIMIT);
        return candidates[0]?.id || null;
    };
    const stats = { created: 0, demoStarted: 0, masterStarted: 0, actsAssigned: 0, spent: 0 };
    const canSpend = (stageCost) => {
        if (!Number.isFinite(stageCost) || stageCost <= 0)
            return { ok: false, reason: "invalid stage cost." };
        const budgetLeft = budgetCap - stats.spent;
        if (stageCost > budgetLeft) {
            return { ok: false, reason: `budget cap ${formatMoney(budgetLeft)} below stage cost ${formatMoney(stageCost)}.` };
        }
        if (state.label.cash - stageCost < minCash) {
            return { ok: false, reason: `cash reserve ${formatMoney(minCash)} blocks spend ${formatMoney(stageCost)}.` };
        }
        return { ok: true };
    };
    let blockedReason = "";
    state.tracks.forEach((track) => {
        if (!track || track.status === "Released" || track.actId)
            return;
        const rec = recommendActForTrack(track);
        if (!rec.actId)
            return;
        const assigned = assignTrackAct(track.id, rec.actId);
        if (assigned)
            stats.actsAssigned += 1;
    });
    let spendAllowed = true;
    if (walletCash <= minCash) {
        blockedReason = `cash reserve ${formatMoney(minCash)} not met.`;
        spendAllowed = false;
    }
    else if (!budgetCap) {
        blockedReason = "budget cap is 0.";
        spendAllowed = false;
    }
    const startDemoForTrack = (track) => {
        const rec = recommendTrackPlan();
        const mood = track.mood || rec.mood;
        const existingPerformers = track.creators?.performerIds?.length ? track.creators.performerIds : null;
        const performerPick = existingPerformers ? null : pickCreatorId("Performer", rec.performerId);
        const performerIds = existingPerformers || (performerPick ? [performerPick] : []);
        if (!performerIds.length)
            return "no Performer ready under daily limits.";
        const stageCost = getStageCost(1, track.modifier, performerIds);
        const budgetCheck = canSpend(stageCost);
        if (!budgetCheck.ok)
            return budgetCheck.reason;
        if (getStudioAvailableSlots() <= 0 || getStageStudioAvailable(1) <= 0) {
            return "no studio slots available for demo recording.";
        }
        if (startDemoStage(track, mood, performerIds)) {
            stats.demoStarted += 1;
            stats.spent += stageCost;
            logEvent(`Auto create: started demo for "${track.title}" (Mood: ${mood}).`);
            return null;
        }
        return "demo start failed due to constraints.";
    };
    const startMasterForTrack = (track) => {
        const rec = recommendTrackPlan();
        const existingProducers = track.creators?.producerIds?.length ? track.creators.producerIds : null;
        const producerPick = existingProducers ? null : pickCreatorId("Producer", rec.producerId);
        const producerIds = existingProducers || (producerPick ? [producerPick] : []);
        if (!producerIds.length)
            return "no Producer ready under daily limits.";
        const stageCost = getStageCost(2, track.modifier, producerIds);
        const budgetCheck = canSpend(stageCost);
        if (!budgetCheck.ok)
            return budgetCheck.reason;
        if (getStudioAvailableSlots() <= 0 || getStageStudioAvailable(2) <= 0) {
            return "no studio slots available for mastering.";
        }
        const alignment = track.alignment || state.label.alignment;
        if (startMasterStage(track, producerIds, alignment)) {
            stats.masterStarted += 1;
            stats.spent += stageCost;
            logEvent(`Auto create: started master for "${track.title}".`);
            return null;
        }
        return "mastering start failed due to constraints.";
    };
    if (spendAllowed) {
        const awaitingDemo = state.tracks.filter((track) => track.status === "Awaiting Demo" && track.stageIndex === 1);
        for (const track of awaitingDemo) {
            const reason = startDemoForTrack(track);
            if (reason) {
                if (reason.includes("budget cap") || reason.includes("cash reserve")) {
                    blockedReason = reason;
                    spendAllowed = false;
                    break;
                }
                blockedReason = blockedReason || reason;
            }
        }
    }
    if (spendAllowed) {
        const awaitingMaster = state.tracks.filter((track) => track.status === "Awaiting Master" && track.stageIndex === 2);
        for (const track of awaitingMaster) {
            const reason = startMasterForTrack(track);
            if (reason) {
                if (reason.includes("budget cap") || reason.includes("cash reserve")) {
                    blockedReason = reason;
                    spendAllowed = false;
                    break;
                }
                blockedReason = blockedReason || reason;
            }
        }
    }
    if (spendAllowed && (getStageStudioAvailable(0) <= 0 || getStudioAvailableSlots() <= 0)) {
        blockedReason = "no studio slots available for sheet music.";
        spendAllowed = false;
    }
    for (let i = 0; i < maxTracks; i += 1) {
        if (!spendAllowed)
            break;
        const plan = recommendTrackPlan();
        const songwriterId = pickCreatorId("Songwriter", plan.songwriterId);
        if (!songwriterId) {
            blockedReason = "no Songwriter ready under daily limits.";
            break;
        }
        const modifier = getModifier(plan.modifierId);
        const stageCost = getStageCost(0, modifier, [songwriterId]);
        const budgetCheck = canSpend(stageCost);
        if (!budgetCheck.ok) {
            blockedReason = budgetCheck.reason;
            break;
        }
        const performerId = mode === "collab" ? pickCreatorId("Performer", plan.performerId) : null;
        const producerId = mode === "collab" ? pickCreatorId("Producer", plan.producerId) : null;
        const track = createTrack({
            title: makeTrackTitle(plan.theme, plan.mood),
            theme: plan.theme,
            songwriterIds: [songwriterId],
            performerIds: performerId ? [performerId] : [],
            producerIds: producerId ? [producerId] : [],
            actId: null,
            projectName: makeProjectTitle(),
            projectType: plan.projectType,
            modifierId: plan.modifierId
        });
        if (!track) {
            blockedReason = "creation blocked by studio or cash constraints.";
            break;
        }
        stats.created += 1;
        stats.spent += stageCost;
        logEvent(`Auto create: started sheet music for "${track.title}" (Theme: ${track.theme}).`);
        if (getStageStudioAvailable(0) <= 0 || getStudioAvailableSlots() <= 0) {
            blockedReason = "no studio slots remaining.";
            break;
        }
    }
    if (stats.created > 0 || stats.demoStarted > 0 || stats.masterStarted > 0 || stats.actsAssigned > 0) {
        const counts = [
            stats.actsAssigned ? `${stats.actsAssigned} act${stats.actsAssigned === 1 ? "" : "s"} assigned` : null,
            stats.demoStarted ? `${stats.demoStarted} demo${stats.demoStarted === 1 ? "" : "s"}` : null,
            stats.masterStarted ? `${stats.masterStarted} master${stats.masterStarted === 1 ? "" : "s"}` : null,
            stats.created ? `${stats.created} track${stats.created === 1 ? "" : "s"} started` : null
        ].filter(Boolean).join(" | ");
        const message = `Auto create ran: ${counts || "no actions"}; ${formatMoney(stats.spent)} spent (cap ${formatMoney(budgetCap)}).`;
        logEvent(message);
        updateOutcome("completed", message, stats);
    }
    else {
        const reason = blockedReason || "no eligible auto-create actions.";
        const message = `Auto create skipped: ${reason}`;
        logEvent(message, "warn");
        updateOutcome("skipped", message, stats);
    }
}
function runAutoPromoForPlayer() {
    if (!state.meta.autoRollout || !state.meta.autoRollout.enabled)
        return;
    const slots = ensureAutoPromoSlots();
    const budgetSlots = ensureAutoPromoBudgetSlots();
    const targets = [];
    for (let index = 0; index < AUTO_PROMO_SLOT_LIMIT; index += 1) {
        const actId = slots.actIds[index] || null;
        const projectId = slots.projectIds[index] || null;
        const trackId = slots.trackIds[index] || null;
        if (!actId && !projectId && !trackId)
            continue;
        targets.push({ index, actId, projectId, trackId });
    }
    if (!targets.length)
        return;
    const findMarketEntry = (entry) => {
        if (!entry)
            return null;
        if (entry.marketId) {
            return state.marketTracks.find((candidate) => candidate.id === entry.marketId) || null;
        }
        return state.marketTracks.find((candidate) => candidate.trackId === entry.id) || null;
    };
    const rawTypes = Array.isArray(state.ui?.promoTypes) && state.ui.promoTypes.length
        ? state.ui.promoTypes
        : [state.ui?.promoType || DEFAULT_PROMO_TYPE];
    const selectedTypes = Array.from(new Set(rawTypes)).filter(Boolean);
    if (!selectedTypes.length)
        return;
    const walletCash = state.label.wallet?.cash ?? state.label.cash;
    if (!walletCash)
        return;
    let remainingCash = walletCash;
    targets.forEach((target) => {
        const pct = Number.isFinite(budgetSlots[target.index]) ? budgetSlots[target.index] : 0;
        if (pct <= 0)
            return;
        const track = target.trackId ? getTrack(target.trackId) : null;
        const projectSpec = target.projectId ? parsePromoProjectKey(target.projectId) : null;
        let act = target.actId ? getAct(target.actId) : null;
        let era = null;
        let market = null;
        let projectTargets = [];
        let promoTargetType = null;
        if (track) {
            if (track.status !== "Released" || !track.marketId)
                return;
            era = track.eraId ? getEraById(track.eraId) : null;
            if (!era || era.status !== "Active")
                return;
            market = state.marketTracks.find((entry) => entry.id === track.marketId);
            if (!market || (market.promoWeeks || 0) > 0)
                return;
            act = track.actId ? getAct(track.actId) : act;
            promoTargetType = "track";
        }
        else if (projectSpec) {
            era = projectSpec.eraId ? getEraById(projectSpec.eraId) : null;
            act = projectSpec.actId ? getAct(projectSpec.actId) : act;
            if (!act && era?.actId)
                act = getAct(era.actId);
            if (!act)
                return;
            if (!era)
                era = getLatestActiveEraForAct(act.id);
            if (!era || era.status !== "Active")
                return;
            projectTargets = listPromoEligibleTracksForProject(projectSpec);
            if (!projectTargets.length)
                return;
            const boostable = projectTargets.some((entry) => {
                if (entry.status === "Released") {
                    const entryMarket = findMarketEntry(entry);
                    return entryMarket && (entryMarket.promoWeeks || 0) <= 0;
                }
                return Math.max(0, entry.promo?.preReleaseWeeks || 0) <= 0;
            });
            if (!boostable)
                return;
            promoTargetType = "project";
        }
        else if (act) {
            era = getLatestActiveEraForAct(act.id);
            if (!era || era.status !== "Active")
                return;
            if ((act.promoWeeks || 0) > 0)
                return;
            promoTargetType = "act";
        }
        else {
            return;
        }
        let usableTypes = selectedTypes.slice();
        if (track && track.promo?.musicVideoUsed) {
            usableTypes = usableTypes.filter((typeId) => typeId !== "musicVideo");
        }
        if (!track) {
            usableTypes = usableTypes.filter((typeId) => !PROMO_TYPE_DETAILS[typeId]?.requiresTrack);
        }
        if (!usableTypes.length)
            return;
        let resolvedTypes = usableTypes.slice();
        if (state.ui?.promoPrimeTime && resolvedTypes.includes("livePerformance")) {
            const eligibility = checkPrimeShowcaseEligibility(act?.id || track?.actId || null, track?.id || null);
            if (!eligibility.ok) {
                resolvedTypes = resolvedTypes.filter((typeId) => typeId !== "livePerformance");
                if (!resolvedTypes.length) {
                    logEvent(`Auto promo skipped: ${eligibility.reason || "Prime Time eligibility not met."}`, "warn");
                    return;
                }
                logEvent(`Auto promo note: ${eligibility.reason || "Prime Time eligibility not met."} Live performance skipped.`, "warn");
            }
            else {
                resolvedTypes = resolvedTypes.map((typeId) => typeId === "livePerformance" ? "primeShowcase" : typeId);
            }
        }
        if (!resolvedTypes.length)
            return;
        const budget = computeAutoPromoBudget(walletCash, pct);
        const totalCost = budget * resolvedTypes.length;
        if (!budget || remainingCash < totalCost || state.label.cash < totalCost)
            return;
        const facilityNeeds = promoFacilityNeeds(resolvedTypes);
        for (const [facilityId, count] of Object.entries(facilityNeeds)) {
            const availability = getPromoFacilityAvailability(facilityId);
            if (availability.available < count)
                return;
        }
        const reservations = [];
        for (const promoType of resolvedTypes) {
            const facilityId = getPromoFacilityForType(promoType);
            if (!facilityId)
                continue;
            const reservation = reservePromoFacilitySlot(facilityId, promoType, track?.id || null);
            if (!reservation.ok)
                return;
            if (reservation.booking)
                reservations.push(reservation.booking);
        }
        state.label.cash -= totalCost;
        remainingCash = state.label.cash;
        if (state.label.wallet)
            state.label.wallet.cash = state.label.cash;
        if (track) {
            recordTrackPromoCost(track, totalCost);
        }
        else if (projectTargets.length) {
            const perTrack = totalCost / projectTargets.length;
            projectTargets.forEach((entry) => recordTrackPromoCost(entry, perTrack));
        }
        const boostWeeks = promoWeeksFromBudget(budget);
        if (track && market) {
            market.promoWeeks = Math.max(market.promoWeeks || 0, boostWeeks);
        }
        else if (projectTargets.length) {
            projectTargets.forEach((entry) => {
                if (entry.status === "Released") {
                    const entryMarket = findMarketEntry(entry);
                    if (entryMarket)
                        entryMarket.promoWeeks = Math.max(entryMarket.promoWeeks || 0, boostWeeks);
                    return;
                }
                const promo = entry.promo || { preReleaseWeeks: 0, musicVideoUsed: false };
                promo.preReleaseWeeks = Math.max(promo.preReleaseWeeks || 0, boostWeeks);
                entry.promo = promo;
            });
        }
        if (act)
            act.promoWeeks = Math.max(act.promoWeeks || 0, boostWeeks);
        state.meta.promoRuns = (state.meta.promoRuns || 0) + resolvedTypes.length;
        const promoIds = new Set();
        if (track) {
            (track.creators?.songwriterIds || []).forEach((id) => promoIds.add(id));
            (track.creators?.performerIds || []).forEach((id) => promoIds.add(id));
            (track.creators?.producerIds || []).forEach((id) => promoIds.add(id));
        }
        else if (projectTargets.length) {
            projectTargets.forEach((entry) => {
                (entry.creators?.songwriterIds || []).forEach((id) => promoIds.add(id));
                (entry.creators?.performerIds || []).forEach((id) => promoIds.add(id));
                (entry.creators?.producerIds || []).forEach((id) => promoIds.add(id));
            });
        }
        const promoIdList = Array.from(promoIds).filter(Boolean);
        if (promoIdList.length)
            markCreatorPromo(promoIdList);
        const promoStamp = state.time.epochMs;
        const promoLabel = market?.label || state.label?.name || "";
        const promoProjectName = track?.projectName || projectSpec?.projectName || null;
        resolvedTypes.forEach((promoType) => {
            if (track) {
                recordPromoUsage({ track, market, act, promoType, atMs: promoStamp });
            }
            else {
                recordPromoUsage({ act, promoType, atMs: promoStamp });
            }
            recordPromoContent({
                promoType,
                actId: act?.id || track?.actId || null,
                actName: act?.name || null,
                actNameKey: act?.nameKey || null,
                trackId: track?.id || null,
                marketId: market?.id || null,
                trackTitle: track ? track.title : projectSpec ? projectSpec.projectName : null,
                projectName: promoProjectName,
                label: promoLabel,
                budget,
                weeks: boostWeeks,
                isPlayer: true,
                targetType: promoTargetType
            });
        });
        const promoLabels = resolvedTypes.map((typeId) => getPromoTypeDetails(typeId).label).join(", ");
        const bookingNotes = reservations.map((booking) => {
            const facilityLabel = promoFacilityLabel(booking.facility);
            const timeframeNote = booking.timeframeLabel ? ` ${booking.timeframeLabel}` : "";
            if (booking.facility === "filming") {
                const studio = booking.studioId ? getFilmingStudioById(booking.studioId) : null;
                return studio ? `${facilityLabel}${timeframeNote} (${studio.label})` : `${facilityLabel}${timeframeNote}`;
            }
            if (booking.facility !== "broadcast")
                return `${facilityLabel}${timeframeNote}`;
            const studio = booking.studioId ? getBroadcastStudioById(booking.studioId) : null;
            const program = booking.programId ? getBroadcastProgramById(booking.programId) : null;
            const details = [studio?.label, program?.label].filter(Boolean).join(", ");
            return details ? `${facilityLabel}${timeframeNote} (${details})` : `${facilityLabel}${timeframeNote}`;
        });
        const spendEach = formatMoney(budget);
        const totalSpend = formatMoney(totalCost);
        const scheduleLabel = reservations.find((booking) => booking?.windowLabel)?.windowLabel
            || formatDate(state.time.epochMs);
        const bookingLine = bookingNotes.length ? ` Booked ${bookingNotes.join(" | ")}.` : "";
        const targetLabel = track
            ? `"${track.title}"`
            : projectSpec
                ? `Project "${projectSpec.projectName}"`
                : `Act "${act?.name || "Unknown"}"`;
        const slotLabel = `Slot ${target.index + 1}`;
        logEvent(`Auto promo scheduled (${slotLabel}): ${promoLabels} for ${targetLabel} on ${scheduleLabel}. Budget ${spendEach} each (${totalSpend} total).${bookingLine} +${boostWeeks} weeks.`);
    });
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
        const projectMarkets = collectRivalProjectMarkets(rival, market);
        const isProjectPromo = projectMarkets.length > 1 && market.projectName;
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
        projectMarkets.forEach((entry) => {
            entry.promoWeeks = Math.max(entry.promoWeeks || 0, boostWeeks);
            recordPromoUsage({ market: entry, promoType, atMs: state.time.epochMs });
        });
        recordPromoContent({
            promoType,
            actId: market.actId || null,
            actName: market.actName || null,
            actNameKey: market.actNameKey || null,
            trackId: market.trackId || null,
            marketId: market.id,
            trackTitle: isProjectPromo ? market.projectName : market.title,
            projectName: market.projectName || null,
            label: market.label || rival.name,
            budget,
            weeks: boostWeeks,
            isPlayer: false,
            targetType: isProjectPromo ? "project" : "track"
        });
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
    refreshRivalAmbition();
    ensureRivalCashFloor();
    recruitRivalCreators();
    generateRivalReleases();
    resolveTourBookings();
    const { globalScores } = computeChartsLocal();
    updateAudienceBiasFromCharts();
    const labelScores = computeLabelScoresFromCharts();
    const labelCompetition = refreshLabelCompetition(labelScores);
    updateCumulativeLabelPoints(labelScores);
    updateRivalMomentum(labelScores, labelCompetition);
    applyRivalStudioLeaseCosts();
    updateRivalEconomy(globalScores);
    recordTrendLedgerSnapshot(globalScores);
    updateEconomy(globalScores);
    updateActPopularityLedger();
    awardExp(Math.min(300, Math.round(state.economy.lastRevenue / 500)), null, true);
    updateLabelReach();
    updateQuests();
    refreshQuestPool();
    advanceEraWeek();
    ageMarketTracks();
    state.rivals.forEach((rival) => updateRivalPlanCompletion(rival));
    runAutoCreateContent();
    maybeRunAutoPromo();
    processCreatorDepartures();
    applyBailoutIfNeeded();
    evaluateAchievements();
    evaluateRivalAchievements();
    refreshRivalAmbition();
    checkWinLoss(labelScores);
    uiHooks.renderAll?.();
    logDuration("weeklyUpdate", startTime, WEEKLY_UPDATE_WARN_MS, `(week ${week})`);
}
function awardYearWeekRange(year) {
    const startEpoch = Date.UTC(year, 0, 1, 0, 0, 0, 0);
    const endEpoch = Date.UTC(year + 1, 0, 1, 0, 0, 0, 0) - 1;
    const startWeek = weekIndexForEpochMs(startEpoch) + 1;
    const endWeek = weekIndexForEpochMs(endEpoch) + 1;
    return { startWeek, endWeek, startEpoch, endEpoch };
}
function buildAwardMetricStore() {
    return {
        candidates: {},
        chartPoints: {},
        sales: {},
        critics: {},
        awards: {},
        firstLeadWeek: { chartPoints: {}, sales: {}, critics: {} }
    };
}
function resolveAwardActKey(entry) {
    if (!entry)
        return null;
    if (entry.actId)
        return entry.actId;
    if (entry.actNameKey)
        return `actkey:${entry.actNameKey}`;
    const actName = entry.actName || "Unknown";
    const label = entry.label || "Unknown";
    return `${actName}::${label}`;
}
function ensureAwardCandidate(store, entry) {
    const key = resolveAwardActKey(entry);
    if (!key)
        return null;
    if (!store.candidates[key]) {
        store.candidates[key] = {
            actKey: key,
            actId: entry.actId || null,
            actName: entry.actName || "Unknown",
            actNameKey: entry.actNameKey || null,
            label: entry.label || ""
        };
    }
    else {
        const candidate = store.candidates[key];
        if (!candidate.actId && entry.actId)
            candidate.actId = entry.actId;
        if ((!candidate.actName || candidate.actName === "Unknown") && entry.actName)
            candidate.actName = entry.actName;
        if (!candidate.actNameKey && entry.actNameKey)
            candidate.actNameKey = entry.actNameKey;
        if (!candidate.label && entry.label)
            candidate.label = entry.label;
    }
    return key;
}
function addAwardMetric(map, key, amount) {
    if (!key || !Number.isFinite(amount))
        return;
    map[key] = Math.max(0, Number(map[key] || 0) + amount);
}
function updateLeadWeek(metricMap, leadMap, week) {
    const entries = Object.entries(metricMap);
    if (!entries.length)
        return;
    let best = null;
    entries.forEach(([, value]) => {
        if (!Number.isFinite(value))
            return;
        if (best === null || value > best)
            best = value;
    });
    if (best === null)
        return;
    entries.forEach(([key, value]) => {
        if (!Number.isFinite(value) || value !== best)
            return;
        if (!Number.isFinite(leadMap[key]))
            leadMap[key] = week;
    });
}
function resolveMarketEntryById(marketId) {
    if (!marketId)
        return null;
    const active = state.marketTracks?.find((entry) => entry.id === marketId) || null;
    if (active)
        return active;
    const archived = state.meta?.marketTrackArchive?.find((entry) => entry.id === marketId) || null;
    return archived || null;
}
function resolveMarketEntryByTrackId(trackId) {
    if (!trackId)
        return null;
    const active = state.marketTracks?.find((entry) => entry.trackId === trackId) || null;
    if (active)
        return active;
    const archived = state.meta?.marketTrackArchive?.find((entry) => entry.trackId === trackId) || null;
    return archived || null;
}
function resolveCriticScoreForEntry(entry, scopeKey) {
    if (!entry)
        return 0;
    const normalized = normalizeCriticScopeKey(scopeKey);
    if (entry.criticScores && Number.isFinite(entry.criticScores[normalized]))
        return entry.criticScores[normalized];
    if (Number.isFinite(entry.criticScore))
        return entry.criticScore;
    const market = entry.marketId ? resolveMarketEntryById(entry.marketId) : null;
    if (market?.criticScores && Number.isFinite(market.criticScores[normalized]))
        return market.criticScores[normalized];
    if (Number.isFinite(market?.criticScore))
        return market.criticScore;
    const track = entry.trackId ? getTrack(entry.trackId) : null;
    if (track?.criticScores && Number.isFinite(track.criticScores[normalized]))
        return track.criticScores[normalized];
    if (Number.isFinite(track?.criticScore))
        return track.criticScore;
    const primaryTrackEntry = entry.primaryTrackId ? resolveMarketEntryByTrackId(entry.primaryTrackId) : null;
    if (primaryTrackEntry?.criticScores && Number.isFinite(primaryTrackEntry.criticScores[normalized])) {
        return primaryTrackEntry.criticScores[normalized];
    }
    if (Number.isFinite(primaryTrackEntry?.criticScore))
        return primaryTrackEntry.criticScore;
    return scoreCriticForScope(primaryTrackEntry || market || track || entry, normalized);
}
function collectProjectAwardEntries(entries, scopeKey) {
    const projects = new Map();
    (entries || []).forEach((entry) => {
        if (!entry)
            return;
        const projectName = entry.projectName || `${entry.title || "Unknown"} - Single`;
        const projectType = normalizeProjectType(entry.projectType || "Single");
        const label = entry.label || "Unknown";
        const actName = entry.actName || "-";
        const key = `${normalizeProjectName(projectName)}::${projectType}::${label}::${actName}`;
        const metrics = entry.metrics || {};
        const score = Number(entry.score || 0);
        const criticScore = resolveCriticScoreForEntry(entry, scopeKey);
        const existing = projects.get(key) || {
            projectName,
            projectType,
            label,
            actId: entry.actId || null,
            actName,
            alignment: entry.alignment,
            country: entry.country || "Annglora",
            primaryTrack: entry,
            primaryScore: Number.isFinite(score) ? score : 0,
            trackCount: 0,
            metrics: { sales: 0, streaming: 0, airplay: 0, social: 0 },
            score: 0,
            criticScoreTotal: 0,
            criticScoreWeight: 0
        };
        existing.trackCount += 1;
        if (Number.isFinite(score)) {
            existing.score += score;
            if (!existing.primaryTrack || score > existing.primaryScore) {
                existing.primaryTrack = entry;
                existing.primaryScore = score;
            }
        }
        existing.metrics.sales += Number(metrics.sales || 0);
        existing.metrics.streaming += Number(metrics.streaming || 0);
        existing.metrics.airplay += Number(metrics.airplay || 0);
        existing.metrics.social += Number(metrics.social || 0);
        if (Number.isFinite(criticScore)) {
            existing.criticScoreTotal += criticScore;
            existing.criticScoreWeight += 1;
        }
        projects.set(key, existing);
    });
    return Array.from(projects.values())
        .map((entry) => {
        const criticScore = entry.criticScoreWeight
            ? Math.round(entry.criticScoreTotal / entry.criticScoreWeight)
            : 0;
        return { ...entry, criticScore };
    })
        .sort((a, b) => b.score - a.score);
}
function promoPrimaryMetric(metrics) {
    if (!metrics || typeof metrics !== "object")
        return 0;
    const primary = Number(metrics.primary || 0);
    if (primary)
        return primary;
    return Number(metrics.views || metrics.likes || metrics.concurrent || metrics.comments || 0);
}
function applyTrackSnapshotsForAwards(week, snapshots, trackStore, projectStore) {
    const trackSnapshots = snapshots.filter((snapshot) => !String(snapshot.scope || "").startsWith("promo:")
        && !String(snapshot.scope || "").startsWith("tour:"));
    trackSnapshots.forEach((snapshot) => {
        const scopeKey = normalizeCriticScopeKey(snapshot.scope);
        const weight = criticScopeWeight(scopeKey);
        const entries = Array.isArray(snapshot.entries) ? snapshot.entries : [];
        if (!entries.length)
            return;
        const topTrack = entries[0];
        const trackKey = ensureAwardCandidate(trackStore, topTrack);
        if (trackKey)
            addAwardMetric(trackStore.chartPoints, trackKey, weight);
        const projectEntries = collectProjectAwardEntries(entries, scopeKey);
        if (projectEntries.length) {
            const topProject = projectEntries[0];
            const projectKey = ensureAwardCandidate(projectStore, topProject);
            if (projectKey)
                addAwardMetric(projectStore.chartPoints, projectKey, weight);
        }
        entries.forEach((entry) => {
            const actKey = ensureAwardCandidate(trackStore, entry);
            if (!actKey)
                return;
            const criticScore = resolveCriticScoreForEntry(entry, scopeKey);
            addAwardMetric(trackStore.critics, actKey, criticScore * weight);
            if (criticScore >= CRITIC_PICK_THRESHOLD)
                addAwardMetric(trackStore.awards, actKey, weight);
        });
        projectEntries.forEach((entry) => {
            const actKey = ensureAwardCandidate(projectStore, entry);
            if (!actKey)
                return;
            const criticScore = Number(entry.criticScore || 0);
            addAwardMetric(projectStore.critics, actKey, criticScore * weight);
            if (criticScore >= CRITIC_PICK_THRESHOLD)
                addAwardMetric(projectStore.awards, actKey, weight);
        });
        if (scopeKey === "global") {
            entries.forEach((entry) => {
                const actKey = ensureAwardCandidate(trackStore, entry);
                if (!actKey)
                    return;
                const metrics = entry.metrics || {};
                const sales = Number(metrics.sales || 0) + Number(metrics.streaming || 0);
                addAwardMetric(trackStore.sales, actKey, sales);
            });
            projectEntries.forEach((entry) => {
                const actKey = ensureAwardCandidate(projectStore, entry);
                if (!actKey)
                    return;
                const metrics = entry.metrics || {};
                const sales = Number(metrics.sales || 0) + Number(metrics.streaming || 0);
                addAwardMetric(projectStore.sales, actKey, sales);
            });
        }
    });
    updateLeadWeek(trackStore.chartPoints, trackStore.firstLeadWeek.chartPoints, week);
    updateLeadWeek(trackStore.sales, trackStore.firstLeadWeek.sales, week);
    updateLeadWeek(trackStore.critics, trackStore.firstLeadWeek.critics, week);
    updateLeadWeek(projectStore.chartPoints, projectStore.firstLeadWeek.chartPoints, week);
    updateLeadWeek(projectStore.sales, projectStore.firstLeadWeek.sales, week);
    updateLeadWeek(projectStore.critics, projectStore.firstLeadWeek.critics, week);
}
function applyPromoSnapshotsForAwards(week, snapshots, promoStore) {
    const promoSnapshots = snapshots.filter((snapshot) => String(snapshot.scope || "").startsWith("promo:"));
    promoSnapshots.forEach((snapshot) => {
        const scopeKey = normalizeCriticScopeKey(snapshot.scope);
        const weight = criticScopeWeight(scopeKey);
        const entries = Array.isArray(snapshot.entries) ? snapshot.entries : [];
        if (!entries.length)
            return;
        const top = entries[0];
        const actKey = ensureAwardCandidate(promoStore, top);
        if (actKey)
            addAwardMetric(promoStore.chartPoints, actKey, weight);
        entries.forEach((entry) => {
            const entryKey = ensureAwardCandidate(promoStore, entry);
            if (!entryKey)
                return;
            const criticScore = resolveCriticScoreForEntry(entry, scopeKey);
            addAwardMetric(promoStore.critics, entryKey, criticScore * weight);
            if (criticScore >= CRITIC_PICK_THRESHOLD)
                addAwardMetric(promoStore.awards, entryKey, weight);
        });
        if (scopeKey === "global") {
            entries.forEach((entry) => {
                const entryKey = ensureAwardCandidate(promoStore, entry);
                if (!entryKey)
                    return;
                const amount = promoPrimaryMetric(entry.metrics);
                addAwardMetric(promoStore.sales, entryKey, amount);
            });
        }
    });
    updateLeadWeek(promoStore.chartPoints, promoStore.firstLeadWeek.chartPoints, week);
    updateLeadWeek(promoStore.sales, promoStore.firstLeadWeek.sales, week);
    updateLeadWeek(promoStore.critics, promoStore.firstLeadWeek.critics, week);
}
function applyTourSnapshotsForAwards(week, snapshots, tourStore) {
    const tourSnapshots = snapshots.filter((snapshot) => String(snapshot.scope || "").startsWith("tour:"));
    tourSnapshots.forEach((snapshot) => {
        const scopeKey = normalizeCriticScopeKey(snapshot.scope);
        const weight = criticScopeWeight(scopeKey);
        const entries = Array.isArray(snapshot.entries) ? snapshot.entries : [];
        if (!entries.length)
            return;
        const top = entries[0];
        const actKey = ensureAwardCandidate(tourStore, top);
        if (actKey)
            addAwardMetric(tourStore.chartPoints, actKey, weight);
        entries.forEach((entry) => {
            const entryKey = ensureAwardCandidate(tourStore, entry);
            if (!entryKey)
                return;
            const criticScore = resolveCriticScoreForEntry(entry, scopeKey);
            addAwardMetric(tourStore.critics, entryKey, criticScore * weight);
            if (criticScore >= CRITIC_PICK_THRESHOLD)
                addAwardMetric(tourStore.awards, entryKey, weight);
        });
        if (scopeKey === "global") {
            entries.forEach((entry) => {
                const entryKey = ensureAwardCandidate(tourStore, entry);
                if (!entryKey)
                    return;
                const attendance = Number(entry.metrics?.attendance || 0);
                addAwardMetric(tourStore.sales, entryKey, attendance);
            });
        }
    });
    updateLeadWeek(tourStore.chartPoints, tourStore.firstLeadWeek.chartPoints, week);
    updateLeadWeek(tourStore.sales, tourStore.firstLeadWeek.sales, week);
    updateLeadWeek(tourStore.critics, tourStore.firstLeadWeek.critics, week);
}
function pickTopKeys(keys, metricMap, preferLower = false) {
    let bestValue = preferLower ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    let bestKeys = [];
    keys.forEach((key) => {
        const value = Number(metricMap[key] || 0);
        if (!Number.isFinite(value))
            return;
        if (preferLower ? value < bestValue : value > bestValue) {
            bestValue = value;
            bestKeys = [key];
        }
        else if (value === bestValue) {
            bestKeys.push(key);
        }
    });
    return { keys: bestKeys, value: bestValue };
}
function resolveAnnualAwardWinner(store, primaryMetric) {
    const keys = Object.keys(store.candidates || {});
    if (!keys.length)
        return null;
    const primary = store[primaryMetric] || {};
    const primaryEligible = keys.filter((key) => Number(primary[key] || 0) > 0);
    const candidates = primaryEligible.length ? primaryEligible : keys;
    let { keys: tied } = pickTopKeys(candidates, primary);
    let resolvedBy = "primary";
    if (tied.length > 1) {
        const salesResult = pickTopKeys(tied, store.sales || {});
        if (salesResult.keys.length === 1) {
            tied = salesResult.keys;
            resolvedBy = "sales";
        }
        else {
            tied = salesResult.keys;
        }
    }
    if (tied.length > 1) {
        const criticsResult = pickTopKeys(tied, store.critics || {});
        if (criticsResult.keys.length === 1) {
            tied = criticsResult.keys;
            resolvedBy = "critics";
        }
        else {
            tied = criticsResult.keys;
        }
    }
    if (tied.length > 1) {
        const awardsResult = pickTopKeys(tied, store.awards || {});
        if (awardsResult.keys.length === 1) {
            tied = awardsResult.keys;
            resolvedBy = "awards";
        }
        else {
            tied = awardsResult.keys;
        }
    }
    if (tied.length > 1) {
        const leadMap = store.firstLeadWeek?.[primaryMetric] || {};
        const leadResult = pickTopKeys(tied, leadMap, true);
        if (leadResult.keys.length === 1) {
            tied = leadResult.keys;
            resolvedBy = "first";
        }
        else {
            tied = leadResult.keys;
        }
    }
    if (tied.length > 1) {
        tied.sort((a, b) => String(a).localeCompare(String(b)));
        resolvedBy = `${resolvedBy}-alpha`;
    }
    const winnerKey = tied[0];
    const candidate = store.candidates[winnerKey];
    return {
        ...candidate,
        primaryValue: Number(primary[winnerKey] || 0),
        resolvedBy
    };
}
function ensureAnnualAwardsStore() {
    if (!Array.isArray(state.meta.annualAwards))
        state.meta.annualAwards = [];
    return state.meta.annualAwards;
}
function countAnnualAwardWins(awardId, labelName) {
    if (!awardId || !labelName)
        return 0;
    const awards = ensureAnnualAwardsStore();
    return awards.reduce((total, entry) => {
        const winner = entry?.awards?.[awardId];
        if (winner?.label === labelName)
            return total + 1;
        return total;
    }, 0);
}
async function evaluateAnnualAwards(year) {
    const { startWeek, endWeek, startEpoch, endEpoch } = awardYearWeekRange(year);
    const weekList = await listChartWeeks();
    const weeks = weekList
        .map((entry) => entry.week)
        .filter((week) => week >= startWeek && week <= endWeek)
        .sort((a, b) => a - b);
    if (!weeks.length) {
        logEvent(`Annual awards skipped for ${year}: no chart history in weeks ${startWeek}-${endWeek}.`, "warn");
        return null;
    }
    const snapshotsByWeek = new Map();
    const results = await Promise.all(weeks.map((week) => fetchChartSnapshotsForWeek(week)));
    weeks.forEach((week, index) => {
        const filtered = (results[index] || []).filter((snapshot) => {
            if (!Number.isFinite(snapshot?.ts))
                return false;
            return snapshot.ts >= startEpoch && snapshot.ts <= endEpoch;
        });
        snapshotsByWeek.set(week, filtered);
    });
    const stores = {
        tracks: buildAwardMetricStore(),
        projects: buildAwardMetricStore(),
        promotions: buildAwardMetricStore(),
        tours: buildAwardMetricStore()
    };
    weeks.forEach((week) => {
        const snapshots = snapshotsByWeek.get(week) || [];
        applyTrackSnapshotsForAwards(week, snapshots, stores.tracks, stores.projects);
        applyPromoSnapshotsForAwards(week, snapshots, stores.promotions);
        applyTourSnapshotsForAwards(week, snapshots, stores.tours);
    });
    const awards = {};
    const awardDefs = [
        { id: "REQ-01", metric: "chartPoints", store: "tracks" },
        { id: "REQ-02", metric: "sales", store: "tracks" },
        { id: "REQ-03", metric: "critics", store: "tracks" },
        { id: "REQ-04", metric: "chartPoints", store: "projects" },
        { id: "REQ-05", metric: "sales", store: "projects" },
        { id: "REQ-06", metric: "critics", store: "projects" },
        { id: "REQ-07", metric: "chartPoints", store: "promotions" },
        { id: "REQ-08", metric: "sales", store: "promotions" },
        { id: "REQ-09", metric: "critics", store: "promotions" },
        { id: "REQ-10", metric: "chartPoints", store: "tours" },
        { id: "REQ-11", metric: "sales", store: "tours" },
        { id: "REQ-12", metric: "critics", store: "tours" }
    ];
    awardDefs.forEach((definition) => {
        const store = stores[definition.store];
        const result = resolveAnnualAwardWinner(store, definition.metric);
        if (!result)
            return;
        awards[definition.id] = {
            actKey: result.actKey,
            actId: result.actId,
            actName: result.actName,
            actNameKey: result.actNameKey || null,
            label: result.label,
            primaryValue: result.primaryValue,
            resolvedBy: result.resolvedBy
        };
    });
    if (Object.keys(awards).length !== awardDefs.length) {
        logEvent(`Annual awards ${year}: ${Object.keys(awards).length}/${awardDefs.length} categories resolved.`, "warn");
    }
    const annualAwards = ensureAnnualAwardsStore();
    const existing = annualAwards.find((entry) => entry.year === year);
    if (existing) {
        existing.awards = awards;
    }
    else {
        annualAwards.push({ year, awards });
    }
    logEvent(`Annual awards computed for ${year}.`);
    return awards;
}
async function onYearTick(year) {
    // Annual snapshot and deterministic tie-resolution for awards
    logEvent(`Year ${year} tick.`);
    refreshPopulationSnapshot(year);
    logEvent(`Population update: Year ${year}.`);
    // Recompute charts and label scores to determine annual leader
    const { globalScores } = await computeCharts();
    const labelScores = computeLabelScoresFromCharts();
    refreshLabelCompetition(labelScores);
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
    await evaluateAnnualAwards(year);
    evaluateAchievements();
    evaluateRivalAchievements();
    // Run end-of-year economy/housekeeping: award EXP, refresh tasks
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
        if (dominant && rngFn() < SEED_DOMINANT_PICK_CHANCE)
            return dominant;
        return seededPick(state.rivals, rngFn);
    };
    const pickProjectType = (remaining) => {
        const options = [
            { type: "Single", weight: 0.6 },
            { type: "EP", weight: 0.25 },
            { type: "Album", weight: 0.15 }
        ].filter((entry) => getProjectTrackLimits(entry.type).min <= remaining);
        if (!options.length)
            return "Single";
        const total = options.reduce((sum, entry) => sum + entry.weight, 0);
        let roll = rngFn() * total;
        for (const entry of options) {
            roll -= entry.weight;
            if (roll <= 0)
                return entry.type;
        }
        return options[options.length - 1].type;
    };
    let remaining = Math.max(1, count);
    while (remaining > 0) {
        const rival = pickRival();
        const themePool = rival.focusThemes?.length ? rival.focusThemes : THEMES;
        const moodPool = rival.focusMoods?.length ? rival.focusMoods : MOODS;
        const theme = rngFn() < 0.8 ? seededPick(themePool, rngFn) : seededPick(THEMES, rngFn);
        const mood = rngFn() < 0.8 ? seededPick(moodPool, rngFn) : seededPick(MOODS, rngFn);
        const momentum = typeof rival.momentum === "number" ? rival.momentum : 0.5;
        const projectType = normalizeProjectType(pickProjectType(remaining));
        const limits = getProjectTrackLimits(projectType);
        const maxSize = Math.min(limits.max, remaining);
        const projectSize = seededRand(limits.min, maxSize, rngFn);
        const projectName = makeProjectTitleSeeded(rngFn);
        const rivalAct = makeRivalActNameEntry({ rng: rngFn, nation: rival.country });
        const genre = makeGenre(theme, mood);
        const trendAtRelease = Array.isArray(state.trends) ? state.trends.includes(genre) : false;
        for (let i = 0; i < projectSize && remaining > 0; i += 1) {
            let quality = clampQuality(seededRand(55, 95, rngFn) + Math.round(momentum * 6));
            if (mood === "Boring")
                quality = clampQuality(quality - 12);
            const marketEntry = {
                id: uid("MK"),
                trackId: null,
                title: makeTrackTitleByCountrySeeded(theme, mood, rival.country, rngFn),
                label: rival.name,
                actId: null,
                actName: rivalAct.name,
                actNameKey: rivalAct.nameKey,
                projectName,
                projectType,
                isPlayer: false,
                theme,
                mood,
                alignment: rival.alignment,
                country: rival.country,
                actCountry: rival.country,
                creatorCountries: [rival.country],
                quality,
                genre,
                distribution: "Digital",
                trendAtRelease,
                weeksOnChart: seededRand(0, 8, rngFn),
                promoWeeks: seededRand(0, 4, rngFn)
            };
            applyCriticsReview({ marketEntry });
            state.marketTracks.push(marketEntry);
            remaining -= 1;
        }
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
async function getSlotDataWithExternal(index) {
    const data = getSlotData(index);
    if (data)
        return data;
    const external = await readSaveSlotFromExternal(index);
    if (!external)
        return null;
    try {
        localStorage.setItem(slotKey(index), JSON.stringify(external));
    }
    catch {
        // ignore storage errors
    }
    return external;
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
    queueSaveSlotWrite(index, payload);
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
    refreshRivalAmbition();
    ensureRivalCashFloor();
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
        const data = forceNew ? null : await getSlotDataWithExternal(index);
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
        const labelScores = computeLabelScoresFromCharts();
        refreshLabelCompetition(labelScores);
        evaluateRivalAchievements();
        refreshRivalAmbition();
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
    queueSaveSlotDelete(index);
}
function normalizeState() {
    if (!state.ui) {
        state.ui = {
            activeChart: "global",
            chartContentType: "tracks",
            chartPulseScopeType: "global",
            chartPulseScopeTarget: "global",
            chartPulseContentType: "tracks",
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
            promoPrimeTime: false,
            promoSlots: { actId: null, projectId: null, trackId: null },
            autoPromoSlots: {
                actIds: buildAutoPromoSlotList(),
                projectIds: buildAutoPromoSlotList(),
                trackIds: buildAutoPromoSlotList()
            },
            tourDraftId: null,
            activeView: "charts"
        };
    }
    if (!state.ui.activeChart)
        state.ui.activeChart = "global";
    if (state.ui.chartContentType !== "tracks"
        && state.ui.chartContentType !== "projects"
        && state.ui.chartContentType !== "promotions"
        && state.ui.chartContentType !== "tours"
        && state.ui.chartContentType !== "acts") {
        state.ui.chartContentType = "tracks";
    }
    if (state.ui.chartPulseContentType !== "tracks"
        && state.ui.chartPulseContentType !== "projects"
        && state.ui.chartPulseContentType !== "promos") {
        state.ui.chartPulseContentType = "tracks";
    }
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
    if (typeof state.ui.promoPrimeTime !== "boolean")
        state.ui.promoPrimeTime = false;
    if (state.ui.promoType === "primeShowcase") {
        state.ui.promoType = "livePerformance";
        state.ui.promoPrimeTime = true;
    }
    if (!Array.isArray(state.ui.promoTypes) || !state.ui.promoTypes.length) {
        state.ui.promoTypes = [state.ui.promoType || DEFAULT_PROMO_TYPE];
    }
    let primeShowcaseSelected = false;
    state.ui.promoTypes = state.ui.promoTypes.filter(Boolean).map((typeId) => {
        if (typeId === "primeShowcase") {
            primeShowcaseSelected = true;
            return "livePerformance";
        }
        return typeId;
    });
    if (!state.ui.promoTypes.length) {
        state.ui.promoTypes = [state.ui.promoType || DEFAULT_PROMO_TYPE];
    }
    if (primeShowcaseSelected)
        state.ui.promoPrimeTime = true;
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
        state.ui.promoSlots = { actId: null, projectId: null, trackId: null };
    if (typeof state.ui.promoSlots.actId !== "string")
        state.ui.promoSlots.actId = state.ui.promoSlots.actId || null;
    if (typeof state.ui.promoSlots.projectId !== "string") {
        state.ui.promoSlots.projectId = state.ui.promoSlots.projectId || null;
    }
    const autoPromoSlots = ensureAutoPromoSlots();
    const hasAutoPromoTargets = autoPromoSlots.actIds.some(Boolean)
        || autoPromoSlots.projectIds.some(Boolean)
        || autoPromoSlots.trackIds.some(Boolean);
    const hasLegacyPromoTargets = Boolean(state.ui.promoSlots.actId
        || state.ui.promoSlots.projectId
        || state.ui.promoSlots.trackId);
    if (!hasAutoPromoTargets && hasLegacyPromoTargets) {
        autoPromoSlots.actIds[0] = state.ui.promoSlots.actId || null;
        autoPromoSlots.projectIds[0] = state.ui.promoSlots.projectId || null;
        autoPromoSlots.trackIds[0] = state.ui.promoSlots.trackId || null;
    }
    if (typeof state.ui.tourDraftId !== "string")
        state.ui.tourDraftId = state.ui.tourDraftId || null;
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
    if (!["charts", "quests", "requests", "eras"].includes(state.ui.dashboardFocusPanel)) {
        state.ui.dashboardFocusPanel = "charts";
    }
    if (!state.ui.activeView)
        state.ui.activeView = "dashboard";
    if (state.ui.activeView === "promotion") {
        state.ui.activeView = "logs";
    }
    else if (state.ui.activeView === "era") {
        state.ui.activeView = "eras";
    }
    if (!state.ui.tutorialTab || !["loops", "concepts", "economy", "roles"].includes(state.ui.tutorialTab)) {
        state.ui.tutorialTab = "loops";
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
            tourScheduled: true,
            rivalScheduled: true,
            rivalReleased: true
        };
    }
    else {
        const defaults = {
            labelScheduled: true,
            labelReleased: true,
            tourScheduled: true,
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
    if (!state.ui.tourVenueFilters || typeof state.ui.tourVenueFilters !== "object") {
        state.ui.tourVenueFilters = { nation: "All", regionId: "All", tier: "All" };
    }
    else {
        if (typeof state.ui.tourVenueFilters.nation !== "string")
            state.ui.tourVenueFilters.nation = "All";
        if (typeof state.ui.tourVenueFilters.regionId !== "string")
            state.ui.tourVenueFilters.regionId = "All";
        if (typeof state.ui.tourVenueFilters.tier !== "string")
            state.ui.tourVenueFilters.tier = "All";
    }
    if (!Number.isFinite(state.ui.tourBookingWeek))
        state.ui.tourBookingWeek = null;
    if (!Number.isFinite(state.ui.tourBookingDay))
        state.ui.tourBookingDay = null;
    if (state.ui.tourNotice && typeof state.ui.tourNotice !== "object")
        state.ui.tourNotice = null;
    if (typeof state.ui.slotTarget === "undefined")
        state.ui.slotTarget = null;
    if (!state.ui.createStage || !["sheet", "demo", "master"].includes(state.ui.createStage)) {
        state.ui.createStage = "sheet";
    }
    if (!state.ui.createMode || (state.ui.createMode !== "manual" && state.ui.createMode !== "auto")) {
        state.ui.createMode = "manual";
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
        if (typeof act.nameKey !== "string")
            act.nameKey = act.nameKey || null;
        if (typeof act.promoWeeks !== "number")
            act.promoWeeks = 0;
        if (typeof act.lastPromoAt !== "number")
            act.lastPromoAt = null;
        if (!act.promoTypesUsed || typeof act.promoTypesUsed !== "object")
            act.promoTypesUsed = {};
        if (!act.promoTypesLastAt || typeof act.promoTypesLastAt !== "object")
            act.promoTypesLastAt = {};
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
        if (!Array.isArray(rival.achievementsUnlocked))
            rival.achievementsUnlocked = [];
        if (typeof rival.achievements !== "number")
            rival.achievements = rival.achievementsUnlocked.length;
        rival.achievements = Math.max(rival.achievements, rival.achievementsUnlocked.length);
        if (typeof rival.achievementsLocked !== "boolean")
            rival.achievementsLocked = false;
        if (typeof rival.achievementFocus !== "string")
            rival.achievementFocus = null;
        if (typeof rival.promoRuns !== "number")
            rival.promoRuns = 0;
        if (typeof rival.eraCompletions !== "number")
            rival.eraCompletions = 0;
        if (typeof rival.ambition !== "number")
            rival.ambition = RIVAL_AMBITION_FLOOR;
        if (!rival.economy || typeof rival.economy !== "object") {
            rival.economy = { lastRevenue: 0, lastUpkeep: 0, lastWeek: 0, lastLeaseFees: 0 };
        }
        if (typeof rival.economy.lastRevenue !== "number")
            rival.economy.lastRevenue = 0;
        if (typeof rival.economy.lastUpkeep !== "number")
            rival.economy.lastUpkeep = 0;
        if (typeof rival.economy.lastWeek !== "number")
            rival.economy.lastWeek = 0;
        if (typeof rival.economy.lastLeaseFees !== "number")
            rival.economy.lastLeaseFees = 0;
        if (!rival.aiPlan || typeof rival.aiPlan !== "object") {
            rival.aiPlan = {
                lastPlannedWeek: null,
                lastHuskId: null,
                lastPlannedAt: null,
                activeHuskId: null,
                huskSource: null,
                windowStartWeekIndex: null,
                windowEndWeekIndex: null,
                lastCompletedWindow: null,
                dominanceScopeType: null,
                dominanceScopeKey: null,
                dominanceWeekIndex: null,
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
        if (typeof rival.aiPlan.lastCompletedWindow !== "number")
            rival.aiPlan.lastCompletedWindow = null;
        if (typeof rival.aiPlan.dominanceScopeType !== "string")
            rival.aiPlan.dominanceScopeType = null;
        if (typeof rival.aiPlan.dominanceScopeKey !== "string")
            rival.aiPlan.dominanceScopeKey = null;
        if (typeof rival.aiPlan.dominanceWeekIndex !== "number")
            rival.aiPlan.dominanceWeekIndex = null;
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
    if (!Array.isArray(state.meta.annualAwards))
        state.meta.annualAwards = [];
    state.meta.annualAwards = state.meta.annualAwards.filter(Boolean).map((entry) => {
        if (!entry || typeof entry !== "object")
            return null;
        const year = Number(entry.year);
        const awards = entry.awards && typeof entry.awards === "object" ? entry.awards : {};
        return Number.isFinite(year) ? { year, awards } : null;
    }).filter(Boolean);
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
    if (!state.meta.actPopularity || typeof state.meta.actPopularity !== "object") {
        state.meta.actPopularity = { years: {}, lastUpdateYear: null, lastUpdateWeek: null };
    }
    if (!state.meta.actPopularity.years || typeof state.meta.actPopularity.years !== "object") {
        state.meta.actPopularity.years = {};
    }
    if (typeof state.meta.actPopularity.lastUpdateYear !== "number")
        state.meta.actPopularity.lastUpdateYear = null;
    if (typeof state.meta.actPopularity.lastUpdateWeek !== "number")
        state.meta.actPopularity.lastUpdateWeek = null;
    if (!state.meta.labelShare || typeof state.meta.labelShare !== "object")
        state.meta.labelShare = {};
    if (!state.meta.labelCompetition || typeof state.meta.labelCompetition !== "object") {
        state.meta.labelCompetition = {};
    }
    if (!Number.isFinite(state.meta.labelShareWeek))
        state.meta.labelShareWeek = null;
    if (typeof state.meta.winShown !== "boolean")
        state.meta.winShown = false;
    if (typeof state.meta.endShown !== "boolean")
        state.meta.endShown = false;
    if (!state.meta.autoSave)
        state.meta.autoSave = { enabled: true, minutes: 2, lastSavedAt: null };
    if (typeof state.meta.autoSave.minutes !== "number")
        state.meta.autoSave.minutes = 2;
    if (typeof state.meta.autoSave.enabled !== "boolean")
        state.meta.autoSave.enabled = true;
    if (!state.meta.autoCreate) {
        state.meta.autoCreate = {
            enabled: false,
            lastRunAt: null,
            minCash: AUTO_CREATE_MIN_CASH,
            budgetPct: AUTO_CREATE_BUDGET_PCT,
            maxTracks: AUTO_CREATE_MAX_TRACKS,
            mode: "solo",
            lastOutcome: null
        };
    }
    if (typeof state.meta.autoCreate.enabled !== "boolean")
        state.meta.autoCreate.enabled = false;
    if (typeof state.meta.autoCreate.lastRunAt !== "number")
        state.meta.autoCreate.lastRunAt = null;
    if (typeof state.meta.autoCreate.minCash !== "number")
        state.meta.autoCreate.minCash = AUTO_CREATE_MIN_CASH;
    if (typeof state.meta.autoCreate.budgetPct !== "number")
        state.meta.autoCreate.budgetPct = AUTO_CREATE_BUDGET_PCT;
    if (typeof state.meta.autoCreate.maxTracks !== "number")
        state.meta.autoCreate.maxTracks = AUTO_CREATE_MAX_TRACKS;
    if (state.meta.autoCreate.mode !== "solo" && state.meta.autoCreate.mode !== "collab") {
        state.meta.autoCreate.mode = "solo";
    }
    state.meta.autoCreate.minCash = Math.max(0, Math.round(state.meta.autoCreate.minCash));
    state.meta.autoCreate.budgetPct = clamp(state.meta.autoCreate.budgetPct, 0, 1);
    state.meta.autoCreate.maxTracks = clamp(Math.round(state.meta.autoCreate.maxTracks), 1, 5);
    if (state.meta.autoCreate.lastOutcome && typeof state.meta.autoCreate.lastOutcome !== "object") {
        state.meta.autoCreate.lastOutcome = null;
    }
    if (state.meta.autoCreate.lastOutcome) {
        const outcome = state.meta.autoCreate.lastOutcome;
        if (typeof outcome.at !== "number")
            outcome.at = state.meta.autoCreate.lastRunAt || null;
        if (typeof outcome.status !== "string")
            outcome.status = "skipped";
        if (typeof outcome.message !== "string")
            outcome.message = "";
        if (typeof outcome.created !== "number")
            outcome.created = 0;
        if (typeof outcome.demoStarted !== "number")
            outcome.demoStarted = 0;
        if (typeof outcome.masterStarted !== "number")
            outcome.masterStarted = 0;
        if (typeof outcome.actsAssigned !== "number")
            outcome.actsAssigned = 0;
        if (typeof outcome.spent !== "number")
            outcome.spent = 0;
        if (typeof outcome.budgetCap !== "number")
            outcome.budgetCap = 0;
    }
    if (!state.meta.autoRollout) {
        state.meta.autoRollout = {
            enabled: false,
            lastCheckedAt: null,
            budgetPct: AUTO_PROMO_BUDGET_PCT,
            budgetPctSlots: buildAutoPromoBudgetSlots(AUTO_PROMO_BUDGET_PCT)
        };
    }
    if (typeof state.meta.autoRollout.enabled !== "boolean")
        state.meta.autoRollout.enabled = false;
    if (typeof state.meta.autoRollout.budgetPct !== "number") {
        state.meta.autoRollout.budgetPct = AUTO_PROMO_BUDGET_PCT;
    }
    state.meta.autoRollout.budgetPct = clamp(state.meta.autoRollout.budgetPct, 0, 1);
    state.meta.autoRollout.budgetPctSlots = normalizeAutoPromoBudgetSlots(state.meta.autoRollout.budgetPctSlots);
    const totalAutoBudget = state.meta.autoRollout.budgetPctSlots.reduce((sum, value) => sum + value, 0);
    if (!totalAutoBudget && state.meta.autoRollout.budgetPct > 0 && hasAutoPromoTargets) {
        state.meta.autoRollout.budgetPctSlots[0] = state.meta.autoRollout.budgetPct;
    }
    if (typeof state.meta.keepEraRolloutHusks !== "boolean")
        state.meta.keepEraRolloutHusks = true;
    if (typeof state.meta.touringBalanceEnabled !== "boolean")
        state.meta.touringBalanceEnabled = false;
    if (typeof state.meta.cheaterMode !== "boolean")
        state.meta.cheaterMode = false;
    ensureCheaterEconomyOverrides();
    applyCheaterEconomyOverrides();
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
    if (!Array.isArray(state.promoContent))
        state.promoContent = [];
    state.promoContent = state.promoContent.filter(Boolean).map((entry) => {
        const next = entry || {};
        if (!next.id)
            next.id = uid("PRC");
        if (!next.promoType)
            next.promoType = DEFAULT_PROMO_TYPE;
        if (!next.promoLabel)
            next.promoLabel = getPromoTypeDetails(next.promoType).label;
        if (typeof next.actNameKey !== "string")
            next.actNameKey = next.actNameKey || null;
        if (!Number.isFinite(next.budget))
            next.budget = 0;
        if (!Number.isFinite(next.weeks) || next.weeks <= 0)
            next.weeks = 1;
        if (!Number.isFinite(next.createdWeek))
            next.createdWeek = weekIndex() + 1;
        if (!Number.isFinite(next.createdAt))
            next.createdAt = state.time?.epochMs || Date.now();
        if (typeof next.isPlayer !== "boolean")
            next.isPlayer = false;
        if (!next.label && next.isPlayer && state.label?.name)
            next.label = state.label.name;
        if (!next.chartHistory || typeof next.chartHistory !== "object")
            next.chartHistory = {};
        return next;
    });
    const touring = ensureTouringStore();
    touring.drafts = touring.drafts.filter(Boolean).map((draft) => {
        const next = draft || {};
        if (!next.id)
            next.id = uid("TD");
        if (typeof next.name !== "string")
            next.name = "";
        next.goal = normalizeTourGoal(next.goal);
        if (typeof next.actId !== "string")
            next.actId = next.actId || null;
        if (typeof next.eraId !== "string")
            next.eraId = next.eraId || null;
        if (!Array.isArray(next.anchorTrackIds))
            next.anchorTrackIds = [];
        next.anchorTrackIds = next.anchorTrackIds.filter(Boolean);
        if (typeof next.anchorProjectId !== "string")
            next.anchorProjectId = next.anchorProjectId || null;
        if (!next.window || typeof next.window !== "object")
            next.window = { startWeek: null, endWeek: null };
        if (!Number.isFinite(next.window.startWeek))
            next.window.startWeek = null;
        if (!Number.isFinite(next.window.endWeek))
            next.window.endWeek = null;
        if (!Array.isArray(next.legs))
            next.legs = [];
        if (typeof next.notes !== "string")
            next.notes = "";
        if (!next.status)
            next.status = "Draft";
        if (typeof next.createdAt !== "number")
            next.createdAt = state.time?.epochMs || Date.now();
        if (typeof next.updatedAt !== "number")
            next.updatedAt = next.createdAt;
        return next;
    });
    touring.lastDraftId = Math.max(0, Math.round(Number(touring.lastDraftId) || 0));
    touring.bookings = touring.bookings.filter(Boolean).map((booking) => {
        const next = booking || {};
        if (!next.id)
            next.id = uid("TB");
        if (typeof next.tourId !== "string")
            next.tourId = next.tourId || null;
        if (typeof next.tourName !== "string")
            next.tourName = next.tourName || "";
        next.goal = normalizeTourGoal(next.goal);
        if (typeof next.actId !== "string")
            next.actId = next.actId || null;
        if (typeof next.actName !== "string")
            next.actName = next.actName || "";
        if (typeof next.actNameKey !== "string")
            next.actNameKey = next.actNameKey || null;
        if (typeof next.eraId !== "string")
            next.eraId = next.eraId || null;
        if (typeof next.eraName !== "string")
            next.eraName = next.eraName || "";
        if (typeof next.anchorTrackId !== "string")
            next.anchorTrackId = next.anchorTrackId || null;
        if (typeof next.anchorProjectName !== "string")
            next.anchorProjectName = next.anchorProjectName || null;
        if (typeof next.venueId !== "string")
            next.venueId = next.venueId || null;
        if (typeof next.venueLabel !== "string")
            next.venueLabel = next.venueLabel || "";
        if (typeof next.tier !== "string")
            next.tier = next.tier || null;
        if (!Number.isFinite(next.capacity))
            next.capacity = 0;
        if (typeof next.regionId !== "string")
            next.regionId = next.regionId || null;
        if (typeof next.nation !== "string")
            next.nation = next.nation || null;
        if (!Number.isFinite(next.scheduledAt))
            next.scheduledAt = null;
        if (!Number.isFinite(next.weekNumber))
            next.weekNumber = null;
        if (!Number.isFinite(next.dayIndex))
            next.dayIndex = null;
        if (typeof next.status !== "string")
            next.status = "Booked";
        if (next.status !== "Booked" && next.status !== "Completed")
            next.status = "Booked";
        if (!next.projection || typeof next.projection !== "object")
            next.projection = {};
        const projection = next.projection;
        projection.attendance = Math.round(Number(projection.attendance || 0));
        projection.revenue = Math.round(Number(projection.revenue || 0));
        projection.costs = Math.round(Number(projection.costs || 0));
        projection.profit = Math.round(Number(projection.profit || 0));
        projection.grossTicket = Math.round(Number(projection.grossTicket || 0));
        projection.merch = Math.round(Number(projection.merch || 0));
        projection.sponsorship = Math.round(Number(projection.sponsorship || 0));
        if (!Array.isArray(next.warnings))
            next.warnings = [];
        if (!Number.isFinite(next.attendance))
            next.attendance = null;
        if (!Number.isFinite(next.revenue))
            next.revenue = null;
        if (!Number.isFinite(next.costs))
            next.costs = null;
        if (!Number.isFinite(next.profit))
            next.profit = null;
        if (typeof next.createdAt !== "number")
            next.createdAt = state.time?.epochMs || Date.now();
        if (typeof next.updatedAt !== "number")
            next.updatedAt = next.createdAt;
        if (typeof next.label !== "string")
            next.label = next.label || "";
        if (typeof next.alignment !== "string")
            next.alignment = next.alignment || "";
        if (typeof next.country !== "string")
            next.country = next.country || "";
        if (!Number.isFinite(next.resolvedAt))
            next.resolvedAt = null;
        return next;
    });
    state.promoCharts = ensureChartStoreStructure(state.promoCharts);
    state.tourCharts = ensureChartStoreStructure(state.tourCharts);
    if (!state.tourChartHistory || typeof state.tourChartHistory !== "object")
        state.tourChartHistory = {};
    Object.values(state.tourChartHistory).forEach((entry) => {
        if (!entry || typeof entry !== "object")
            return;
        if (!entry.chartHistory || typeof entry.chartHistory !== "object")
            entry.chartHistory = {};
        if (typeof entry.actNameKey !== "string")
            entry.actNameKey = entry.actNameKey || null;
    });
    if (!state.economy) {
        state.economy = {
            lastRevenue: 0,
            lastUpkeep: 0,
            lastWeek: 0,
            leaseFeesWeek: 0,
            pendingTouring: { revenue: 0, costs: 0, profit: 0, attendance: 0, fanGain: 0, count: 0 },
            lastTouring: null,
            creatorMarketHeat: { Songwriter: 0, Performer: 0, Producer: 0 }
        };
    }
    if (typeof state.economy.leaseFeesWeek !== "number")
        state.economy.leaseFeesWeek = 0;
    if (!state.economy.pendingTouring || typeof state.economy.pendingTouring !== "object") {
        state.economy.pendingTouring = { revenue: 0, costs: 0, profit: 0, attendance: 0, fanGain: 0, count: 0 };
    }
    else {
        const pending = state.economy.pendingTouring;
        pending.revenue = Math.round(Number(pending.revenue || 0));
        pending.costs = Math.round(Number(pending.costs || 0));
        pending.profit = Math.round(Number(pending.profit || 0));
        pending.attendance = Math.round(Number(pending.attendance || 0));
        pending.fanGain = Math.round(Number(pending.fanGain || 0));
        pending.count = Math.max(0, Math.round(Number(pending.count || 0)));
    }
    if (state.economy.lastTouring && typeof state.economy.lastTouring !== "object") {
        state.economy.lastTouring = null;
    }
    if (state.economy.lastTouring) {
        const last = state.economy.lastTouring;
        last.revenue = Math.round(Number(last.revenue || 0));
        last.costs = Math.round(Number(last.costs || 0));
        last.profit = Math.round(Number(last.profit || 0));
        last.attendance = Math.round(Number(last.attendance || 0));
        last.fanGain = Math.round(Number(last.fanGain || 0));
        last.count = Math.max(0, Math.round(Number(last.count || 0)));
        if (!Number.isFinite(last.week))
            last.week = null;
        if (typeof last.balanceApplied !== "boolean")
            last.balanceApplied = false;
    }
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
        if (typeof era.projectName !== "string")
            era.projectName = era.projectName || null;
        if (typeof era.projectType !== "string")
            era.projectType = era.projectType || null;
        if (typeof era.projectStatus !== "string")
            era.projectStatus = "Open";
        if (typeof era.projectDeluxeName !== "string")
            era.projectDeluxeName = era.projectDeluxeName || null;
        if (typeof era.projectClosedAt !== "number")
            era.projectClosedAt = era.projectClosedAt || null;
        if (typeof era.projectClosedReason !== "string")
            era.projectClosedReason = era.projectClosedReason || null;
        if (typeof era.projectLastReleaseAt !== "number")
            era.projectLastReleaseAt = era.projectLastReleaseAt || null;
        if (typeof era.projectLastPromoAt !== "number")
            era.projectLastPromoAt = era.projectLastPromoAt || null;
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
        if (typeof era.projectName !== "string")
            era.projectName = era.projectName || null;
        if (typeof era.projectType !== "string")
            era.projectType = era.projectType || null;
        if (typeof era.projectStatus !== "string")
            era.projectStatus = "Open";
        if (typeof era.projectDeluxeName !== "string")
            era.projectDeluxeName = era.projectDeluxeName || null;
        if (typeof era.projectClosedAt !== "number")
            era.projectClosedAt = era.projectClosedAt || null;
        if (typeof era.projectClosedReason !== "string")
            era.projectClosedReason = era.projectClosedReason || null;
        if (typeof era.projectLastReleaseAt !== "number")
            era.projectLastReleaseAt = era.projectLastReleaseAt || null;
        if (typeof era.projectLastPromoAt !== "number")
            era.projectLastPromoAt = era.projectLastPromoAt || null;
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
        if (typeof next.contentId !== "string")
            next.contentId = next.contentId || null;
        if (typeof next.actId !== "string")
            next.actId = next.actId || null;
        if (typeof next.eraId !== "string")
            next.eraId = next.eraId || null;
        if (typeof next.facilityId !== "string")
            next.facilityId = getPromoFacilityForType(next.actionType) || null;
        if (typeof next.source !== "string")
            next.source = next.source || null;
        if (!Number.isFinite(next.budget))
            next.budget = 0;
        if (!Number.isFinite(next.weeks))
            next.weeks = 1;
        if (typeof next.targetType !== "string")
            next.targetType = next.targetType || null;
        if (typeof next.label !== "string")
            next.label = next.label || null;
        if (typeof next.projectName !== "string")
            next.projectName = next.projectName || null;
        if (typeof next.createdAt !== "number")
            next.createdAt = next.createdAt || state.time?.epochMs || Date.now();
        if (typeof next.lastAttemptReason !== "string")
            next.lastAttemptReason = next.lastAttemptReason || null;
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
        if (typeof next.actNameKey !== "string")
            next.actNameKey = next.actNameKey || null;
        if (queueType === "promo" && !next.promoType)
            next.promoType = AUTO_PROMO_RIVAL_TYPE;
        if (typeof next.releaseAt !== "number")
            next.releaseAt = state.time?.epochMs || Date.now();
        if (queueType === "release")
            next.projectType = normalizeProjectType(next.projectType || "Single");
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
    normalizeChartPulseScope();
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
            if (!Number.isFinite(track.qualityBase))
                track.qualityBase = track.quality;
            if (!Number.isFinite(track.qualityFinal))
                track.qualityFinal = track.quality;
            if (Number.isFinite(track.qualityFinal))
                track.quality = clampQuality(track.qualityFinal);
            if (track.criticScores && typeof track.criticScores !== "object")
                track.criticScores = null;
            if (!Number.isFinite(track.criticScore))
                track.criticScore = null;
            if (typeof track.criticGrade !== "string")
                track.criticGrade = track.criticGrade || null;
            if (!Number.isFinite(track.criticDelta))
                track.criticDelta = null;
            if (typeof track.trendAtRelease !== "boolean")
                track.trendAtRelease = false;
            if (!track.projectType)
                track.projectType = "Single";
            track.releaseType = normalizeReleaseType(track.releaseType, track.projectType);
            if (typeof track.projectEdition !== "string")
                track.projectEdition = track.projectEdition || null;
            if (!track.distribution)
                track.distribution = "Digital";
            if (!track.promo || typeof track.promo !== "object")
                track.promo = {};
            if (typeof track.promo.preReleaseWeeks !== "number")
                track.promo.preReleaseWeeks = 0;
            if (typeof track.promo.musicVideoUsed !== "boolean")
                track.promo.musicVideoUsed = false;
            if (!track.promo.typesUsed || typeof track.promo.typesUsed !== "object")
                track.promo.typesUsed = {};
            if (!track.promo.typesLastAt || typeof track.promo.typesLastAt !== "object")
                track.promo.typesLastAt = {};
            if (track.promo.musicVideoUsed && !Number.isFinite(track.promo.typesUsed.musicVideo)) {
                track.promo.typesUsed.musicVideo = 1;
            }
            if (typeof track.stageIndex !== "number") {
                track.stageIndex = track.status === "Ready" ? STAGES.length : 0;
            }
            if (!track.genre && track.theme && track.mood && ["Ready", "Scheduled", "Released"].includes(track.status)) {
                track.genre = makeGenre(track.theme, track.mood);
            }
            if (track.modifier && !track.modifier.id)
                track.modifier = getModifier(track.modifier);
            ensureTrackEconomy(track);
            if (track.status === "Released" && !Number.isFinite(track.criticScore)) {
                const marketEntry = track.marketId
                    ? state.marketTracks?.find((entry) => entry.id === track.marketId)
                    : state.marketTracks?.find((entry) => entry.trackId === track.id);
                applyCriticsReview({ track, marketEntry });
            }
        });
    }
    if (!state.inventory || typeof state.inventory !== "object")
        state.inventory = { modifiers: {} };
    const rawModifierInventory = state.inventory.modifiers;
    const modifierCounts = {};
    if (Array.isArray(rawModifierInventory)) {
        rawModifierInventory.forEach((entry) => {
            const id = typeof entry === "string" ? entry : entry?.id;
            if (!id)
                return;
            modifierCounts[id] = (modifierCounts[id] || 0) + 1;
        });
    }
    else if (rawModifierInventory && typeof rawModifierInventory === "object") {
        Object.entries(rawModifierInventory).forEach(([id, count]) => {
            const qty = Math.max(0, Math.floor(Number(count) || 0));
            if (id && qty > 0)
                modifierCounts[id] = qty;
        });
    }
    if (state.tracks?.length) {
        state.tracks.forEach((track) => {
            const modifierId = resolveModifier(track.modifier)?.id;
            if (modifierId && modifierId !== "None" && !modifierCounts[modifierId]) {
                modifierCounts[modifierId] = 1;
            }
        });
    }
    state.inventory.modifiers = modifierCounts;
    if (state.marketTracks?.length) {
        state.marketTracks.forEach((entry) => {
            if (!entry.distribution)
                entry.distribution = "Digital";
            entry.projectType = normalizeProjectType(entry.projectType || "Single");
            if (typeof entry.actNameKey !== "string")
                entry.actNameKey = entry.actNameKey || null;
            if (typeof entry.releasedAt !== "number")
                entry.releasedAt = state.time?.epochMs || Date.now();
            if (typeof entry.isPlayer !== "boolean")
                entry.isPlayer = false;
            if (typeof entry.trendAtRelease !== "boolean")
                entry.trendAtRelease = false;
            if (!Number.isFinite(entry.qualityBase))
                entry.qualityBase = entry.quality;
            if (!Number.isFinite(entry.qualityFinal))
                entry.qualityFinal = entry.quality;
            if (Number.isFinite(entry.qualityFinal))
                entry.quality = clampQuality(entry.qualityFinal);
            if (entry.criticScores && typeof entry.criticScores !== "object")
                entry.criticScores = null;
            if (!Number.isFinite(entry.criticScore))
                entry.criticScore = null;
            if (typeof entry.criticGrade !== "string")
                entry.criticGrade = entry.criticGrade || null;
            if (!Number.isFinite(entry.criticDelta))
                entry.criticDelta = null;
            if (!Number.isFinite(entry.criticScore) && Number.isFinite(entry.quality)) {
                applyCriticsReview({ marketEntry: entry });
            }
            if (!entry.promoTypesUsed || typeof entry.promoTypesUsed !== "object")
                entry.promoTypesUsed = {};
            if (!entry.promoTypesLastAt || typeof entry.promoTypesLastAt !== "object")
                entry.promoTypesLastAt = {};
            const originMeta = resolveTrackOriginMeta(entry);
            if (!Array.isArray(entry.creatorCountries) || !entry.creatorCountries.length) {
                entry.creatorCountries = originMeta.creatorCountries;
            }
            if (!entry.actCountry)
                entry.actCountry = originMeta.actCountry;
            if (entry.trackId) {
                const track = getTrack(entry.trackId);
                if (track?.promo?.typesUsed && typeof track.promo.typesUsed === "object") {
                    Object.entries(track.promo.typesUsed).forEach(([typeId, count]) => {
                        const existing = entry.promoTypesUsed[typeId];
                        if (!Number.isFinite(existing) || existing < count)
                            entry.promoTypesUsed[typeId] = count;
                    });
                }
                if (track?.promo?.typesLastAt && typeof track.promo.typesLastAt === "object") {
                    Object.entries(track.promo.typesLastAt).forEach(([typeId, stamp]) => {
                        const existing = entry.promoTypesLastAt[typeId];
                        if (!Number.isFinite(existing) || existing < stamp)
                            entry.promoTypesLastAt[typeId] = stamp;
                    });
                }
                if (track?.promo?.musicVideoUsed && !Number.isFinite(entry.promoTypesUsed.musicVideo)) {
                    entry.promoTypesUsed.musicVideo = 1;
                }
            }
            if (entry.isPlayer) {
                const originCountry = originMeta.actCountry
                    || dominantValue(originMeta.creatorCountries, entry.country || null)
                    || entry.country
                    || "Annglora";
                entry.country = originCountry;
            }
            else if (!entry.country && originMeta.actCountry) {
                entry.country = originMeta.actCountry;
            }
        });
    }
    if (state.meta?.marketTrackArchive?.length) {
        state.meta.marketTrackArchive = state.meta.marketTrackArchive.filter(Boolean).map((entry) => {
            if (!entry.distribution)
                entry.distribution = "Digital";
            entry.projectType = normalizeProjectType(entry.projectType || "Single");
            if (typeof entry.actNameKey !== "string")
                entry.actNameKey = entry.actNameKey || null;
            if (typeof entry.trendAtRelease !== "boolean")
                entry.trendAtRelease = false;
            if (typeof entry.isPlayer !== "boolean")
                entry.isPlayer = false;
            if (!Number.isFinite(entry.quality))
                entry.quality = 0;
            if (!Number.isFinite(entry.qualityBase))
                entry.qualityBase = entry.quality;
            if (!Number.isFinite(entry.qualityFinal))
                entry.qualityFinal = entry.quality;
            if (Number.isFinite(entry.qualityFinal))
                entry.quality = clampQuality(entry.qualityFinal);
            if (entry.criticScores && typeof entry.criticScores !== "object")
                entry.criticScores = null;
            if (!Number.isFinite(entry.criticScore))
                entry.criticScore = null;
            if (typeof entry.criticGrade !== "string")
                entry.criticGrade = entry.criticGrade || null;
            if (!Number.isFinite(entry.criticDelta))
                entry.criticDelta = null;
            if (!Number.isFinite(entry.releasedAt))
                entry.releasedAt = state.time?.epochMs || Date.now();
            if (!entry.projectName && entry.title)
                entry.projectName = `${entry.title} - Single`;
            if (!Array.isArray(entry.creatorCountries))
                entry.creatorCountries = [];
            return entry;
        });
    }
    if (!Array.isArray(state.releaseQueue))
        state.releaseQueue = [];
    state.releaseQueue = state.releaseQueue.map((entry) => {
        const releaseAt = Number.isFinite(entry.releaseAt) ? alignReleaseAtToProcessing(entry.releaseAt) : entry.releaseAt;
        return {
            ...entry,
            releaseAt,
            distribution: entry.distribution || entry.note || "Digital"
        };
    });
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
const RECOMMEND_VERSION = 2;
const GRADE_ORDER = ["S", "A", "B", "C", "D", "F"];
function gradeIndex(grade) {
    const index = GRADE_ORDER.indexOf(grade);
    return index >= 0 ? index : null;
}
function gradeRange(grade, radius = 1) {
    const index = gradeIndex(grade);
    if (index === null)
        return { grades: [], label: "" };
    const start = Math.max(0, index - radius);
    const end = Math.min(GRADE_ORDER.length - 1, index + radius);
    const grades = GRADE_ORDER.slice(start, end + 1);
    const label = grades.length ? `${grades[0]}-${grades[grades.length - 1]}` : "";
    return { grades, label };
}
function resolveTrackQualityScore(track) {
    if (!track)
        return null;
    if (Number.isFinite(track.qualityFinal) && track.qualityFinal > 0)
        return track.qualityFinal;
    if (Number.isFinite(track.quality) && track.quality > 0)
        return track.quality;
    if (Number.isFinite(track.qualityPotential) && track.qualityPotential > 0)
        return track.qualityPotential;
    return null;
}
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
        const avgCatharsis = members.length ? Math.round(averageSkill(members, { staminaAdjusted: true })) : 0;
        const avgSkill = members.length ? Math.round(averageSkill(members)) : 0;
        return { act, avgCatharsis, avgSkill };
    });
    scored.sort((a, b) => {
        if (b.avgCatharsis !== a.avgCatharsis)
            return b.avgCatharsis - a.avgCatharsis;
        if (b.avgSkill !== a.avgSkill)
            return b.avgSkill - a.avgSkill;
        return a.act.name.localeCompare(b.act.name);
    });
    return { actId: scored[0].act.id, reason: `Best average catharsis (${scored[0].avgCatharsis}).` };
}
function scoreActGenreMatch(act, theme, mood, alignment, targetGrade) {
    const members = act.memberIds.map((id) => getCreator(id)).filter(Boolean);
    const memberCount = members.length;
    if (!memberCount) {
        return {
            act,
            memberCount: 0,
            avgSkill: 0,
            avgCatharsis: 0,
            matchScore: 0,
            matchRate: 0,
            exactHits: 0,
            partialHits: 0,
            actAlignment: act?.alignment || "",
            alignmentMatch: false,
            catharsisGrade: scoreGrade(0),
            catharsisDistance: null,
            catharsisInRange: false
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
    const avgSkill = Math.round(averageSkill(members));
    // Catharsis reflects stamina-adjusted skill on the 0-100 scale.
    const avgCatharsis = Math.round(averageSkill(members, { staminaAdjusted: true }));
    const catharsisGrade = scoreGrade(avgCatharsis);
    const targetIndex = targetGrade ? gradeIndex(targetGrade) : null;
    const catharsisIndex = gradeIndex(catharsisGrade);
    const catharsisDistance = Number.isFinite(targetIndex) && Number.isFinite(catharsisIndex)
        ? Math.abs(catharsisIndex - targetIndex)
        : null;
    const catharsisInRange = Number.isFinite(catharsisDistance) ? catharsisDistance <= 1 : false;
    const actAlignment = ALIGNMENTS.includes(act?.alignment) ? act.alignment : (state.label?.alignment || "");
    const alignmentMatch = alignment ? actAlignment === alignment : false;
    return {
        act,
        memberCount,
        avgSkill,
        avgCatharsis,
        matchScore,
        matchRate,
        exactHits,
        partialHits,
        actAlignment,
        alignmentMatch,
        catharsisGrade,
        catharsisDistance,
        catharsisInRange
    };
}
function recommendActForTrack(track) {
    if (!state.acts.length) {
        return { version: RECOMMEND_VERSION, actId: null, reason: "No acts available yet." };
    }
    const theme = track?.theme || themeFromGenre(track?.genre);
    const mood = track?.mood || moodFromGenre(track?.genre);
    const hasGenreSignal = Boolean(theme || mood);
    const genre = theme && mood ? makeGenre(theme, mood) : (track?.genre || "");
    const alignmentRaw = track?.alignment || state.label?.alignment || "";
    const alignment = ALIGNMENTS.includes(alignmentRaw) ? alignmentRaw : "";
    const qualityScore = resolveTrackQualityScore(track);
    const trackGrade = qualityScore ? qualityGrade(qualityScore) : "";
    const gradeWindow = trackGrade ? gradeRange(trackGrade, 1) : { grades: [], label: "" };
    const scored = state.acts.map((act) => scoreActGenreMatch(act, theme, mood, alignment, trackGrade));
    const ranged = gradeWindow.grades.length ? scored.filter((entry) => entry.catharsisInRange) : [];
    const candidates = ranged.length ? ranged : scored;
    candidates.sort((a, b) => {
        if (b.matchRate !== a.matchRate)
            return b.matchRate - a.matchRate;
        if (b.matchScore !== a.matchScore)
            return b.matchScore - a.matchScore;
        if (b.alignmentMatch !== a.alignmentMatch)
            return b.alignmentMatch ? 1 : -1;
        if (Number.isFinite(a.catharsisDistance) && Number.isFinite(b.catharsisDistance)
            && a.catharsisDistance !== b.catharsisDistance) {
            return a.catharsisDistance - b.catharsisDistance;
        }
        if (b.avgCatharsis !== a.avgCatharsis)
            return b.avgCatharsis - a.avgCatharsis;
        if (b.avgSkill !== a.avgSkill)
            return b.avgSkill - a.avgSkill;
        return a.act.name.localeCompare(b.act.name);
    });
    const top = candidates[0];
    if (!top) {
        return { version: RECOMMEND_VERSION, actId: null, reason: "No acts available yet." };
    }
    const exactPossible = Boolean(theme && mood);
    const partialOnly = top.partialHits - top.exactHits;
    let preferenceReason = "";
    if (hasGenreSignal) {
        if (exactPossible) {
            const parts = [];
            if (top.exactHits)
                parts.push(`${top.exactHits}/${top.memberCount} exact`);
            if (partialOnly)
                parts.push(`${partialOnly}/${top.memberCount} partial`);
            if (!parts.length)
                parts.push("no member preferences aligned");
            preferenceReason = `Preference match for ${genre || "this track"}: ${parts.join(", ")}.`;
        }
        else if (theme) {
            preferenceReason = top.partialHits
                ? `Preference match for theme "${theme}": ${top.partialHits}/${top.memberCount} members.`
                : `No preference matches for theme "${theme}".`;
        }
        else {
            preferenceReason = top.partialHits
                ? `Preference match for mood "${mood}": ${top.partialHits}/${top.memberCount} members.`
                : `No preference matches for mood "${mood}".`;
        }
    }
    else {
        preferenceReason = "No theme or mood to match preferences.";
    }
    const alignmentReason = alignment
        ? (top.alignmentMatch
            ? `Alignment match: ${alignment}.`
            : `Alignment mismatch: Act ${top.actAlignment || "Unknown"} vs ${alignment}.`)
        : "";
    const rangeLabel = trackGrade ? `${trackGrade}+/-1 (${gradeWindow.label || trackGrade})` : "";
    const rangeNote = trackGrade && !ranged.length
        ? `No acts within ${rangeLabel} catharsis; picked closest fit.`
        : "";
    const catharsisReason = trackGrade
        ? `${top.catharsisInRange ? "Catharsis fit" : "Catharsis gap"}: ${top.catharsisGrade} (${top.avgCatharsis}) vs ${rangeLabel}.`
        : "Catharsis check skipped (no quality grade).";
    const reason = [
        preferenceReason,
        alignmentReason,
        rangeNote,
        catharsisReason
    ].filter(Boolean).join(" ");
    return {
        version: RECOMMEND_VERSION,
        actId: top.act.id,
        theme,
        mood,
        genre,
        memberCount: top.memberCount,
        exactMatches: top.exactHits,
        partialMatches: top.partialHits,
        catharsisGrade: top.catharsisGrade,
        catharsisScore: top.avgCatharsis,
        alignmentMatch: top.alignmentMatch,
        reason
    };
}
function recommendModifierId(theme, mood, crewIds = []) {
    const trendMatch = state.trends.includes(makeGenre(theme, mood));
    const owned = new Set(getOwnedModifierIds());
    const availableMods = MODIFIERS.filter((mod) => mod.id !== "None" && owned.has(mod.id));
    const alignment = state.label?.alignment || "Neutral";
    const isAffordable = (mod) => state.label.cash >= getStageCost(0, mod, crewIds);
    const matchesContent = (mod) => modifierMatchesContent(mod, { theme, mood, alignment });
    if (trendMatch) {
        const targetedQuality = availableMods.filter((mod) => mod.qualityDelta > 0 && matchesContent(mod) && isAffordable(mod));
        if (targetedQuality.length) {
            return { modifierId: targetedQuality[0].id, reason: "Boost quality for the current genre." };
        }
        const qualityMods = availableMods.filter((mod) => mod.qualityDelta > 0 && isAffordable(mod));
        if (qualityMods.length) {
            return { modifierId: qualityMods[0].id, reason: "Invest in quality while trend is hot." };
        }
    }
    const speedMods = availableMods.filter((mod) => mod.hoursDelta < 0 && isAffordable(mod));
    if (!trendMatch && speedMods.length) {
        return { modifierId: speedMods[0].id, reason: "Favor speed on a colder week." };
    }
    if (availableMods.length) {
        const affordable = availableMods.find((mod) => isAffordable(mod));
        return { modifierId: (affordable || availableMods[0]).id, reason: "Standard budget tier." };
    }
    return { modifierId: "None", reason: "No modifier tools owned yet." };
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
function collectKnownLabelNames() {
    const labels = new Set();
    const addLabel = (name) => {
        if (typeof name !== "string")
            return;
        const trimmed = name.trim();
        if (!trimmed)
            return;
        labels.add(trimmed);
    };
    addLabel(state.label?.name);
    if (Array.isArray(state.rivals)) {
        state.rivals.forEach((rival) => addLabel(rival?.name));
    }
    if (Array.isArray(state.marketTracks)) {
        state.marketTracks.forEach((entry) => addLabel(entry?.label));
    }
    return labels;
}
function computeLabelScores() {
    const labelScores = computeLabelScoresFromCharts();
    const knownLabels = collectKnownLabelNames();
    knownLabels.forEach((label) => {
        if (!Number.isFinite(labelScores[label]))
            labelScores[label] = 0;
    });
    return labelScores;
}
function getLabelRanking(limit) {
    const ranking = Object.entries(computeLabelScores())
        .sort((a, b) => {
        const diff = b[1] - a[1];
        if (diff !== 0)
            return diff;
        return String(a[0]).localeCompare(String(b[0]));
    });
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
        const promoGapPenalty = getTrackPromoGapPenalty(track);
        const actStalePenalty = getActPromoStalePenaltyForTrack(track);
        const score = track.quality
            + Math.max(0, 12 - track.weeksOnChart) * 5
            + track.promoWeeks * 4
            + actPromoWeeks * 2
            - promoGapPenalty
            - actStalePenalty;
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
    return { name: act.name, nameKey: act.nameKey || null, initials, color, textColor };
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
    const ageGroups = buildAudienceAgeGroupDistribution(total);
    const nations = NATIONS.map((nation) => {
        const nationPop = roundToThousandUp(total * splits[nation]);
        const capitalPop = roundToThousandUp(nationPop * REGION_CAPITAL_SHARE);
        const elsewherePop = Math.max(0, nationPop - capitalPop);
        return {
            nation,
            total: nationPop,
            capital: capitalPop,
            elsewhere: elsewherePop,
            ageGroups: buildAudienceAgeGroupDistribution(nationPop)
        };
    });
    return { total, stage: stage.id, ageGroups, nations };
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
    if (!state.population.snapshot
        || !Array.isArray(state.population.snapshot.ageGroups)
        || !Array.isArray(state.population.snapshot.nations)
        || state.population.snapshot.nations.some((entry) => !Array.isArray(entry.ageGroups))) {
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
            actNameKey: act?.nameKey || null,
            label: labelName,
            kind: "labelScheduled",
            typeLabel: "Scheduled",
            distribution: entry.distribution || entry.note || "Digital"
        };
    });
    const scheduledEvents = ensureScheduledEventsStore()
        .filter((entry) => Number.isFinite(entry.scheduledAt))
        .map((entry) => {
        const track = entry.contentId ? getTrack(entry.contentId) : null;
        const project = entry.targetType === "project" && entry.contentId ? parsePromoProjectKey(entry.contentId) : null;
        const act = entry.actId ? getAct(entry.actId) : track ? getAct(track.actId) : null;
        const typeLabel = rolloutEventLabel(entry.actionType);
        const scheduledAt = Number.isFinite(entry.eventAt) ? entry.eventAt : entry.scheduledAt;
        const title = track?.title || project?.projectName || typeLabel;
        const distribution = entry.source === "manualPromo"
            ? entry.facilityId
                ? promoFacilityLabel(entry.facilityId)
                : "eyeriSocial"
            : undefined;
        return {
            id: entry.id,
            ts: scheduledAt,
            title,
            actName: act ? act.name : "Unknown",
            actNameKey: act?.nameKey || null,
            label: labelName,
            kind: "labelEvent",
            typeLabel,
            distribution
        };
    });
    labelScheduled.push(...scheduledEvents);
    const labelReleased = state.marketTracks
        .filter((entry) => entry.isPlayer)
        .map((entry) => ({
        id: entry.id,
        ts: entry.releasedAt,
        title: entry.title,
        actName: entry.actName || "Unknown",
        actNameKey: entry.actNameKey || null,
        label: entry.label || labelName,
        kind: "labelReleased",
        typeLabel: "Released",
        distribution: entry.distribution || "Digital"
    }));
    const tourScheduled = listTourBookings()
        .filter((booking) => booking && Number.isFinite(booking.scheduledAt))
        .map((booking) => {
        const warningCount = Array.isArray(booking.warnings) ? booking.warnings.length : 0;
        const isWarning = warningCount > 0;
        return {
            id: booking.id,
            ts: booking.scheduledAt,
            title: booking.tourName || `${booking.actName || "Act"} Tour`,
            actName: booking.actName || "Unknown",
            actNameKey: booking.actNameKey || null,
            label: booking.label || labelName,
            kind: isWarning ? "tourWarning" : "tourScheduled",
            className: isWarning ? "tour-warning" : "tour-scheduled",
            typeLabel: isWarning ? "Tour Warning" : "Tour",
            distribution: booking.venueLabel || "Venue"
        };
    });
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
            actNameKey: entry.actNameKey || null,
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
            actNameKey: entry.actNameKey || null,
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
            actNameKey: act?.nameKey || null,
            stageName,
            startedWeek: era.startedWeek,
            content
        };
    });
    return { labelScheduled, labelReleased, tourScheduled, rivalScheduled, rivalReleased, eras };
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
function setTimeSpeed(nextSpeed, options = {}) {
    const skipAutoStop = options?.skipAutoStop;
    if (!skipAutoStop && typeof window !== "undefined" && typeof window.stopAutoSkips === "function") {
        window.stopAutoSkips();
    }
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
export { getActNameTranslation, hasHangulText, lookupActNameDetails, ACT_PROMO_WARNING_WEEKS, ACHIEVEMENTS, ACHIEVEMENT_TARGET, CREATOR_FALLBACK_EMOJI, CREATOR_FALLBACK_ICON, DAY_MS, DEFAULT_GAME_DIFFICULTY, DEFAULT_GAME_MODE, DEFAULT_TRACK_SLOT_VISIBLE, MARKET_ROLES, QUARTERS_PER_HOUR, RESOURCE_TICK_LEDGER_LIMIT, ROLE_ACTIONS, ROLE_ACTION_STATUS, STAGE_STUDIO_LIMIT, STAMINA_OVERUSE_LIMIT, STUDIO_COLUMN_SLOT_COUNT, TRACK_ROLE_KEYS, TRACK_ROLE_TARGETS, TREND_DETAIL_COUNT, UI_REACT_ISLANDS_ENABLED, UNASSIGNED_CREATOR_EMOJI, UNASSIGNED_CREATOR_LABEL, UNASSIGNED_SLOT_LABEL, WEEKLY_SCHEDULE, acceptBailout, addRolloutStrategyDrop, addRolloutStrategyEvent, advanceHours, autoGenerateTourDates, alignmentClass, assignToSlot, assignTrackAct, attemptSignCreator, buildCalendarProjection, bookTourDate, buildPromoProjectKey, buildPromoProjectKeyFromTrack, buildMarketCreators, buildStudioEntries, buildTrackHistoryScopes, chartScopeLabel, chartWeightsForScope, checkPrimeShowcaseEligibility, clamp, clearSlot, collectTrendRanking, commitSlotChange, computeAutoCreateBudget, computeAutoPromoBudget, ensureAutoPromoBudgetSlots, ensureAutoPromoSlots, computeChartProjectionForScope, computeCharts, computePopulationSnapshot, computeTourDraftSummary, computeTourProjection, countryColor, countryDemonym, createRolloutStrategyFromTemplate, createRolloutStrategyForEra, createTrack, createTourDraft, evaluateProjectTrackConstraints, creatorInitials, currentYear, declineBailout, deleteSlot, deleteTourDraft, endEraById, ensureMarketCreators, ensureTrackSlotArrays, ensureTrackSlotVisibility, expandRolloutStrategy, formatCount, formatDate, formatGenreKeyLabel, formatGenreLabel, formatHourCountdown, formatMoney, formatShortDate, formatWeekRangeLabel, getAct, getActPopularityLeaderboard, getActiveEras, getAdjustedStageHours, getAdjustedTotalStageHours, getBusyCreatorIds, getCommunityLabelRankingLimit, getCommunityTrendRankingLimit, getCreator, getCreatorPortraitUrl, getCreatorSignLockout, getCreatorStaminaSpentToday, getCrewStageStats, getEraById, getFocusedEra, getGameDifficulty, getGameMode, getLabelRanking, getLatestActiveEraForAct, getLossArchives, getModifier, getModifierInventoryCount, getOwnedStudioSlots, getPromoFacilityAvailability, getPromoFacilityForType, getProjectTrackLimits, getReleaseAsapAt, getReleaseAsapHours, getReleaseDistributionFee, getRivalByName, getRolloutPlanningEra, getRolloutStrategiesForEra, getRolloutStrategyById, getSlotData, getSlotGameMode, getSlotValue, getStageCost, getStageStudioAvailable, getStudioAvailableSlots, getStudioMarketSnapshot, getStudioUsageCounts, getTopActSnapshot, getTopTrendGenre, getTrack, getTrackRoleIds, getTrackRoleIdsFromSlots, getSelectedTourDraft, getTourDraftById, getTourTierConfig, getTourVenueAvailability, getTourVenueById, getWorkOrderCreatorIds, handleFromName, hoursUntilNextScheduledTime, isMasteringTrack, listFromIds, listTourBookings, listTourDrafts, listTourTiers, listTourVenues, listGameDifficulties, listGameModes, loadLossArchives, loadSlot, logEvent, makeAct, makeActName, makeActNameEntry, makeEraName, makeGenre, makeLabelName, makeProjectTitle, makeTrackTitle, markCreatorPromo, recordPromoUsage, recordTrackPromoCost, recordPromoContent, markUiLogStart, moodFromGenre, normalizeCreator, normalizeProjectName, normalizeProjectType, normalizeRoleIds, PROJECT_TITLE_TRANSLATIONS, parseAutoPromoSlotTarget, parsePromoProjectKey, parseTrackRoleTarget, pickDistinct, postCreatorSigned, purchaseModifier, pruneCreatorSignLockouts, qualityGrade, rankCandidates, recommendActForTrack, recommendPhysicalRun, recommendReleasePlan, recommendTrackPlan, releaseTrack, releasedTracks, resolveTrackReleaseType, resolveTourAnchor, removeTourBooking, reservePromoFacilitySlot, scheduleManualPromoEvent, resetState, roleLabel, safeAvatarUrl, saveToActiveSlot, scheduleRelease, scoreGrade, session, setCheaterEconomyOverride, setCheaterMode, setFocusEraById, setSelectedRolloutStrategyId, selectTourDraft, setSlotTarget, setTouringBalanceEnabled, setTimeSpeed, shortGameModeLabel, slugify, staminaRequirement, startDemoStage, startEraForAct, startGameLoop, startMasterStage, state, syncLabelWallets, themeFromGenre, trackKey, trackRoleLimit, touringBalanceEnabled, trendAlignmentLeader, updateTourDraft, uid, validateTourBooking, weekStartEpochMs, weekIndex, weekNumberFromEpochMs, };
if (typeof window !== "undefined") {
    window.rlsState = state;
    window.rlsBuildCalendarProjection = buildCalendarProjection;
    window.rlsBridge = { state, buildCalendarProjection };
}
//# sourceMappingURL=game.js.map