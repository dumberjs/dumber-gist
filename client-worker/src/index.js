import "core-js/stable";
import {DumberSession} from './dumber-session';
import findDeps from 'aurelia-deps-finder';
import {Container} from 'aurelia-dependency-injection';

let parentWindow;
(function patchConsole() {
  function patch(method) {
    const old = console[method];
    console[method] = function() {
      const [msg, ...args] = Array.prototype.slice.call(arguments, 0);
      if (
        typeof msg === 'string' &&
        msg.startsWith('[dumber] ') &&
        parentWindow &&
        parentWindow.postMessage
      ) {
        parentWindow.postMessage({
          type: 'dumber-console',
          method: method,
          args: [msg.slice(9), ...args]
        });
      }
      if (old) old.apply(console, arguments);
    };
  }

  const methods = ['log', 'error', 'warn', 'dir', 'debug', 'info', 'trace'];
  methods.forEach(m => patch(m));
})();

const container = new Container();
container.registerInstance(findDeps, findDeps);
const session = container.get(DumberSession);
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

addEventListener('message', async function(event) {
  const {source} = event;
  parentWindow = source;

  var action = event.data;
  const {id, type} = action;
  if (!type) return;


  // Got traced cache from main page gist.dumber.app
  // See comments below for more details.
  if (type === 'got-cache') {
    const {hash, object} = action;
    if (cacheGetters[hash]) {
      cacheGetters[hash].resolve(object);
      delete cacheGetters[hash];
    }
    return;
  }

  try {
    let data;

    if (type === 'init') {
      // Let main page gist.dumber.app to cache traced result so that cached
      // result can be reused for all dumber-gist apps.
      // We cannot use service worker to cache traced result, because service
      // worker is in domain ${app-id}.gist.dumber.app, the cache will be
      // limited to be reused by this single app.
      const dumberCache = {
        getCache: (hash, meta) => {
          if (!cacheGetters[hash]) {
            let resolve;
            const getter = new Promise((_resolve, reject) => {
              resolve = _resolve;
              // Time out for remote cache;
              setTimeout(reject, 10000);
            });
            cacheGetters[hash] = {getter, resolve};
          }
          source.postMessage({type: 'get-cache', hash, meta});
          return cacheGetters[hash].getter;
        },
        setCache: function(hash, object) {
          source.postMessage({type: 'set-cache', hash, object});
        },
        clearCache: function() {
          source.postMessage({type: 'clear-cache'});
        }
      };

      data = await session.init(action.config, dumberCache);
    } else if (type === 'update') {
      data = await session.update(action.files);
    } else if (type === 'build') {
      data = await session.build();
    } else {
      throw new Error(`Unknown action: ${JSON.stringify(action)}`);
    }

    source.postMessage({type: 'ack', id, data});
  } catch (e) {
    console.error('[dumber] ' + e.message);
    source.postMessage({type: 'err', id, error: e.message});
  }
});

addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) return response;

      if (
        event.request.method === 'GET' &&
        event.request.url.startsWith(location.origin + '/')
      ) {
        const pathname = event.request.url.slice(location.origin.length);
        if (isLikeRoute(pathname)) {
          // Return /index.html for HTML5 routes
          return caches.match(location.origin + '/');
        }
      }

      return fetch(event.request);
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
