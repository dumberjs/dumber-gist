import {inject, bindable, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DndService} from 'bcx-aurelia-dnd';
import {SessionId} from '../session-id';
import {HistoryTracker} from '../history-tracker';
import {ConsoleLog} from './console-log';
import {Oauth} from '../github/oauth';
import {User} from '../github/user';
import _ from 'lodash';

@inject(EventAggregator, DndService, SessionId, HistoryTracker, ConsoleLog, Oauth, User)
export class BrowserFrame {
  @bindable insideIframe;
  @bindable isBundling;
  @bindable bundlerError;
  missedCache = [];
  safari = !!global.safari;
  firefox = !!global.netscape;
  chrome = !!global.chrome;
  serviceWorkerFailed = false;

  constructor(ea, dndService, sessionId, historyTracker, consoleLog, oauth, user) {
    this.ea = ea;
    this.dndService = dndService;
    this.historyTracker = historyTracker;
    this.consoleLog = consoleLog;
    this.oauth = oauth;
    this.user = user;

    this.src = `https://${sessionId.id}.${HOST_NAMES.host}`;
    this.rebuildFrame = _.debounce(this.rebuildFrame.bind(this), 200);
    this.goBack = this.goBack.bind(this);
    this.goForward = this.goForward.bind(this);
    this.missCache = this.missCache.bind(this);
    this.panic = this.panic.bind(this);
  }

  attached() {
    this.subscribers = [
      this.ea.subscribe('history-back', this.goBack),
      this.ea.subscribe('history-forward', this.goForward),
      this.ea.subscribe('history-reload', this.rebuildFrame),
      this.ea.subscribe('miss-cache', this.missCache),
      this.ea.subscribe('service-worker-panic', this.panic)
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

  login() {
    this.oauth.login();
  }

  isBundlingChanged(isBundling, oldIsBundling) {
    if (oldIsBundling && !isBundling) {
      if (this.bundlerError) {
        const existingFrame = document.getElementById('frame');
        if (existingFrame) {
          existingFrame.remove();
        }
      } else {
        this.rebuildFrame();
      }
    } else if (isBundling && !oldIsBundling) {
      this.missedCache = [];
    }
  }

  missCache(meta) {
    const {packageName} = meta;
    if (
      packageName &&
      !packageName.startsWith('__') &&
      this.missedCache.indexOf(packageName) === -1
    ) {
      // Rebuild the array for easier observation in Aurelia 1.
      this.missedCache = [...this.missedCache, packageName];
    }
  }

  panic() {
    this.serviceWorkerFailed = true;
  }

  rebuildFrame() {
    if (this.isBundling) return;

    this.historyTracker.reset();

    let path = _.trim(this.historyTracker.currentUrl);
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    this.historyTracker.currentUrl = path;

    const existingFrame = document.getElementById('frame');
    if (existingFrame) {
      this.consoleLog.appLogs.push({
        method: 'system',
        args: ['Reloading embedded app ...']
      });
      existingFrame.contentWindow.location.replace(this.src + this.historyTracker.currentUrl);
    } else {
      const frame = document.createElement('iframe');
      frame.className = 'iframe';
      frame.id = 'frame';
      frame.setAttribute('src', this.src + this.historyTracker.currentUrl);
      this.container.insertBefore(frame, this.reference);
    }
  }

  @computedFrom('bundlerError')
  get error() {
    const {bundlerError} = this;

    if (
      bundlerError &&
      bundlerError.includes('was not found with requested version')
    ) {
      return 'Please try again after few minutes. Need to wait registry.npmjs.cf (a npm mirror site) to sync npm repositories.\n' + bundlerError;
    }

    return bundlerError;
  }
}
