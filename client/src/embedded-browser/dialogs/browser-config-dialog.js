import {DialogController} from 'aurelia-dialog-lite';
import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Helper} from '../../helper';
import {combo} from 'aurelia-combo';

@inject(DialogController, EventAggregator, Helper)
export class BrowserConfigDialog {
  model = {
    autoRefresh: false
  };

  constructor(controller, ea, helper) {
    this.controller = controller;
    this.ea = ea;
    this.helper = helper;
  }

  activate(model) {
    Object.assign(this.model, model.config);
    this.insideIframe = model.insideIframe;
  }

  resetCache() {
    if (this.insideIframe) return;

    this.helper.confirm(`Reset all local caches for bundler and npm registry?`)
    .then(
      () => this.ea.publish('reset-cache'),
      () => {}
    );
  }

  @combo('enter')
  ok() {
    this.controller.ok(this.model);
  }
}
