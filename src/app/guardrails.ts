import { saveToActiveSlot, session } from "./game.js";
import { finalizeUsageSession, flushUsageSession, recordUsageError, recordUsageEvent, startUsageSession } from "./usage-log.js";

const RELEASE_STORAGE_KEY = "rls_release_patch_id";
const TOAST_STACK_ID = "rls-toast-stack";
const SAVE_THROTTLE_MS = 1500;
const TOAST_LIMIT = 3;
const TOAST_THROTTLE_MS = 600;
const TOAST_LIFETIME_MS = 12000;

let lastSaveAt = 0;
let lastToastAt = 0;

function safeSetStorage(storage, key, value) {
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeSave(reason) {
  const now = Date.now();
  if (now - lastSaveAt < SAVE_THROTTLE_MS) return;
  lastSaveAt = now;
  try {
    if (session?.activeSlot) {
      saveToActiveSlot({ immediate: true });
      console.info(`[guardrails] auto-saved (${reason}).`);
    }
  } catch (error) {
    console.warn("[guardrails] auto-save failed.", error);
  }
}

function ensureToastStack() {
  if (typeof document === "undefined") return null;
  if (!document.body) return null;
  const existing = document.getElementById(TOAST_STACK_ID);
  if (existing) return existing;
  const stack = document.createElement("div");
  stack.id = TOAST_STACK_ID;
  stack.className = "toast-stack";
  stack.setAttribute("role", "status");
  stack.setAttribute("aria-live", "polite");
  document.body.appendChild(stack);
  return stack;
}

function formatToastDetail(detail) {
  const text = String(detail || "").trim();
  if (!text) return "";
  if (text.length <= 160) return text;
  return `${text.slice(0, 157)}...`;
}

function showCriticalToast(summary, detail) {
  const now = Date.now();
  if (now - lastToastAt < TOAST_THROTTLE_MS) return;
  lastToastAt = now;
  const stack = ensureToastStack();
  if (!stack) return;
  const toast = document.createElement("div");
  toast.className = "toast toast--critical";
  const dismiss = () => toast.remove();
  const title = document.createElement("div");
  title.className = "toast-title";
  title.textContent = summary;
  toast.appendChild(title);
  const detailText = formatToastDetail(detail);
  if (detailText) {
    const detailEl = document.createElement("div");
    detailEl.className = "toast-detail";
    detailEl.textContent = detailText;
    toast.appendChild(detailEl);
  }
  const actions = document.createElement("div");
  actions.className = "toast-actions";
  const reload = document.createElement("button");
  reload.type = "button";
  reload.className = "ghost mini";
  reload.textContent = "Reload";
  reload.addEventListener("click", () => window.location.reload());
  const close = document.createElement("button");
  close.type = "button";
  close.className = "ghost mini";
  close.textContent = "Dismiss";
  close.addEventListener("click", dismiss);
  actions.appendChild(reload);
  actions.appendChild(close);
  toast.appendChild(actions);
  stack.appendChild(toast);
  window.setTimeout(dismiss, TOAST_LIFETIME_MS);
  const toasts = stack.querySelectorAll(".toast");
  if (toasts.length > TOAST_LIMIT) {
    toasts[0].remove();
  }
}

function showSafeMode(error) {
  if (typeof document === "undefined") return;
  const message = error instanceof Error ? error.message : String(error || "Unknown error");
  document.body.innerHTML = "";
  const container = document.createElement("div");
  container.style.minHeight = "100vh";
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  container.style.background = "#0f141a";
  container.style.color = "#f4f1ea";
  container.style.padding = "24px";
  container.style.font = "16px/1.5 \"Trebuchet MS\", \"Segoe UI\", sans-serif";
  container.innerHTML = `
    <div style="max-width:640px;">
      <h1 style="margin:0 0 12px;font-size:22px;">Safe Mode: UI failed to load</h1>
      <div style="margin-bottom:12px;opacity:0.8;">The game state was preserved. Fix the error, then reload.</div>
      <div style="margin-bottom:16px;white-space:pre-wrap;opacity:0.7;">${message}</div>
      <button id="guardrailReloadBtn" style="background:#f4f1ea;color:#10151c;border:none;border-radius:999px;padding:8px 16px;cursor:pointer;">Reload</button>
    </div>
  `;
  document.body.appendChild(container);
  const reloadBtn = document.getElementById("guardrailReloadBtn");
  if (reloadBtn) reloadBtn.addEventListener("click", () => window.location.reload());
}

function recordReleaseStamp(release) {
  if (!release?.patchId || typeof localStorage === "undefined") return;
  const previous = localStorage.getItem(RELEASE_STORAGE_KEY);
  if (previous === release.patchId) return;
  safeSetStorage(localStorage, RELEASE_STORAGE_KEY, release.patchId);
  if (previous && typeof sessionStorage !== "undefined") {
    safeSetStorage(sessionStorage, "rls_release_changed", `${previous} -> ${release.patchId}`);
  }
}

export function installLiveEditGuardrails(release) {
  startUsageSession({ release });
  recordReleaseStamp(release);

  if (typeof window !== "undefined") {
    window.addEventListener("error", (event) => {
      recordUsageError({
        kind: "window.error",
        message: event?.message || "Runtime error",
        stack: event?.error?.stack,
        filename: event?.filename,
        lineno: event?.lineno,
        colno: event?.colno,
        reason: event?.error || null
      });
      safeSave("runtime-error");
      showCriticalToast("Runtime error detected.", event?.message || "");
    });
    window.addEventListener("unhandledrejection", (event) => {
      const reason = event?.reason;
      recordUsageError({
        kind: "unhandledrejection",
        message: reason instanceof Error ? reason.message : String(reason || "Unhandled rejection"),
        stack: reason instanceof Error ? reason.stack : null,
        reason
      });
      safeSave("unhandled-rejection");
      showCriticalToast("Unhandled promise rejection.", String(event?.reason || ""));
    });
    window.addEventListener("pagehide", () => {
      recordUsageEvent("session.pagehide", { visibility: document?.visibilityState || null });
      finalizeUsageSession("pagehide");
      safeSave("pagehide");
    });
  }

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        recordUsageEvent("session.hidden", { visibility: document.visibilityState });
        flushUsageSession();
        safeSave("hidden");
      }
    });
  }

  return {
    safeSave,
    handleFatal(error) {
      recordUsageError({
        kind: "fatal",
        message: error?.message || "Fatal init error",
        stack: error?.stack,
        reason: error
      });
      finalizeUsageSession("fatal");
      safeSave("fatal");
      showSafeMode(error);
    }
  };
}
