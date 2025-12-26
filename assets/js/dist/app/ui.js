// @ts-nocheck
import * as game from "./game.js";
import { loadCSV } from "./csv.js";
import { fetchChartSnapshot, listChartWeeks } from "./db.js";
import { buildPromoHint, DEFAULT_PROMO_TYPE, getPromoTypeCosts, getPromoTypeDetails, PROMO_TYPE_DETAILS } from "./promo_types.js";
import { setUiHooks } from "./game/ui-hooks.js";
import { getUsageSessionSnapshot, recordUsageEvent, updateUsageSessionContext } from "./usage-log.js";
import { clearExternalStorageHandle, getExternalStorageStatus, importChartHistoryFromExternal, importSavesFromExternal, isExternalStorageSupported, requestExternalStorageHandle, syncExternalStorageNow } from "./file-storage.js";
import { $, closeOverlay, describeSlot, getSlotElement, openOverlay, shakeElement, shakeField, shakeSlot, showEndScreen } from "./ui/dom.js";
import { closeMainMenu, openMainMenu, refreshSelectOptions, renderActs, renderAll, renderAutoAssignModal, renderCalendarList, renderCalendarView, renderCharts, renderCreateStageControls, renderCreators, renderEraStatus, renderEventLog, renderGenreIndex, renderLossArchives, renderMainMenu, renderMarket, renderQuickRecipes, renderRankingWindow, renderReleaseDesk, renderRoleActions, renderSlots, renderSocialFeed, renderStats, renderStudiosList, renderTime, renderTouringDesk, renderTracks, renderTutorialEconomy, updateActMemberFields, updateGenrePreview } from "./ui/render/index.js";
import { bindThemeSelectAccent, buildMoodOptions, buildThemeOptions, setThemeSelectAccent } from "./ui/themeMoodOptions.js";
const { state, session, rankCandidates, logEvent, saveToActiveSlot, makeTrackTitle, makeProjectTitle, makeLabelName, getModifier, getModifierInventoryCount, purchaseModifier, getProjectTrackLimits, staminaRequirement, getCreatorStaminaSpentToday, STAMINA_OVERUSE_LIMIT, getCrewStageStats, getAdjustedStageHours, getAdjustedTotalStageHours, getStageCost, createTrack, evaluateProjectTrackConstraints, startDemoStage, startMasterStage, advanceHours, makeActName, makeAct, pickDistinct, getAct, getCreator, makeEraName, getEraById, getActiveEras, getLatestActiveEraForAct, getStudioAvailableSlots, getFocusedEra, getRolloutPlanningEra, setFocusEraById, setCheaterEconomyOverride, setCheaterMode, startEraForAct, endEraById, createRolloutStrategyForEra, createRolloutStrategyFromTemplate, createTourDraft, updateTourDraft, deleteTourDraft, getSelectedTourDraft, selectTourDraft, getRolloutStrategyById, setSelectedRolloutStrategyId, addRolloutStrategyDrop, addRolloutStrategyEvent, expandRolloutStrategy, bookTourDate, removeTourBooking, setTouringBalanceEnabled, uid, weekIndex, clamp, getTrack, assignTrackAct, releaseTrack, scheduleRelease, getReleaseAsapHours, buildMarketCreators, buildPromoProjectKey, buildPromoProjectKeyFromTrack, normalizeCreator, normalizeProjectName, normalizeProjectType, parseAutoPromoSlotTarget, parsePromoProjectKey, postCreatorSigned, getSlotData, resetState, computeAutoCreateBudget, computeAutoPromoBudget, ensureAutoPromoBudgetSlots, ensureAutoPromoSlots, computeCharts, startGameLoop, setTimeSpeed, markUiLogStart, formatCount, formatMoney, formatDate, formatHourCountdown, formatWeekRangeLabel, hoursUntilNextScheduledTime, moodFromGenre, themeFromGenre, TREND_DETAIL_COUNT, UI_REACT_ISLANDS_ENABLED, WEEKLY_SCHEDULE, handleFromName, setSlotTarget, assignToSlot, clearSlot, getSlotValue, loadSlot, deleteSlot, getLossArchives, recommendTrackPlan, recommendActForTrack, recommendReleasePlan, markCreatorPromo, recordTrackPromoCost, getPromoFacilityForType, getPromoFacilityAvailability, reservePromoFacilitySlot, ensureMarketCreators, attemptSignCreator, listGameModes, DEFAULT_GAME_MODE, listGameDifficulties, DEFAULT_GAME_DIFFICULTY, acceptBailout, declineBailout } = game;
setUiHooks({
    closeMainMenu,
    openMainMenu,
    openOverlay,
    closeOverlay,
    showEndScreen,
    refreshSelectOptions,
    renderAll,
    renderEventLog,
    renderLossArchives,
    renderMarket,
    renderSlots,
    renderStats,
    renderTime,
    updateGenrePreview,
    refreshPromoTypes: () => updatePromoTypeHint(document)
});
const ROUTES = ["dashboard", "charts", "create", "release", "releases", "eras", "roster", "world", "logs", "tour"];
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
const UI_THEME_KEY = "rls_ui_theme_v1";
const UI_THEME_DEFAULT = "dark";
const UI_THEME_META = { dark: "#330000", light: "#ccffff" };
let uiThemeMediaQuery = null;
let uiThemeMediaBound = false;
let activeRoute = DEFAULT_ROUTE;
let hasMountedRoute = false;
let chartHistoryRequestId = 0;
const CALENDAR_WHEEL_THRESHOLD = 120;
const CALENDAR_WHEEL_RESET_MS = 320;
const CALENDAR_DRAG_THRESHOLD = 80;
const CALENDAR_VELOCITY_THRESHOLD = 0.55;
const QUICK_SKIP_SELECTOR = "[data-skip-quick]";
let calendarWheelAcc = 0;
let calendarWheelAt = 0;
let calendarDragState = null;
let timeJumpInFlight = false;
let horizontalWheelBound = false;
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
    Performer: "Recorder",
    Recorder: "Recorder",
    Producer: "Producer"
};
const STATE_EVENT = "rls:state-changed";
const UI_RENDER_HOLD_SELECTOR = "button, [role=\"button\"], a, input, select, textarea, [data-ui-render-hold]";
const UI_RENDER_HOLD_FALLBACK_MS = 3000;
function emitStateChanged() {
    if (typeof window === "undefined")
        return;
    window.dispatchEvent(new Event(STATE_EVENT));
}
function ensureUiState() {
    if (!state.ui)
        state.ui = {};
    return state.ui;
}
function isUiRenderHoldTarget(target) {
    if (!target || !target.closest)
        return false;
    return Boolean(target.closest(UI_RENDER_HOLD_SELECTOR));
}
function startUiRenderHold() {
    const ui = ensureUiState();
    ui.renderHoldActive = true;
    ui.renderHoldUntil = Date.now() + UI_RENDER_HOLD_FALLBACK_MS;
}
function extendUiRenderHold() {
    const ui = ensureUiState();
    if (!ui.renderHoldActive)
        return;
    ui.renderHoldUntil = Date.now() + UI_RENDER_HOLD_FALLBACK_MS;
}
function endUiRenderHold() {
    const ui = ensureUiState();
    ui.renderHoldActive = false;
    ui.renderHoldUntil = 0;
}
function normalizeUiTheme(value) {
    if (value === "dark" || value === "light" || value === "system")
        return value;
    return UI_THEME_DEFAULT;
}
function getStoredUiTheme() {
    try {
        return normalizeUiTheme(localStorage.getItem(UI_THEME_KEY));
    }
    catch (error) {
        return UI_THEME_DEFAULT;
    }
}
function setStoredUiTheme(value) {
    try {
        localStorage.setItem(UI_THEME_KEY, value);
    }
    catch (error) {
        // Ignore storage failures (private mode, quota, etc.).
    }
}
function getPreferredUiTheme() {
    if (typeof window === "undefined" || !window.matchMedia)
        return UI_THEME_DEFAULT;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}
