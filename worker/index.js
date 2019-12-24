import Dumber from 'dumber';
import findDeps from 'aurelia-deps-finder';

let dumbers = {};

const DEFAULT_INDEX_HTML = `<!DOCTYPE html>
<html>
<head>
<title>App</title>
</head>
<body>
<h1>Please create an index.html file to render</h1>
</body>
</html>
`;

const DEFAULT_BUNDLE_JS = `
var m = document.createElement('h1');
m.textContent = 'Error: /dist/entry-bundle.js is not ready.';
document.body.appendChild(m);
`;

const cacheGetters = {};

addEventListener('install', event => {
  // The skipWaiting() method allows this service worker to progress from the registration's
  // waiting position to active even while service worker clients are using the registration.
  // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-global-scope-skipwaiting
  event.waitUntil(skipWaiting());
});

addEventListener('activate', event => {
  // The claim() method of the of the Clients interface allows an active Service Worker to set
  // itself as the active worker for a client page when the worker and the page are in the same
  // scope. This triggers an oncontrollerchange event on any client pages within the Service
  // Worker's scope.
  // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#clients-claim-method
  event.waitUntil(clients.claim());
});

addEventListener('message', function(event) {
  var action = event.data;
  if (!action.type) return;
  const {id} = action.id;

  const {source} = event;
  if (action.type !== 'init' && !dumbers[id]) {
    source.postMessage({type: 'worker-error', error: 'dumber did not init!'});
    return;
  }
  if (action.type === 'init') {
    try {
      caches.delete(id).then(() => {
        return caches.open(id)
      }).then(function(cache) {
        console.log('stub index.html and entry-bundle.js');
        return Promise.all([
          cache.put(
            new Request('/', { mode: 'no-cors' }),
            new Response(DEFAULT_INDEX_HTML, {
              status: 200,
              statusText: 'OK',
              headers: {
                'Content-Type': 'text/html; charset=utf-8'
              }
            })
          ),
          cache.put(
            new Request('/dist/entry-bundle.js', { mode: 'no-cors' }),
            new Response(DEFAULT_BUNDLE_JS, {
              status: 200,
              statusText: 'OK',
              headers: {
                'Content-Type': 'application/javascript'
              }
            })
          )
        ]);
      }).then(() => {
        dumbers[id] = new Dumber({
          skipModuleLoader: true,
          depsFinder: findDeps,
          cache: {
            getCache: function(hash) {
              if (!cacheGetters[hash]) {
                let resolve;
                const getter = new Promise((_resolve, reject) => {
                  resolve = _resolve;
                  setTimeout(reject, 500);
                });
                cacheGetters[hash] = {getter, resolve};
              }
              source.postMessage({type: 'get-cache', hash});
              return cacheGetters[hash].getter;
            },
            setCache: function(hash, object) {
              source.postMessage({type: 'set-cache', hash, object});
            },
            clearCache: function() {
              source.postMessage({type: 'clear-cache'});
            }
          },
          prepend: ['https://cdn.jsdelivr.net/npm/dumber-module-loader@1.0.0/dist/index.min.js'],
          deps: [
            {name: 'vue', main: 'dist/vue.js', lazyMain: true}
          ]
        });
        console.log('created dumber');
        source.postMessage({type: 'worker-ready'});
      });
    } catch (e) {
      console.error(e);
      source.postMessage({type: 'worker-error', error: e.message});
    }
  } else if (action.type === 'update-file') {
    if (action.file.path.startsWith('src/') || !action.file.path.match(/[^/]+\.html/)) {
      console.log('capture ' + action.file.path);
      dumbers[id].capture(action.file);
    } else {
      let wantedPath = action.file.path;
      if (wantedPath === 'index.html') {
        wantedPath = '';
      }
      console.log('caching /' + wantedPath);
      return caches.open(id).then(function(cache) {
        return cache.put(
          new Request('/' + wantedPath, { mode: 'no-cors' }),
          new Response(action.file.contents, {
            status: 200,
            statusText: 'OK',
            headers: {
              'Content-Type': action.file.type
            }
          })
        );
      });
    }
  } else if (action.type === 'build') {
    dumbers[id].resolve()
      .then(function() { return dumbers[id].bundle(); })
      .then(function(bundles) {
        console.log('Done build!');
        // only use single bundle
        var bundle = bundles['entry-bundle'];
        var all = [];
        var f;

        for (f of bundle.files) all.push(f.contents);
        all.push('requirejs.config(' + JSON.stringify(bundle.config, null , 2) + ');');

        return caches.open(id).then(function(cache) {
          return cache.put(
            new Request('/dist/entry-bundle.js', { mode: 'no-cors' }),
            new Response(all.join('\n'), {
              status: 200,
              statusText: 'OK',
              headers: {
                'Content-Type': 'application/javascript'
              }
            })
          );
        }).then(() => {
          source.postMessage({type: 'build-done'});
        });
      })
      .catch(function(e) {
        console.error(e);
        source.postMessage({type: 'worker-error', error: e.message});
      });
  } else if (action.type === 'got-cache') {
    const {hash, object} = action;
    if (cacheGetters[hash]) {
      cacheGetters[hash].resolve(object);
      delete cacheGetters[hash];
    }
  }
});

addEventListener('fetch', function(event) {
  if (!event.request.url.includes('browser')) console.log('fetch ', event.request.url, event.request.headers.get('Cookie'));
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) return response;
      return fetch(event.request);
    })
  );
});
