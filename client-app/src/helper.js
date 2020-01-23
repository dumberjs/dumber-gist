import {inject} from 'aurelia-framework';
import {DialogService} from 'aurelia-dialog';
import {EventAggregator} from 'aurelia-event-aggregator';
import {ConfirmationDialog} from './dialogs/confirmation-dialog';
import {WaitingDialog} from './dialogs/waiting-dialog';

@inject(DialogService, EventAggregator)
export class Helper {
  constructor(dialogService, ea) {
    this.dialogService = dialogService;
    this.ea = ea;
  }

  confirm(question, opts = {}) {
    return this.dialogService.open({
      viewModel: ConfirmationDialog,
      model: {question, ...opts}
    }).whenClosed(response => {
      if (response.wasCancelled) {
        throw new Error('confirmation cancelled');
      }
    });
  }

  waitFor(title, promise) {
    return this.dialogService.open({
      viewModel: WaitingDialog,
      model: {title}
    }).then(openDialogResult => {
      return promise.finally(() => {
        openDialogResult.controller.cancel();
      });
    });
  }
}
