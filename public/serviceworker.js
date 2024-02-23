self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/models/")) {
    event.respondWith(useCache(event.request));
  }
});

async function useCache(request) {
  const cache = await caches.open("models");
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
}
