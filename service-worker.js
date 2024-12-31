const CACHE_NAME  = 'aten-bingo-pwa-cache-v1';
const ASSETS_TO_CACHE = [
	'/bingo/',
	'/bingo/bingo.html',
	'/bingo/umd.js',
	'/bingo/bingo-icon-512.png'
];

// Service Worker Install and Caching data
self.addEventListener('install', (event) => {
	console.log("[Service Worker] Install");
	self.skipWaiting(); // force Activate
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("[Service Worker] Caching static assets", ASSETS_TO_CACHE.length, ASSETS_TO_CACHE);
            return Promise.all(
                ASSETS_TO_CACHE.map((asset) =>
                    cache.add(asset).catch((err) => {
                        console.warn(`[Service Worker] Failed to cache asset: ${asset}`, err);
                    })
                )
            );
        })
    );
});

// clean old cache
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME)
                    .map((cacheName) => caches.delete(cacheName))
            );
        })
    );
});

// catch request, and supply cache resource
// self.addEventListener('fetch', (event) => {
    // event.respondWith(
        // caches.match(event.request).then((cachedResponse) => {
            // return cachedResponse || fetch(event.request);
        // })
    // );

// });
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        })
    );
});