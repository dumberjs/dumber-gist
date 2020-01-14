/* globals toastr */
import {inject, noView} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

Object.assign(toastr.options, {
 positionClass: 'toast-top-center',
 timeOut: 10000,
 extendedTimeOut: 30000,
 progressBar: true,
 preventDuplicates: true,
 escapeHtml: true
});

@noView()
@inject(EventAggregator)
export class Toastrie {
  constructor(ea) {
    this.ea = ea;
  }

  attached() {
    this._subscribers = [
      this.ea.subscribe('success', (message) => {
        toastr.success(message);
      }),
      this.ea.subscribe('info', (message) => {
        toastr.info(message);
      }),
      this.ea.subscribe('error', (message) => {
        console.error(message);
        toastr.error(message);
      }),
      this.ea.subscribe('warning', (message) => {
        console.warn(message);
        toastr.warning(message);
      }),
    ];
  }

  detached() {
    this._subscribers.forEach(s => s.dispose());
  }
}
