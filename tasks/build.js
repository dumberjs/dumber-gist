const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const merge2 = require('merge2');
const postcss = require('gulp-postcss');
const terser = require('gulp-terser');
const gulpif = require('gulp-if');
const autoprefixer = require('autoprefixer');
const postcssUrl = require('postcss-url');

const {isProduction, outputDir} = require('./_env');
const dr = require('./_dumber');

function buildJs(src) {
  const transpile = babel();

  return gulp.src(src, {sourcemaps: !isProduction, since: gulp.lastRun(build)})
  .pipe(gulpif(!isProduction, plumber()))
  .pipe(transpile);
}

function buildCss(src) {
  // scss is not one-to-one transform, cannot use {since: lastRun} to check changed file
  // scss is many-to-one transform (muliple _partial.scss files)
  return gulp.src(src, {sourcemaps: !isProduction})
  .pipe(sass().on('error', sass.logError))
  .pipe(postcss([
    autoprefixer(),
    // use postcss-url to inline any image/font/svg.
    // postcss-url by default use base64 for images, but
    // encodeURIComponent for svg which does NOT work on
    // some browsers.
    // Here we enforce base64 encoding for all assets to
    // improve compatibility on svg.
    postcssUrl({url: 'inline', encodeType: 'base64'})
  ]));
}

function build() {
  // Merge all js/css/html file streams to feed greedy dumber.
  // Note scss was transpiled to css file by gulp-sass.
  // dumber knows nothing about .ts/.less/.scss/.md files,
  // gulp-* plugins transpiled them into js/css/html before
  // sending to dumber.
  return merge2(
    gulp.src('src/**/*.json', {since: gulp.lastRun(build)}),
    gulp.src('src/**/*.html', {since: gulp.lastRun(build)}),
    buildJs('src/**/*.js'),
    buildCss('src/**/*.scss')
  )

  // Note we did extra call `dr()` here, this is designed to cater watch mode.
  // dumber here consumes (swallows) all incoming Vinyl files,
  // Then generates new Vinyl files for all output bundle files.
  .pipe(dr())

  // Terser fast minify mode
  // https://github.com/terser-js/terser#terser-fast-minify-mode
  // It's a good balance on size and speed to turn off compress.
  .pipe(gulpif(isProduction, terser({compress: false})))

  .pipe(gulp.dest(outputDir, {sourcemaps: isProduction ? false : '.'}));
}

module.exports = build;
