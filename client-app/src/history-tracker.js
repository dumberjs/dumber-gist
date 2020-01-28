export class HistoryTracker {
  constructor() {
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
    const nextIndex = this.currentIndex + delta;
    if (nextIndex < this.stack.length) {
      this.currentIndex = nextIndex;
      this._updateAll();
    }
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
