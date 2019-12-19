import {inject, bindable} from 'aurelia-framework';
import {DndService} from 'bcx-aurelia-dnd';

@inject(DndService)
export class BrowserFrame {
  @bindable isBundling;
  @bindable bundlerError;
  rendered = false;

  constructor(dndService) {
    this.dndService = dndService;
  }

  isBundlingChanged(isBundling, oldIsBundling) {
    if (oldIsBundling && !isBundling && !this.bundlerError) {
      if (this.rendered) {
        // rebuild the iframe
        this.rendered = false;
        setTimeout(() => {
          this.rendered = true;
        });
      } else {
        this.rendered = true;
      }
    }
  }
}
