import {inject, observable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import _ from 'lodash';
import {WorkerService} from '../worker-service';

@inject(EventAggregator, WorkerService)
export class EditSession {
  gist = null;
  files = [];
  description = '';

  // mutation value 0 and -1 is reserved
  // for just newly loaded gist.
  @observable mutation = -1;
  isRendered = false;
  isChanged = false;

  constructor(ea, ws) {
    this.ea = ea;
    this.ws = ws;
  }

  _mutate() {
    if (this.mutation >= 9999 || this.mutation < 0) {
      this.mutation = 1;
    } else {
      this.mutation += 1;
    }
  }

  mutationChanged() {
    // FIXME: isRendered should check deleted files.
    this.isRendered = _.every(this.files, 'isRendered');
    this.isChanged = !this.gist ||
      _.some(this.files, 'isChanged') ||
      this.files.length !== this.gist.files.length ||
      this.description !== this.gist.description;
  }

  loadGist(gist) {
    this.gist = gist;
    this.files = _.map(this.gist.files, f => ({
      filename: f.filename,
      content: f.content,
      isRendered: false,
      isChanged: false
    }));
    this.description = gist.description;

    // set mutation to 0 or -1 to indicate
    // newly loaded gist.
    this.mutation = this.mutation === 0 ? -1 : 0;
  }

  importData(data) {
    if (data) {
      this.description = data.description;
      this.files = _.map(data.files, f => ({
        filename: f.filename,
        content: f.content,
        isRendered: false,
        isChanged: f.isChanged
      }));
      this.gist = data.gist;
      this._mutate();
    }
  }

  updateFile(filename, content) {
    const f = _.find(this.files, {filename});
    const oldF = this.gist && _.find(this.gist.files, {filename});

    if (!f) {
      this.ea.publish('error', 'Cannot update ' + filename + ' because it does not exist.');
      return;
    }

    if (f.content === content) return;
    f.content = content;
    f.isRendered = false;
    f.isChanged = !oldF || oldF.content !== content;
    this._mutate();
  }

  updatePath(filePath, newFilePath) {
    if (filePath === newFilePath) return;
    let isUpdated = false;

    _.each(this.files, file => {
      const oldFilename = file.filename;
      let newFilename;

      if (file.filename === filePath) {
        newFilename = newFilePath;

      } else if (file.filename.startsWith(filePath + '/')) {
        newFilename = newFilePath + '/' + file.filename.slice(filePath.length + 1);
        file.isRendered = false;
        const oldF = this.gist && _.find(this.gist.files, {filename: newFilePath});
        file.isChanged = !oldF || oldF.content !== file.content;

        this.ea.publish('renamed-file', {
          newFilename: newFilePath,
          oldFilename
        });
      }

      if (newFilename) {
        const existingF = _.find(this.files, {filename: newFilename});
        if (existingF) {
          // ignore
          this.ea.publish('error', `Cannot rename ${oldFilename} to ${newFilename} because there is an existing file.`);
          return;
        }

        isUpdated = true;
        file.isRendered = false;
        const oldF = this.gist && _.find(this.gist.files, {filename: newFilename});
        file.isChanged = !oldF || oldF.content !== file.content;
        file.filename = newFilename;

        this.ea.publish('renamed-file', {
          newFilename,
          oldFilename
        });
      }
    });

    if (isUpdated) {
      this._mutate();
    }
  }

  createFile(filename, content = '', skipOpen = false) {
    const existingF = _.find(this.files, {filename});
    if (existingF) {
      // ignore
      this.ea.publish('error', 'Cannot create ' + filename + ' because there is an existing file.');
      return;
    }

    const existingFolder = _.find(this.files, f => f.filename.startsWith(filename + '/'));
    if (existingFolder) {
      // ignore
      this.ea.publish('error', 'Cannot create ' + filename + ' because there is an existing folder.');
      return;
    }

    const file = {
      filename: filename,
      content,
      isRendered: false,
      isChanged: true
    };

    this.files.push(file);
    if (!skipOpen) this.ea.publish('open-file', filename);
    this._mutate();
  }

  deleteFile(filename) {
    const idx = _.findIndex(this.files, {filename});
    if (idx !== -1) {
      this.files.splice(idx, 1);
      this._mutate();
    } else {
      this.ea.publish('error', 'Cannot delete ' + filename + ' because the file does not exist.');
    }
  }

  deleteFolder(filePath) {
    let idx;
    let isUpdated = false;
    while ((idx = _.findLastIndex(this.files, f => f.filename.startsWith(filePath + '/'))) !== -1) {
      isUpdated = true;
      this.files.splice(idx, 1);
    }

    if (isUpdated) {
      this._mutate();
    } else {
      this.ea.publish('error', 'Cannot delete folder ' + filePath + ' because it does not exist.');
    }
  }

  async render() {
    const start = (new Date()).getTime();
    // This flag is only for app didn't provide package.json
    // which contains aurelia-bootstrapper.
    const isAurelia1 = _.some(this.files, f => {
      const m = f.content.match(/\bconfigure\s*\(\s*(\w)+\s*\)/);
      if (!m) return false;
      const auVar = m[1];

      return _.includes(f.content, `${auVar}.start`) &&
        _.includes(f.content, `${auVar}.setRoot`);
    });

    // Get dependencies from package.json
    let deps = {};
    _.each(this.files, f => {
      if (f.filename !== 'package.json') return;
      const json = JSON.parse(f.content);
      deps = json.dependencies;
      return false; // exit early
    });

    const allFiles = _(this.files)
        .map(f => ({
          filename: f.filename,
          content: f.content
        }))
        .value()

    const touchedFiles = _(this.files)
        .reject('isRendered')
        .map(f => ({
          filename: f.filename,
          content: f.content
        }))
        .value()

    // Note all files are "copied" synchronously before sending
    // any async actions to service worker.
    // So that user can continue updating app code, future render()
    // will capture new changes.

    const result = await this.ws.perform({
      type: 'init',
      config: {isAurelia1, deps}
    });

    const renderFiles = result.isNew ? allFiles : touchedFiles;
    await this.ws.perform({
      type: 'update',
      files: renderFiles
    });

    await this.ws.perform({type: 'build'});

    renderFiles.forEach(f => {
      const unchangedFile = _.find(this.files, {filename: f.filename, content: f.content});
      if (unchangedFile) {
        // Only set isRendered for unchanged file
        unchangedFile.isRendered = true;
      }
    });
    this._mutate();

    const seconds = ((new Date()).getTime() - start) / 1000;
    console.log(`Rendering finished in ${seconds} secs.`);
  }
}
