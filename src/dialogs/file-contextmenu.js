import {DialogController} from 'aurelia-dialog';
import {inject} from 'aurelia-framework';

@inject(DialogController)
export class FileContextmenu {
  constructor(controller) {
    this.controller = controller;
  }

  activate(model) {
    this.items = model.items;
    this.x = model.x;
    this.y = model.y;
  }
}
