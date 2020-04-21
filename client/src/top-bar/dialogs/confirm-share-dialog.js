import {DialogController} from 'aurelia-dialog-lite';
import {inject} from 'aurelia-framework';

@inject(DialogController)
export class ConfirmShareDialog {
  constructor(controller) {
    this.controller = controller;
  }
}
