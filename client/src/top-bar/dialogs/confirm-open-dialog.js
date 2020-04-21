import {DialogController} from 'aurelia-dialog-lite';
import {inject} from 'aurelia-framework';

@inject(DialogController)
export class ConfirmOpenDialog {
  constructor(controller) {
    this.controller = controller;
  }
}
