import * as ts from 'typescript';
import path from 'path';
import {stripSourceMappingUrl} from 'dumber/lib/shared';

const EXTS = ['.js', '.ts', '.jsx', '.tsx'];

export class JsTranspiler {
  match(file) {
    const ext = path.extname(file.filename);
    return EXTS.indexOf(ext) !== -1;
  }

  transpile(file) {
    const {filename, content} = file;
    if (!this.match(file)) throw new Error('Cannot use JsTranspiler for file: ' + filename);

    const ext = path.extname(filename);

    const result = ts.transpileModule(content, {
      compilerOptions: {
        allowJs: true,
        checkJs: false,
        experimentalDecorators: true,
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
    const newContent = stripSourceMappingUrl(outputText);
    const sourceMap = JSON.parse(sourceMapText);
    sourceMap.file = newFilename;
    sourceMap.sources = [filename];

    return {
      filename: newFilename,
      content: newContent,
      sourceMap
    };
  }
}
