/* globals Sass */
import path from 'path';
import _ from 'lodash';

const EXTS = ['.scss', '.sass'];

function cleanSource(s) {
  const idx = s.indexOf('/sass/');
  if (idx === -1) return s;
  return s.slice(idx + 6);
}

export class SassTranspiler {
  match(file) {
    const ext = path.extname(file.filename);
    return EXTS.indexOf(ext) !== -1;
  }

  async transpile(file, files) {
    const {filename} = file;
    if (!this.match(file)) throw new Error('Cannot use SassTranspiler for file: ' + filename);
    if (path.basename(filename).startsWith('_')) {
      // ignore sass partial
      return;
    }

    const ext = path.extname(filename);

    const cssFiles = {};
    _.each(files, f => {
      const ext = path.extname(f.filename);
      if (EXTS.indexOf(ext) !== -1 || ext === '.css') {
        cssFiles[f.filename] = f.content;
      }
    });

    return new Promise((resolve, reject) => {
      Sass.writeFile(cssFiles, () => {
        Sass.compileFile(
          filename,
          result => {
            Sass.removeFile(Object.keys(cssFiles), () => {
              if (result.status === 0) {
                const {text, map} = result;
                const newFilename = filename.slice(0, -ext.length) + '.css';
                map.file = newFilename;
                map.sources = _.map(map.sources, cleanSource);
                map.sourceRoot = '';
                resolve({
                  filename: newFilename,
                  content: text,
                  sourceMap: map
                });
              } else {
                reject(new Error(result.formatted));
              }
            });
          }
        );

      });
    });
  }
}
