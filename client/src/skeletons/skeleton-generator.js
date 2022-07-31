import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {EditSession} from '../edit/edit-session';
import none from './none';
import aurelia from './aurelia';
import aurelia2 from './aurelia2';
import backbone from './backbone';
import inferno from './inferno';
import preact from './preact';
import react from './react';
import svelte from './svelte';
import vue from './vue';
import _ from 'lodash';

const skeletons = {
  none,
  aurelia,
  aurelia2,
  backbone,
  inferno,
  preact,
  react,
  svelte,
  vue
};

const JSDELIVR_CDN_DOMAIN = HOST_NAMES.jsdelivrCdnDomain;

const DEFAULT_JASMINE_INDEX_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Unit Tests</title>
<link rel="stylesheet" href="//${JSDELIVR_CDN_DOMAIN}/npm/jasmine-core@3/lib/jasmine-core/jasmine.min.css">
</head>
<body>
<script src="//${JSDELIVR_CDN_DOMAIN}/npm/jasmine-core@3/lib/jasmine-core/jasmine.min.js"></script>
<script src="//${JSDELIVR_CDN_DOMAIN}/npm/jasmine-core@3/lib/jasmine-core/jasmine-html.min.js"></script>
<script src="//${JSDELIVR_CDN_DOMAIN}/npm/jasmine-core@3/lib/jasmine-core/boot0.min.js"></script>
<script src="//${JSDELIVR_CDN_DOMAIN}/npm/jasmine-core@3/lib/jasmine-core/boot1.min.js"></script>
<script src="/dist/entry-bundle.js"></script>
<script>
requirejs([
  // Load test/setup if exists.
  // or tests/setup, __test__/setup, __tests__/setup
  // also matches files in any src/**/__test__
  /\\/(tests?|__tests?__)\\/setup$/,
  // Load test/**/*.spec.js if exists.
  // or tests/**/*.test.js, __test__/**/*.spec.js
  // also matches files in any src/**/__test__
  /\\.(spec|test)$/
]);
</script>
</body>
</html>
`;

const DEFAULT_MOCHA_INDEX_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Unit Tests</title>
<link rel="stylesheet" href="//${JSDELIVR_CDN_DOMAIN}/npm/mocha@7/mocha.css">
</head>
<body>
<div id="mocha"></div>
<script src="//${JSDELIVR_CDN_DOMAIN}/npm/mocha@7/mocha.js"></script>
<script class="mocha-init">
mocha.setup({ui: "bdd", reporter: "html"});
</script>
<script src="/dist/entry-bundle.js"></script>
<script>
requirejs([
  // Load test/setup if exists.
  // or tests/setup, __test__/setup, __tests__/setup
  // also matches files in any src/**/__test__
  /\\/(tests?|__tests?__)\\/setup$/,
  // Load test/**/*.spec.js if exists.
  // or tests/**/*.test.js, __test__/**/*.spec.js
  // also matches files in any src/**/__test__
  /\\.(spec|test)$/
]);
</script>
<script class="mocha-exec">
mocha.run();
</script>
</body>
</html>
`;

const DEFAULT_zora_INDEX_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Unit Tests</title>
</head>
<body>
<p>See console for TAP output.</p>
<script src="/dist/entry-bundle.js"></script>
<script>
requirejs([
  // Load test/setup if exists.
  // or tests/setup, __test__/setup, __tests__/setup
  // also matches files in any src/**/__test__
  /\\/(tests?|__tests?__)\\/setup$/,
  // Load test/**/*.spec.js if exists.
  // or tests/**/*.test.js, __test__/**/*.spec.js
  // also matches files in any src/**/__test__
  /\\.(spec|test)$/
]);
</script>
</body>
</html>
`;

@inject(EventAggregator, EditSession)
export class SkeletonGenerator {
  constructor(ea, session) {
    this.ea = ea;
    this.session = session;
  }

  generate({framework, ...others}) {
    const skeleton = skeletons[framework];
    if (!skeleton) {
      this.ea.publish('warning', `Framework ${framework} is not yet implemented.`);
      return;
    }

    const files = skeleton(others);
    let devDependencies;

    if (others.testFramework === 'jasmine') {
      // devDependencies = {'jasmine-core': '^3.0.0'};
      files.push({
        filename: 'run-tests.html',
        content: DEFAULT_JASMINE_INDEX_HTML
      });
    } else if (others.testFramework === 'mocha') {
      // devDependencies = {'mocha': '^7.0.0'};
      files.push({
        filename: 'run-tests.html',
        content: DEFAULT_MOCHA_INDEX_HTML
      });
    } else if (others.testFramework === 'zora') {
      // devDependencies = {'zora': '^4.0.0'};
      files.push({
        filename: 'run-tests.html',
        content: DEFAULT_zora_INDEX_HTML
      });
    }

    const filesWithMeta = _.map(files, f => {
      let content = f.content;
      if (f.filename === 'package.json') {
        const meta = {};
        meta.dependencies = f.dependencies || {};
        if (devDependencies) meta.devDependencies = devDependencies;
        content = JSON.stringify(meta, null, 2) + '\n';
      }
      return {
        filename: f.filename,
        content,
        isChanged: true
      };
    });
    this.session.importData({files: filesWithMeta});
    this.ea.publish('generated-from-skeleton');
  }
}
