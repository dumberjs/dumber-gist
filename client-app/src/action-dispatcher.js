import {inject, noView} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {CreateFileDialog} from './dialogs/create-file-dialog';
import {EditNameDialog} from './dialogs/edit-name-dialog';
import {Helper} from './helper';
import {EditSession} from './edit/edit-session';
import {OpenedFiles} from './edit/opened-files';
import {Gists} from './github/gists';
import {User} from './github/user';
import {combo} from 'aurelia-combo';
import _ from 'lodash';

@noView()
@inject(EventAggregator, DialogService, EditSession, OpenedFiles, User, Gists, Helper)
export class ActionDispatcher {
  constructor(ea, dialogService, session, openedFiles, user, gists, helper) {
    this.ea = ea;
    this.dialogService = dialogService;
    this.session = session;
    this.openedFiles = openedFiles;
    this.user = user;
    this.gists = gists;
    this.helper = helper;

    this.updateFile = this.updateFile.bind(this);
    this.newDraft = this.newDraft.bind(this);
    this.updatePath = this.updatePath.bind(this);
    this.createFile = this.createFile.bind(this);
    this.editName = this.editName.bind(this);
    this.importFile = this.importFile.bind(this);
    this.deleteNode = this.deleteNode.bind(this);
    this.saveGist = this.saveGist.bind(this);
    this.forkGist = this.forkGist.bind(this);
  }

  attached() {
    this._subscribers = [
      this.ea.subscribe('new-draft', this.newDraft),
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
      }),
      this.ea.subscribe('save-gist', this.saveGist),
      this.ea.subscribe('fork-gist', this.forkGist),
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

  newDraft() {
    this.session.loadGist({description: '', files: []});
    this.ea.publish('info', 'Started a new gist draft');
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
      this.session.updatePath(filePath, newFilePath);
    });
  }

  importFile(file) {
    this.session.createFile(file.filename, file.content, true);
  }

  deleteNode({filePath, isFolder}) {
    this.helper.confirm(`Delete ${isFolder ? 'folder' : 'file'} "${filePath}"?`)
    .then(
      () => {
        if (isFolder) {
          this.session.deleteFolder(filePath);
        } else {
          this.session.deleteFile(filePath);
        }
      },
      () => {}
    );
  }

  async saveGist() {
    const {gist, description, files} = this.session;
    const {authenticated, login} = this.user;
    if (!authenticated) return;

    // TODO dialog to ask public and description

    const filesMap = {};
    _.each(files, f => {
      if (!_.trim(f.content)) {
        const error = `Can not save empty file ${JSON.stringify(f.filename)}`;
        this.ea.publish('error', error);
        throw new Error(error);
      }

      filesMap[f.filename] = {
        content: f.content
      };
    });

    const newGist = {description, files: filesMap, public: true};
    try {
      let updateGist;

      if (!gist.id) {
        // new gist
        updateGist = this.gists.create(newGist);
      } else {
        // existing gist
        if (gist.owner && gist.owner.login !== login) return;
        updateGist = this.gists.update(gist.id, newGist);
      }

      const updatedGist = await this.helper.waitFor('Saving ...', updateGist);

      this.ea.publish('success', 'Gist is saved.');
      this.session.importData({
        description: updatedGist.description,
        files: updatedGist.files,
        gist: updatedGist
      });
    } catch (e) {
      this.ea.publish('error', 'Failed to save gist: ' + e.message);
    }
  }

  forkGist() {

  }
}
