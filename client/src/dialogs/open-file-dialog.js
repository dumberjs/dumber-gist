import {combo} from 'aurelia-combo';
import {DialogController} from 'aurelia-dialog-lite';
import {inject, observable} from 'aurelia-framework';
import {fuzzyFilter} from './fuzzy-filter';

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
    this.filteredFilenames = fuzzyFilter(this.filter, this.filenames);
  }

  keyDownInFilter(e) {
    if (e.key === 'ArrowUp') { // up
      e.target.blur();
      this.selectPrevious();
      return false;
    } else if (e.key === 'ArrowDown') { // down
      e.target.blur();
      this.selectNext();
      return false;
    } else if (e.key === 'Enter') { // return
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
      const selected = this.list.querySelector('.available-item.selected');
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
    this.filteredFilenames = fuzzyFilter(filter, this.filenames);
    if (filter && this.filteredFilenames.length) {
      this.selectedIdx = 0;
    } else {
      this.selectedIdx = -1;
    }
  }
}
