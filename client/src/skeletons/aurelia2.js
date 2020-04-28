const indexHtml = ext => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Dumber Gist</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no">
  <base href="/">
</head>
<!--
Dumber Gist uses dumber bundler, the default bundle file
is /dist/entry-bundle.js.
The starting module is pointed to "main" (data-main attribute on script)
which is your src/main${ext}.
-->
<body>
  <my-app></my-app>
  <script src="/dist/entry-bundle.js" data-main="main"></script>
</body>
</html>
`;

const main = `import Aurelia from 'aurelia';
import { MyApp } from './my-app';

Aurelia.app(MyApp).start();
`;

const appHtml = `<!--
Try to create a paired css/scss/sass/less file like my-app.scss.
It will be automatically imported based on convention.
 -->

<!--
There is no bundler config you can change in Dumber Gist to
turn on shadow DOM.
But you can turn shadow DOM on by adding a meta tag in every
html template:
<use-shadow-dom>
-->
<h1>\${message}</h1>
`;

const appJs = `export class MyApp {
  message = 'Hello Aurelia 2!';
}
`;

const appTs = `export class MyApp {
  public message: string = 'Hello Aurelia 2!';
}
`;

const testHelper = ext => `import Aurelia, { CustomElement } from 'aurelia';
export async function render(template${ext === '.ts' ? ': string' : ''}, ...deps${ext === '.ts' ? ': readonly unknown[]' : ''}) {
  const wrapper = CustomElement.define({name: 'wrapper', template});
  const div = document.createElement('div');
  const au = Aurelia.register(deps).app({
    host: div,
    component: wrapper
  });
  await au.start().wait();
  return div;
}
`;

const jasmineTest = `import { render } from './helper';
import { MyApp } from '../src/my-app';

describe('Component App', () => {
  it('should render message', async () => {
    const div = await render('<my-app></my-app>', MyApp);
    expect(div.textContent.trim()).toEqual('Hello Aurelia 2!');
  });
});
`;

const mochaTest = `import { render } from './helper';
import {expect} from 'chai';
import { MyApp } from '../src/my-app';

describe('Component App', () => {
  it('should render message', async () => {
    const div = await render('<my-app></my-app>', MyApp);
    expect(div.textContent.trim()).to.equal('Hello Aurelia 2!');
  });
});
`

const tapeTest = `import { render } from './helper';
import test from 'tape';
import { MyApp } from '../src/my-app';

test('should render message', async t => {
  const div = await render('<my-app></my-app>', MyApp);
  t.equal(div.textContent.trim(), 'Hello Aurelia 2!');
});
`;

export default function({transpiler, testFramework}) {
  const ext = transpiler === 'typescript' ? '.ts' : '.js';
  const files = [
    {
      filename: 'package.json',
      dependencies: {'aurelia': 'dev'}
    },
    {
      filename: 'index.html',
      content: indexHtml(ext)
    },
    {
      filename: `src/main${ext}`,
      content: main
    },
    {
      filename: 'src/my-app.html',
      content: appHtml
    },
    {
      filename: `src/my-app${ext}`,
      content: ext === '.js' ? appJs : appTs
    }
  ];

  if (testFramework !== 'none') {
    files.push({
      filename: `test/helper${ext}`,
      content: testHelper(ext)
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
    } if (testFramework === 'tape') {
      files.push({
        filename: `test/app.spec${ext}`,
        content: tapeTest
      });
    }
  }

  return files;
}
