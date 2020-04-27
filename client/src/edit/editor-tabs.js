import {inject, bindable, bindingMode, BindingEngine} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {OpenedFiles} from './opened-files';
import {DialogService} from 'aurelia-dialog-lite';
import {EditorConfigDialog} from './dialogs/editor-config-dialog';
import _ from 'lodash';

@inject(EventAggregator, BindingEngine, OpenedFiles, DialogService)
export class EditorTabs {
  @bindable insideIframe;
  @bindable({defaultBindingMode: bindingMode.twoWay}) vimMode = false;
  @bindable({defaultBindingMode: bindingMode.twoWay}) lineWrapping = false;

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
    if (this.insideIframe) return;
    if (this.dialogService.hasActiveDialog) return;

    this.dialogService.open({
      viewModel: EditorConfigDialog,
      model: {
        vimMode: this.vimMode,
        lineWrapping: this.lineWrapping
      }
    }).then(
      output => {
        this.vimMode = output.vimMode;
        this.lineWrapping = output.lineWrapping;
      },
      () => {}
    );
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
