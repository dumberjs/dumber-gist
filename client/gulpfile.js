const dumber = require('gulp-dumber');
const auDepsFinder = require('aurelia-deps-finder');
const del = require('del');
const fs = require('fs');
const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-dart-sass');
const plumber = require('gulp-plumber');
const merge2 = require('merge2');
const postcss = require('gulp-postcss');
const terser = require('gulp-terser');
const gulpif = require('gulp-if');
const autoprefixer = require('autoprefixer');
const postcssUrl = require('postcss-url');

const {NODE_ENV} = process.env;

const isProd = NODE_ENV === 'production';
const isTest = NODE_ENV === 'test';

const domainSubfix = isProd ? 'app' : 'local';
const hostnames = {
  host: `gist.dumber.${domainSubfix}`,
  clientUrl: `https://gist.dumber.${domainSubfix}`,
  cacheUrl: `https://cache.dumber.${domainSubfix}`,
  oauthUrl: `https://github-oauth.gist.dumber.${domainSubfix}`
};
const HOST_NAMES = `;var HOST_NAMES = ${JSON.stringify(hostnames)};`;

const loaderDist = isTest ?
  'dumber-module-loader dist content' :
  fs.readFileSync(require.resolve('dumber-module-loader'), 'utf8');
const DUMBER_MODULE_LOADER_DIST = `;var DUMBER_MODULE_LOADER_DIST = ${JSON.stringify(loaderDist)};`;

const finalBundleNames = {};

const drApp = dumber({
  src: 'src',
  depsFinder: auDepsFinder,
  hash: isProd && !isTest,
  prepend: [
    HOST_NAMES
  ],
  append: [
    isTest && "requirejs(['../test/setup', /^\\.\\.\\/test\\/.+\\.spec$/]);",
    // To bypass monaco's check on AMD loader.
    // require.getConfig is an API provided by monaco's built-in AMD loader.
    "\nrequire.getConfig = function() { return null; };\n"
  ],
  deps: [
    // htmlhint strangely ships with missing "module": "src/core.js".
    {name: 'htmlhint', main: 'dist/htmlhint.js'}
  ],
  codeSplit: isTest ? undefined : (moduleId, packageName) => {
    if (!packageName) return 'app-bundle';
    if (packageName === 'monaco-editor') return 'monaco-bundle';
    if (packageName.includes('aurelia')) return 'au-bundle';
    return 'deps-bundle';
  },
  onManifest: isTest ? undefined : filenameMap => {
    finalBundleNames['entry-bundle.js'] = filenameMap['entry-bundle.js'];
  }
});

function clean() {
  return del(['dist', 'index.html']);
}

exports.clean = clean;

// clear dumber (tracing) cache
exports['clear-cache'] = function () {
  return drApp.clearCache();
};

function buildJs(src) {
  const transpile = babel();

  return gulp.src(src, {sourcemaps: !isProd, since: gulp.lastRun(buildApp)})
  .pipe(gulpif(!isProd, plumber()))
  .pipe(transpile);
}

function buildCss(src) {
  return gulp.src(src, {sourcemaps: !isProd})
  .pipe(sass.sync().on('error', sass.logError))
  .pipe(postcss([
    autoprefixer(),
    postcssUrl({url: 'inline', encodeType: 'base64'})
  ]));
}

function buildApp() {
  return merge2(
    gulp.src('src/**/*.{json,html}', {since: gulp.lastRun(buildApp)}),
    buildJs(isTest ? '{src,test}/**/*.js' : 'src/**/*.js'),
    buildCss('src/**/*.scss')
  )
  .pipe(drApp())
  .pipe(gulpif(isProd, terser({compress: false})))
  .pipe(gulp.dest('dist', {sourcemaps: isProd ? false : (isTest ? true : '.')}));
}

exports.buildApp = buildApp;

const drWorker = dumber({
  src: 'src-worker',
  hash: isProd,
  entryBundle: 'bundler-worker',
  prepend: [
    HOST_NAMES,
    DUMBER_MODULE_LOADER_DIST
  ],
  append: [
    isTest ?
      `requirejs(['../test-worker/setup', /^\\.\\.\\/test-worker\\/.+\\.spec$/]).catch(console.error);` :
      "requirejs(['index']);"
  ],
  codeSplit: isTest ? undefined : (moduleId, packageName) => {
    if (!packageName) return 'bundler-code';
    if (packageName === 'typescript') return 'bundler-ts';
    if (packageName.startsWith('@aurelia/')) return 'bundler-au2';
    if (packageName === 'less') return 'bundler-less';
    if (packageName === 'sass.js') return 'bundler-sass';
    if (packageName === 'svelte') return 'bundler-svelte';
    if (packageName) return 'bundler-other-deps';
  },
  onManifest: function(filenameMap) {
    finalBundleNames['bundler-worker.js'] = filenameMap['bundler-worker.js'];
  }
});

