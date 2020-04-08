import {inject, bindable} from 'aurelia-framework';
import path from 'path';
import {EventAggregator} from 'aurelia-event-aggregator';
import * as monaco from 'monaco-editor';

const MODES = {
  '.js': 'javascript',
  '.ts': 'typescript',
  '.json': 'json',

  '.jsx': 'javascript',
  '.tsx': 'typescript',

  '.css': 'css',
  '.scss': 'css',
  '.less': 'css',

  '.vue': 'html',
  '.md': 'markdown',
  '.html': 'html',
  '.xml': 'xml',
  '.svg': 'xml',

  '.svelte': 'html'
};

@inject(EventAggregator)
export class CodeEditor {
  @bindable file;
  @bindable wordWrap = false;

  constructor(ea) {
    this.ea = ea;
    this.onChange = this.onChange.bind(this);
    this.closeEditor = this.closeEditor.bind(this);
    this.newFile = this.newFile.bind(this);
    this.bundle = this.bundle.bind(this);
    this.openAny = this.openAny.bind(this);
  }

  closeEditor() {
    this.ea.publish('close-active-file');
  }

  newFile() {
    if (this.file) {
      let inDir = path.dirname(this.file.filename);
      if (inDir === '.') inDir = '';
      this.ea.publish('create-file', inDir);
    }
  }

  openAny() {
    this.ea.publish('open-any');
  }

  bundle() {
    this.ea.publish('bundle-or-reload');
  }

  fileChanged(file) {
    if (!file) {
      this._removeMonaco();
      return;
    }

    if (!this.mo) {
      this._createMonaco();
    } else {
      const value = file.content || '';
      if (value !== this.mo.getValue()) {
        this._removeMonaco();
        this._createMonaco();
      }
    }
  }

  onChange() {
    const {mo, file} = this;
    if (!mo || !file) return;
    const value = mo.getValue();
    this.ea.publish('update-file', {filename: file.filename, content: value})
  }

  attached() {
    this._isAttached = true;

    // // Delay to fix small screen layout issue.
    // this._toCreate = setTimeout(() => {
    //   this.mo = CodeMirror(this.editor, {
    //     value: this.file.content,
    //     mode: this.mode,
    //     theme: 'gist-editor',
    //     autofocus: true,
    //     dragDrop: false, // avoid competing with app.js file drop
    //     lineNumbers: true,
    //     tabSize: 2,
    //     indentWithTabs: false,
    //     readOnly: this.readOnly,
    //     lineWrapping: this.lineWrapping,
    //     highlightSelectionMatches: {showToken: /\w|-|_|\./},
    //     gutters: ["CodeMirror-lint-markers"],
    //     lint: true,
    //     //
    //     // Cannot use codemirror built-in js-lint now.
    //     // it uses jshint but jshint does not support all
    //     // latest ES syntax.
    //     // {
    //     //   // jshint
    //     //   esversion: 10,
    //     //   undef: true,
    //     //   unused: true
    //     // },
    //     //
    //     // There are few linters missing (but possible):
    //     // eslint in browser https://github.com/angelozerr/codemirror-lint-eslint/blob/master/eslint-lint.js
    //     // sass-lint in browser https://stackoverflow.com/questions/43127937/scss-linter-for-codemirror
    //     // less-lint in browser
    //     //
    //     // The other option is to rely on bundler worker's transpilers
    //     // to emit errors, then translate those errors into
    //     // codemirror lint data structure to show in the editor.
    //     // But this assumes all transpilers emit error with enough
    //     // information on location (col, row).
    //     //
    //     extraKeys: {
    //       // When codemirror has the focus, it consumes almost
    //       // all keybord events.
    //       // So we need to bind those shortcuts in editor too.
    //       'Alt-W': this.closeEditor,
    //       'Alt-N': this.newFile,
    //       'Alt-R': this.bundle,
    //       'Ctrl-P': this.openAny,
    //       'Alt-P': this.openAny,
    //       'Cmd-P': this.openAny,
    //       'Tab': cm => {
    //         // https://codemirror.net/doc/manual.html
    //         // Map Tab to spaces
    //         var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
    //         cm.replaceSelection(spaces);
    //       }
    //     }
    //   });

    //   this.cm.on('change', this.onChange);
    //   this._toCreate = null;
    // }, 50);
  }

  _createMonaco() {
    if (!this._isAttached) return;
    const language = MODES[path.extname(this.file.filename)] || '';

    this.mo = monaco.editor.create(this.editor, {
      value: this.file.content || '',
      tabSize: 2,
      theme: 'vs-dark',
      wordWrap: this.wordWrap,
      minimap: { enabled: false },
      language
    });
  }

  _removeMonaco() {
    if (!this.mo) return;
    this.mo.dispose();
    delete this.mo;
  }

  detached() {
    this._isAttached = false;
    this._removeMonaco();

    // if (this._toCreate) {
    //   clearTimeout(this._toCreate);
    //   this._toCreate = null;
    // }

    // if (!this.cm) return;
    // this.cm.off(this.onChange);
    // delete this.cm;

    // // aurelia keeps view in cache (returnToCache).
    // // this makes sure to clean up codemirror instance.
    // const cmDom = this.editor.querySelector('.CodeMirror');
    // if (cmDom) {
    //   cmDom.remove();
    // }
  }
}
