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
The starting module is pointed to "index" (data-main attribute on script)
which is your src/index${ext}.
-->
<body>
  <div id="root"></div>
  <script src="/dist/entry-bundle.js" data-main="index"></script>
</body>
</html>
`;

const index = `import { h, render } from 'preact';
import App from './app';

render(<App />, document.getElementById('root'));
`;

const app = `import { h, Component } from 'preact';
// Try to create a css/scss/sass/less file then import it here.
//
// Note to preact-cli users: preact-cli turns on css-mdules by default. But for simplicity, dumber-gist did not turn on css-modules.
// https://github.com/css-modules/css-modules
//
// However, dumber bundler supports css-modules through gulp.
// https://github.com/dumberjs/gulp-dumber-css-module

export default class App extends Component {
  render() {
    return (
      <div>
        <h1>Hello Preact!</h1>
      </div>
    );
  }
}
`;

const testSetup = `import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';
configure({ adapter: new Adapter });
`;

const jasmineTest = `import { h } from 'preact';
import { mount } from 'enzyme';
import App from '../src/app';

describe('Component App', () => {
  it('should render message', () => {
    const wrapper = mount(<App/>);
    expect(wrapper.text()).toEqual('Hello Preact!');
  });
});
`;

const mochaTest = `import { h } from 'preact';
import { mount } from 'enzyme';
import {expect} from 'chai';
import App from '../src/app';

describe('Component App', () => {
  it('should render message', () => {
    const wrapper = mount(<App/>);
    expect(wrapper.text()).to.equal('Hello Preact!');
  });
});
`

const tapeTest = `import { h } from 'preact';
import { mount } from 'enzyme';
import test from 'tape';
import App from '../src/app';

test('should render message', t => {
  const wrapper = mount(<App/>);
  t.equal(wrapper.text(), 'Hello Preact!');
  t.end();
});
`;

export default function({transpiler, testFramework}) {
  const ext = transpiler === 'typescript' ? '.ts' : '.js';
  const files = [
    {
      filename: 'package.json',
      dependencies: {'preact': '^10.0.0'}
    },
    {
      filename: 'index.html',
      content: indexHtml(ext)
    },
    {
      filename: `src/index${ext}`,
      content: index
    },
    {
      filename: `src/app${ext}`,
      content: app
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
    } if (testFramework === 'tape') {
      files.push({
        filename: `test/app.spec${ext}`,
        content: tapeTest
      });
    }
  }

  return files;
}
