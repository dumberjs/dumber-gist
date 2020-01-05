import {inject, noView} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {CreateFileDialog} from './dialogs/create-file-dialog';
import {EditNameDialog} from './dialogs/edit-name-dialog';
import {ConfirmationDialog} from './dialogs/confirmation-dialog';
import {EditSession} from './edit/edit-session';
import {OpenedFiles} from './edit/opened-files';
import {combo} from 'aurelia-combo';

@noView()
@inject(EventAggregator, DialogService, EditSession, OpenedFiles)
export class ActionDispatcher {
  constructor(ea, dialogService, session, openedFiles) {
    this.ea = ea;
    this.dialogService = dialogService;
    this.session = session;
    this.openedFiles = openedFiles;

    this.updateFile = this.updateFile.bind(this);
    this.updatePath = this.updatePath.bind(this);
    this.createFile = this.createFile.bind(this);
    this.editName = this.editName.bind(this);
    this.importFile = this.importFile.bind(this);
    this.deleteNode = this.deleteNode.bind(this);
  }

  attached() {
    this._subscribers = [
      this.ea.subscribe('update-file', this.updateFile),
      this.ea.subscribe('update-path', this.updatePath),
      this.ea.subscribe('create-file', this.createFile),
      this.ea.subscribe('edit-name', this.editName),
      this.ea.subscribe('import-file', this.importFile),
      this.ea.subscribe('delete-node', this.deleteNode),
      this.ea.subscribe('open-file', fn => this.openedFiles.openFile(fn)),
      this.ea.subscribe('close-file', fn => this.openedFiles.closeFile(fn)),
      this.ea.subscribe('renamed-file', ({oldFilename, newFilename}) => {
        this.openedFiles.afterRenameFile(oldFilename, newFilename);
      })
    ];
  }

  detached() {
    this._subscribers.forEach(s => s.dispose());
  }

  updateFile(file) {
    this.session.updateFile(file.filename, file.content);
  }

  updatePath({oldFilePath, newFilePath}) {
    this.session.updatePath(oldFilePath, newFilePath);
  }

  // TODO test ctrl-n in Win10 Chrome
  @combo('ctrl+n')
  createFileWithKeyboard(e) {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    this.createFile();
  }

  createFile(inDir = '') {
    this.dialogService.open({
      viewModel: CreateFileDialog,
      model: {filePath: inDir}
    }).whenClosed(response => {
      if (response.wasCancelled) return;
      const filename = response.output;
      this.session.createFile(filename);
    });
  }

  editName({filePath, isFolder}) {
    this.dialogService.open({
      viewModel: EditNameDialog,
      model: {filePath, isFolder}
    }).whenClosed(response => {
      if (response.wasCancelled) return;
      const newFilePath = response.output;
      this.updatePath(filePath, newFilePath);
    });
  }

  importFile(file) {
    this.session.createFile(file.filename, file.content, true);
  }

  deleteNode({filePath, isFolder}) {
    this.dialogService.open({
      viewModel: ConfirmationDialog,
      model: {
        message: `Delete ${isFolder ? 'folder' : 'file'} "${filePath}"?`
      }
    }).whenClosed(response => {
      if (response.wasCancelled) return;
      if (isFolder) {
        this.session.deleteFolder(filePath);
      } else {
        this.session.deleteFile(filePath);
      }
    });
  }
}
