import {inject, computedFrom, BindingEngine} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {EditSession} from './edit-session';
import _ from 'lodash';

@inject(EventAggregator, EditSession, BindingEngine)
export class OpenedFiles {
  filenames = [];
  focusedIndex = -1;

  constructor(ea, session, bindingEngine) {
    this.ea = ea;
    this.session = session;
    bindingEngine.propertyObserver(session, 'mutation').subscribe(() => {
      // if (mutation <= 0) {
      //   // just loaded new gist
      //   this._reset();
      // } else {
      this._cleanUp();
      // }
    });
  }

  openFile(filename) {
    const file = _.find(this.session.files, {filename});
    if (!file) return;

    const idx = this.filenames.indexOf(filename);
    if (idx === -1) {
      this.filenames.push(filename);
      this.focusedIndex = this.filenames.length - 1;
    } else {
      this.focusedIndex = idx;
    }

    this.ea.publish('opened-file', filename);
  }

  closeFile(filename) {
    const file = _.find(this.session.files, {filename});
    if (!file) return;

    const idx = this.filenames.indexOf(filename);

    if (idx !== -1) {
      this.filenames.splice(idx, 1);
      if (this.focusedIndex > idx) {
        this.focusedIndex -= 1;
      } else if (this.focusedIndex === idx) {
        if (this.focusedIndex >= this.filenames.length) {
          this.focusedIndex = this.filenames.length - 1;
        } else {
          // force reload
          this.focusedIndex += 1;
          this.focusedIndex -= 1;
        }
      }
    }

    this.ea.publish('closed-file', filename);
  }

  afterRenameFile(oldFilename, newFilename) {
    const idx = this.filenames.indexOf(oldFilename);

    if (idx !== -1) {
      this.filenames.splice(idx, 1, newFilename);
      if (this.focusedIndex === idx) {
        // force reload
        this.focusedIndex += 1;
        this.focusedIndex -= 1;
      }
    }
  }

  @computedFrom('filenames', 'focusedIndex', 'session.mutation')
  get editingFile() {
    if (this.focusedIndex >= 0) {
      const fn = this.filenames[this.focusedIndex];
      if (fn) {
        return _.find(this.session.files, {filename: fn});
      }
    }
  }

  // _reset() {
  //   this.filenames = [];
  //   this.focusedIndex = -1;
  // }

  _cleanUp() {
    const toRemove = [];
    _.each(this.filenames, (fn, i) => {
      if (!_.find(this.session.files, {filename: fn})) {
        // unshift to make sure sort from bigger to smaller index
        toRemove.unshift(i);
      }
    });

    toRemove.forEach(i => this.filenames.splice(i, 1));

    if (this.filenames.length - 1 < this.focusedIndex) {
      this.focusedIndex = this.filenames.length - 1;
    }
  }
}
