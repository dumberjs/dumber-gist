import {DialogController} from 'aurelia-dialog';
import Validation from 'bcx-validation';
import {EditSession} from '../edit/edit-session';
import {inject, computedFrom} from 'aurelia-framework';
import _ from 'lodash';
import path from 'path';

const BINARY_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.wasm'];

@inject(DialogController, Validation, EditSession)
export class EditNameDialog {
  triedOnce = false;
  name = '';

  constructor(controller, validation, session) {
    this.controller = controller;
    this.validation = validation;
    this.session = session;
  }

  activate(model) {
    this.name = model.filePath;
    this._originalFilePath = model.filePath;
    this.isFolder = model.isFolder;

    this.validator = this.validation.generateValidator({
      name: [
        'mandatory',
        {
          validate: /^[a-zA-Z0-9_/.-]+$/,
          message: 'only accept letters, numbers, dash(-), underscore(_), dot(.), or slash(/) in file path'
        },
        name => {
          if (name === this._originalFilePath) return;
          if (_.find(this.session.files, {filename: name})) {
            return `there is an existing file "${name}"`;
          }
          if (_.find(this.session.files, f => f.filename.startsWith(name + '/'))) {
            return `there is an existing folder "${name}"`;
          }
        },
        name => {
          if (BINARY_EXTS.includes(path.extname(name))) {
            return `GitHub gist only supports text file, try svg if you need images`;
          }
        }
      ]
    });
  }

  attached() {
    let startIdx = this.name.lastIndexOf('/') + 1;
    const part = this.name.split('.')[0];
    this.input.setSelectionRange(startIdx, part.length);
  }

  save() {
    if (!this.isChanged) return;
    this.triedOnce = true;
    if (this.errors) return;
    this.controller.ok(_.trim(this.name, '/'));
  }

  @computedFrom('triedOnce', 'name')
  get errors() {
    if (this.triedOnce) {
      const errors = this.validator(this);
      return _.capitalize(_.get(errors, 'name', []).join(', '));
    }
  }

  @computedFrom('name', '_originalFilePath')
  get isChanged() {
    return this.name !== this._originalFilePath;
  }
}
