// @ts-nocheck
import * as game from "./game.js";
import { loadCSV } from "./csv.js";
import { fetchChartSnapshot, listChartWeeks } from "./db.js";
import { buildPromoHint, DEFAULT_PROMO_TYPE, getPromoTypeCosts, getPromoTypeDetails } from "./promo_types.js";
const { $, state, session, openOverlay, closeOverlay, renderAutoAssignModal, rankCandidates, renderSlots, logEvent, renderStats, saveToActiveSlot, makeTrackTitle, makeProjectTitle, makeLabelName, getModifier, staminaRequirement, getCreatorStaminaSpentToday, STAMINA_OVERUSE_LIMIT, getCrewStageStats, getAdjustedStageHours, getAdjustedTotalStageHours, getStageCost, createTrack, startDemoStage, startMasterStage, advanceHours, renderAll, renderCreateStageControls, makeActName, makeAct, renderActs, renderCreators, pickDistinct, getAct, getCreator, makeEraName, getEraById, getActiveEras, getStudioAvailableSlots, getFocusedEra, getRolloutPlanningEra, setFocusEraById, startEraForAct, endEraById, createRolloutStrategyForEra, getRolloutStrategyById, setSelectedRolloutStrategyId, addRolloutStrategyDrop, addRolloutStrategyEvent, expandRolloutStrategy, uid, weekIndex, renderEraStatus, renderTracks, renderReleaseDesk, clamp, getTrack, assignTrackAct, releaseTrack, scheduleRelease, getReleaseAsapHours, buildMarketCreators, normalizeCreator, postCreatorSigned, openMainMenu, getSlotData, resetState, refreshSelectOptions, computeCharts, closeMainMenu, startGameLoop, setTimeSpeed, markUiLogStart, updateActMemberFields, renderQuickRecipes, renderCalendarList, renderCalendarView, renderGenreIndex, renderCommunityRankings, renderStudiosList, renderRoleActions, renderCharts, renderWallet, acceptBailout, declineBailout, renderSocialFeed, updateGenrePreview, renderMainMenu, formatCount, formatMoney, formatDate, formatWeekRangeLabel, getCommunityRankingLimit, renderRankingModal, handleFromName, setSlotTarget, assignToSlot, clearSlot, shakeSlot, shakeField, getSlotElement, getSlotValue, describeSlot, loadSlot, deleteSlot, getLossArchives, recommendTrackPlan, recommendActForTrack, recommendReleasePlan, markCreatorPromo, getPromoFacilityForType, getPromoFacilityAvailability, reservePromoFacilitySlot, ensureMarketCreators, attemptSignCreator, listGameModes, DEFAULT_GAME_MODE, listGameDifficulties, DEFAULT_GAME_DIFFICULTY, shakeElement } = game;
const ROUTES = ["dashboard", "charts", "create", "releases", "eras", "roster", "world", "logs"];
const DEFAULT_ROUTE = "dashboard";
const ROUTE_ALIASES = {
    promotion: "logs",
    promotions: "logs",
    era: "eras",
    calendar: "releases"
};
const VIEW_PANEL_STATE_KEY = "rls_view_panel_state_v1";
const UI_EVENT_LOG_KEY = "rls_ui_event_log_v1";
const GAME_MODE_KEY = "rls_game_mode_v1";
const GAME_DIFFICULTY_KEY = "rls_game_difficulty_v1";
const START_PREFS_KEY = "rls_start_prefs_v1";
let activeRoute = DEFAULT_ROUTE;
let hasMountedRoute = false;
let chartHistoryRequestId = 0;
const CALENDAR_WHEEL_THRESHOLD = 120;
const CALENDAR_WHEEL_RESET_MS = 320;
const CALENDAR_DRAG_THRESHOLD = 80;
const CALENDAR_VELOCITY_THRESHOLD = 0.55;
let calendarWheelAcc = 0;
let calendarWheelAt = 0;
let calendarDragState = null;
const TRACK_ROLE_KEYS = {
    Songwriter: "songwriterIds",
    Performer: "performerIds",
    Producer: "producerIds"
};
const TRACK_ROLE_TARGETS = {
    Songwriter: "track-writer-1",
    Performer: "track-performer-1",
    Producer: "track-producer-1"
};
const ROLE_LABELS = {
    Songwriter: "Songwriter",
    Performer: "Performer",
    Producer: "Producer"
};
function calendarAnchorWeek() {
    return Number.isFinite(state.ui?.calendarWeekIndex) ? state.ui.calendarWeekIndex : weekIndex();
}
function setCalendarAnchorWeek(next) {
    const clamped = Math.max(0, Math.round(next));
    if (state.ui.calendarWeekIndex === clamped)
        return false;
    state.ui.calendarWeekIndex = clamped;
    renderCalendarView();
    saveToActiveSlot();
    return true;
}
function shiftCalendarAnchorWeek(delta) {
    if (!delta)
        return false;
    return setCalendarAnchorWeek(calendarAnchorWeek() + delta);
}
function handleCalendarWheel(e) {
    const now = Date.now();
    if (now - calendarWheelAt > CALENDAR_WHEEL_RESET_MS)
        calendarWheelAcc = 0;
    calendarWheelAt = now;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (!Number.isFinite(delta) || delta === 0)
        return;
    calendarWheelAcc += delta;
    if (Math.abs(calendarWheelAcc) < CALENDAR_WHEEL_THRESHOLD)
        return;
    const direction = calendarWheelAcc > 0 ? 1 : -1;
    calendarWheelAcc = 0;
    shiftCalendarAnchorWeek(direction);
}
function handleCalendarPointerDown(e) {
    if (e.button && e.button !== 0)
        return;
    calendarDragState = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startAt: Date.now(),
        lastX: e.clientX,
        lastY: e.clientY
    };
    if (typeof e.currentTarget?.setPointerCapture === "function") {
        e.currentTarget.setPointerCapture(e.pointerId);
    }
}
function handleCalendarPointerMove(e) {
    if (!calendarDragState || e.pointerId !== calendarDragState.pointerId)
        return;
    calendarDragState.lastX = e.clientX;
    calendarDragState.lastY = e.clientY;
}
function handleCalendarPointerEnd(e) {
    if (!calendarDragState || e.pointerId !== calendarDragState.pointerId)
        return;
    const drag = calendarDragState;
    calendarDragState = null;
    if (typeof e.currentTarget?.releasePointerCapture === "function") {
        e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const endX = Number.isFinite(e.clientX) ? e.clientX : drag.lastX;
    const endY = Number.isFinite(e.clientY) ? e.clientY : drag.lastY;
    const dx = endX - drag.startX;
    const dy = endY - drag.startY;
    const dt = Math.max(1, Date.now() - drag.startAt);
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const primaryDelta = absX >= absY ? dx : dy;
    const primaryAbs = Math.abs(primaryDelta);
    const velocity = primaryAbs / dt;
    if (primaryAbs < CALENDAR_DRAG_THRESHOLD && velocity < CALENDAR_VELOCITY_THRESHOLD)
        return;
    const direction = primaryDelta < 0 ? 1 : -1;
    shiftCalendarAnchorWeek(direction);
}
function roleLabel(role) {
    return ROLE_LABELS[role] || role;
}
function getTrackSlotIds(role) {
    const key = TRACK_ROLE_KEYS[role];
    if (!key || !state.ui?.trackSlots)
        return [];
    const list = Array.isArray(state.ui.trackSlots[key]) ? state.ui.trackSlots[key] : [];
    return list.filter(Boolean);
}
function isCreatorOveruseSafe(creator, staminaCost) {
    if (!creator)
        return false;
    if (!Number.isFinite(staminaCost) || staminaCost <= 0)
        return true;
    return getCreatorStaminaSpentToday(creator) + staminaCost <= STAMINA_OVERUSE_LIMIT;
}
function setTrackSlotIds(role, ids) {
    const key = TRACK_ROLE_KEYS[role];
    const limit = TRACK_ROLE_LIMITS?.[role] || 1;
    if (!key)
        return;
    const next = Array.from({ length: limit }, () => null);
    const req = staminaRequirement(role);
    const blocked = [];
    const eligible = ids.filter((id) => {
        const creator = getCreator(id);
        if (!creator || creator.stamina < req)
            return false;
        if (!isCreatorOveruseSafe(creator, req)) {
            blocked.push(creator);
            return false;
        }
        return true;
    });
    eligible.slice(0, limit).forEach((id, index) => {
        next[index] = id;
    });
    if (!state.ui.trackSlots) {
        state.ui.trackSlots = {
            actId: null,
            songwriterIds: Array.from({ length: TRACK_ROLE_LIMITS?.Songwriter || 1 }, () => null),
            performerIds: Array.from({ length: TRACK_ROLE_LIMITS?.Performer || 1 }, () => null),
            producerIds: Array.from({ length: TRACK_ROLE_LIMITS?.Producer || 1 }, () => null)
        };
    }
    state.ui.trackSlots[key] = next;
    if (blocked.length) {
        const names = blocked.map((creator) => creator.name).join(", ");
        logEvent(`Skipped ${roleLabel(role)} due to daily stamina limit (${STAMINA_OVERUSE_LIMIT}): ${names}.`, "warn");
    }
}
function primaryTrackSlotTarget(role) {
    return TRACK_ROLE_TARGETS[role] || "track-writer-1";
}
function collectAssignedTrackSlotIds(excludeId) {
    const ids = new Set([
        ...getTrackSlotIds("Songwriter"),
        ...getTrackSlotIds("Performer"),
        ...getTrackSlotIds("Producer")
    ]);
    if (excludeId)
        ids.delete(excludeId);
    return ids;
}
function recommendCreatorForSlot(targetId) {
    const slot = getSlotElement(targetId);
    if (!slot)
        return;
    const role = slot.dataset.slotRole;
    if (!role) {
        logEvent("This slot does not support creator recommendations.", "warn");
        return;
    }
    const currentId = getSlotValue(targetId);
    const assigned = collectAssignedTrackSlotIds(currentId);
    const req = staminaRequirement(role);
    const candidates = rankCandidates(role).filter((creator) => creator.ready && !assigned.has(creator.id));
    const safe = candidates.filter((creator) => isCreatorOveruseSafe(creator, req));
    if (!safe.length) {
        shakeSlot(targetId);
        if (!candidates.length) {
            logEvent(`No available ${roleLabel(role)} creators with ${req} stamina.`, "warn");
        }
        else {
            logEvent(`No available ${roleLabel(role)} creators under daily limit (${STAMINA_OVERUSE_LIMIT}).`, "warn");
        }
        return;
    }
    const picked = safe[0];
    assignToSlot(targetId, "creator", picked.id);
    logEvent(`Recommended ${picked.name} for ${describeSlot(targetId)}.`);
}
const expandedPanels = [];
const PANEL_LAYOUT_KEY = "rls_panel_layout_v1";
const SIDE_LAYOUT_KEY = "rls_side_layout_v1";
let isRestoringLayout = false;
const sideLayout = {
    leftCollapsed: false,
    rightCollapsed: false
};
const PANEL_STATES = {
    collapsed: "collapsed",
    expanded: "expanded",
    open: "open"
};
const MAIN_SURFACES = ["dashboard-overview", "charts", "create-track", "calendar-view", "release-desk", "era-desk"];
const VIEW_PANEL_STATES = {
    open: "open",
    hidden: "hidden"
};
const VIEW_DEFAULTS = {
    dashboard: {
        "dashboard-overview": VIEW_PANEL_STATES.open,
        "dashboard-pipeline": VIEW_PANEL_STATES.open,
        "dashboard-charts": VIEW_PANEL_STATES.open,
        "dashboard-eras": VIEW_PANEL_STATES.open
    },
    charts: {
        "charts": VIEW_PANEL_STATES.open,
        "release-desk": VIEW_PANEL_STATES.open,
        "label-rankings": VIEW_PANEL_STATES.open
    },
    create: {
        "create-track": VIEW_PANEL_STATES.open,
        "tracks": VIEW_PANEL_STATES.open
    },
    releases: {
        "calendar-view": VIEW_PANEL_STATES.open,
        "release-desk": VIEW_PANEL_STATES.open,
        "tracks": VIEW_PANEL_STATES.open
    },
    eras: {
        "era-desk": VIEW_PANEL_STATES.open,
        "tracks": VIEW_PANEL_STATES.open
    },
    roster: {
        "harmony-hub": VIEW_PANEL_STATES.open,
        "communities": VIEW_PANEL_STATES.open,
        "label-settings": VIEW_PANEL_STATES.open
    },
    world: {
        "ccc-market": VIEW_PANEL_STATES.open,
        "trends": VIEW_PANEL_STATES.open,
        "top-labels": VIEW_PANEL_STATES.open
    },
    logs: {
        "eyerisocial": VIEW_PANEL_STATES.open,
        "resource-ticks": VIEW_PANEL_STATES.open,
        "system-log": VIEW_PANEL_STATES.open
    }
};
function getPanelTray() {
    return document.querySelector("#panelTray");
}
function updatePanelTrayVisibility() {
    const tray = getPanelTray();
    if (!tray)
        return;
    tray.classList.toggle("has-panels", !!tray.querySelector(".panel.card"));
}
function loadSideLayout() {
    const raw = localStorage.getItem(SIDE_LAYOUT_KEY);
    if (!raw)
        return;
    try {
        const parsed = JSON.parse(raw);
        sideLayout.leftCollapsed = !!parsed.leftCollapsed;
        sideLayout.rightCollapsed = !!parsed.rightCollapsed;
    }
    catch {
        // ignore invalid layout
    }
}
function saveSideLayout() {
    localStorage.setItem(SIDE_LAYOUT_KEY, JSON.stringify(sideLayout));
}
function updateSideToggleButtons(leftCollapsed, rightCollapsed) {
    const leftBtn = $("toggleLeftBtn");
    if (leftBtn) {
        leftBtn.classList.toggle("active", !leftCollapsed);
        leftBtn.setAttribute("aria-pressed", String(!leftCollapsed));
        leftBtn.title = leftCollapsed ? "Expand left panels" : "Collapse left panels";
    }
    const rightBtn = $("toggleRightBtn");
    if (rightBtn) {
        rightBtn.classList.toggle("active", !rightCollapsed);
        rightBtn.setAttribute("aria-pressed", String(!rightCollapsed));
        rightBtn.title = rightCollapsed ? "Expand right panels" : "Collapse right panels";
    }
}
function getStoredGameMode() {
    if (typeof localStorage === "undefined")
        return DEFAULT_GAME_MODE;
    return localStorage.getItem(GAME_MODE_KEY) || DEFAULT_GAME_MODE;
}
function setStoredGameMode(modeId) {
    if (typeof localStorage === "undefined")
        return;
    localStorage.setItem(GAME_MODE_KEY, modeId);
}
function getSelectedGameModeId() {
    const select = $("gameModeSelect");
    return select?.value || getStoredGameMode();
}
function syncGameModeSelect() {
    const select = $("gameModeSelect");
    if (!select)
        return;
    const modes = listGameModes();
    select.innerHTML = modes.map((mode) => `<option value="${mode.id}">${mode.label}</option>`).join("");
    const stored = getStoredGameMode();
    select.value = modes.some((mode) => mode.id === stored) ? stored : DEFAULT_GAME_MODE;
    const hint = $("gameModeHint");
    const active = modes.find((mode) => mode.id === select.value);
    if (hint)
        hint.textContent = active?.description || "";
    if (!select.dataset.bound) {
        select.dataset.bound = "1";
        select.addEventListener("change", () => {
            const next = select.value || DEFAULT_GAME_MODE;
            setStoredGameMode(next);
            const nextMode = modes.find((mode) => mode.id === next);
            if (hint)
                hint.textContent = nextMode?.description || "";
        });
    }
}
function getStoredGameDifficulty() {
    if (typeof localStorage === "undefined")
        return DEFAULT_GAME_DIFFICULTY;
    return localStorage.getItem(GAME_DIFFICULTY_KEY) || DEFAULT_GAME_DIFFICULTY;
}
function setStoredGameDifficulty(difficultyId) {
    if (typeof localStorage === "undefined")
        return;
    localStorage.setItem(GAME_DIFFICULTY_KEY, difficultyId);
}
function getSelectedGameDifficultyId() {
    const select = $("difficultySelect");
    return select?.value || getStoredGameDifficulty();
}
function syncDifficultySelect() {
    const select = $("difficultySelect");
    if (!select)
        return;
    const difficulties = listGameDifficulties();
    select.innerHTML = difficulties.map((difficulty) => `<option value="${difficulty.id}">${difficulty.label}</option>`).join("");
    const stored = getStoredGameDifficulty();
    select.value = difficulties.some((difficulty) => difficulty.id === stored) ? stored : DEFAULT_GAME_DIFFICULTY;
    const hint = $("difficultyHint");
    const active = difficulties.find((difficulty) => difficulty.id === select.value);
    if (hint)
        hint.textContent = active?.description || "";
    if (!select.dataset.bound) {
        select.dataset.bound = "1";
        select.addEventListener("change", () => {
            const next = select.value || DEFAULT_GAME_DIFFICULTY;
            setStoredGameDifficulty(next);
            const nextDifficulty = difficulties.find((difficulty) => difficulty.id === next);
            if (hint)
                hint.textContent = nextDifficulty?.description || "";
        });
    }
}
function loadStartPreferences() {
    if (typeof localStorage === "undefined")
        return null;
    const raw = localStorage.getItem(START_PREFS_KEY);
    if (!raw)
        return null;
    try {
        return JSON.parse(raw) || null;
    }
    catch {
        return null;
    }
}
function saveStartPreferences(prefs) {
    if (typeof localStorage === "undefined")
        return;
    localStorage.setItem(START_PREFS_KEY, JSON.stringify(prefs));
}
function normalizeStartPreferences(prefs = {}) {
    const themePool = Array.isArray(THEMES) ? THEMES : [];
    const moodPool = Array.isArray(MOODS) ? MOODS : [];
    const themes = Array.isArray(prefs.themes) ? prefs.themes.filter((theme) => themePool.includes(theme)) : [];
    const moods = Array.isArray(prefs.moods) ? prefs.moods.filter((mood) => moodPool.includes(mood)) : [];
    const uniqueThemes = [...new Set(themes)];
    const uniqueMoods = [...new Set(moods)];
    if (uniqueThemes.length < 2) {
        uniqueThemes.push(...pickDistinct(themePool.filter((theme) => !uniqueThemes.includes(theme)), 2 - uniqueThemes.length));
    }
    if (uniqueMoods.length < 2) {
        uniqueMoods.push(...pickDistinct(moodPool.filter((mood) => !uniqueMoods.includes(mood)), 2 - uniqueMoods.length));
    }
    return { themes: uniqueThemes.slice(0, 2), moods: uniqueMoods.slice(0, 2) };
}
function syncStartPreferenceSelects() {
    const theme1 = $("startTheme1");
    const theme2 = $("startTheme2");
    const mood1 = $("startMood1");
    const mood2 = $("startMood2");
    if (!theme1 || !theme2 || !mood1 || !mood2)
        return;
    theme1.innerHTML = THEMES.map((theme) => `<option value="${theme}">${theme}</option>`).join("");
    theme2.innerHTML = THEMES.map((theme) => `<option value="${theme}">${theme}</option>`).join("");
    mood1.innerHTML = MOODS.map((mood) => `<option value="${mood}">${mood}</option>`).join("");
    mood2.innerHTML = MOODS.map((mood) => `<option value="${mood}">${mood}</option>`).join("");
    const stored = normalizeStartPreferences(loadStartPreferences() || {});
    const apply = (next) => {
        const normalized = normalizeStartPreferences(next);
        theme1.value = normalized.themes[0];
        theme2.value = normalized.themes[1];
        mood1.value = normalized.moods[0];
        mood2.value = normalized.moods[1];
        saveStartPreferences(normalized);
    };
    apply(stored);
    const onChange = () => apply({
        themes: [theme1.value, theme2.value],
        moods: [mood1.value, mood2.value]
    });
    [theme1, theme2, mood1, mood2].forEach((select) => {
        if (select.dataset.bound)
            return;
        select.dataset.bound = "1";
        select.addEventListener("change", onChange);
    });
}
function getSelectedStartPreferences() {
    const theme1 = $("startTheme1");
    const theme2 = $("startTheme2");
    const mood1 = $("startMood1");
    const mood2 = $("startMood2");
    if (!theme1 || !theme2 || !mood1 || !mood2) {
        return normalizeStartPreferences(loadStartPreferences() || {});
    }
    return normalizeStartPreferences({
        themes: [theme1.value, theme2.value],
        moods: [mood1.value, mood2.value]
    });
}
function panelByKey(key) {
    return document.querySelector(`.panel.card[data-panel="${key}"]`);
}
function getRouteFromHash() {
    const raw = window.location.hash || "";
    const match = raw.replace("#/", "").trim();
    const normalized = ROUTE_ALIASES[match] || match;
    return ROUTES.includes(normalized) ? normalized : DEFAULT_ROUTE;
}
function loadViewPanelState() {
    const raw = localStorage.getItem(VIEW_PANEL_STATE_KEY);
    if (!raw)
        return {};
    try {
        return JSON.parse(raw) || {};
    }
    catch {
        return {};
    }
}
function saveViewPanelState(state) {
    localStorage.setItem(VIEW_PANEL_STATE_KEY, JSON.stringify(state));
}
function normalizeViewPanelState(state) {
    return state === VIEW_PANEL_STATES.hidden ? VIEW_PANEL_STATES.hidden : VIEW_PANEL_STATES.open;
}
function normalizePanelState(state) {
    if (state === PANEL_STATES.collapsed || state === PANEL_STATES.expanded)
        return state;
    return PANEL_STATES.open;
}
function ensureViewPanelState(route, root) {
    const store = loadViewPanelState();
    if (!store[route])
        store[route] = {};
    Object.values(store[route]).forEach((entry) => {
        if (!entry)
            return;
        entry.state = normalizeViewPanelState(entry.state);
    });
    const defaults = VIEW_DEFAULTS[route] || {};
    if (root) {
        root.querySelectorAll(".panel.card").forEach((panel) => {
            const key = panelKey(panel);
            if (!key)
                return;
            if (!store[route][key]) {
                store[route][key] = {
                    state: defaults[key] || VIEW_PANEL_STATES.open,
                    width: "",
                    height: ""
                };
            }
        });
    }
    saveViewPanelState(store);
    return store;
}
function getPanelStateEntry(route, key, root) {
    const store = ensureViewPanelState(route, root);
    return store[route]?.[key] || { state: VIEW_PANEL_STATES.open };
}
function logUiEvent(type, payload = {}) {
    const log = loadUiEventLog();
    log.push({
        ts: Date.now(),
        gameTs: state.time?.epochMs,
        route: state.ui?.activeView || activeRoute,
        event_type: type,
        payload
    });
    if (log.length > 800)
        log.shift();
    localStorage.setItem(UI_EVENT_LOG_KEY, JSON.stringify(log));
}
function loadUiEventLog() {
    const raw = localStorage.getItem(UI_EVENT_LOG_KEY);
    if (!raw)
        return [];
    try {
        return JSON.parse(raw) || [];
    }
    catch {
        return [];
    }
}
function chartScopeKey(chartKey) {
    if (chartKey === "global")
        return "global";
    if (NATIONS.includes(chartKey))
        return `nation:${chartKey}`;
    return `region:${chartKey}`;
}
function chartScopeLabel(chartKey) {
    if (chartKey === "global")
        return "Global (Gaia)";
    if (NATIONS.includes(chartKey))
        return chartKey;
    const region = REGION_DEFS.find((entry) => entry.id === chartKey);
    return region ? region.label : chartKey;
}
function resetChartHistoryView({ render = true } = {}) {
    chartHistoryRequestId += 1;
    if (state.ui.chartHistoryWeek === null && state.ui.chartHistorySnapshot === null)
        return;
    state.ui.chartHistoryWeek = null;
    state.ui.chartHistorySnapshot = null;
    saveToActiveSlot();
    if (render && $("chartList")) {
        renderCharts();
    }
}
async function applyChartHistoryWeek(week, chartKey) {
    if (!week || week < 1)
        return;
    const currentWeek = weekIndex() + 1;
    if (week > currentWeek) {
        logEvent(`Charts are only available through Week ${currentWeek}.`, "warn");
        return;
    }
    const requestId = chartHistoryRequestId + 1;
    chartHistoryRequestId = requestId;
    const scope = chartScopeKey(chartKey);
    const snapshot = await fetchChartSnapshot(scope, week);
    if (requestId !== chartHistoryRequestId)
        return;
    state.ui.chartHistoryWeek = week;
    state.ui.chartHistorySnapshot = snapshot || null;
    saveToActiveSlot();
    if ($("chartList")) {
        renderCharts();
    }
}
async function renderChartHistoryModal() {
    const list = $("chartHistoryList");
    const scopeLabel = chartScopeLabel(state.ui.activeChart || "global");
    const scopeEl = $("chartHistoryScope");
    if (scopeEl)
        scopeEl.textContent = `Scope: ${scopeLabel}`;
    if (!list)
        return;
    const weeks = await listChartWeeks();
    const currentWeek = weekIndex() + 1;
    const visibleWeeks = weeks.filter((entry) => entry.week <= currentWeek);
    if (!visibleWeeks.length) {
        list.innerHTML = `<div class="muted">No chart history yet.</div>`;
        return;
    }
    list.innerHTML = visibleWeeks.map((entry) => `
    <div class="list-item">
      <div class="list-row">
        <div class="item-title">${formatWeekRangeLabel(entry.week)}</div>
        <button type="button" class="ghost mini" data-chart-week="${entry.week}">View</button>
      </div>
    </div>
  `).join("");
}
function applyPanelStates(route, root) {
    if (!root)
        return;
    const store = ensureViewPanelState(route, root);
    root.querySelectorAll(".panel.card").forEach((panel) => {
        const key = panelKey(panel);
        if (!key)
            return;
        const entry = store[route]?.[key] || { state: VIEW_PANEL_STATES.open };
        const normalized = normalizeViewPanelState(entry.state);
        entry.state = normalized;
        const isHidden = normalized === VIEW_PANEL_STATES.hidden;
        panel.dataset.state = normalized;
        panel.style.width = entry.width || "";
        panel.style.height = entry.height || "";
        setPanelVisibility(panel, !isHidden);
        panel.classList.remove("panel--mini");
        addPanelActions(panel);
        updateViewPanelActions(panel, normalized);
        clampPanelRect(panel);
    });
    syncViewColumns(root);
}
function persistPanelSize(panel) {
    const route = state.ui.activeView || activeRoute;
    const root = document.querySelector(".view");
    const store = ensureViewPanelState(route, root);
    const key = panelKey(panel);
    if (!key)
        return;
    if (!store[route][key]) {
        store[route][key] = { state: VIEW_PANEL_STATES.open, width: "", height: "" };
    }
    store[route][key].width = panel.style.width || "";
    store[route][key].height = panel.style.height || "";
    saveViewPanelState(store);
}
function setViewPanelState(route, key, nextState) {
    const root = document.querySelector(".view");
    const store = ensureViewPanelState(route, root);
    if (!store[route][key]) {
        store[route][key] = { state: VIEW_PANEL_STATES.open, width: "", height: "" };
    }
    const prevState = normalizeViewPanelState(store[route][key].state);
    const normalizedNext = normalizeViewPanelState(nextState);
    const panelBefore = root ? root.querySelector(`.panel.card[data-panel="${key}"]`) : null;
    const rectBefore = serializeRect(panelBefore);
    store[route][key].state = normalizedNext;
    saveViewPanelState(store);
    applyPanelStates(route, root);
    renderPanelMenu();
    syncSidePanelsButton(root);
    requestAnimationFrame(() => {
        const panelAfter = root ? root.querySelector(`.panel.card[data-panel="${key}"]`) : null;
        const rectAfter = serializeRect(panelAfter);
        logPanelTransition(route, key, prevState, normalizedNext, rectBefore, rectAfter);
        if (normalizedNext === VIEW_PANEL_STATES.open && prevState !== normalizedNext) {
            focusPanel(panelAfter, route, key, prevState, rectBefore, rectAfter);
        }
    });
}
function getViewPanelState(route, key) {
    const root = document.querySelector(".view");
    const store = ensureViewPanelState(route, root);
    return normalizeViewPanelState(store[route]?.[key]?.state);
}
function serializeRect(panel) {
    if (!panel || panel.hidden)
        return null;
    const rect = panel.getBoundingClientRect();
    return {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
    };
}
function clampPanelRect(panel) {
    if (!panel || panel.hidden)
        return;
    const parent = panel.parentElement;
    if (!parent)
        return;
    const parentRect = parent.getBoundingClientRect();
    const maxWidth = Math.max(220, parentRect.width - 12);
    const maxHeight = Math.max(120, parentRect.height - 12);
    const width = parseFloat(panel.style.width) || 0;
    const height = parseFloat(panel.style.height) || 0;
    if (width > 0)
        panel.style.width = `${clamp(width, 220, maxWidth)}px`;
    if (height > 0)
        panel.style.height = `${clamp(height, 120, maxHeight)}px`;
}
function clampAllPanels() {
    document.querySelectorAll(".panel.card").forEach((panel) => clampPanelRect(panel));
}
function logPanelTransition(route, key, prevState, nextState, rectBefore, rectAfter) {
    if (prevState === nextState)
        return;
    let eventType = "panel.state";
    if (nextState === VIEW_PANEL_STATES.hidden)
        eventType = "panel.hide";
    if (nextState === VIEW_PANEL_STATES.open && prevState === VIEW_PANEL_STATES.hidden)
        eventType = "panel.show";
    logUiEvent(eventType, {
        panel_id: key,
        view_id: route,
        prev_state: prevState,
        next_state: nextState,
        rect_before: rectBefore,
        rect_after: rectAfter
    });
}
function focusPanel(panel, route, key, prevState, rectBefore, rectAfter) {
    if (!panel)
        return;
    panel.classList.add("panel--focus");
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    window.setTimeout(() => {
        panel.classList.remove("panel--focus");
    }, 450);
    logUiEvent("panel.focus", {
        panel_id: key,
        view_id: route,
        prev_state: prevState,
        next_state: VIEW_PANEL_STATES.open,
        rect_before: rectBefore,
        rect_after: rectAfter
    });
}
function syncViewColumns(root) {
    if (!root)
        return;
    const side = root.querySelector(".view-side");
    if (!side)
        return;
    const hasVisible = Array.from(side.querySelectorAll(".panel.card")).some((panel) => !panel.hidden);
    root.classList.toggle("view--single", !hasVisible);
}
function getViewSidePanels(root) {
    const scope = root || document.querySelector(".view");
    if (!scope)
        return [];
    return Array.from(scope.querySelectorAll(".view-side .panel.card"));
}
function syncSidePanelsButton(root) {
    const btn = $("sidePanelsBtn");
    if (!btn)
        return;
    const panels = getViewSidePanels(root);
    if (!panels.length) {
        btn.disabled = true;
        btn.classList.remove("active");
        btn.setAttribute("aria-pressed", "false");
        btn.title = "No side panels in this view.";
        return;
    }
    const anyVisible = panels.some((panel) => !panel.classList.contains("panel-hidden"));
    btn.disabled = false;
    btn.classList.toggle("active", anyVisible);
    btn.setAttribute("aria-pressed", String(anyVisible));
    btn.title = anyVisible ? "Hide side panels" : "Show side panels";
}
function toggleSidePanels() {
    const route = state.ui.activeView || activeRoute;
    const root = document.querySelector(".view");
    const panels = getViewSidePanels(root);
    if (!panels.length)
        return;
    const anyVisible = panels.some((panel) => !panel.classList.contains("panel-hidden"));
    if (anyVisible) {
        const openKeys = panels
            .filter((panel) => !panel.classList.contains("panel-hidden"))
            .map((panel) => panelKey(panel))
            .filter(Boolean);
        if (!state.ui.sidePanelRestore)
            state.ui.sidePanelRestore = {};
        state.ui.sidePanelRestore[route] = openKeys;
        openKeys.forEach((key) => setViewPanelState(route, key, VIEW_PANEL_STATES.hidden));
    }
    else {
        const restoreKeys = state.ui.sidePanelRestore?.[route];
        const keys = restoreKeys && restoreKeys.length
            ? restoreKeys
            : panels.map((panel) => panelKey(panel)).filter(Boolean);
        keys.forEach((key) => setViewPanelState(route, key, VIEW_PANEL_STATES.open));
    }
    syncSidePanelsButton(root);
    saveToActiveSlot();
}
function updateRoute(route) {
    const next = ROUTES.includes(route) ? route : DEFAULT_ROUTE;
    if (activeRoute === next && hasMountedRoute)
        return;
    const prevRoute = activeRoute;
    if (prevRoute === "charts" && next !== "charts") {
        resetChartHistoryView({ render: false });
    }
    if (next === "charts" && state.ui.chartHistoryWeek && state.ui.chartHistoryWeek > weekIndex() + 1) {
        resetChartHistoryView({ render: false });
    }
    activeRoute = next;
    state.ui.activeView = next;
    document.querySelectorAll(".app-nav a[data-route]").forEach((link) => {
        link.classList.toggle("active", link.dataset.route === next);
    });
    mountView(next);
    hasMountedRoute = true;
    logUiEvent("route_change", { route: next });
}
function mountView(route) {
    const appRoot = $("app");
    if (!appRoot)
        return;
    appRoot.innerHTML = "";
    const template = document.getElementById(`view-${route}`);
    if (!template)
        return;
    const fragment = template.content.cloneNode(true);
    appRoot.appendChild(fragment);
    const root = appRoot.querySelector(".view");
    if (root)
        root.dataset.view = route;
    refreshSelectOptions();
    ensureSlotDropdowns();
    updateSlotDropdowns();
    applyPanelStates(route, root);
    syncSidePanelsButton(root);
    setupPanelResizers(root);
    bindViewHandlers(route, root);
    renderAll();
}
function initRouter() {
    window.addEventListener("hashchange", () => {
        updateRoute(getRouteFromHash());
    });
    updateRoute(getRouteFromHash());
}
function isPanelVisible(panel) {
    if (!panel)
        return false;
    if (panel.classList.contains("panel-hidden"))
        return false;
    const state = panel.dataset.state || PANEL_STATES.open;
    return state !== PANEL_STATES.collapsed;
}
function ensureMainSurface() {
    const center = document.querySelector(".center");
    if (!center)
        return;
    MAIN_SURFACES.forEach((key) => {
        const panel = panelByKey(key);
        if (panel)
            panel.classList.remove("panel--surface");
    });
    let surface = null;
    for (const key of MAIN_SURFACES) {
        const panel = panelByKey(key);
        if (isPanelVisible(panel)) {
            surface = panel;
            break;
        }
    }
    if (!surface) {
        const chartPanel = panelByKey("charts");
        if (chartPanel) {
            setPanelVisibility(chartPanel, true);
            setPanelState(chartPanel, PANEL_STATES.open);
            surface = chartPanel;
        }
    }
    MAIN_SURFACES.forEach((key) => {
        const panel = panelByKey(key);
        if (!panel || panel === surface)
            return;
        if (panel.classList.contains("panel--expanded"))
            return;
        const dock = panel.dataset.origDock || "footer";
        const target = document.querySelector(`.${dock}`) || document.querySelector(".footer");
        if (target && !target.contains(panel)) {
            target.appendChild(panel);
            panel.dataset.dock = dock;
        }
    });
    if (!surface)
        return;
    if (!center.contains(surface)) {
        center.appendChild(surface);
        surface.dataset.dock = "center";
    }
    surface.classList.add("panel--surface");
}
function syncSideColumns() {
    const app = document.querySelector(".app");
    if (!app)
        return;
    const leftPanels = Array.from(document.querySelectorAll(".left .panel.card"));
    const rightPanels = Array.from(document.querySelectorAll(".right .panel.card"));
    const leftVisible = leftPanels.some((panel) => !panel.classList.contains("panel-hidden"));
    const rightVisible = rightPanels.some((panel) => !panel.classList.contains("panel-hidden"));
    const leftCollapsed = leftVisible ? sideLayout.leftCollapsed : true;
    const rightCollapsed = rightVisible ? sideLayout.rightCollapsed : true;
    app.classList.toggle("left-collapsed", leftCollapsed);
    app.classList.toggle("right-collapsed", rightCollapsed);
    updateSideToggleButtons(leftCollapsed, rightCollapsed);
}
function toggleSidePanel(side) {
    if (side !== "left" && side !== "right")
        return;
    const key = side === "left" ? "leftCollapsed" : "rightCollapsed";
    sideLayout[key] = !sideLayout[key];
    saveSideLayout();
    syncSideColumns();
}
function syncLayoutState() {
    updatePanelTrayVisibility();
    ensureMainSurface();
    syncSideColumns();
}
function removeLegacyHiddenShelves() {
    document.querySelectorAll(".hidden-shelf").forEach((shelf) => shelf.remove());
}
function ensurePanelHeader(panel) {
    let head = panel.querySelector(".card-head");
    if (!head) {
        const title = panel.querySelector("h2");
        head = document.createElement("div");
        head.className = "card-head";
        if (title) {
            panel.insertBefore(head, panel.firstChild);
            head.appendChild(title);
        }
        else {
            panel.insertBefore(head, panel.firstChild);
        }
    }
    return head;
}
function addPanelActions(panel) {
    const head = ensurePanelHeader(panel);
    if (head.querySelector(".panel-actions"))
        return;
    const actions = document.createElement("div");
    actions.className = "panel-actions";
    actions.innerHTML = `
    <button type="button" class="ghost mini" data-panel-action="hide">Hide</button>
  `;
    head.appendChild(actions);
}
function updateViewPanelActions(panel, state) {
    const hideBtn = panel.querySelector("[data-panel-action=\"hide\"]");
    if (hideBtn) {
        hideBtn.textContent = state === VIEW_PANEL_STATES.hidden ? "Show" : "Hide";
    }
}
function setPanelState(panel, state) {
    panel.classList.toggle("panel--expanded", state === PANEL_STATES.expanded);
    panel.classList.toggle("panel--collapsed", state === PANEL_STATES.collapsed);
    panel.dataset.state = state;
    panel.setAttribute("aria-expanded", state === PANEL_STATES.expanded ? "true" : "false");
    panel.removeAttribute("title");
    updatePanelButtons(panel);
}
function updatePanelButtons(panel) {
    const focusBtn = panel.querySelector(".panel-focus");
    const collapseBtn = panel.querySelector(".panel-collapse-btn");
    const state = panel.dataset.state || PANEL_STATES.open;
    if (focusBtn)
        focusBtn.disabled = state === PANEL_STATES.expanded;
    if (collapseBtn) {
        collapseBtn.textContent = state === PANEL_STATES.collapsed ? "Show" : "Hide";
    }
}
function syncFocusCount() {
    const focus = document.querySelector(".center");
    if (focus)
        focus.dataset.expandedCount = String(expandedPanels.length);
}
function expandPanel(panel) {
    if (panel.classList.contains("panel-fixed"))
        return;
    if (panel.classList.contains("panel--expanded")) {
        const idx = expandedPanels.indexOf(panel);
        if (idx >= 0) {
            expandedPanels.splice(idx, 1);
            expandedPanels.push(panel);
            syncFocusCount();
        }
        savePanelLayout();
        syncLayoutState();
        return;
    }
    const focus = document.querySelector(".center");
    if (!focus)
        return;
    if (expandedPanels.length >= 2) {
        minimizePanel(expandedPanels[0]);
    }
    if (!panel.dataset.origDock) {
        const parent = panel.parentElement;
        if (parent && parent.classList.contains("left"))
            panel.dataset.origDock = "left";
        if (parent && parent.classList.contains("right"))
            panel.dataset.origDock = "right";
        if (parent && parent.classList.contains("footer"))
            panel.dataset.origDock = "footer";
    }
    focus.appendChild(panel);
    panel.dataset.dock = "center";
    setPanelState(panel, PANEL_STATES.expanded);
    expandedPanels.push(panel);
    syncFocusCount();
    savePanelLayout();
    syncLayoutState();
}
function restorePanel(panel) {
    if (panel.classList.contains("panel-fixed"))
        return;
    const dock = panel.dataset.origDock || "footer";
    const target = document.querySelector(`.${dock}`) || document.querySelector(".footer");
    if (target)
        target.appendChild(panel);
    panel.dataset.dock = dock;
    setPanelState(panel, PANEL_STATES.open);
    setPanelVisibility(panel, true);
    savePanelLayout();
    syncLayoutState();
}
function minimizePanel(panel) {
    if (panel.dataset.state === PANEL_STATES.open)
        return;
    restorePanel(panel);
    const idx = expandedPanels.indexOf(panel);
    if (idx >= 0)
        expandedPanels.splice(idx, 1);
    syncFocusCount();
}
function collapsePanel(panel) {
    if (panel.classList.contains("panel-fixed"))
        return;
    if (panel.dataset.state === PANEL_STATES.collapsed)
        return;
    const dock = panel.dataset.origDock || "footer";
    const target = document.querySelector(`.${dock}`) || document.querySelector(".footer");
    if (target)
        target.appendChild(panel);
    panel.dataset.dock = dock;
    setPanelState(panel, PANEL_STATES.collapsed);
    setPanelVisibility(panel, false);
    resetPanelSizing(panel);
    const idx = expandedPanels.indexOf(panel);
    if (idx >= 0)
        expandedPanels.splice(idx, 1);
    syncFocusCount();
    savePanelLayout();
    syncLayoutState();
}
function setupPanelLayout() {
    removeLegacyHiddenShelves();
    document.querySelectorAll(".top-bar .panel.card").forEach((panel) => {
        panel.classList.add("panel-fixed");
    });
    document.querySelectorAll(".panel.card").forEach((panel) => {
        if (!panel.classList.contains("panel-fixed")) {
            const parent = panel.parentElement;
            if (parent && parent.classList.contains("left"))
                panel.dataset.origDock = "left";
            if (parent && parent.classList.contains("right"))
                panel.dataset.origDock = "right";
            if (parent && parent.classList.contains("footer"))
                panel.dataset.origDock = "footer";
            if (parent && parent.classList.contains("center"))
                panel.dataset.origDock = "center";
            panel.dataset.dock = panel.dataset.origDock || "footer";
            setPanelState(panel, PANEL_STATES.open);
        }
        addPanelActions(panel);
    });
    // Move non-core center panels to footer dock by default.
    const footer = document.querySelector(".footer");
    if (footer) {
        document.querySelectorAll(".center .panel.card").forEach((panel) => {
            if (!panel.classList.contains("panel-fixed")) {
                const title = panelTitle(panel);
                if (!isCorePanel(panel)) {
                    panel.dataset.dock = "footer";
                    footer.appendChild(panel);
                }
            }
        });
    }
    syncFocusCount();
    setupFocusDismissal();
    syncLayoutState();
}
function setPanelVisibility(panel, visible) {
    panel.classList.toggle("panel-hidden", !visible);
    panel.hidden = !visible;
}
function panelTitle(panel) {
    const heading = panel.querySelector("h2");
    return heading ? heading.textContent?.trim() : "";
}
function isCorePanel(panel) {
    const title = panelTitle(panel);
    return title === "Gameplay Screen: Charts" || title === "Create Track" || title === "Release Desk" || title === "Calendar";
}
function applyDefaultLayout() {
    resetViewLayout();
}
function resetViewLayout() {
    localStorage.removeItem(VIEW_PANEL_STATE_KEY);
    localStorage.removeItem(PANEL_LAYOUT_KEY);
    localStorage.removeItem(SIDE_LAYOUT_KEY);
    sideLayout.leftCollapsed = false;
    sideLayout.rightCollapsed = false;
    hasMountedRoute = false;
    updateRoute(DEFAULT_ROUTE);
    renderPanelMenu();
}
const PROMO_BUDGET_MIN = 100;
function getPromoInflationMultiplier() {
    const currentYear = new Date(state.time?.epochMs || Date.now()).getUTCFullYear();
    const baseYear = state.meta?.startYear || new Date(state.time?.startEpochMs || state.time?.epochMs || Date.now()).getUTCFullYear();
    const yearsElapsed = Math.max(0, currentYear - baseYear);
    const annualInflation = 0.02;
    return Math.pow(1 + annualInflation, yearsElapsed);
}
function promoBudgetBaseCost(typeId) {
    const details = getPromoTypeDetails(typeId);
    return Math.max(PROMO_BUDGET_MIN, details.cost);
}
function promoBudgetBaseCostForTypes(typeIds) {
    if (!typeIds)
        return promoBudgetBaseCost(DEFAULT_PROMO_TYPE);
    const list = Array.isArray(typeIds) ? typeIds : [typeIds];
    const costs = list
        .filter(Boolean)
        .map((typeId) => promoBudgetBaseCost(typeId));
    if (!costs.length)
        return promoBudgetBaseCost(DEFAULT_PROMO_TYPE);
    return Math.max(...costs);
}
function setPromoBudgetToBaseCost(root, typeIds) {
    const scope = root || document;
    const input = scope.querySelector("#promoBudget");
    if (!input)
        return;
    const baseCost = promoBudgetBaseCostForTypes(typeIds);
    const raw = Number(input.value);
    const hasValue = Number.isFinite(raw);
    const autoBudget = input.dataset.promoBudgetAuto !== "false";
    input.min = String(PROMO_BUDGET_MIN);
    if (!hasValue || autoBudget) {
        input.value = String(baseCost);
        input.dataset.promoBudgetAuto = "true";
    }
}
function normalizePromoBudget(root, typeIds) {
    const scope = root || document;
    const input = scope.querySelector("#promoBudget");
    const baseCost = promoBudgetBaseCostForTypes(typeIds);
    if (!input)
        return baseCost;
    input.min = String(PROMO_BUDGET_MIN);
    const raw = Number(input.value);
    const next = Number.isFinite(raw) ? Math.max(PROMO_BUDGET_MIN, raw) : baseCost;
    if (String(next) !== input.value)
        input.value = String(next);
    return next;
}
function getSelectedPromoTypes(root) {
    const scope = root || document;
    return Array.from(scope.querySelectorAll("[data-promo-type].is-active"))
        .map((card) => card.dataset.promoType)
        .filter(Boolean);
}
function ensurePromoTypeSelection(root, fallbackTypeId) {
    const scope = root || document;
    let selected = getSelectedPromoTypes(scope);
    if (!selected.length) {
        const fallback = fallbackTypeId || DEFAULT_PROMO_TYPE;
        selected = [fallback];
        syncPromoTypeCards(scope, selected);
    }
    return selected;
}
function hydratePromoTypeCards(root) {
    const scope = root || document;
    const cards = scope.querySelectorAll("[data-promo-type]");
    if (!cards.length)
        return;
    cards.forEach((card) => {
        const typeId = card.dataset.promoType;
        if (!typeId)
            return;
        const details = getPromoTypeDetails(typeId);
        const label = card.querySelector("[data-promo-label]");
        if (label)
            label.textContent = details.label;
        const requirement = card.querySelector("[data-promo-requirement]");
        if (requirement)
            requirement.textContent = `Requirement: ${details.requirement}`;
        const cost = card.querySelector("[data-promo-cost]");
        if (cost)
            cost.textContent = `Typical cost: ${formatMoney(details.cost)}`;
    });
}
function syncPromoTypeCards(root, typeIds) {
    const scope = root || document;
    const cards = scope.querySelectorAll("[data-promo-type]");
    if (!cards.length)
        return;
    const selected = new Set((Array.isArray(typeIds) ? typeIds : [typeIds]).filter(Boolean));
    cards.forEach((card) => {
        const isActive = selected.has(card.dataset.promoType);
        card.classList.toggle("is-active", isActive);
        card.setAttribute("aria-checked", isActive ? "true" : "false");
        const status = card.querySelector("[data-promo-status]");
        if (status)
            status.textContent = isActive ? "Selected" : "Select";
    });
}
function buildPromoFacilityHint(typeId) {
    const facility = getPromoFacilityForType(typeId);
    if (!facility)
        return "";
    const availability = getPromoFacilityAvailability(facility);
    const label = facility === "broadcast" ? "Broadcast slots" : "Filming slots";
    return ` | ${label} today: ${availability.available}/${availability.capacity}`;
}
function getPromoFacilityNeeds(typeIds) {
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
function buildPromoFacilityHints(typeIds) {
    const needs = getPromoFacilityNeeds(typeIds);
    const entries = Object.entries(needs);
    if (!entries.length)
        return "";
    return entries.map(([facilityId, count]) => {
        const availability = getPromoFacilityAvailability(facilityId);
        const label = facilityId === "broadcast" ? "Broadcast slots" : "Filming slots";
        const neededLabel = count > 1 ? ` (need ${count})` : "";
        return `${label} today: ${availability.available}/${availability.capacity}${neededLabel}`;
    }).join(" | ");
}
function updatePromoTypeHint(root) {
    const scope = root || document;
    const select = scope.querySelector("#promoTypeSelect");
    const hint = scope.querySelector("#promoTypeHint");
    const selectedTypes = ensurePromoTypeSelection(scope, select ? select.value : DEFAULT_PROMO_TYPE);
    const primaryType = select && selectedTypes.includes(select.value) ? select.value : selectedTypes[0];
    if (select && primaryType)
        select.value = primaryType;
    state.ui.promoTypes = selectedTypes.slice();
    state.ui.promoType = primaryType || DEFAULT_PROMO_TYPE;
    const inflationMultiplier = getPromoInflationMultiplier();
    syncPromoTypeCards(scope, selectedTypes);
    setPromoBudgetToBaseCost(scope, selectedTypes);
    const budget = normalizePromoBudget(scope, selectedTypes);
    if (hint) {
        if (selectedTypes.length === 1) {
            const typeId = selectedTypes[0];
            hint.textContent = `Selected: ${buildPromoHint(typeId, inflationMultiplier)}${buildPromoFacilityHint(typeId)}`;
        }
        else {
            const labels = selectedTypes.map((typeId) => getPromoTypeDetails(typeId).label).join(", ");
            const facilityHint = buildPromoFacilityHints(selectedTypes);
            const facilitySuffix = facilityHint ? ` | ${facilityHint}` : "";
            const totalSpend = formatMoney(budget * selectedTypes.length);
            hint.textContent = `Selected (${selectedTypes.length}): ${labels}. Budget applies per type; total spend: ${totalSpend}${facilitySuffix}`;
        }
    }
    const budgetInput = scope.querySelector("#promoBudget");
    if (budgetInput) {
        const costs = selectedTypes.map((typeId) => getPromoTypeCosts(typeId, inflationMultiplier).adjustedCost);
        const minCost = Math.min(...costs);
        const maxCost = Math.max(...costs);
        budgetInput.placeholder = minCost === maxCost
            ? formatMoney(maxCost)
            : `${formatMoney(minCost)}-${formatMoney(maxCost)}`;
    }
}
function bindGlobalHandlers() {
    const on = (id, event, handler) => {
        const el = $(id);
        if (el)
            el.addEventListener(event, handler);
    };
    on("pauseBtn", "click", () => { setTimeSpeed("pause"); });
    on("playBtn", "click", () => { setTimeSpeed("play"); });
    on("fastBtn", "click", () => { setTimeSpeed("fast"); });
    on("skipDayBtn", "click", () => { void advanceHours(24, { renderHourly: false }); });
    on("skipWeekBtn", "click", () => { void advanceHours(WEEK_HOURS, { renderHourly: false }); });
    on("skipTimeBtn", "click", () => {
        const now = new Date(state.time.epochMs);
        if ($("skipDateInput"))
            $("skipDateInput").value = now.toISOString().slice(0, 10);
        if ($("skipTimeInput"))
            $("skipTimeInput").value = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`;
        openOverlay("skipTimeModal");
    });
    on("menuBtn", "click", () => {
        openMainMenu();
        syncGameModeSelect();
        syncDifficultySelect();
        updateTimeControlButtons();
        syncTimeControlAria();
    });
    on("tutorialBtn", "click", () => {
        renderRoleActions();
        openOverlay("tutorialModal");
    });
    on("panelMenuBtn", "click", () => {
        renderPanelMenu();
        openOverlay("panelMenu");
    });
    on("sidePanelsBtn", "click", () => toggleSidePanels());
    on("panelMenuClose", "click", () => closeOverlay("panelMenu"));
    on("resetLayoutBtn", "click", () => {
        resetViewLayout();
        logEvent("Layout reset to default.");
    });
    on("resetLayoutSettingsBtn", "click", () => {
        resetViewLayout();
        logEvent("Layout reset to default.");
    });
    on("menuCloseBtn", "click", () => {
        if (!session.activeSlot)
            return;
        closeMainMenu();
        updateTimeControlButtons();
        syncTimeControlAria();
    });
    on("menuSaveBtn", "click", () => {
        if (!session.activeSlot) {
            logEvent("Select a game slot before saving.", "warn");
            return;
        }
        saveToActiveSlot();
        renderMainMenu();
        logEvent(`Saved Game Slot ${session.activeSlot}.`);
    });
    const lossList = $("usageLedgerList");
    if (lossList) {
        lossList.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-loss-action]");
            if (!btn)
                return;
            const action = btn.dataset.lossAction;
            const lossId = btn.dataset.lossId;
            if (!lossId)
                return;
            const entry = getLossArchives().find((item) => String(item.id) === String(lossId));
            if (!entry) {
                logEvent("Loss archive not found.", "warn");
                return;
            }
            if (action === "download") {
                exportLossArchive(entry);
                logUiEvent("loss_archive_export", { loss_id: entry.id, label: entry.label });
            }
        });
    }
    on("skipTimeClose", "click", () => closeOverlay("skipTimeModal"));
    on("skip24hBtn", "click", () => { runTimeJump(24, "Skipping 24 hours"); closeOverlay("skipTimeModal"); });
    on("skip7dBtn", "click", () => { runTimeJump(7 * 24, "Skipping 7 days"); closeOverlay("skipTimeModal"); });
    on("skip14dBtn", "click", () => { runTimeJump(14 * 24, "Skipping 14 days"); closeOverlay("skipTimeModal"); });
    on("skip28dBtn", "click", () => { runTimeJump(28 * 24, "Skipping 28 days"); closeOverlay("skipTimeModal"); });
    on("skipCustomBtn", "click", () => {
        const days = Number($("skipDaysInput").value || 0);
        const hours = Number($("skipHoursInput").value || 0);
        const total = Math.max(0, days * 24 + hours);
        if (total > 0)
            runTimeJump(total, `Skipping ${formatCount(total)} hours`);
        closeOverlay("skipTimeModal");
    });
    on("skipToDateBtn", "click", () => {
        const date = $("skipDateInput").value;
        const time = $("skipTimeInput").value || "00:00";
        if (!date)
            return;
        const target = new Date(`${date}T${time}:00Z`).getTime();
        const diffMs = target - state.time.epochMs;
        if (diffMs <= 0) {
            logEvent("Cannot skip to the past. Choose a future date.", "warn");
            return;
        }
        const hours = Math.floor(diffMs / HOUR_MS);
        if (hours > 0)
            runTimeJump(hours, "Skipping to target date");
        closeOverlay("skipTimeModal");
    });
    on("quickRecipesBtn", "click", () => {
        renderQuickRecipes();
        openOverlay("quickRecipesModal");
    });
    on("quickRecipesClose", "click", () => closeOverlay("quickRecipesModal"));
    on("tutorialClose", "click", () => closeOverlay("tutorialModal"));
    on("calendarClose", "click", () => closeOverlay("calendarModal"));
    const refreshCalendar = () => {
        renderCalendarView();
        renderCalendarList("calendarFullList", 12);
    };
    document.querySelectorAll("[data-calendar-tab]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const tab = btn.dataset.calendarTab;
            if (!tab)
                return;
            state.ui.calendarTab = tab;
            refreshCalendar();
            saveToActiveSlot();
        });
    });
    document.querySelectorAll("[data-calendar-filter]").forEach((input) => {
        input.addEventListener("change", (e) => {
            const key = e.target.dataset.calendarFilter;
            if (!key)
                return;
            state.ui.calendarFilters[key] = e.target.checked;
            refreshCalendar();
            saveToActiveSlot();
        });
    });
    on("chartHistoryClose", "click", () => closeOverlay("chartHistoryModal"));
    on("rankingModalClose", "click", () => closeOverlay("rankingModal"));
    on("chartHistoryLatest", "click", () => {
        resetChartHistoryView();
        closeOverlay("chartHistoryModal");
    });
    on("walletClose", "click", () => closeOverlay("walletModal"));
    on("endClose", "click", () => {
        closeOverlay("endModal");
        if (!session.activeSlot) {
            openMainMenu();
            syncGameModeSelect();
            syncDifficultySelect();
            updateTimeControlButtons();
            syncTimeControlAria();
        }
    });
    on("bailoutClose", "click", () => {
        if (declineBailout()) {
            closeOverlay("bailoutModal");
            saveToActiveSlot();
        }
    });
    on("bailoutAcceptBtn", "click", () => {
        if (acceptBailout()) {
            closeOverlay("bailoutModal");
            renderStats();
            renderAll();
            saveToActiveSlot();
        }
    });
    on("bailoutDeclineBtn", "click", () => {
        if (declineBailout()) {
            closeOverlay("bailoutModal");
            saveToActiveSlot();
        }
    });
    on("communitiesClose", "click", () => closeOverlay("communitiesModal"));
    on("harmonyClose", "click", () => closeOverlay("harmonyModal"));
    on("autoAssignClose", "click", () => closeOverlay("autoAssignModal"));
    on("autoAssignBest", "click", () => {
        assignBestCandidates();
        closeOverlay("autoAssignModal");
    });
    const autoAssignList = $("autoAssignList");
    if (autoAssignList) {
        autoAssignList.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-assign-role]");
            if (!btn)
                return;
            if (btn.disabled)
                return;
            const role = btn.dataset.assignRole;
            const id = btn.dataset.assignId;
            if (role === "Songwriter")
                setTrackSlotIds("Songwriter", [id]);
            if (role === "Performer")
                setTrackSlotIds("Performer", [id]);
            if (role === "Producer")
                setTrackSlotIds("Producer", [id]);
            renderSlots();
            saveToActiveSlot();
            updateTrackRecommendation();
        });
    }
    const eraStatus = $("eraStatus");
    if (eraStatus) {
        eraStatus.addEventListener("click", (e) => {
            const focusBtn = e.target.closest("[data-era-focus]");
            if (focusBtn) {
                const eraId = focusBtn.dataset.eraFocus;
                if (!eraId)
                    return;
                const nextFocus = state.ui.focusEraId === eraId ? null : eraId;
                setFocusEraById(nextFocus);
                logUiEvent("action_submit", { action: "focus_era", eraId: nextFocus });
                renderAll();
                return;
            }
            const btn = e.target.closest("[data-era-end]");
            if (!btn)
                return;
            const eraId = btn.dataset.eraEnd;
            if (!eraId)
                return;
            const ended = endEraById(eraId, "manual");
            if (!ended) {
                logEvent("Era could not be ended.", "warn");
                return;
            }
            logUiEvent("action_submit", { action: "end_era", eraId });
            renderEraStatus();
            saveToActiveSlot();
        });
    }
    on("eraFocusClear", "click", () => {
        if (!state.ui.focusEraId)
            return;
        setFocusEraById(null);
        logUiEvent("action_submit", { action: "focus_era_clear" });
        renderAll();
    });
    on("autoSaveToggle", "change", (e) => {
        state.meta.autoSave.enabled = e.target.checked;
        state.meta.autoSave.lastSavedAt = Date.now();
        saveToActiveSlot();
    });
    on("autoSaveMinutes", "change", (e) => {
        const minutes = Number(e.target.value);
        state.meta.autoSave.minutes = clamp(minutes, 2, 10);
        state.meta.autoSave.lastSavedAt = Date.now();
        saveToActiveSlot();
    });
    const panelMenuList = $("panelMenuList");
    if (panelMenuList) {
        panelMenuList.addEventListener("click", (e) => {
            const toggleBtn = e.target.closest("[data-panel-toggle]");
            if (!toggleBtn)
                return;
            const key = toggleBtn.dataset.panelToggle;
            if (!key)
                return;
            if (toggleBtn) {
                const next = toggleBtn.textContent === "Show" ? VIEW_PANEL_STATES.open : VIEW_PANEL_STATES.hidden;
                setViewPanelState(state.ui.activeView || activeRoute, key, next);
            }
        });
    }
    const exitMenuToGame = () => {
        closeMainMenu();
        updateTimeControlButtons();
        syncTimeControlAria();
    };
    const slotList = $("slotList");
    if (slotList) {
        slotList.addEventListener("click", async (e) => {
            const card = e.target.closest(".slot-card");
            if (!card)
                return;
            const slot = Number(card.dataset.slotIndex);
            if (!slot)
                return;
            const hasData = card.dataset.slotHasData === "1";
            const actionBtn = e.target.closest("[data-slot-action]");
            if (actionBtn && actionBtn.disabled)
                return;
            const action = actionBtn?.dataset.slotAction || card.dataset.slotDefault;
            if (!action)
                return;
            if (action === "delete") {
                const ok = confirm(`Delete Game Slot ${slot}? This cannot be undone.`);
                if (!ok)
                    return;
                deleteSlot(slot);
                renderMainMenu();
                return;
            }
            if (action === "continue") {
                if (!hasData) {
                    logEvent("No saved game in this slot. Create a new label first.", "warn");
                    return;
                }
                await loadSlot(slot, false);
                exitMenuToGame();
                return;
            }
            if (action === "new") {
                const ok = !hasData || confirm(`Overwrite Game Slot ${slot} with a new game?`);
                if (!ok)
                    return;
                const mode = getSelectedGameModeId();
                const difficulty = getSelectedGameDifficultyId();
                const startPreferences = getSelectedStartPreferences();
                await loadSlot(slot, true, { mode, difficulty, startPreferences });
                exitMenuToGame();
            }
        });
    }
    document.addEventListener("click", (e) => {
        const recommendBtn = e.target.closest("[data-slot-recommend]");
        if (recommendBtn) {
            recommendCreatorForSlot(recommendBtn.dataset.slotRecommend);
            return;
        }
        const clearBtn = e.target.closest("[data-slot-clear]");
        if (clearBtn) {
            clearSlot(clearBtn.dataset.slotClear);
            return;
        }
        const slot = e.target.closest(".id-slot");
        if (slot) {
            setSlotTarget(slot.dataset.slotTarget);
        }
    });
    document.addEventListener("dragstart", (e) => {
        const item = e.target.closest("[data-entity-type]");
        if (!item || !e.dataTransfer)
            return;
        const payload = { type: item.dataset.entityType, id: item.dataset.entityId };
        e.dataTransfer.setData("text/plain", JSON.stringify(payload));
    });
    document.addEventListener("dragover", (e) => {
        const slot = e.target.closest(".id-slot");
        if (!slot)
            return;
        e.preventDefault();
    });
    document.addEventListener("drop", (e) => {
        const slot = e.target.closest(".id-slot");
        if (!slot)
            return;
        e.preventDefault();
        try {
            const payload = JSON.parse(e.dataTransfer.getData("text/plain"));
            if (!payload)
                return;
            assignToSlot(slot.dataset.slotTarget, payload.type, payload.id);
        }
        catch {
            logEvent("Drop failed: invalid ID payload.", "warn");
        }
    });
    const mainMenu = $("mainMenu");
    if (mainMenu) {
        mainMenu.addEventListener("click", (e) => {
            if (e.target !== mainMenu)
                return;
            if (!session.activeSlot)
                return;
            closeMainMenu();
        });
    }
    document.addEventListener("keydown", (e) => {
        const active = document.activeElement;
        if (active && (active.tagName === "INPUT" || active.isContentEditable))
            return;
        if (e.code === "Space") {
            e.preventDefault();
            setTimeSpeed(state.time.speed === "pause" ? "play" : "pause");
            return;
        }
        if (e.key === "f" || e.key === "F") {
            setTimeSpeed("fast");
            return;
        }
        if (e.key === "p" || e.key === "P") {
            setTimeSpeed("play");
            return;
        }
    });
    const chartHistoryList = $("chartHistoryList");
    if (chartHistoryList) {
        chartHistoryList.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-chart-week]");
            if (!btn)
                return;
            const week = Number(btn.dataset.chartWeek || 0);
            if (!week)
                return;
            const chartKey = state.ui.activeChart || "global";
            applyChartHistoryWeek(week, chartKey).then(() => {
                closeOverlay("chartHistoryModal");
            });
        });
    }
}
function bindViewHandlers(route, root) {
    if (!root)
        return;
    const on = (id, event, handler) => {
        const el = root.querySelector(`#${id}`);
        if (el)
            el.addEventListener(event, handler);
    };
    root.addEventListener("click", (e) => {
        const action = e.target.closest("[data-panel-action]");
        if (!action)
            return;
        const panel = action.closest(".panel.card");
        if (!panel)
            return;
        const key = panelKey(panel);
        if (!key)
            return;
        const current = getViewPanelState(route, key);
        if (action.dataset.panelAction === "hide") {
            const next = current === VIEW_PANEL_STATES.hidden ? VIEW_PANEL_STATES.open : VIEW_PANEL_STATES.hidden;
            setViewPanelState(route, key, next);
        }
    });
    const chartTabs = root.querySelector("#chartTabs");
    if (chartTabs) {
        chartTabs.addEventListener("click", (e) => {
            const tab = e.target.closest(".tab");
            if (!tab)
                return;
            chartTabs.querySelectorAll(".tab").forEach((btn) => btn.classList.remove("active"));
            tab.classList.add("active");
            state.ui.activeChart = tab.dataset.chart;
            if (state.ui.chartHistoryWeek) {
                applyChartHistoryWeek(state.ui.chartHistoryWeek, state.ui.activeChart);
            }
            else {
                renderCharts();
            }
        });
    }
    const syncCreatePanelToggles = () => {
        const help = root.querySelector("#createHelp");
        const helpBtn = root.querySelector("#createHelpToggle");
        if (help)
            help.classList.toggle("hidden", !state.ui.createHelpOpen);
        if (helpBtn) {
            helpBtn.classList.toggle("active", !!state.ui.createHelpOpen);
            helpBtn.setAttribute("aria-expanded", String(!!state.ui.createHelpOpen));
        }
        const advanced = root.querySelector("#createAdvancedOptions");
        const advancedBtn = root.querySelector("#createAdvancedToggle");
        if (advanced)
            advanced.classList.toggle("hidden", !state.ui.createAdvancedOpen);
        if (advancedBtn) {
            advancedBtn.classList.toggle("active", !!state.ui.createAdvancedOpen);
            advancedBtn.setAttribute("aria-expanded", String(!!state.ui.createAdvancedOpen));
        }
    };
    if (route === "create") {
        syncCreatePanelToggles();
        on("createHelpToggle", "click", () => {
            state.ui.createHelpOpen = !state.ui.createHelpOpen;
            syncCreatePanelToggles();
            saveToActiveSlot();
        });
        on("createAdvancedToggle", "click", () => {
            state.ui.createAdvancedOpen = !state.ui.createAdvancedOpen;
            syncCreatePanelToggles();
            saveToActiveSlot();
        });
        root.addEventListener("click", (e) => {
            const moreBtn = e.target.closest("[data-slot-more]");
            const lessBtn = e.target.closest("[data-slot-less]");
            const role = moreBtn?.dataset.slotMore || lessBtn?.dataset.slotLess;
            if (!role)
                return;
            const limit = TRACK_ROLE_LIMITS?.[role] || 1;
            const minVisible = Math.min(3, limit);
            if (!state.ui.trackSlotVisible)
                state.ui.trackSlotVisible = {};
            const current = Number(state.ui.trackSlotVisible[role]) || minVisible;
            const key = TRACK_ROLE_KEYS[role];
            const assigned = Array.isArray(state.ui.trackSlots?.[key])
                ? state.ui.trackSlots[key].filter(Boolean).length
                : 0;
            if (moreBtn) {
                state.ui.trackSlotVisible[role] = Math.min(limit, current + 1);
            }
            else if (lessBtn) {
                state.ui.trackSlotVisible[role] = Math.max(minVisible, Math.max(assigned, current - 1));
            }
            renderSlots();
            saveToActiveSlot();
        });
    }
    const trackTabs = root.querySelectorAll("[data-track-tab]");
    if (trackTabs.length) {
        trackTabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                const next = tab.dataset.trackTab;
                if (!next)
                    return;
                state.ui.trackPanelTab = next;
                renderTracks();
                saveToActiveSlot();
            });
        });
    }
    if (route === "world") {
        const syncRankingControls = () => {
            const limit = getCommunityRankingLimit();
            root.querySelectorAll("[data-ranking-limit]").forEach((input) => {
                const value = Number(input.dataset.rankingLimit || input.value);
                input.checked = value === limit;
            });
        };
        syncRankingControls();
        root.addEventListener("change", (e) => {
            const input = e.target.closest("[data-ranking-limit]");
            if (!input)
                return;
            const next = Number(input.dataset.rankingLimit || input.value);
            if (!Number.isFinite(next))
                return;
            state.ui.communityRankingLimit = next;
            syncRankingControls();
            renderCommunityRankings();
            saveToActiveSlot();
        });
        root.addEventListener("click", (e) => {
            const moreBtn = e.target.closest("[data-ranking-more]");
            if (!moreBtn)
                return;
            const category = moreBtn.dataset.rankingMore;
            if (!category)
                return;
            renderRankingModal(category);
        });
    }
    if (route === "releases") {
        root.querySelectorAll("[data-calendar-tab]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const tab = btn.dataset.calendarTab;
                if (!tab)
                    return;
                state.ui.calendarTab = tab;
                renderCalendarView();
                saveToActiveSlot();
            });
        });
        root.querySelectorAll("[data-calendar-filter]").forEach((input) => {
            input.addEventListener("change", (e) => {
                const key = e.target.dataset.calendarFilter;
                if (!key)
                    return;
                state.ui.calendarFilters[key] = e.target.checked;
                renderCalendarView();
                saveToActiveSlot();
            });
        });
        const calendarGrid = root.querySelector("#calendarGrid");
        if (calendarGrid) {
            calendarGrid.addEventListener("wheel", handleCalendarWheel, { passive: true });
            calendarGrid.addEventListener("pointerdown", handleCalendarPointerDown);
            calendarGrid.addEventListener("pointermove", handleCalendarPointerMove);
            calendarGrid.addEventListener("pointerup", handleCalendarPointerEnd);
            calendarGrid.addEventListener("pointercancel", handleCalendarPointerEnd);
        }
    }
    if (route === "charts") {
        root.addEventListener("click", (e) => {
            if (!state.ui.chartHistoryWeek)
                return;
            const chartPanel = root.querySelector(".panel.card[data-panel=\"charts\"]");
            if (!chartPanel || chartPanel.contains(e.target))
                return;
            resetChartHistoryView();
        });
    }
    if (route === "logs") {
        on("promoTypeSelect", "change", (e) => {
            const typeId = e.target.value || DEFAULT_PROMO_TYPE;
            syncPromoTypeCards(root, [typeId]);
            updatePromoTypeHint(root);
        });
        on("promoBudget", "change", (e) => {
            e.target.dataset.promoBudgetAuto = "false";
            updatePromoTypeHint(root);
        });
        const promoGrid = root.querySelector("#promoTypeGrid");
        if (promoGrid) {
            promoGrid.addEventListener("click", (e) => {
                const card = e.target.closest("[data-promo-type]");
                if (!card)
                    return;
                const typeId = card.dataset.promoType;
                if (!typeId)
                    return;
                const select = root.querySelector("#promoTypeSelect");
                const selected = ensurePromoTypeSelection(root, select ? select.value : DEFAULT_PROMO_TYPE);
                const isActive = selected.includes(typeId);
                if (isActive && selected.length === 1)
                    return;
                const nextSelected = isActive
                    ? selected.filter((id) => id !== typeId)
                    : Array.from(new Set([...selected, typeId]));
                syncPromoTypeCards(root, nextSelected);
                if (select)
                    select.value = isActive ? (nextSelected[0] || typeId) : typeId;
                updatePromoTypeHint(root);
            });
        }
        hydratePromoTypeCards(root);
        if (Array.isArray(state.ui.promoTypes) && state.ui.promoTypes.length) {
            syncPromoTypeCards(root, state.ui.promoTypes);
            const select = root.querySelector("#promoTypeSelect");
            if (select)
                select.value = state.ui.promoTypes[0];
        }
        else if (state.ui.promoType) {
            syncPromoTypeCards(root, [state.ui.promoType]);
            const select = root.querySelector("#promoTypeSelect");
            if (select)
                select.value = state.ui.promoType;
        }
        updatePromoTypeHint(root);
    }
    on("chartWeekBtn", "click", () => {
        renderChartHistoryModal();
        openOverlay("chartHistoryModal");
    });
    on("trackTitleRandom", "click", () => {
        const theme = $("themeSelect").value;
        const mood = $("moodSelect").value;
        $("trackTitle").value = makeTrackTitle(theme, mood);
    });
    on("projectNameRandom", "click", () => {
        $("projectName").value = makeProjectTitle();
    });
    const stageColumns = root.querySelector(".create-stage-columns");
    if (stageColumns) {
        stageColumns.addEventListener("click", (e) => {
            const recommendBtn = e.target.closest("[data-track-recommend]");
            if (recommendBtn) {
                recommendAllCreators(recommendBtn.dataset.trackRecommend);
                return;
            }
            const button = e.target.closest("[data-create-stage]");
            if (!button || button.disabled)
                return;
            const stageId = button.dataset.createStage;
            if (!stageId || !["sheet", "demo", "master"].includes(stageId))
                return;
            state.ui.createStage = stageId;
            let target = state.ui.slotTarget;
            if (stageId === "demo") {
                target = primaryTrackSlotTarget("Performer");
            }
            else if (stageId === "master") {
                target = primaryTrackSlotTarget("Producer");
            }
            else if (stageId === "sheet") {
                target = primaryTrackSlotTarget("Songwriter");
            }
            else if (!target) {
                target = primaryTrackSlotTarget("Songwriter");
            }
            state.ui.slotTarget = target;
            renderAll();
            saveToActiveSlot();
        });
    }
    on("demoTrackSelect", "change", (e) => {
        if (state.ui.createTrackIds)
            state.ui.createTrackIds.demo = e.target.value || null;
        if (state.ui.createStage === "demo")
            state.ui.createTrackId = state.ui.createTrackIds.demo;
        renderAll();
    });
    on("masterTrackSelect", "change", (e) => {
        if (state.ui.createTrackIds)
            state.ui.createTrackIds.master = e.target.value || null;
        if (state.ui.createStage === "master")
            state.ui.createTrackId = state.ui.createTrackIds.master;
        renderAll();
    });
    on("themeSelect", "change", () => {
        updateGenrePreview();
        updateTrackRecommendation();
    });
    on("moodSelect", "change", () => {
        updateGenrePreview();
        updateTrackRecommendation();
    });
    on("modifierSelect", "change", () => {
        updateTrackRecommendation();
    });
    on("trackAlignment", "change", () => {
        renderCreateStageControls();
    });
    on("recommendAllMode", "change", (e) => {
        state.ui.recommendAllMode = e.target.value;
        renderAll();
        saveToActiveSlot();
    });
    on("autoAssignBtn", "click", autoAssignCreators);
    on("startTrackBtn", "click", startTrackFromUI);
    on("startSheetBtn", "click", startSheetFromUI);
    on("startDemoBtn", "click", startDemoFromUI);
    on("startMasterBtn", "click", startMasterFromUI);
    on("genreThemeFilter", "change", (e) => {
        state.ui.genreTheme = e.target.value;
        renderGenreIndex();
    });
    on("genreMoodFilter", "change", (e) => {
        state.ui.genreMood = e.target.value;
        renderGenreIndex();
    });
    on("trendScopeSelect", "change", (e) => {
        state.ui.trendScopeType = e.target.value;
        renderAll();
    });
    on("trendScopeTarget", "change", (e) => {
        state.ui.trendScopeTarget = e.target.value;
        renderAll();
    });
    const readyList = root.querySelector("#readyList");
    if (readyList)
        readyList.addEventListener("click", handleReleaseAction);
    if (readyList)
        readyList.addEventListener("click", handleReleaseActRecommendation);
    if (readyList) {
        readyList.addEventListener("change", (e) => {
            const select = e.target.closest("[data-assign-act]");
            if (!select)
                return;
            const trackId = select.dataset.assignAct;
            const actId = select.value;
            const assigned = assignTrackAct(trackId, actId);
            if (assigned) {
                logUiEvent("action_submit", { action: "assign_act", trackId, actId });
                renderAll();
                saveToActiveSlot();
            }
        });
    }
    on("calendarBtn", "click", () => {
        renderCalendarList("calendarFullList", 12);
        openOverlay("calendarModal");
    });
    on("promoBtn", "click", runPromotion);
    on("promoFocusPickBtn", "click", pickPromoTrackFromFocus);
    on("autoRolloutToggle", "change", (e) => {
        if (!state.meta.autoRollout) {
            state.meta.autoRollout = { enabled: false, lastCheckedAt: null };
        }
        state.meta.autoRollout.enabled = e.target.checked;
        state.meta.autoRollout.lastCheckedAt = Date.now();
        logEvent(state.meta.autoRollout.enabled ? "Auto promo enabled." : "Auto promo disabled.");
        saveToActiveSlot();
    });
    const autoRolloutToggle = root.querySelector("#autoRolloutToggle");
    if (autoRolloutToggle) {
        autoRolloutToggle.checked = Boolean(state.meta.autoRollout?.enabled);
    }
    on("refreshMarket", "click", () => {
        if (state.label.cash < 300) {
            logEvent("Not enough cash to refresh market.", "warn");
            return;
        }
        state.label.cash -= 300;
        state.marketCreators = buildMarketCreators();
        ensureMarketCreators();
        logEvent("Talent market refreshed.");
        renderAll();
    });
    on("cccThemeFilter", "change", (e) => {
        state.ui.cccThemeFilter = e.target.value || "All";
        renderAll();
        saveToActiveSlot();
    });
    on("cccMoodFilter", "change", (e) => {
        state.ui.cccMoodFilter = e.target.value || "All";
        renderAll();
        saveToActiveSlot();
    });
    on("cccSort", "change", (e) => {
        state.ui.cccSort = e.target.value || "default";
        renderAll();
        saveToActiveSlot();
    });
    const marketList = root.querySelector("#marketList");
    if (marketList) {
        marketList.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-sign]");
            if (!btn || btn.disabled)
                return;
            signCreatorById(btn.dataset.sign);
        });
    }
    root.querySelectorAll("[data-ccc-filter]").forEach((input) => {
        input.addEventListener("change", (e) => {
            const key = e.target.dataset.cccFilter;
            if (!key)
                return;
            if (!state.ui.cccFilters) {
                state.ui.cccFilters = {
                    Songwriter: true,
                    Performer: true,
                    Producer: true
                };
            }
            state.ui.cccFilters[key] = e.target.checked;
            renderAll();
            saveToActiveSlot();
        });
    });
    const actList = root.querySelector("#actList");
    if (actList) {
        actList.addEventListener("click", (e) => {
            const useBtn = e.target.closest("button[data-act-set]");
            if (useBtn) {
                const act = getAct(useBtn.dataset.actSet);
                if (!act)
                    return;
                const target = state.ui.slotTarget || "era-act";
                const slot = getSlotElement(target);
                if (slot && slot.dataset.slotType !== "act") {
                    logEvent("Select an Act ID slot first.", "warn");
                    return;
                }
                assignToSlot(target, "act", act.id);
                logEvent(`Assigned "${act.name}" to ${describeSlot(target)}.`);
                return;
            }
            const renameBtn = e.target.closest("button[data-act-rename]");
            if (renameBtn) {
                const actId = renameBtn.dataset.actRename;
                const input = actList.querySelector(`[data-act-input="${actId}"]`);
                if (!input)
                    return;
                renameActById(actId, input.value);
            }
        });
        actList.addEventListener("keydown", (e) => {
            if (e.key !== "Enter")
                return;
            const input = e.target.closest("input[data-act-input]");
            if (!input)
                return;
            renameActById(input.dataset.actInput, input.value);
        });
    }
    on("quickActBtn", "click", createQuickAct);
    on("createActBtn", "click", createActFromUI);
    on("actTypeSelect", "change", updateActMemberFields);
    on("renameLabelBtn", "click", renameLabelFromUI);
    on("labelNameInput", "keydown", (e) => {
        if (e.key === "Enter")
            renameLabelFromUI();
    });
    on("labelNameRandom", "click", () => {
        $("labelNameInput").value = makeLabelName();
    });
    on("actNameRandom", "click", () => {
        $("actName").value = makeActName();
    });
    on("labelAlignment", "change", (e) => {
        state.label.alignment = e.target.value;
        if ($("trackAlignment"))
            $("trackAlignment").value = e.target.value;
        if ($("actAlignmentSelect"))
            $("actAlignmentSelect").value = e.target.value;
        logEvent(`Label alignment set to ${state.label.alignment}.`);
        renderStats();
    });
    on("eraNameRandom", "click", () => {
        const act = getAct(state.ui.eraSlots.actId) || getAct(state.ui.trackSlots.actId);
        $("eraNameInput").value = makeEraName(act ? act.name : makeActName());
    });
    on("startEraBtn", "click", startEraFromUI);
    on("endEraBtn", "click", endEraFromUI);
    on("rolloutStrategyCreate", "click", createRolloutStrategyFromUI);
    on("rolloutStrategySelect", "change", selectRolloutStrategyFromUI);
    on("rolloutStrategyAddDrop", "click", addRolloutDropFromUI);
    on("rolloutStrategyAddEvent", "click", addRolloutEventFromUI);
    on("rolloutStrategyAutoRun", "change", toggleRolloutStrategyAutoRunFromUI);
    on("rolloutStrategyExpand", "click", expandRolloutStrategyFromUI);
    on("saveBtn", "click", () => {
        if (!session.activeSlot) {
            logEvent("Select a slot before saving.", "warn");
            return;
        }
        saveToActiveSlot();
        logEvent(`Saved to Slot ${session.activeSlot}.`);
    });
    on("loadInput", "change", async (e) => {
        const file = e.target.files[0];
        if (!file)
            return;
        if (!session.activeSlot) {
            logEvent("Select a slot before loading a file.", "warn");
            return;
        }
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            resetState(parsed);
            refreshSelectOptions();
            await computeCharts();
            renderAll();
            saveToActiveSlot();
            logEvent(`Loaded save file into Slot ${session.activeSlot}.`);
        }
        catch {
            logEvent("Failed to load save file.", "warn");
        }
    });
    const creatorList = root.querySelector("#creatorList");
    if (creatorList) {
        creatorList.addEventListener("click", (e) => {
            const item = e.target.closest("[data-entity-type=\"creator\"]");
            if (!item)
                return;
            const target = state.ui.slotTarget;
            if (!target) {
                logEvent("Select an ID slot, then tap a Creator ID.", "warn");
                return;
            }
            assignToSlot(target, "creator", item.dataset.entityId);
        });
    }
    const handleTrackListClick = (e) => {
        const item = e.target.closest("[data-entity-type=\"track\"]");
        if (!item)
            return;
        const target = state.ui.slotTarget;
        if (!target) {
            logEvent("Select an ID slot, then tap a Track ID.", "warn");
            return;
        }
        assignToSlot(target, "track", item.dataset.entityId);
    };
    root.querySelectorAll("#trackList, #trackArchiveList").forEach((list) => {
        list.addEventListener("click", handleTrackListClick);
    });
    on("promoteIconBtn", "click", () => logEvent("Promotion console opened from Comms."));
    on("eyeriSocialBtn", "click", () => logEvent("eyeriSocial post drafted."));
    on("communitiesAreas", "click", () => openOverlay("communitiesModal"));
    on("communitiesCreators", "click", () => openOverlay("communitiesModal"));
    on("communitiesItems", "click", () => openOverlay("communitiesModal"));
    on("communitiesCollabs", "click", () => openOverlay("communitiesModal"));
    on("hubAreas", "click", () => openOverlay("harmonyModal"));
    on("hubCreators", "click", () => openOverlay("harmonyModal"));
    on("hubItems", "click", () => openOverlay("harmonyModal"));
    on("hubCollabs", "click", () => openOverlay("harmonyModal"));
    on("studioOwnerFilter", "change", (e) => {
        state.ui.studioOwnerFilter = e.target.value || "all";
        renderStudiosList();
        saveToActiveSlot();
    });
    root.querySelectorAll("[data-studio-filter]").forEach((input) => {
        input.addEventListener("change", (e) => {
            const key = e.target.dataset.studioFilter;
            if (!key)
                return;
            if (!state.ui.studioFilters) {
                state.ui.studioFilters = {
                    owned: true,
                    unowned: true,
                    occupied: true,
                    unoccupied: true
                };
            }
            state.ui.studioFilters[key] = e.target.checked;
            renderStudiosList();
            saveToActiveSlot();
        });
    });
    on("socialShowInternal", "change", (e) => {
        state.ui.socialShowInternal = e.target.checked;
        renderSocialFeed();
        saveToActiveSlot();
    });
    root.querySelectorAll("[data-social-filter]").forEach((input) => {
        input.addEventListener("change", (e) => {
            const key = e.target.dataset.socialFilter;
            if (!key)
                return;
            state.ui.socialFilters[key] = e.target.checked;
            renderSocialFeed();
            saveToActiveSlot();
        });
    });
    on("exportDebugBtn", "click", exportDebugBundle);
}
function exportDebugBundle() {
    const log = loadUiEventLog();
    const eventLog = Array.isArray(state.events) ? state.events : [];
    const snapshot = {
        route: state.ui.activeView || activeRoute,
        week: weekIndex() + 1,
        cash: state.label.cash,
        activeSlot: session.activeSlot,
        activeIdSlot: state.ui.slotTarget,
        time: {
            epochMs: state.time.epochMs,
            totalHours: state.time.totalHours
        }
    };
    const summaryLines = [
        "# Usage Session Summary",
        `Generated: ${new Date().toISOString()}`,
        `Route: ${snapshot.route}`,
        `Week: ${snapshot.week}`,
        `Cash: ${formatMoney(snapshot.cash)}`,
        `Active Slot: ${snapshot.activeSlot || "-"}`,
        `Difficulty: ${state.meta?.difficulty || DEFAULT_GAME_DIFFICULTY}`,
        "",
        "## Event Counts"
    ];
    const counts = log.reduce((acc, entry) => {
        acc[entry.event_type] = (acc[entry.event_type] || 0) + 1;
        return acc;
    }, {});
    Object.keys(counts).sort().forEach((key) => {
        summaryLines.push(`- ${key}: ${counts[key]}`);
    });
    const summary = summaryLines.join("\n");
    downloadFile("usage_session.json", JSON.stringify(log, null, 2), "application/json");
    downloadFile("simulation_event_log.json", JSON.stringify(eventLog, null, 2), "application/json");
    downloadFile("usage_session_summary.md", summary, "text/markdown");
    downloadFile("state_snapshot.json", JSON.stringify(snapshot, null, 2), "application/json");
    if (state.meta?.seedHistory) {
        downloadFile("seed_history.json", JSON.stringify(state.meta.seedHistory, null, 2), "application/json");
    }
    if (state.meta?.seedInfo) {
        downloadFile("seed_info.json", JSON.stringify(state.meta.seedInfo, null, 2), "application/json");
    }
    if (state.meta?.seedCalibration) {
        downloadFile("seed_calibration.json", JSON.stringify(state.meta.seedCalibration, null, 2), "application/json");
    }
    logEvent(`Debug bundle exported (${formatCount(log.length)} UI events, ${formatCount(eventLog.length)} system events).`);
    logUiEvent("export_debug", { ui_events: log.length, sim_events: eventLog.length });
}
function formatLossArchiveTimestamp(epochMs) {
    const d = new Date(epochMs || Date.now());
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}__${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
function exportLossArchive(entry) {
    if (!entry)
        return;
    const stamp = formatLossArchiveTimestamp(entry.createdAt);
    const labelSlug = String(entry.label || "label").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "label";
    const base = `loss_${labelSlug}_${stamp}`;
    downloadFile(`${base}.json`, JSON.stringify(entry, null, 2), "application/json");
    const summary = [
        "# Loss Archive Summary",
        `Generated: ${new Date().toISOString()}`,
        `Label: ${entry.label || "-"}`,
        `Result: ${entry.result || "loss"}`,
        `Difficulty: ${entry.difficulty || "-"}`,
        `Reason: ${entry.reason || "-"}`,
        `Slot: ${entry.slot || "-"}`,
        `Week: ${entry.week || "-"}`,
        `Year: ${entry.year || "-"}`,
        `Cash: ${formatMoney(entry.cash || 0)}`,
        `EXP: ${formatCount(entry.exp || 0)}`,
        `Game Date: ${entry.gameTime ? formatDate(entry.gameTime) : "-"}`,
        "",
        `UI events: ${Array.isArray(entry.uiEvents) ? entry.uiEvents.length : 0}`,
        `System events: ${Array.isArray(entry.simEvents) ? entry.simEvents.length : 0}`
    ].join("\n");
    downloadFile(`${base}_summary.md`, summary, "text/markdown");
}
function downloadFile(name, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
function panelKey(panel) {
    return panel.dataset.panel || panel.getAttribute("data-panel");
}
function panelDock(panel) {
    if (panel.closest(".panel-tray"))
        return "tray";
    if (panel.closest(".left"))
        return "left";
    if (panel.closest(".right"))
        return "right";
    if (panel.closest(".center"))
        return "center";
    if (panel.closest(".footer"))
        return "footer";
    return panel.dataset.origDock || "footer";
}
function setPanelOrder(container, panel, index) {
    const children = Array.from(container.children);
    if (index >= 0 && index < children.length) {
        container.insertBefore(panel, children[index]);
    }
    else {
        container.appendChild(panel);
    }
}
function savePanelLayout() {
    if (isRestoringLayout)
        return;
    const layout = {};
    document.querySelectorAll(".panel.card").forEach((panel) => {
        const key = panelKey(panel);
        if (!key)
            return;
        const dock = panelDock(panel);
        const parent = panel.parentElement;
        const order = parent ? Array.from(parent.children).indexOf(panel) : -1;
        layout[key] = {
            dock,
            order,
            state: panel.dataset.state || PANEL_STATES.open,
            hidden: panel.classList.contains("panel-hidden"),
            width: panel.style.width || "",
            height: panel.style.height || "",
            marginLeft: panel.style.marginLeft || "",
            marginTop: panel.style.marginTop || ""
        };
    });
    localStorage.setItem(PANEL_LAYOUT_KEY, JSON.stringify(layout));
}
function loadPanelLayout() {
    const raw = localStorage.getItem(PANEL_LAYOUT_KEY);
    if (!raw)
        return false;
    let layout = null;
    try {
        layout = JSON.parse(raw);
    }
    catch {
        return false;
    }
    if (!layout)
        return false;
    isRestoringLayout = true;
    Object.entries(layout).forEach(([key, entry]) => {
        const panel = document.querySelector(`.panel.card[data-panel="${key}"]`);
        if (!panel)
            return;
        setPanelVisibility(panel, !entry.hidden);
        panel.style.width = entry.width || "";
        panel.style.height = entry.height || "";
        panel.style.marginLeft = entry.marginLeft || "";
        panel.style.marginTop = entry.marginTop || "";
        const state = normalizePanelState(entry.state || PANEL_STATES.open);
        if (state === PANEL_STATES.collapsed) {
            const dock = entry.dock || panel.dataset.origDock || "footer";
            const target = document.querySelector(`.${dock}`) || document.querySelector(".footer");
            if (target)
                setPanelOrder(target, panel, entry.order);
            setPanelState(panel, PANEL_STATES.collapsed);
            setPanelVisibility(panel, false);
        }
        else if (state === PANEL_STATES.expanded) {
            const center = document.querySelector(".center");
            if (center)
                setPanelOrder(center, panel, entry.order);
            setPanelState(panel, PANEL_STATES.expanded);
        }
        else {
            const container = document.querySelector(`.${entry.dock}`) || document.querySelector(".footer");
            if (container)
                setPanelOrder(container, panel, entry.order);
            setPanelState(panel, state);
        }
    });
    syncFocusCount();
    isRestoringLayout = false;
    syncLayoutState();
    return true;
}
function resetPanelSizing(panel) {
    panel.style.width = "";
    panel.style.height = "";
    panel.style.marginLeft = "";
    panel.style.marginTop = "";
}
function logRecommendation(type, payload) {
    logEvent(`RECOMMEND ${type}: ${JSON.stringify(payload)}`);
}
function logChoice(type, payload) {
    logEvent(`CHOICE ${type}: ${JSON.stringify(payload)}`);
}
function updateTrackRecommendation() {
    const target = $("trackRecommend");
    if (!target)
        return;
    const rec = recommendTrackPlan();
    const writer = rec.songwriterId ? getCreator(rec.songwriterId) : null;
    const performer = rec.performerId ? getCreator(rec.performerId) : null;
    const producer = rec.producerId ? getCreator(rec.producerId) : null;
    const modifierSelect = $("modifierSelect");
    const selectedModifierId = modifierSelect && modifierSelect.value ? modifierSelect.value : rec.modifierId;
    const selectedModifier = getModifier(selectedModifierId);
    const recModifier = getModifier(rec.modifierId);
    const stage = state.ui.createStage || "sheet";
    const stageLabel = stage === "demo"
        ? "Demo Recording"
        : stage === "master"
            ? "Master Recording"
            : "Sheet Music";
    const stageIndex = stage === "demo" ? 1 : stage === "master" ? 2 : 0;
    const stageInfo = STAGES[stageIndex];
    const songwriterCount = getTrackSlotIds("Songwriter").length;
    const performerCount = getTrackSlotIds("Performer").length;
    const producerCount = getTrackSlotIds("Producer").length;
    const stageCount = stageIndex === 1 ? performerCount : stageIndex === 2 ? producerCount : songwriterCount;
    const stageCountSafe = stageCount || 1;
    const stageCrewIds = stageIndex === 1
        ? getTrackSlotIds("Performer")
        : stageIndex === 2
            ? getTrackSlotIds("Producer")
            : getTrackSlotIds("Songwriter");
    const stageCost = stageCrewIds.length ? getStageCost(stageIndex, selectedModifier, stageCrewIds) : 0;
    const formatHours = (value) => {
        if (!Number.isFinite(value))
            return "-";
        const rounded = Math.round(value * 100) / 100;
        return rounded % 1 === 0 ? `${rounded}` : `${rounded}`;
    };
    const baseStageHours = getAdjustedStageHours(stageIndex, null, stageCountSafe);
    const adjustedStageHours = getAdjustedStageHours(stageIndex, selectedModifier, stageCountSafe);
    const stageDelta = adjustedStageHours - baseStageHours;
    const stageDeltaLabel = stageDelta ? ` (${stageDelta > 0 ? "+" : ""}${formatHours(stageDelta)}h mod)` : "";
    const baseTotalHours = getAdjustedTotalStageHours(null, {
        Songwriter: songwriterCount || 1,
        Performer: performerCount || 1,
        Producer: producerCount || 1
    });
    const totalHours = getAdjustedTotalStageHours(selectedModifier, {
        Songwriter: songwriterCount || 1,
        Performer: performerCount || 1,
        Producer: producerCount || 1
    });
    const totalDelta = totalHours - baseTotalHours;
    const totalDeltaLabel = totalDelta ? ` (${totalDelta > 0 ? "+" : ""}${formatHours(totalDelta)}h mod)` : "";
    const crewStats = stageCount ? getCrewStageStats(stageIndex, stageCount) : null;
    const crewLine = stageInfo
        ? stageCount
            ? `<div class="muted">Crew: ${stageCount} assigned | ${crewStats.minutesPerPiece}m per piece x${crewStats.pieces} | ${stageInfo.stamina * stageCount} stamina total</div>`
            : `<div class="muted">Crew: 0 assigned</div>`
        : "";
    const crewSummaryLine = `<div class="muted">Selected crew: ${songwriterCount} songwriter(s) | ${performerCount} recorder(s) | ${producerCount} producer(s)</div>`;
    const stageLine = stageInfo
        ? `Stage: ${stageLabel} | ${formatHours(adjustedStageHours)}h${stageDeltaLabel} | ${stageInfo.stamina} stamina each`
        : `Stage: ${stageLabel}`;
    const stageCostLine = stageInfo
        ? `<div class="muted">Stage cost: ${stageCrewIds.length ? formatMoney(stageCost) : "-"}</div>`
        : "";
    const totalLine = stageInfo
        ? `<div class="muted">Estimated total: ${formatHours(totalHours)}h${totalDeltaLabel}</div>`
        : "";
    const theme = $("themeSelect") ? $("themeSelect").value : "";
    const mood = $("moodSelect") ? $("moodSelect").value : "";
    const warnings = [];
    const genreRanking = Array.isArray(state.genreRanking) ? state.genreRanking : [];
    const selectedGenre = theme && mood ? `${theme} / ${mood}` : "";
    const genreRank = genreRanking.length >= 40 && selectedGenre ? genreRanking.indexOf(selectedGenre) : -1;
    if (genreRank >= 30 && genreRank <= 39) {
        warnings.push("Unpopular genre may lower quality.");
    }
    if (mood === "Boring") {
        warnings.push("Boring moods reduce quality and never trend.");
    }
    const warningHtml = warnings.length
        ? warnings.map((note) => `<div class="muted">Warning: ${note}</div>`).join("")
        : `<div class="muted">Fit check: aligned creator preferences boost quality.</div>`;
    target.innerHTML = `
    <div class="muted">${stageLine}</div>
    ${stageCostLine}
    ${crewLine}
    ${totalLine}
    ${crewSummaryLine}
    <div class="muted">Recommended: ${rec.theme} / ${rec.mood} | Modifier ${recModifier?.label || "None"} | Project ${rec.projectType}</div>
    <div class="muted">Songwriter ${writer ? writer.name : "Unassigned"} | Performer ${performer ? performer.name : "Unassigned"} | Producer ${producer ? producer.name : "Unassigned"}</div>
    <div class="muted">Act assignment happens at release.</div>
    ${warningHtml}
    <div class="tiny">${rec.reasons}</div>
  `;
    renderCreateStageControls();
}
function applyTrackRecommendationPlan(rec, stage) {
    if (stage === "sheet") {
        if ($("themeSelect"))
            $("themeSelect").value = rec.theme;
        if ($("moodSelect"))
            $("moodSelect").value = rec.mood;
        if ($("modifierSelect"))
            $("modifierSelect").value = rec.modifierId;
        if ($("projectTypeSelect"))
            $("projectTypeSelect").value = rec.projectType;
    }
    else if (stage === "demo") {
        if ($("moodSelect"))
            $("moodSelect").value = rec.mood;
    }
}
function assignAllCreatorsToSlots() {
    const roles = ["Songwriter", "Performer", "Producer"];
    return roles.map((role) => {
        const req = staminaRequirement(role);
        const candidates = rankCandidates(role).filter((creator) => creator.ready && isCreatorOveruseSafe(creator, req));
        setTrackSlotIds(role, candidates.map((creator) => creator.id));
        return { role, count: getTrackSlotIds(role).length, req: staminaRequirement(role) };
    });
}
function recommendAllCreators(stageOverride) {
    const validStages = ["sheet", "demo", "master"];
    const stage = validStages.includes(stageOverride)
        ? stageOverride
        : state.ui.createStage || "sheet";
    if (stage !== state.ui.createStage)
        state.ui.createStage = stage;
    const rec = recommendTrackPlan();
    applyTrackRecommendationPlan(rec, stage);
    const summary = assignAllCreatorsToSlots();
    renderSlots();
    saveToActiveSlot();
    updateGenrePreview();
    updateTrackRecommendation();
    const counts = summary.map((entry) => `${roleLabel(entry.role)} ${entry.count}`).join(" | ");
    logEvent(`Recommended all creators for track slots. ${counts || "None assigned."}`);
    const missing = summary.filter((entry) => entry.count === 0);
    if (missing.length) {
        const detail = missing.map((entry) => `${entry.role} (${entry.req} stamina)`).join(", ");
        logEvent(`No available creators for: ${detail}. Daily limit ${STAMINA_OVERUSE_LIMIT}.`, "warn");
    }
}
function updateRecommendations() {
    updateTrackRecommendation();
}
window.updateRecommendations = updateRecommendations;
function ensureSlotDropdowns() {
    document.querySelectorAll(".id-slot").forEach((slot) => {
        if (slot.querySelector(".slot-select"))
            return;
        const select = document.createElement("select");
        select.className = "slot-select";
        select.setAttribute("aria-label", "Select slot value");
        select.addEventListener("click", (e) => e.stopPropagation());
        select.addEventListener("change", () => {
            const target = slot.dataset.slotTarget;
            const type = slot.dataset.slotType;
            const value = select.value;
            if (!target || !type)
                return;
            if (!value) {
                clearSlot(target);
                return;
            }
            assignToSlot(target, type, value);
        });
        slot.appendChild(select);
    });
}
if (typeof window !== "undefined") {
    window.applyDefaultLayout = applyDefaultLayout;
    window.resetViewLayout = resetViewLayout;
    window.updateTimeControls = () => {
        updateTimeControlButtons();
        syncTimeControlAria();
    };
    window.loadCSV = loadCSV;
}
function updateSlotDropdowns() {
    document.querySelectorAll(".id-slot").forEach((slot) => {
        const select = slot.querySelector(".slot-select");
        if (!select)
            return;
        const target = slot.dataset.slotTarget;
        const type = slot.dataset.slotType;
        const role = slot.dataset.slotRole;
        const currentValue = getSlotValue(target) || "";
        const options = [{ value: "", label: "Unassigned" }];
        if (type === "creator") {
            const req = role ? staminaRequirement(role) : 0;
            const creators = state.creators.filter((creator) => !role || creator.role === role);
            creators.forEach((creator) => {
                const lowStamina = role && creator.stamina < req;
                const roleText = roleLabel(creator.role);
                const label = lowStamina
                    ? `${creator.name} (${roleText}) - Low stamina`
                    : `${creator.name} (${roleText})`;
                options.push({ value: creator.id, label, disabled: lowStamina });
            });
        }
        else if (type === "act") {
            state.acts.forEach((act) => {
                options.push({ value: act.id, label: act.name });
            });
        }
        else if (type === "track") {
            let tracks = state.tracks;
            if (target === "promo-track") {
                const activeEraIds = new Set(getActiveEras().filter((era) => era.status === "Active").map((era) => era.id));
                tracks = state.tracks.filter((track) => track.status === "Released" && track.eraId && activeEraIds.has(track.eraId));
            }
            tracks.forEach((track) => {
                options.push({ value: track.id, label: `${track.title} (${track.status})` });
            });
        }
        select.innerHTML = "";
        options.forEach((opt) => {
            const option = document.createElement("option");
            option.value = opt.value;
            option.textContent = opt.label;
            if (opt.disabled)
                option.disabled = true;
            select.appendChild(option);
        });
        select.value = currentValue;
        select.disabled = slot.classList.contains("disabled");
    });
}
window.updateSlotDropdowns = updateSlotDropdowns;
window.ensureSlotDropdowns = ensureSlotDropdowns;
function ensureSocialDetailModal() {
    if ($("socialDetailModal"))
        return;
    const overlay = document.createElement("div");
    overlay.id = "socialDetailModal";
    overlay.className = "overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
    <div class="overlay-card panel">
      <div class="card-head">
        <h2>Post Details</h2>
        <button id="socialDetailClose" type="button" class="ghost">Close</button>
      </div>
      <div class="card-body">
        <div id="socialDetailMeta" class="muted"></div>
        <div id="socialDetailContent" class="list"></div>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);
    const closeBtn = $("socialDetailClose");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => closeOverlay("socialDetailModal"));
    }
    const feed = $("socialFeed");
    if (feed && !feed.dataset.detailBound) {
        feed.dataset.detailBound = "true";
        feed.addEventListener("click", (event) => {
            const item = event.target.closest(".social-item");
            if (!item)
                return;
            const id = item.dataset.postId;
            if (!id)
                return;
            const detail = resolveSocialDetail(id);
            if (!detail)
                return;
            const meta = $("socialDetailMeta");
            const content = $("socialDetailContent");
            if (meta)
                meta.textContent = `${detail.handle} | ${formatDate(detail.ts)} | ${detail.type}`;
            if (content) {
                const title = detail.title || detail.text || "Update";
                const lines = detail.lines?.length ? detail.lines : (detail.text ? [detail.text] : []);
                const body = lines.map((line) => `<div class="muted">${line}</div>`).join("");
                content.innerHTML = `<div class="item-title">${title}</div>${body}`;
            }
            openOverlay("socialDetailModal");
        });
    }
}
function resolveSocialDetail(id) {
    if (id.startsWith("LOG-")) {
        const ts = Number(id.replace("LOG-", ""));
        const entry = state.events.find((event) => event.ts === ts);
        if (!entry)
            return null;
        return { ts: entry.ts, handle: "@System", type: "system", text: entry.text, lines: [] };
    }
    const post = (state.social?.posts || []).find((entry) => entry.id === id);
    if (!post)
        return null;
    return post;
}
function renderPanelMenu() {
    const list = $("panelMenuList");
    if (!list)
        return;
    const root = document.querySelector(".view");
    if (!root)
        return;
    const route = state.ui.activeView || activeRoute;
    const store = ensureViewPanelState(route, root);
    const panels = Array.from(root.querySelectorAll(".panel.card"));
    list.innerHTML = panels.map((panel) => {
        const key = panelKey(panel);
        const title = panelTitle(panel) || key || "Panel";
        const entry = store[route]?.[key] || { state: VIEW_PANEL_STATES.open };
        const stateLabel = entry.state === VIEW_PANEL_STATES.hidden ? "Hidden" : "Open";
        const actionLabel = entry.state === VIEW_PANEL_STATES.hidden ? "Show" : "Hide";
        return `
      <div class="list-item">
        <div class="list-row">
          <div>
            <div class="item-title">${title}</div>
            <div class="muted">${stateLabel}</div>
          </div>
          <div class="actions">
            <button type="button" class="ghost" data-panel-toggle="${key}">${actionLabel}</button>
          </div>
        </div>
      </div>
    `;
    }).join("");
}
function setupFocusDismissal() {
    const focus = document.querySelector(".center");
    if (!focus)
        return;
    focus.addEventListener("pointerdown", (e) => {
        if (e.target !== focus)
            return;
        expandedPanels.slice().forEach((panel) => minimizePanel(panel));
    });
}
function autoAssignCreators() {
    renderAutoAssignModal();
    openOverlay("autoAssignModal");
}
function assignBestCandidates() {
    const pickBest = (role) => {
        const req = staminaRequirement(role);
        const candidates = rankCandidates(role).filter((creator) => creator.ready && isCreatorOveruseSafe(creator, req));
        if (!candidates.length) {
            logEvent(`No available ${roleLabel(role)} creators under daily limit (${STAMINA_OVERUSE_LIMIT}).`, "warn");
            return null;
        }
        return candidates[0].id || null;
    };
    setTrackSlotIds("Songwriter", [pickBest("Songwriter")]);
    setTrackSlotIds("Performer", [pickBest("Performer")]);
    setTrackSlotIds("Producer", [pickBest("Producer")]);
    renderSlots();
    saveToActiveSlot();
    updateTrackRecommendation();
}
function renameLabelFromUI() {
    const name = $("labelNameInput").value.trim();
    if (!name) {
        logEvent("Label name cannot be empty.", "warn");
        $("labelNameInput").value = state.label.name;
        return;
    }
    if (name === state.label.name)
        return;
    state.label.name = name;
    state.marketTracks.forEach((track) => {
        if (track.isPlayer)
            track.label = state.label.name;
    });
    $("labelNameInput").value = state.label.name;
    logEvent(`Label renamed to "${state.label.name}".`);
    renderStats();
    saveToActiveSlot();
}
function startSoloTracksFromUI() {
    const themeSelect = $("themeSelect");
    if (!themeSelect) {
        logEvent("Theme selection unavailable.", "warn");
        return;
    }
    const theme = themeSelect.value;
    if (!theme) {
        shakeField("themeSelect");
        logEvent("Select a Theme to start sheet music.", "warn");
        return;
    }
    const moodSelect = $("moodSelect");
    const mood = moodSelect ? moodSelect.value : "";
    const titleInput = $("trackTitle").value.trim();
    const projectNameInput = $("projectName").value.trim();
    const projectType = $("projectTypeSelect") ? $("projectTypeSelect").value : "Single";
    const modifierId = $("modifierSelect") ? $("modifierSelect").value : "None";
    const modifier = getModifier(modifierId);
    const req = staminaRequirement("Songwriter");
    const assignedSongwriters = [...new Set(getTrackSlotIds("Songwriter"))];
    if (!assignedSongwriters.length) {
        shakeSlot(primaryTrackSlotTarget("Songwriter"));
        logEvent("Cannot start sheet music: assign a Songwriter ID.", "warn");
        return;
    }
    const eligibleSongwriters = assignedSongwriters.filter((id) => {
        const creator = getCreator(id);
        return creator && creator.stamina >= req;
    });
    if (!eligibleSongwriters.length) {
        logEvent(`No available Songwriter creators with ${req} stamina.`, "warn");
        return;
    }
    if (eligibleSongwriters.length < assignedSongwriters.length) {
        logEvent("Some songwriters were skipped due to low stamina.", "warn");
    }
    const availableStudios = getStudioAvailableSlots();
    if (availableStudios <= 0) {
        logEvent("No studio slots available. Finish a production or expand capacity first.", "warn");
        return;
    }
    const stageCosts = eligibleSongwriters.map((id) => getStageCost(0, modifier, [id]));
    const minCost = stageCosts.length ? Math.min(...stageCosts) : 0;
    if (state.label.cash < minCost) {
        logEvent("Not enough cash to start new sheet music.", "warn");
        return;
    }
    const recommendation = recommendTrackPlan();
    logRecommendation("startTrack", {
        version: recommendation.version,
        actId: recommendation.actId,
        theme: recommendation.theme,
        mood: recommendation.mood,
        songwriterIds: eligibleSongwriters,
        modifierId: recommendation.modifierId,
        projectType: recommendation.projectType,
        studioSlotsAvailable: availableStudios,
        reason: recommendation.reasons,
        mode: "solo"
    });
    let startedCount = 0;
    let stoppedByCash = false;
    let stoppedByStudio = false;
    for (let i = 0; i < eligibleSongwriters.length; i += 1) {
        const songwriterId = eligibleSongwriters[i];
        const stageCost = getStageCost(0, modifier, [songwriterId]);
        if (state.label.cash < stageCost) {
            stoppedByCash = true;
            break;
        }
        const title = titleInput
            ? (eligibleSongwriters.length > 1 ? `${titleInput} ${i + 1}` : titleInput)
            : makeTrackTitle(theme, mood);
        const projectName = projectNameInput || makeProjectTitle();
        const track = createTrack({
            title,
            theme,
            songwriterIds: [songwriterId],
            performerIds: [],
            producerIds: [],
            actId: null,
            projectName,
            projectType,
            modifierId
        });
        if (!track) {
            stoppedByStudio = true;
            break;
        }
        startedCount += 1;
        logChoice("startTrack", {
            trackId: track.id,
            theme,
            mood,
            songwriterIds: [songwriterId],
            performerIds: [],
            producerIds: [],
            modifierId,
            projectName,
            projectType,
            mode: "solo"
        });
        logUiEvent("action_submit", {
            action: "start_track",
            trackId: track.id,
            theme,
            mood,
            projectType,
            mode: "solo",
            songwriterId
        });
        const creator = getCreator(songwriterId);
        const creatorLabel = creator ? ` by ${creator.name}` : "";
        logEvent(`Started sheet music for "${track.title}" (Theme: ${track.theme})${creatorLabel}.`);
    }
    if (!startedCount)
        return;
    if (eligibleSongwriters.length > 1) {
        logEvent(`Started ${startedCount} solo track${startedCount === 1 ? "" : "s"}.`);
    }
    if (stoppedByCash) {
        logEvent("Stopped early: not enough cash to start more tracks.", "warn");
    }
    if (stoppedByStudio) {
        logEvent("Stopped early: no studio slots available for more sheet music.", "warn");
    }
    $("trackTitle").value = "";
    $("projectName").value = "";
    if ($("projectTypeSelect"))
        $("projectTypeSelect").value = "Single";
    renderAll();
}
function getSelectedStageTrackId(stageId) {
    if (stageId === "demo") {
        const selected = (state.ui.createTrackIds && state.ui.createTrackIds.demo)
            || $("demoTrackSelect")?.value
            || null;
        if (state.ui.createTrackIds)
            state.ui.createTrackIds.demo = selected || null;
        return selected || null;
    }
    if (stageId === "master") {
        const selected = (state.ui.createTrackIds && state.ui.createTrackIds.master)
            || $("masterTrackSelect")?.value
            || null;
        if (state.ui.createTrackIds)
            state.ui.createTrackIds.master = selected || null;
        return selected || null;
    }
    return null;
}
function startDemoFromUI() {
    const trackId = getSelectedStageTrackId("demo");
    if (!trackId) {
        logEvent("Select a track awaiting demo recording.", "warn");
        return;
    }
    const track = getTrack(trackId);
    if (!track) {
        logEvent("Track not found for demo recording.", "warn");
        return;
    }
    const mood = $("moodSelect") ? $("moodSelect").value : "";
    const performerIds = getTrackSlotIds("Performer");
    const started = startDemoStage(track, mood, performerIds);
    if (started) {
        logChoice("track_stage", { trackId, action: "demo", mood, performerIds });
        logUiEvent("action_submit", { action: "start_demo", trackId, mood, performerIds });
        renderAll();
    }
}
function startMasterFromUI() {
    const trackId = getSelectedStageTrackId("master");
    if (!trackId) {
        logEvent("Select a track awaiting mastering.", "warn");
        return;
    }
    const track = getTrack(trackId);
    if (!track) {
        logEvent("Track not found for mastering.", "warn");
        return;
    }
    const producerIds = getTrackSlotIds("Producer");
    const alignment = $("trackAlignment") ? $("trackAlignment").value : "";
    const started = startMasterStage(track, producerIds, alignment);
    if (started) {
        logChoice("track_stage", { trackId, action: "master", producerIds, alignment });
        logUiEvent("action_submit", { action: "start_master", trackId, producerIds, alignment });
        renderAll();
    }
}
function startSheetFromUI() {
    if (state.ui.recommendAllMode === "solo") {
        startSoloTracksFromUI();
        return;
    }
    const themeSelect = $("themeSelect");
    if (!themeSelect) {
        logEvent("Theme selection unavailable.", "warn");
        return;
    }
    const theme = themeSelect.value;
    if (!theme) {
        shakeField("themeSelect");
        logEvent("Select a Theme to start sheet music.", "warn");
        return;
    }
    const moodSelect = $("moodSelect");
    const mood = moodSelect ? moodSelect.value : "";
    const title = $("trackTitle").value.trim() || makeTrackTitle(theme, mood);
    const projectName = $("projectName").value.trim() || makeProjectTitle();
    const projectType = $("projectTypeSelect") ? $("projectTypeSelect").value : "Single";
    const modifierId = $("modifierSelect") ? $("modifierSelect").value : "None";
    const modifier = getModifier(modifierId);
    const songwriterIds = getTrackSlotIds("Songwriter");
    const performerIds = getTrackSlotIds("Performer");
    const producerIds = getTrackSlotIds("Producer");
    if (!songwriterIds.length) {
        shakeSlot(primaryTrackSlotTarget("Songwriter"));
        logEvent("Cannot start sheet music: assign a Songwriter ID.", "warn");
        return;
    }
    const availableStudios = getStudioAvailableSlots();
    if (availableStudios <= 0) {
        logEvent("No studio slots available. Finish a production or expand capacity first.", "warn");
        return;
    }
    const stageCost = getStageCost(0, modifier, songwriterIds);
    if (state.label.cash < stageCost) {
        logEvent("Not enough cash to start new sheet music.", "warn");
        return;
    }
    const recommendation = recommendTrackPlan();
    logRecommendation("startTrack", {
        version: recommendation.version,
        actId: recommendation.actId,
        theme: recommendation.theme,
        mood: recommendation.mood,
        songwriterId: recommendation.songwriterId,
        performerId: recommendation.performerId,
        producerId: recommendation.producerId,
        modifierId: recommendation.modifierId,
        projectType: recommendation.projectType,
        studioSlotsAvailable: availableStudios,
        reason: recommendation.reasons
    });
    const track = createTrack({
        title,
        theme,
        songwriterIds,
        performerIds,
        producerIds,
        actId: null,
        projectName,
        projectType,
        modifierId
    });
    if (!track)
        return;
    logChoice("startTrack", {
        trackId: track.id,
        theme,
        mood,
        songwriterIds,
        performerIds,
        producerIds,
        modifierId,
        projectName,
        projectType
    });
    logUiEvent("action_submit", {
        action: "start_track",
        trackId: track.id,
        theme,
        mood,
        projectType
    });
    logEvent(`Started sheet music for "${track.title}" (Theme: ${track.theme}).`);
    $("trackTitle").value = "";
    $("projectName").value = "";
    if ($("projectTypeSelect"))
        $("projectTypeSelect").value = "Single";
    renderAll();
}
function startTrackFromUI() {
    const stage = state.ui.createStage || "sheet";
    if (stage === "demo") {
        startDemoFromUI();
        return;
    }
    if (stage === "master") {
        startMasterFromUI();
        return;
    }
    startSheetFromUI();
}
function createActFromUI() {
    const name = $("actName").value.trim() || makeActName();
    const type = $("actTypeSelect").value;
    const alignment = $("actAlignmentSelect").value;
    const lead = state.ui.actSlots.lead;
    const member2 = state.ui.actSlots.member2;
    const member3 = state.ui.actSlots.member3;
    if (!lead) {
        logEvent("Cannot create act: choose a lead creator.", "warn");
        return;
    }
    let members = [lead];
    if (type === "Group Act") {
        if (member2)
            members.push(member2);
        if (member3)
            members.push(member3);
        members = [...new Set(members)];
        if (members.length < 2) {
            logEvent("Group Act needs at least 2 members.", "warn");
            return;
        }
    }
    const act = makeAct({ name, type, alignment, memberIds: members });
    state.acts.push(act);
    logUiEvent("action_submit", { action: "create_act", actId: act.id, type });
    logEvent(`Created ${act.type} "${act.name}".`);
    $("actName").value = "";
    state.ui.trackSlots.actId = act.id;
    renderActs();
    renderCreators();
    renderSlots();
    saveToActiveSlot();
}
function createQuickAct() {
    if (!state.creators.length) {
        logEvent("No creators available to form an act.", "warn");
        return;
    }
    const memberIds = pickDistinct(state.creators.map((creator) => creator.id), Math.min(2, state.creators.length));
    const type = memberIds.length > 1 ? "Group Act" : "Solo Act";
    const act = makeAct({
        name: makeActName(),
        type,
        alignment: state.label.alignment,
        memberIds
    });
    state.acts.push(act);
    logUiEvent("action_submit", { action: "create_act_quick", actId: act.id, type });
    logEvent(`Created ${act.type} "${act.name}".`);
    state.ui.trackSlots.actId = act.id;
    renderActs();
    renderCreators();
    renderSlots();
    saveToActiveSlot();
}
function startEraFromUI() {
    const actId = state.ui.eraSlots.actId;
    if (!actId) {
        logEvent("Cannot start Era: assign an Act ID.", "warn");
        return;
    }
    const rolloutId = $("eraRolloutSelect").value || ROLLOUT_PRESETS[1].id;
    const nameInput = $("eraNameInput").value.trim();
    const act = getAct(actId);
    const name = nameInput || makeEraName(act ? act.name : "New Act");
    const era = startEraForAct({ actId, name, rolloutId });
    logUiEvent("action_submit", { action: "start_era", eraId: era.id, actId });
    $("eraNameInput").value = "";
    renderEraStatus();
    saveToActiveSlot();
}
function endEraFromUI() {
    const actId = state.ui.eraSlots.actId;
    const active = getActiveEras().filter((entry) => entry.status === "Active");
    const candidates = actId ? active.filter((entry) => entry.actId === actId) : active;
    if (!candidates.length) {
        logEvent("No active Era to end.", "warn");
        return;
    }
    const era = candidates.reduce((latest, entry) => {
        const latestStamp = latest.startedAt ?? latest.startedWeek ?? 0;
        const entryStamp = entry.startedAt ?? entry.startedWeek ?? 0;
        return entryStamp >= latestStamp ? entry : latest;
    }, candidates[0]);
    const ended = endEraById(era.id, "manual");
    if (!ended) {
        logEvent("Era could not be ended.", "warn");
        return;
    }
    logUiEvent("action_submit", { action: "end_era", eraId: era.id });
    renderEraStatus();
    saveToActiveSlot();
}
function getSelectedRolloutStrategyIdFromUI() {
    const select = $("rolloutStrategySelect");
    if (select && select.value)
        return select.value;
    return state.ui?.viewContext?.rolloutStrategyId || null;
}
function getRolloutWeekFromUI() {
    const input = $("rolloutStrategyWeek");
    if (!input)
        return null;
    const value = Math.floor(Number(input.value) || 0);
    return value > 0 ? value : null;
}
function createRolloutStrategyFromUI() {
    const era = getRolloutPlanningEra();
    if (!era) {
        logEvent("Focus an active era to create a rollout strategy.", "warn");
        return;
    }
    const strategy = createRolloutStrategyForEra(era);
    if (!strategy)
        return;
    setSelectedRolloutStrategyId(strategy.id);
    logUiEvent("action_submit", { action: "rollout_strategy_create", eraId: era.id, strategyId: strategy.id });
    renderEraStatus();
    saveToActiveSlot();
}
function selectRolloutStrategyFromUI(e) {
    const strategyId = e.target.value || null;
    setSelectedRolloutStrategyId(strategyId);
    logUiEvent("action_submit", { action: "rollout_strategy_select", strategyId });
    renderEraStatus();
    saveToActiveSlot();
}
function addRolloutDropFromUI() {
    const strategyId = getSelectedRolloutStrategyIdFromUI();
    const weekNumber = getRolloutWeekFromUI();
    const contentId = $("rolloutStrategyDropId")?.value.trim();
    if (!strategyId) {
        logEvent("Select a rollout strategy first.", "warn");
        return;
    }
    if (!weekNumber) {
        logEvent("Select a valid rollout week.", "warn");
        return;
    }
    if (!contentId) {
        logEvent("Drop requires a Track ID.", "warn");
        return;
    }
    const ok = addRolloutStrategyDrop(strategyId, weekNumber, contentId);
    if (!ok)
        return;
    logUiEvent("action_submit", { action: "rollout_drop_add", strategyId, week: weekNumber, trackId: contentId });
    $("rolloutStrategyDropId").value = "";
    renderEraStatus();
    saveToActiveSlot();
}
function addRolloutEventFromUI() {
    const strategyId = getSelectedRolloutStrategyIdFromUI();
    const weekNumber = getRolloutWeekFromUI();
    const actionType = $("rolloutStrategyEventType")?.value || "";
    const contentId = $("rolloutStrategyEventContent")?.value.trim();
    if (!strategyId) {
        logEvent("Select a rollout strategy first.", "warn");
        return;
    }
    if (!weekNumber) {
        logEvent("Select a valid rollout week.", "warn");
        return;
    }
    if (!actionType) {
        logEvent("Event requires an action type.", "warn");
        return;
    }
    const ok = addRolloutStrategyEvent(strategyId, weekNumber, actionType, contentId);
    if (!ok)
        return;
    logUiEvent("action_submit", { action: "rollout_event_add", strategyId, week: weekNumber, actionType, contentId });
    $("rolloutStrategyEventContent").value = "";
    renderEraStatus();
    saveToActiveSlot();
}
function toggleRolloutStrategyAutoRunFromUI(e) {
    const strategyId = getSelectedRolloutStrategyIdFromUI();
    if (!strategyId)
        return;
    const strategy = getRolloutStrategyById(strategyId);
    if (!strategy)
        return;
    strategy.autoRun = Boolean(e.target.checked);
    if (strategy.autoRun && strategy.status === "Draft")
        strategy.status = "Active";
    logEvent(strategy.autoRun ? "Rollout auto-run enabled." : "Rollout auto-run disabled.");
    logUiEvent("action_submit", { action: "rollout_auto_run", strategyId, enabled: strategy.autoRun });
    renderEraStatus();
    saveToActiveSlot();
}
function expandRolloutStrategyFromUI() {
    const strategyId = getSelectedRolloutStrategyIdFromUI();
    if (!strategyId) {
        logEvent("Select a rollout strategy first.", "warn");
        return;
    }
    const result = expandRolloutStrategy(strategyId, { mode: "manual" });
    if (!result)
        return;
    logUiEvent("action_submit", { action: "rollout_expand", strategyId, ...result });
    renderEraStatus();
    saveToActiveSlot();
}
function renameActById(actId, nextName) {
    const act = getAct(actId);
    if (!act)
        return;
    const name = nextName.trim();
    if (!name) {
        logEvent("Act name cannot be empty.", "warn");
        renderActs();
        return;
    }
    if (act.name === name)
        return;
    act.name = name;
    logEvent(`Act renamed to "${act.name}".`);
    renderActs();
    renderTracks();
    renderReleaseDesk();
    renderSlots();
    saveToActiveSlot();
}
function pickPromoTrackFromFocus() {
    const focusEra = getFocusedEra();
    const activeEras = getActiveEras().filter((entry) => entry.status === "Active");
    const fallbackEra = !focusEra && activeEras.length === 1 ? activeEras[0] : null;
    const targetEra = focusEra || fallbackEra;
    if (!targetEra) {
        logEvent("Select a focus era before picking a promo track.", "warn");
        return;
    }
    const candidates = state.tracks.filter((track) => track.status === "Released" && track.eraId === targetEra.id);
    if (!candidates.length) {
        logEvent("No released tracks found for the focused era.", "warn");
        return;
    }
    const picked = candidates.reduce((latest, track) => {
        const latestStamp = latest.releasedAt || 0;
        const nextStamp = track.releasedAt || 0;
        return nextStamp >= latestStamp ? track : latest;
    }, candidates[0]);
    state.ui.promoSlots.trackId = picked.id;
    logUiEvent("action_submit", { action: "promo_focus_pick", eraId: targetEra.id, trackId: picked.id });
    logEvent(`Promo slot set to "${picked.title}".`);
    renderSlots();
    renderTracks();
    saveToActiveSlot();
}
function runPromotion() {
    const trackId = state.ui.promoSlots.trackId;
    const selectedTypes = ensurePromoTypeSelection(document, $("promoTypeSelect") ? $("promoTypeSelect").value : DEFAULT_PROMO_TYPE);
    const budget = normalizePromoBudget(document, selectedTypes);
    const totalCost = budget * selectedTypes.length;
    if (!trackId) {
        logEvent("No released track selected for promo push.", "warn");
        return;
    }
    if (budget <= 0 || Number.isNaN(budget)) {
        logEvent("Promo budget must be greater than 0.", "warn");
        return;
    }
    if (state.label.cash < totalCost) {
        const label = selectedTypes.length > 1 ? "promo pushes" : "promo push";
        logEvent(`Not enough cash for ${label}.`, "warn");
        return;
    }
    const track = getTrack(trackId);
    if (!track || track.status !== "Released" || !track.marketId) {
        logEvent("Track is not active on the market.", "warn");
        return;
    }
    const era = track.eraId ? getEraById(track.eraId) : null;
    if (!era || era.status !== "Active") {
        logEvent("Promo push requires a track from an active era.", "warn");
        return;
    }
    const act = getAct(track.actId);
    const scheduled = state.releaseQueue.find((entry) => entry.trackId === track.id);
    const releaseDate = scheduled ? formatDate(scheduled.releaseAt) : track.releasedAt ? formatDate(track.releasedAt) : "TBD";
    const market = state.marketTracks.find((entry) => entry.id === track.marketId);
    if (!market)
        return;
    const facilityNeeds = getPromoFacilityNeeds(selectedTypes);
    for (const [facilityId, count] of Object.entries(facilityNeeds)) {
        const availability = getPromoFacilityAvailability(facilityId);
        if (availability.available < count) {
            const label = facilityId === "broadcast" ? "Broadcast slots" : "Filming slots";
            const plural = count === 1 ? "type" : "types";
            logEvent(`Not enough ${label} today for ${count} promo ${plural}.`, "warn");
            return;
        }
    }
    for (const promoType of selectedTypes) {
        const facilityId = getPromoFacilityForType(promoType);
        if (!facilityId)
            continue;
        const reservation = reservePromoFacilitySlot(facilityId, promoType, track.id);
        if (!reservation.ok) {
            logEvent(reservation.reason || "No facility slots available today.", "warn");
            return;
        }
    }
    state.label.cash -= totalCost;
    const boostWeeks = clamp(Math.floor(budget / 1200) + 1, 1, 4);
    market.promoWeeks = Math.max(market.promoWeeks, boostWeeks);
    state.meta.promoRuns = (state.meta.promoRuns || 0) + selectedTypes.length;
    const promoIds = [
        ...(track.creators?.songwriterIds || []),
        ...(track.creators?.performerIds || []),
        ...(track.creators?.producerIds || [])
    ].filter(Boolean);
    markCreatorPromo(promoIds);
    selectedTypes.forEach((promoType) => {
        logUiEvent("action_submit", { action: "promotion", trackId, budget, weeks: boostWeeks, promoType });
        if (typeof postFromTemplate === "function") {
            postFromTemplate(promoType, {
                trackTitle: track.title,
                actName: act ? act.name : "Unknown Act",
                releaseDate,
                channel: track.distribution || "Digital",
                handle: handleFromName(state.label.name, "Label"),
                cost: budget
            });
        }
    });
    if (typeof postFromTemplate === "function") {
        renderSocialFeed();
    }
    else {
        logEvent("Promo template posting not available.", "warn");
    }
    const promoLabels = selectedTypes.map((promoType) => getPromoTypeDetails(promoType).label).join(", ");
    const verb = selectedTypes.length > 1 ? "Promo pushes funded" : "Promo push funded";
    const spendNote = selectedTypes.length > 1 ? ` Total spend: ${formatMoney(totalCost)}.` : "";
    logEvent(`${verb} for "${track.title}" (${promoLabels}) (+${boostWeeks} weeks).${spendNote}`);
    renderAll();
}
function handleReleaseActRecommendation(e) {
    const btn = e.target.closest("button[data-act-recommend]");
    if (!btn)
        return;
    const track = getTrack(btn.dataset.actRecommend);
    if (!track)
        return;
    const recommendation = recommendActForTrack(track);
    if (!recommendation.actId) {
        logEvent(recommendation.reason || "No act recommendation available.", "warn");
        return;
    }
    const act = getAct(recommendation.actId);
    if (!act) {
        logEvent("Act not found for recommendation.", "warn");
        return;
    }
    const assigned = assignTrackAct(track.id, act.id);
    if (!assigned)
        return;
    logRecommendation("release_act", {
        version: recommendation.version,
        trackId: track.id,
        actId: act.id,
        genre: recommendation.genre,
        theme: recommendation.theme,
        mood: recommendation.mood,
        reason: recommendation.reason,
        exactMatches: recommendation.exactMatches,
        partialMatches: recommendation.partialMatches,
        memberCount: recommendation.memberCount
    });
    logChoice("release_act", {
        trackId: track.id,
        actId: act.id,
        genre: recommendation.genre
    });
    logUiEvent("action_submit", {
        action: "recommend_release_act",
        trackId: track.id,
        actId: act.id
    });
    logEvent(`Recommended Act "${act.name}" for "${track.title}". ${recommendation.reason}`);
    renderAll();
}
function handleReleaseAction(e) {
    const btn = e.target.closest("button[data-release]");
    if (!btn)
        return;
    const track = getTrack(btn.dataset.track);
    if (!track)
        return;
    const isReady = track.status === "Ready";
    if (!track.actId || !getAct(track.actId)) {
        logEvent("Cannot release track: assign an Act first.", "warn");
        return;
    }
    const derivedGenre = track.genre || (track.theme && track.mood ? `${track.theme} / ${track.mood}` : "");
    const rec = derivedGenre ? recommendReleasePlan({ ...track, genre: derivedGenre }) : recommendReleasePlan(track);
    logRecommendation("release", {
        version: rec.version,
        trackId: track.id,
        distribution: rec.distribution,
        scheduleKey: rec.scheduleKey,
        scheduleHours: rec.scheduleHours,
        reason: rec.reason
    });
    let distribution = $("releaseDistribution") ? $("releaseDistribution").value : "Digital";
    let scheduleHours = 0;
    if (btn.dataset.release === "recommend") {
        distribution = rec.distribution;
        scheduleHours = rec.scheduleHours;
        if (rec.scheduleKey === "now") {
            if (isReady) {
                releaseTrack(track, distribution, distribution);
            }
            else {
                scheduleRelease(track, 0, distribution);
            }
        }
        else {
            scheduleRelease(track, rec.scheduleHours, distribution);
        }
    }
    if (btn.dataset.release === "asap" || btn.dataset.release === "now") {
        scheduleHours = getReleaseAsapHours();
        scheduleRelease(track, scheduleHours, distribution);
    }
    if (btn.dataset.release === "week") {
        scheduleHours = WEEK_HOURS;
        scheduleRelease(track, WEEK_HOURS, distribution);
    }
    if (btn.dataset.release === "fortnight") {
        scheduleHours = WEEK_HOURS * 2;
        scheduleRelease(track, WEEK_HOURS * 2, distribution);
    }
    logChoice("release", {
        trackId: track.id,
        action: btn.dataset.release,
        distribution,
        scheduleHours
    });
    logUiEvent("action_submit", {
        action: "release_track",
        trackId: track.id,
        releaseAction: btn.dataset.release,
        distribution,
        scheduleHours
    });
    renderAll();
}
function signCreatorById(id) {
    const creator = state.marketCreators.find((entry) => entry.id === id) || null;
    const result = attemptSignCreator({
        creatorId: id,
        recordLabelId: state.label?.name,
        nowEpochMs: state.time.epochMs
    });
    if (!result)
        return;
    logUiEvent("action_submit", {
        action: "sign_creator",
        creatorId: id,
        role: creator?.role,
        outcome: result.ok ? "accepted" : (result.kind || "unknown").toLowerCase(),
        reason: result.reason
    });
    if (!result.ok) {
        const card = document.querySelector(`[data-ccc-creator="${id}"]`);
        if (card)
            shakeElement(card);
        renderAll();
        return;
    }
    renderCreators();
    renderSlots();
    renderAll();
}
export async function initUI() {
    ensureSlotDropdowns();
    updateSlotDropdowns();
    ensureSocialDetailModal();
    setupOverlayDismissals();
    window.addEventListener("resize", () => clampAllPanels());
    bindGlobalHandlers();
    updateTimeControlButtons();
    syncTimeControlAria();
    initRouter();
    const stored = Number(sessionStorage.getItem("rls_active_slot"));
    if (stored && stored >= 1 && stored <= SLOT_COUNT) {
        session.activeSlot = stored;
        markUiLogStart();
        const data = getSlotData(stored);
        if (data) {
            resetState(data);
            refreshSelectOptions();
            await computeCharts();
            renderAll();
            closeMainMenu();
            startGameLoop();
            return;
        }
    }
    openMainMenu();
    syncGameModeSelect();
    syncDifficultySelect();
    syncStartPreferenceSelects();
}
function setupPanelControls() {
    document.querySelectorAll(".panel.card").forEach((panel) => {
        if (panel.querySelector(".panel-toggle-btn"))
            return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "panel-toggle-btn ghost mini";
        btn.textContent = "-";
        btn.addEventListener("click", (event) => {
            event.stopPropagation();
            panel.classList.toggle("minimized");
            btn.textContent = panel.classList.contains("minimized") ? "+" : "-";
        });
        panel.appendChild(btn);
    });
}
function setupPanelResizers(root) {
    const directions = ["right", "bottom", "corner", "corner-bl", "top", "left", "corner-tr", "corner-tl"];
    const scope = root || document;
    scope.querySelectorAll(".panel.card").forEach((panel) => {
        if (panel.classList.contains("panel-fixed"))
            return;
        if (panel.querySelector(".panel-resizer"))
            return;
        directions.forEach((dir) => {
            const handle = document.createElement("div");
            handle.className = `panel-resizer ${dir}`;
            handle.addEventListener("pointerdown", (event) => {
                event.preventDefault();
                const startX = event.clientX;
                const startY = event.clientY;
                const startRect = panel.getBoundingClientRect();
                const parentRect = panel.parentElement?.getBoundingClientRect();
                const styles = getComputedStyle(panel);
                const startMarginLeft = parseFloat(styles.marginLeft) || 0;
                const startMarginTop = parseFloat(styles.marginTop) || 0;
                const maxShiftLeft = parentRect ? Math.max(0, startRect.left - parentRect.left) : 0;
                const maxShiftUp = parentRect ? Math.max(0, startRect.top - parentRect.top) : 0;
                const maxWidth = parentRect ? Math.max(120, parentRect.width - 8) : startRect.width * 1.2;
                const maxHeight = parentRect ? Math.max(120, parentRect.height - 8) : startRect.height * 1.2;
                const minWidth = 220;
                const minHeight = 120;
                // bring the panel above siblings while resizing
                panel.classList.add('resizing');
                panel.style.zIndex = 60;
                const onMove = (moveEvent) => {
                    const dx = moveEvent.clientX - startX;
                    const dy = moveEvent.clientY - startY;
                    const parent = panel.parentElement || document.body;
                    const parentRectNow = parent.getBoundingClientRect();
                    const parentStyle = getComputedStyle(parent);
                    let columns = 1;
                    let columnLeft = parentRectNow.left;
                    let columnRight = parentRectNow.right;
                    if (parentStyle.display && parentStyle.display.indexOf('grid') !== -1 && parentStyle.gridTemplateColumns) {
                        const cols = parentStyle.gridTemplateColumns.trim().split(/\s+/).length || 1;
                        columns = Math.max(1, cols);
                        const colWidth = parentRectNow.width / columns;
                        const colIndex = Math.min(columns - 1, Math.max(0, Math.floor((startRect.left - parentRectNow.left) / colWidth)));
                        columnLeft = parentRectNow.left + colIndex * colWidth;
                        columnRight = columnLeft + colWidth;
                    }
                    let width = startRect.width;
                    let height = startRect.height;
                    let marginLeft = startMarginLeft;
                    let marginTop = startMarginTop;
                    const inFooter = Boolean(panel.closest(".footer"));
                    let useRight = dir === "right" || dir === "corner" || dir === "corner-tr";
                    let useLeft = dir === "left" || dir === "corner-tl" || dir === "corner-bl";
                    let useBottom = dir === "bottom" || dir === "corner" || dir === "corner-bl";
                    let useTop = dir === "top" || dir === "corner-tr" || dir === "corner-tl";
                    // If a panel sits in the footer, resizing upward is more intuitive.
                    if (inFooter && (dir === "bottom" || dir === "corner")) {
                        useBottom = false;
                        useTop = true;
                    }
                    // Right edge: increase width but never overflow parent
                    if (useRight) {
                        const maxAllowed = Math.max(minWidth, parentRectNow.right - startRect.left - 8);
                        width = clamp(startRect.width + dx, minWidth, Math.min(maxWidth, maxAllowed));
                        // also ensure we don't exceed the parent column (grid cell) boundary
                        width = Math.min(width, Math.max(minWidth, columnRight - startRect.left - 8));
                    }
                    // Left handle: compute new left edge, clamp within parent, and derive width + margin
                    if (useLeft) {
                        const minLeftBound = columnLeft + 8;
                        const proposedLeft = clamp(startRect.left + dx, minLeftBound, startRect.right - minWidth);
                        const newWidth = clamp(startRect.right - proposedLeft, minWidth, Math.min(maxWidth, columnRight - proposedLeft - 8));
                        width = Math.min(newWidth, Math.max(minWidth, columnRight - proposedLeft - 8));
                        marginLeft = startMarginLeft + (proposedLeft - startRect.left);
                        // ensure marginLeft doesn't push outside parent
                        const newLeft = startRect.left + (marginLeft - startMarginLeft);
                        if (newLeft < parentRectNow.left + 8)
                            marginLeft += (parentRectNow.left + 8) - newLeft;
                    }
                    // Bottom / corner: increase height but never overflow parent bottom
                    if (useBottom) {
                        const maxAllowedH = Math.max(minHeight, parentRectNow.bottom - startRect.top - 8);
                        height = clamp(startRect.height + dy, minHeight, Math.min(maxHeight, maxAllowedH));
                        height = Math.min(height, Math.max(minHeight, parentRectNow.height - 8));
                    }
                    // Top handle: compute new top edge, clamp, and derive height + marginTop
                    if (useTop) {
                        const proposedTop = clamp(startRect.top + dy, parentRectNow.top, startRect.bottom - minHeight);
                        const newHeight = clamp(startRect.bottom - proposedTop, minHeight, Math.min(maxHeight, parentRectNow.bottom - proposedTop - 8));
                        height = Math.min(newHeight, Math.max(minHeight, parentRectNow.height - 8));
                        marginTop = startMarginTop + (proposedTop - startRect.top);
                        marginTop = clamp(marginTop, -Math.abs(maxShiftUp), Math.max(0, parentRectNow.bottom - startRect.bottom));
                    }
                    panel.style.width = `${width}px`;
                    panel.style.height = `${height}px`;
                    if (useLeft)
                        panel.style.marginLeft = `${marginLeft}px`;
                    if (useTop)
                        panel.style.marginTop = `${marginTop}px`;
                };
                const onUp = () => {
                    window.removeEventListener("pointermove", onMove);
                    window.removeEventListener("pointerup", onUp);
                    // after finishing resize, ensure panel placement and reset z-index
                    panel.classList.remove('resizing');
                    panel.style.zIndex = '';
                    ensurePanelPlacement(panel);
                    persistPanelSize(panel);
                };
                window.addEventListener("pointermove", onMove);
                window.addEventListener("pointerup", onUp);
            });
            panel.appendChild(handle);
        });
    });
}
// Ensure a panel fits within the central viewport. If a panel's bottom edge
// extends past the center area (i.e., it would overlap the center content),
// move it to the `.footer` area and add a small restore button so players can
// move it back. This keeps the center/chart area visible.
function ensurePanelPlacement(panel) {
    try {
        if (panel.classList.contains("panel--expanded"))
            return;
        const centerEl = document.querySelector('.center');
        const footerEl = document.querySelector('.footer');
        if (!centerEl || !footerEl || !panel)
            return;
        const panelRect = panel.getBoundingClientRect();
        const centerRect = centerEl.getBoundingClientRect();
        // If panel extends below the center's bottom by more than 24px, move it.
        if (panelRect.bottom > centerRect.bottom - 24) {
            const parent = panel.parentElement;
            if (parent && parent.classList.contains('footer'))
                return; // already footer
            // remember original column class to allow restore
            const origCol = parent && (parent.classList.contains('left') ? 'left' : parent.classList.contains('center') ? 'center' : parent.classList.contains('right') ? 'right' : 'unknown');
            panel.dataset.origParent = origCol;
            panel.dataset.origIndex = Array.from(parent.children).indexOf(panel);
            footerEl.appendChild(panel);
            panel.classList.add('moved-to-footer');
            // add a restore button if not present
            if (!panel.querySelector('.restore-panel-btn')) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'restore-panel-btn ghost mini';
                btn.textContent = 'Restore';
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    restorePanelToOrigin(panel);
                });
                // put button into top-left corner of panel
                const head = panel.querySelector('.card-head') || panel;
                head.appendChild(btn);
            }
        }
    }
    catch (err) {
        // fail silently
    }
}
function restorePanelToOrigin(panel) {
    try {
        const orig = panel.dataset.origParent || 'left';
        const target = document.querySelector('.' + orig) || document.querySelector('.left') || document.querySelector('.center') || document.querySelector('.right');
        if (!target)
            return;
        const idx = Number(panel.dataset.origIndex || -1);
        if (idx >= 0 && idx < target.children.length) {
            target.insertBefore(panel, target.children[idx]);
        }
        else {
            target.appendChild(panel);
        }
        panel.classList.remove('moved-to-footer');
        const btn = panel.querySelector('.restore-panel-btn');
        if (btn)
            btn.remove();
        delete panel.dataset.origParent;
        delete panel.dataset.origIndex;
    }
    catch (err) {
        // ignore
    }
}
function scanAllPanelsForOverflow() {
    try {
        document.querySelectorAll('.panel.card').forEach((panel) => {
            ensurePanelPlacement(panel);
        });
    }
    catch (e) { }
}
function setupOverlayDismissals() {
    // Close overlays when clicking outside the overlay-card
    document.querySelectorAll('.overlay').forEach((overlay) => {
        overlay.addEventListener('pointerdown', (e) => {
            if (e.target === overlay) {
                const id = overlay.id;
                if (id)
                    closeOverlay(id);
            }
        });
    });
}
function updateTimeControlButtons() {
    const pauseBtn = $("pauseBtn");
    const playBtn = $("playBtn");
    const fastBtn = $("fastBtn");
    if (pauseBtn)
        pauseBtn.classList.remove("active");
    if (playBtn)
        playBtn.classList.remove("active");
    if (fastBtn)
        fastBtn.classList.remove("active");
    if (state.time.speed === "pause" && pauseBtn)
        pauseBtn.classList.add("active");
    if (state.time.speed === "play" && playBtn)
        playBtn.classList.add("active");
    if (state.time.speed === "fast" && fastBtn)
        fastBtn.classList.add("active");
}
// Accessibility: set aria-pressed on time controls
function syncTimeControlAria() {
    const map = { pause: 'pauseBtn', play: 'playBtn', fast: 'fastBtn' };
    Object.keys(map).forEach((k) => {
        const el = $(map[k]);
        if (!el)
            return;
        el.setAttribute('aria-pressed', state.time.speed === k ? 'true' : 'false');
    });
}
function setSkipProgress(total, current, label) {
    const fill = $("skipProgressFill");
    const meta = $("skipProgressMeta");
    const text = $("skipProgressLabel");
    if (text)
        text.textContent = label || "Skipping time...";
    if (meta)
        meta.textContent = `${formatCount(current)} / ${formatCount(total)} hours`;
    if (fill) {
        const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
        fill.style.width = `${pct}%`;
    }
}
function openSkipProgress(label) {
    setSkipProgress(1, 0, label);
    openOverlay("skipProgressModal");
}
function closeSkipProgress() {
    closeOverlay("skipProgressModal");
}
function runTimeJump(totalHours, label) {
    if (!totalHours || totalHours <= 0)
        return;
    const chunkSize = totalHours >= 24 * 365 ? 48 : totalHours >= 24 * 90 ? 24 : 12;
    let completed = 0;
    let cancelled = false;
    openSkipProgress(label);
    setSkipProgress(totalHours, completed, label);
    const cancelBtn = $("skipProgressCancel");
    const cancelHandler = () => { cancelled = true; };
    if (cancelBtn) {
        cancelBtn.disabled = false;
        cancelBtn.addEventListener("click", cancelHandler, { once: true });
    }
    const step = async () => {
        if (cancelled) {
            logEvent("Time skip canceled.", "warn");
            closeSkipProgress();
            renderAll();
            return;
        }
        const remaining = totalHours - completed;
        const stepHours = Math.min(chunkSize, remaining);
        await advanceHours(stepHours, { renderHourly: false, renderAfter: false });
        completed += stepHours;
        setSkipProgress(totalHours, completed, label);
        if (completed >= totalHours) {
            closeSkipProgress();
            renderAll();
            return;
        }
        setTimeout(step, 0);
    };
    setTimeout(step, 0);
}
export default initUI;
