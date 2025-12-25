import { saveToActiveSlot, session } from "./game.js";

const RELEASE_STORAGE_KEY = "rls_release_patch_id";
const BANNER_ID = "rls-guardrail-banner";
const SAVE_THROTTLE_MS = 1500;

let lastSaveAt = 0;
let lastBannerAt = 0;

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
      saveToActiveSlot();
      console.info(`[guardrails] auto-saved (${reason}).`);
    }
  } catch (error) {
    console.warn("[guardrails] auto-save failed.", error);
  }
}

function ensureBanner() {
  if (typeof document === "undefined") return null;
  const existing = document.getElementById(BANNER_ID);
  if (existing) return existing;
  const banner = document.createElement("div");
  banner.id = BANNER_ID;
  banner.style.position = "fixed";
  banner.style.bottom = "16px";
  banner.style.left = "16px";
  banner.style.right = "16px";
  banner.style.zIndex = "9999";
  banner.style.background = "rgba(15, 20, 26, 0.92)";
  banner.style.color = "#f4f1ea";
  banner.style.border = "1px solid rgba(244, 241, 234, 0.2)";
  banner.style.borderRadius = "10px";
  banner.style.padding = "12px 14px";
  banner.style.font = "14px/1.4 \"Trebuchet MS\", \"Segoe UI\", sans-serif";
  banner.style.display = "flex";
  banner.style.alignItems = "center";
  banner.style.justifyContent = "space-between";
  banner.style.gap = "12px";
  const message = document.createElement("div");
  message.dataset.guardrailMessage = "true";
  const actions = document.createElement("div");
  const reload = document.createElement("button");
  reload.type = "button";
  reload.textContent = "Reload";
  reload.style.background = "#f4f1ea";
  reload.style.color = "#10151c";
  reload.style.border = "none";
  reload.style.borderRadius = "999px";
  reload.style.padding = "6px 12px";
  reload.style.cursor = "pointer";
  reload.addEventListener("click", () => window.location.reload());
  actions.appendChild(reload);
  banner.appendChild(message);
  banner.appendChild(actions);
  document.body.appendChild(banner);
  return banner;
}

function showGuardrailBanner(summary, detail) {
  const now = Date.now();
  if (now - lastBannerAt < 500) return;
  lastBannerAt = now;
  const banner = ensureBanner();
  if (!banner) return;
  const message = banner.querySelector("[data-guardrail-message]");
  if (!message) return;
  message.textContent = detail ? `${summary} ${detail}` : summary;
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
  recordReleaseStamp(release);

  if (typeof window !== "undefined") {
    window.addEventListener("error", (event) => {
      safeSave("runtime-error");
      showGuardrailBanner("Runtime error detected.", event?.message || "");
    });
    window.addEventListener("unhandledrejection", (event) => {
      safeSave("unhandled-rejection");
      showGuardrailBanner("Unhandled promise rejection.", String(event?.reason || ""));
    });
    window.addEventListener("pagehide", () => safeSave("pagehide"));
  }

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") safeSave("hidden");
    });
  }

  return {
    safeSave,
    handleFatal(error) {
      safeSave("fatal");
      showSafeMode(error);
    }
  };
}
