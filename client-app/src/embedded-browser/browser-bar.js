import {inject, bindable, bindingMode} from 'aurelia-framework';
import {DialogService} from 'aurelia-dialog';
import {BrowserConfigDialog} from './dialogs/browser-config-dialog';
import {EditSession} from '../edit/edit-session';

@inject(DialogService, EditSession)
export class BrowserBar {
  @bindable isBundling;
  @bindable({defaultBindingMode: bindingMode.twoWay}) autoRefresh;
  @bindable bundle;

  constructor(dialogService, session) {
    this.dialogService = dialogService;
    this.session = session;
  }

  goBack() {

  }

  goForward() {

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
