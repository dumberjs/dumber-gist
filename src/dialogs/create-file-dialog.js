import {DialogController} from 'aurelia-dialog';
import {inject} from 'aurelia-framework';
import _ from 'lodash';

// TODO validate against exisitn file names

@inject(DialogController)
export class CreateFileDialog {
  constructor(controller) {
    this.controller = controller;
  }

  activate(model) {
    this.name = _.get(model, 'filePath') || '';
    if (this.name) this.name += '/';
  }

  save() {
    if (!this.name) return;
    this.controller.ok(this.name);
  }
}
