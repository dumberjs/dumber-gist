import test from 'tape-promise/tape';
import _ from 'lodash';
import {
  HISTORY_HACK_JS,
  CONSOLE_HACK_JS,
  FORWORD_SHORTCUTS,
  DumberUninitializedError,
  DumberSession} from '../src-worker/dumber-session';

class Dumber {
  constructor(config) {
    this.config = config;
    this.files = [];
  }

  async capture(unit) {
    this.files.push(unit);
  }

  async resolve() {}
  async bundle() {
    return {
      'entry-bundle': {
        files: this.files,
        config: {foo: 'bar'}
      }
    };
  }
}

const auFindDeps = {
  findDeps() {}
};

const dumberCache = {
  async getCache() {},
  async setCache() {},
  async clearCache() {},
};

const jsdelivr = {
  create() {}
};

const depsResolver = {
  async resolve(deps) {
    if (!deps || Object.keys(deps).length === 0) return [];

    if (_.isEqual(deps, {'aurelia-bootstrapper': '^2.0.0'})) {
      return [
        {name: 'aurelia-binding', version: '2.0.0', lazyMain: true},
        {name: 'aurelia-bootstrapper', version: '2.3.3', lazyMain: true},
        {name: 'aurelia-framework', version: '1.0.0', lazyMain: true}
      ];
    } else if (_.isEqual(deps, {'vue': '^2.0.0'})) {
      return [
        {name: 'vue', version: '2.1.0', main: 'dist/vue.js', lazyMain: true}
      ];
    }
  }
};

const transpiler = {
  async transpile(file) {
    return file;
  }
}

test('DumberSession initialises new dumber instance', async t => {
  const session = new DumberSession(Dumber, auFindDeps, depsResolver, transpiler, dumberCache, jsdelivr);
  t.notOk(session.isInitialised);

  const config = {deps: {vue: '^2.0.0'}};
  const data = await session.init(config);
  t.deepEqual(data, {isNew: true});
  t.ok(session.isInitialised);

  t.deepEqual(session.config, config);
  t.deepEqual(session.instance.config, {
    skipModuleLoader: true,
    depsFinder: undefined,
    cache: dumberCache,
    packageFileReader: jsdelivr.create,
    prepend: [HISTORY_HACK_JS, CONSOLE_HACK_JS, FORWORD_SHORTCUTS, 'dumber-module-loader dist content'],
    deps: [
      {name: 'vue', main: 'dist/vue.js', version: '2.1.0', lazyMain: true}
    ]
  });
});

test('DumberSession reuses existing dumber instance', async t => {
  const session = new DumberSession(Dumber, auFindDeps, depsResolver, transpiler, dumberCache, jsdelivr);
  t.notOk(session.isInitialised);

  const config = {};
  const data = await session.init(config);
  t.deepEqual(data, {isNew: true});
  t.ok(session.isInitialised);

  t.deepEqual(session.config, config);
  t.deepEqual(session.instance.config, {
    skipModuleLoader: true,
    depsFinder: undefined,
    cache: dumberCache,
    packageFileReader: jsdelivr.create,
    prepend: [HISTORY_HACK_JS, CONSOLE_HACK_JS, FORWORD_SHORTCUTS, 'dumber-module-loader dist content'],
    deps: []
  });
  const instance1 = session.instance;

  await session.update([
    { filename: 'index.html', content: 'index-html' }
  ]);

  const data2 = await session.init(config);
  t.deepEqual(data2, {isNew: false});
  t.ok(session.isInitialised);

  t.deepEqual(session.config, config);
  t.equal(session.instance, instance1);
});

test('DumberSession replaces existing dumber instance with different config', async t => {
  const session = new DumberSession(Dumber, auFindDeps, depsResolver, transpiler, dumberCache, jsdelivr);
  t.notOk(session.isInitialised);

  const config = {deps: {vue: '^2.0.0'}};
  const data = await session.init(config);
  t.deepEqual(data, {isNew: true});
  t.ok(session.isInitialised);

  t.deepEqual(session.config, config);
  t.deepEqual(session.instance.config, {
    skipModuleLoader: true,
    depsFinder: undefined,
    cache: dumberCache,
    packageFileReader: jsdelivr.create,
    prepend: [HISTORY_HACK_JS, CONSOLE_HACK_JS, FORWORD_SHORTCUTS, 'dumber-module-loader dist content'],
    deps: [
      {name: 'vue', main: 'dist/vue.js', version: '2.1.0', lazyMain: true}
    ]
  });
  const instance1 = session.instance;

  const config2 = {deps: {'aurelia-bootstrapper': '^2.0.0'}};
  const data2 = await session.init(config2);
  t.deepEqual(data2, {isNew: true});
  t.ok(session.isInitialised);

  t.deepEqual(session.config, config2);
  t.notOk(session.instance === instance1);
  t.deepEqual(session.instance.config, {
    skipModuleLoader: true,
    depsFinder: auFindDeps.findDeps,
    cache: dumberCache,
    packageFileReader: jsdelivr.create,
    prepend: [HISTORY_HACK_JS, CONSOLE_HACK_JS, FORWORD_SHORTCUTS, 'dumber-module-loader dist content'],
    deps: [
      {name: 'aurelia-binding', version: '2.0.0', lazyMain: true},
      {name: 'aurelia-bootstrapper', version: '2.3.3', lazyMain: true},
      {name: 'aurelia-framework', version: '1.0.0', lazyMain: true}
    ]
  });
});

test('DumberSession builds', async t => {
  const session = new DumberSession(Dumber, auFindDeps, depsResolver, transpiler, dumberCache, jsdelivr);

  await session.init({});
  await session.update([
    { filename: 'index.html', content: 'index-html' },
    { filename: 'src/main.js', content: 'main' },
    { filename: 'src/app.js', content: 'app' },
    { filename: 'src/app.html', content: 'app-html' }
  ]);
  t.equal(session.instance.files.length, 3);

  const entry = await session.build();
  t.equal(entry, `main
app
app-html
requirejs.config({
  "foo": "bar"
});`);
});

test('DumberSession cannot update before init', async t => {
  const session = new DumberSession(Dumber, auFindDeps, depsResolver, transpiler, dumberCache, jsdelivr);

  await t.rejects(async () => {
    await session.update([
      { filename: 'index.html', content: 'index-html' },
      { filename: 'src/main.js', content: 'main' },
      { filename: 'src/app.js', content: 'app' },
      { filename: 'src/app.html', content: 'app-html' }
    ]);
  }, {instanceOf: DumberUninitializedError});
});

test('DumberSession cannot build before init', async t => {
  const session = new DumberSession(Dumber, auFindDeps, depsResolver, transpiler, dumberCache, jsdelivr);

  await t.rejects(async () => {
    await session.build();
  }, {instanceOf: DumberUninitializedError});
});
