import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {EditSession} from './edit-session';
import _ from 'lodash';

@inject(EventAggregator, EditSession)
export class EditorTabs {
  constructor(ea, session) {
    this.ea = ea;
    this.session = session;
  }
}

export class LastPartValueConverter {
  toView(filename) {
    return _.last(filename.split('/'));
  }
}
