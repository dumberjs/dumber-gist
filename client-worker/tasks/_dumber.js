const dumber = require('gulp-dumber');
const fs = require('fs');
const {isRelease, isTest} = require('./_env');

module.exports = dumber({
  // requirejs baseUrl, dumber default is "/dist"
  baseUrl: '/',
  // Turn on hash for production build
  hash: isRelease,
  entryBundle: 'worker-bundle',
  prepend: [
    require.resolve('sass.js/dist/sass.sync.js')
  ],
  deps: [
    // semver main index.js uses lazyRequire, we need explicit
    // require for bundler to work.
    {name: 'semver', main: 'preload.js'}
  ],
  append: [
    isTest ?
      `requirejs(['../test/setup', /^\\.\\.\\/test\\/.+\\.spec$/]).catch(console.error);` :
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
