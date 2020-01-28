import {inject, bindable, bindingMode, BindingEngine} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {BrowserConfigDialog} from './dialogs/browser-config-dialog';
import {EditSession} from '../edit/edit-session';
import {HistoryTracker} from '../history-tracker';

@inject(EventAggregator, BindingEngine, DialogService, EditSession, HistoryTracker)
export class BrowserBar {
  @bindable isBundling;
  @bindable({defaultBindingMode: bindingMode.twoWay}) autoRefresh;
  @bindable bundle;

  url = '';

  constructor(ea, bindingEngine, dialogService, session, historyTracker) {
    this.ea = ea;
    this.dialogService = dialogService;
    this.session = session;
    this.historyTracker = historyTracker;

    bindingEngine.propertyObserver(this.historyTracker, 'currentUrl').subscribe(newUrl => {
      this.url = newUrl;
    });
  }

  goBack() {
    if (!this.isBundling && this.historyTracker.canGoBack) {
      this.ea.publish('history-back');
    }
  }

  goForward() {
    if (!this.isBundling && this.historyTracker.canGoForward) {
      this.ea.publish('history-forward');
    }
  }

  config() {
    this.dialogService.open({
      viewModel: BrowserConfigDialog,
      model: {
        autoRefresh: this.autoRefresh
      }
    }).whenClosed(response => {
      if (response.wasCancelled) return;
      const {output} = response;
      this.autoRefresh = output.autoRefresh;
    })
  }
}
