const dumber = require('gulp-dumber');
const auDepsFinder = require('aurelia-deps-finder');
const fs = require('fs');
const {isProduction, isTest, outputDir} = require('./_env');

module.exports = dumber({
  // src folder is by default "src".
  // src: 'src',

  // requirejs baseUrl, dumber default is "/dist"
  baseUrl: '/' + outputDir,

  // can turn off cache for production build
  // cache: !isProduction,

  // entry bundle name, dumber default is "entry-bundle"
  // entryBundle: 'entry-bundle',

  // The special depsFinder to teach dumber about Aurelia convention.
  // Aurelia needs this special treatment because heavy convention.
  // No need for other frameworks like Vue/React/...
  depsFinder: auDepsFinder,

  // Turn on hash for production build
  hash: isProduction && !isTest,

  prepend: [
  ],

  // append after amd loader and all module definitions in entry bundle.
  append: [
    // Kick off all test files.
    // Note dumber-module-loader requirejs call accepts regex which loads all matched module ids!
    // Note all module ids are relative to dumber option "src" (default to 'src') folder.
    isTest && "requirejs(['../test/setup', /^\\.\\.\\/test\\/.+\\.spec$/]);"
  ],

  // Code split is intuitive and flexible.
  // code split asks you for a bundle name of every module, it gives you
  // two parameters:
  // moduleId:
  //   for local src file "src/foo/bar.js", the module id is "foo/bar"
  //   for local src file "src/foo/bar.css" (or any other non-js file), the module id is "foo/bar.css"
  //   for npm package file "node_modules/foo/bar.js", the module id is "foo/bar"
  // packageName:
  //   for any local src file, the package name is undefined
  //   for npm package file "node_modules/foo/bar.js", the package name is "foo"
  //   for npm package file "node_modules/@scoped/foo/bar.js", the package name is "@scoped/foo"

  // Here we skip code splitting in test mode.
  codeSplit: isTest ? undefined : function(moduleId, packageName) {
    // Here for any local src, put into app-bundle
    if (!packageName) return 'app-bundle';
    return 'deps-bundle';
    // The codeSplit func does not need to return a valid bundle name.
    // For any undefined return, dumber put the module into entry bundle,
    // this means no module can skip bundling.
  },

  // onManifest is an optional callback, it provides a file name map like:
  // {
  //   "some-bundle.js": "some-bundle.1234.js",
  //   "other-bundle.js": "other-bundle.3455.js"
  // }
  // Or when hash if off
  // {
  //   "some-bundle.js": "some-bundle.js",
  //   "other-bundle.js": "other-bundle.js"
  // }
  // If you turned on hash, you need this callback to update index.html
  onManifest: isTest ? undefined : function(filenameMap) {
    // Update index.html entry-bundle.js with entry-bundle.hash...js
    console.log('Update index.html with ' + filenameMap['entry-bundle.js']);
    const indexHtml = fs.readFileSync('_index.html').toString()
      .replace('entry-bundle.js', filenameMap['entry-bundle.js']);

    fs.writeFileSync('index.html', indexHtml);
  }
});
