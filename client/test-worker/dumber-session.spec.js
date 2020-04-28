import test from 'tape';
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
  await session.init(config);
  t.ok(session.isInitialised);

  t.deepEqual(session.config, config);
  t.deepEqual(session.instance.config, {
    skipModuleLoader: true,
    depsFinder: undefined,
    cache: dumberCache,
    packageFileReader: jsdelivr.create,
    prepend: [HISTORY_HACK_JS, CONSOLE_HACK_JS, FORWORD_SHORTCUTS, 'dumber-module-loader dist content'],
    paths: {'../src': ''},
    deps: [
      {name: 'vue', main: 'dist/vue.js', version: '2.1.0', lazyMain: true}
    ]
  });
});

test('DumberSession reuses existing dumber instance', async t => {
  const session = new DumberSession(Dumber, auFindDeps, depsResolver, transpiler, dumberCache, jsdelivr);
  t.notOk(session.isInitialised);

  const config = {};
  await session.init(config);
  t.ok(session.isInitialised);

  t.deepEqual(session.config, config);
  t.deepEqual(session.instance.config, {
    skipModuleLoader: true,
    depsFinder: undefined,
    cache: dumberCache,
    packageFileReader: jsdelivr.create,
    prepend: [HISTORY_HACK_JS, CONSOLE_HACK_JS, FORWORD_SHORTCUTS, 'dumber-module-loader dist content'],
    paths: {'../src': ''},
    deps: []
  });
  const instance1 = session.instance;

  await session.update([
    { filename: 'index.html', content: 'index-html' }
  ]);

  await session.init(config);
  t.ok(session.isInitialised);

  t.deepEqual(session.config, config);
  t.equal(session.instance, instance1);
});

test('DumberSession replaces existing dumber instance with different config', async t => {
  const session = new DumberSession(Dumber, auFindDeps, depsResolver, transpiler, dumberCache, jsdelivr);
  t.notOk(session.isInitialised);

  const config = {deps: {vue: '^2.0.0'}};
  await session.init(config);
  t.ok(session.isInitialised);

  t.deepEqual(session.config, config);
  t.deepEqual(session.instance.config, {
    skipModuleLoader: true,
    depsFinder: undefined,
    cache: dumberCache,
    packageFileReader: jsdelivr.create,
    prepend: [HISTORY_HACK_JS, CONSOLE_HACK_JS, FORWORD_SHORTCUTS, 'dumber-module-loader dist content'],
    paths: {'../src': ''},
    deps: [
      {name: 'vue', main: 'dist/vue.js', version: '2.1.0', lazyMain: true}
    ]
  });
  const instance1 = session.instance;

  const config2 = {deps: {'aurelia-bootstrapper': '^2.0.0'}};
  await session.init(config2);
  t.ok(session.isInitialised);

  t.deepEqual(session.config, config2);
  t.notOk(session.instance === instance1);
  t.deepEqual(session.instance.config, {
    skipModuleLoader: true,
    depsFinder: auFindDeps.findDeps,
    cache: dumberCache,
    packageFileReader: jsdelivr.create,
    prepend: [HISTORY_HACK_JS, CONSOLE_HACK_JS, FORWORD_SHORTCUTS, 'dumber-module-loader dist content'],
    paths: {'../src': ''},
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

  return session.update([
    { filename: 'index.html', content: 'index-html' },
    { filename: 'src/main.js', content: 'main' },
    { filename: 'src/app.js', content: 'app' },
    { filename: 'src/app.html', content: 'app-html' }
  ]).then(
    () => t.fail('should not pass'),
    err => t.ok(err instanceof DumberUninitializedError)
  );
});

test('DumberSession cannot build before init', async t => {
  const session = new DumberSession(Dumber, auFindDeps, depsResolver, transpiler, dumberCache, jsdelivr);

  try {
    await session.build();
    t.fail('should not pass');
  } catch (err) {
    t.ok(err instanceof DumberUninitializedError);
  }

  return session.build().then(
    () => t.fail('should not pass'),
    err => t.ok(err instanceof DumberUninitializedError)
  );
});

test('DumberSession bundles', async t => {
  const session = new DumberSession(Dumber, auFindDeps, depsResolver, transpiler, dumberCache, jsdelivr);

  const visibleFiles = await session.bundle([
    { filename: 'index.html', content: 'index-html' },
    { filename: 'src/main.js', content: 'main' },
    { filename: 'src/app.js', content: 'app' },
    { filename: 'src/app.html', content: 'app-html' },
    { filename: 'src/app.css', content: 'app-css' }
  ]);
  t.equal(session.instance.files.length, 4);

  t.deepEqual(visibleFiles, [
    {
      filename: 'index.html',
      content: 'index-html'
    },
    // Allow manual <link ref="stylesheet" href="/src/app.css">
    {
      filename: 'src/app.css',
      content: 'app-css'
    },
    {
      filename: 'dist/entry-bundle.js',
      content: `main
app
app-html
app-css
requirejs.config({
  "foo": "bar"
});`
    }
  ]);
});