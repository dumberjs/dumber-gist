import {DialogController} from 'aurelia-dialog';
import Validation from 'bcx-validation';
import {inject, computedFrom} from 'aurelia-framework';
import _ from 'lodash';

@inject(DialogController, Validation)
export class NewGistDialog {
  triedOnce = false;
  model = {
    description: '',
    isPublic: true
  };

  constructor(controller, validation) {
    this.controller = controller;
    this.validator = validation.generateValidator({
      description: 'mandatory'
    });
  }

  activate(model) {
    this.model.description = model.description;
    this.model.isPublic = model.isPublic;
  }

  save() {
    this.triedOnce = true;
    if (this.errors) return;
    this.controller.ok(this.model);
  }

  @computedFrom('triedOnce', 'model.description', 'model.isPublic')
  get errors() {
    if (this.triedOnce) {
      const errors = this.validator(this.model);
      return _.capitalize(_.get(errors, 'description', []).join(', '));
    }
  }
}
