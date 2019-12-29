import crypto from 'crypto';
import {inject, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import localforage from 'localforage';

@inject(EventAggregator)
export class WorkerService {
  constructor(ea) {
    this.ea = ea;
    // id is the unique identifier for every gist-code instance.
    // Then worker and app are behind https://${id}.gist-code.com.
    if (process.env.NODE_ENV !== 'production') {
      this.id = 'app';
    } else {
      this.id = crypto.randomBytes(20).toString('hex');
    }

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
    // The first invisible iframe in gist-code.
    // It's to boot up service worker.
    // The second iframe (user app itself) is then
    // created by ./browser-frame.js, all contents
    // in second iframe are provided by caches generated
    // by service worker.
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', `https://${this.id}.gist-code.com/boot-up-worker.html`);
    iframe.setAttribute('style', 'display: none');
    document.body.appendChild(iframe);
    this.iframe = iframe;

    let resolveWorker = null;
    this._workerUp = new Promise(resolve => resolveWorker = resolve);

    const handleMessage = event => {
      if (event.data && event.data.type === 'worker-up') {
        console.log('gist-code Service Worker is up!');
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
    if (!data || !data.type) return;

    if (data.type === 'get-cache') {
      const {hash} = event.data;
      localforage.getItem(hash)
        .then(
          object => this._workerDo({type: 'got-cache', hash, object}),
          () => this._workerDo({type: 'got-cache', hash})
        );
      return;
    } else if (data.type === 'set-cache') {
      localforage.setItem(event.data.hash, event.data.object);
      return;
    }

    const {_currentJob} = this;
    if (!_currentJob) return;

    if (data.id !== _currentJob.id || (data.type !== 'ack' && data.type !== 'err')) {
      this.ea.publish('warning', `While waiting for acknowledgement id:${_currentJob.id} from service worker, received unexpected result ${JSON.stringify(data)}.`);
      return;
    }

    if (data.type === 'err') {
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
