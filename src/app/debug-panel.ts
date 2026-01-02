type DebugStageStatus = "pending" | "active" | "ok" | "warn" | "error";

type DebugStage = {
  id: string;
  label: string;
  status: DebugStageStatus;
  detail: string;
};

const DEFAULT_STAGES: DebugStage[] = [
  { id: "vite", label: "Vite boot", status: "pending", detail: "Starting." },
  { id: "firebase", label: "Firebase init", status: "pending", detail: "Awaiting config." },
  { id: "auth", label: "Auth state", status: "pending", detail: "Waiting for sign-in." },
  { id: "firestore", label: "Firestore", status: "pending", detail: "Waiting for persistence." },
  { id: "save", label: "Save load", status: "pending", detail: "Idle." }
];

const DEBUG_KEY = "__RLS_DEBUG_STATUS__";
const stageMap = new Map<string, DebugStage>();
let panelRoot: HTMLElement | null = null;
let debugEnabled = false;

function getStage(id: string) {
  if (!stageMap.has(id)) {
    const fallback = DEFAULT_STAGES.find((stage) => stage.id === id);
    stageMap.set(id, fallback ? { ...fallback } : { id, label: id, status: "pending", detail: "" });
  }
  return stageMap.get(id)!;
}

function renderStage(stage: DebugStage) {
  if (!panelRoot) return;
  const row = panelRoot.querySelector(`[data-debug-stage="${stage.id}"]`) as HTMLElement | null;
  if (!row) return;
  row.dataset.status = stage.status;
  const detailEl = row.querySelector(".debug-stage-detail");
  if (detailEl) detailEl.textContent = stage.detail || "";
}

function renderPanel() {
  if (!panelRoot) return;
  panelRoot.innerHTML = `
    <div class="debug-panel-title">Boot Health</div>
    <div class="debug-panel-list" role="list"></div>
  `;
  const list = panelRoot.querySelector(".debug-panel-list");
  if (!list) return;
  DEFAULT_STAGES.forEach((stage) => {
    const next = getStage(stage.id);
    const row = document.createElement("div");
    row.className = "debug-stage";
    row.dataset.debugStage = next.id;
    row.dataset.status = next.status;
    row.innerHTML = `
      <div class="debug-stage-label">${next.label}</div>
      <div class="debug-stage-detail">${next.detail}</div>
    `;
    list.appendChild(row);
  });
}

function shouldEnableDebug() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("debug") === "1";
}

export function initDebugPanel() {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (!shouldEnableDebug()) return false;
  if (panelRoot) return true;
  debugEnabled = true;
  panelRoot = document.createElement("div");
  panelRoot.className = "debug-panel";
  panelRoot.setAttribute("role", "status");
  panelRoot.setAttribute("aria-live", "polite");
  (document.body || document.documentElement).appendChild(panelRoot);
  DEFAULT_STAGES.forEach((stage) => getStage(stage.id));
  renderPanel();
  (window as typeof window & { [DEBUG_KEY]?: Map<string, DebugStage> })[DEBUG_KEY] = stageMap;
  return true;
}

export function updateDebugStage(id: string, update: Partial<Pick<DebugStage, "status" | "detail">>) {
  const stage = getStage(id);
  if (update.status) stage.status = update.status;
  if (update.detail !== undefined) stage.detail = update.detail;
  stageMap.set(id, stage);
  if (debugEnabled) renderStage(stage);
}

export function isDebugEnabled() {
  return debugEnabled;
}
