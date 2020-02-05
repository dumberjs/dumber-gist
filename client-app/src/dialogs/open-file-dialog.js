import {combo} from 'aurelia-combo';
import {DialogController} from 'aurelia-dialog';
import {inject, observable} from 'aurelia-framework';
import _ from 'lodash';

@inject(DialogController)
export class OpenFileDialog {
  @observable filter = '';
  selectedIdx = -1;
  filteredFilenames = [];

  constructor(controller) {
    this.controller = controller;
    this.controller.settings.lock = true;
  }

  activate(model) {
    this.filenames = model.filenames;
    this.filteredFilenames = _.map(this.filenames, f => [f]);
  }

  keyDownInFilter(e) {
    if (e.keyCode === 38) { // up
      e.target.blur();
      this.selectPrevious();
      return false;
    } else if (e.keyCode === 40) { // down
      e.target.blur();
      this.selectNext();
      return false;
    } else if (e.keyCode === 13) { // return
      this.open(this.selectedIdx);
      return false;
    }

    return true;
  }

  @combo('up')
  selectPrevious() {
    if (this.selectedIdx === -1) {
      this.selectedIdx = 0;
    } else if (this.selectedIdx > 0) {
      this.selectedIdx -= 1;
    }
    this.scrollIfNeeded();
  }

  @combo('down')
  selectNext() {
    if (this.selectedIdx === -1) {
      this.selectedIdx = 0;
    } else if (
      this.selectedIdx >= 0 &&
      this.selectedIdx < this.filteredFilenames.length - 1
    ) {
      this.selectedIdx += 1;
    }
    this.scrollIfNeeded();
  }

  @combo('enter')
  submitIfSelected() {
    this.open(this.selectedIdx);
  }

  scrollIfNeeded() {
    setTimeout(() => {
      const selected = this.list.querySelector('.available-file.selected');
      if (selected) {
        if (selected.scrollIntoViewIfNeeded) {
          selected.scrollIntoViewIfNeeded();
        } else if (selected.scrollIntoView) {
          selected.scrollIntoView();
        }
      }
    });
  }

  open(selectedIdx) {
    if (selectedIdx >= 0) {
      const segments = this.filteredFilenames[selectedIdx];
      if (segments) {
        this.controller.ok(segments.join(''));
      }
    }
  }

  filterChanged(filter) {
    const {filenames} = this;
    filter = _.trim(filter);
    const ii = filter.length;
    if (ii === 0) {
      this.filteredFilenames = _.map(this.filenames, f => [f]);
      this.selectedIdx = -1;
      return;
    }

    const filtered = [];
    _.each(filenames, fn => {
      let idx = 0;

      const matches = [];
      for (let i = 0; i < ii; i++) {
        const c = filter[i];
        const nextIdx = fn.indexOf(c, idx);
        if (nextIdx === -1) return;
        if (_.get(_.last(matches), 'end')=== nextIdx) {
          _.last(matches).end += 1;
        } else {
          matches.push({start: nextIdx, end: nextIdx + 1});
        }
        idx = nextIdx + 1;
      }

      // odd is unmatched, even is matched.
      const segments = [];
      let start = 0;
      for (let j = 0, jj = matches.length; j < jj; j++) {
        const m = matches[j];
        // unmatched
        segments.push(fn.slice(start, m.start));
        // matched
        segments.push(fn.slice(m.start, m.end));
        start = m.end;
      }
      if (start < fn.length) {
        segments.push(fn.slice(start));
      }

      filtered.push(segments);
    });

    this.filteredFilenames = _.sortBy(filtered, 'length');
    if (this.filteredFilenames.length) {
      this.selectedIdx = 0;
    } else {
      this.selectedIdx = -1;
    }
  }
}
