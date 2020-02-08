import {DialogController} from 'aurelia-dialog';
import {inject} from 'aurelia-framework';
import {combo} from 'aurelia-combo';

@inject(DialogController)
export class BrowserConfigDialog {
  model = {
    autoRefresh: false
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
