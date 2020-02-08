import {DialogController} from 'aurelia-dialog';
import Validation from 'bcx-validation';
import {inject, computedFrom, BindingEngine} from 'aurelia-framework';
import _ from 'lodash';

@inject(BindingEngine, DialogController, Validation)
export class NewGistDialog {
  triedOnce = false;
  model = {
    description: '',
    isPublic: true
  };

  constructor(bindingEngine, controller, validation) {
    this.bindingEngine = bindingEngine;
    this.controller = controller;
    this.validator = validation.generateValidator({
      description: 'mandatory'
    });
    this.fitSize = this.fitSize.bind(this);
  }

  activate(model) {
    this.model.description = model.description;
    this.model.isPublic = model.isPublic;
  }

  attached() {
    this.subscribers = [
      this.bindingEngine.propertyObserver(this.model, 'description').subscribe(this.fitSize)
    ];
    this.fitSize();
  }

  detached() {
    _.each(this.subscribers, s => s.dispose());
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

  // https://stephanwagner.me/auto-resizing-textarea-with-vanilla-javascript
  // We don't need `element.offsetHeight - element.clientHeight` because
  // our textarea has no border.
  fitSize() {
    if (!this.textarea) return;
    // Auto fit text area height to content size
    this.textarea.style.height = 'auto';
    this.textarea.style.height = this.textarea.scrollHeight + 'px';
  }
}
