import {inject, bindable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DndService} from 'bcx-aurelia-dnd';
import {SessionId} from '../session-id';
import {host} from '../host-name';
import {HistoryTracker} from '../history-tracker';
import _ from 'lodash';

@inject(EventAggregator, DndService, SessionId, HistoryTracker)
export class BrowserFrame {
  @bindable isBundling;
  @bindable bundlerError;

  constructor(ea, dndService, sessionId, historyTracker) {
    this.ea = ea;
    this.dndService = dndService;
    this.historyTracker = historyTracker;
    this.src = `https://${sessionId.id}.${host}`;
    this.rebuildFrame = _.debounce(this.rebuildFrame.bind(this), 200);
    this.goBack = this.goBack.bind(this);
    this.goForward = this.goForward.bind(this);
  }

  attached() {
    this.subscribers = [
      this.ea.subscribe('history-back', this.goBack),
      this.ea.subscribe('history-forward', this.goForward),
      this.ea.subscribe('history-reload', this.rebuildFrame),
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
    this.historyTracker.reset();

    const existingFrame = document.getElementById('frame');
    if (existingFrame) {
      existingFrame.contentWindow.location.replace(this.src + this.historyTracker.currentUrl);
    } else {
      const frame = document.createElement('iframe');
      frame.className = 'iframe';
      frame.id = 'frame';
      frame.setAttribute('src', this.src + this.historyTracker.currentUrl);
      this.container.insertBefore(frame, this.reference);
    }
  }
}
