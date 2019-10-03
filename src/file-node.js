import {inject, bindable, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {EditSession} from './edit-session';

@inject(EventAggregator, EditSession)
export class FileNode {
  @bindable node;
  @bindable collapseFlags;

  constructor(ea, session) {
    this.ea = ea;
    this.session = session;
  }

  edit() {
    this.session.editFile(this.node);
  }

  @computedFrom('node', 'node.filename', 'session.editingFile')
  get cssClass() {
    const target = this.session.editingFile;
    if (!target) return '';
    if (this.node.filename === target.filename) return 'active';
    return '';
  }
}
