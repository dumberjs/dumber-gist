import {inject, computedFrom} from 'aurelia-framework';
import {SessionId} from './session-id';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DumberCache} from './dumber-cache';
import {HistoryTracker} from './history-tracker';
import {host} from './host-name';

@inject(EventAggregator, SessionId, DumberCache, HistoryTracker)
export class WorkerService {
  constructor(ea, sessionId, dumberCache, historyTracker) {
    this.ea = ea;
    this.sessionId = sessionId;
    this.dumberCache = dumberCache;
    this.historyTracker = historyTracker;

    // FIFO queue
    this._jobs = [];
    this._currentJob = null;
    this._jobId = 0;

    this._workerSaid = this._workerSaid.bind(this);
    this._bootUpWorker();
  }

  // waiting for worker to finish some work
  @computedFrom('_currentJob')
  get isWaiting() {
    return !!this._currentJob;
  }

  _bootUpWorker() {
    // The first invisible iframe in dumber gist.
    // It's to boot up service worker.
    // The second iframe (user app itself) is then
    // created by ./embedded-browser/browser-frame.js, all contents
    // in second iframe are provided by caches generated
    // in service worker.
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', `https://${this.sessionId.id}.${host}/boot-up-worker.html`);
    iframe.setAttribute('style', 'display: none');
    document.body.appendChild(iframe);
    this.iframe = iframe;

    let resolveWorker = null;
    this._workerUp = new Promise(resolve => resolveWorker = resolve);

    const handleMessage = event => {
      if (event.data && event.data.type === 'worker-up') {
        console.info('Dumber Gist Service Worker is up!');
        removeEventListener('message', handleMessage);
        addEventListener('message', this._workerSaid);
        resolveWorker();
        return;
      }
    };

    addEventListener('message', handleMessage);
  }

  _workerSaid(event) {
    const {data} = event;
    if (!data) return;
    const {type} = data;
    if (!type) return;

    if (type === 'get-cache') {
      const {hash, meta} = event.data;
      this.dumberCache.getCache(hash, meta).then(
        object => this._workerDo({type: 'got-cache', hash, object}),
        () => {
          this.ea.publish('miss-cache', {hash, meta});
          this._workerDo({type: 'got-cache', hash});
        }
      );
      return;
    } else if (type === 'set-cache') {
      const {hash, object} = event.data;
      this.dumberCache.setCache(hash, object).then(() => {}, () => {});
      return;
    } else if (type === 'history-push-state') {
      this.historyTracker.pushState(data.title, data.url);
      return;
    } else if (type === 'history-replace-state') {
      this.historyTracker.replaceState(data.title, data.url);
      return;
    } else if (type === 'history-go') {
      this.historyTracker.go(data.delta);
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

  _workerDo(action) {
    this.iframe.contentWindow.postMessage(action, '*');
  }

  _kickOff() {
    this._workerUp.then(() => {
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
