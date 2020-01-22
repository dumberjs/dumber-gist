import {inject, observable, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import _ from 'lodash';
import {WorkerService} from '../worker-service';
import crypto from 'crypto';

function getFilesHash(files) {
  const str = _(files)
    .map(f => `${f.filename}|${f.content}`)
    .join('\n');

  return crypto.createHash('md5').update(str).digest('hex');
}

@inject(EventAggregator, WorkerService)
export class EditSession {
  _gist = {description: '', files: []};
  _originalHash = '';
  _hash = '';
  _renderedHash = '';
  files = [];
  description = '';

  // mutation value 0 and -1 is reserved
  // for just newly loaded gist.
  @observable mutation = -1;

  constructor(ea, ws) {
    this.ea = ea;
    this.ws = ws;
  }

  get gist() {
    return this._gist;
  }

  set gist(newGist) {
    this._gist = newGist;
    this._originalHash = getFilesHash(newGist.files);
  }

  _mutate() {
    if (this.mutation >= 9999 || this.mutation < 0) {
      this.mutation = 1;
    } else {
      this.mutation += 1;
    }
  }

  mutationChanged() {
    this._hash = getFilesHash(this.files);
  }

  @computedFrom('_hash', '_originalHash')
  get isChanged() {
    return this._hash !== this._originalHash ||
      this.description !== this._gist.description;
  }

  @computedFrom('_hash', '_renderedHash')
  get isRendered() {
    return this._hash === this._renderedHash;
  }

  loadGist(gist) {
    this.gist = gist;
    this.files = _.map(this.gist.files, f => ({
      filename: f.filename,
      content: f.content,
      isChanged: false
    }));
    this.description = gist.description;

    // set mutation to 0 or -1 to indicate
    // newly loaded gist.
    this.mutation = this.mutation === 0 ? -1 : 0;
  }

  importData(data) {
    if (data) {
      if (data.description) {
        this.description = data.description;
      }

      if (data.files) {
        this.files = _.map(data.files, f => ({
          filename: f.filename,
          content: f.content,
          isChanged: !!f.isChanged
        }));
      }

      if (data.gist) {
        this.gist = data.gist;
      }

      this._mutate();
    }
  }

  updateFile(filename, content) {
    const f = _.find(this.files, {filename});
    const oldF = _.find(this.gist.files, {filename});

    if (!f) {
      this.ea.publish('error', 'Cannot update ' + filename + ' because it does not exist.');
      return;
    }

    if (f.content === content) return;
    f.content = content;
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
        const oldF = _.find(this.gist.files, {filename: newFilePath});
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
        const oldF = _.find(this.gist.files, {filename: newFilename});
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

    // Note all files are copied before rendering.
    // So that user can continue updating app code, future render()
    // will capture new changes.

    const files = _.map(this.files, f => ({
      filename: f.filename,
      content: f.content
    }));

    // Get dependencies from package.json
    let deps = {};
    _.each(files, f => {
      if (f.filename !== 'package.json') return;
      const json = JSON.parse(f.content);
      deps = json.dependencies;
      return false; // exit early
    });

    await this.ws.perform({type: 'init', config: {deps}});
    await this.ws.perform({type: 'update', files});
    await this.ws.perform({type: 'build'});
    this._renderedHash = getFilesHash(files);

    const seconds = ((new Date()).getTime() - start) / 1000;
    console.log(`Rendering finished in ${seconds} secs.`);
  }
}
