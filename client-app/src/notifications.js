import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import _ from 'lodash';

const TIME_TO_STAY = 5000;

const eventMap = {
  error: 'danger',
  'info-clean': 'info',
  'info-dark': 'dark'
};

@inject(EventAggregator)
export class Notifications {
  notifications = [];
  removers = {};
  _nextId = 0;

  constructor(ea) {
    this.ea = ea;
    this.handleNoti = this.handleNoti.bind(this);
  }

  attached() {
    const {handleNoti} = this;
    this.subscribers = [
      this.ea.subscribe('success', handleNoti),
      this.ea.subscribe('info', handleNoti),
      this.ea.subscribe('error', handleNoti),
      this.ea.subscribe('warning', handleNoti),
      this.ea.subscribe('info-clean', handleNoti),
      this.ea.subscribe('info-dark', handleNoti),
    ];
  }

  detached() {
    _.each(this.subscribers, s => s.dispose());
  }

  nextId() {
    this._nextId += 1;
    return this._nextId;
  }

  handleNoti(message, event) {
    const style = eventMap[event] || event;
    this.addNoti(style, message);
  }

  addNoti(style, title, message) {
    if (!message) {
      message = title;
      title = '';
    }

    if (style === 'warning' || style === 'danger') {
      let existing =  _.find(this.notifications, {style, title, message});

      if (existing) {
        // don't show same warning/error again.
        existing.count = (existing.count || 1) + 1;

        if (style !== 'danger') {
          // reset remover
          this.stopFutureRemove(existing.id);
          this.setFutureRemove(existing.id);
        }
        return;
      }
    }

    let icon = '';
    if (style === 'success') icon = 'far fa-check';
    else if (style === 'info') icon = 'fas fa-info-circle';
    else if (style === 'warning') icon = 'fas fa-exclamation-circle';
    else if (style === 'danger') icon = 'fas fa-exclamation-triangle';

    const id = this.nextId();
    this.notifications.push({id, style, icon, title, message});

    if (style !== 'danger') {
      this.setFutureRemove(id);
    }
  }

  removeNotification(id) {
    const idx = _.findIndex(this.notifications, {id});
    if (idx >= 0) {
      this.notifications.splice(idx, 1);
      delete this.removers[id];
    }
  }

  stopFutureRemove(id) {
    if (this.removers[id]) {
      clearTimeout(this.removers[id]);
      delete this.removers[id];
    }
  }

  setFutureRemove(id) {
    if (this.removers[id]) return;
    this.removers[id] = setTimeout(() => {
      this.removeNotification(id);
    }, TIME_TO_STAY);
  }
}
