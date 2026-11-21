/* Bump VERSION on every deploy (and the ?v= on the script/style tags in index.html). */
const VERSION = 'ii-v10';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './sample.js', './features.js', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
/* Network first with revalidation, cache as the offline fallback. Same-origin GETs only:
   the AI request is a cross-origin POST and is never touched. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)).catch(() => {}); return res; })
      .catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
  );
});
