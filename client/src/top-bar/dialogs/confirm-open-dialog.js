import {DialogController} from 'aurelia-dialog';
import {inject} from 'aurelia-framework';

@inject(DialogController)
export class ConfirmOpenDialog {
  constructor(controller) {
    this.controller = controller;
  }
}
