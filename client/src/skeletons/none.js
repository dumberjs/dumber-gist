const indexHtml = ext => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Dumber Gist</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no">
</head>
<!--
Dumber Gist uses dumber bundler, the default bundle file
is /dist/entry-bundle.js.
The starting module is pointed to "main" (data-main attribute on script)
which is your src/main${ext}.
-->
<body>
  <script src="/dist/entry-bundle.js" data-main="main"></script>
</body>
</html>
`;

const main = `import app from './app';
document.body.appendChild(app);
`;

const app = `const app = document.createElement('p');
app.textContent = 'Hello Dumber Gist!';
export default app;
`;

const jasmineTest = `import app from '../src/app';

describe('Component app', () => {
  it('should render message', () => {
    expect(app.textContent).toBe('Hello Dumber Gist!');
  });
});
`;

const mochaTest = `import {expect} from 'chai';
import app from '../src/app';

describe('Component app', () => {
  it('should render message', () => {
    expect(app.textContent).to.equal('Hello Dumber Gist!');
  });
});
`;

const zoraTest = `import {test} from 'zora';
import app from '../src/app';

test('should render message', t => {
  t.equal(app.textContent, 'Hello Dumber Gist!');
});
`;

export default function({transpiler, testFramework}) {
  const ext = transpiler === 'typescript' ? '.ts' : '.js';
  const files = [
    {
      filename: 'package.json'
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
      filename: `src/app${ext}`,
      content: app
    }
  ];

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
      content: zoraTest
    });
  }

  return files;
}
