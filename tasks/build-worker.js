const gulp = require('gulp');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const terser = require('gulp-terser');
const gulpif = require('gulp-if');
const {isProduction} = require('./_env');
const dumber = require('gulp-dumber');
const fs = require('fs');

const dr = dumber({
  src: 'worker',
  // skipModuleLoader: true,
  // requirejs baseUrl, dumber default is "/dist"
  baseUrl: '/',
  // Turn on hash for production build
  hash: isProduction,
  entryBundle: 'worker-bundle',
  // prepend: ['../dumber-module-loader/dist/index.debug.js'],
  deps: [
    // semver main index.js uses lazyRequire, we need explicit
    // require for bundler to work.
    {name: 'semver', main: 'preload.js'}
  ],
  append: [
    "requirejs(['index']);"
  ],

  onManifest: function(filenameMap) {
    // Update boot-up-worker.html worker-bundle.js with worker-bundle.hash...js
    console.log('Update boot-up-worker.html with ' + filenameMap['worker-bundle.js']);
    const indexHtml = fs.readFileSync('_boot-up-worker.html').toString()
      .replace('worker-bundle.js', filenameMap['worker-bundle.js']);

    fs.writeFileSync('boot-up-worker.html', indexHtml);
  }
});

function buildWorker() {
  return gulp.src('worker/**/*.js', {sourcemaps: !isProduction, since: gulp.lastRun(buildWorker)})
    .pipe(gulpif(!isProduction, plumber()))
    .pipe(babel())
    .pipe(dr())
    .pipe(gulpif(isProduction, terser({compress: false})))
    .pipe(gulp.dest('.', {sourcemaps: isProduction ? false : '.'}));
}

module.exports = buildWorker;
