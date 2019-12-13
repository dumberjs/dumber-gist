import {DialogController} from 'aurelia-dialog';
import {inject, computedFrom} from 'aurelia-framework';
import _ from 'lodash';
// TODO validate against exisitn file names

@inject(DialogController)
export class EditNameDialog {
  constructor(controller) {
    this.controller = controller;
  }

  activate(model) {
    this.filePath = model.filePath;
    this._originalfilePath = model.filePath;
    this.isFolder = model.isFolder;
  }

  attached() {
    let startIdx = this.filePath.lastIndexOf('/') + 1;
    const part = this.filePath.split('.')[0];
    this.input.setSelectionRange(startIdx, part.length);
  }

  save() {
    if (!this.filePath || !this.isChanged) return;
    this.controller.ok(_.trim(this.filePath, '/'));
  }

  @computedFrom('filePath', '_originalfilePath')
  get isChanged() {
    return this.filePath !== this._originalfilePath;
  }
}
