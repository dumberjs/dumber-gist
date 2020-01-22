import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {OpenedFiles} from './opened-files';
import _ from 'lodash';

@inject(EventAggregator, OpenedFiles)
export class EditorTabs {
  constructor(ea, openedFiles) {
    this.ea = ea;
    this.openedFiles = openedFiles;
  }

  closeFile(filename) {
    this.ea.publish('close-file', filename);
  }
}

export class LastPartValueConverter {
  toView(filename) {
    return _.last(filename.split('/'));
  }
}