function resolveUiTheme(value) {
    const normalized = normalizeUiTheme(value);
    return normalized === "system" ? getPreferredUiTheme() : normalized;
}
function updateMetaThemeColor(theme) {
    if (typeof document === "undefined")
        return;
    const meta = document.querySelector("meta[name=\"theme-color\"]");
    if (!meta)
        return;
    const color = UI_THEME_META[theme] || UI_THEME_META[UI_THEME_DEFAULT];
    meta.setAttribute("content", color);
}
function handleUiThemeMedia(event) {
    if (normalizeUiTheme(getStoredUiTheme()) !== "system")
        return;
    const theme = event?.matches ? "light" : "dark";
    document.documentElement.dataset.uiTheme = theme;
    updateMetaThemeColor(theme);
}
function bindUiThemeMedia(selected) {
    if (typeof window === "undefined" || !window.matchMedia)
        return;
    if (!uiThemeMediaQuery) {
        uiThemeMediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    }
    if (selected === "system") {
        if (!uiThemeMediaBound) {
            if (uiThemeMediaQuery.addEventListener) {
                uiThemeMediaQuery.addEventListener("change", handleUiThemeMedia);
            }
            else if (uiThemeMediaQuery.addListener) {
                uiThemeMediaQuery.addListener(handleUiThemeMedia);
            }
            uiThemeMediaBound = true;
        }
    }
    else if (uiThemeMediaBound && uiThemeMediaQuery) {
        if (uiThemeMediaQuery.removeEventListener) {
            uiThemeMediaQuery.removeEventListener("change", handleUiThemeMedia);
        }
        else if (uiThemeMediaQuery.removeListener) {
            uiThemeMediaQuery.removeListener(handleUiThemeMedia);
        }
        uiThemeMediaBound = false;
    }
}
function applyUiTheme(value, { persist = false } = {}) {
    const normalized = normalizeUiTheme(value);
    if (persist) {
        setStoredUiTheme(normalized);
    }
    const resolved = resolveUiTheme(normalized);
    if (typeof document !== "undefined") {
        document.documentElement.dataset.uiTheme = resolved;
    }
    updateMetaThemeColor(resolved);
    bindUiThemeMedia(normalized);
    syncUiThemeSelect(normalized);
}
function syncUiThemeSelect(value) {
    const select = $("uiThemeSelect");
    if (!select)
        return;
    const normalized = normalizeUiTheme(value || getStoredUiTheme());
    if (select.value !== normalized) {
        select.value = normalized;
    }
}
function calendarAnchorWeek() {
    return Number.isFinite(state.ui?.calendarWeekIndex) ? state.ui.calendarWeekIndex : weekIndex();
}
function setCalendarAnchorWeek(next) {
    const clamped = Math.max(0, Math.round(next));
    if (state.ui.calendarWeekIndex === clamped)
        return false;
    state.ui.calendarWeekIndex = clamped;
    renderCalendarView();
    if (!UI_REACT_ISLANDS_ENABLED) {
        renderCalendarList("calendarFullList", 12);
    }
    saveToActiveSlot();
    emitStateChanged();
    return true;
}
function setCalendarTab(tab) {
    if (!tab)
        return;
    state.ui.calendarTab = tab === "public" ? "public" : "label";
    renderCalendarView();
    if (!UI_REACT_ISLANDS_ENABLED) {
        renderCalendarList("calendarFullList", 12);
    }
    saveToActiveSlot();
    emitStateChanged();
}
function setCalendarFilter(key, checked) {
    if (!key)
        return;
    if (!state.ui.calendarFilters)
        state.ui.calendarFilters = {};
    state.ui.calendarFilters[key] = checked;
    renderCalendarView();
    if (!UI_REACT_ISLANDS_ENABLED) {
        renderCalendarList("calendarFullList", 12);
    }
    saveToActiveSlot();
    emitStateChanged();
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
const RANKING_WINDOW_MARGIN = 12;
let rankingWindowDrag = null;
let rankingWindowDismissalBound = false;
function clampRankingWindowPosition(left, top, width, height) {
    const maxLeft = Math.max(RANKING_WINDOW_MARGIN, window.innerWidth - width - RANKING_WINDOW_MARGIN);
    const maxTop = Math.max(RANKING_WINDOW_MARGIN, window.innerHeight - height - RANKING_WINDOW_MARGIN);
    return {
        left: clamp(left, RANKING_WINDOW_MARGIN, maxLeft),
        top: clamp(top, RANKING_WINDOW_MARGIN, maxTop)
    };
}
function ensureRankingWindowPosition(windowEl) {
    if (!windowEl.dataset.positioned) {
        windowEl.style.top = "140px";
        windowEl.style.right = "16px";
        windowEl.dataset.positioned = "true";
        return;
    }
    const rect = windowEl.getBoundingClientRect();
    const next = clampRankingWindowPosition(rect.left, rect.top, rect.width, rect.height);
    windowEl.style.left = `${next.left}px`;
    windowEl.style.top = `${next.top}px`;
    windowEl.style.right = "auto";
}
function openRankingWindow(category) {
    const windowEl = $("rankingWindow");
    if (!windowEl)
        return;
    ensureRankingWindowPosition(windowEl);
    windowEl.dataset.category = category;
    windowEl.classList.remove("hidden");
    windowEl.setAttribute("aria-hidden", "false");
    renderRankingWindow(category);
}
function closeRankingWindow() {
    const windowEl = $("rankingWindow");
    if (!windowEl)
        return;
    windowEl.classList.add("hidden");
    windowEl.setAttribute("aria-hidden", "true");
}
function setupRankingWindowDrag() {
    const windowEl = $("rankingWindow");
    const head = $("rankingWindowHead");
    if (!windowEl || !head || head.dataset.dragBound)
        return;
    head.dataset.dragBound = "true";
    head.addEventListener("pointerdown", (event) => {
        if (event.button && event.button !== 0)
            return;
        if (event.target.closest("button"))
            return;
        const rect = windowEl.getBoundingClientRect();
        rankingWindowDrag = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startLeft: rect.left,
            startTop: rect.top,
            width: rect.width,
            height: rect.height
        };
        windowEl.style.left = `${rect.left}px`;
        windowEl.style.top = `${rect.top}px`;
        windowEl.style.right = "auto";
        windowEl.setAttribute("data-dragging", "true");
        head.setPointerCapture(event.pointerId);
        event.preventDefault();
    });
    head.addEventListener("pointermove", (event) => {
        if (!rankingWindowDrag || event.pointerId !== rankingWindowDrag.pointerId)
            return;
        const dx = event.clientX - rankingWindowDrag.startX;
        const dy = event.clientY - rankingWindowDrag.startY;
        const nextLeft = rankingWindowDrag.startLeft + dx;
        const nextTop = rankingWindowDrag.startTop + dy;
        const next = clampRankingWindowPosition(nextLeft, nextTop, rankingWindowDrag.width, rankingWindowDrag.height);
        windowEl.style.left = `${next.left}px`;
        windowEl.style.top = `${next.top}px`;
    });
    const endDrag = (event) => {
        if (!rankingWindowDrag || event.pointerId !== rankingWindowDrag.pointerId)
            return;
        rankingWindowDrag = null;
        windowEl.removeAttribute("data-dragging");
        if (typeof head.releasePointerCapture === "function") {
            head.releasePointerCapture(event.pointerId);
        }
    };
    head.addEventListener("pointerup", endDrag);
    head.addEventListener("pointercancel", endDrag);
}
function setupRankingWindowDismissal() {
    if (rankingWindowDismissalBound || typeof document === "undefined")
        return;
    rankingWindowDismissalBound = true;
    document.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse" && event.button !== 0)
            return;
        const windowEl = $("rankingWindow");
        if (!windowEl || windowEl.classList.contains("hidden"))
            return;
        if (windowEl.contains(event.target))
            return;
        closeRankingWindow();
    }, { capture: true });
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
    emitStateChanged();
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
        "dashboard-eras": VIEW_PANEL_STATES.open,
        "dashboard-achievements": VIEW_PANEL_STATES.open
    },
    charts: {
        "charts": VIEW_PANEL_STATES.open
    },
    create: {
        "create-track": VIEW_PANEL_STATES.open,
        "tracks": VIEW_PANEL_STATES.open
    },
    release: {
        "release-desk": VIEW_PANEL_STATES.open,
        "release-projects": VIEW_PANEL_STATES.open
    },
    releases: {
        "calendar-view": VIEW_PANEL_STATES.open
    },
    eras: {
        "era-desk": VIEW_PANEL_STATES.open,
        "era-performance": VIEW_PANEL_STATES.open
    },
    roster: {
        "harmony-hub": VIEW_PANEL_STATES.open,
        "communities": VIEW_PANEL_STATES.open,
        "label-settings": VIEW_PANEL_STATES.open
    },
    world: {
        "ccc-market": VIEW_PANEL_STATES.open
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
function getStartPreferenceElements() {
    const theme1 = $("startTheme1");
    const theme2 = $("startTheme2");
    const mood1 = $("startMood1");
    const mood2 = $("startMood2");
    if (!theme1 || !theme2 || !mood1 || !mood2)
        return null;
    return { theme1, theme2, mood1, mood2 };
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
function setStartPreferenceValues(prefs, options = {}) {
    const elements = getStartPreferenceElements();
    if (!elements)
        return;
    const { theme1, theme2, mood1, mood2 } = elements;
    const { persist = true } = options;
    const normalized = normalizeStartPreferences(prefs);
    theme1.value = normalized.themes[0] || "";
    theme2.value = normalized.themes[1] || "";
    mood1.value = normalized.moods[0] || "";
    mood2.value = normalized.moods[1] || "";
    setThemeSelectAccent(theme1);
    setThemeSelectAccent(theme2);
    if (persist) {
        saveStartPreferences(normalized);
    }
}
function readStartPreferences() {
    const elements = getStartPreferenceElements();
    if (!elements)
        return normalizeStartPreferences(loadStartPreferences() || {});
    return normalizeStartPreferences({
        themes: [elements.theme1.value, elements.theme2.value],
        moods: [elements.mood1.value, elements.mood2.value]
    });
}
function validateStartPreferences(prefs) {
    const normalized = normalizeStartPreferences(prefs);
    const themes = normalized.themes;
    const moods = normalized.moods;
    const hasMissingThemes = themes.some((theme) => !theme);
    const hasMissingMoods = moods.some((mood) => !mood);
    if (hasMissingThemes || hasMissingMoods) {
        return {
            ok: false,
            message: "Pick two Themes and two Moods before starting.",
            fields: ["startTheme1", "startTheme2", "startMood1", "startMood2"]
        };
    }
    if (themes[0] === themes[1]) {
        return { ok: false, message: "Pick two different Themes before starting.", fields: ["startTheme1", "startTheme2"] };
    }
    if (moods[0] === moods[1]) {
        return { ok: false, message: "Pick two different Moods before starting.", fields: ["startMood1", "startMood2"] };
    }
    return { ok: true, prefs: normalized };
}
function pickRandomPreference(pool, exclude = []) {
    const safePool = Array.isArray(pool) ? pool : [];
    const filtered = safePool.filter((item) => !exclude.includes(item));
    const options = filtered.length ? filtered : safePool;
    const [picked] = pickDistinct(options, 1);
    return picked || "";
}
function pickRandomPair(pool) {
    const picks = pickDistinct(pool, 2);
    return [picks[0] || "", picks[1] || ""];
}
function syncStartPreferenceSelects() {
    const elements = getStartPreferenceElements();
    if (!elements)
        return;
    const { theme1, theme2, mood1, mood2 } = elements;
    const themeOptions = buildThemeOptions([{ value: "", label: "Select theme" }]);
    const moodOptions = buildMoodOptions([{ value: "", label: "Select mood" }]);
    theme1.innerHTML = themeOptions;
    theme2.innerHTML = themeOptions;
    mood1.innerHTML = moodOptions;
    mood2.innerHTML = moodOptions;
    setStartPreferenceValues(loadStartPreferences() || {});
    bindThemeSelectAccent(theme1);
    bindThemeSelectAccent(theme2);
    const onChange = () => setStartPreferenceValues({
        themes: [theme1.value, theme2.value],
        moods: [mood1.value, mood2.value]
    });
    [theme1, theme2, mood1, mood2].forEach((select) => {
        if (select.dataset.bound)
            return;
        select.dataset.bound = "1";
        select.addEventListener("change", onChange);
    });
    const bindRandom = (id, handler) => {
        const btn = $(id);
        if (!btn || btn.dataset.bound)
            return;
        btn.dataset.bound = "1";
        btn.addEventListener("click", handler);
    };
    bindRandom("randomTheme1Btn", () => {
        const prefs = readStartPreferences();
        const next = pickRandomPreference(THEMES, prefs.themes[1] ? [prefs.themes[1]] : []);
        setStartPreferenceValues({ themes: [next, prefs.themes[1]], moods: prefs.moods });
    });
    bindRandom("randomTheme2Btn", () => {
        const prefs = readStartPreferences();
        const next = pickRandomPreference(THEMES, prefs.themes[0] ? [prefs.themes[0]] : []);
        setStartPreferenceValues({ themes: [prefs.themes[0], next], moods: prefs.moods });
    });
    bindRandom("randomMood1Btn", () => {
        const prefs = readStartPreferences();
        const next = pickRandomPreference(MOODS, prefs.moods[1] ? [prefs.moods[1]] : []);
        setStartPreferenceValues({ themes: prefs.themes, moods: [next, prefs.moods[1]] });
    });
    bindRandom("randomMood2Btn", () => {
        const prefs = readStartPreferences();
        const next = pickRandomPreference(MOODS, prefs.moods[0] ? [prefs.moods[0]] : []);
        setStartPreferenceValues({ themes: prefs.themes, moods: [prefs.moods[0], next] });
    });
    bindRandom("randomThemesBtn", () => {
        const prefs = readStartPreferences();
        const [next1, next2] = pickRandomPair(THEMES);
        setStartPreferenceValues({ themes: [next1, next2], moods: prefs.moods });
    });
    bindRandom("randomMoodsBtn", () => {
        const prefs = readStartPreferences();
        const [next1, next2] = pickRandomPair(MOODS);
        setStartPreferenceValues({ themes: prefs.themes, moods: [next1, next2] });
    });
    bindRandom("randomAllPrefsBtn", () => {
        const [themeA, themeB] = pickRandomPair(THEMES);
        const [moodA, moodB] = pickRandomPair(MOODS);
        setStartPreferenceValues({ themes: [themeA, themeB], moods: [moodA, moodB] });
    });
}
function getSelectedStartPreferences() {
    return readStartPreferences();
}
function getCccTrendSlots() {
    const trendList = Array.isArray(state.trends) && state.trends.length
        ? state.trends
        : Array.isArray(state.trendRanking)
            ? state.trendRanking
            : [];
    const limit = Number.isFinite(TREND_DETAIL_COUNT) ? TREND_DETAIL_COUNT : 3;
    return trendList.filter(Boolean).slice(0, limit);
}
function getNextTrendIndex(currentIndex, count) {
    if (!count)
        return 0;
    if (!Number.isFinite(currentIndex))
        return 0;
    return (currentIndex + 1) % count;
}
function applyCccTrendFilter(kind) {
    const selectId = kind === "theme" ? "cccThemeFilter" : "cccMoodFilter";
    const slots = getCccTrendSlots();
    if (!slots.length) {
        logEvent("Top trends are not available yet.", "warn");
        shakeField(selectId);
        return;
    }
    if (!state.ui)
        state.ui = {};
    const indexKey = kind === "theme" ? "cccThemeTrendIndex" : "cccMoodTrendIndex";
    const nextIndex = getNextTrendIndex(state.ui[indexKey], slots.length);
    const genre = slots[nextIndex] || "";
    const value = kind === "theme" ? themeFromGenre(genre) : moodFromGenre(genre);
    if (!value) {
        logEvent("Top trends are missing a valid genre slot.", "warn");
        shakeField(selectId);
        return;
    }
    state.ui[indexKey] = nextIndex;
    if (kind === "theme") {
        state.ui.cccThemeFilter = value;
    }
    else {
        state.ui.cccMoodFilter = value;
    }
    const select = $(selectId);
    if (select) {
        select.value = value;
        if (kind === "theme")
            setThemeSelectAccent(select);
    }
    renderAll();
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
    const entry = {
        ts: Date.now(),
        gameTs: state.time?.epochMs,
        route: state.ui?.activeView || activeRoute,
        event_type: type,
        payload
    };
    log.push(entry);
    if (log.length > 800)
        log.shift();
    localStorage.setItem(UI_EVENT_LOG_KEY, JSON.stringify(log));
    const isAction = type === "action_submit" || type === "route_change";
    recordUsageEvent(`ui.${type}`, payload, {
        route: entry.route,
        gameTs: entry.gameTs,
        isAction,
        reportToConsole: type === "action_submit"
    });
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
function recordSessionReady(source) {
    updateUsageSessionContext({
        activeSlot: session.activeSlot,
        label: state.label?.name || null,
        gameMode: state.meta?.gameMode || DEFAULT_GAME_MODE,
        difficulty: state.meta?.difficulty || DEFAULT_GAME_DIFFICULTY
    });
    recordUsageEvent("session.ready", {
        source,
        activeSlot: session.activeSlot,
        label: state.label?.name || null,
        gameMode: state.meta?.gameMode || DEFAULT_GAME_MODE,
        difficulty: state.meta?.difficulty || DEFAULT_GAME_DIFFICULTY
    }, {
        route: state.ui?.activeView || activeRoute,
        gameTs: state.time?.epochMs,
        reportToConsole: true
    });
}
async function refreshExternalStorageStatus(root) {
    const scope = root || document;
    const statusEl = scope.querySelector("#externalStorageStatus");
    const detailEl = scope.querySelector("#externalStorageDetail");
    const pickBtn = scope.querySelector("#externalStoragePickBtn");
    const syncBtn = scope.querySelector("#externalStorageSyncBtn");
    const importBtn = scope.querySelector("#externalStorageImportBtn");
    const clearBtn = scope.querySelector("#externalStorageClearBtn");
    if (!isExternalStorageSupported()) {
        if (statusEl)
            statusEl.textContent = "External storage is not supported in this browser.";
        if (detailEl)
            detailEl.textContent = "Use Edge or Chrome on localhost or HTTPS.";
        if (pickBtn)
            pickBtn.disabled = true;
        if (syncBtn)
            syncBtn.disabled = true;
        if (importBtn)
            importBtn.disabled = true;
        if (clearBtn)
            clearBtn.disabled = true;
        return;
    }
    const status = await getExternalStorageStatus();
    if (!status || status.status === "not-set") {
        if (statusEl)
            statusEl.textContent = "External storage not set.";
        if (detailEl)
            detailEl.textContent = "Choose a folder to capture logs, saves, and database exports.";
        if (pickBtn)
            pickBtn.disabled = false;
        if (syncBtn)
            syncBtn.disabled = true;
        if (importBtn)
            importBtn.disabled = true;
        if (clearBtn)
            clearBtn.disabled = true;
        return;
    }
    if (statusEl)
        statusEl.textContent = `Folder: ${status.name || "External folder"}`;
    if (detailEl) {
        const hint = status.status === "ready"
            ? "Write access granted."
            : "Permission needed; click Sync or Import to re-authorize.";
        detailEl.textContent = hint;
    }
    if (pickBtn)
        pickBtn.disabled = false;
    if (syncBtn)
        syncBtn.disabled = false;
    if (importBtn)
        importBtn.disabled = false;
    if (clearBtn)
        clearBtn.disabled = false;
}
async function handleExternalStoragePick(root) {
    const result = await requestExternalStorageHandle();
    if (!result.ok && result.reason !== "cancelled") {
        logEvent(`External storage folder could not be set (${result.reason}).`, "warn");
    }
    const usageSession = getUsageSessionSnapshot();
    if (result.ok) {
        const summary = await syncExternalStorageNow({ usageSession });
        if (summary.ok) {
            logEvent(`External storage synced (${summary.saves} saves, ${summary.charts} charts).`);
        }
    }
    await refreshExternalStorageStatus(root);
}
async function handleExternalStorageSync(root) {
    const usageSession = getUsageSessionSnapshot();
    const summary = await syncExternalStorageNow({ usageSession });
    if (!summary.ok) {
        logEvent(`External storage sync failed (${summary.reason || "unknown"}).`, "warn");
    }
    else {
        logEvent(`External storage synced (${summary.saves} saves, ${summary.charts} charts).`);
    }
    await refreshExternalStorageStatus(root);
}
async function handleExternalStorageImport(root) {
    const saveResult = await importSavesFromExternal();
    const chartResult = await importChartHistoryFromExternal();
    if (!saveResult.ok && !chartResult.ok) {
        logEvent(`External storage import failed (${saveResult.reason || chartResult.reason || "unknown"}).`, "warn");
    }
    else {
        const saves = saveResult.ok ? saveResult.imported : 0;
        const charts = chartResult.ok ? chartResult.imported : 0;
        logEvent(`External storage imported (${saves} saves, ${charts} chart snapshots).`);
        renderMainMenu();
    }
    await refreshExternalStorageStatus(root);
}
async function handleExternalStorageClear(root) {
    await clearExternalStorageHandle();
    logEvent("External storage disconnected.");
    await refreshExternalStorageStatus(root);
}
function chartScopeKey(chartKey) {
    const base = chartKey === "global"
        ? "global"
        : NATIONS.includes(chartKey)
            ? `nation:${chartKey}`
            : `region:${chartKey}`;
    const contentType = state.ui?.chartContentType || "tracks";
    if (contentType === "promotions")
        return `promo:${base}`;
    if (contentType === "tours")
        return `tour:${base}`;
    return base;
}
function chartScopeLabel(chartKey) {
    return game.chartScopeLabel(chartKey);
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
    const contentType = state.ui.chartContentType || "tracks";
    const contentLabel = contentType === "projects"
        ? "Projects"
        : contentType === "promotions"
            ? "Promotions"
            : contentType === "tours"
                ? "Touring"
                : "Tracks";
    const scopeEl = $("chartHistoryScope");
    if (scopeEl)
        scopeEl.textContent = `Scope: ${scopeLabel} (${contentLabel})`;
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
    return title === "Gameplay Screen: Charts"
        || title === "Create Track"
        || title === "Release Desk"
        || title === "Release"
        || title === "Calendar";
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
const AUTO_PROMO_SLOT_LIMIT = 4;
function getPromoInflationMultiplier() {
    const currentYear = new Date(state.time?.epochMs || Date.now()).getUTCFullYear();
    const baseYear = state.meta?.startYear || new Date(state.time?.startEpochMs || state.time?.epochMs || Date.now()).getUTCFullYear();
    const yearsElapsed = Math.max(0, currentYear - baseYear);
    const annualInflation = 0.02;
    return Math.pow(1 + annualInflation, yearsElapsed);
}
function isPromoPrimeTimeEnabled() {
    return Boolean(state.ui?.promoPrimeTime);
}
function resolvePromoTypeVariant(typeId) {
    if (typeId === "livePerformance" && isPromoPrimeTimeEnabled())
        return "primeShowcase";
    return typeId;
}
function resolvePromoTypeCardDetails(typeId) {
    return getPromoTypeDetails(resolvePromoTypeVariant(typeId));
}
function derivePromoTypesForRun(typeIds) {
    const list = Array.isArray(typeIds) ? typeIds : [typeIds];
    return list.map((typeId) => resolvePromoTypeVariant(typeId)).filter(Boolean);
}
function promoBudgetBaseCost(typeId) {
    const details = getPromoTypeDetails(typeId);
    return Math.max(PROMO_BUDGET_MIN, details.cost);
}
function promoWeeksFromBudget(budget) {
    return clamp(Math.floor(budget / 1200) + 1, 1, 4);
}
function normalizePromoBudgetValue(raw, typeId, inflationMultiplier) {
    const baseCost = getPromoTypeCosts(typeId, inflationMultiplier).adjustedCost;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed))
        return baseCost;
    return Math.max(PROMO_BUDGET_MIN, Math.round(parsed));
}
function ensurePromoBudgets(inflationMultiplier) {
    if (!state.ui)
        state.ui = {};
    if (!state.ui.promoBudgets || typeof state.ui.promoBudgets !== "object") {
        state.ui.promoBudgets = {};
    }
    Object.keys(PROMO_TYPE_DETAILS).forEach((typeId) => {
        const current = state.ui.promoBudgets[typeId];
        const normalized = normalizePromoBudgetValue(current, typeId, inflationMultiplier);
        state.ui.promoBudgets[typeId] = normalized;
    });
    return state.ui.promoBudgets;
}
function getPromoBudgetForType(typeId, inflationMultiplier) {
    const budgets = ensurePromoBudgets(inflationMultiplier);
    return normalizePromoBudgetValue(budgets[typeId], typeId, inflationMultiplier);
}
function setPromoBudgetForType(typeId, value, inflationMultiplier) {
    const budgets = ensurePromoBudgets(inflationMultiplier);
    const normalized = normalizePromoBudgetValue(value, typeId, inflationMultiplier);
    budgets[typeId] = normalized;
    return normalized;
}
function getPromoBudgetsForTypes(typeIds, inflationMultiplier) {
    const list = Array.isArray(typeIds) ? typeIds : [typeIds];
    const budgets = {};
    let total = 0;
    list.filter(Boolean).forEach((typeId) => {
        const budget = getPromoBudgetForType(typeId, inflationMultiplier);
        budgets[typeId] = budget;
        total += budget;
    });
    return { budgets, total };
}
function resolvePromoProjectFromTrack(track) {
    if (!track)
        return null;
    const projectName = track.projectName || `${track.title} - Single`;
    const projectType = normalizeProjectType(track.projectType || "Single");
    return {
        projectName,
        projectType,
        actId: track.actId || null,
        eraId: track.eraId || null
    };
}
function listPromoProjectTracks(project) {
    if (!project?.projectName)
        return [];
    const targetName = normalizeProjectName(project.projectName);
    const targetType = normalizeProjectType(project.projectType || "Single");
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
        return true;
    });
}
function listPromoEligibleTracks(projectTracks) {
    if (!Array.isArray(projectTracks) || !projectTracks.length)
        return [];
    const scheduledIds = new Set(state.releaseQueue.map((entry) => entry.trackId).filter(Boolean));
    return projectTracks.filter((track) => {
        if (!track)
            return false;
        if (track.status === "Released")
            return true;
        if (track.status === "Scheduled")
            return true;
        return scheduledIds.has(track.id);
    });
}
function getPromoTargetContext(trackId, projectId, actId) {
    const track = trackId ? getTrack(trackId) : null;
    const parsedProject = projectId ? parsePromoProjectKey(projectId) : null;
    let act = actId ? getAct(actId) : null;
    let era = null;
    let project = null;
    if (track) {
        if (!act && track.actId)
            act = getAct(track.actId);
        era = track.eraId ? getEraById(track.eraId) : null;
        project = resolvePromoProjectFromTrack(track);
    }
    else if (parsedProject) {
        era = parsedProject.eraId ? getEraById(parsedProject.eraId) : null;
        if (!act) {
            const resolvedActId = parsedProject.actId || era?.actId || null;
            act = resolvedActId ? getAct(resolvedActId) : null;
        }
        project = {
            projectName: parsedProject.projectName,
            projectType: normalizeProjectType(parsedProject.projectType || "Single"),
            actId: parsedProject.actId || act?.id || null,
            eraId: parsedProject.eraId || null
        };
    }
    if (!era && act)
        era = getLatestActiveEraForAct(act.id);
    const projectTracks = project ? listPromoProjectTracks(project) : [];
    const scheduled = track ? state.releaseQueue.find((entry) => entry.trackId === track.id) : null;
    const isReleased = Boolean(track && track.status === "Released" && track.marketId);
    const isScheduled = Boolean(scheduled && !isReleased);
    return { track, act, era, project, projectTracks, scheduled, isReleased, isScheduled };
}
function getPromoTypeLockouts(context) {
    const lockouts = {};
    const track = context?.track || null;
    Object.keys(PROMO_TYPE_DETAILS).forEach((typeId) => {
        const details = PROMO_TYPE_DETAILS[typeId];
        if (details?.requiresTrack && !track) {
            lockouts[typeId] = "Track required";
        }
    });
    if (!track)
        return lockouts;
    if (context.isScheduled)
        lockouts.musicVideo = "After release";
    if (track.promo?.musicVideoUsed)
        lockouts.musicVideo = "Used";
    return lockouts;
}
function getPromoAudienceTier(track, act) {
    if (!track && !act)
        return { label: "Audience variance", offset: 0, score: 0 };
    const country = state.label?.country;
    const profile = country && typeof NATION_PROFILES !== "undefined" ? NATION_PROFILES[country] : null;
    const alignment = track?.alignment || act?.alignment || null;
    const theme = track?.theme || null;
    const mood = track?.mood || null;
    const genre = track?.genre || null;
    const hasSignals = Boolean(alignment || theme || mood || genre);
    if (!profile || !hasSignals)
        return { label: "Audience variance", offset: 0, score: 0 };
    let score = 0;
    if (alignment && alignment === profile.alignment)
        score += 1;
    if (theme && theme === profile.theme)
        score += 1;
    if (mood && Array.isArray(profile.moods) && profile.moods.includes(mood))
        score += 1;
    if (genre && Array.isArray(state.trends) && state.trends.includes(genre))
        score += 1;
    if (score >= 3)
        return { label: "Tailwind audience", offset: 3, score };
    if (score === 2)
        return { label: "Aligned audience", offset: 1, score };
    if (score === 1)
        return { label: "Mixed audience", offset: 0, score };
    return { label: "Headwind audience", offset: -2, score };
}
function buildPromoEfficiencyText(typeId, budget, inflationMultiplier) {
    const baseCost = getPromoTypeCosts(typeId, inflationMultiplier).adjustedCost;
    const ratio = baseCost > 0 ? budget / baseCost : 1;
    const deltaPct = Math.round((ratio - 1) * 100);
    let label = "Standard";
    if (deltaPct >= 20)
        label = "Boosted";
    if (deltaPct <= -20)
        label = "Lean";
    const deltaText = deltaPct === 0 ? "0%" : `${deltaPct > 0 ? "+" : ""}${deltaPct}%`;
    return `Efficiency: ${label} (${deltaText} vs typical)`;
}
function buildPromoExpectationText(budget, track, act) {
    const weeks = promoWeeksFromBudget(budget);
    const audience = getPromoAudienceTier(track, act);
    const baseLift = 10;
    const minLift = Math.max(0, baseLift + audience.offset - 4);
    const maxLift = Math.max(minLift, baseLift + audience.offset + 4);
    return `Expected lift: +${minLift}-${maxLift} chart pts/wk | Window: ${weeks}w (${audience.label})`;
}
function getPromoTypeFallback(root, lockouts, fallbackTypeId) {
    const scope = root || document;
    const ordered = Array.from(scope.querySelectorAll("[data-promo-type]"))
        .map((card) => card.dataset.promoType)
        .filter(Boolean);
    const fallbackOrder = ordered.length ? ordered : [fallbackTypeId || DEFAULT_PROMO_TYPE];
    return fallbackOrder.find((typeId) => !lockouts?.[typeId]) || null;
}
function getSelectedPromoTypes(root) {
    const scope = root || document;
    return Array.from(scope.querySelectorAll("[data-promo-type].is-active"))
        .map((card) => card.dataset.promoType)
        .filter(Boolean);
}
function ensurePromoTypeSelection(root, fallbackTypeId, lockouts = {}) {
    const scope = root || document;
    let selected = getSelectedPromoTypes(scope);
    if (!selected.length) {
        const fallback = fallbackTypeId || DEFAULT_PROMO_TYPE;
        selected = [fallback];
    }
    if (lockouts && Object.keys(lockouts).length) {
        selected = selected.filter((typeId) => !lockouts[typeId]);
        if (!selected.length) {
            const fallback = getPromoTypeFallback(scope, lockouts, fallbackTypeId) || fallbackTypeId || DEFAULT_PROMO_TYPE;
            selected = fallback ? [fallback] : [];
        }
    }
    syncPromoTypeCards(scope, selected, lockouts);
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
        const details = resolvePromoTypeCardDetails(typeId);
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
function syncPromoTypeCards(root, typeIds, lockouts = {}) {
    const scope = root || document;
    const cards = scope.querySelectorAll("[data-promo-type]");
    if (!cards.length)
        return;
    const selected = new Set((Array.isArray(typeIds) ? typeIds : [typeIds]).filter(Boolean));
    cards.forEach((card) => {
        const typeId = card.dataset.promoType;
        const lockout = typeId ? lockouts?.[typeId] : null;
        const isLocked = Boolean(lockout);
        const isActive = Boolean(typeId && selected.has(typeId) && !isLocked);
        card.classList.toggle("is-active", isActive);
        card.classList.toggle("is-disabled", isLocked);
        if (isLocked) {
            card.setAttribute("aria-disabled", "true");
            card.setAttribute("disabled", "");
        }
        else {
            card.removeAttribute("aria-disabled");
            card.removeAttribute("disabled");
        }
        card.setAttribute("aria-checked", isActive ? "true" : "false");
        const status = card.querySelector("[data-promo-status]");
        if (status) {
            status.textContent = isLocked
                ? (typeof lockout === "string" ? lockout : "Unavailable")
                : (isActive ? "Selected" : "Select");
        }
    });
}
function syncPromoBudgetCards(root, { trackContext, lockouts = {}, inflationMultiplier }) {
    const scope = root || document;
    const cards = scope.querySelectorAll("[data-promo-type]");
    if (!cards.length)
        return;
    const track = trackContext?.track || null;
    const act = trackContext?.act || null;
    cards.forEach((card) => {
        const typeId = card.dataset.promoType;
        if (!typeId)
            return;
        const effectiveType = resolvePromoTypeVariant(typeId);
        const isLocked = Boolean(lockouts?.[typeId]);
        const budgetKey = effectiveType;
        const budget = setPromoBudgetForType(budgetKey, state.ui?.promoBudgets?.[budgetKey], inflationMultiplier);
        const input = card.querySelector("[data-promo-budget]");
        if (input) {
            input.min = String(PROMO_BUDGET_MIN);
            input.step = "100";
            input.value = String(budget);
            input.disabled = isLocked;
            input.dataset.promoType = budgetKey;
        }
        const efficiency = card.querySelector("[data-promo-efficiency]");
        if (efficiency)
            efficiency.textContent = buildPromoEfficiencyText(effectiveType, budget, inflationMultiplier);
        const expectation = card.querySelector("[data-promo-expectation]");
        if (expectation)
            expectation.textContent = buildPromoExpectationText(budget, track, act);
    });
}
function syncPrimeTimeToggle(root, trackContext) {
    const scope = root || document;
    const toggle = scope.querySelector("#promoPrimeTimeToggle");
    if (!toggle)
        return;
    const enabled = isPromoPrimeTimeEnabled();
    if (toggle.checked !== enabled)
        toggle.checked = enabled;
    const note = scope.querySelector("[data-promo-primetime-note]");
    if (!note)
        return;
    if (!enabled) {
        note.textContent = "Upgrade to Prime Time for higher cost + prestige gates.";
        return;
    }
    const actId = trackContext?.act?.id || state.ui?.promoSlots?.actId || null;
    const trackId = trackContext?.track?.id || null;
    const eligibility = typeof game.checkPrimeShowcaseEligibility === "function"
        ? game.checkPrimeShowcaseEligibility(actId, trackId)
        : { ok: true, reason: "" };
    note.textContent = eligibility.ok
        ? "Prime Time eligible."
        : `Prime Time locked: ${eligibility.reason || "Requirements not met."}`;
}
function formatPromoFacilityWindowLabel(availability) {
    if (!availability?.timeframeLabel)
        return "today";
    const prefix = availability.isUpcoming ? "Next " : "";
    return `${prefix}${availability.timeframeLabel}`;
}
function buildPromoFacilityHint(typeId) {
    const facility = getPromoFacilityForType(typeId);
    if (!facility)
        return "";
    const availability = getPromoFacilityAvailability(facility);
    const label = facility === "broadcast" ? "Broadcast slots" : "Filming slots";
    const windowLabel = formatPromoFacilityWindowLabel(availability);
    return ` | ${label} (${windowLabel}): ${availability.available}/${availability.capacity}`;
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
        const windowLabel = formatPromoFacilityWindowLabel(availability);
        return `${label} (${windowLabel}): ${availability.available}/${availability.capacity}${neededLabel}`;
    }).join(" | ");
}
function updateAutoPromoSummary(scope) {
    const root = scope || document;
    const summary = root.querySelector("#autoPromoSummary");
    if (!summary)
        return;
    syncAutoPromoVisibility(root);
    const enabled = Boolean(state.meta?.autoRollout?.enabled);
    const slots = ensureAutoPromoSlots();
    const budgetSlots = ensureAutoPromoBudgetSlots() || [];
    const walletCash = state.label.wallet?.cash ?? state.label.cash ?? 0;
    const selectedTypes = Array.isArray(state.ui?.promoTypes) && state.ui.promoTypes.length
        ? state.ui.promoTypes
        : [state.ui?.promoType || DEFAULT_PROMO_TYPE];
    const effectiveTypes = derivePromoTypesForRun(selectedTypes);
    const typeLabels = selectedTypes.map((typeId) => resolvePromoTypeCardDetails(typeId).label).join(", ");
    const scheduleHours = hoursUntilNextScheduledTime(WEEKLY_SCHEDULE.chartUpdate);
    const scheduleText = formatHourCountdown(scheduleHours);
    const scheduleLabel = scheduleText === "-" ? "-" : `${scheduleText}h`;
    const totalPct = budgetSlots.reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
    const pctLabel = `${Math.round(totalPct * 100)}%`;
    const rows = [];
    let totalBudgetPerType = 0;
    for (let index = 0; index < AUTO_PROMO_SLOT_LIMIT; index += 1) {
        const actId = slots.actIds[index] || null;
        const projectId = slots.projectIds[index] || null;
        const trackId = slots.trackIds[index] || null;
        const hasTarget = Boolean(actId || projectId || trackId);
        const pct = Number.isFinite(budgetSlots[index]) ? budgetSlots[index] : 0;
        if (!hasTarget && pct <= 0)
            continue;
        const context = getPromoTargetContext(trackId, projectId, actId);
        const market = context.track?.marketId
            ? state.marketTracks.find((entry) => entry.id === context.track.marketId)
            : context.track
                ? state.marketTracks.find((entry) => entry.trackId === context.track.id)
                : null;
        const projectTargets = context.project ? listPromoEligibleTracks(context.projectTracks) : [];
        const projectBoostable = projectTargets.some((entry) => {
            if (entry.status === "Released") {
                const entryMarket = entry.marketId
                    ? state.marketTracks.find((candidate) => candidate.id === entry.marketId)
                    : state.marketTracks.find((candidate) => candidate.trackId === entry.id);
                return entryMarket && (entryMarket.promoWeeks || 0) <= 0;
            }
            return Math.max(0, entry.promo?.preReleaseWeeks || 0) <= 0;
        });
        let targetLabel = "No target";
        if (context.track) {
            targetLabel = `Track "${context.track.title}"`;
        }
        else if (context.project) {
            targetLabel = `Project "${context.project.projectName}"`;
        }
        else if (context.act) {
            targetLabel = `Act "${context.act.name}"`;
        }
        let readiness = "Ready";
        if (!hasTarget)
            readiness = "Assign Act/Project/Track";
        if (hasTarget && !context.act)
            readiness = "Select an Act";
        if (context.era && context.era.status !== "Active")
            readiness = "No active era";
        if (context.track && !context.isReleased)
            readiness = "Track must be released";
        if (context.track && market && (market.promoWeeks || 0) > 0)
            readiness = "Track already in promo weeks";
        if (!context.track && context.project && !projectTargets.length) {
            readiness = "Project needs scheduled or released tracks";
        }
        if (!context.track && context.project && projectTargets.length && !projectBoostable) {
            readiness = "Project already in promo weeks";
        }
        if (!context.track && !context.project && context.act && (context.act.promoWeeks || 0) > 0) {
            readiness = "Act already in promo weeks";
        }
        if (pct <= 0)
            readiness = "Budget 0%";
        if (!enabled)
            readiness = "Disabled";
        const budget = pct > 0 ? computeAutoPromoBudget(walletCash, pct) : 0;
        if (hasTarget && pct > 0)
            totalBudgetPerType += budget;
        rows.push({
            label: `Slot ${index + 1}: ${targetLabel}`,
            pctLabel: `${Math.round(pct * 100)}%`,
            readiness,
            budget
        });
    }
    const totalSpend = totalBudgetPerType * selectedTypes.length;
    const facilityHint = buildPromoFacilityHints(effectiveTypes);
    const facilityLine = facilityHint ? `<div class="muted">${facilityHint}</div>` : "";
    const budgetLine = totalBudgetPerType
        ? `${formatMoney(totalBudgetPerType)} each (${formatMoney(totalSpend)} total)`
        : `${formatMoney(0)} (auto promo will skip)`;
    const rowsLine = rows.length
        ? rows.map((row) => `<div class="muted">${row.label} | ${row.pctLabel} | ${row.readiness}</div>`).join("")
        : `<div class="muted">No auto promo slots set.</div>`;
    summary.innerHTML = `
    <div class="list-item">
      <div class="item-title">Auto Promo Plan</div>
      <div class="muted">${enabled ? "Enabled" : "Disabled"} | Next check ${scheduleLabel} (chart update)</div>
      <div class="muted">Allocation total: ${pctLabel} | Budget ${budgetLine}</div>
      <div class="muted">Types: ${typeLabels || "None"}</div>
      ${rowsLine}
      ${facilityLine}
      <div class="muted">Steps: validate target, reserve facilities, apply promo weeks.</div>
    </div>
  `;
}
function updateAutoPromoBudgetTotal(scope, budgetSlots) {
    const root = scope || document;
    const totalEl = root.querySelector("#autoPromoBudgetTotal");
    if (!totalEl)
        return;
    const slots = Array.isArray(budgetSlots) ? budgetSlots : ensureAutoPromoBudgetSlots() || [];
    const totalPct = slots.reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
    totalEl.textContent = `Total allocation: ${Math.round(totalPct * 100)}% (max 100%)`;
}
function syncAutoPromoVisibility(scope) {
    const root = scope || document;
    const section = root.querySelector("#autoPromoTargetsSection");
    if (!section)
        return;
    const enabled = Boolean(state.meta?.autoRollout?.enabled);
    section.classList.toggle("hidden", !enabled);
}
function syncAutoPromoBudgetControls(scope) {
    const root = scope || document;
    const slots = ensureAutoPromoBudgetSlots() || [];
    root.querySelectorAll("[data-auto-promo-pct]").forEach((input) => {
        const index = Number(input.dataset.autoPromoIndex || 0);
        if (!Number.isFinite(index) || index < 0)
            return;
        const pct = Number.isFinite(slots[index]) ? slots[index] : 0;
        input.value = String(Math.round(pct * 100));
    });
    updateAutoPromoBudgetTotal(root, slots);
}
function updatePromoTypeHint(root) {
    const scope = root || document;
    const select = scope.querySelector("#promoTypeSelect");
    const hint = scope.querySelector("#promoTypeHint");
    const trackContext = getPromoTargetContext(state.ui?.promoSlots?.trackId, state.ui?.promoSlots?.projectId, state.ui?.promoSlots?.actId);
    const lockouts = getPromoTypeLockouts(trackContext);
    const selectedTypes = ensurePromoTypeSelection(scope, select ? select.value : DEFAULT_PROMO_TYPE, lockouts);
    const primaryType = select && selectedTypes.includes(select.value) ? select.value : selectedTypes[0];
    if (select && primaryType)
        select.value = primaryType;
    state.ui.promoTypes = selectedTypes.slice();
    state.ui.promoType = primaryType || DEFAULT_PROMO_TYPE;
    syncPrimeTimeToggle(scope, trackContext);
    const inflationMultiplier = getPromoInflationMultiplier();
    hydratePromoTypeCards(scope);
    syncPromoTypeCards(scope, selectedTypes, lockouts);
    syncPromoBudgetCards(scope, { trackContext, lockouts, inflationMultiplier });
    const effectiveTypes = derivePromoTypesForRun(selectedTypes);
    const { budgets, total } = getPromoBudgetsForTypes(effectiveTypes, inflationMultiplier);
    const totalSpend = formatMoney(total);
    const perTypeSpend = selectedTypes.length === 1 ? formatMoney(budgets[effectiveTypes[0]]) : null;
    if (hint) {
        if (selectedTypes.length === 1) {
            const typeId = selectedTypes[0];
            const effectiveType = resolvePromoTypeVariant(typeId);
            hint.textContent = `Selected: ${buildPromoHint(effectiveType, inflationMultiplier)} | Budget: ${perTypeSpend || totalSpend} | Total: ${totalSpend}${buildPromoFacilityHint(effectiveType)}`;
        }
        else {
            const labels = selectedTypes.map((typeId) => resolvePromoTypeCardDetails(typeId).label).join(", ");
            const facilityHint = buildPromoFacilityHints(effectiveTypes);
            const facilitySuffix = facilityHint ? ` | ${facilityHint}` : "";
            hint.textContent = `Selected (${selectedTypes.length}): ${labels}. Budgets are per type; total spend: ${totalSpend}${facilitySuffix}`;
        }
    }
    const budgetTotal = scope.querySelector("#promoBudgetTotal");
    if (budgetTotal) {
        const typeCount = selectedTypes.length;
        const perTypeLabel = typeCount > 1 ? ` (${typeCount} types)` : "";
        budgetTotal.textContent = `Total spend: ${totalSpend}${perTypeLabel}`;
    }
    const promoBtn = scope.querySelector("#promoBtn");
    if (promoBtn) {
        const label = selectedTypes.length > 1 ? "Fund Promo Pushes" : "Fund Promo Push";
        promoBtn.textContent = `${label} (${totalSpend})`;
    }
    updateAutoPromoSummary(scope);
}
function updateAutoCreateSummary(scope) {
    const root = scope || document;
    const summary = root.querySelector("#autoCreateSummary");
    if (!summary)
        return;
    const settings = state.meta?.autoCreate;
    if (!settings) {
        summary.innerHTML = `<div class="muted">Auto create unavailable.</div>`;
        return;
    }
    const enabled = Boolean(settings.enabled);
    const pct = Number.isFinite(settings.budgetPct) ? clamp(settings.budgetPct, 0, 1) : 0;
    const walletCash = state.label.wallet?.cash ?? state.label.cash ?? 0;
    const reserve = Number.isFinite(settings.minCash) ? settings.minCash : 0;
    const maxTracks = Number.isFinite(settings.maxTracks) ? settings.maxTracks : 1;
    const budgetCap = computeAutoCreateBudget(walletCash, pct, reserve);
    const scheduleHours = hoursUntilNextScheduledTime(WEEKLY_SCHEDULE.chartUpdate);
    const scheduleText = formatHourCountdown(scheduleHours);
    const scheduleLabel = scheduleText === "-" ? "-" : `${scheduleText}h`;
    const modeLabel = settings.mode === "collab" ? "Collab" : "Solo";
    const pctLabel = `${Math.round(pct * 100)}%`;
    const last = settings.lastOutcome;
    const lastStamp = last?.at ? formatDate(last.at) : "-";
    const lastCounts = last
        ? [
            last.actsAssigned ? `${last.actsAssigned} act${last.actsAssigned === 1 ? "" : "s"} assigned` : null,
            last.demoStarted ? `${last.demoStarted} demo${last.demoStarted === 1 ? "" : "s"}` : null,
            last.masterStarted ? `${last.masterStarted} master${last.masterStarted === 1 ? "" : "s"}` : null,
            last.created ? `${last.created} track${last.created === 1 ? "" : "s"} started` : null
        ].filter(Boolean).join(" | ")
        : "";
    const lastLine = last?.message
        ? `Last run ${lastStamp}: ${last.message}`
        : "No auto-create runs yet.";
    summary.innerHTML = `
    <div class="list-item">
      <div class="item-title">Auto Create Plan</div>
      <div class="muted">${enabled ? "Enabled" : "Disabled"} | Next check ${scheduleLabel} (chart update)</div>
      <div class="muted">Budget cap ${formatMoney(budgetCap)} (${pctLabel}) | Reserve ${formatMoney(reserve)} | Max ${maxTracks} | Mode ${modeLabel}</div>
      ${lastCounts ? `<div class="muted">Last run output: ${lastCounts}</div>` : ""}
      <div class="muted">${lastLine}</div>
    </div>
  `;
}
function updateCreateModePanels(scope) {
    const root = scope || document;
    const mode = state.ui?.createMode === "auto" ? "auto" : "manual";
    const manualPanel = root.querySelector("#createManualPanel");
    const autoPanel = root.querySelector("#createAutoPanel");
    if (manualPanel)
        manualPanel.classList.toggle("hidden", mode !== "manual");
    if (autoPanel)
        autoPanel.classList.toggle("hidden", mode !== "auto");
    root.querySelectorAll("[data-create-mode]").forEach((btn) => {
        const isActive = btn.dataset.createMode === mode;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
    });
    if (mode === "auto")
        updateAutoCreateSummary(root);
}
function bindGlobalHandlers() {
    const on = (id, event, handler) => {
        const el = $(id);
        if (el)
            el.addEventListener(event, handler);
    };
    const handleManualSave = (refreshMenu) => {
        if (!session.activeSlot) {
            logEvent("Select a game slot before saving.", "warn");
            return;
        }
        saveToActiveSlot();
        if (refreshMenu)
            renderMainMenu();
        logEvent(`Saved Game Slot ${session.activeSlot}.`);
    };
    const setTutorialTab = (tabId) => {
        if (!tabId)
            return;
        state.ui.tutorialTab = tabId;
        document.querySelectorAll("#tutorialTabs .tab").forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.tutorialTab === tabId);
        });
        document.querySelectorAll("[data-tutorial-section]").forEach((section) => {
            section.classList.toggle("hidden", section.dataset.tutorialSection !== tabId);
        });
    };
    document.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse" && event.button !== 0)
            return;
        if (!isUiRenderHoldTarget(event.target))
            return;
        startUiRenderHold();
    }, { capture: true });
    document.addEventListener("pointermove", () => {
        extendUiRenderHold();
    }, { passive: true });
    document.addEventListener("pointerup", () => {
        endUiRenderHold();
    }, { capture: true });
    document.addEventListener("pointercancel", () => {
        endUiRenderHold();
    }, { capture: true });
    window.addEventListener("blur", () => {
        endUiRenderHold();
    });
    on("pauseBtn", "click", () => { setTimeSpeed("pause"); });
    on("playBtn", "click", () => { setTimeSpeed("play"); });
    on("fastBtn", "click", () => { setTimeSpeed("fast"); });
    on("skipTimeBtn", "click", () => {
        const now = new Date(state.time.epochMs);
        if ($("skipDateInput"))
            $("skipDateInput").value = now.toISOString().slice(0, 10);
        if ($("skipTimeInput"))
            $("skipTimeInput").value = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`;
        openOverlay("skipTimeModal");
    });
    bindQuickSkipButtons();
    on("menuBtn", "click", () => {
        openMainMenu();
        syncGameModeSelect();
        syncDifficultySelect();
        syncUiThemeSelect();
        updateTimeControlButtons();
        syncTimeControlAria();
    });
    on("topLabelsMoreBtn", "click", () => openRankingWindow("labels"));
    on("topTrendsMoreBtn", "click", () => openRankingWindow("trends"));
    on("rankingWindowClose", "click", () => closeRankingWindow());
    on("tutorialBtn", "click", () => {
        renderRoleActions();
        renderTutorialEconomy();
        setTutorialTab(state.ui.tutorialTab || "loops");
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
    on("menuSaveBtn", "click", () => handleManualSave(true));
    on("uiThemeSelect", "change", (e) => {
        applyUiTheme(e.target.value, { persist: true });
    });
    on("saveNowBtn", "click", () => handleManualSave(false));
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
    const tutorialTabs = $("tutorialTabs");
    if (tutorialTabs) {
        tutorialTabs.addEventListener("click", (e) => {
            const tabBtn = e.target.closest("[data-tutorial-tab]");
            if (!tabBtn)
                return;
            const tabId = tabBtn.dataset.tutorialTab;
            if (!tabId)
                return;
            setTutorialTab(tabId);
        });
    }
    const tutorialModal = $("tutorialModal");
    if (tutorialModal) {
        tutorialModal.addEventListener("change", (e) => {
            const input = e.target.closest("[data-cheat-econ-key]");
            if (!input)
                return;
            const target = input.dataset.cheatEconTarget;
            const key = input.dataset.cheatEconKey;
            if (!target || !key)
                return;
            if (!state.meta.cheaterMode) {
                logEvent("Enable Cheater Mode in Settings to edit economy tuning.", "warn");
                renderTutorialEconomy();
                return;
            }
            let next = Number(input.value);
            if (!Number.isFinite(next)) {
                logEvent("Economy tuning values must be numeric.", "warn");
                renderTutorialEconomy();
                return;
            }
            const min = input.min !== "" ? Number(input.min) : null;
            const max = input.max !== "" ? Number(input.max) : null;
            if (Number.isFinite(min))
                next = Math.max(next, min);
            if (Number.isFinite(max))
                next = Math.min(next, max);
            input.value = String(next);
            const ok = setCheaterEconomyOverride(target, key, next);
            if (!ok) {
                logEvent("Cheater economy tuning update failed.", "warn");
                renderTutorialEconomy();
                return;
            }
            renderTutorialEconomy();
            renderAll({ save: false });
            saveToActiveSlot();
        });
    }
    on("calendarClose", "click", () => closeOverlay("calendarModal"));
    if (!UI_REACT_ISLANDS_ENABLED) {
        const calendarModal = $("calendarModal");
        if (calendarModal) {
            calendarModal.querySelectorAll("[data-calendar-tab]").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const tab = btn.dataset.calendarTab;
                    if (!tab)
                        return;
                    setCalendarTab(tab);
                });
            });
            calendarModal.querySelectorAll("[data-calendar-filter]").forEach((input) => {
                input.addEventListener("change", (e) => {
                    const key = e.target.dataset.calendarFilter;
                    if (!key)
                        return;
                    setCalendarFilter(key, e.target.checked);
                });
            });
        }
    }
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
            syncUiThemeSelect();
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
            renderAll();
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
    on("cheaterModeToggle", "change", (e) => {
        if (!session.activeSlot) {
            e.target.checked = Boolean(state.meta.cheaterMode);
            logEvent("Select a game slot before changing cheater mode.", "warn");
            return;
        }
        setCheaterMode(e.target.checked);
        renderTutorialEconomy();
        renderMainMenu();
        renderAll({ save: false });
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
                const validation = validateStartPreferences(startPreferences);
                const normalizedPrefs = validation.prefs || startPreferences;
                setStartPreferenceValues(normalizedPrefs);
                await loadSlot(slot, true, { mode, difficulty, startPreferences: normalizedPrefs });
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
    const setActiveChart = (chartKey) => {
        if (!chartKey || state.ui.activeChart === chartKey)
            return;
        state.ui.activeChart = chartKey;
        if (state.ui.chartHistoryWeek) {
            applyChartHistoryWeek(state.ui.chartHistoryWeek, state.ui.activeChart);
        }
        else {
            renderCharts();
        }
    };
    const chartTabs = root.querySelector("#chartTabs");
    if (chartTabs) {
        chartTabs.addEventListener("click", (e) => {
            const tab = e.target.closest(".tab");
            if (!tab)
                return;
            setActiveChart(tab.dataset.chart);
        });
    }
    const chartRegionTabs = root.querySelector("#chartRegionTabs");
    if (chartRegionTabs) {
        chartRegionTabs.addEventListener("click", (e) => {
            const tab = e.target.closest(".tab");
            if (!tab)
                return;
            setActiveChart(tab.dataset.chart);
        });
    }
    const chartTypeTabs = root.querySelector("#chartTypeTabs");
    if (chartTypeTabs) {
        chartTypeTabs.addEventListener("click", (e) => {
            const tab = e.target.closest(".tab");
            if (!tab)
                return;
            const next = tab.dataset.chartContent || "tracks";
            if (next === state.ui.chartContentType)
                return;
            state.ui.chartContentType = next;
            renderCharts();
        });
    }
    const chartPulseContentTabs = root.querySelector("#chartPulseContentTabs");
    if (chartPulseContentTabs) {
        chartPulseContentTabs.addEventListener("click", (e) => {
            const tab = e.target.closest(".tab");
            if (!tab)
                return;
            const next = tab.dataset.chartPulseContent || "tracks";
            if (next === state.ui.chartPulseContentType)
                return;
            state.ui.chartPulseContentType = next;
            renderAll({ save: false });
            saveToActiveSlot();
        });
    }
    const chartPulseScopeTabs = root.querySelector("#chartPulseScopeTabs");
    if (chartPulseScopeTabs) {
        chartPulseScopeTabs.addEventListener("click", (e) => {
            const tab = e.target.closest(".tab");
            if (!tab)
                return;
            const next = tab.dataset.chartPulseScope || "global";
            if (next === state.ui.chartPulseScopeType)
                return;
            state.ui.chartPulseScopeType = next;
            if (next === "global") {
                state.ui.chartPulseScopeTarget = "global";
            }
            else if (next === "nation") {
                const labelNation = NATIONS.includes(state.label?.country) ? state.label.country : NATIONS[0];
                if (!NATIONS.includes(state.ui.chartPulseScopeTarget)) {
                    state.ui.chartPulseScopeTarget = labelNation || "Annglora";
                }
            }
            else if (next === "region") {
                const regionIds = REGION_DEFS.map((region) => region.id);
                const labelRegion = REGION_DEFS.find((region) => region.nation === state.label?.country)?.id;
                if (!regionIds.includes(state.ui.chartPulseScopeTarget)) {
                    state.ui.chartPulseScopeTarget = labelRegion || regionIds[0] || "";
                }
            }
            renderAll({ save: false });
            saveToActiveSlot();
        });
    }
    const chartPulseTarget = root.querySelector("#chartPulseTarget");
    if (chartPulseTarget) {
        chartPulseTarget.addEventListener("change", (e) => {
            state.ui.chartPulseScopeTarget = e.target.value;
            renderAll({ save: false });
            saveToActiveSlot();
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
        const modeTabs = root.querySelector("#createModeTabs");
        if (modeTabs) {
            modeTabs.addEventListener("click", (e) => {
                const btn = e.target.closest("[data-create-mode]");
                if (!btn)
                    return;
                const nextMode = btn.dataset.createMode === "auto" ? "auto" : "manual";
                state.ui.createMode = nextMode;
                updateCreateModePanels(root);
                saveToActiveSlot();
            });
        }
        updateCreateModePanels(root);
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
        const syncAutoCreateControls = () => {
            const toggle = root.querySelector("#autoCreateToggle");
            const minCashInput = root.querySelector("#autoCreateMinCash");
            const budgetInput = root.querySelector("#autoCreateBudgetPct");
            const maxTracksInput = root.querySelector("#autoCreateMaxTracks");
            const modeSelect = root.querySelector("#autoCreateMode");
            if (toggle)
                toggle.checked = Boolean(state.meta?.autoCreate?.enabled);
            if (minCashInput)
                minCashInput.value = String(Math.max(0, Math.round(state.meta?.autoCreate?.minCash ?? 0)));
            if (budgetInput)
                budgetInput.value = String(Math.round((state.meta?.autoCreate?.budgetPct ?? 0) * 100));
            if (maxTracksInput)
                maxTracksInput.value = String(Math.max(1, Math.round(state.meta?.autoCreate?.maxTracks ?? 1)));
            if (modeSelect)
                modeSelect.value = state.meta?.autoCreate?.mode === "collab" ? "collab" : "solo";
            updateAutoCreateSummary(root);
        };
        on("autoCreateToggle", "change", (e) => {
            if (!state.meta.autoCreate)
                return;
            state.meta.autoCreate.enabled = e.target.checked;
            logEvent(state.meta.autoCreate.enabled ? "Auto create enabled." : "Auto create disabled.");
            syncAutoCreateControls();
            saveToActiveSlot();
        });
        on("autoCreateMinCash", "change", (e) => {
            if (!state.meta.autoCreate)
                return;
            const next = Math.max(0, Math.round(Number(e.target.value || 0)));
            state.meta.autoCreate.minCash = next;
            e.target.value = String(next);
            updateAutoCreateSummary(root);
            saveToActiveSlot();
        });
        on("autoCreateBudgetPct", "change", (e) => {
            if (!state.meta.autoCreate)
                return;
            const raw = Number(e.target.value || 0);
            const pct = clamp(raw / 100, 0, 1);
            state.meta.autoCreate.budgetPct = pct;
            e.target.value = String(Math.round(pct * 100));
            updateAutoCreateSummary(root);
            saveToActiveSlot();
        });
        on("autoCreateMaxTracks", "change", (e) => {
            if (!state.meta.autoCreate)
                return;
            const raw = Math.round(Number(e.target.value || 1));
            const next = clamp(raw, 1, 5);
            state.meta.autoCreate.maxTracks = next;
            e.target.value = String(next);
            updateAutoCreateSummary(root);
            saveToActiveSlot();
        });
        on("autoCreateMode", "change", (e) => {
            if (!state.meta.autoCreate)
                return;
            state.meta.autoCreate.mode = e.target.value === "collab" ? "collab" : "solo";
            updateAutoCreateSummary(root);
            saveToActiveSlot();
        });
        syncAutoCreateControls();
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
            emitStateChanged();
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
    if (route === "releases") {
        root.querySelectorAll("[data-calendar-tab]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const tab = btn.dataset.calendarTab;
                if (!tab)
                    return;
                setCalendarTab(tab);
            });
        });
        root.querySelectorAll("[data-calendar-filter]").forEach((input) => {
            input.addEventListener("change", (e) => {
                const key = e.target.dataset.calendarFilter;
                if (!key)
                    return;
                setCalendarFilter(key, e.target.checked);
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
        on("externalStoragePickBtn", "click", () => {
            void handleExternalStoragePick(root);
        });
        on("externalStorageSyncBtn", "click", () => {
            void handleExternalStorageSync(root);
        });
        on("externalStorageImportBtn", "click", () => {
            void handleExternalStorageImport(root);
        });
        on("externalStorageClearBtn", "click", () => {
            void handleExternalStorageClear(root);
        });
        void refreshExternalStorageStatus(root);
        on("promoTypeSelect", "change", (e) => {
            const typeId = e.target.value || DEFAULT_PROMO_TYPE;
            const trackContext = getPromoTargetContext(state.ui?.promoSlots?.trackId, state.ui?.promoSlots?.projectId, state.ui?.promoSlots?.actId);
            const lockouts = getPromoTypeLockouts(trackContext);
            syncPromoTypeCards(root, [typeId], lockouts);
            updatePromoTypeHint(root);
        });
        on("promoPrimeTimeToggle", "change", (e) => {
            if (!state.ui)
                state.ui = {};
            state.ui.promoPrimeTime = Boolean(e.target.checked);
            updatePromoTypeHint(root);
            saveToActiveSlot();
        });
        const promoGrid = root.querySelector("#promoTypeGrid");
        if (promoGrid) {
            promoGrid.addEventListener("input", (e) => {
                const input = e.target.closest("[data-promo-budget]");
                if (!input)
                    return;
                const typeId = input.dataset.promoType || input.closest("[data-promo-type]")?.dataset.promoType;
                if (!typeId)
                    return;
                const inflationMultiplier = getPromoInflationMultiplier();
                const next = setPromoBudgetForType(typeId, input.value, inflationMultiplier);
                input.value = String(next);
                updatePromoTypeHint(root);
            });
            promoGrid.addEventListener("click", (e) => {
                if (e.target.closest("[data-promo-budget]"))
                    return;
                const card = e.target.closest("[data-promo-type]");
                if (!card)
                    return;
                const typeId = card.dataset.promoType;
                if (!typeId)
                    return;
                const select = root.querySelector("#promoTypeSelect");
                const trackContext = getPromoTargetContext(state.ui?.promoSlots?.trackId, state.ui?.promoSlots?.projectId, state.ui?.promoSlots?.actId);
                const lockouts = getPromoTypeLockouts(trackContext);
                if (lockouts[typeId]) {
                    const message = typeId === "musicVideo" && lockouts[typeId] === "Used"
                        ? "Music video promo already used for this track."
                        : "Music video promo unlocks after release.";
                    logEvent(message, "warn");
                    return;
                }
                const selected = ensurePromoTypeSelection(root, select ? select.value : DEFAULT_PROMO_TYPE, lockouts);
                const isActive = selected.includes(typeId);
                if (isActive && selected.length === 1)
                    return;
                const nextSelected = isActive
                    ? selected.filter((id) => id !== typeId)
                    : Array.from(new Set([...selected, typeId]));
                syncPromoTypeCards(root, nextSelected, lockouts);
                if (select)
                    select.value = isActive ? (nextSelected[0] || typeId) : typeId;
                updatePromoTypeHint(root);
            });
        }
        hydratePromoTypeCards(root);
        const initTrackContext = getPromoTargetContext(state.ui?.promoSlots?.trackId, state.ui?.promoSlots?.projectId, state.ui?.promoSlots?.actId);
        const initLockouts = getPromoTypeLockouts(initTrackContext);
        if (Array.isArray(state.ui.promoTypes) && state.ui.promoTypes.length) {
            syncPromoTypeCards(root, state.ui.promoTypes, initLockouts);
            const select = root.querySelector("#promoTypeSelect");
            if (select)
                select.value = state.ui.promoTypes[0];
        }
        else if (state.ui.promoType) {
            syncPromoTypeCards(root, [state.ui.promoType], initLockouts);
            const select = root.querySelector("#promoTypeSelect");
            if (select)
                select.value = state.ui.promoType;
        }
        updatePromoTypeHint(root);
    }
    if (route === "tour") {
        const setTourNotice = (message, tone = "info") => {
            if (!state.ui)
                state.ui = {};
            state.ui.tourNotice = { message, tone };
        };
        const clearTourNotice = () => {
            if (!state.ui)
                state.ui = {};
            state.ui.tourNotice = null;
        };
        const getDraft = () => {
            const draft = getSelectedTourDraft();
            if (!draft) {
                setTourNotice("Select a tour draft first.", "warn");
                return null;
            }
            return draft;
        };
        root.addEventListener("focusin", (e) => {
            if (!e.target.closest("[data-tour-lock]"))
                return;
            if (!state.ui)
                state.ui = {};
            state.ui.tourDeskLock = true;
        });
        root.addEventListener("focusout", (e) => {
            if (!e.target.closest("[data-tour-lock]"))
                return;
            if (!state.ui)
                state.ui = {};
            state.ui.tourDeskLock = false;
        });
        on("tourDraftSelect", "change", (e) => {
            const draftId = e.target.value || null;
            selectTourDraft(draftId);
            clearTourNotice();
            renderTouringDesk();
            saveToActiveSlot();
        });
        on("tourDraftCreateBtn", "click", () => {
            const actId = root.querySelector("#tourActSelect")?.value || null;
            const goal = root.querySelector("#tourGoalSelect")?.value || "visibility";
            const era = actId ? getLatestActiveEraForAct(actId) : null;
            const draft = createTourDraft({ actId, eraId: era?.id || null, goal });
            setTourNotice(`Tour draft created: ${draft.name}.`, "info");
            logUiEvent("action_submit", { action: "tour_create", tourId: draft.id, actId, eraId: draft.eraId });
            renderTouringDesk();
            saveToActiveSlot();
        });
        on("tourDraftDeleteBtn", "click", () => {
            const draft = getDraft();
            if (!draft) {
                renderTouringDesk();
                return;
            }
            const removed = deleteTourDraft(draft.id);
            setTourNotice(removed ? `Tour draft deleted: ${draft.name}.` : "Unable to delete tour draft.", removed ? "info" : "warn");
            logUiEvent("action_submit", { action: "tour_delete", tourId: draft.id });
            renderTouringDesk();
            saveToActiveSlot();
        });
        on("tourNameInput", "change", (e) => {
            const draft = getDraft();
            if (!draft)
                return;
            updateTourDraft(draft.id, { name: e.target.value });
            clearTourNotice();
            renderTouringDesk();
            saveToActiveSlot();
        });
        on("tourGoalSelect", "change", (e) => {
            const draft = getDraft();
            if (!draft)
                return;
            updateTourDraft(draft.id, { goal: e.target.value });
            clearTourNotice();
            renderTouringDesk();
            saveToActiveSlot();
        });
        on("tourActSelect", "change", (e) => {
            const draft = getDraft();
            if (!draft)
                return;
            const actId = e.target.value || null;
            const era = actId ? getLatestActiveEraForAct(actId) : null;
            updateTourDraft(draft.id, {
                actId,
                eraId: era?.id || null,
                anchorTrackIds: [],
                anchorProjectId: null
            });
            clearTourNotice();
            renderTouringDesk();
            saveToActiveSlot();
        });
        on("tourEraSelect", "change", (e) => {
            const draft = getDraft();
            if (!draft)
                return;
            const eraId = e.target.value || null;
            updateTourDraft(draft.id, { eraId });
            clearTourNotice();
            renderTouringDesk();
            saveToActiveSlot();
        });
        on("tourAnchorSelect", "change", (e) => {
            const draft = getDraft();
            if (!draft)
                return;
            const value = e.target.value || "auto";
            const updates = { anchorTrackIds: [], anchorProjectId: null };
            if (value === "auto") {
                updates.anchorTrackIds = [];
                updates.anchorProjectId = null;
            }
            else if (value.startsWith("track:")) {
                updates.anchorTrackIds = [value.slice(6)];
            }
            else {
                updates.anchorProjectId = value;
            }
            updateTourDraft(draft.id, updates);
            clearTourNotice();
            renderTouringDesk();
            saveToActiveSlot();
        });
        on("tourWindowStart", "change", (e) => {
            const draft = getDraft();
            if (!draft)
                return;
            const raw = String(e.target.value || "").trim();
            const week = raw ? Math.max(1, Math.round(Number(raw))) : null;
            updateTourDraft(draft.id, { window: { startWeek: week } });
            clearTourNotice();
            renderTouringDesk();
            saveToActiveSlot();
        });
        on("tourWindowEnd", "change", (e) => {
            const draft = getDraft();
            if (!draft)
                return;
            const raw = String(e.target.value || "").trim();
            const week = raw ? Math.max(1, Math.round(Number(raw))) : null;
            updateTourDraft(draft.id, { window: { endWeek: week } });
            clearTourNotice();
            renderTouringDesk();
            saveToActiveSlot();
        });
        on("tourNotes", "change", (e) => {
            const draft = getDraft();
            if (!draft)
                return;
            updateTourDraft(draft.id, { notes: e.target.value });
            clearTourNotice();
            renderTouringDesk();
            saveToActiveSlot();
        });
        on("tourBalanceToggle", "change", (e) => {
            const enabled = Boolean(e.target.checked);
            setTouringBalanceEnabled(enabled);
            setTourNotice(`Touring balance ${enabled ? "enabled" : "disabled"}.`, "info");
            renderTouringDesk();
            saveToActiveSlot();
        });
        on("tourBookingWeek", "change", (e) => {
            if (!state.ui)
                state.ui = {};
            const raw = Math.round(Number(e.target.value || 0));
            state.ui.tourBookingWeek = Math.max(1, raw || weekIndex() + 1);
            renderTouringDesk();
            saveToActiveSlot();
        });
        on("tourBookingDay", "change", (e) => {
            if (!state.ui)
                state.ui = {};
            state.ui.tourBookingDay = clamp(Math.round(Number(e.target.value || 0)), 0, 6);
            renderTouringDesk();
            saveToActiveSlot();
        });
        on("tourVenueNation", "change", (e) => {
            if (!state.ui.tourVenueFilters)
                state.ui.tourVenueFilters = {};
            state.ui.tourVenueFilters.nation = e.target.value || "All";
            renderTouringDesk();
            saveToActiveSlot();
        });
        on("tourVenueRegion", "change", (e) => {
            if (!state.ui.tourVenueFilters)
                state.ui.tourVenueFilters = {};
            state.ui.tourVenueFilters.regionId = e.target.value || "All";
            renderTouringDesk();
            saveToActiveSlot();
        });
        on("tourVenueTier", "change", (e) => {
            if (!state.ui.tourVenueFilters)
                state.ui.tourVenueFilters = {};
            state.ui.tourVenueFilters.tier = e.target.value || "All";
            renderTouringDesk();
            saveToActiveSlot();
        });
        root.addEventListener("click", (e) => {
            const bookBtn = e.target.closest("[data-tour-book]");
            if (bookBtn) {
                const draft = getDraft();
                if (!draft) {
                    renderTouringDesk();
                    return;
                }
                const venueId = bookBtn.dataset.tourBook;
                const weekNumber = state.ui?.tourBookingWeek || weekIndex() + 1;
                const dayIndex = Number.isFinite(state.ui?.tourBookingDay) ? state.ui.tourBookingDay : 5;
                const result = bookTourDate({ draftId: draft.id, venueId, weekNumber, dayIndex });
                if (!result.ok) {
                    setTourNotice(result.reason || "Tour booking blocked.", "warn");
                    logUiEvent("action_submit", { action: "tour_book_fail", tourId: draft.id, venueId, code: result.code });
                }
                else {
                    setTourNotice(`Tour date booked: ${result.booking.venueLabel}.`, "info");
                    logUiEvent("action_submit", { action: "tour_book", tourId: draft.id, venueId, weekNumber, dayIndex });
                }
                renderTouringDesk();
                saveToActiveSlot();
                emitStateChanged();
            }
            const removeBtn = e.target.closest("[data-tour-remove]");
            if (removeBtn) {
                const bookingId = removeBtn.dataset.tourRemove;
                const removed = removeTourBooking(bookingId);
                setTourNotice(removed ? "Tour date removed." : "Tour date not found.", removed ? "info" : "warn");
                logUiEvent("action_submit", { action: "tour_remove", bookingId, removed });
                renderTouringDesk();
                saveToActiveSlot();
                emitStateChanged();
            }
        });
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
            emitStateChanged();
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
    on("projectName", "input", () => {
        renderCreateStageControls();
    });
    on("projectTypeSelect", "change", () => {
        updateTrackRecommendation();
        renderCreateStageControls();
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
    on("releaseDistribution", "change", () => {
        renderReleaseDesk();
    });
    const readyList = root.querySelector("#readyList");
    if (readyList) {
        readyList.addEventListener("click", handleReleaseAction);
        readyList.addEventListener("click", handleReleaseActRecommendation);
        readyList.addEventListener("focusin", (e) => {
            const select = e.target.closest("select[data-assign-act], select[data-release-type]");
            if (!select)
                return;
            if (!state.ui)
                state.ui = {};
            state.ui.releaseDeskLock = true;
        });
        readyList.addEventListener("focusout", (e) => {
            const select = e.target.closest("select[data-assign-act], select[data-release-type]");
            if (!select)
                return;
            if (!state.ui)
                state.ui = {};
            state.ui.releaseDeskLock = false;
        });
        readyList.addEventListener("change", (e) => {
            const actSelect = e.target.closest("[data-assign-act]");
            const releaseTypeSelect = e.target.closest("[data-release-type]");
            if (!actSelect && !releaseTypeSelect)
                return;
            if (!state.ui)
                state.ui = {};
            state.ui.releaseDeskLock = false;
            if (actSelect) {
                const trackId = actSelect.dataset.assignAct;
                const actId = actSelect.value;
                const assigned = assignTrackAct(trackId, actId);
                if (assigned) {
                    logUiEvent("action_submit", { action: "assign_act", trackId, actId });
                    renderAll();
                }
            }
            if (releaseTypeSelect) {
                const trackId = releaseTypeSelect.dataset.releaseType;
                const track = trackId ? getTrack(trackId) : null;
                if (!track)
                    return;
                const nextReleaseType = releaseTypeSelect.value === "Project" ? "Project" : "Single";
                track.releaseType = nextReleaseType;
                logUiEvent("action_submit", { action: "release_type_set", trackId, releaseType: nextReleaseType });
                renderReleaseDesk();
                saveToActiveSlot();
            }
        });
    }
    on("calendarBtn", "click", () => {
        if (!UI_REACT_ISLANDS_ENABLED) {
            renderCalendarList("calendarFullList", 12);
        }
        openOverlay("calendarModal");
    });
    on("promoBtn", "click", runPromotion);
    on("promoFocusPickBtn", "click", pickPromoTargetsFromFocus);
    on("autoRolloutToggle", "change", (e) => {
        if (!state.meta.autoRollout) {
            state.meta.autoRollout = { enabled: false, lastCheckedAt: null };
        }
        state.meta.autoRollout.enabled = e.target.checked;
        state.meta.autoRollout.lastCheckedAt = Date.now();
        logEvent(state.meta.autoRollout.enabled ? "Auto promo enabled." : "Auto promo disabled.");
        syncAutoPromoVisibility(root);
        updateAutoPromoSummary(root);
        saveToActiveSlot();
    });
    const autoPromoBudgetGrid = root.querySelector("#autoPromoBudgetGrid");
    if (autoPromoBudgetGrid) {
        autoPromoBudgetGrid.addEventListener("input", (e) => {
            const input = e.target.closest("[data-auto-promo-pct]");
            if (!input)
                return;
            const index = Number(input.dataset.autoPromoIndex || -1);
            if (!Number.isFinite(index) || index < 0)
                return;
            const slots = ensureAutoPromoBudgetSlots() || [];
            const raw = Number(input.value || 0);
            let nextPct = clamp(raw / 100, 0, 1);
            const totalWithout = slots.reduce((sum, value, idx) => {
                if (idx === index)
                    return sum;
                return sum + (Number.isFinite(value) ? value : 0);
            }, 0);
            if (totalWithout + nextPct > 1) {
                nextPct = Math.max(0, 1 - totalWithout);
                logEvent("Auto promo budget allocation cannot exceed 100%.", "warn");
            }
            slots[index] = nextPct;
            if (state.meta?.autoRollout) {
                state.meta.autoRollout.budgetPct = slots.reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
            }
            input.value = String(Math.round(nextPct * 100));
            updateAutoPromoBudgetTotal(root, slots);
            updateAutoPromoSummary(root);
            saveToActiveSlot();
        });
    }
    const autoRolloutToggle = root.querySelector("#autoRolloutToggle");
    if (autoRolloutToggle) {
        autoRolloutToggle.checked = Boolean(state.meta.autoRollout?.enabled);
    }
    syncAutoPromoBudgetControls(root);
    syncAutoPromoVisibility(root);
    updateAutoPromoSummary(root);
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
    on("cccThemeTrendBtn", "click", () => {
        applyCccTrendFilter("theme");
    });
    on("cccMoodTrendBtn", "click", () => {
        applyCccTrendFilter("mood");
    });
    on("cccThemeFilter", "change", (e) => {
        state.ui.cccThemeFilter = e.target.value || "All";
        renderAll();
    });
    on("cccMoodFilter", "change", (e) => {
        state.ui.cccMoodFilter = e.target.value || "All";
        renderAll();
    });
    on("cccSort", "change", (e) => {
        state.ui.cccSort = e.target.value || "default";
        renderAll();
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
    const communityToolsList = root.querySelector("#communityToolsList");
    if (communityToolsList) {
        communityToolsList.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-modifier-buy]");
            if (!btn || btn.disabled)
                return;
            const modifierId = btn.dataset.modifierBuy;
            if (!modifierId)
                return;
            const inflationMultiplier = getPromoInflationMultiplier();
            const result = purchaseModifier(modifierId, { inflationMultiplier });
            logUiEvent("action_submit", {
                action: "purchase_modifier",
                modifierId,
                outcome: result?.ok ? "success" : "failed",
                cost: result?.cost
            });
            if (!result?.ok) {
                shakeElement(btn);
                renderAll();
                return;
            }
            refreshSelectOptions();
            renderAll();
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
    on("rolloutStrategyTemplateCreate", "click", createRolloutStrategyFromTemplateFromUI);
    on("rolloutStrategyTemplateSelect", "change", selectRolloutTemplateFromUI);
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
    const usageSession = getUsageSessionSnapshot();
    const snapshot = {
        route: state.ui.activeView || activeRoute,
        week: weekIndex() + 1,
        cash: state.label.cash,
        activeSlot: session.activeSlot,
        activeIdSlot: state.ui.slotTarget,
        usageSessionId: usageSession?.id || null,
        time: {
            epochMs: state.time.epochMs,
            totalHours: state.time.totalHours,
            totalQuarters: state.time.totalQuarters
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
        `Usage Session: ${usageSession?.id || "-"}`,
        `Usage Errors: ${usageSession?.errors?.length || 0}`,
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
    if (usageSession?.id) {
        downloadFile(`usage_session_${usageSession.id}.json`, JSON.stringify(usageSession, null, 2), "application/json");
    }
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
    <div class="muted">Songwriter ${writer ? writer.name : "Unassigned"} | Recorder ${performer ? performer.name : "Unassigned"} | Producer ${producer ? producer.name : "Unassigned"}</div>
    <div class="muted">Act assignment happens at release.</div>
    ${warningHtml}
    <div class="tiny">${rec.reasons}</div>
  `;
    renderCreateStageControls();
}
function applyTrackRecommendationPlan(rec, stage) {
    if (stage === "sheet") {
        const themeSelect = $("themeSelect");
        if (themeSelect) {
            themeSelect.value = rec.theme;
            setThemeSelectAccent(themeSelect);
        }
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
    emitStateChanged();
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
window.updateAutoCreateSummary = () => updateAutoCreateSummary(document);
window.updateAutoPromoSummary = () => updateAutoPromoSummary(document);
window.updateCreateModePanels = () => updateCreateModePanels(document);
function ensureSlotDropdowns() {
    document.querySelectorAll(".id-slot").forEach((slot) => {
        if (slot.closest("#rls-react-trackslots-root"))
            return;
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
function listPromoProjectOptions(actId) {
    const activeEraIds = new Set(getActiveEras().filter((era) => era.status === "Active").map((era) => era.id));
    const scheduledIds = new Set(state.releaseQueue.map((entry) => entry.trackId).filter(Boolean));
    const projects = new Map();
    state.tracks.forEach((track) => {
        if (!track?.eraId || !activeEraIds.has(track.eraId))
            return;
        if (actId && track.actId !== actId)
            return;
        const isReleased = track.status === "Released";
        const isScheduled = track.status === "Scheduled" || scheduledIds.has(track.id);
        if (!isReleased && !isScheduled)
            return;
        const projectName = track.projectName || `${track.title} - Single`;
        const projectType = normalizeProjectType(track.projectType || "Single");
        const key = buildPromoProjectKey({
            eraId: track.eraId,
            actId: track.actId,
            projectName,
            projectType
        });
        if (!key)
            return;
        if (projects.has(key))
            return;
        const act = track.actId ? getAct(track.actId) : null;
        const actLabel = act ? ` | ${act.name}` : "";
        projects.set(key, { value: key, label: `${projectName} (${projectType})${actLabel}` });
    });
    return Array.from(projects.values()).sort((a, b) => a.label.localeCompare(b.label));
}
if (typeof window !== "undefined") {
    window.applyDefaultLayout = applyDefaultLayout;
    window.resetViewLayout = resetViewLayout;
    window.updateTimeControls = () => {
        updateTimeControlButtons();
        syncTimeControlAria();
    };
    window.stopAutoSkips = () => false;
    window.loadCSV = loadCSV;
    window.emitStateChanged = emitStateChanged;
    window.rlsUi = window.rlsUi || {};
    window.rlsUi.setCalendarTab = setCalendarTab;
    window.rlsUi.setCalendarFilter = setCalendarFilter;
}
function updateSlotDropdowns() {
    document.querySelectorAll(".id-slot").forEach((slot) => {
        if (slot.closest("#rls-react-trackslots-root"))
            return;
        const select = slot.querySelector(".slot-select");
        if (!select)
            return;
        const target = slot.dataset.slotTarget;
        const type = slot.dataset.slotType;
        const role = slot.dataset.slotRole;
        const currentValue = getSlotValue(target) || "";
        const autoPromoSlot = parseAutoPromoSlotTarget(target);
        const autoPromoSlots = autoPromoSlot ? ensureAutoPromoSlots() : null;
        const isPromoActSlot = target === "promo-act" || autoPromoSlot?.kind === "act";
        const isPromoProjectSlot = target === "promo-project" || autoPromoSlot?.kind === "project";
        const isPromoTrackSlot = target === "promo-track" || autoPromoSlot?.kind === "track";
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
            let acts = state.acts;
            if (isPromoActSlot) {
                const activeActIds = new Set(getActiveEras().filter((era) => era.status === "Active").map((era) => era.actId));
                acts = state.acts.filter((act) => activeActIds.has(act.id));
            }
            acts.forEach((act) => {
                options.push({ value: act.id, label: act.name });
            });
        }
        else if (type === "project") {
            let actId = null;
            if (target === "promo-project") {
                actId = state.ui?.promoSlots?.actId || null;
            }
            else if (isPromoProjectSlot && autoPromoSlots) {
                actId = autoPromoSlots.actIds[autoPromoSlot.index] || null;
            }
            const projects = listPromoProjectOptions(actId);
            projects.forEach((project) => {
                options.push({ value: project.value, label: project.label });
            });
        }
        else if (type === "track") {
            let tracks = state.tracks;
            if (isPromoTrackSlot) {
                const activeEraIds = new Set(getActiveEras().filter((era) => era.status === "Active").map((era) => era.id));
                let selectedActId = null;
                let selectedProjectId = null;
                if (target === "promo-track") {
                    selectedActId = state.ui?.promoSlots?.actId || null;
                    selectedProjectId = state.ui?.promoSlots?.projectId || null;
                }
                else if (autoPromoSlot && autoPromoSlot.kind === "track" && autoPromoSlots) {
                    selectedActId = autoPromoSlots.actIds[autoPromoSlot.index] || null;
                    selectedProjectId = autoPromoSlots.projectIds[autoPromoSlot.index] || null;
                }
                const selectedProject = selectedProjectId ? parsePromoProjectKey(selectedProjectId) : null;
                const projectName = selectedProject?.projectName || "";
                const projectType = normalizeProjectType(selectedProject?.projectType || "Single");
                const projectEraId = selectedProject?.eraId || null;
                const projectActId = selectedProject?.actId || null;
                tracks = state.tracks.filter((track) => {
                    if (!track.eraId || !activeEraIds.has(track.eraId))
                        return false;
                    if (track.status === "Released")
                        return true;
                    return state.releaseQueue.some((entry) => entry.trackId === track.id);
                });
                tracks = tracks.filter((track) => {
                    if (selectedActId && track.actId !== selectedActId)
                        return false;
                    if (!selectedProject)
                        return true;
                    if (projectEraId && track.eraId !== projectEraId)
                        return false;
                    if (projectActId && track.actId !== projectActId)
                        return false;
                    const trackProject = track.projectName || `${track.title} - Single`;
                    if (normalizeProjectName(trackProject) !== normalizeProjectName(projectName))
                        return false;
                    if (normalizeProjectType(track.projectType || "Single") !== projectType)
                        return false;
                    return true;
                });
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
        logEvent("Select a Theme to create sheet music.", "warn");
        return;
    }
    const moodSelect = $("moodSelect");
    const mood = moodSelect ? moodSelect.value : "";
    const titleInput = $("trackTitle").value.trim();
    const projectNameInput = $("projectName").value.trim();
    const projectType = $("projectTypeSelect") ? $("projectTypeSelect").value : "Single";
    const resolvedProjectType = normalizeProjectType(projectType);
    const modifierId = $("modifierSelect") ? $("modifierSelect").value : "None";
    const modifier = getModifier(modifierId);
    const modifierCount = modifier && modifier.id !== "None" ? getModifierInventoryCount(modifier.id) : null;
    const req = staminaRequirement("Songwriter");
    const assignedSongwriters = [...new Set(getTrackSlotIds("Songwriter"))];
    if (!assignedSongwriters.length) {
        shakeSlot(primaryTrackSlotTarget("Songwriter"));
        logEvent("Cannot create sheet music: assign a Songwriter ID.", "warn");
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
    const projectCheck = projectNameInput
        ? evaluateProjectTrackConstraints(projectNameInput, resolvedProjectType)
        : null;
    if (projectCheck && !projectCheck.ok) {
        shakeField("projectName");
        logEvent(projectCheck.reason, "warn");
        return;
    }
    let maxTracksToCreate = eligibleSongwriters.length;
    if (projectCheck?.limits && Number.isFinite(projectCheck.limits.max)) {
        const remaining = projectCheck.limits.max - projectCheck.count;
        if (remaining <= 0) {
            logEvent(projectCheck.reason || "Project track limit reached.", "warn");
            return;
        }
        if (remaining < maxTracksToCreate) {
            logEvent(`Only ${remaining} track slot${remaining === 1 ? "" : "s"} left for "${projectNameInput}" (${resolvedProjectType}).`, "warn");
            maxTracksToCreate = remaining;
        }
    }
    if (modifier && modifier.id !== "None") {
        if (!modifierCount) {
            logEvent(`Modifier unavailable: ${modifier.label}.`, "warn");
            return;
        }
        if (modifierCount < maxTracksToCreate) {
            logEvent(`Only ${modifierCount} ${modifier.label} modifier${modifierCount === 1 ? "" : "s"} left.`, "warn");
            maxTracksToCreate = modifierCount;
        }
    }
    const availableStudios = getStudioAvailableSlots();
    if (availableStudios <= 0) {
        logEvent("No studio slots available. Finish a production or expand capacity first.", "warn");
        return;
    }
    const stageCosts = eligibleSongwriters.map((id) => getStageCost(0, modifier, [id]));
    const minCost = stageCosts.length ? Math.min(...stageCosts) : 0;
    if (state.label.cash < minCost) {
        logEvent("Not enough cash to create new sheet music.", "warn");
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
    for (let i = 0; i < eligibleSongwriters.length && startedCount < maxTracksToCreate; i += 1) {
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
            projectType: resolvedProjectType,
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
            projectType: resolvedProjectType,
            mode: "solo"
        });
        logUiEvent("action_submit", {
            action: "start_track",
            trackId: track.id,
            theme,
            mood,
            projectType: resolvedProjectType,
            mode: "solo",
            songwriterId
        });
        const creator = getCreator(songwriterId);
        const creatorLabel = creator ? ` by ${creator.name}` : "";
        logEvent(`Created sheet music for "${track.title}" (Theme: ${track.theme})${creatorLabel}.`);
    }
    if (!startedCount)
        return;
    if (eligibleSongwriters.length > 1) {
        logEvent(`Created ${startedCount} solo track${startedCount === 1 ? "" : "s"}.`);
    }
    if (stoppedByCash) {
        logEvent("Stopped early: not enough cash to create more tracks.", "warn");
    }
    if (stoppedByStudio) {
        logEvent("Stopped early: no studio slots available to create more sheet music.", "warn");
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
        logEvent("Select a Theme to create sheet music.", "warn");
        return;
    }
    const moodSelect = $("moodSelect");
    const mood = moodSelect ? moodSelect.value : "";
    const title = $("trackTitle").value.trim() || makeTrackTitle(theme, mood);
    const projectName = $("projectName").value.trim() || makeProjectTitle();
    const projectType = $("projectTypeSelect") ? $("projectTypeSelect").value : "Single";
    const resolvedProjectType = normalizeProjectType(projectType);
    const modifierId = $("modifierSelect") ? $("modifierSelect").value : "None";
    const modifier = getModifier(modifierId);
    if (modifier && modifier.id !== "None" && getModifierInventoryCount(modifier.id) <= 0) {
        logEvent(`Modifier unavailable: ${modifier.label}.`, "warn");
        return;
    }
    const songwriterIds = getTrackSlotIds("Songwriter");
    const performerIds = getTrackSlotIds("Performer");
    const producerIds = getTrackSlotIds("Producer");
    if (!songwriterIds.length) {
        shakeSlot(primaryTrackSlotTarget("Songwriter"));
        logEvent("Cannot create sheet music: assign a Songwriter ID.", "warn");
        return;
    }
    const projectCheck = evaluateProjectTrackConstraints(projectName, resolvedProjectType);
    if (!projectCheck.ok) {
        shakeField("projectName");
        logEvent(projectCheck.reason, "warn");
        return;
    }
    const availableStudios = getStudioAvailableSlots();
    if (availableStudios <= 0) {
        logEvent("No studio slots available. Finish a production or expand capacity first.", "warn");
        return;
    }
    const stageCost = getStageCost(0, modifier, songwriterIds);
    if (state.label.cash < stageCost) {
        logEvent("Not enough cash to create new sheet music.", "warn");
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
        projectType: resolvedProjectType,
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
        projectType: resolvedProjectType
    });
    logUiEvent("action_submit", {
        action: "start_track",
        trackId: track.id,
        theme,
        mood,
        projectType: resolvedProjectType
    });
    logEvent(`Created sheet music for "${track.title}" (Theme: ${track.theme}).`);
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
const CREATOR_ACT_LIMIT = 4;
function buildCreatorActCounts() {
    const counts = {};
    state.acts.forEach((act) => {
        if (!Array.isArray(act.memberIds))
            return;
        act.memberIds.forEach((id) => {
            if (!id)
                return;
            counts[id] = (counts[id] || 0) + 1;
        });
    });
    return counts;
}
function getCreatorsOverActLimit(memberIds, actCounts) {
    return memberIds
        .map((id) => getCreator(id))
        .filter((creator) => creator && (actCounts[creator.id] || 0) >= CREATOR_ACT_LIMIT);
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
    const actCounts = buildCreatorActCounts();
    const blockedCreators = getCreatorsOverActLimit(members, actCounts);
    if (blockedCreators.length) {
        const names = blockedCreators.map((creator) => creator.name).join(", ");
        const verb = blockedCreators.length === 1 ? "is" : "are";
        logEvent(`Cannot create act: ${names} ${verb} already in ${CREATOR_ACT_LIMIT} acts.`, "warn");
        return;
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
    const actCounts = buildCreatorActCounts();
    const eligibleCreators = state.creators.filter((creator) => (actCounts[creator.id] || 0) < CREATOR_ACT_LIMIT);
    if (!eligibleCreators.length) {
        logEvent(`No creators available to form an act (all creators are in ${CREATOR_ACT_LIMIT} acts).`, "warn");
        return;
    }
    const canGroup = eligibleCreators.length >= 2;
    const chooseGroup = canGroup && Math.random() < 0.5;
    const pool = eligibleCreators.map((creator) => creator.id);
    const groupSize = chooseGroup && pool.length >= 3 && Math.random() < 0.5 ? 3 : 2;
    const memberIds = pickDistinct(pool, chooseGroup ? groupSize : 1);
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
function getSelectedRolloutTemplateIdFromUI() {
    const select = $("rolloutStrategyTemplateSelect");
    if (select && select.value)
        return select.value;
    return state.ui?.viewContext?.selectedRolloutTemplateId || null;
}
function resolveRolloutTemplateLabel(templateId) {
    if (!templateId)
        return "Template";
    const templates = Array.isArray(ROLLOUT_STRATEGY_TEMPLATES) ? ROLLOUT_STRATEGY_TEMPLATES : [];
    const match = templates.find((template) => template.id === templateId);
    return match?.label || templateId;
}
function selectRolloutTemplateFromUI(e) {
    const templateId = e.target.value || null;
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
    state.ui.viewContext.selectedRolloutTemplateId = templateId;
    saveToActiveSlot();
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
function createRolloutStrategyFromTemplateFromUI() {
    const era = getRolloutPlanningEra();
    if (!era) {
        logEvent("Focus an active era to apply a rollout template.", "warn");
        return;
    }
    const templateId = getSelectedRolloutTemplateIdFromUI();
    if (!templateId) {
        logEvent("Select a rollout template first.", "warn");
        return;
    }
    const strategy = createRolloutStrategyFromTemplate(era, templateId);
    if (!strategy) {
        logEvent("Rollout template could not be applied.", "warn");
        return;
    }
    setSelectedRolloutStrategyId(strategy.id);
    const templateLabel = resolveRolloutTemplateLabel(templateId);
    logEvent(`Rollout template applied: ${templateLabel}. Add Track IDs before expanding.`);
    logUiEvent("action_submit", {
        action: "rollout_strategy_template",
        eraId: era.id,
        strategyId: strategy.id,
        templateId
    });
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
function pickPromoTargetsFromFocus() {
    const focusEra = getFocusedEra();
    const activeEras = getActiveEras().filter((entry) => entry.status === "Active");
    const fallbackEra = !focusEra && activeEras.length === 1 ? activeEras[0] : null;
    const targetEra = focusEra || fallbackEra;
    if (!targetEra) {
        logEvent("Select a focus era before picking promo targets.", "warn");
        return;
    }
    const act = targetEra.actId ? getAct(targetEra.actId) : null;
    if (!act) {
        logEvent("Act not found for the focused era.", "warn");
        return;
    }
    const candidates = state.tracks.filter((track) => {
        if (track.eraId !== targetEra.id)
            return false;
        if (track.status === "Released")
            return true;
        return state.releaseQueue.some((entry) => entry.trackId === track.id);
    });
    if (!candidates.length) {
        const projectId = targetEra.projectName
            ? buildPromoProjectKey({
                eraId: targetEra.id,
                actId: act.id,
                projectName: targetEra.projectName,
                projectType: targetEra.projectType || "Single"
            })
            : null;
        const projectLabel = projectId ? parsePromoProjectKey(projectId) : null;
        state.ui.promoSlots.actId = act.id;
        state.ui.promoSlots.projectId = projectId;
        state.ui.promoSlots.trackId = null;
        logUiEvent("action_submit", {
            action: "promo_focus_pick",
            eraId: targetEra.id,
            actId: act.id,
            projectId,
            trackId: null
        });
        const projectNote = projectLabel ? ` + Project "${projectLabel.projectName}"` : "";
        logEvent(`Promo targets set to Act "${act.name}"${projectNote}. No scheduled or released tracks found for this era.`);
        renderSlots();
        renderTracks();
        updatePromoTypeHint(document);
        saveToActiveSlot();
        return;
    }
    const picked = candidates.reduce((latest, track) => {
        const latestSchedule = latest.status === "Released"
            ? latest.releasedAt
            : state.releaseQueue.find((entry) => entry.trackId === latest.id)?.releaseAt;
        const entrySchedule = track.status === "Released"
            ? track.releasedAt
            : state.releaseQueue.find((entry) => entry.trackId === track.id)?.releaseAt;
        const latestStamp = latestSchedule || 0;
        const entryStamp = entrySchedule || 0;
        return entryStamp >= latestStamp ? track : latest;
    }, candidates[0]);
    const projectId = buildPromoProjectKeyFromTrack(picked);
    const projectLabel = projectId ? parsePromoProjectKey(projectId) : null;
    state.ui.promoSlots.actId = act.id;
    state.ui.promoSlots.projectId = projectId;
    state.ui.promoSlots.trackId = picked.id;
    logUiEvent("action_submit", {
        action: "promo_focus_pick",
        eraId: targetEra.id,
        actId: act.id,
        projectId,
        trackId: picked.id
    });
    const projectNote = projectLabel ? ` + Project "${projectLabel.projectName}"` : "";
    logEvent(`Promo targets set to Act "${act.name}"${projectNote} + "${picked.title}".`);
    renderSlots();
    renderTracks();
    updatePromoTypeHint(document);
    saveToActiveSlot();
}
function runPromotion() {
    const trackId = state.ui.promoSlots.trackId;
    const projectId = state.ui.promoSlots.projectId;
    const slotActId = state.ui.promoSlots.actId;
    const track = trackId ? getTrack(trackId) : null;
    const actId = slotActId || (track ? track.actId : null);
    if (!actId && !track && !projectId) {
        logEvent("Select an Act, Project, or Track for the promo push.", "warn");
        return;
    }
    if (!state.ui.promoSlots.actId && actId)
        state.ui.promoSlots.actId = actId;
    const trackContext = getPromoTargetContext(trackId, projectId, actId);
    const act = trackContext.act;
    const project = trackContext.project;
    if (!act) {
        logEvent("Promo push requires an Act selection.", "warn");
        return;
    }
    if (projectId && !project) {
        logEvent("Project not found for promo push.", "warn");
        return;
    }
    if (trackId && !trackContext.track) {
        logEvent("Track not found for promo push.", "warn");
        return;
    }
    if (project && project.actId && project.actId !== act.id) {
        logEvent("Selected project does not belong to the selected act.", "warn");
        return;
    }
    if (trackContext.track && act && trackContext.track.actId && trackContext.track.actId !== act.id) {
        logEvent("Selected track does not belong to the selected act.", "warn");
        return;
    }
    if (trackContext.track && projectId) {
        const trackProjectId = buildPromoProjectKeyFromTrack(trackContext.track);
        if (trackProjectId && trackProjectId !== projectId) {
            logEvent("Selected track does not belong to the selected project.", "warn");
            return;
        }
    }
    if (trackContext.track && !trackContext.isReleased && !trackContext.isScheduled) {
        logEvent("Promo push requires a scheduled or released track.", "warn");
        return;
    }
    const projectTargets = project && !trackContext.track
        ? listPromoEligibleTracks(trackContext.projectTracks)
        : [];
    if (!trackContext.track && project && !projectTargets.length) {
        logEvent("Promo push requires scheduled or released tracks for the selected project.", "warn");
        return;
    }
    const select = $("promoTypeSelect");
    const lockouts = getPromoTypeLockouts(trackContext);
    const selectedTypes = ensurePromoTypeSelection(document, select ? select.value : DEFAULT_PROMO_TYPE, lockouts);
    if (!selectedTypes.length) {
        logEvent("No available promo types for this promo target.", "warn");
        return;
    }
    const inflationMultiplier = getPromoInflationMultiplier();
    const effectiveTypes = derivePromoTypesForRun(selectedTypes);
    if (!effectiveTypes.length) {
        logEvent("No available promo types for this promo target.", "warn");
        return;
    }
    if (isPromoPrimeTimeEnabled() && selectedTypes.includes("livePerformance")) {
        const eligibility = typeof game.checkPrimeShowcaseEligibility === "function"
            ? game.checkPrimeShowcaseEligibility(act.id, trackContext.track?.id || null)
            : { ok: true, reason: "" };
        if (!eligibility.ok) {
            logEvent(eligibility.reason || "Prime Time eligibility not met.", "warn");
            return;
        }
    }
    const { budgets, total: totalCost } = getPromoBudgetsForTypes(effectiveTypes, inflationMultiplier);
    if (!totalCost || Number.isNaN(totalCost)) {
        logEvent("Promo budget total must be greater than 0.", "warn");
        return;
    }
    if (state.label.cash < totalCost) {
        const label = effectiveTypes.length > 1 ? "promo pushes" : "promo push";
        logEvent(`Not enough cash for ${label}.`, "warn");
        return;
    }
    const era = trackContext.era || getActiveEras().find((entry) => entry.actId === act.id && entry.status === "Active");
    if (!era || era.status !== "Active") {
        logEvent("Promo push requires an active era for the selected act.", "warn");
        return;
    }
    const projectReleaseAt = projectTargets.length
        ? projectTargets.map((entry) => {
            if (entry.status === "Released")
                return entry.releasedAt;
            const scheduled = state.releaseQueue.find((release) => release.trackId === entry.id);
            return scheduled?.releaseAt || null;
        }).filter(Number.isFinite).sort((a, b) => b - a)[0]
        : null;
    const releaseDate = trackContext.track
        ? (trackContext.scheduled ? formatDate(trackContext.scheduled.releaseAt) : trackContext.track.releasedAt ? formatDate(trackContext.track.releasedAt) : "TBD")
        : projectReleaseAt
            ? formatDate(projectReleaseAt)
            : formatDate(state.time.epochMs);
    const market = trackContext.isReleased && trackContext.track
        ? state.marketTracks.find((entry) => entry.id === trackContext.track.marketId)
        : null;
    if (trackContext.isReleased && trackContext.track && !market) {
        logEvent("Track is not active on the market.", "warn");
        return;
    }
    const facilityNeeds = getPromoFacilityNeeds(effectiveTypes);
    for (const [facilityId, count] of Object.entries(facilityNeeds)) {
        const availability = getPromoFacilityAvailability(facilityId);
        if (availability.available < count) {
            const label = facilityId === "broadcast" ? "Broadcast slots" : "Filming slots";
            const plural = count === 1 ? "type" : "types";
            const windowLabel = formatPromoFacilityWindowLabel(availability);
            logEvent(`Not enough ${label} (${windowLabel}) for ${count} promo ${plural}.`, "warn");
            return;
        }
    }
    for (const promoType of effectiveTypes) {
        const facilityId = getPromoFacilityForType(promoType);
        if (!facilityId)
            continue;
        const reservation = reservePromoFacilitySlot(facilityId, promoType, trackContext.track?.id || null, { actId: act.id });
        if (!reservation.ok) {
            logEvent(reservation.reason || "No facility slots available for the current timeframe.", "warn");
            return;
        }
    }
    state.label.cash -= totalCost;
    if (trackContext.track) {
        recordTrackPromoCost(trackContext.track, totalCost);
    }
    else if (projectTargets.length) {
        const perTrack = totalCost / projectTargets.length;
        projectTargets.forEach((entry) => recordTrackPromoCost(entry, perTrack));
    }
    let boostWeeks = 0;
    const weeksByType = {};
    effectiveTypes.forEach((promoType) => {
        const budget = budgets[promoType];
        const weeks = promoWeeksFromBudget(budget);
        weeksByType[promoType] = weeks;
        boostWeeks = Math.max(boostWeeks, weeks);
    });
    const findMarketEntry = (entry) => {
        if (!entry)
            return null;
        if (entry.marketId) {
            return state.marketTracks.find((marketEntry) => marketEntry.id === entry.marketId) || null;
        }
        return state.marketTracks.find((marketEntry) => marketEntry.trackId === entry.id) || null;
    };
    if (trackContext.track) {
        const promo = trackContext.track.promo || { preReleaseWeeks: 0, musicVideoUsed: false };
        if (trackContext.isReleased && market) {
            market.promoWeeks = Math.max(market.promoWeeks, boostWeeks);
        }
        else {
            promo.preReleaseWeeks = Math.max(promo.preReleaseWeeks || 0, boostWeeks);
        }
        if (selectedTypes.includes("musicVideo"))
            promo.musicVideoUsed = true;
        trackContext.track.promo = promo;
    }
    else if (projectTargets.length) {
        projectTargets.forEach((entry) => {
            if (entry.status === "Released") {
                const marketEntry = findMarketEntry(entry);
                if (marketEntry)
                    marketEntry.promoWeeks = Math.max(marketEntry.promoWeeks || 0, boostWeeks);
                return;
            }
            const promo = entry.promo || { preReleaseWeeks: 0, musicVideoUsed: false };
            promo.preReleaseWeeks = Math.max(promo.preReleaseWeeks || 0, boostWeeks);
            entry.promo = promo;
        });
    }
    act.promoWeeks = Math.max(act.promoWeeks || 0, boostWeeks);
    state.meta.promoRuns = (state.meta.promoRuns || 0) + effectiveTypes.length;
    const promoIds = new Set([
        ...(act.memberIds || [])
    ]);
    if (trackContext.track) {
        (trackContext.track?.creators?.songwriterIds || []).forEach((id) => promoIds.add(id));
        (trackContext.track?.creators?.performerIds || []).forEach((id) => promoIds.add(id));
        (trackContext.track?.creators?.producerIds || []).forEach((id) => promoIds.add(id));
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
    const hasPerformanceTape = effectiveTypes.some((promoType) => promoType === "livePerformance" || promoType === "primeShowcase");
    const promoTargetType = trackContext.track ? "track" : project ? "project" : "act";
    const promoProjectName = trackContext.track?.projectName || project?.projectName || null;
    const postTitle = trackContext.track ? trackContext.track.title : project ? project.projectName : act.name;
    effectiveTypes.forEach((promoType) => {
        const budget = budgets[promoType];
        const weeks = weeksByType[promoType] || boostWeeks;
        if (trackContext.track) {
            game.recordPromoUsage({ track: trackContext.track, market, act, promoType, atMs: promoStamp });
        }
        else {
            game.recordPromoUsage({ act, promoType, atMs: promoStamp });
        }
        logUiEvent("action_submit", {
            action: "promotion",
            actId: act.id,
            projectId: projectId || null,
            projectName: promoProjectName || null,
            trackId: trackContext.track?.id || null,
            targetType: promoTargetType,
            budget,
            weeks,
            promoType,
            totalCost
        });
        game.recordPromoContent({
            promoType,
            actId: act.id,
            actName: act.name,
            trackId: trackContext.track?.id || null,
            marketId: market?.id || null,
            trackTitle: trackContext.track ? trackContext.track.title : project ? project.projectName : null,
            projectName: promoProjectName,
            label: state.label?.name || "",
            budget,
            weeks,
            isPlayer: true,
            targetType: promoTargetType
        });
        if (typeof postFromTemplate === "function") {
            postFromTemplate(promoType, {
                trackTitle: postTitle,
                actName: act.name,
                releaseDate,
                channel: trackContext.track?.distribution || "Broadcast",
                handle: handleFromName(state.label.name, "Label"),
                cost: budget,
                requirement: getPromoTypeDetails(promoType).requirement
            });
        }
    });
    if (typeof postFromTemplate === "function") {
        if (hasPerformanceTape) {
            postFromTemplate("performanceTape", {
                trackTitle: postTitle,
                actName: act.name,
                releaseDate,
                channel: trackContext.track?.distribution || "Broadcast",
                handle: handleFromName(state.label.name, "Label")
            });
        }
        renderSocialFeed();
    }
    else {
        logEvent("Promo template posting not available.", "warn");
    }
    const promoLabels = effectiveTypes.map((promoType) => getPromoTypeDetails(promoType).label).join(", ");
    const verb = effectiveTypes.length > 1 ? "Promo pushes funded" : "Promo push funded";
    const spendNote = effectiveTypes.length > 1 ? ` Total spend: ${formatMoney(totalCost)}.` : "";
    const releaseNote = trackContext.isScheduled ? ` Release on ${releaseDate}.` : "";
    const targetLabel = trackContext.track
        ? `"${trackContext.track.title}"`
        : project
            ? `Project "${project.projectName}"`
            : `Act "${act.name}"`;
    logEvent(`${verb} for ${targetLabel} (${promoLabels}) (+${boostWeeks} weeks).${spendNote}${releaseNote}`);
    renderAll();
}
function handleReleaseActRecommendation(e) {
    const btn = e.target.closest("button[data-act-recommend]");
    if (!btn)
        return;
    const trackId = btn.dataset.actRecommend;
    const track = getTrack(trackId);
    if (!track) {
        logEvent(`Act recommendation failed: track ${trackId || "unknown"} not found.`, "warn");
        return;
    }
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
    const trackId = btn.dataset.track;
    const track = getTrack(trackId);
    if (!track) {
        logEvent(`Release action failed: track ${trackId || "unknown"} not found.`, "warn");
        return;
    }
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
                releaseTrack(track, distribution, distribution, { chargeFee: true });
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
        reason: result.reason,
        reasonDetail: result.detail
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
    applyUiTheme(getStoredUiTheme());
    ensureSlotDropdowns();
    updateSlotDropdowns();
    ensureSocialDetailModal();
    setupOverlayDismissals();
    setupHorizontalWheelScroll();
    window.addEventListener("resize", () => clampAllPanels());
    bindGlobalHandlers();
    setupRankingWindowDrag();
    setupRankingWindowDismissal();
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
            recordSessionReady("slot-load");
            return;
        }
    }
    openMainMenu();
    syncGameModeSelect();
    syncDifficultySelect();
    syncStartPreferenceSelects();
    syncUiThemeSelect();
    recordSessionReady("main-menu");
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
function findHorizontalScrollTarget(start) {
    let el = start instanceof Element ? start : null;
    while (el && el !== document.body && el !== document.documentElement) {
        if (!(el instanceof HTMLElement)) {
            el = el.parentElement;
            continue;
        }
        const style = getComputedStyle(el);
        const overflowX = style.overflowX;
        if (overflowX === "auto" || overflowX === "scroll" || overflowX === "overlay") {
            const maxScroll = el.scrollWidth - el.clientWidth;
            if (maxScroll > 1) {
                const overflowY = style.overflowY;
                const hasVertical = (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay")
                    && (el.scrollHeight - el.clientHeight > 1);
                return { element: el, hasVertical };
            }
        }
        el = el.parentElement;
    }
    return null;
}
function handleHorizontalWheel(e) {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey)
        return;
    const target = findHorizontalScrollTarget(e.target);
    if (!target)
        return;
    const deltaX = Number.isFinite(e.deltaX) ? e.deltaX : 0;
    const deltaY = Number.isFinite(e.deltaY) ? e.deltaY : 0;
    if (!deltaX && !deltaY)
        return;
    const usingHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
    if (target.hasVertical && !e.shiftKey && !usingHorizontal)
        return;
    const delta = usingHorizontal ? deltaX : deltaY;
    if (!delta)
        return;
    const before = target.element.scrollLeft;
    target.element.scrollLeft = before + delta;
    if (target.element.scrollLeft !== before) {
        e.preventDefault();
    }
}
function setupHorizontalWheelScroll() {
    if (horizontalWheelBound || typeof document === "undefined")
        return;
    horizontalWheelBound = true;
    document.addEventListener("wheel", handleHorizontalWheel, { passive: false });
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
function formatRealTimeSeconds(seconds) {
    if (!Number.isFinite(seconds))
        return "-";
    const rounded = Math.round(seconds * 100) / 100;
    return `${rounded}s`;
}
function parseQuickSkipValue(value) {
    const num = Number(value);
    return Number.isFinite(num) && num > 0 ? num : null;
}
function getQuickSkipConfig(button) {
    if (!button)
        return null;
    return {
        hours: parseQuickSkipValue(button.dataset.skipHours),
        days: parseQuickSkipValue(button.dataset.skipDays),
        months: parseQuickSkipValue(button.dataset.skipMonths),
        label: button.dataset.skipLabel || ""
    };
}
function formatQuickSkipDescriptor(config) {
    if (!config)
        return "";
    if (config.months)
        return `+${formatCount(config.months)}mo`;
    if (config.days)
        return `+${formatCount(config.days)}d`;
    if (config.hours)
        return `+${formatCount(config.hours)}h`;
    return "";
}
function buildQuickSkipButtonLabel(button, baseLabel) {
    const config = getQuickSkipConfig(button);
    const descriptor = formatQuickSkipDescriptor(config);
    return descriptor ? `${baseLabel} (${descriptor})` : baseLabel;
}
function daysInUtcMonth(year, monthIndex) {
    return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}
function addUtcMonths(date, months) {
    const next = new Date(date.getTime());
    const day = next.getUTCDate();
    next.setUTCDate(1);
    next.setUTCMonth(next.getUTCMonth() + months);
    const maxDay = daysInUtcMonth(next.getUTCFullYear(), next.getUTCMonth());
    next.setUTCDate(Math.min(day, maxDay));
    return next;
}
function resolveQuickSkipHours(config) {
    if (!config)
        return 0;
    if (config.hours)
        return Math.round(config.hours);
    if (config.days)
        return Math.round(config.days * 24);
    if (config.months) {
        const months = Math.round(config.months);
        const target = addUtcMonths(new Date(state.time.epochMs), months);
        const diffMs = target.getTime() - state.time.epochMs;
        if (diffMs <= 0)
            return 0;
        return Math.floor(diffMs / HOUR_MS);
    }
    return 0;
}
function buildQuickSkipRunLabel(config, totalHours) {
    if (config?.label)
        return config.label;
    if (config?.months) {
        const months = Math.round(config.months);
        return `Skipping ${formatCount(months)} month${months === 1 ? "" : "s"}`;
    }
    if (config?.days) {
        const days = Math.round(config.days);
        return `Skipping ${formatCount(days)} day${days === 1 ? "" : "s"}`;
    }
    if (config?.hours) {
        const hours = Math.round(config.hours);
        return `Skipping ${formatCount(hours)} hour${hours === 1 ? "" : "s"}`;
    }
    return `Skipping ${formatCount(totalHours)} hours`;
}
function runQuickSkipFromButton(button, { closeModal = false } = {}) {
    const config = getQuickSkipConfig(button);
    if (!config)
        return;
    const totalHours = resolveQuickSkipHours(config);
    if (!totalHours || totalHours <= 0) {
        logEvent("Quick skip option is invalid.", "warn");
        return;
    }
    const label = buildQuickSkipRunLabel(config, totalHours);
    runTimeJump(totalHours, label);
    if (closeModal)
        closeOverlay("skipTimeModal");
}
function bindQuickSkipButtons(root) {
    const scope = root || document;
    scope.querySelectorAll(QUICK_SKIP_SELECTOR).forEach((button) => {
        if (button.dataset.skipBound)
            return;
        button.dataset.skipBound = "1";
        button.addEventListener("click", () => {
            const closeModal = Boolean(button.closest("#skipTimeModal"));
            runQuickSkipFromButton(button, { closeModal });
        });
    });
}
function updateTimeControlLabels() {
    const pauseBtn = $("pauseBtn");
    if (pauseBtn)
        pauseBtn.textContent = "Pause (stopped)";
    const playBtn = $("playBtn");
    if (playBtn) {
        playBtn.textContent = `Play (1h = ${formatRealTimeSeconds(state.time?.secPerHourPlay)})`;
    }
    const fastBtn = $("fastBtn");
    if (fastBtn) {
        fastBtn.textContent = `Fast (1h = ${formatRealTimeSeconds(state.time?.secPerHourFast)})`;
    }
    const autoDayBtn = $("autoSkipDayBtn");
    if (autoDayBtn)
        autoDayBtn.textContent = buildQuickSkipButtonLabel(autoDayBtn, "Auto Day");
    const autoWeekBtn = $("autoSkipWeekBtn");
    if (autoWeekBtn)
        autoWeekBtn.textContent = buildQuickSkipButtonLabel(autoWeekBtn, "Auto Week");
    const skipBtn = $("skipTimeBtn");
    if (skipBtn)
        skipBtn.textContent = "Skip (custom)";
}
function updateTimeControlButtons() {
    updateTimeControlLabels();
    const pauseBtn = $("pauseBtn");
    const playBtn = $("playBtn");
    const fastBtn = $("fastBtn");
    if (pauseBtn)
        pauseBtn.classList.toggle("active", state.time.speed === "pause");
    if (playBtn)
        playBtn.classList.toggle("active", state.time.speed === "play");
    if (fastBtn)
        fastBtn.classList.toggle("active", state.time.speed === "fast");
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
    if (timeJumpInFlight) {
        logEvent("Time skip already running.", "warn");
        return;
    }
    timeJumpInFlight = true;
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
    const finish = () => {
        timeJumpInFlight = false;
        closeSkipProgress();
        renderAll();
    };
    const step = async () => {
        if (cancelled) {
            logEvent("Time skip canceled.", "warn");
            finish();
            return;
        }
        const remaining = totalHours - completed;
        const stepHours = Math.min(chunkSize, remaining);
        try {
            await advanceHours(stepHours, { renderQuarterly: false, renderAfter: false });
        }
        catch (error) {
            console.error("timeJump error:", error);
            logEvent("Time skip failed; stopping.", "warn");
            finish();
            return;
        }
        completed += stepHours;
        setSkipProgress(totalHours, completed, label);
        if (completed >= totalHours) {
            finish();
            return;
        }
        setTimeout(step, 0);
    };
    setTimeout(step, 0);
}
export default initUI;
//# sourceMappingURL=ui.js.map