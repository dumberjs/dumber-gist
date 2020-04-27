import {DialogController} from 'aurelia-dialog-lite';
import {inject, observable} from 'aurelia-framework';
import {combo} from 'aurelia-combo';
import {Gists} from '../github/gists';
import _ from 'lodash';

@inject(DialogController, Gists)
export class ListGistsDialog {
  @observable filter = '';
  @observable hideNoneDumberGists = true;
  gists = [];
  selectedIdx = -1;
  filteredGists = [];

  constructor(controller, gists) {
    this.controller = controller;
    this.gists = gists;
    this._updateFilteredGists = _.debounce(this._updateFilteredGists.bind(this));
  }

  activate(model) {
    this.login = model.login;
    this.gists = _.sortBy(model.gists, 'updated_at').reverse();
    this._updateFilteredGists();
  }

  hideNoneDumberGistsChanged() {
    this._updateFilteredGists();
  }

  filterChanged() {
    this._updateFilteredGists();
  }

  _updateFilteredGists() {
    const selected = this.selectedIdx >= 0 ?
      this.filteredGists[this.selectedIdx] :
      null;

    let filteredGists;
    if (this.hideNoneDumberGists) {
      filteredGists = this.gists.filter(g => g.files['index.html'] && g.files['package.json']);
    } else {
      filteredGists = this.gists;
    }

    const filter = _.trim(this.filter).toLowerCase();
    if (filter) {
      filteredGists = filteredGists.filter(g =>
        _.toLower(g.description).includes(filter)
      );
    }

    this.filteredGists = filteredGists;

    if (selected) {
      this.selectedIdx = _.findIndex(this.filteredGists, {id: selected.id});
    } else {
      this.selectedIdx = -1;
    }
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
      this.selectedIdx < this.filteredGists.length - 1
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
      const selected = this.filteredGists[selectedIdx];
      if (selected) {
        this.controller.ok(selected.id);
      }
    }
  }
}
