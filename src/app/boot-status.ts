type BootStepStatus = "pending" | "active" | "done" | "error";
type BootStep = { id: string; label: string; detail: string; optional?: boolean };
type BootStepUpdate = { status?: BootStepStatus; label?: string; detail?: string };
type BootStatusController = {
  setSummary: (text: string) => void;
  updateStep: (id: string, update: BootStepUpdate) => void;
  markReady: () => void;
  show: () => void;
};

const BOOT_STATUS_KEY = "__RLS_BOOT_STATUS__";
const DEFAULT_STEPS: BootStep[] = [
  { id: "boot", label: "Boot essentials", detail: "Checking data globals." },
  { id: "ui", label: "UI wiring", detail: "Binding controls and routes." },
  { id: "slot", label: "Save slot", detail: "Scanning for active slot." },
  { id: "charts", label: "Charts", detail: "Computing chart data." },
  { id: "render", label: "Render", detail: "Drawing UI panels." }
];

function buildBootScreen() {
  const screen = document.createElement("div");
  screen.id = "bootScreen";
  screen.className = "boot-screen";
  screen.setAttribute("role", "status");
  screen.setAttribute("aria-live", "polite");
  screen.innerHTML = `
    <div class="boot-card">
      <div class="boot-title">Loading Record Label Simulator</div>
      <div id="bootSummary" class="boot-summary">Starting up...</div>
      <div id="bootSteps" class="boot-steps" role="list"></div>
      <div class="boot-footnote">Tip: reload if the loading screen stalls.</div>
    </div>
  `;
  const host = document.body || document.documentElement;
  host.appendChild(screen);
  return screen;
}

export function initBootStatus(): BootStatusController | null {
  if (typeof window === "undefined" || typeof document === "undefined") return null;
  const existing = (window as typeof window & { __RLS_BOOT_STATUS__?: BootStatusController }).__RLS_BOOT_STATUS__;
  if (existing) return existing;

  const screen = document.getElementById("bootScreen") || buildBootScreen();
  const summaryEl = screen.querySelector("#bootSummary") as HTMLElement | null;
  const stepsEl = screen.querySelector("#bootSteps") as HTMLElement | null;
  if (!stepsEl) return null;

  const stepElements = new Map<string, HTMLElement>();

  const ensureStep = (step: BootStep) => {
    const existingStep = stepElements.get(step.id);
    if (existingStep) return existingStep;
    const item = document.createElement("div");
    item.className = "boot-step";
    item.dataset.step = step.id;
    item.dataset.status = "pending";
    if (step.optional) item.dataset.optional = "true";
    item.innerHTML = `
      <div class="boot-step-body">
        <div class="boot-step-label">${step.label}</div>
        <div class="boot-step-detail">${step.detail}</div>
      </div>
    `;
    stepsEl.appendChild(item);
    stepElements.set(step.id, item);
    return item;
  };

  DEFAULT_STEPS.forEach((step) => ensureStep(step));

  const setSummary = (text: string) => {
    if (summaryEl) summaryEl.textContent = text || "";
  };

  const updateStep = (id: string, update: BootStepUpdate) => {
    if (!id) return;
    const existingStep = stepElements.get(id);
    const fallback = DEFAULT_STEPS.find((step) => step.id === id);
    const step = existingStep
      ? { id, label: existingStep.querySelector(".boot-step-label")?.textContent || id, detail: "" }
      : fallback || { id, label: id, detail: "" };
    const item = existingStep || ensureStep(step as BootStep);
    if (!item) return;
    if (update.status) item.dataset.status = update.status;
    if (update.label) {
      const labelEl = item.querySelector(".boot-step-label");
      if (labelEl) labelEl.textContent = update.label;
    }
    if (update.detail) {
      const detailEl = item.querySelector(".boot-step-detail");
      if (detailEl) detailEl.textContent = update.detail;
    }
  };

  const markReady = () => {
    document.documentElement.dataset.bootReady = "true";
    setSummary("Ready.");
  };

  const show = () => {
    document.documentElement.dataset.bootReady = "false";
  };

  const controller: BootStatusController = {
    setSummary,
    updateStep,
    markReady,
    show
  };
  (window as typeof window & { __RLS_BOOT_STATUS__?: BootStatusController }).__RLS_BOOT_STATUS__ = controller;
  show();
  return controller;
}

export function getBootStatus(): BootStatusController | null {
  if (typeof window === "undefined") return null;
  return (window as typeof window & { __RLS_BOOT_STATUS__?: BootStatusController }).__RLS_BOOT_STATUS__ || null;
}
