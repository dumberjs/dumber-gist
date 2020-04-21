import {DialogController} from 'aurelia-dialog-lite';
import {inject} from 'aurelia-framework';
import _ from 'lodash';

const DEFAULT_DELAY = 200;

@inject(DialogController)
export class WaitingDialog {
  slow = false;

  constructor(controller) {
    this.controller = controller;
    controller.settings.lock = true;
    controller.settings.overlayDismiss = false;
  }

  activate(model) {
    let {delay} = model;
    if (typeof delay !== 'number' || delay < 0) delay = 0;

    this.title = _.get(model, 'title') || 'Loading ...';
    this.slowSetter = setTimeout(() => {
      this.slow = true;
    }, model.delay || DEFAULT_DELAY);
  }

  deactivate() {
    clearTimeout(this.slowSetter);
  }
}
