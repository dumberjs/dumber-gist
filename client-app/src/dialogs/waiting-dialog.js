import {DialogController} from 'aurelia-dialog';
import {inject} from 'aurelia-framework';
import _ from 'lodash';

@inject(DialogController)
export class WaitingDialog {
  slow = false;

  constructor(controller) {
    this.controller = controller;
    // controller.settings.centerHorizontalOnly = false;
    controller.settings.lock = true;
    controller.settings.overlayDismiss = false;
  }

  activate(model) {
    this.title = _.get(model, 'title') || 'Loading ...';
    this.slowSetter = setTimeout(() => {
      this.slow = true;
    }, 400);
  }

  deactivate() {
    clearTimeout(this.slowSetter);
  }
}
