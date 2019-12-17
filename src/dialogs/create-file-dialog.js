import {DialogController} from 'aurelia-dialog';
import {inject} from 'aurelia-framework';
import _ from 'lodash';

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
    this.controller.ok(_.trim(this.name, '/'));
  }
}
