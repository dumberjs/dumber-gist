const gulp = require('gulp');
const clean = require('./clean');
const build = require('./build');

function watch() {
  return gulp.watch('src/**/*', build);
}

module.exports = gulp.series(
  clean,
  watch
);
