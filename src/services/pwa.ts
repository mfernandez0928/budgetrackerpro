export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.register("/sw.js");
  const syncRegistration = registration as ServiceWorkerRegistration & {
    sync?: { register: (tag: string) => Promise<void> };
  };

  if (syncRegistration.sync) {
    try {
      await syncRegistration.sync.register("budget-tracker-local-sync");
    } catch {
      // Background sync is optional and can fail silently on unsupported browsers.
    }
  }
}
