self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", async (event) => {
  if (event.request.url.includes("/models/")) {
    const cache = await caches.open("model");
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }
    const response = await fetch(event.request);
    cache.put(event.request, response.clone());
    return response;
  }
});
