const CACHE_NAME = "sgf-dark-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/styles.css",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).then((resp) => {
          if (
            resp &&
            resp.status === 200 &&
            resp.type === "basic" &&
            event.request.url.startsWith(self.location.origin)
          ) {
            const respClone = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respClone));
          }
          return resp;
        }).catch(() => caches.match("/index.html"))
      );
    })
  );
}); 