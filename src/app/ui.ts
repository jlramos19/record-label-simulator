// @ts-nocheck
import * as game from "./game.js";
import { loadCSV } from "./csv.js";
import { fetchChartSnapshot, listChartWeeks } from "./db.js";

const {
  $,
  state,
  session,
  openOverlay,
  closeOverlay,
  renderAutoAssignModal,
  rankCandidates,
  renderSlots,
  logEvent,
  renderStats,
  saveToActiveSlot,
  makeTrackTitle,
  makeProjectTitle,
  makeLabelName,
  getModifier,
  createTrack,
  advanceHours,
  renderAll,
  makeActName,
  makeAct,
  renderActs,
  renderCreators,
  pickDistinct,
  getAct,
  getCreator,
  makeEraName,
  getEraById,
  getActiveEras,
  getStudioAvailableSlots,
  getFocusedEra,
  setFocusEraById,
  startEraForAct,
  endEraById,
  uid,
  weekIndex,
  renderEraStatus,
  renderTracks,
  renderReleaseDesk,
  clamp,
  getTrack,
  releaseTrack,
  scheduleRelease,
  buildMarketCreators,
  normalizeCreator,
  postCreatorSigned,
  openMainMenu,
  getSlotData,
  resetState,
  refreshSelectOptions,
  computeCharts,
  closeMainMenu,
  startGameLoop,
  setTimeSpeed,
  updateActMemberFields,
  renderQuickRecipes,
  renderCalendarList,
  renderGenreIndex,
  renderCharts,
  renderWallet,
  acceptBailout,
  declineBailout,
  renderSocialFeed,
  updateGenrePreview,
  renderMainMenu,
  formatCount,
  formatMoney,
  formatDate,
  formatWeekRangeLabel,
  handleFromName,
  setSlotTarget,
  assignToSlot,
  clearSlot,
  getSlotElement,
  describeSlot,
  loadSlot,
  deleteSlot,
  recommendTrackPlan,
  recommendReleasePlan
} = game;

const ROUTES = ["charts", "create", "releases", "eras", "roster", "world", "logs"];
const DEFAULT_ROUTE = "charts";
const ROUTE_ALIASES = {
  promotion: "eras",
  era: "eras"
};
const VIEW_PANEL_STATE_KEY = "rls_view_panel_state_v1";
const UI_EVENT_LOG_KEY = "rls_ui_event_log_v1";
let activeRoute = DEFAULT_ROUTE;
let hasMountedRoute = false;
let chartHistoryRequestId = 0;

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

const MAIN_SURFACES = ["charts", "create-track", "release-desk", "era-desk"];

const VIEW_PANEL_STATES = {
  open: "open",
  hidden: "hidden"
};


const VIEW_DEFAULTS = {
  charts: {
    "charts": VIEW_PANEL_STATES.open,
    "release-desk": VIEW_PANEL_STATES.open,
    "label-rankings": VIEW_PANEL_STATES.open
  },
  create: {
    "create-track": VIEW_PANEL_STATES.open,
    "tracks": VIEW_PANEL_STATES.open,
    "genres": VIEW_PANEL_STATES.open
  },
  releases: {
    "release-desk": VIEW_PANEL_STATES.open,
    "tracks": VIEW_PANEL_STATES.open
  },
  eras: {
    "era-desk": VIEW_PANEL_STATES.open,
    "promotion": VIEW_PANEL_STATES.open,
    "calendar": VIEW_PANEL_STATES.open,
    "tracks": VIEW_PANEL_STATES.open
  },
  roster: {
    "harmony-hub": VIEW_PANEL_STATES.open,
    "communities": VIEW_PANEL_STATES.open,
    "acts": VIEW_PANEL_STATES.open,
    "label-settings": VIEW_PANEL_STATES.open
  },
  world: {
    "ccc-market": VIEW_PANEL_STATES.open,
    "trends": VIEW_PANEL_STATES.open,
    "top-labels": VIEW_PANEL_STATES.open
  },
  logs: {
    "eyerisocial": VIEW_PANEL_STATES.open,
    "system-log": VIEW_PANEL_STATES.open,
    "usage-ledger": VIEW_PANEL_STATES.open,
    "debug-export": VIEW_PANEL_STATES.open
  }
};

function getPanelTray() {
  return document.querySelector("#panelTray");
}

function updatePanelTrayVisibility() {
  const tray = getPanelTray();
  if (!tray) return;
  tray.classList.toggle("has-panels", !!tray.querySelector(".panel.card"));
}

