const gulp = require('gulp');
const terser = require('gulp-terser');
const gulpif = require('gulp-if');
const {isProduction, outputDir} = require('./_env');
const dumber = require('gulp-dumber');
const fs = require('fs');

const dr = dumber({
  // skipModuleLoader: true,
  // requirejs baseUrl, dumber default is "/dist"
  baseUrl: '/' + outputDir,
  // Turn on hash for production build
  hash: isProduction,
  entryBundle: 'dumber-bundle',
  deps: [
    "dumber",
  ],
  // prepend: ['../dumber-module-loader/dist/index.debug.js'],

  onManifest: function(filenameMap) {
    // Update index.html dumber-bundle.js with dumber-bundle.hash...js
    console.log('Update index.html with ' + filenameMap['dumber-bundle.js']);
    const workerJs = fs.readFileSync('_worker.js').toString()
      .replace('dumber-bundle.js', filenameMap['dumber-bundle.js']);

    fs.writeFileSync('worker.js', workerJs);
  }
});

function build() {
  const d = dr();
  d.end();

  return d
    .pipe(gulpif(isProduction, terser({compress: false})))
    .pipe(gulp.dest(outputDir, {sourcemaps: isProduction ? false : '.'}));
}

module.exports = build;
