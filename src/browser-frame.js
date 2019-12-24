import {inject, bindable} from 'aurelia-framework';
import {DndService} from 'bcx-aurelia-dnd';
import {id} from './worker-activator';

@inject(DndService)
export class BrowserFrame {
  @bindable isBundling;
  @bindable bundlerError;
  rendered = false;
  id = id;

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
