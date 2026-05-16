import { registerSW } from 'virtual:pwa-register';

export let needsRefresh = false;
export let offlineReady = false;

export function initServiceWorker(): void {
  registerSW({
    onNeedRefresh() {
      needsRefresh = true;
    },
    onOfflineReady() {
      offlineReady = true;
    },
    onRegisteredSW(_swUrl: string, registration: ServiceWorkerRegistration | undefined) {
      if (registration) {
        setInterval(() => registration.update(), 60 * 60 * 1000);
      }
    },
  });
}
