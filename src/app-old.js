import {activate, init, postMessageToWorker} from './worker-activator';

export class AppOld {
  message = 'Hello Aurelia!';
  up = false;

  activate() {
    window.addEventListener("message", this.gotMessage);
  }

  test() {
    if (!this.up) {
      this.up = true;
      console.log('activate app');
      activate();
    }
  }

  testInit() {
    console.log('init');
    init();
  }

  testApp() {
    console.log('test app');
    const indexFile = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Aurelia</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no">
  <base href="/">
</head>

<body>
<div id="vue-root"></div>
<script src="/dist/entry-bundle.js" data-main="main"></script>
</body>
</html>
`;
    postMessageToWorker({
      type: 'update-file',
      file: {
        path: '',
        contents: indexFile,
        type: 'text/html; charset=utf-8'
      }
    });

    postMessageToWorker({
      type: 'update-file',
      file: {
        path: 'src/main.js',
        moduleId: 'main',
        contents: `
import Vue from 'vue';
import App from './App';

new Vue({
  components: {App},
  template: '<App></App>'
}).$mount('#vue-root');
        `
      }
    });

    postMessageToWorker({
      type: 'update-file',
      file: {
        path: 'src/App.js',
        moduleId: 'App',
        contents: `
import "./App.css";

export default {
  template: \`
    <div class="app">
      <h2>{{ msg }}</h2>
    </div>
  \`,
  data() {
    return {
      msg: 'Hello Vue!'
    };
  }
};
        `
      }
    });

    postMessageToWorker({
      type: 'update-file',
      file: {
        path: 'src/App.css',
        moduleId: 'App.css',
        contents: `
.app {
  color: #333333;
  font-family: --apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif;
  line-height: 4rem;
  padding-left: 5rem;
}
        `
      }
    });
  }

  testBuild() {
    console.log('test build');
    postMessageToWorker({type: 'build'});
  }

  testBrowser() {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', 'https://b.gist-code.com');
    document.body.appendChild(iframe);
  }

  gotMessage(event) {
    console.log('app gotMessage', event.data);
  }
}
