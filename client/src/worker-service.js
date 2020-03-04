/* global BUNDLER_WORKER */
import {inject, computedFrom} from 'aurelia-framework';
import {SessionId} from './session-id';
import {EventAggregator} from 'aurelia-event-aggregator';
import {HistoryTracker} from './history-tracker';
import {ConsoleLog} from './embedded-browser/console-log';

@inject(EventAggregator, SessionId, HistoryTracker, ConsoleLog)
export class WorkerService {
  constructor(ea, sessionId, historyTracker, consoleLog) {
    this.ea = ea;
    this.sessionId = sessionId;
    this.historyTracker = historyTracker;
    this.consoleLog = consoleLog;

    // FIFO queue
    this._jobs = [];
    this._currentJob = null;
    this._jobId = 0;

    this._workerSaid = this._workerSaid.bind(this);
    this._bootUpBundlerWorker();
    this._bootUpServiceWorker();

    this._tokenUpdator = this.ea.subscribe('update-token', async token => {
      await this.perform({type: 'update-token', token});
    });
  }

  // waiting for worker to finish some work
  @computedFrom('_currentJob')
  get isWaiting() {
    return !!this._currentJob;
  }

  _bootUpBundlerWorker() {
    this.bundler = new Worker(BUNDLER_WORKER);
    this.bundler.onerror = err => {
      this.ea.publish('error', err.message);
      console.error(err);
    };
    this.bundler.onmessageerror = err => {
      this.ea.publish('error', err.message);
      console.error(err);
    };

    let resolveWorker = null;
    this._dumberWorkerUp = new Promise(resolve => resolveWorker = resolve);

    const handleMessage = e => {
      if (!e.data) return;
      const {type} = e.data;
      if (type === 'bundler-worker-up') {
        console.info('Bundler Worker is up.');
        this.bundler.onmessage = this._workerSaid;
        resolveWorker();
      } else {
        // Forward to _workerSaid
        this._workerSaid(e);
      }
    };

    this.bundler.onmessage = handleMessage;
  }

  _bootUpServiceWorker() {
    // The first invisible iframe in dumber gist.
    // It's to boot up service worker.
    // The second iframe (user app itself) is then
    // created by ./embedded-browser/browser-frame.js, all contents
    // in second iframe are provided by caches generated
    // in service worker.
    const iframe = document.createElement('iframe');
    const host = `${this.sessionId.id}.${HOST_NAMES.host}`;
    iframe.setAttribute('src', `https://${host}/__boot-up-worker.html`);
    iframe.setAttribute('style', 'display: none');
    document.body.appendChild(iframe);
    this.iframe = iframe;

    let resolveWorker = null;
    this._serviceWorkerUp = new Promise(resolve => resolveWorker = resolve);

    const panic = setTimeout(() => {
      this.ea.publish('service-worker-panic');
    }, 5000);

    const handleMessage = e => {
      if (!e.data) return;
      const {type} = e.data;
      if (type === 'worker-up') {
        clearTimeout(panic);
        console.info(`Service Worker is up on ${host}`);
        removeEventListener('message', handleMessage);
        addEventListener('message', this._workerSaid);
        resolveWorker();
      } else {
        // Forward to _workerSaid
        this._workerSaid(e);
      }
    };

    addEventListener('message', handleMessage);

  }

  // Handle both bundler worker and service worker.
  _workerSaid(e) {
    const {data} = e;
    if (!data) return;
    const {type} = data;
    if (!type) return;

    // Following types are from embedded app, not service worker
    if (type === 'history-push-state') {
      this.historyTracker.pushState(data.title, data.url);
      return;
    } else if (type === 'history-replace-state') {
      this.historyTracker.replaceState(data.title, data.url);
      return;
    } else if (type === 'history-go') {
      this.historyTracker.go(data.delta);
      return;
    } else if (type === 'app-console') {
      this.consoleLog.appLogs.push({
        method: data.method,
        args: data.args
      });
      return;
    } else if (type === 'dumber-console') {
      this.consoleLog.dumberLogs.push({
        method: data.method,
        args: data.args
      });
      return;
    } else if (type === 'miss-cache') {
      this.ea.publish('miss-cache', data.meta);
      return;
    }

    // Forward shortcut from service worker (from embedded app)
    if (type === 'short-cut') {
      this.ea.publish(data.shortcut);
      return;
    }

    const {_currentJob} = this;
    if (!_currentJob) return;

    if (data.id !== _currentJob.id || (type !== 'ack' && type !== 'err')) {
      this.ea.publish('warning', `While waiting for acknowledgement id:${_currentJob.id} from service worker, received unexpected result ${JSON.stringify(data)}.`);
      return;
    }

    if (type === 'err') {
      _currentJob.reject(new Error(data.error || 'unknown error'));
    }

    _currentJob.resolve(data.data);
    if ((this._currentJob = this._jobs.shift()) !== undefined) {
      // kick off next job.
      this._workerDo({...this._currentJob.action, id: this._currentJob.id});
    }
  }

  // Handle both bundler worker and service worker.
  _workerDo(action) {
    const {type} = action;
    if (!type) return;
    if (type.startsWith('sw:')) {
      this.iframe.contentWindow.postMessage(action, '*');
    } else {
      this.bundler.postMessage(action);
    }
  }

  _kickOff() {
    Promise.all([
      this._dumberWorkerUp,
      this._serviceWorkerUp
    ]).then(() => {
      if (this._currentJob) return;
      if ((this._currentJob = this._jobs.shift()) !== undefined) {
        // kick off first job.
        this._workerDo({...this._currentJob.action, id: this._currentJob.id});
      }
    });
  }

  async perform(action) {
    let resolve;
    let reject;
    const p = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });

    const job = {
      action,
      id: this._jobId++,
      resolve(r) {
        this.isWaiting = false;
        this._currentJob = null;
        resolve(r);
      },
      reject(r) {
        this.isWaiting = false;
        this._currentJob = null;
        reject(r);
      },
    }

    this._jobs.push(job);
    this._kickOff();
    return p;
  }
}
