const gulp = require('gulp');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const terser = require('gulp-terser');
const gulpif = require('gulp-if');
const {isRelease, isTest} = require('./_env');
const dr = require('./_dumber');

function buildWorker() {
  return gulp.src(
    isTest ? '{src,test}/**/*.js' : 'src/**/*.js',
    {sourcemaps: !isRelease, since: gulp.lastRun(buildWorker)}
  )
    .pipe(gulpif(!isRelease, plumber()))
    .pipe(babel())
    .pipe(dr())
    .pipe(gulpif(isRelease, terser({compress: false, mangle: false})))
    .pipe(gulp.dest('.', {sourcemaps: isRelease ? false : (isTest ? true : '.')}));
}

module.exports = buildWorker;
