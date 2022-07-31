import path from 'path';
import transformInferno from 'ts-transform-inferno';
import * as ts from 'typescript';
import {stripSourceMappingUrl} from 'dumber/lib/shared.js';
const EXTS = ['.js', '.ts', '.jsx', '.tsx'];

export class JsTranspiler {
  match(file) {
    const ext = path.extname(file.filename);
    return EXTS.includes(ext);
  }

  async transpile(file, files, opts = {}) {
    if (!this.match(file, files)) throw new Error('Cannot use JsTranspiler for file: ' + filename);

    const {filename, content} = file;
    const ext = path.extname(filename);

    const jsxPragma = opts.jsxPragma || 'React.createElement';
    const jsxFrag = opts.jsxFrag || 'React.Fragment';

    const options = {
      fileName: filename,
      compilerOptions: {
        allowJs: true,
        checkJs: false,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        inlineSources: true,
        // Don't compile to ModuleKind.AMD because
        // dumber can stub some commonjs globals.
        // The stubbing only applies to commonjs or ESM code.
        // Use ESNext so that dumber can normalise import (by babel),
        // so that we don't need esModuleInterop in tsc.
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2020,
        sourceMap: true
      }
    };

    if (jsxPragma.startsWith('Inferno')) {
      // We didn't use jsxPragma and jsxFrag for Inferno.
      // ts-transform-inferno does all the work.
      options.transformers = {
        before: [transformInferno()]
      }
    } else {
      options.compilerOptions.jsx = ts.JsxEmit.React;
      options.compilerOptions.jsxFactory = jsxPragma;
      options.compilerOptions.jsxFragmentFactory = jsxFrag;
    }

    const result = ts.transpileModule(content, options);

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
