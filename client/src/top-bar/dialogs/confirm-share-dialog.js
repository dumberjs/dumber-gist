import {DialogController} from 'aurelia-dialog';
import {inject} from 'aurelia-framework';

@inject(DialogController)
export class ConfirmShareDialog {
  constructor(controller) {
    this.controller = controller;
  }
}
