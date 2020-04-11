import {DialogController} from 'aurelia-dialog';
import {inject} from 'aurelia-framework';
import {combo} from 'aurelia-combo';

@inject(DialogController)
export class EditorConfigDialog {
  model = {
    vimMode: false,
    lineWrapping: false,
  };

  constructor(controller) {
    this.controller = controller;
  }

  activate(model) {
    Object.assign(this.model, model);
  }

  @combo('enter')
  ok() {
    this.controller.ok(this.model);
  }
}
