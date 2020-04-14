const JSDELIVR_CDN_URL = `//${HOST_NAMES.jsdelivrCdnDomain || 'cdn.jsdelivr.net'}`;

addEventListener('install', e => {
  e.waitUntil(skipWaiting());
});

addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

const DEFAULT_INDEX_HTML = `<!DOCTYPE html>
<html>
<head>
<title>App</title>
</head>
<body>
<p>Please create an index.html file to render</p>
</body>
</html>
`;

const DEFAULT_BUNDLE_JS = `var m = document.createElement('p');
m.textContent = 'Error: /dist/entry-bundle.js is not ready.';
document.body.appendChild(m);
`;

async function resetCaches() {
  await caches.delete('v1');
}

async function addCache(url, content, contentType) {
  const cache = await caches.open('v1');
  await cache.put(
    new Request(url, { mode: 'no-cors' }),
    new Response(content, {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': contentType
      }
    })
  );
}

function mimeType(filename) {
  if (filename.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filename.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filename.endsWith('.css')) return 'text/css; charset=utf-8';
  return 'text/plain';
}

addEventListener('message', async e => {
  const {data, source} = e;

  const {type, id, files} = data;
  if (type === 'sw:update-files') {
    await resetCaches();

    let indexLoaded = false;
    let entryBundleLoaded = false;
    for (let i = 0, ii = files.length; i < ii; i++) {
      const {filename, content} = files[i];
      await addCache(
        '/' + filename,
        content,
        mimeType(filename)
      );
      if (filename === 'index.html') {
        indexLoaded = true;
        await addCache(
          '/',
          content,
          mimeType(filename)
        );
      } else if (filename === 'dist/entry-bundle.js') {
        entryBundleLoaded = true;
      }
    }

    if (!indexLoaded) {
      await addCache(
        '/',
        DEFAULT_INDEX_HTML,
        mimeType('index.html')
      );
    }

    if (!entryBundleLoaded) {
      await addCache(
        '/dist/entry-bundle.js',
        DEFAULT_BUNDLE_JS,
        mimeType('dist/entry-bundle.js')
      );
    }
  }

  source.postMessage({type: 'ack', id});
});

const existingFiles = [
  '__boot-up-worker.html',
  '__dumber-gist-worker.js',
  '__remove-expired-worker.html',
  'favicon.ico'
];

addEventListener('fetch', e => {
  if (!e.request.url.startsWith(location.origin)) return;
  const pathname = e.request.url.slice(location.origin.length);

  if (existingFiles.some(f => e.request.url.endsWith(f))) return;

  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(r => {
      if (r) return r;

      if (e.request.method === 'GET') {
        if (isLikeRoute(pathname)) {
          // Return /index.html for HTML5 routes
          return caches.match(location.origin + '/');
        }
      }

      // Bypass Chrome issue
      // https://github.com/dumberjs/dumber-gist/issues/5
      // https://github.com/paulirish/caltrainschedule.io/issues/49
      if (
        e.request.cache === 'only-if-cached' &&
        e.request.mode !== 'same-origin'
      ) {
        return;
      }

      return fetch(e.request).then(response => {
        if (!response.ok && pathname.length > 1) {
          // Try font/image from jsdelivr
          return fetch(`${JSDELIVR_CDN_URL}/npm${pathname}`, {mode: 'cors'}).then(response => {
              if (response.ok) return response;
              throw new Error(`No resource for ${pathname}`);
            });
        }
        return response;
      });
    })
  );
});

function isLikeRoute(pathname) {
  // Remove hash
  const idx = pathname.indexOf('#');
  if (idx) pathname = pathname.slice(0, idx);
  // Remove query string
  const idx2 = pathname.indexOf('?');
  if (idx2) pathname = pathname.slice(0, idx2);

  return pathname.indexOf('.') === -1;
}
