const BOOT_STATUS_KEY = "__RLS_BOOT_STATUS__";
const DEFAULT_STEPS = [
    { id: "boot", label: "Boot essentials", detail: "Checking data globals." },
    { id: "ui", label: "UI wiring", detail: "Binding controls and routes." },
    { id: "slot", label: "Save slot", detail: "Scanning for active slot." },
    { id: "charts", label: "Charts", detail: "Computing chart data." },
    { id: "render", label: "Render", detail: "Drawing UI panels." },
    { id: "external", label: "External storage (optional)", detail: "Save folder setup.", optional: true }
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
export function initBootStatus() {
    if (typeof window === "undefined" || typeof document === "undefined")
        return null;
    const existing = window.__RLS_BOOT_STATUS__;
    if (existing)
        return existing;
    const screen = document.getElementById("bootScreen") || buildBootScreen();
    const summaryEl = screen.querySelector("#bootSummary");
    const stepsEl = screen.querySelector("#bootSteps");
    if (!stepsEl)
        return null;
    const stepElements = new Map();
    const ensureStep = (step) => {
        const existingStep = stepElements.get(step.id);
        if (existingStep)
            return existingStep;
        const item = document.createElement("div");
        item.className = "boot-step";
        item.dataset.step = step.id;
        item.dataset.status = "pending";
        if (step.optional)
            item.dataset.optional = "true";
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
    const setSummary = (text) => {
        if (summaryEl)
            summaryEl.textContent = text || "";
    };
    const updateStep = (id, update) => {
        if (!id)
            return;
        const existingStep = stepElements.get(id);
        const fallback = DEFAULT_STEPS.find((step) => step.id === id);
        const step = existingStep
            ? { id, label: existingStep.querySelector(".boot-step-label")?.textContent || id, detail: "" }
            : fallback || { id, label: id, detail: "" };
        const item = existingStep || ensureStep(step);
        if (!item)
            return;
        if (update.status)
            item.dataset.status = update.status;
        if (update.label) {
            const labelEl = item.querySelector(".boot-step-label");
            if (labelEl)
                labelEl.textContent = update.label;
        }
        if (update.detail) {
            const detailEl = item.querySelector(".boot-step-detail");
            if (detailEl)
                detailEl.textContent = update.detail;
        }
    };
    const markReady = () => {
        document.documentElement.dataset.bootReady = "true";
        setSummary("Ready.");
    };
    const show = () => {
        document.documentElement.dataset.bootReady = "false";
    };
    const controller = {
        setSummary,
        updateStep,
        markReady,
        show
    };
    window.__RLS_BOOT_STATUS__ = controller;
    show();
    return controller;
}
export function getBootStatus() {
    if (typeof window === "undefined")
        return null;
    return window.__RLS_BOOT_STATUS__ || null;
}
//# sourceMappingURL=boot-status.js.map