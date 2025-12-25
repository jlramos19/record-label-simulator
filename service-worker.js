let releaseStamp = { patchId: "dev" };
try {
  importScripts("assets/js/data/release.js");
  if (self.RLS_RELEASE?.patchId) {
    releaseStamp = self.RLS_RELEASE;
  }
} catch (error) {
  console.warn("Release stamp unavailable, falling back to dev cache.", error);
}
const CACHE_VERSION = releaseStamp.patchId || "dev";
const CACHE_NAME = `rls-cache-${CACHE_VERSION}`;
const ASSETS = [
  ".",
  "index.html",
  "manifest.webmanifest",
  "assets/js/data/release.js",
  "assets/css/app.css",
  "assets/js/dist/main.js",
  "assets/js/dist/app/guardrails.js",
  "assets/js/dist/app/game.js",
  "assets/js/dist/app/ui.js",
  "assets/js/dist/app/calendar.js",
  "assets/js/dist/app/csv.js",
  "assets/js/dist/app/db.js",
  "assets/js/dist/app/promo_types.js",
  "assets/js/dist/app/chartWorker.js",
  "assets/js/data/constants.js",
  "assets/js/data/names.js",
  "assets/js/data/tracklist.js",
  "assets/js/data/ai_labels.js",
  "assets/js/data/social_templates.js",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const request = event.request;

  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
