import { saveToActiveSlot, session } from "./game.js";
import { finalizeUsageSession, flushUsageSession, recordUsageError, recordUsageEvent, startUsageSession } from "./usage-log.js";

const RELEASE_STORAGE_KEY = "rls_release_patch_id";
const TOAST_STACK_ID = "rls-toast-stack";
const SAVE_THROTTLE_MS = 1500;
const TOAST_LIMIT = 3;
const TOAST_THROTTLE_MS = 600;
const TOAST_LIFETIME_MS = 12000;
const EXTENSION_PROTOCOLS = ["chrome-extension://", "edge-extension://", "ms-browser-extension://", "moz-extension://"];

let lastSaveAt = 0;
let lastCriticalToastAt = 0;

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

function appendToast(toast) {
  const stack = ensureToastStack();
  if (!stack) return;
  stack.appendChild(toast);
  window.setTimeout(() => toast.remove(), TOAST_LIFETIME_MS);
  const toasts = stack.querySelectorAll(".toast");
  if (toasts.length > TOAST_LIMIT) {
    toasts[0].remove();
  }
}

function formatToastDetail(detail) {
  const text = String(detail || "").trim();
  if (!text) return "";
  if (text.length <= 160) return text;
  return `${text.slice(0, 157)}...`;
}

function showCriticalToast(summary, detail) {
  const now = Date.now();
  if (now - lastCriticalToastAt < TOAST_THROTTLE_MS) return;
  lastCriticalToastAt = now;
  showToast(summary, detail, {
    tone: "critical",
    actions: [
      { label: "Reload", handler: () => window.location.reload() },
      { label: "Dismiss", handler: (toast) => toast?.remove() }
    ]
  });
}

function showToast(summary, detail, { tone = "info", actions = [] } = {}) {
  if (!summary) return;
  const toast = document.createElement("div");
  const toneClass = tone === "critical"
    ? "toast--critical"
    : tone === "success"
      ? "toast--success"
      : tone === "warn"
        ? "toast--warn"
        : "toast--info";
  toast.className = `toast ${toneClass}`;
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
  if (actions && actions.length) {
    const actionsEl = document.createElement("div");
    actionsEl.className = "toast-actions";
    actions.forEach((action) => {
      if (!action || !action.label) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ghost mini";
      button.textContent = action.label;
      button.addEventListener("click", () => {
        if (typeof action.handler === "function") action.handler(toast);
      });
      actionsEl.appendChild(button);
    });
    if (actionsEl.children.length) {
      toast.appendChild(actionsEl);
    }
  }
  appendToast(toast);
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

function isExtensionReference(value) {
  if (!value || typeof value !== "string") return false;
  return EXTENSION_PROTOCOLS.some((protocol) => value.includes(protocol));
}

function isExtensionError(event, reason) {
  if (isExtensionReference(event?.filename)) return true;
  if (isExtensionReference(event?.message)) return true;
  if (isExtensionReference(event?.error?.stack)) return true;
  if (isExtensionReference(reason?.stack)) return true;
  if (isExtensionReference(reason instanceof Error ? reason.message : String(reason || ""))) return true;
  return false;
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

export { showToast };

export function installLiveEditGuardrails(release) {
  startUsageSession({ release });
  recordReleaseStamp(release);

  if (typeof window !== "undefined") {
    window.addEventListener("error", (event) => {
      if (isExtensionError(event, event?.error)) {
        recordUsageError({
          kind: "extension.error",
          message: event?.message || "Extension error",
          stack: event?.error?.stack,
          filename: event?.filename,
          lineno: event?.lineno,
          colno: event?.colno,
          reason: event?.error || null,
          reportToConsole: false
        });
        return;
      }
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
      if (isExtensionError(null, reason)) {
        recordUsageError({
          kind: "extension.unhandledrejection",
          message: reason instanceof Error ? reason.message : String(reason || "Extension rejection"),
          stack: reason instanceof Error ? reason.stack : null,
          reason,
          reportToConsole: false
        });
        return;
      }
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
