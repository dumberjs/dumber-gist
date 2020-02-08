import _ from 'lodash';
import {Factory, inject} from 'aurelia-dependency-injection';
import Dumber from 'dumber';
import findDeps from 'aurelia-deps-finder';
import {DepsResolver} from './deps-resolver';
import {Transpiler} from './transpiler';

export const HISTORY_HACK_JS = `(function() {
  var oldPushState = history.pushState;
  var oldReplaceState = history.replaceState;
  var oldBack = history.back;
  var oldForward = history.forward;
  var oldGo = history.go;

  history.pushState = function() {
    parent.postMessage({
      type: 'history-push-state',
      title: arguments[1],
      url: arguments[2]
    }, '*');
    return oldPushState.apply(this, arguments);
  };

  history.replaceState = function() {
    parent.postMessage({
      type: 'history-replace-state',
      title: arguments[1],
      url: arguments[2]
    }, '*');
    return oldReplaceState.apply(this, arguments);
  };

  history.back = function() {
    parent.postMessage({
      type: 'history-go',
      delta: -1
    }, '*');
    return oldBack.apply(this, arguments);
  };

  history.forward = function() {
    parent.postMessage({
      type: 'history-go',
      delta: 1
    }, '*');
    return oldForward.apply(this, arguments);
  };

  history.go = function() {
    parent.postMessage({
      type: 'history-go',
      delta: arguments[0]
    }, '*');
    return oldGo.apply(this, arguments);
  };

  addEventListener('message', function (event) {
    var action = event.data;
    if (!action || !action.type) return;

    if (action.type === 'history-back') {
      history.back();
    } else if (action.type === 'history-forward') {
      history.forward();
    }
  });
})();
`;

export const CONSOLE_HACK_JS = `(function() {
  function patch(method) {
    var old = console[method];
    console[method] = function() {
      var args = Array.prototype.slice.call(arguments, 0);
      parent.postMessage({
        type: 'app-console',
        method: method,
        args: args
      }, '*');
      if (old) old.apply(console, arguments);
    };
  }

  var methods = ['log', 'error', 'warn', 'dir', 'debug', 'info', 'trace'];
  var i;
  for (i = 0; i < methods.length; i++) {
    patch(methods[i]);
  }
})();
`;

export class DumberUninitializedError extends Error {
  constructor() {
    super('dumber instance is not initialized!')
  }
}

@inject(Factory.of(Dumber), findDeps, DepsResolver, Transpiler)
export class DumberSession {
  constructor(Dumber, auFindDeps, depsResolver, transpiler) {
    this.Dumber = Dumber;
    this.auFindDeps = auFindDeps;
    this.instance = null;
    this.config = null;
    this.depsResolver = depsResolver;
    this.transpiler = transpiler;
  }

  get isInitialised() {
    return !!this.instance;
  }

  async init(config, dumberCache) {
    if (this.instance && _.isEqual(this.config, config)) {
      // reuse existing dumber
      return {isNew: false};
    }

    const deps = await this.depsResolver.resolve(config.deps);
    // console.log('[dumber] Resolved Dependencies ' + deps.length);
    // _.each(deps, ({name, version}) => {
    //   console.log(`[dumber] ${version.padEnd(10)} ${name}`);
    // });
    // console.log(`[dumber] `);

    const isAurelia1 = _.some(deps, {name: 'aurelia-bootstrapper'});
    this.config = config;
    this.instance = new this.Dumber({
      skipModuleLoader: true,
      depsFinder: isAurelia1 ? this.auFindDeps : undefined,
      // Cache is implemented in main window.
      // Because we want to share cache on domain gist.dumber.app
      // for all instance of ${app-id}.gist.dumber.app
      cache: dumberCache,
      prepend: [
        HISTORY_HACK_JS,
        CONSOLE_HACK_JS,
        'https://cdn.jsdelivr.net/npm/dumber-module-loader/dist/index.min.js'
      ],
      deps: deps
    });

    let transpilerOptions = {};
    if (_.some(deps, {name: 'preact'})) {
      transpilerOptions.jsxPragma = 'h';
      transpilerOptions.jsxFrag = 'Fragment';
    } else if (_.some(deps, {name: 'inferno'})) {
      transpilerOptions.jsxPragma = 'Inferno.createVNode';
    }
    this.transpilerOptions = transpilerOptions;
    return {isNew: true};
  }

  async update(files) {
    if (!this.isInitialised) {
      throw new DumberUninitializedError();
    }

    for (let i = 0, ii = files.length; i < ii; i++) {
      const file = files[i];
      if (file.filename.startsWith('src/') || !file.filename.match(/[^/]+\.html/)) {
        const transpiledFile = await this.transpiler.transpile(file, files, this.transpilerOptions);
        if (!transpiledFile) continue;

        // let log = '[dumber] Capture ' + file.filename;
        // if (transpiledFile.filename !== file.filename) {
        //   log += ` (transpiled to ${transpiledFile.filename})`;
        // }
        // console.log(log);

        await this.instance.capture({
          path: transpiledFile.filename,
          moduleId: transpiledFile.moduleId,
          contents: transpiledFile.content,
          sourceMap: transpiledFile.sourceMap
        });
      }
    }
  }

  // TODO add source map support, copy code from gulp-dumber
  async build() {
    if (!this.isInitialised) {
      throw new DumberUninitializedError();
    }

    await this.instance.resolve();
    const bundles = await this.instance.bundle();
    // only use single bundle
    const bundle = bundles['entry-bundle'];
    const all = [];

    bundle.files.forEach(f => all.push(f.contents));
    all.push('requirejs.config(' + JSON.stringify(bundle.config, null , 2) + ');');

    console.log('[dumber] built dist/entry-bundle.js');
    return all.join('\n');
  }
}