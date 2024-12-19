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

const jasmineSetup = ext => `import { BrowserPlatform } from '@aurelia/platform-browser';
import { setPlatform, onFixtureCreated${ext === '.ts' ? ', type IFixture' : ''} } from '@aurelia/testing';

// Sets up the Aurelia environment for testing
function bootstrapTextEnv() {
  const platform = new BrowserPlatform(window);
  setPlatform(platform);
  BrowserPlatform.set(globalThis, platform);
}

const fixtures${ext === '.ts' ? ': IFixture<object>[]' : ''} = [];
beforeAll(() => {
  bootstrapTextEnv();
  onFixtureCreated(fixture => {
    fixtures.push(fixture);
  });
});

afterEach(() => {
  fixtures.forEach(async f => {
    try {
      await f.stop(true);
    } catch {
      // ignore
    }
  });
  fixtures.length = 0;
});
`;

const mochaSetup = ext => `import { BrowserPlatform } from '@aurelia/platform-browser';
import { setPlatform, onFixtureCreated${ext === '.ts' ? ', type IFixture' : ''} } from '@aurelia/testing';

// Sets up the Aurelia environment for testing
function bootstrapTextEnv() {
  const platform = new BrowserPlatform(window);
  setPlatform(platform);
  BrowserPlatform.set(globalThis, platform);
}

const fixtures${ext === '.ts' ? ': IFixture<object>[]' : ''} = [];
mocha.setup({
  rootHooks: {
    beforeAll() {
      bootstrapTextEnv();
      onFixtureCreated(fixture => {
        fixtures.push(fixture);
      });
    },
    afterEach() {
      fixtures.forEach(async f => {
        try {
          await f.stop(true);
        } catch {
          // ignore
        }
      });
      fixtures.length = 0;
    }
  }
});
`;

const jasmineTest = `import { createFixture } from '@aurelia/testing';
import { MyApp } from '../src/my-app';

describe('Component App', () => {
  it('should render message', async () => {
    const { assertText } = await createFixture(
      '<my-app></my-app>',
      {},
      [MyApp],
    ).started;

    assertText('Hello Aurelia 2!', { compact: true });
  });
});
`;

const mochaTest = `import { createFixture } from '@aurelia/testing';
import { MyApp } from '../src/my-app';

describe('Component App', () => {
  it('should render message', async () => {
    const { assertText } = await createFixture(
      '<my-app></my-app>',
      {},
      [MyApp],
    ).started;

    assertText('Hello Aurelia 2!', { compact: true });
  });
});
`;

export default function({transpiler, testFramework}) {
  const ext = transpiler === 'typescript' ? '.ts' : '.js';
  const files = [
    {
      filename: 'package.json',
      dependencies: {'aurelia': 'latest'}
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

  if (testFramework === 'jasmine') {
    files.push(
      {
        filename: `test/setup${ext}`,
        content: jasmineSetup(ext)
      }, {
        filename: `test/app.spec${ext}`,
        content: jasmineTest
      }
    );
  } else if (testFramework === 'mocha') {
    files.push(
      {
        filename: `test/setup${ext}`,
        content: mochaSetup(ext)
      }, {
        filename: `test/app.spec${ext}`,
        content: mochaTest
      }
    );
  }

  return files;
}
