import {inject, bindable} from 'aurelia-framework';
import {DndService} from 'bcx-aurelia-dnd';
import {WorkerService} from './worker-service';

@inject(DndService, WorkerService)
export class BrowserFrame {
  @bindable isBundling;
  @bindable bundlerError;
  rendered = false;

  constructor(dndService, workerService) {
    this.dndService = dndService;
    this.id = workerService.id;
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
