import {inject} from 'aurelia-framework';
import {DialogService} from 'aurelia-dialog-lite';
import {EditSession} from '../edit/edit-session';
import {SelectSkeletonDialog} from './dialogs/select-skeleton-dialog';
import {SkeletonGenerator} from '../skeletons/skeleton-generator';

@inject(DialogService, EditSession, SkeletonGenerator)
export class QuickStart {
  constructor(dialogService, session, skeletonGenerator) {
    this.dialogService = dialogService;
    this.session = session;
    this.skeletonGenerator = skeletonGenerator;
  }

  start() {
    if (this.dialogService.hasActiveDialog) return;

    if (this.session.files.length > 0) return;
    this.dialogService.open({
      viewModel: SelectSkeletonDialog
    }).whenClosed(response => {
      if (response.wasCancelled) return;
      const selection = response.output;
      this.skeletonGenerator.generate(selection);
    })
  }
}
