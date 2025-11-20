const CACHE = 'tig-preset-v6';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE ? caches.delete(k) : null))));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const { request } = e;
  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(resp => {
        const type = resp.headers.get('content-type') || '';
        if (resp.status === 200 && (type.includes('text/') || type.includes('application/json'))) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(request, copy));
        }
        return resp;
      }).catch(() => {
        if (request.mode === 'navigate') return caches.match('./index.html');
        return caches.match(request);
      });
    })
  );
});




