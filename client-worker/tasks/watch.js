const gulp = require('gulp');
const clean = require('./clean');
const build = require('./build');

function watch() {
  return gulp.watch('src/**/*', { ignoreInitial: false }, build);
}

module.exports = gulp.series(
  clean,
  watch
);
