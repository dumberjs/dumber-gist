import {inject, BindingEngine} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {OpenedFiles} from './opened-files';
import _ from 'lodash';

@inject(EventAggregator, BindingEngine, OpenedFiles)
export class EditorTabs {
  constructor(ea, bindingEngine, openedFiles) {
    this.ea = ea;
    this.bindingEngine = bindingEngine;
    this.openedFiles = openedFiles;
    this.showActiveTab = _.debounce(this.showActiveTab.bind(this));
  }

  attached() {
    this.subscribers = [
      this.bindingEngine.propertyObserver(this.openedFiles, 'focusedIndex').subscribe(this.showActiveTab)
    ];
  }

  detached() {
    this.subscribers.forEach(s => s.dispose());
  }

  closeFile(filename) {
    this.ea.publish('close-file', filename);
  }

  showActiveTab() {
    const active = this.el.querySelector('.tab.active');
    if (active) {
      if (active.scrollIntoViewIfNeeded) {
        active.scrollIntoViewIfNeeded();
      } else {
        active.scrollIntoView();
      }
    }
  }
}

export class LastPartValueConverter {
  toView(filename) {
    return _.last(filename.split('/'));
  }
}
