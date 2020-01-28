import {inject, bindable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DndService} from 'bcx-aurelia-dnd';
import {SessionId} from '../session-id';
import {host} from '../host-name';
import _ from 'lodash';

@inject(EventAggregator, DndService, SessionId)
export class BrowserFrame {
  @bindable isBundling;
  @bindable bundlerError;

  constructor(ea, dndService, sessionId) {
    this.ea = ea;
    this.dndService = dndService;
    this.src = `https://${sessionId.id}.${host}`;
    this.rebuildFrame = _.debounce(this.rebuildFrame, 200);
    this.goBack = this.goBack.bind(this);
    this.goForward = this.goForward.bind(this);
  }

  attached() {
    this.subscribers = [
      this.ea.subscribe('history-back', this.goBack),
      this.ea.subscribe('history-forward', this.goForward),
    ];
  }

  detached() {
    this.subscribers.forEach(s => s.dispose());
  }

  goBack() {
    const frame = document.getElementById('frame');
    if (!frame) return;
    frame.contentWindow.postMessage({type: 'history-back'}, '*');
  }

  goForward() {
    const frame = document.getElementById('frame');
    if (!frame) return;
    frame.contentWindow.postMessage({type: 'history-forward'}, '*');
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
