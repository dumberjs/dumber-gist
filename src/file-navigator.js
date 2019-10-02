import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {EditSession} from './edit-session';

@inject(EventAggregator, EditSession)
export class FileNavigator {
  collapseFlags = {};

  constructor(ea, session) {
    this.ea = ea;
    this.session = session;
  }
}
