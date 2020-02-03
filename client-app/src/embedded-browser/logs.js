import {bindable, computedFrom} from 'aurelia-framework';
import _ from 'lodash';

export class Logs {
  @bindable logs;
  @bindable resetLogs;
  filter = '';

  @computedFrom('filter', 'logs.length')
  get filteredLogs() {
    const {filter, logs} = this;
    if (filter === 'error') {
      return _.filter(logs, {method: 'error'});
    } else if (filter === 'warning') {
      return _.filter(logs, {method: 'warn'});
    } else if (filter === 'logs') {
      return _.filter(logs, l => (
        l.method !== 'error' && l.method !== 'warn'
      ));
    } else {
      return logs;
    }
  }

  // TODO keep scroll to bottom if bottom was previous visible
}
