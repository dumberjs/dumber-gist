import {inject, bindable, bindingMode, BindingEngine} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {OpenedFiles} from './opened-files';
import {DialogService} from 'aurelia-dialog';
import {EditorConfigDialog} from './dialogs/editor-config-dialog';
import _ from 'lodash';

@inject(EventAggregator, BindingEngine, OpenedFiles, DialogService)
export class EditorTabs {
  @bindable({defaultBindingMode: bindingMode.twoWay}) vimMode;

  constructor(ea, bindingEngine, openedFiles, dialogService) {
    this.ea = ea;
    this.bindingEngine = bindingEngine;
    this.openedFiles = openedFiles;
    this.dialogService = dialogService;
    this.showActiveTab = _.debounce(this.showActiveTab.bind(this));
  }

  attached() {
    this.subscribers = [
      this.bindingEngine.propertyObserver(this.openedFiles, 'focusedIndex').subscribe(this.showActiveTab)
    ];
  }

  detached() {
    this.subscribers.forEach(s => s.dispose());
  }

  config() {
    this.dialogService.open({
      viewModel: EditorConfigDialog,
      model: {
        config: {
          vimMode: this.vimMode,
        },
        insideIframe: this.insideIframe
      }
    }).whenClosed(response => {
      if (response.wasCancelled) return;
      const {output} = response;
      this.autoRefresh = output.autoRefresh;
    });
  }

  closeFile(filename) {
    this.ea.publish('close-file', filename);
  }

  showActiveTab() {
    const active = this.el.querySelector('.tab.active');
    if (active) {
      if (active.scrollIntoViewIfNeeded) {
        active.scrollIntoViewIfNeeded();
      } else {
        active.scrollIntoView();
      }
    }
  }

  afterReordering(filenames, change) {
    if (this.openedFiles.focusedIndex !== change.toIndex) {
      this.openedFiles.focusedIndex = change.toIndex;
    } else {
      // Force a mutation
      this.openedFiles.focusedIndex = change.toIndex - 1;
      this.openedFiles.focusedIndex = change.toIndex;
    }
  }
}

export class LastPartValueConverter {
  toView(filename) {
    return _.last(filename.split('/'));
  }
}
