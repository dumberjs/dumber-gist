import {DialogController} from 'aurelia-dialog-lite';
import {inject} from 'aurelia-framework';

@inject(DialogController)
export class ConfirmDraftDialog {
  constructor(controller) {
    this.controller = controller;
  }
}
