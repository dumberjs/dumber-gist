import {inject, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {CreateFileDialog} from './dialogs/create-file-dialog';
import {EditSession} from './edit-session';
import {DndService} from 'bcx-aurelia-dnd';

@inject(EventAggregator, DialogService, EditSession, DndService)
export class FileNavigator {
  collapseFlags = {};

  constructor(ea, dialogService, session, dndService) {
    this.ea = ea;
    this.dialogService = dialogService;
    this.session = session;
    this.dndService = dndService;
  }

  attached() {
    this.dndService.addTarget(this);
  }

  detached() {
    this.dndService.removeTarget(this);
  }

  dndCanDrop(model) {
    return model.type === 'move-file';
  }

  dndDrop() {
    const {node} = this.dnd.model;
    const sourceFilePath = node.filePath;
    this.session.move(sourceFilePath, '');
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

  @computedFrom('dnd', 'dnd.isProcessing', 'dnd.canDrop', 'dnd.isHoveringShallowly')
  get dndClass() {
    const {dnd} = this;
    if (!dnd || !dnd.isProcessing) return '';
    if (!dnd.canDrop || !dnd.isHoveringShallowly) return '';
    return 'can-drop';
  }
}
