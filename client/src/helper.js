import {inject} from 'aurelia-framework';
import {DialogService} from 'aurelia-dialog-lite';
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
    });
  }

  waitFor(title, promise, opts = {}) {
    return this.dialogService.create({
      viewModel: WaitingDialog,
      model: {...opts, title}
    }).then(controller => {
      // Close the waiting dialog,
      // and return original promise.
      promise.then(() => controller.ok(), () => controller.ok());
      return promise;
    });
  }
}
