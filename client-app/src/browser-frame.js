import {inject, bindable} from 'aurelia-framework';
import {DndService} from 'bcx-aurelia-dnd';
import {SessionId} from './session-id';
import {host} from './host-name';
import _ from 'lodash';

@inject(DndService, SessionId)
export class BrowserFrame {
  @bindable isBundling;
  @bindable bundlerError;

  constructor(dndService, sessionId) {
    this.dndService = dndService;
    this.src = `https://${sessionId.id}.${host}`;
    this.rebuildFrame = _.debounce(this.rebuildFrame, 200);
  }

  isBundlingChanged(isBundling, oldIsBundling) {
    if (oldIsBundling && !isBundling && !this.bundlerError) {
      this.rebuildFrame();
    }
  }

  rebuildFrame() {
    const existingFrame = document.getElementById('frame');

    const frame = document.createElement('iframe');
    frame.className = 'iframe';
    frame.id = 'frame';
    // TODO track SPA app route path
    frame.setAttribute('src', this.src);
    this.container.insertBefore(frame, existingFrame || this.reference);

    if (existingFrame) setTimeout(() => existingFrame.remove(), 150);
  }
}
