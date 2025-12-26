import initUI from "./app/ui.js";
import { installLiveEditGuardrails } from "./app/guardrails.js";
const releaseStamp = typeof RLS_RELEASE !== "undefined" ? RLS_RELEASE : null;
const guardrails = installLiveEditGuardrails(releaseStamp);
if (typeof document !== "undefined" && releaseStamp?.patchId) {
    document.documentElement.dataset.release = releaseStamp.patchId;
}
initUI().catch((error) => {
    console.error("initUI error:", error);
    guardrails.handleFatal(error);
});
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