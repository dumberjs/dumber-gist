// Use reflect.metadata polyfill from Aurelia 2
// To make both Aurelia 1 and 2 happy.
import '@aurelia/kernel';

import {DumberSession} from './dumber-session';
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
          args: args.map((a, i) => {
            // Remove the leading '[dumber] '
            if (i === 0) return a.slice(9);
            return a && a.toString ? a.toString() : a;
          })
        });
      }
      if (old) return old.apply(console, arguments);
    };
  }

  const methods = ['log', 'error', 'warn', 'dir', 'debug', 'info', 'trace'];
  methods.forEach(m => patch(m));
})();

const container = new Container();
const session = container.get(DumberSession);

onmessage = async function(event) {
  var action = event.data;
  const {id, type} = action;
  if (!type) return;

  try {
    let data;

    if (type === 'bundle') {
      data = await session.bundle(action.files);
    } else if (type === 'update-token') {
      // sync github token from main window
      global.__github_token = action.token;
    } else {
      throw new Error(`Unknown action: ${JSON.stringify(action)}`);
    }

    postMessage({type: 'ack', id, data});
  } catch (e) {
    console.error('[dumber] ' + e.message);
    postMessage({type: 'err', id, error: e.message});
  }
};

postMessage({type: 'bundler-worker-up'});
