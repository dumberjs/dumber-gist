import {DialogController} from 'aurelia-dialog';
import Validation from 'bcx-validation';
import {EditSession} from '../edit/edit-session';
import {inject, computedFrom} from 'aurelia-framework';
import _ from 'lodash';
import path from 'path';

const BINARY_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.wasm'];

@inject(DialogController, Validation, EditSession)
export class CreateFileDialog {
  triedOnce = false;
  name = '';

  constructor(controller, validation, session) {
    this.controller = controller;
    this.validator = validation.generateValidator({
      name: [
        'mandatory',
        {
          validate: /^[a-zA-Z0-9_/.-]+$/,
          message: 'only accept letters, numbers, dash(-), underscore(_), dot(.), or slash(/) in file path'
        },
        name => {
          if (_.find(session.files, {filename: name})) {
            return `there is an existing file "${name}"`;
          }
          if (_.find(session.files, f => f.filename.startsWith(name + '/'))) {
            return `there is an existing folder "${name}"`;
          }
        },
        name => {
          if (BINARY_EXTS.includes(path.extname(name))) {
            return `GitHub gist only supports text file, try svg if you need images`;
          }
        }
      ]
    })
  }

  activate(model) {
    this.name = _.get(model, 'filePath') || '';
    if (this.name) this.name += '/';
  }

  save() {
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
}
