import {inject, bindable, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {EditNameDialog} from './dialogs/edit-name-dialog';
import {CreateFileDialog} from './dialogs/create-file-dialog';
import {EditSession} from './edit-session';

@inject(EventAggregator, DialogService, EditSession)
export class FileNode {
  @bindable node;
  @bindable indent = 0;
  @bindable collapseFlags;

  constructor(ea, dialogService, session) {
    this.ea = ea;
    this.dialogService = dialogService;
    this.session = session;
  }

  edit() {
    const {file} = this.node;
    if (!file) return;
    this.session.editFile(file);
  }

  editName(event) {
    if (event) event.stopPropagation();
    const {filePath, files} = this.node;
    const isFolder = !!files;
    this.dialogService.open({
      viewModel: EditNameDialog,
      model: {filePath, isFolder}
    }).whenClosed(response => {
      if (response.wasCancelled) return;
      const newFilePath = response.output;
      this.session.updateFilePath(filePath, newFilePath);
    });
  }

  createFile(event) {
    if (event) event.stopPropagation();
    const {filePath} = this.node;

    this.dialogService.open({
      viewModel: CreateFileDialog,
      model: {filePath}
    }).whenClosed(response => {
      if (response.wasCancelled) return;
      const filename = response.output;
      this.session.createFile(filename);
    });
  }

  delete(event) {
    if (event) event.stopPropagation();
    const {filePath, files} = this.node;
    const isFolder = !!files;

    // TODO confirm dialog

    if (isFolder) {
      this.session.deleteFolder(filePath);
    } else {
      this.session.deleteFile(filePath);
    }
  }

  @computedFrom('node', 'node.filePath', 'session.editingFile')
  get cssClass() {
    const target = this.session.editingFile;
    if (!target) return '';
    if (this.node.filePath === target.filename) return 'active';
    return '';
  }
}
