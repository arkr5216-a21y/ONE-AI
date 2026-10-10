const CACHE_NAME = "one-ai-cache-v1";

const APP_FILES = [
"./",
"./index.html",
"./manifest.webmanifest",
"./icons/icon.svg"
];

self.addEventListener("install", (event) => {
event.waitUntil(
caches.open(CACHE_NAME).then((cache) => {
return cache.addAll(APP_FILES);
})
);

self.skipWaiting();
});

self.addEventListener("activate", (event) => {
event.waitUntil(
caches.keys().then((keys) =>
Promise.all(
keys
.filter((key) => key !== CACHE_NAME)
.map((key) => caches.delete(key))
)
)
);

self.clients.claim();
});

self.addEventListener("fetch", (event) => {
if (event.request.method !== "GET") return;

const url = new URL(event.request.url);

if (url.origin !== self.location.origin) return;

event.respondWith(
fetch(event.request)
.then((response) => {
if (response && response.ok) {
const copy = response.clone();

      caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, copy);
      });
    }

    return response;
  })
  .catch(() =>
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      if (event.request.mode === "navigate") {
        return caches.match("./index.html");
      }

      return new Response("Offline — Internet ပြန်ဖွင့်ပြီး ထပ်ကြိုးစားပါ။", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    })
  )

);
});
