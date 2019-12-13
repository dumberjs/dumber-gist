import {DialogController} from 'aurelia-dialog';
import {inject} from 'aurelia-framework';

@inject(DialogController)
export class ConfirmationDialog {
  constructor(controller) {
    this.controller = controller;
  }

  activate(model) {
    this.message = model.message;
  }
}
