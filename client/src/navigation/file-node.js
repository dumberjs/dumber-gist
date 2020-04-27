import {inject, bindable, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog-lite';
import {ContextMenu} from '../dialogs/context-menu';
import {OpenedFiles} from '../edit/opened-files';
import {DndService} from 'bcx-aurelia-dnd';

@inject(EventAggregator, DialogService, OpenedFiles, DndService)
export class FileNode {
  @bindable node;
  @bindable indent = 0;
  @bindable collapseFlags;

  constructor(ea, dialogService, openedFiles, dndService) {
    this.ea = ea;
    this.dialogService = dialogService;
    this.openedFiles = openedFiles;
    this.dndService = dndService;
  }

  attached() {
    this.dndService.addSource(this, {
      element: this.srElement,
      hideCursor: true
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
    this.ea.publish('update-path', {
      oldFilePath: sourceNode.filePath,
      newFilePath: filePath + '/' + sourceNode.name
    });
  }

  onClick() {
    if (this.node.files) {
      this.collapseFlags[this.node.filePath] = !this.collapseFlags[this.node.filePath];
    } else {
      this.edit();
    }
  }

  onContextmenu(e) {
    if (this.dialogService.hasActiveDialog) return;

    this.dialogService.open({
      viewModel: ContextMenu,
      model: {
        left: e.pageX,
        top: e.pageY,
        items: [
          {title: 'Rename', code: 'rename', icon: 'fas fa-pencil-alt'},
          {title: 'Delete', code: 'delete', danger: true, icon: 'fas fa-trash-alt'}
        ]
      }
    }).then(
      code => {
        if (code === 'rename') return this.editName();
        else if (code === 'delete') return this.delete();
      },
      () => {}
    );
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
    this.ea.publish('edit-name', {filePath, isFolder});
  }

  createFile(event) {
    if (event) event.stopPropagation();
    const {filePath} = this.node;
    this.ea.publish('create-file', filePath);
  }

  delete(event) {
    if (event) event.stopPropagation();
    const {filePath, files} = this.node;
    const isFolder = !!files;
    this.ea.publish('delete-node', {filePath, isFolder});
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
