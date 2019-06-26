import {activate, postMessageToWorker} from './worker-activator';

export class App {
  message = 'Hello Aurelia!';
  up = false;

  test() {
    if (!this.up) {
      this.up = true;
      console.log('activate app');
      activate();
    }

    postMessageToWorker({a: 1, b:2});
  }
}
