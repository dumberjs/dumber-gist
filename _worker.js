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

self.importScripts('/dist/dumber-bundle.js');

requirejs(['dumber'], function(Dumber) {
  var dumber;
  console.log('loaded dumber module');

  self.addEventListener('message', function(event) {
    var action = event.data;
    // event.source.postMessage({echo: action});

    if (action.type === 'init') {
      try {
        // TODO make sure only init once.
        // TODO make sure worker is not shared.
        dumber = new Dumber({
          skipModuleLoader: true,
          prepend: ['https://cdn.jsdelivr.net/npm/dumber-module-loader@1.0.0/dist/index.min.js']
        });
        console.log('created dumber');
        console.log('say worker-ready');
        event.source.postMessage('worker-ready');
      } catch (e) {
        console.error(e);
        event.source.postMessage(e.message);
      }
    } else if (action.type === 'update-file') {
      if (action.file.path.startsWith('src/') || action.file.path.startsWith('test/')) {
        dumber.capture(action.file);
      } else {
        caches.open('v1').then(function(cache) {
          cache.put(
            new Request('/' + action.file.path, { mode: 'no-cors' }),
            new Response(action.file.contents, {
              status: 200,
              statusText: 'OK',
              headers: {
                'Content-Type': action.file.type
              }
            })
          );
        })
      }
    } else if (action.type === 'build') {
      dumber.resolve()
        .then(function() { return dumber.bundler(); })
        .then(function(bundles) {
          // only use single bundle
          var bundle = bundles[0];
          var all = [];
          var f;

          for (f of bundle.appendFiles) all.push(f.contents);
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
            event.source.postMessage('build-done');
          });
        });
    }
  });

  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response ? response : fetch(event.request);
      })
    );
  });
});

