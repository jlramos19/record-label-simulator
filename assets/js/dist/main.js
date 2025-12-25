import initUI from "./app/ui.js";
initUI().catch((error) => {
    console.error("initUI error:", error);
});
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js");
    });
}
