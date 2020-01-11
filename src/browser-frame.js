import {inject, bindable} from 'aurelia-framework';
import {DndService} from 'bcx-aurelia-dnd';
import {SessionId} from './session-id';

@inject(DndService, SessionId)
export class BrowserFrame {
  @bindable isBundling;
  @bindable bundlerError;
  rendered = false;

  constructor(dndService, sessionId) {
    this.dndService = dndService;
    this.id = sessionId.id;
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
