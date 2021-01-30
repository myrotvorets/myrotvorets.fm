/// <reference lib="webworker" />

import { cacheNames, clientsClaim, skipWaiting } from 'workbox-core';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { cleanupOutdatedCaches, matchPrecache, precacheAndRoute } from 'workbox-precaching';
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

skipWaiting();
clientsClaim();
cleanupOutdatedCaches();

declare let self: ServiceWorkerGlobalScope;
const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest, { ignoreURLParametersMatching: [/.*/u] });

registerRoute(
    ({ request }) => request.mode === 'navigate',
    new NetworkFirst({
        cacheName: cacheNames.precache,
        networkTimeoutSeconds: 3,
        matchOptions: {
            ignoreSearch: true,
        },
        plugins: [
            new CacheableResponsePlugin({
                statuses: [200],
            }),
        ],
    }),
);

registerRoute(
    /^https:\/\/psb4ukr\.natocdn\.net\/mp3\/playlist\.txt/u,
    new StaleWhileRevalidate({
        cacheName: 'playlist-cache',
        matchOptions: {
            ignoreSearch: true,
        },
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

setCatchHandler(async (options) => {
    const { destination } = options.request;
    if (destination === 'document') {
        return (await matchPrecache('index.html')) || Response.error();
    }

    return Response.error();
});
