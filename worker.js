self.addEventListener('install', event => {
  // The skipWaiting() method allows this service worker to progress from the registration's
  // waiting position to active even while service worker clients are using the registration.
  // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-global-scope-skipwaiting
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  // The claim() method of the of the Clients interface allows an active Service Worker to set
  // itself as the active worker for a client page when the worker and the page are in the same
  // scope. This triggers an oncontrollerchange event on any client pages within the Service
  // Worker's scope.
  // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#clients-claim-method
  event.waitUntil(self.clients.claim());
});

self.importScripts('/output/dumber-bundle.js');

let resolveWorker = null;
const workerReady = new Promise(resolve => resolveWorker = resolve);

let Dumber;
let dumber;
let findDeps;

requirejs(['dumber', 'aurelia-deps-finder'], function(_Dumber, _findDeps) {
  Dumber = _Dumber;
  findDeps = (filename, contents) => {
    return _findDeps(filename, contents, {
      readFile(filepath) {
        console.log('findDpes readFile ' + filepath);
        if (filepath.startsWith('/')) {
          return fetch('/' + filepath).then(response => {
            if (!response.ok) throw new Error();
          });
        }
        // local source, don't bother to check
        return Promise.reject();
      }
    });
  };
}).then(resolveWorker);

self.addEventListener('message', function(event) {
  var action = event.data;
  // event.source.postMessage({echo: action});
  console.log('action.type ' +  action.type);

  workerReady.then(() => {
    if (action.type !== 'init' && !dumber) {
      event.source.postMessage({type: 'worker-error', error: 'dumber did not init!'});
      return;
    }
    if (action.type === 'init') {
      try {
        caches.delete('v1').then(() => {
          dumber = new Dumber({
            skipModuleLoader: true,
            cache: false,
            depsFinder: findDeps,
            prepend: ['https://cdn.jsdelivr.net/npm/dumber-module-loader@1.0.0/dist/index.min.js'],
            deps: [
              {name: 'vue', main: 'dist/vue.js', lazyMain: true}
            ]
          });
          console.log('created dumber');
          event.source.postMessage({type: 'worker-ready'});
        });
      } catch (e) {
        console.error(e);
        event.source.postMessage({type: 'worker-error', error: e.message});
      }
    } else if (action.type === 'update-file') {
      if (action.file.path.startsWith('src/') || !action.file.path.match(/[^/]+\.html/)) {
        console.log('capture ' + action.file.path);
        dumber.capture(action.file);
      } else {
        let wantedPath = action.file.path;
        if (wantedPath === 'index.html') {
          wantedPath = '';
        }
        caches.open('v1').then(function(cache) {
          cache.put(
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
      dumber.resolve()
        .then(function() { return dumber.bundle(); })
        .then(function(bundles) {
          console.log('Done build!');
          // only use single bundle
          var bundle = bundles['entry-bundle'];
          var all = [];
          var f;

          for (f of bundle.files) all.push(f.contents);
          all.push('requirejs.config(' + JSON.stringify(bundle.config, null , 2) + ');');

          caches.open('v1').then(function(cache) {
            cache.put(
              new Request('/dist/entry-bundle.js', { mode: 'no-cors' }),
              new Response(all.join('\n'), {
                status: 200,
                statusText: 'OK',
                headers: {
                  'Content-Type': 'application/javascript'
                }
              })
            );
            event.source.postMessage({type: 'build-done'});
          });
        })
        .catch(function(e) {
          console.error(e);
          event.source.postMessage({type: 'worker-error', error: e.message});
        });
    }
  });
});

self.addEventListener('fetch', function(event) {
  console.log('fetch ', event);
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) return response;
      return fetch(event.request);
    })
  );
});
