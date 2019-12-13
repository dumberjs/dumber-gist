import {DialogController} from 'aurelia-dialog';
import {inject, computedFrom} from 'aurelia-framework';
import _ from 'lodash';

@inject(DialogController)
export class ConfirmationDialog {
  constructor(controller) {
    this.controller = controller;
  }

  activate(model) {
    this.message = model.message;
  }
}
