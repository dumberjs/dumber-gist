import {ext, parse, resolveModuleId} from 'dumber-module-loader/dist/id-utils';
import _ from 'lodash';
import {inject} from 'aurelia-dependency-injection';
import {CachePrimitives} from '../cache-primitives';

const EXTS = ['.scss', '.sass'];

function cleanSource(s) {
  if (s.startsWith('../sass/')) {
    return s.slice(8);
  }
  if (s.startsWith('../')) {
    return s.slice(3);
  }
  return s;
}

export function possiblePaths(filePath) {
  const parsed = parse(filePath);
  const [packagePath, ...others] = parsed.parts;
  if (others.length === 0) return [];

  const base = others.pop();
  const dir = _(others).map(o => o + '/').join('');

  if (EXTS.indexOf(parsed.ext) !== -1 || parsed.ext === '.css') {
    return {
      packagePath,
      filePaths: [
          dir + base,
        dir + base + '/_index.scss',
        dir + base + '/_index.sass'
      ]
    };
  }

  return {
      packagePath,
      filePaths: [
        dir + base + '.scss',
        dir + base + '.sass',
        dir + base + '.css',
        dir + '_' + base + '.scss',
        dir + '_' + base + '.sass',
        dir + base + '/_index.scss',
        dir + base + '/_index.sass'
      ]
    };
}

@inject(CachePrimitives)
export class SassTranspiler {
  constructor(primitives) {
    this.primitives = primitives;
  }

  match(file) {
    const e = ext(file.filename);
    return EXTS.indexOf(e) !== -1;
  }

  async fetchRemoteFile(path) {
    const possible = possiblePaths(path)

    const packageJson = JSON.parse(
      (await this.primitives.getJsdelivrFile(possible.packagePath, 'package.json')).contents
    );

    const packagePathWithVersion = possible.packagePath + '@' + packageJson.version;

    for (const filePath of possible.filePaths) {
      if (await this.primitives.doesJsdelivrFileExist(packagePathWithVersion, filePath)) {
        return this.primitives.getJsdelivrFile(packagePathWithVersion, filePath);
      }
    }
    throw new Error('No remote file found for ' + path);
  }

  _lazyLoad() {
    if (!this._promise) {
      // The offical dart-sass doesn't have browser support
      // https://github.com/sass/dart-sass/issues/25
      // So I have to use sass.js (emscripted libsass) as it
      // provided a fake fs layer.
      this._promise = import('sass.js/dist/sass.sync').then(Sass => {
        // Add custom importer to handle import from npm packages.
        Sass.importer((request, done) => {
          if (
            request.path ||
            request.current.startsWith('.') ||
            request.current.match(/^https?:\/\//)
          ) {
            // Sass.js already found a file,
            // or it's definitely not a remote file,
            // or it's a full url,
            // let Sass.js to do its job.
            done();
          } else {
            let remotePath = request.current;
            if (request.previous.startsWith('/node_modules/')) {
              remotePath = resolveModuleId(request.previous.slice(14), './' + request.current);
            }

            this.fetchRemoteFile(remotePath).then(
              ({path, contents}) => {
                done({
                  path: '/node_modules/' + path.slice(23),
                  content: contents
                });
              },
              err => {
                done({error: err.message});
              }
            );
          }
        });

        return Sass;
      });
    }

    return this._promise;
  }

  async transpile(file, files) {
    const {filename} = file;
    if (!this.match(file)) throw new Error('Cannot use SassTranspiler for file: ' + filename);

    const parsed = parse(filename);
    if (_.last(parsed.parts).startsWith('_')) {
      // ignore sass partial
      return;
    }

    const Sass = await this._lazyLoad();

    const cssFiles = {};
    _.each(files, f => {
      const e = ext(f.filename);
      if (EXTS.indexOf(e) !== -1 || e === '.css') {
        cssFiles[f.filename] = f.content;
      }
    });

    const newFilename = filename.slice(0, -parsed.ext.length) + '.css';
    if (file.content.match(/^\s*$/)) {
      return {filename: newFilename, content: ''};
    }

    return new Promise((resolve, reject) => {
      Sass.writeFile(cssFiles, () => {
        Sass.compile(
          file.content,
          {
            indentedSyntax: parsed.ext === '.sass',
            sourceMapRoot: '/',
            inputPath: '/sass/' + filename
          },
          result => {
            Sass.removeFile(Object.keys(cssFiles), () => {
              if (result.status === 0) {
                const {text, map} = result;
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
