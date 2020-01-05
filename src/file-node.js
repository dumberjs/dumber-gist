import {inject, bindable, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {EditNameDialog} from './dialogs/edit-name-dialog';
import {CreateFileDialog} from './dialogs/create-file-dialog';
import {ConfirmationDialog} from './dialogs/confirmation-dialog';
import {FileContextmenu} from './dialogs/file-contextmenu';
import {EditSession} from './edit/edit-session';
import {OpenedFiles} from './edit/opened-files';
import {DndService} from 'bcx-aurelia-dnd';

@inject(EventAggregator, DialogService, EditSession, OpenedFiles, DndService)
export class FileNode {
  @bindable node;
  @bindable indent = 0;
  @bindable collapseFlags;

  constructor(ea, dialogService, session, openedFiles, dndService) {
    this.ea = ea;
    this.dialogService = dialogService;
    this.session = session;
    this.openedFiles = openedFiles;
    this.dndService = dndService;
  }

  attached() {
    this.dndService.addSource(this, {
      element: this.srElement,
      hideCursor: true,
      centerPreviewToMousePosition: true
    });
    this.dndService.addTarget(this);
  }

  detached() {
    this.dndService.removeSource(this);
    this.dndService.removeTarget(this);
  }

  dndModel() {
    return {type: 'move-file', node: this.node};
  }

  dndCanDrop(model) {
    const {type, node} = model;
    if (type !== 'move-file') return false;
    const {files, filePath} = this.node;
    if (!files) return false;
    const sourceFilePath = node.filePath;
    if (!sourceFilePath) return false;
    if (filePath.startsWith(sourceFilePath)) return false;
    return true;
  }

  dndDrop() {
    const sourceNode = this.dnd.model.node;
    const {filePath} = this.node;
    this.session.updatePath(sourceNode.filePath, filePath + '/' + sourceNode.name);
  }

  onClick() {
    if (this.node.files) {
      this.collapseFlags[this.node.filePath] = !this.collapseFlags[this.node.filePath];
    } else {
      this.edit();
    }
  }

  onContextmenu(e) {
    this.dialogService.open({
      viewModel: FileContextmenu,
      model: {
        x: e.pageX,
        y: e.pageY,
        items: [
          {title: 'Rename...', code: 'rename'},
          {title: 'Delete', code: 'delete', class: 'text-error'}
        ]
      }
    }).whenClosed(response => {
      if (response.wasCancelled) return;

      const code = response.output;
      if (code === 'rename') return this.editName();
      else if (code === 'delete') return this.delete();
    })
  }

  edit() {
    const {file} = this.node;
    if (!file) return;
    this.ea.publish('open-file', file.filename);
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
      this.session.updatePath(filePath, newFilePath);
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

  @computedFrom('node', 'node.filePath', 'openedFiles.editingFile')
  get cssClass() {
    const target = this.openedFiles.editingFile;
    if (!target) return '';
    if (this.node.filePath === target.filename) return 'active';
    return '';
  }

  @computedFrom('dnd', 'dnd.isProcessing', 'dnd.canDrop', 'dnd.isHoveringShallowly')
  get dndClass() {
    const {dnd} = this;
    if (!dnd || !dnd.isProcessing) return '';
    if (!dnd.canDrop || !dnd.isHoveringShallowly) return '';
    return 'can-drop';
  }
}
