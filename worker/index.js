/**
 * Custom Service Worker code injected by @ducanh2912/next-pwa.
 *
 * Pattern B (per Screen 11 spec): listens for the SKIP_WAITING message that
 * UpdateBanner posts when the user clicks Refresh, and calls skipWaiting() so
 * the new SW takes over. Then the page reload picks up the fresh build.
 */

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
