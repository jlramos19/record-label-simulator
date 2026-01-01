import initUI from "./app/ui.js";
import { installLiveEditGuardrails, showToast } from "./app/guardrails.js";
import { UI_REACT_ISLANDS_ENABLED } from "./app/game/config.js";
const releaseStamp = typeof RLS_RELEASE !== "undefined" ? RLS_RELEASE : null;
const guardrails = installLiveEditGuardrails(releaseStamp);
const bootGuard = typeof window !== "undefined"
    ? window.__RLS_BOOT_GUARD__
    : null;
const markBootReady = () => {
    if (bootGuard?.markReady)
        bootGuard.markReady();
};
let bootBlocked = false;
if (typeof window !== "undefined") {
    const globals = window;
    const missing = [];
    const hasArray = (value) => Array.isArray(value) && value.length > 0;
    const hasNumber = (value) => Number.isFinite(value);
    const hasChartSizes = (value) => {
        if (!value || typeof value !== "object")
            return false;
        const sizes = value;
        return hasNumber(sizes.global) && hasNumber(sizes.nation) && hasNumber(sizes.region);
    };
    const hasEconomyBaselines = (value) => {
        if (!value || typeof value !== "object")
            return false;
        const baselines = value;
        return hasNumber(baselines.digitalSingle) && hasNumber(baselines.physicalSingle);
    };
    const hasPortraitManifest = (value) => {
        if (!value || typeof value !== "object")
            return false;
        const manifest = value;
        return typeof manifest.root === "string" && !!manifest.entries;
    };
    const requireGlobal = (name, predicate) => {
        const value = globals[name];
        if (!predicate(value))
            missing.push(name);
    };
    requireGlobal("THEMES", hasArray);
    requireGlobal("MOODS", hasArray);
    requireGlobal("ALIGNMENTS", hasArray);
    requireGlobal("CHART_SIZES", hasChartSizes);
    requireGlobal("ECONOMY_BASELINES", hasEconomyBaselines);
    requireGlobal("SLOT_COUNT", hasNumber);
    requireGlobal("NATIONS", hasArray);
    requireGlobal("REGION_DEFS", hasArray);
    requireGlobal("TRACKLIST", hasArray);
    requireGlobal("AI_LABELS", hasArray);
    requireGlobal("SOCIAL_TEMPLATES", (value) => !!value && typeof value === "object");
    requireGlobal("CREATOR_PORTRAIT_MANIFEST", hasPortraitManifest);
    const missingRoots = [];
    if (typeof document !== "undefined") {
        if (!document.getElementById("app"))
            missingRoots.push("#app");
        if (!document.getElementById("mainMenu"))
            missingRoots.push("#mainMenu");
    }
    if (missing.length || missingRoots.length) {
        const detail = [
            missing.length ? `Missing data globals: ${missing.join(", ")}` : "",
            missingRoots.length ? `Missing DOM roots: ${missingRoots.join(", ")}` : ""
        ].filter(Boolean).join(" | ");
        console.error("[boot] Missing dependencies detected.", { missing, missingRoots });
        guardrails.handleFatal(new Error(`Boot dependencies missing. ${detail}`));
        markBootReady();
        bootBlocked = true;
    }
}
if (typeof document !== "undefined" && releaseStamp?.patchId) {
    document.documentElement.dataset.release = releaseStamp.patchId;
}
if (typeof window !== "undefined") {
    const root = window;
    root.UI_REACT_ISLANDS_ENABLED = UI_REACT_ISLANDS_ENABLED;
}
if (!bootBlocked) {
    initUI()
        .then(() => {
        markBootReady();
        if (typeof sessionStorage === "undefined")
            return;
        const releaseChanged = sessionStorage.getItem("rls_release_changed");
        if (!releaseChanged)
            return;
        sessionStorage.removeItem("rls_release_changed");
        showToast("Update available", "A new build is ready. Reload to clear stale cached assets.", {
            tone: "warn",
            actions: [{ label: "Reload", handler: () => window.location.reload() }]
        });
    })
        .catch((error) => {
        console.error("initUI error:", error);
        markBootReady();
        guardrails.handleFatal(error);
    });
}
else {
    markBootReady();
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
            await Promise.all(keys
                .filter((key) => key.startsWith("rls-cache-"))
                .map((key) => caches.delete(key)));
        }
        return { hadController, didCleanup: registrations.length > 0 };
    };
    if (allowServiceWorker) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("./service-worker.js")
                .then((registration) => registration.update())
                .catch((error) => console.warn("Service worker registration failed.", error));
        });
    }
    else {
        window.addEventListener("load", () => {
            purgeServiceWorker()
                .then(({ hadController, didCleanup }) => {
                if (!didCleanup || !hadController)
                    return;
                if (typeof sessionStorage === "undefined")
                    return;
                if (sessionStorage.getItem(cleanupKey))
                    return;
                sessionStorage.setItem(cleanupKey, "1");
                window.location.reload();
            })
                .catch((error) => console.warn("Service worker cleanup failed.", error));
        });
    }
}
//# sourceMappingURL=main.js.map