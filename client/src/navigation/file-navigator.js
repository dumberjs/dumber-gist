import {inject, bindable, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {EditSession} from '../edit/edit-session';
import {FileTree} from '../edit/file-tree';
import {DndService} from 'bcx-aurelia-dnd';
import _ from 'lodash';

@inject(EventAggregator, DndService, EditSession, FileTree)
export class FileNavigator {
  @bindable insideIframe;
  collapseFlags = {};

  constructor(ea, dndService, session, fileTree) {
    this.ea = ea;
    this.dndService = dndService;
    this.session = session;
    this.fileTree = fileTree;
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

  @computedFrom('session.gist')
  get isNew() {
    return !_.get(this.session, 'gist.id');
  }

  @computedFrom('session.gist')
  get isPrivate() {
    return !_.get(this.session, 'gist.public');
  }
}
