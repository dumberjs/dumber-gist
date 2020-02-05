import {DialogController} from 'aurelia-dialog';
import {inject, observable} from 'aurelia-framework';
import {combo} from 'aurelia-combo';
import {Gists} from '../github/gists';
import _ from 'lodash';

@inject(DialogController, Gists)
export class ListGistsDialog {
  @observable hideNoneDumberGists = true;
  list = [];
  selectedIdx = -1;
  filteredList = [];

  constructor(controller, gists) {
    this.controller = controller;
    this.controller.settings.overlayDismiss = false;
    this.gists = gists;
  }

  activate(model) {
    this.login = model.login;
    this.list = _.sortBy(model.list, 'updated_at').reverse();
    this.hideNoneDumberGistsChanged(this.hideNoneDumberGists);
  }

  hideNoneDumberGistsChanged(hideNoneDumberGists) {
    const selected = this.selectedIdx >= 0 ?
      this.filteredList[this.selectedIdx] :
      null;

    if (hideNoneDumberGists) {
      this.filteredList = this.list.filter(g => g.files['index.html'] && g.files['package.json']);
    } else {
      this.filteredList = this.list;
    }

    if (selected) {
      this.selectedIdx = _.findIndex(this.filteredList, {id: selected.id});
    } else {
      this.selectedIdx = -1;
    }
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
      this.selectedIdx < this.filteredList.length - 1
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
      const selected = this.filteredList[selectedIdx];
      if (selected) {
        this.controller.ok(selected.id);
      }
    }
  }
}
