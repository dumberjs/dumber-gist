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
  <div id="vue-root"></div>
  <script src="/dist/entry-bundle.js" data-main="main"></script>
</body>
</html>
`;

const main = `import Vue from 'vue';
import App from './App';

new Vue({
  components: {App},
  template: '<App></App>'
}).$mount('#vue-root');
`;

const app = `// Try to create a css/scss/sass/less file then import it here
export default {
  template: \`
    <div>
      <h1>{{ msg }}</h1>
    </div>
  \`,
  data() {
    return {
      msg: 'Hello Vue!'
    };
  }
};
`;

const jasmineTest = `import { mount } from '@vue/test-utils';
import App from '../src/App';

describe('Component App', () => {
  it('should render message', () => {
    const wrapper = mount(App);
    expect(wrapper.text()).toBe('Hello Vue!');
  });
});
`;

const mochaTest = `import {expect} from 'chai';
import {mount} from '@vue/test-utils';
import App from '../src/App';

describe('Component App', () => {
  it('should render message', () => {
    const wrapper = mount(App);
    expect(wrapper.text()).to.equal('Hello Vue!');
  });
});
`;

const tapeTest = `import test from 'tape';
import { mount } from '@vue/test-utils';
import App from '../src/App';

test('should render message', t => {
  const wrapper = mount(App);
  t.equal(wrapper.text(), 'Hello Vue!');
  t.end();
});
`;

export default function({transpiler, testFramework}) {
  const ext = transpiler === 'typescript' ? '.ts' : '.js';
  const files = [
    {
      filename: 'package.json',
      dependencies: {'vue': '^2.0.0'}
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
      filename: `src/App${ext}`,
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
  } if (testFramework === 'tape') {
    files.push({
      filename: `test/app.spec${ext}`,
      content: tapeTest
    });
  }

  return files;
}
