import {activate, init, postMessageToWorker} from './worker-activator';

export class App {
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

  testMessage() {
    console.log('testMessage');
    postMessageToWorker({a: 1, b:2});
  }

  gotMessage(event) {
    console.log('app gotMessage', event.data);
  }
}