function loadSideLayout() {
  const raw = localStorage.getItem(SIDE_LAYOUT_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    sideLayout.leftCollapsed = !!parsed.leftCollapsed;
    sideLayout.rightCollapsed = !!parsed.rightCollapsed;
  } catch {
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
  if (!raw) return {};
  try {
    return JSON.parse(raw) || {};
  } catch {
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
  if (state === PANEL_STATES.collapsed || state === PANEL_STATES.expanded) return state;
  return PANEL_STATES.open;
}

function ensureViewPanelState(route, root) {
  const store = loadViewPanelState();
  if (!store[route]) store[route] = {};
  Object.values(store[route]).forEach((entry) => {
    if (!entry) return;
    entry.state = normalizeViewPanelState(entry.state);
  });
  const defaults = VIEW_DEFAULTS[route] || {};
  if (root) {
    root.querySelectorAll(".panel.card").forEach((panel) => {
      const key = panelKey(panel);
      if (!key) return;
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
  if (log.length > 800) log.shift();
  localStorage.setItem(UI_EVENT_LOG_KEY, JSON.stringify(log));
}

function loadUiEventLog() {
  const raw = localStorage.getItem(UI_EVENT_LOG_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

function chartScopeKey(chartKey) {
  if (chartKey === "global") return "global";
  if (NATIONS.includes(chartKey)) return `nation:${chartKey}`;
  return `region:${chartKey}`;
}

function chartScopeLabel(chartKey) {
  if (chartKey === "global") return "Global (Gaia)";
  if (NATIONS.includes(chartKey)) return chartKey;
  const region = REGION_DEFS.find((entry) => entry.id === chartKey);
  return region ? region.label : chartKey;
}

function resetChartHistoryView({ render = true } = {}) {
  chartHistoryRequestId += 1;
  if (state.ui.chartHistoryWeek === null && state.ui.chartHistorySnapshot === null) return;
  state.ui.chartHistoryWeek = null;
  state.ui.chartHistorySnapshot = null;
  saveToActiveSlot();
  if (render && $("chartList")) {
    renderCharts();
  }
}

async function applyChartHistoryWeek(week, chartKey) {
  if (!week || week < 1) return;
  const currentWeek = weekIndex() + 1;
  if (week > currentWeek) {
    logEvent(`Charts are only available through Week ${currentWeek}.`, "warn");
    return;
  }
  const requestId = chartHistoryRequestId + 1;
  chartHistoryRequestId = requestId;
  const scope = chartScopeKey(chartKey);
  const snapshot = await fetchChartSnapshot(scope, week);
  if (requestId !== chartHistoryRequestId) return;
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
  if (scopeEl) scopeEl.textContent = `Scope: ${scopeLabel}`;
  if (!list) return;
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
  if (!root) return;
  const store = ensureViewPanelState(route, root);
  root.querySelectorAll(".panel.card").forEach((panel) => {
    const key = panelKey(panel);
    if (!key) return;
    const entry = store[route]?.[key] || { state: VIEW_PANEL_STATES.open };
    const normalized = normalizeViewPanelState(entry.state);
    entry.state = normalized;
    const isHidden = normalized === VIEW_PANEL_STATES.hidden;
    panel.dataset.state = normalized;
    panel.style.width = entry.width || "";
    panel.style.height = entry.height || "";
    panel.hidden = isHidden;
    panel.classList.remove("panel--mini");
    panel.classList.toggle("panel--hidden", isHidden);
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
  if (!key) return;
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
  if (!panel || panel.hidden) return null;
  const rect = panel.getBoundingClientRect();
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.round(rect.height)
  };
}

function clampPanelRect(panel) {
  if (!panel || panel.hidden) return;
  const parent = panel.parentElement;
  if (!parent) return;
  const parentRect = parent.getBoundingClientRect();
  const maxWidth = Math.max(220, parentRect.width - 12);
  const maxHeight = Math.max(120, parentRect.height - 12);
  const width = parseFloat(panel.style.width) || 0;
  const height = parseFloat(panel.style.height) || 0;
  if (width > 0) panel.style.width = `${clamp(width, 220, maxWidth)}px`;
  if (height > 0) panel.style.height = `${clamp(height, 120, maxHeight)}px`;
}

function clampAllPanels() {
  document.querySelectorAll(".panel.card").forEach((panel) => clampPanelRect(panel));
}

function logPanelTransition(route, key, prevState, nextState, rectBefore, rectAfter) {
  if (prevState === nextState) return;
  let eventType = "panel.state";
  if (nextState === VIEW_PANEL_STATES.hidden) eventType = "panel.hide";
  if (nextState === VIEW_PANEL_STATES.open && prevState === VIEW_PANEL_STATES.hidden) eventType = "panel.show";
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
  if (!panel) return;
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
  if (!root) return;
  const side = root.querySelector(".view-side");
  if (!side) return;
  const hasVisible = Array.from(side.querySelectorAll(".panel.card")).some((panel) => !panel.hidden);
  root.classList.toggle("view--single", !hasVisible);
}


function updateRoute(route) {
  const next = ROUTES.includes(route) ? route : DEFAULT_ROUTE;
  if (activeRoute === next && hasMountedRoute) return;
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
  if (!appRoot) return;
  appRoot.innerHTML = "";
  const template = document.getElementById(`view-${route}`);
  if (!template) return;
  const fragment = template.content.cloneNode(true);
  appRoot.appendChild(fragment);
  const root = appRoot.querySelector(".view");
  if (root) root.dataset.view = route;
  ensureSlotDropdowns();
  updateSlotDropdowns();
  applyPanelStates(route, root);
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
  if (!panel) return false;
  if (panel.classList.contains("panel-hidden")) return false;
  const state = panel.dataset.state || PANEL_STATES.open;
  return state !== PANEL_STATES.collapsed;
}

function ensureMainSurface() {
  const center = document.querySelector(".center");
  if (!center) return;
  MAIN_SURFACES.forEach((key) => {
    const panel = panelByKey(key);
    if (panel) panel.classList.remove("panel--surface");
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
    if (!panel || panel === surface) return;
    if (panel.classList.contains("panel--expanded")) return;
    const dock = panel.dataset.origDock || "footer";
    const target = document.querySelector(`.${dock}`) || document.querySelector(".footer");
    if (target && !target.contains(panel)) {
      target.appendChild(panel);
      panel.dataset.dock = dock;
    }
  });
  if (!surface) return;
  if (!center.contains(surface)) {
    center.appendChild(surface);
    surface.dataset.dock = "center";
  }
  surface.classList.add("panel--surface");
}

function syncSideColumns() {
  const app = document.querySelector(".app");
  if (!app) return;
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
  if (side !== "left" && side !== "right") return;
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
    } else {
      panel.insertBefore(head, panel.firstChild);
    }
  }
  return head;
}

function addPanelActions(panel) {
  const head = ensurePanelHeader(panel);
  if (head.querySelector(".panel-actions")) return;
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
  if (focusBtn) focusBtn.disabled = state === PANEL_STATES.expanded;
  if (collapseBtn) {
    collapseBtn.textContent = state === PANEL_STATES.collapsed ? "Show" : "Hide";
  }
}

function syncFocusCount() {
  const focus = document.querySelector(".center");
  if (focus) focus.dataset.expandedCount = String(expandedPanels.length);
}

function expandPanel(panel) {
  if (panel.classList.contains("panel-fixed")) return;
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
  if (!focus) return;
  if (expandedPanels.length >= 2) {
    minimizePanel(expandedPanels[0]);
  }
  if (!panel.dataset.origDock) {
    const parent = panel.parentElement;
    if (parent && parent.classList.contains("left")) panel.dataset.origDock = "left";
    if (parent && parent.classList.contains("right")) panel.dataset.origDock = "right";
    if (parent && parent.classList.contains("footer")) panel.dataset.origDock = "footer";
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
  if (panel.classList.contains("panel-fixed")) return;
  const dock = panel.dataset.origDock || "footer";
  const target = document.querySelector(`.${dock}`) || document.querySelector(".footer");
  if (target) target.appendChild(panel);
  panel.dataset.dock = dock;
  setPanelState(panel, PANEL_STATES.open);
  setPanelVisibility(panel, true);
  savePanelLayout();
  syncLayoutState();
}

function minimizePanel(panel) {
  if (panel.dataset.state === PANEL_STATES.open) return;
  restorePanel(panel);
  const idx = expandedPanels.indexOf(panel);
  if (idx >= 0) expandedPanels.splice(idx, 1);
  syncFocusCount();
}

function collapsePanel(panel) {
  if (panel.classList.contains("panel-fixed")) return;
  if (panel.dataset.state === PANEL_STATES.collapsed) return;
  const dock = panel.dataset.origDock || "footer";
  const target = document.querySelector(`.${dock}`) || document.querySelector(".footer");
  if (target) target.appendChild(panel);
  panel.dataset.dock = dock;
  setPanelState(panel, PANEL_STATES.collapsed);
  setPanelVisibility(panel, false);
  resetPanelSizing(panel);
  const idx = expandedPanels.indexOf(panel);
  if (idx >= 0) expandedPanels.splice(idx, 1);
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
      if (parent && parent.classList.contains("left")) panel.dataset.origDock = "left";
      if (parent && parent.classList.contains("right")) panel.dataset.origDock = "right";
      if (parent && parent.classList.contains("footer")) panel.dataset.origDock = "footer";
      if (parent && parent.classList.contains("center")) panel.dataset.origDock = "center";
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
  return title === "Gameplay Screen: Charts" || title === "Create Track" || title === "Release Desk";
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

function bindGlobalHandlers() {
  const on = (id, event, handler) => {
    const el = $(id);
    if (el) el.addEventListener(event, handler);
  };

  on("pauseBtn", "click", () => { setTimeSpeed("pause"); });
  on("playBtn", "click", () => { setTimeSpeed("play"); });
  on("fastBtn", "click", () => { setTimeSpeed("fast"); });
  on("skipDayBtn", "click", () => { advanceHours(24); });
  on("skipWeekBtn", "click", () => { advanceHours(WEEK_HOURS); });
  on("skipTimeBtn", "click", () => {
    const now = new Date(state.time.epochMs);
    if ($("skipDateInput")) $("skipDateInput").value = now.toISOString().slice(0, 10);
    if ($("skipTimeInput")) $("skipTimeInput").value = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`;
    openOverlay("skipTimeModal");
  });

  on("menuBtn", "click", () => {
    openMainMenu();
    updateTimeControlButtons();
    syncTimeControlAria();
  });
  on("panelMenuBtn", "click", () => {
    renderPanelMenu();
    openOverlay("panelMenu");
  });
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
    if (!session.activeSlot) return;
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

  on("skipTimeClose", "click", () => closeOverlay("skipTimeModal"));
  on("skip24hBtn", "click", () => { runTimeJump(24, "Skipping 24 hours"); closeOverlay("skipTimeModal"); });
  on("skip7dBtn", "click", () => { runTimeJump(7 * 24, "Skipping 7 days"); closeOverlay("skipTimeModal"); });
  on("skip14dBtn", "click", () => { runTimeJump(14 * 24, "Skipping 14 days"); closeOverlay("skipTimeModal"); });
  on("skip28dBtn", "click", () => { runTimeJump(28 * 24, "Skipping 28 days"); closeOverlay("skipTimeModal"); });
  on("skipCustomBtn", "click", () => {
    const days = Number($("skipDaysInput").value || 0);
    const hours = Number($("skipHoursInput").value || 0);
    const total = Math.max(0, days * 24 + hours);
    if (total > 0) runTimeJump(total, `Skipping ${formatCount(total)} hours`);
    closeOverlay("skipTimeModal");
  });
  on("skipToDateBtn", "click", () => {
    const date = $("skipDateInput").value;
    const time = $("skipTimeInput").value || "00:00";
    if (!date) return;
    const target = new Date(`${date}T${time}:00Z`).getTime();
    const diffMs = target - state.time.epochMs;
    if (diffMs <= 0) {
      logEvent("Cannot skip to the past. Choose a future date.", "warn");
      return;
    }
    const hours = Math.floor(diffMs / HOUR_MS);
    if (hours > 0) runTimeJump(hours, "Skipping to target date");
    closeOverlay("skipTimeModal");
  });

  on("quickRecipesBtn", "click", () => {
    renderQuickRecipes();
    openOverlay("quickRecipesModal");
  });
  on("quickRecipesClose", "click", () => closeOverlay("quickRecipesModal"));
  on("calendarClose", "click", () => closeOverlay("calendarModal"));
  const refreshCalendar = () => {
    renderCalendarList("calendarList", 4);
    renderCalendarList("calendarFullList", 12);
  };
  document.querySelectorAll("[data-calendar-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.calendarTab;
      if (!tab) return;
      state.ui.calendarTab = tab;
      refreshCalendar();
      saveToActiveSlot();
    });
  });
  document.querySelectorAll("[data-calendar-filter]").forEach((input) => {
    input.addEventListener("change", (e) => {
      const key = e.target.dataset.calendarFilter;
      if (!key) return;
      state.ui.calendarFilters[key] = e.target.checked;
      refreshCalendar();
      saveToActiveSlot();
    });
  });
  on("chartHistoryClose", "click", () => closeOverlay("chartHistoryModal"));
  on("chartHistoryLatest", "click", () => {
    resetChartHistoryView();
    closeOverlay("chartHistoryModal");
  });
  on("walletClose", "click", () => closeOverlay("walletModal"));
  on("endClose", "click", () => closeOverlay("endModal"));
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
      if (!btn) return;
      const role = btn.dataset.assignRole;
      const id = btn.dataset.assignId;
      if (role === "Songwriter") state.ui.trackSlots.songwriterId = id;
      if (role === "Performer") state.ui.trackSlots.performerId = id;
      if (role === "Producer") state.ui.trackSlots.producerId = id;
      renderSlots();
      saveToActiveSlot();
    });
  }
  const eraStatus = $("eraStatus");
  if (eraStatus) {
    eraStatus.addEventListener("click", (e) => {
      const focusBtn = e.target.closest("[data-era-focus]");
      if (focusBtn) {
        const eraId = focusBtn.dataset.eraFocus;
        if (!eraId) return;
        const nextFocus = state.ui.focusEraId === eraId ? null : eraId;
        setFocusEraById(nextFocus);
        logUiEvent("action_submit", { action: "focus_era", eraId: nextFocus });
        renderAll();
        return;
      }
      const btn = e.target.closest("[data-era-end]");
      if (!btn) return;
      const eraId = btn.dataset.eraEnd;
      if (!eraId) return;
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
    if (!state.ui.focusEraId) return;
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
      if (!toggleBtn) return;
      const key = toggleBtn.dataset.panelToggle;
      if (!key) return;
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
    slotList.addEventListener("click", (e) => {
      const card = e.target.closest(".slot-card");
      if (!card) return;
      const slot = Number(card.dataset.slotIndex);
      if (!slot) return;
      const hasData = card.dataset.slotHasData === "1";
      const actionBtn = e.target.closest("[data-slot-action]");
      if (actionBtn && actionBtn.disabled) return;
      const action = actionBtn?.dataset.slotAction || card.dataset.slotDefault;
      if (!action) return;
      if (action === "delete") {
        const ok = confirm(`Delete Game Slot ${slot}? This cannot be undone.`);
        if (!ok) return;
        deleteSlot(slot);
        renderMainMenu();
        return;
      }
      if (action === "continue") {
        if (!hasData) {
          logEvent("No saved game in this slot. Create a new label first.", "warn");
          return;
        }
        loadSlot(slot, false);
        exitMenuToGame();
        return;
      }
      if (action === "new") {
        const ok = !hasData || confirm(`Overwrite Game Slot ${slot} with a new game?`);
        if (!ok) return;
        loadSlot(slot, true);
        exitMenuToGame();
      }
    });
  }

  document.addEventListener("click", (e) => {
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
    if (!item || !e.dataTransfer) return;
    const payload = { type: item.dataset.entityType, id: item.dataset.entityId };
    e.dataTransfer.setData("text/plain", JSON.stringify(payload));
  });

  document.addEventListener("dragover", (e) => {
    const slot = e.target.closest(".id-slot");
    if (!slot) return;
    e.preventDefault();
  });

  document.addEventListener("drop", (e) => {
    const slot = e.target.closest(".id-slot");
    if (!slot) return;
    e.preventDefault();
    try {
      const payload = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (!payload) return;
      assignToSlot(slot.dataset.slotTarget, payload.type, payload.id);
    } catch {
      logEvent("Drop failed: invalid ID payload.", "warn");
    }
  });

  const mainMenu = $("mainMenu");
  if (mainMenu) {
    mainMenu.addEventListener("click", (e) => {
      if (e.target !== mainMenu) return;
      if (!session.activeSlot) return;
      closeMainMenu();
    });
  }

  document.addEventListener("keydown", (e) => {
    const active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.isContentEditable)) return;
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
      if (!btn) return;
      const week = Number(btn.dataset.chartWeek || 0);
      if (!week) return;
      const chartKey = state.ui.activeChart || "global";
      applyChartHistoryWeek(week, chartKey).then(() => {
        closeOverlay("chartHistoryModal");
      });
    });
  }
}

function bindViewHandlers(route, root) {
  if (!root) return;
  const on = (id, event, handler) => {
    const el = root.querySelector(`#${id}`);
    if (el) el.addEventListener(event, handler);
  };

  root.addEventListener("click", (e) => {
    const action = e.target.closest("[data-panel-action]");
    if (!action) return;
    const panel = action.closest(".panel.card");
    if (!panel) return;
    const key = panelKey(panel);
    if (!key) return;
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
      if (!tab) return;
      chartTabs.querySelectorAll(".tab").forEach((btn) => btn.classList.remove("active"));
      tab.classList.add("active");
      state.ui.activeChart = tab.dataset.chart;
      if (state.ui.chartHistoryWeek) {
        applyChartHistoryWeek(state.ui.chartHistoryWeek, state.ui.activeChart);
      } else {
        renderCharts();
      }
    });
  }

  if (route === "charts") {
    root.addEventListener("click", (e) => {
      if (!state.ui.chartHistoryWeek) return;
      const chartPanel = root.querySelector(".panel.card[data-panel=\"charts\"]");
      if (!chartPanel || chartPanel.contains(e.target)) return;
      resetChartHistoryView();
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
  on("themeSelect", "change", () => {
    updateGenrePreview();
    updateTrackRecommendation();
  });
  on("moodSelect", "change", () => {
    updateGenrePreview();
    updateTrackRecommendation();
  });
  on("trackRecommendApply", "click", applyTrackRecommendation);
  on("autoAssignBtn", "click", autoAssignCreators);
  on("startTrackBtn", "click", startTrackFromUI);

  on("genreThemeFilter", "change", (e) => {
    state.ui.genreTheme = e.target.value;
    renderGenreIndex();
  });
  on("genreMoodFilter", "change", (e) => {
    state.ui.genreMood = e.target.value;
    renderGenreIndex();
  });

  const readyList = root.querySelector("#readyList");
  if (readyList) readyList.addEventListener("click", handleReleaseAction);
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
    logEvent(state.meta.autoRollout.enabled ? "Auto-rollout enabled (rules pending)." : "Auto-rollout disabled.");
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
    logEvent("Talent market refreshed.");
    renderAll();
  });

  const marketList = root.querySelector("#marketList");
  if (marketList) {
    marketList.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-sign]");
      if (!btn) return;
      signCreatorById(btn.dataset.sign);
    });
  }

  const actList = root.querySelector("#actList");
  if (actList) {
    actList.addEventListener("click", (e) => {
      const useBtn = e.target.closest("button[data-act-set]");
      if (useBtn) {
        const act = getAct(useBtn.dataset.actSet);
        if (!act) return;
        const target = state.ui.slotTarget || "track-act";
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
        if (!input) return;
        renameActById(actId, input.value);
      }
    });
    actList.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const input = e.target.closest("input[data-act-input]");
      if (!input) return;
      renameActById(input.dataset.actInput, input.value);
    });
  }

  on("quickActBtn", "click", createQuickAct);
  on("createActBtn", "click", createActFromUI);
  on("actTypeSelect", "change", updateActMemberFields);

  on("renameLabelBtn", "click", renameLabelFromUI);
  on("labelNameInput", "keydown", (e) => {
    if (e.key === "Enter") renameLabelFromUI();
  });
  on("labelNameRandom", "click", () => {
    $("labelNameInput").value = makeLabelName();
  });
  on("actNameRandom", "click", () => {
    $("actName").value = makeActName();
  });
  on("labelAlignment", "change", (e) => {
    state.label.alignment = e.target.value;
    if ($("trackAlignment")) $("trackAlignment").value = e.target.value;
    if ($("actAlignmentSelect")) $("actAlignmentSelect").value = e.target.value;
    logEvent(`Label alignment set to ${state.label.alignment}.`);
    renderStats();
  });

  on("eraNameRandom", "click", () => {
    const act = getAct(state.ui.eraSlots.actId) || getAct(state.ui.trackSlots.actId);
    $("eraNameInput").value = makeEraName(act ? act.name : makeActName());
  });
  on("startEraBtn", "click", startEraFromUI);
  on("endEraBtn", "click", endEraFromUI);

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
    if (!file) return;
    if (!session.activeSlot) {
      logEvent("Select a slot before loading a file.", "warn");
      return;
    }
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      resetState(parsed);
      refreshSelectOptions();
      computeCharts();
      renderAll();
      saveToActiveSlot();
      logEvent(`Loaded save file into Slot ${session.activeSlot}.`);
    } catch {
      logEvent("Failed to load save file.", "warn");
    }
  });

  const creatorList = root.querySelector("#creatorList");
  if (creatorList) {
    creatorList.addEventListener("click", (e) => {
      const item = e.target.closest("[data-entity-type=\"creator\"]");
      if (!item) return;
      const target = state.ui.slotTarget;
      if (!target) {
        logEvent("Select an ID slot, then tap a Creator ID.", "warn");
        return;
      }
      assignToSlot(target, "creator", item.dataset.entityId);
    });
  }

  const trackList = root.querySelector("#trackList");
  if (trackList) {
    trackList.addEventListener("click", (e) => {
      const item = e.target.closest("[data-entity-type=\"track\"]");
      if (!item) return;
      const target = state.ui.slotTarget;
      if (!target) {
        logEvent("Select an ID slot, then tap a Track ID.", "warn");
        return;
      }
      assignToSlot(target, "track", item.dataset.entityId);
    });
  }

  on("promoteIconBtn", "click", () => logEvent("Campaign console opened from Comms."));
  on("eyeriSocialBtn", "click", () => logEvent("eyeriSocial post drafted."));

  on("communitiesAreas", "click", () => openOverlay("communitiesModal"));
  on("communitiesCreators", "click", () => openOverlay("communitiesModal"));
  on("communitiesItems", "click", () => openOverlay("communitiesModal"));
  on("communitiesCollabs", "click", () => openOverlay("communitiesModal"));
  on("hubAreas", "click", () => openOverlay("harmonyModal"));
  on("hubCreators", "click", () => openOverlay("harmonyModal"));
  on("hubItems", "click", () => openOverlay("harmonyModal"));
  on("hubCollabs", "click", () => openOverlay("harmonyModal"));

  on("calendarBtn", "click", () => {
    renderCalendarList("calendarFullList", 12);
    openOverlay("calendarModal");
  });

  on("socialShowInternal", "change", (e) => {
    state.ui.socialShowInternal = e.target.checked;
    renderSocialFeed();
    saveToActiveSlot();
  });

  root.querySelectorAll("[data-social-filter]").forEach((input) => {
    input.addEventListener("change", (e) => {
      const key = e.target.dataset.socialFilter;
      if (!key) return;
      state.ui.socialFilters[key] = e.target.checked;
      renderSocialFeed();
      saveToActiveSlot();
    });
  });

  on("postTemplateBtn", "click", () => {
    const sel = $("templateSelect");
    if (!sel) return;
    const id = sel.value;
    if (!id) {
      logEvent("No template selected.", "warn");
      return;
    }
    const buildReleaseVars = () => {
      const selectedId = state.ui.socialSlots.trackId;
      let track = selectedId ? getTrack(selectedId) : null;
      if (!track && state.releaseQueue.length) {
        const next = [...state.releaseQueue].sort((a, b) => a.releaseAt - b.releaseAt)[0];
        if (next) track = getTrack(next.trackId);
      }
      if (!track) {
        const released = [...state.tracks].filter((item) => item.releasedAt).sort((a, b) => b.releasedAt - a.releasedAt)[0];
        if (released) track = released;
      }
      if (!track) return {};
      const act = getAct(track.actId);
      const scheduled = state.releaseQueue.find((entry) => entry.trackId === track.id);
      const releaseDate = scheduled ? formatDate(scheduled.releaseAt) : track.releasedAt ? formatDate(track.releasedAt) : "TBD";
      return {
        trackTitle: track.title,
        actName: act ? act.name : "Unknown Act",
        channel: track.distribution || "Digital",
        releaseDate,
        handle: handleFromName(state.label.name, "Label")
      };
    };
    if (typeof postFromTemplate === "function") {
      const vars = id === "releaseAnnouncement" || id === "releaseSchedule" || id === "futurePlans"
        ? buildReleaseVars()
        : {};
      postFromTemplate(id, vars);
      logEvent(`Posted template: ${id}.`);
      renderSocialFeed();
      saveToActiveSlot();
    } else {
      logEvent("Template posting not available.", "warn");
    }
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
  logUiEvent("export_debug", { ui_events: log.length, sim_events: eventLog.length });
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
  if (panel.closest(".panel-tray")) return "tray";
  if (panel.closest(".left")) return "left";
  if (panel.closest(".right")) return "right";
  if (panel.closest(".center")) return "center";
  if (panel.closest(".footer")) return "footer";
  return panel.dataset.origDock || "footer";
}

function setPanelOrder(container, panel, index) {
  const children = Array.from(container.children);
  if (index >= 0 && index < children.length) {
    container.insertBefore(panel, children[index]);
  } else {
    container.appendChild(panel);
  }
}

function savePanelLayout() {
  if (isRestoringLayout) return;
  const layout = {};
  document.querySelectorAll(".panel.card").forEach((panel) => {
    const key = panelKey(panel);
    if (!key) return;
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
  if (!raw) return false;
  let layout = null;
  try {
    layout = JSON.parse(raw);
  } catch {
    return false;
  }
  if (!layout) return false;
  isRestoringLayout = true;
  Object.entries(layout).forEach(([key, entry]) => {
    const panel = document.querySelector(`.panel.card[data-panel="${key}"]`);
    if (!panel) return;
    setPanelVisibility(panel, !entry.hidden);
    panel.style.width = entry.width || "";
    panel.style.height = entry.height || "";
    panel.style.marginLeft = entry.marginLeft || "";
    panel.style.marginTop = entry.marginTop || "";
    const state = normalizePanelState(entry.state || PANEL_STATES.open);
    if (state === PANEL_STATES.collapsed) {
      const dock = entry.dock || panel.dataset.origDock || "footer";
      const target = document.querySelector(`.${dock}`) || document.querySelector(".footer");
      if (target) setPanelOrder(target, panel, entry.order);
      setPanelState(panel, PANEL_STATES.collapsed);
      setPanelVisibility(panel, false);
    } else if (state === PANEL_STATES.expanded) {
      const center = document.querySelector(".center");
      if (center) setPanelOrder(center, panel, entry.order);
      setPanelState(panel, PANEL_STATES.expanded);
    } else {
      const container = document.querySelector(`.${entry.dock}`) || document.querySelector(".footer");
      if (container) setPanelOrder(container, panel, entry.order);
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
  if (!target) return;
  const rec = recommendTrackPlan();
  const act = rec.actId ? getAct(rec.actId) : null;
  const writer = rec.songwriterId ? getCreator(rec.songwriterId) : null;
  const performer = rec.performerId ? getCreator(rec.performerId) : null;
  const producer = rec.producerId ? getCreator(rec.producerId) : null;
  const modifier = getModifier(rec.modifierId);
  target.innerHTML = `
    <div class="muted">Recommended: ${act ? act.name : "Assign an Act"} | ${rec.theme} / ${rec.mood}</div>
    <div class="muted">Songwriter ${writer ? writer.name : "Unassigned"} • Performer ${performer ? performer.name : "Unassigned"} • Producer ${producer ? producer.name : "Unassigned"}</div>
    <div class="muted">Modifier ${modifier?.label || "None"} • Project ${rec.projectType}</div>
    <div class="tiny">${rec.reasons}</div>
  `;
}

function applyTrackRecommendation() {
  const rec = recommendTrackPlan();
  if (rec.actId) state.ui.trackSlots.actId = rec.actId;
  if (rec.songwriterId) state.ui.trackSlots.songwriterId = rec.songwriterId;
  if (rec.performerId) state.ui.trackSlots.performerId = rec.performerId;
  if (rec.producerId) state.ui.trackSlots.producerId = rec.producerId;
  if ($("themeSelect")) $("themeSelect").value = rec.theme;
  if ($("moodSelect")) $("moodSelect").value = rec.mood;
  if ($("modifierSelect")) $("modifierSelect").value = rec.modifierId;
  if ($("projectTypeSelect")) $("projectTypeSelect").value = rec.projectType;
  renderSlots();
  saveToActiveSlot();
  updateGenrePreview();
  updateTrackRecommendation();
}

function updateRecommendations() {
  updateTrackRecommendation();
}

window.updateRecommendations = updateRecommendations;

function ensureSlotDropdowns() {
  document.querySelectorAll(".id-slot").forEach((slot) => {
    if (slot.querySelector(".slot-select")) return;
    const select = document.createElement("select");
    select.className = "slot-select";
    select.setAttribute("aria-label", "Select slot value");
    select.addEventListener("click", (e) => e.stopPropagation());
    select.addEventListener("change", () => {
      const target = slot.dataset.slotTarget;
      const type = slot.dataset.slotType;
      const value = select.value;
      if (!target || !type) return;
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
    if (!select) return;
    const target = slot.dataset.slotTarget;
    const type = slot.dataset.slotType;
    const role = slot.dataset.slotRole;
    let currentValue = "";
    if (target === "act-lead") currentValue = state.ui.actSlots.lead || "";
    if (target === "act-member2") currentValue = state.ui.actSlots.member2 || "";
    if (target === "act-member3") currentValue = state.ui.actSlots.member3 || "";
    if (target === "track-act") currentValue = state.ui.trackSlots.actId || "";
    if (target === "track-writer") currentValue = state.ui.trackSlots.songwriterId || "";
    if (target === "track-performer") currentValue = state.ui.trackSlots.performerId || "";
    if (target === "track-producer") currentValue = state.ui.trackSlots.producerId || "";
    if (target === "era-act") currentValue = state.ui.eraSlots.actId || "";
    if (target === "promo-track") currentValue = state.ui.promoSlots.trackId || "";
    if (target === "social-track") currentValue = state.ui.socialSlots.trackId || "";

    const options = [{ value: "", label: "Unassigned" }];
    if (type === "creator") {
      const creators = state.creators.filter((creator) => !role || creator.role === role);
      creators.forEach((creator) => {
        options.push({ value: creator.id, label: `${creator.name} (${creator.role})` });
      });
    } else if (type === "act") {
      state.acts.forEach((act) => {
        options.push({ value: act.id, label: act.name });
      });
    } else if (type === "track") {
      const tracks = target === "promo-track"
        ? state.tracks.filter((track) => track.status === "Released")
        : state.tracks;
      tracks.forEach((track) => {
        options.push({ value: track.id, label: `${track.title} (${track.status})` });
      });
    }

    select.innerHTML = "";
    options.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt.value;
      option.textContent = opt.label;
      select.appendChild(option);
    });
    select.value = currentValue;
    select.disabled = slot.classList.contains("disabled");
  });
}

window.updateSlotDropdowns = updateSlotDropdowns;

function ensureSocialDetailModal() {
  if ($("socialDetailModal")) return;
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
      if (!item) return;
      const id = item.dataset.postId;
      if (!id) return;
      const detail = resolveSocialDetail(id);
      if (!detail) return;
      const meta = $("socialDetailMeta");
      const content = $("socialDetailContent");
      if (meta) meta.textContent = `${detail.handle} | ${formatDate(detail.ts)} | ${detail.type}`;
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
    if (!entry) return null;
    return { ts: entry.ts, handle: "@System", type: "system", text: entry.text, lines: [] };
  }
  const post = (state.social?.posts || []).find((entry) => entry.id === id);
  if (!post) return null;
  return post;
}

function renderPanelMenu() {
  const list = $("panelMenuList");
  if (!list) return;
  const root = document.querySelector(".view");
  if (!root) return;
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
  if (!focus) return;
  focus.addEventListener("pointerdown", (e) => {
    if (e.target !== focus) return;
    expandedPanels.slice().forEach((panel) => minimizePanel(panel));
  });
}

function autoAssignCreators() {
  renderAutoAssignModal();
  openOverlay("autoAssignModal");
}

function assignBestCandidates() {
  const pickBest = (role) => rankCandidates(role)[0]?.id || null;
  state.ui.trackSlots.songwriterId = pickBest("Songwriter");
  state.ui.trackSlots.performerId = pickBest("Performer");
  state.ui.trackSlots.producerId = pickBest("Producer");
  renderSlots();
  saveToActiveSlot();
}

function renameLabelFromUI() {
  const name = $("labelNameInput").value.trim();
  if (!name) {
    logEvent("Label name cannot be empty.", "warn");
    $("labelNameInput").value = state.label.name;
    return;
  }
  if (name === state.label.name) return;
  state.label.name = name;
  state.marketTracks.forEach((track) => {
    if (track.isPlayer) track.label = state.label.name;
  });
  $("labelNameInput").value = state.label.name;
  logEvent(`Label renamed to "${state.label.name}".`);
  renderStats();
  saveToActiveSlot();
}

  function startTrackFromUI() {
    const title = $("trackTitle").value.trim() || makeTrackTitle($("themeSelect").value, $("moodSelect").value);
    const projectName = $("projectName").value.trim() || makeProjectTitle();
    const projectType = $("projectTypeSelect") ? $("projectTypeSelect").value : "Single";
    const theme = $("themeSelect").value;
    const mood = $("moodSelect").value;
    const alignment = $("trackAlignment").value;
    const modifierId = $("modifierSelect").value;
    const modifier = getModifier(modifierId);
    const actId = state.ui.trackSlots.actId;
    const songwriterId = state.ui.trackSlots.songwriterId;
    const performerId = state.ui.trackSlots.performerId;
    const producerId = state.ui.trackSlots.producerId;
  if (!actId) {
    logEvent("Cannot start track: no Act selected.", "warn");
    return;
  }
  if (!songwriterId || !performerId || !producerId) {
    logEvent("Cannot start track: missing creator assignment.", "warn");
    return;
  }
    const availableStudios = getStudioAvailableSlots();
    if (availableStudios <= 0) {
      logEvent("No studio slots available. Finish a production or expand capacity first.", "warn");
      return;
    }
    const baseCost = STAGES.reduce((sum, stage) => sum + stage.cost, 0);
    const cost = Math.max(0, baseCost + (modifier?.costDelta || 0));
    if (state.label.cash < cost) {
      logEvent("Not enough cash to start a new track.", "warn");
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
    state.label.cash -= cost;
    const track = createTrack({
      title,
      theme,
      mood,
      alignment,
      songwriterId,
      performerId,
      producerId,
      actId,
      projectName,
      projectType,
      modifierId
    });
    logChoice("startTrack", {
      trackId: track.id,
      actId,
      theme,
      mood,
      songwriterId,
      performerId,
      producerId,
      modifierId,
      projectName,
      projectType
    });
    logUiEvent("action_submit", {
      action: "start_track",
      trackId: track.id,
      actId,
      theme,
      mood,
      projectType
    });
    logEvent(`Started "${track.title}" (${track.genre}).`);
    $("trackTitle").value = "";
    $("projectName").value = "";
    if ($("projectTypeSelect")) $("projectTypeSelect").value = "Single";
  renderAll();
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
    if (member2) members.push(member2);
    if (member3) members.push(member3);
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

function renameActById(actId, nextName) {
  const act = getAct(actId);
  if (!act) return;
  const name = nextName.trim();
  if (!name) {
    logEvent("Act name cannot be empty.", "warn");
    renderActs();
    return;
  }
  if (act.name === name) return;
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
    logEvent("Select a focus era before picking a campaign track.", "warn");
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
  logEvent(`Campaign slot set to "${picked.title}".`);
  renderSlots();
  renderTracks();
  saveToActiveSlot();
}

function runPromotion() {
  const trackId = state.ui.promoSlots.trackId;
  const budget = Number($("promoBudget").value);
  if (!trackId) {
    logEvent("No released track selected for campaign.", "warn");
    return;
  }
  if (budget <= 0 || Number.isNaN(budget)) {
    logEvent("Campaign budget must be greater than 0.", "warn");
    return;
  }
  if (state.label.cash < budget) {
    logEvent("Not enough cash for campaign.", "warn");
    return;
  }
  const track = getTrack(trackId);
  if (!track || track.status !== "Released" || !track.marketId) {
    logEvent("Track is not active on the market.", "warn");
    return;
  }
  const market = state.marketTracks.find((entry) => entry.id === track.marketId);
  if (!market) return;
  state.label.cash -= budget;
  const boostWeeks = clamp(Math.floor(budget / 1200) + 1, 1, 4);
  market.promoWeeks = Math.max(market.promoWeeks, boostWeeks);
  state.meta.promoRuns = (state.meta.promoRuns || 0) + 1;
  logUiEvent("action_submit", { action: "promotion", trackId, budget, weeks: boostWeeks });
  logEvent(`Campaign run for "${track.title}" (+${boostWeeks} weeks).`);
  renderAll();
}

function handleReleaseAction(e) {
  const btn = e.target.closest("button[data-release]");
  if (!btn) return;
  const track = getTrack(btn.dataset.track);
  if (!track) return;
  const rec = recommendReleasePlan(track);
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
      releaseTrack(track, distribution, distribution);
    } else {
      scheduleRelease(track, rec.scheduleHours, distribution);
    }
  }
  if (btn.dataset.release === "now") {
    scheduleHours = 0;
    releaseTrack(track, distribution, distribution);
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
  const index = state.marketCreators.findIndex((c) => c.id === id);
  if (index === -1) return;
  const cost = state.marketCreators[index].signCost || 0;
  if (state.label.cash < cost) {
    logEvent("Not enough cash to sign this creator.", "warn");
    return;
  }
  const creator = state.marketCreators.splice(index, 1)[0];
  state.label.cash -= cost;
  creator.signCost = undefined;
  state.creators.push(normalizeCreator(creator));
  logUiEvent("action_submit", { action: "sign_creator", creatorId: creator.id, role: creator.role });
  logEvent(`Signed ${creator.name} (${creator.role}).`);
  postCreatorSigned(creator);
  renderCreators();
  renderSlots();
  renderAll();
}

export function initUI() {
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
    const data = getSlotData(stored);
    if (data) {
      resetState(data);
      refreshSelectOptions();
      computeCharts();
      renderAll();
      closeMainMenu();
      startGameLoop();
      return;
    }
  }
  openMainMenu();
}

function setupPanelControls() {
  document.querySelectorAll(".panel.card").forEach((panel) => {
    if (panel.querySelector(".panel-toggle-btn")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "panel-toggle-btn ghost mini";
    btn.textContent = "–";
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
    if (panel.classList.contains("panel-fixed")) return;
    if (panel.querySelector(".panel-resizer")) return;
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
            if (newLeft < parentRectNow.left + 8) marginLeft += (parentRectNow.left + 8) - newLeft;
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
          if (dir === "left") panel.style.marginLeft = `${marginLeft}px`;
          if (dir === "top") panel.style.marginTop = `${marginTop}px`;
        };

        const onUp = () => {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
          // after finishing resize, ensure panel placement and reset z-index
          panel.classList.remove('resizing');
          panel.style.zIndex = '';
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
    if (panel.classList.contains("panel--expanded")) return;
    const centerEl = document.querySelector('.center');
    const footerEl = document.querySelector('.footer');
    if (!centerEl || !footerEl || !panel) return;
    const panelRect = panel.getBoundingClientRect();
    const centerRect = centerEl.getBoundingClientRect();
    // If panel extends below the center's bottom by more than 24px, move it.
    if (panelRect.bottom > centerRect.bottom - 24) {
      const parent = panel.parentElement;
      if (parent && parent.classList.contains('footer')) return; // already footer
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
  } catch (err) {
    // fail silently
  }
}

function restorePanelToOrigin(panel) {
  try {
    const orig = panel.dataset.origParent || 'left';
    const target = document.querySelector('.' + orig) || document.querySelector('.left') || document.querySelector('.center') || document.querySelector('.right');
    if (!target) return;
    const idx = Number(panel.dataset.origIndex || -1);
    if (idx >= 0 && idx < target.children.length) {
      target.insertBefore(panel, target.children[idx]);
    } else {
      target.appendChild(panel);
    }
    panel.classList.remove('moved-to-footer');
    const btn = panel.querySelector('.restore-panel-btn');
    if (btn) btn.remove();
    delete panel.dataset.origParent;
    delete panel.dataset.origIndex;
  } catch (err) {
    // ignore
  }
}

function scanAllPanelsForOverflow() {
  try {
    document.querySelectorAll('.panel.card').forEach((panel) => {
      ensurePanelPlacement(panel);
    });
  } catch (e) {}
}

function setupOverlayDismissals() {
  // Close overlays when clicking outside the overlay-card
  document.querySelectorAll('.overlay').forEach((overlay) => {
    overlay.addEventListener('pointerdown', (e) => {
      if (e.target === overlay) {
        const id = overlay.id;
        if (id) closeOverlay(id);
      }
    });
  });
}

function updateTimeControlButtons() {
  const pauseBtn = $("pauseBtn");
  const playBtn = $("playBtn");
  const fastBtn = $("fastBtn");
  if (pauseBtn) pauseBtn.classList.remove("active");
  if (playBtn) playBtn.classList.remove("active");
  if (fastBtn) fastBtn.classList.remove("active");
  if (state.time.speed === "pause" && pauseBtn) pauseBtn.classList.add("active");
  if (state.time.speed === "play" && playBtn) playBtn.classList.add("active");
  if (state.time.speed === "fast" && fastBtn) fastBtn.classList.add("active");
}

// Accessibility: set aria-pressed on time controls
function syncTimeControlAria() {
  const map = { pause: 'pauseBtn', play: 'playBtn', fast: 'fastBtn' };
  Object.keys(map).forEach((k) => {
    const el = $(map[k]);
    if (!el) return;
    el.setAttribute('aria-pressed', state.time.speed === k ? 'true' : 'false');
  });
}

function setSkipProgress(total, current, label) {
  const fill = $("skipProgressFill");
  const meta = $("skipProgressMeta");
  const text = $("skipProgressLabel");
  if (text) text.textContent = label || "Skipping time...";
  if (meta) meta.textContent = `${formatCount(current)} / ${formatCount(total)} hours`;
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
  if (!totalHours || totalHours <= 0) return;
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

  const step = () => {
    if (cancelled) {
      logEvent("Time skip canceled.", "warn");
      closeSkipProgress();
      return;
    }
    const remaining = totalHours - completed;
    const stepHours = Math.min(chunkSize, remaining);
    advanceHours(stepHours);
    completed += stepHours;
    setSkipProgress(totalHours, completed, label);
    if (completed >= totalHours) {
      closeSkipProgress();
      return;
    }
    setTimeout(step, 0);
  };
  setTimeout(step, 0);
}
export default initUI;
