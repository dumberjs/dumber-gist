import {inject} from 'aurelia-framework';
import {DialogService} from 'aurelia-dialog';
import {EditSession} from './edit/edit-session';
import {SelectSkeletonDialog} from './dialogs/select-skeleton-dialog';

@inject(DialogService, EditSession)
export class QuickStart {
  constructor(dialogService, session) {
    this.dialogService = dialogService;
    this.session = session;
  }

  start() {
    if (this.session.files.length > 0) return;
    this.dialogService.open({
      viewModel: SelectSkeletonDialog
    }).whenClosed(response => {
      if (response.wasCancelled) return;
      const skeleton = response.output;
      console.log('skeleton', skeleton);
    })
  }
}
