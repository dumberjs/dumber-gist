import {DialogController} from 'aurelia-dialog';
import {inject, computedFrom} from 'aurelia-framework';

// TODO validate against exisitn file names

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

  attached() {
    const part = this.name.split('.')[0];
    this.input.setSelectionRange(0, part.length);
  }

  save() {
    if (!this.name || !this.isChanged) return;
    this.controller.ok(this.name);
  }

  @computedFrom('name', '_originalName')
  get isChanged() {
    return this.name !== this._originalName;
  }
}
