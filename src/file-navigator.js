import {inject, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {FileTree} from './edit/file-tree';
import {DndService} from 'bcx-aurelia-dnd';

@inject(EventAggregator, FileTree, DndService)
export class FileNavigator {
  collapseFlags = {};

  constructor(ea, fileTree, dndService) {
    this.ea = ea;
    this.fileTree = fileTree;
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
    this.ea.publish('update-path', {
      oldFilePath: node.filePath,
      newFilePath: node.name
    });
  }

  createFile() {
    this.ea.publish('create-file');
  }

  @computedFrom('dnd', 'dnd.isProcessing', 'dnd.canDrop', 'dnd.isHoveringShallowly')
  get dndClass() {
    const {dnd} = this;
    if (!dnd || !dnd.isProcessing) return '';
    if (!dnd.canDrop || !dnd.isHoveringShallowly) return '';
    return 'can-drop';
  }
}
