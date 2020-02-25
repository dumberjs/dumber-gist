const cacheName = '__cache_name__';
const jsFiles = __js_files__;

async function prefetch() {
  const cacheNames = await caches.keys();
  if (cacheNames.length && cacheNames[0] !== cacheName) {
    console.info('Remove outdated offline dumber-app version: ' + cacheNames[0]);
    await Promise.all(cacheNames.map(n => caches.delete(n)));
  }

  if (!cacheNames.length || cacheNames[0] !== cacheName) {
    console.info('Save offline dumber-app version: ' + cacheName);
    const cache = await caches.open(cacheName);
    await cache.addAll(jsFiles);
  }
}

addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

addEventListener('install', e => {
  e.waitUntil(prefetch());
});

addEventListener('fetch', e => {
  if (!e.request.url.match(/^https:\/\/gist\.dumber\.(local|app)/)) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
