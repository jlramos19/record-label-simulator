import initUI from "./app/ui.js";
import { installLiveEditGuardrails, showToast } from "./app/guardrails.js";
import { UI_REACT_ISLANDS_ENABLED } from "./app/game/config.js";
import { initBootStatus } from "./app/boot-status.js";

const releaseStamp = typeof RLS_RELEASE !== "undefined" ? RLS_RELEASE : null;
const guardrails = installLiveEditGuardrails(releaseStamp);
const bootStatus = initBootStatus();
const bootGuard = typeof window !== "undefined"
  ? (window as typeof window & { __RLS_BOOT_GUARD__?: { markReady?: () => void } }).__RLS_BOOT_GUARD__
  : null;
const markBootReady = () => {
  if (bootGuard?.markReady) bootGuard.markReady();
};
let bootBlocked = false;

if (typeof window !== "undefined") {
  bootStatus?.setSummary("Checking boot essentials...");
  bootStatus?.updateStep("boot", { status: "active", detail: "Checking data globals and DOM roots." });
  const missing: string[] = [];
  const hasArray = (value: unknown) => Array.isArray(value) && value.length > 0;
  const hasNumber = (value: unknown) => Number.isFinite(value as number);
  const hasChartSizes = (value: unknown) => {
    if (!value || typeof value !== "object") return false;
    const sizes = value as { global?: unknown; nation?: unknown; region?: unknown };
    return hasNumber(sizes.global) && hasNumber(sizes.nation) && hasNumber(sizes.region);
  };
  const hasEconomyBaselines = (value: unknown) => {
    if (!value || typeof value !== "object") return false;
    const baselines = value as { digitalSingle?: unknown; physicalSingle?: unknown };
    return hasNumber(baselines.digitalSingle) && hasNumber(baselines.physicalSingle);
  };
  const hasPortraitManifest = (value: unknown) => {
    if (!value || typeof value !== "object") return false;
    const manifest = value as { root?: unknown; entries?: unknown };
    return typeof manifest.root === "string" && !!manifest.entries;
  };
  const requireGlobal = (name: string, ok: boolean) => {
    if (!ok) missing.push(name);
  };

  requireGlobal("THEMES", typeof THEMES !== "undefined" && hasArray(THEMES));
  requireGlobal("MOODS", typeof MOODS !== "undefined" && hasArray(MOODS));
  requireGlobal("ALIGNMENTS", typeof ALIGNMENTS !== "undefined" && hasArray(ALIGNMENTS));
  requireGlobal("CHART_SIZES", typeof CHART_SIZES !== "undefined" && hasChartSizes(CHART_SIZES));
  requireGlobal("ECONOMY_BASELINES", typeof ECONOMY_BASELINES !== "undefined" && hasEconomyBaselines(ECONOMY_BASELINES));
  requireGlobal("SLOT_COUNT", typeof SLOT_COUNT !== "undefined" && hasNumber(SLOT_COUNT));
  requireGlobal("NATIONS", typeof NATIONS !== "undefined" && hasArray(NATIONS));
  requireGlobal("REGION_DEFS", typeof REGION_DEFS !== "undefined" && hasArray(REGION_DEFS));
  requireGlobal("TRACKLIST", typeof TRACKLIST !== "undefined" && hasArray(TRACKLIST));
  requireGlobal("AI_LABELS", typeof AI_LABELS !== "undefined" && hasArray(AI_LABELS));
  requireGlobal("SOCIAL_TEMPLATES", typeof SOCIAL_TEMPLATES !== "undefined" && !!SOCIAL_TEMPLATES && typeof SOCIAL_TEMPLATES === "object");
  requireGlobal("CREATOR_PORTRAIT_MANIFEST", typeof CREATOR_PORTRAIT_MANIFEST !== "undefined" && hasPortraitManifest(CREATOR_PORTRAIT_MANIFEST));
  const missingRoots = [];
  if (typeof document !== "undefined") {
    if (!document.getElementById("app")) missingRoots.push("#app");
    if (!document.getElementById("mainMenu")) missingRoots.push("#mainMenu");
  }
  if (missing.length || missingRoots.length) {
    const detail = [
      missing.length ? `Missing data globals: ${missing.join(", ")}` : "",
      missingRoots.length ? `Missing DOM roots: ${missingRoots.join(", ")}` : ""
    ].filter(Boolean).join(" | ");
    console.error("[boot] Missing dependencies detected.", { missing, missingRoots });
    bootStatus?.updateStep("boot", { status: "error", detail: detail || "Missing boot dependencies." });
    bootStatus?.setSummary("Boot dependencies missing.");
    guardrails.handleFatal(new Error(`Boot dependencies missing. ${detail}`));
    markBootReady();
    bootBlocked = true;
  } else {
    bootStatus?.updateStep("boot", { status: "done", detail: "Boot checks complete." });
  }
}

if (typeof document !== "undefined" && releaseStamp?.patchId) {
  document.documentElement.dataset.release = releaseStamp.patchId;
}
if (typeof window !== "undefined") {
  const root = window as typeof window & { UI_REACT_ISLANDS_ENABLED?: boolean };
  root.UI_REACT_ISLANDS_ENABLED = UI_REACT_ISLANDS_ENABLED;
}

if (!bootBlocked) {
  bootStatus?.updateStep("ui", { status: "active", detail: "Starting UI." });
  bootStatus?.setSummary("Starting UI...");
  initUI()
    .then(() => {
      markBootReady();
      bootStatus?.markReady();
      if (typeof sessionStorage === "undefined") return;
      const releaseChanged = sessionStorage.getItem("rls_release_changed");
      if (!releaseChanged) return;
      sessionStorage.removeItem("rls_release_changed");
      showToast("Update available", "A new build is ready. Reload to clear stale cached assets.", {
        tone: "warn",
        actions: [{ label: "Reload", handler: () => window.location.reload() }]
      });
    })
    .catch((error) => {
      console.error("initUI error:", error);
      bootStatus?.updateStep("ui", { status: "error", detail: error?.message || "UI failed to load." });
      bootStatus?.setSummary("UI failed to load.");
      markBootReady();
      guardrails.handleFatal(error);
    });
} else {
  markBootReady();
  bootStatus?.markReady();
}

if ("serviceWorker" in navigator) {
  const params = new URLSearchParams(window.location.search);
  const swDisabled = params.get("sw") === "off" || params.has("nosw");
  const isLocalHost = ["localhost", "127.0.0.1", "0.0.0.0"].includes(window.location.hostname);
  const allowServiceWorker = !swDisabled && !isLocalHost;
  const cleanupKey = "rls_sw_cleanup";

  const purgeServiceWorker = async () => {
    const hadController = !!navigator.serviceWorker.controller;
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("rls-cache-"))
          .map((key) => caches.delete(key))
      );
    }
    return { hadController, didCleanup: registrations.length > 0 };
  };

  if (allowServiceWorker) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js")
        .then((registration) => registration.update())
        .catch((error) => console.warn("Service worker registration failed.", error));
    });
  } else {
    window.addEventListener("load", () => {
      purgeServiceWorker()
        .then(({ hadController, didCleanup }) => {
          if (!didCleanup || !hadController) return;
          if (typeof sessionStorage === "undefined") return;
          if (sessionStorage.getItem(cleanupKey)) return;
          sessionStorage.setItem(cleanupKey, "1");
          window.location.reload();
        })
        .catch((error) => console.warn("Service worker cleanup failed.", error));
    });
  }
}
