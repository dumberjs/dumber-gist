const indexHtml = ext => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Dumber Gist</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no">
  <base href="/">
</head>
<!--
Dumber gist uses dumber bundler, the default bundle file
is /dist/entry-bundle.js.
The starting module is pointed to aurelia-bootstrapper
(data-main attribute on script) for Aurelia,
The aurelia bootstrapper then loads up user module "main"
(aurelia-app attribute on <body>) which is your src/main${ext}.
-->
<body aurelia-app="main">
  <script src="/dist/entry-bundle.js" data-main="aurelia-bootstrapper"></script>
</body>
</html>
`;

const mainJs = `export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging('info');
  aurelia.start().then(() => aurelia.setRoot());
}
`;

const mainTs = `import {Aurelia} from 'aurelia-framework';

export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging('info');
  aurelia.start().then(() => aurelia.setRoot());
}
`;

const appHtml = `<template>
  <!-- Try to create a css/scss/sass/less file then require it here -->
  <h1>\${message}</h1>
</template>
`;

const appJs = `export class App {
  message = 'Hello Aurelia!';
}
`;

const appTs = `export class App {
  public message: string = 'Hello Aurelia!';
}
`;

const testSetup = `import 'aurelia-polyfills';
import {initialize} from 'aurelia-pal-browser';
initialize();
`;

const jasmineTest = `import {StageComponent} from 'aurelia-testing';
import {bootstrap} from 'aurelia-bootstrapper';

describe('Component app', () => {
  let component;
  let model = {};

  beforeEach(() => {
    component = StageComponent
      .withResources('app')
      .inView('<app></app>')
      .boundTo(model);
  });

  afterEach(() => {
    if (component) {
      component.dispose();
      component = null;
    }
  });

  it('should render message', done => {
    component.create(bootstrap).then(() => {
      const view = component.element;
      expect(view.textContent.trim()).toBe('Hello Aurelia!');
      done();
    }).catch(e => {
      fail(e);
      done();
    });
  });
});
`;

const mochaTest = `import {expect} from 'chai';
import {StageComponent} from 'aurelia-testing';
import {bootstrap} from 'aurelia-bootstrapper';

describe('Component app', () => {
  let component;
  let model = {};

  beforeEach(() => {
    component = StageComponent
      .withResources('app')
      .inView('<app></app>')
      .boundTo(model);
  });

  afterEach(() => {
    if (component) {
      component.dispose();
      component = null;
    }
  });

  it('should render message', done => {
    component.create(bootstrap).then(() => {
      const view = component.element;
      expect(view.textContent.trim()).to.equal('Hello Aurelia!');
      done();
    }).catch(e => {
      done(e);
    });
  });
});
`;

const zoraTest = `import {StageComponent} from 'aurelia-testing';
import {bootstrap} from 'aurelia-bootstrapper';
import {test} from 'zora';

test('Component app should render message', async t => {
  let component = StageComponent
      .withResources('app')
      .inView('<app></app>')
      .boundTo({});

  return component.create(bootstrap)
  .then(
    () => {
      const view = component.element;
      t.equal(view.textContent.trim(), 'Hello Aurelia!');
    },
    e => {
      t.fail(e);
    }
  )
  .then(() => {
    if (component) {
      component.dispose();
      component = null;
    }
  });
});
`;

export default function({transpiler, testFramework}) {
  const ext = transpiler === 'typescript' ? '.ts' : '.js';
  const files = [
    {
      filename: 'package.json',
      dependencies: {'aurelia-bootstrapper': 'latest'}
    },
    {
      filename: 'index.html',
      content: indexHtml(ext)
    },
    {
      filename: `src/main${ext}`,
      content: ext === '.js' ? mainJs : mainTs
    },
    {
      filename: 'src/app.html',
      content: appHtml
    },
    {
      filename: `src/app${ext}`,
      content: ext === '.js' ? appJs : appTs
    }
  ];

  if (testFramework !== 'none') {
    files.push({
      filename: `test/setup${ext}`,
      content: testSetup
    });

    if (testFramework === 'jasmine') {
      files.push({
        filename: `test/app.spec${ext}`,
        content: jasmineTest
      });
    } if (testFramework === 'mocha') {
      files.push({
        filename: `test/app.spec${ext}`,
        content: mochaTest
      });
    } if (testFramework === 'zora') {
      files.push({
        filename: `test/app.spec${ext}`,
        content:zoraTest
      });
    }
  }

  return files;
}
