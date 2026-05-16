/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

registerRoute(
  ({ request }: { request: Request }) => request.destination === 'document',
  new StaleWhileRevalidate({ cacheName: 'documents' }),
);

registerRoute(
  ({ request }: { request: Request }) =>
    request.destination === 'script' || request.destination === 'style',
  new CacheFirst({ cacheName: 'static-resources' }),
);

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim());
});
