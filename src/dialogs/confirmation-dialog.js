import {DialogController} from 'aurelia-dialog';
import {inject} from 'aurelia-framework';
import {combo} from 'aurelia-combo';

@inject(DialogController)
export class ConfirmationDialog {
  constructor(controller) {
    this.controller = controller;
  }

  activate(model) {
    this.message = model.message;
  }

  @combo('enter')
  ok() {
    this.controller.ok();
  }
}
