import {inject, bindable, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {EditNameDialog} from './dialogs/edit-name-dialog';
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
    const {name, filePath, files} = this.node;
    const isFolder = !!files;
    this.dialogService.open({
      viewModel: EditNameDialog,
      model: {name, isFolder}
    }).whenClosed(response => {
      if (response.wasCancelled) return;
      const name = response.output;

      const parts = filePath.split('/');
      const newFilePath = [...parts.slice(0, -1), name].join('/');

      this.session.updateFilePath(filePath, newFilePath);
    });
  }

  @computedFrom('node', 'node.filePath', 'session.editingFile')
  get cssClass() {
    const target = this.session.editingFile;
    if (!target) return '';
    if (this.node.filePath === target.filename) return 'active';
    return '';
  }
}
