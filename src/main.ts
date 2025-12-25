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
  if (allowServiceWorker) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js");
    });
  }
}
