import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import isUtf8 from 'is-utf8';
import _ from 'lodash';

@inject(EventAggregator)
export class FileDropIndicator {
  duringFileDrop = false;

  constructor(ea) {
    this.ea = ea;
  }

  attached() {
    // no need to clean up in detached() because
    // it's not going to be detached.
    this._setupFileDrop();
  }

  _setupFileDrop() {
    let toFinish;
    const cancelFinish = () => {
      if (toFinish) {
        clearTimeout(toFinish);
        toFinish = null;
      }
    };

    const finish = () => {
      cancelFinish();
      toFinish = setTimeout(() => this.duringFileDrop = false, 50);
    };

    const scanFiles = item => {
      if (item.isDirectory) {
        const reader = item.createReader();
        reader.readEntries(entries => {
          entries.forEach(entry => {
            scanFiles(entry);
          })
        });
      } else if (item.isFile) {
        item.file(file => {
          const filename = _.trim(item.fullPath, '/');
          const reader = new FileReader();
          reader.onload = e => {
            const content = e.target.result;
            if (isUtf8(Buffer.from(content))) {
              // Create but not open it in editor
              this.ea.publish('import-file', {filename, content});
            } else {
              this.ea.publish('error', `Cannot import binary file "${filename}" because gist only supports text file.`);
            }
          };
          reader.onerror = err => {
            this.ea.publish('error', `Failed to import "${filename}" : ${err.message}`);
          };
          reader.readAsText(file);
        });
      }
    };

    document.addEventListener('dragenter', e => {
      e.stopPropagation();
      e.preventDefault();
      cancelFinish();
      this.duringFileDrop = true;
    });

    document.addEventListener('dragover', e => {
      e.stopPropagation();
      e.preventDefault();
      finish();
    });

    document.addEventListener('drop', e => {
      e.stopPropagation();
      e.preventDefault();
      finish();
      const {items} = e.dataTransfer;
      for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry();
        scanFiles(item);
      }
    });
  }
}
