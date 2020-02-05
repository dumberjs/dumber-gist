import {inject, noView} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {CreateFileDialog} from './dialogs/create-file-dialog';
import {OpenFileDialog} from './dialogs/open-file-dialog';
import {EditNameDialog} from './dialogs/edit-name-dialog';
import {NewGistDialog} from './dialogs/new-gist-dialog';
import {ListGistsDialog} from './dialogs/list-gists-dialog';
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
    this.forkGist = this.forkGist.bind(this);
    this.openAny = this.openAny.bind(this);
    this.listGists = this.listGists.bind(this);
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
      this.ea.subscribe('save-gist', e => {
        this.saveGist(e && e.forceNew);
      }),
      this.ea.subscribe('fork-gist', this.forkGist),
      this.ea.subscribe('open-any', this.openAny),
      this.ea.subscribe('list-gists', this.listGists)
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

  @combo('ctrl+p', 'command+p')
  openAnyWithKeyboard(e) {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    this.openAny();
  }

  openAny() {
    const {files} = this.session;
    if (!files.length) return;
    if (this.dialogService.hasActiveDialog) return;

    this.dialogService.open({
      viewModel: OpenFileDialog,
      model: {filenames: _.map(files, 'filename')}
    }).whenClosed(response => {
      if (response.wasCancelled) return;
      const filename = response.output;
      this.openedFiles.openFile(filename);
    });
  }

  newDraft() {
    this.session.loadGist({description: '', files: []});
    this.ea.publish('info', 'Started a new gist draft');
  }

  createFile(inDir = '') {
    if (this.dialogService.hasActiveDialog) return;

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
    if (this.dialogService.hasActiveDialog) return;

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

  async saveGist(forceNew) {
    const {gist, files} = this.session;
    let {description} = this.session;
    let isPublic = _.get(gist, 'public', true);
    const {authenticated, login} = this.user;
    if (!authenticated) return;

    if (this.dialogService.hasActiveDialog) return;

    const createNew = !gist.id || forceNew;

    if (createNew) {
      try {
        await this.dialogService.open({
          viewModel: NewGistDialog,
          model: {description, isPublic}
        }).whenClosed(response => {
          if (response.wasCancelled) {
            throw new Error('cancelled');
          }
          const {output} = response;
          description = output.description;
          isPublic = output.isPublic;
        })
      } catch (e) {
        // cancelled
        return;
      }
    }

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

    _.keys(gist.files).forEach(fn => {
      // Deleted files
      if (!filesMap[fn]) filesMap[fn] = null;
    });

    const newGist = {description, files: filesMap, public: isPublic};

    try {
      let updateGist;
      if (createNew) {
        // new gist
        updateGist = this.gists.create(newGist);
      } else {
        // existing gist
        if (gist.owner && gist.owner.login !== login) {
          return;
        }
        updateGist = this.gists.update(gist.id, newGist);
      }

      const updatedGist = await this.helper.waitFor('Saving ...', updateGist);

      this.session.importData({
        description: updatedGist.description,
        files: updatedGist.files,
        gist: updatedGist
      });

      this.ea.publish('success', 'Gist is saved.');
      this.ea.publish('saved-gist', {success: true});
    } catch (e) {
      console.error(e);
      this.ea.publish('error', 'Failed to save gist: ' + e.message);
      this.ea.publish('saved-gist', {success: false});
    }
  }

  async forkGist() {
    const {gist, isChanged, files} = this.session;
    if (!gist.id) return;
    if (!this.user.authenticated) return;
    if (this.user.login === gist.owner.login) return;

    const localFiles = isChanged ? _.clone(files) : null;

    try {
      const newGist = await this.helper.waitFor(
        'Forking ...',
        this.gists.fork(gist.id)
      );

      this.session.loadGist(newGist);
      if (localFiles) {
        this.session.importData({files: localFiles});
      }

      this.ea.publish('success', 'Gist is forked.');
      this.ea.publish('forked-gist', {success: true});
    } catch (e) {
      this.ea.publish('error', 'Failed to fork gist: ' + e.message);
      this.ea.publish('forked-gist', {success: false});
    }
  }

  listGists(login) {
    if (!login) return;

    if (this.dialogService.hasActiveDialog) return;

    this.helper.waitFor(
      `Loading ${login}'s gists ...`,
       this.gists.list(login)
    )
    .then(list => {
      return this.dialogService.open({
        viewModel: ListGistsDialog,
        model: {login, list}
      }).whenClosed(response => {
        if (response.wasCancelled) return;
        const id = response.output;
        return this.helper.waitFor(
          `Loading Gist ${id.slice(0, 7)} ...`,
          this.gists.load(id)
        ).then(gist => this.session.loadGist(gist));
      });
    })
    .catch(err => this.ea.publish('error', err.message));
  }
}
