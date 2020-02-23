import {DialogController} from 'aurelia-dialog';
import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {combo} from 'aurelia-combo';

@inject(DialogController, EventAggregator)
export class BrowserConfigDialog {
  model = {
    autoRefresh: false
  };

  constructor(controller, ea) {
    this.controller = controller;
    this.ea = ea;
  }

  activate(model) {
    Object.assign(this.model, model.config);
    this.insideIframe = model.insideIframe;
  }

  resetCache() {
    this.ea.publish('reset-cache');
  }

  @combo('enter')
  ok() {
    this.controller.ok(this.model);
  }
}
