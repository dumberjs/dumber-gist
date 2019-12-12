import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {CreateFileDialog} from './dialogs/create-file-dialog';
import {EditSession} from './edit-session';

@inject(EventAggregator, DialogService, EditSession)
export class FileNavigator {
  collapseFlags = {};

  constructor(ea, dialogService, session) {
    this.ea = ea;
    this.dialogService = dialogService;
    this.session = session;
  }

  createFile() {
    this.dialogService.open({
      viewModel: CreateFileDialog
    }).whenClosed(response => {
      if (response.wasCancelled) return;
      const filename = response.output;
      this.session.createFile(filename);
    });
  }
}
