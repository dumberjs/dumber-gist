const gulp = require('gulp');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const terser = require('gulp-terser');
const gulpif = require('gulp-if');
const {isProduction, isTest} = require('./_env');
const dr = require('./_dumber');

function buildWorker() {
  return gulp.src(
    isTest ? '{src,test}/**/*.js' : 'src/**/*.js',
    {sourcemaps: !isProduction, since: gulp.lastRun(buildWorker)}
  )
    .pipe(gulpif(!isProduction, plumber()))
    .pipe(babel())
    .pipe(dr())
    .pipe(gulpif(isProduction, terser({compress: false, mangle: false})))
    .pipe(gulp.dest('.', {sourcemaps: isProduction ? false : (isTest ? true : '.')}));
}

module.exports = buildWorker;
