import {inject} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog-lite';

@inject(DialogController)
export class DialogClose {
  constructor(controller) {
    this.controller = controller;
  }
}
