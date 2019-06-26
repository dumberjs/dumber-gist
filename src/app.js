import {activate, postMessageToWorker} from './worker-activator';

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

    // setTimeout(() => postMessageToWorker({a: 1, b:2}), 3000);
  }

  gotMessage(event) {
    console.log('gotMessage', event);
  }
}
