import "core-js/stable";
import {DumberSession} from './dumber-session';
import findDeps from 'aurelia-deps-finder';
import {Container} from 'aurelia-dependency-injection';

(function patchConsole() {
  function patch(method) {
    const old = console[method];
    console[method] = function() {
      const args = Array.prototype.slice.call(arguments, 0);
      if (
        typeof args[0] === 'string' &&
        args[0].startsWith('[dumber] ')
      ) {
        postMessage({
          type: 'dumber-console',
          method: method,
          args: args
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

onmessage = async function(event) {
  var action = event.data;
  const {id, type} = action;
  if (!type) return;

  // Got traced cache from main page gist.dumber.app
  // See comments below for more details.
  if (type === 'got-cache') {
    const {hash, object} = action;
    if (cacheGetters[hash]) {
      clearTimeout(cacheGetters[hash].timeout);
      cacheGetters[hash].resolve(object);
      delete cacheGetters[hash];
    }
    return;
  }

  try {
    let data;

    if (type === 'init') {
      // Let main page to deal with cache because main page knows GitHub access token.
      const dumberCache = {
        getCache: (hash, meta) => {
          if (!cacheGetters[hash]) {
            let resolve, timeout;
            const getter = new Promise((_resolve, reject) => {
              resolve = _resolve;
              // Time out for remote cache;
              timeout = setTimeout(reject, 10000);
            });
            cacheGetters[hash] = {getter, resolve, timeout};
          }
          postMessage({type: 'get-cache', hash, meta});
          return cacheGetters[hash].getter;
        },
        setCache: function(hash, object) {
          postMessage({type: 'set-cache', hash, object});
        },
        clearCache: function() {
          postMessage({type: 'clear-cache'});
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

    postMessage({type: 'ack', id, data});
  } catch (e) {
    console.error('[dumber] ' + e.message);
    postMessage({type: 'err', id, error: e.message});
  }
};
