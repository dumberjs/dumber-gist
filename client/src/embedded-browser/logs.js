import {inject, bindable, computedFrom, BindingEngine, bindingMode} from 'aurelia-framework';
import _ from 'lodash';

@inject(BindingEngine)
export class Logs {
  @bindable height;
  @bindable logs;
  @bindable resetLogs;
  @bindable({defaultBindingMode: bindingMode.twoWay}) filter = '';
  userScrolled = false;

  constructor(bindingEngine) {
    this.bindingEngine = bindingEngine;
    this.scrollToBottomIfNeeded = _.debounce(this.scrollToBottomIfNeeded.bind(this), 100);
    this.updateUserScrolled = this.updateUserScrolled.bind(this);
  }

  attached() {
    this.subscribers = [
      this.bindingEngine.propertyObserver(this.logs, 'length').subscribe(this.scrollToBottomIfNeeded)
    ];
    this.el.addEventListener('scroll', this.updateUserScrolled);
    this.scrollToBottom();
  }

  detached() {
    _.each(this.subscribers, s => s.dispose());
    this.el.removeEventListener('scroll', this.updateUserScrolled);
  }

  heightChanged() {
    this.scrollToBottomIfNeeded();
  }

  updateUserScrolled() {
    // Give 20 pixels margin.
    this.userScrolled = this.el.scrollTop + this.el.clientHeight < this.el.scrollHeight - 20;
  }

  scrollToBottomIfNeeded() {
    if (this.logs.length === 0) {
      // Reset
      this.userScrolled = false;
    }

    if (!this.userScrolled) {
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    this.el.scrollTop = this.el.scrollHeight;
  }

  @computedFrom('filter', 'logs.length')
  get filteredLogs() {
    const {filter, logs} = this;
    if (filter === 'error') {
      return _.filter(logs, {method: 'error'});
    } else if (filter === 'warning') {
      return _.filter(logs, {method: 'warn'});
    } else if (filter === 'logs') {
      return _.filter(logs, l => (
        l.method !== 'error' && l.method !== 'warn'
      ));
    } else {
      return logs;
    }
  }
}
