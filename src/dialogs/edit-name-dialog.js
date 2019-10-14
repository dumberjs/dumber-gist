import {DialogController} from 'aurelia-dialog';
import {inject, computedFrom} from 'aurelia-framework';

@inject(DialogController)
export class EditNameDialog {
  constructor(controller) {
    this.controller = controller;
  }

  activate(model) {
    this.name = model.name;
    this._originalName = model.name;
    this.isFolder = model.isFolder;
  }

  @computedFrom('name', '_originalName')
  get isChanged() {
    return this.name !== this._originalName;
  }
}
