import path from 'path';
import {transform} from '@babel/core';
import transformCjs from '@babel/plugin-transform-modules-commonjs';
import syntaxDynamicImport from '@babel/plugin-syntax-dynamic-import';
import objectRestSpread from '@babel/plugin-proposal-object-rest-spread';
import classProperties from '@babel/plugin-proposal-class-properties';
import decorators from '@babel/plugin-proposal-decorators';
import exportDefaultFrom from '@babel/plugin-proposal-export-default-from';
import exportNamespaceFrom from '@babel/plugin-proposal-export-namespace-from';
import nullishCoalescingOperator from '@babel/plugin-proposal-nullish-coalescing-operator';
import optionalChaining from '@babel/plugin-proposal-optional-chaining';
import privateMethods from '@babel/plugin-proposal-private-methods';

// TypeScript
import constEnum from 'babel-plugin-const-enum';
import presetTypescript from '@babel/preset-typescript';

// JSX
import syntaxJsx from '@babel/plugin-syntax-jsx';
import transformJsx from '@babel/plugin-transform-react-jsx';
import reactDisplayName from '@babel/plugin-transform-react-display-name';
import inferno from 'babel-plugin-inferno';

const EXTS = ['.js', '.ts', '.jsx', '.tsx'];

const PLUGINS = [
  [decorators, {legacy: true}],
  [classProperties, {loose: true}],
  syntaxDynamicImport,
  exportDefaultFrom,
  exportNamespaceFrom,
  [nullishCoalescingOperator, {loose: true}],
  [optionalChaining, {loose: true}],
  [privateMethods, {loose: true}],
  [objectRestSpread, {loose: true}],
  [transformCjs, {loose: true}],
];

export class JsTranspiler {
  match(file) {
    const ext = path.extname(file.filename);
    return EXTS.indexOf(ext) !== -1;
  }

  async transpile(file, files, opts = {}) {
    const {filename, content} = file;
    if (!this.match(file)) throw new Error('Cannot use JsTranspiler for file: ' + filename);

    const ext = path.extname(filename);
    const plugins = [...PLUGINS];
    const presets = [];

    const jsxPragma = opts.jsxPragma || 'React.createElement';
    const jsxFrag = opts.jsxFrag || 'React.Fragment';

    if (ext === '.ts' || ext === '.tsx') {
      plugins.push(constEnum);
      presets.push([presetTypescript, {
        isTSX: true,
        jsxPragma: jsxPragma.split('.')[0],
        allExtensions: true
      }]);
    }

    if (jsxPragma.startsWith('Inferno')) {
      plugins.unshift([inferno, {imports: true}]);
    } else {
      plugins.unshift(reactDisplayName);
      plugins.unshift([transformJsx, {
        pragma: jsxPragma,
        pragmaFrag: jsxFrag,
        useBuiltIns: true
      }]);
      plugins.unshift(syntaxJsx);
    }

    const result = transform(content, {
      babelrc: false,
      configFile: false,
      sourceMaps: true,
      sourceFileName: filename,
      plugins,
      presets
    });

    const {code, map} = result;

    const newFilename = filename.slice(0, -ext.length) + '.js';
    map.file = newFilename;
    map.sources = [filename];
    map.sourceRoot = '';

    return {
      filename: newFilename,
      content: code,
      sourceMap: map
    };
  }
}