function _buildWorker() {
  return gulp.src(
    isTest ? '{src-worker,test-worker}/**/*.js' : 'src-worker/**/*.js',
    {sourcemaps: !isProd, since: gulp.lastRun(buildWorker)}
  )
    .pipe(gulpif(!isProd, plumber()))
    .pipe(babel())
    .pipe(drWorker())
    .pipe(gulpif(isProd, terser({compress: false, mangle: false})))
    .pipe(gulp.dest('dist', {sourcemaps: isProd ? false : (isTest ? true : '.')}));
}

function _cleanupEnv() {
  if (isProd) process.env.NODE_ENV = '';
  return Promise.resolve();
}

function _restoreEnv() {
  if (isProd) process.env.NODE_ENV = 'production';
  return Promise.resolve();
}

// Have to build worker (dumber bundler in browser) with
// NODE_ENV as "", because we want dumber to run in "development"
// mode in browser for dumber gist.
const buildWorker = gulp.series(
  _cleanupEnv,
  _buildWorker,
  _restoreEnv
);

exports.buildWorker = buildWorker;

function writeIndex() {
  const indexHtml = fs.readFileSync('_index.html', 'utf-8')
    .replace('json.worker.js', finalBundleNames['json.worker.js'])
    .replace('css.worker.js', finalBundleNames['css.worker.js'])
    .replace('html.worker.js', finalBundleNames['html.worker.js'])
    .replace('ts.worker.js', finalBundleNames['ts.worker.js'])
    .replace('editor.worker.js', finalBundleNames['editor.worker.js'])
    .replace('entry-bundle.js', finalBundleNames['entry-bundle.js'])
    .replace('bundler-worker.js', finalBundleNames['bundler-worker.js']);

  fs.writeFileSync('index.html', indexHtml);
  return Promise.resolve();
}

function buildMonacoWorkers() {
  if (isTest) return Promise.resolve();

  const json = dumber({
    src: 'monaco-workers',
    hash: isProd,
    entryBundle: 'json.worker',
    append: ["requirejs(['json.js']);"],
    onManifest: function(filenameMap) {
      finalBundleNames['json.worker.js'] = filenameMap['json.worker.js'];
    }
  });

  const css = dumber({
    src: 'monaco-workers',
    hash: isProd,
    entryBundle: 'css.worker',
    append: ["requirejs(['css.js']);"],
    onManifest: function(filenameMap) {
      finalBundleNames['css.worker.js'] = filenameMap['css.worker.js'];
    }
  });

  const editor = dumber({
    src: 'monaco-workers',
    hash: isProd,
    entryBundle: 'editor.worker',
    append: ["requirejs(['editor.js']);"],
    onManifest: function(filenameMap) {
      finalBundleNames['editor.worker.js'] = filenameMap['editor.worker.js'];
    }
  });

  const html = dumber({
    src: 'monaco-workers',
    hash: isProd,
    entryBundle: 'html.worker',
    append: ["requirejs(['html.js']);"],
    onManifest: function(filenameMap) {
      finalBundleNames['html.worker.js'] = filenameMap['html.worker.js'];
    }
  });

  const ts = dumber({
    src: 'monaco-workers',
    hash: isProd,
    entryBundle: 'ts.worker',
    append: ["requirejs(['ts.js']);"],
    onManifest: function(filenameMap) {
      finalBundleNames['ts.worker.js'] = filenameMap['ts.worker.js'];
    }
  });

  return merge2(
    gulp.src('monaco-workers/json.js').pipe(json()),
    gulp.src('monaco-workers/css.js').pipe(css()),
    gulp.src('monaco-workers/editor.js').pipe(editor()),
    gulp.src('monaco-workers/html.js').pipe(html()),
    gulp.src('monaco-workers/ts.js').pipe(ts())
  ).pipe(gulp.dest('dist'));
}

function copyMonacoFont() {
  return gulp.src('node_modules/monaco-editor/esm/vs/base/browser/ui/codiconLabel/codicon/*.ttf')
    .pipe(gulp.dest('monaco-editor/esm/vs/base/browser/ui/codiconLabel/codicon/'));
}
const build = gulp.series(
  clean,
  buildMonacoWorkers,
  copyMonacoFont,
  buildApp,
  buildWorker,
  writeIndex,
);

exports.build = build;

function watch() {
  gulp.watch('src/**/*', buildApp);
  gulp.watch('src-worker/**/*', buildWorker);
}

exports.watch = gulp.series(
  build,
  watch
);

exports.default = exports.watch;

