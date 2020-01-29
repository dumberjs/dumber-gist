import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class HistoryTracker {
  constructor(ea) {
    this.resetUrl = this.resetUrl.bind(this);
    this.reset = this.reset.bind(this);

    ea.subscribe('loaded-gist', this.resetUrl);
    ea.subscribe('imported-data', this.resetUrl);
    this.resetUrl();
    this.reset();
  }

  reset() {
    this.stack = [{title: '', url: this.currentUrl}];
    this.currentIndex = 0;
    this._update();
  }

  resetUrl() {
    this.currentUrl = '/';
  }

  pushState(title, url) {
    this.stack.splice(++this.currentIndex, Infinity, {title, url});
    this._updateAll();
  }

  replaceState(title, url) {
    if (this.currentIndex > -1) {
      this.stack.splice(this.currentIndex, 1, {title, url});
      this._updateAll();
    } else {
      this.pushState(title, url);
    }
  }

  go(delta) {
    let nextIndex = this.currentIndex + delta;
    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= this.stack.length) {
      nextIndex = this.stack.length - 1;
    }
    this.currentIndex = nextIndex;
    this._updateAll();
  }

  _updateAll() {
    this.currentUrl = this.currentIndex > -1 ?
      this.stack[this.currentIndex].url : '/';

    this._update();
  }

  _update() {
    this.canGoForward = this.stack.length > 1 &&
      this.stack.length - 1 > this.currentIndex;

    this.canGoBack = this.currentIndex > 0;
  }
}
