/// <reference lib="webworker" />

import { cacheNames, clientsClaim, skipWaiting } from 'workbox-core';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { getCacheKeyForURL, precacheAndRoute } from 'workbox-precaching';
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

skipWaiting();
clientsClaim();

registerRoute(
    ({ request }) => request.mode === 'navigate',
    new NetworkFirst({
        cacheName: cacheNames.precache,
        networkTimeoutSeconds: 5,
        plugins: [
            new CacheableResponsePlugin({
                statuses: [200],
            }),
        ],
    }),
);

registerRoute(
    /^https:\/\/psb4ukr\.natocdn\.net\/mp3\/playlist\.txt/,
    new StaleWhileRevalidate({
        cacheName: 'playlist-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [200],
            }),
            new ExpirationPlugin({
                maxAgeSeconds: 900,
            }),
        ],
    }),
);

// eslint-disable-next-line no-undef
declare let self: ServiceWorkerGlobalScope;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const manifest = [].concat((self as any).__WB_MANIFEST || []);
precacheAndRoute(manifest, {});

setCatchHandler(({ request }) => {
    if (typeof request !== 'string' && request.mode === 'navigate') {
        const key = getCacheKeyForURL('/index.html');
        if (key) {
            return caches.match(key) as Promise<Response>;
        }
    }

    return Promise.reject(Response.error());
});
