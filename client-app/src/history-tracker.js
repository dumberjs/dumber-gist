export class HistoryTracker {
  stack = [];
  currentIndex = -1;

  pushState(title, url) {
    // console.log('pushState ' + url);
    this.stack.splice(++this.currentIndex, Infinity, {title, url});
    this._update();
  }

  replaceState(title, url) {
    if (this.currentIndex > -1) {
      // console.log('replaceState ' + url);
      this.stack.splice(this.currentIndex, 1, {title, url});
      this._update();
    } else {
      this.pushState(title, url);
    }
  }

  go(delta) {
    this.currentIndex += delta;
    this._update();
  }

  _update() {
    this.currentUrl = this.currentIndex > -1 ?
      this.stack[this.currentIndex].url : '/';

    this.canGoForward = this.stack.length > 1 &&
      this.stack.length - 1 > this.currentIndex;

    this.canGoBack = this.currentIndex > 0;
  }
}
