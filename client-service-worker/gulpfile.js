const gulp = require('gulp');
const gap = require('gulp-append-prepend');
const del = require('del');
const merge2 = require('merge2');

const {NODE_ENV} = process.env;

const isProd = NODE_ENV === 'production';
const isTest = NODE_ENV === 'test';

const JSDELIVR_CDN_DOMAIN = process.env.JSDELIVR_CDN_DOMAIN ? process.env.JSDELIVR_CDN_DOMAIN.trim() : 'cdn.jsdelivr.net';

const hostnames = {
  jsdelivrCdnDomain: JSDELIVR_CDN_DOMAIN
};

const HOST_NAMES = `;var HOST_NAMES = ${JSON.stringify(hostnames)};`;


async function buildApp() {
  return merge2(
    gulp.src('src/**/*.js', { since: gulp.lastRun(buildApp)})
  )
  .pipe(gap.prependText(HOST_NAMES))
  .pipe(gulp.dest('dist'));
}

exports.buildApp = buildApp;


function clean() {
  return del(['dist', 'index.html']);
}

exports.clean = clean;

function copy() {
  return gulp.src('./src/*.html')
  .pipe(gulp.dest('./dist/'));
}

const build = gulp.series(
  clean,
  buildApp,
  copy
);

exports.build = build;


function watch() {
  gulp.watch('src/**/*', build);
}

exports.watch = gulp.series(
  build,
  watch
);

exports.default = exports.watch;

