import path from 'path';
import _ from 'lodash';

import {stripSourceMappingUrl} from 'dumber/lib/shared';

export class AuTsTranspiler {
  match(file, files) {
    const ext = path.extname(file.filename);
    if (ext !== '.ts') return false;

    const packageJson = _.find(files, {filename: 'package.json'});
    if (packageJson) {
      try {
        const meta = JSON.parse(packageJson.content);
        return _.has(meta, ['dependencies', 'aurelia-bootstrapper']);
      } catch (e) {
        // ignore
      }
    }
    return false;
  }

  _lazyLoad() {
    if (!this._promise) {
      this._promise = import('typescript');
    }

    return this._promise;
  }

  async transpile(file, files) {
    const {filename, content} = file;
    if (!this.match(file, files)) throw new Error('Cannot use JsTranspiler for file: ' + filename);

    const ts = await this._lazyLoad();

    const ext = path.extname(filename);

    const result = ts.transpileModule(content, {
      compilerOptions: {
        allowJs: true,
        checkJs: false,
        experimentalDecorators: true,
        // Required for au1 to work
        emitDecoratorMetadata: true,
        inlineSources: true,
        jsx: ext.endsWith('x') ? ts.JsxEmit.React : ts.JsxEmit.None,
        // Don't compile to ModuleKind.AMD because
        // dumber can stub some commonjs globals.
        // The stubbing only applies to commonjs or ESM code.
        // Use ESNext so that dumber can normalise import (by babel),
        // so that we don't need esModuleInterop in tsc.
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2017,
        sourceMap: true
      },
      fileName: filename
    });

    const {outputText, sourceMapText} = result;
    const newFilename = filename.slice(0, -ext.length) + '.js';
    let newContent = stripSourceMappingUrl(outputText);
    if (!newContent) {
      // For ts type definition file, make a empty es module
      newContent = 'exports.__esModule = true;\n';
    }

    const sourceMap = JSON.parse(sourceMapText);
    sourceMap.file = newFilename;
    sourceMap.sources = [filename];
    sourceMap.sourceRoot = '';

    return {
      filename: newFilename,
      content: newContent,
      sourceMap
    };
  }
}
