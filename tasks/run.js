const gulp = require('gulp');
const bs = require('browser-sync').create();
const historyApiFallback = require('connect-history-api-fallback/lib');
const clean = require('./clean');
const build = require('./build');
const buildWorker = require('./build-worker');

// Use browserSync as dev server
const serve = gulp.series(
  build,
  buildWorker,
  function startServer(done) {
    bs.init({
      https: true,
      host: 'gist-code.com',
      port: 443,
      ghostMode: false,
      online: false,
      open: !process.env.CI,
      logLevel: 'silent', // or 'debug'
      server: {
        baseDir: ['.'],
        middleware: [
          // connect-history-api-fallback is a tool to help SPA dev.
          // So in dev mode, http://localhost:port/some/route will get
          // the same /index.html as content, instead off 404 at /some/route.html
          historyApiFallback(),
          function(req, res, next) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            next();
          }
        ]
      }
    }, function(err, bs) {
      if (err) return done(err);
      let urls = bs.options.get('urls').toJS();
      console.log(`Application Available At: ${urls.local}`);
      console.log(`BrowserSync Available At: ${urls.ui}`);
      done();
    });
  }
)

// Reload browserSync
function reload(done) {
  console.log('Refreshing the browser');
  bs.reload();
  done();
}

function watch() {
  return gulp.watch('src/**/*', gulp.series(build, reload));
}

module.exports = gulp.series(
  clean,
  serve,
  watch
);
