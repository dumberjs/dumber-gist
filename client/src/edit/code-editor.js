import {inject, bindable} from 'aurelia-framework';
import path from 'path';
import {EventAggregator} from 'aurelia-event-aggregator';
import CodeMirror from 'codemirror';
// import "codemirror/addon/selection/active-line";
import "codemirror/addon/dialog/dialog";
import "codemirror/addon/search/search";
import "codemirror/addon/search/searchcursor";
import "codemirror/addon/scroll/annotatescrollbar";
import "codemirror/addon/search/matchesonscrollbar";
import "codemirror/addon/search/match-highlighter";
import "codemirror/addon/lint/lint";
// import "codemirror/addon/lint/javascript-lint";
import "codemirror/addon/lint/html-lint";
// import "codemirror/addon/lint/css-lint";
import "codemirror/addon/lint/json-lint";
import "codemirror/mode/markdown/markdown";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/vue/vue";
import "codemirror/mode/jsx/jsx";
import "codemirror/keymap/vim";

const MODES = {
  '.js': 'jsx',
  '.ts': 'text/typescript-jsx',
  '.json': 'application/json',

  '.jsx': 'jsx',
  '.tsx': 'text/typescript-jsx',

  '.css': 'text/css',
  '.scss': 'text/x-scss',
  '.less': 'text/x-less',

  '.vue': 'vue',
  '.md': 'markdown',
  '.html': 'text/html',
  '.xml': 'xml',
  '.svg': 'xml',

  '.svelte': 'text/html'
};

@inject(EventAggregator)
export class CodeEditor {
  @bindable file;
  @bindable readOnly = false;
  @bindable vimMode = false;
  @bindable lineWrapping = false;
  mode = '';

  constructor(ea) {
    this.ea = ea;
    this.onChange = this.onChange.bind(this);
  }

  fileChanged(file) {
    const {cm} = this;
    if (!cm) return;
    if (!file) return;

    this.updateContent();
    this.updateMode();
    // cleanup codemirror session to avoid unwanted undo stack.
    cm.clearHistory();
    cm.focus();
  }

  updateContent() {
    const {cm} = this;
    if (!cm) return;

    const value = this.file.content || '';

    if (value !== cm.getValue()) {
      this._internalUpdate = true;
      cm.setValue(value);
      this._internalUpdate = false;
    }
  }

  // scrollToBottom() {
  //   const {cm} = this;
  //   if (!cm) return;
  //   cm.scrollIntoView({line: cm.lastLine(), ch: 0});
  // }

  onChange() {
    if (this._internalUpdate) return;
    const {cm, file} = this;
    if (!cm || !file) return;

    const value = cm.getValue();

    this.ea.publish('update-file', {filename: file.filename, content: value})
  }

  updateMode() {
    const {cm} = this;
    if (!cm) return;

    const newMode = MODES[path.extname(this.file.filename)] || '';

    if (newMode !== this.mode) {
      this.mode = newMode;
      cm.setOption('mode', newMode);
    }
  }

  vimModeChanged(vimMode) {
    const {cm} = this;
    if (!cm) return;

    const keyMap = cm.getOption('keyMap');
    const newKeyMap = vimMode ? 'vim' : 'default';
    if (keyMap !== newKeyMap) {
      cm.setOption('keyMap', newKeyMap);
    }
  }

  lineWrappingChanged(lineWrapping) {
    const {cm} = this;
    if (!cm) return;

    const existingLineWrapping = cm.getOption('lineWrapping');
    if (lineWrapping !== existingLineWrapping) {
      cm.setOption('lineWrapping', lineWrapping);
    }
  }

  attached() {
    this.mode = MODES[path.extname(this.file.filename)] || '';
    // Delay to fix small screen layout issue.
    this._toCreate = setTimeout(() => {
      this.cm = CodeMirror(this.editor, {
        value: this.file.content,
        mode: this.mode,
        theme: 'gist-editor',
        autofocus: true,
        dragDrop: false, // avoid competing with app.js file drop
        lineNumbers: true,
        tabSize: 2,
        indentWithTabs: false,
        inputStyle: 'contenteditable',
        readOnly: this.readOnly,
        lineWrapping: this.lineWrapping,
        keyMap: this.vimMode ? 'vim' : 'default',
        highlightSelectionMatches: {showToken: /\w|-|_|\./},
        gutters: ["CodeMirror-lint-markers"],
        lint: true,
        //
        // Cannot use codemirror built-in js-lint now.
        // it uses jshint but jshint does not support all
        // latest ES syntax.
        // {
        //   // jshint
        //   esversion: 10,
        //   undef: true,
        //   unused: true
        // },
        //
        // There are few linters missing (but possible):
        // eslint in browser https://github.com/angelozerr/codemirror-lint-eslint/blob/master/eslint-lint.js
        // sass-lint in browser https://stackoverflow.com/questions/43127937/scss-linter-for-codemirror
        // less-lint in browser
        //
        // The other option is to rely on bundler worker's transpilers
        // to emit errors, then translate those errors into
        // codemirror lint data structure to show in the editor.
        // But this assumes all transpilers emit error with enough
        // information on location (col, row).
        //
        extraKeys: {
          'Tab': cm => {
            // https://codemirror.net/doc/manual.html
            // Map Tab to spaces
            var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
            cm.replaceSelection(spaces);
          }
        }
      });

      this.cm.on('change', this.onChange);
      this._toCreate = null;
    }, 50);
  }

  detached() {
    if (this._toCreate) {
      clearTimeout(this._toCreate);
      this._toCreate = null;
    }

    if (!this.cm) return;
    this.cm.off(this.onChange);
    delete this.cm;

    // aurelia keeps view in cache (returnToCache).
    // this makes sure to clean up codemirror instance.
    const cmDom = this.editor.querySelector('.CodeMirror');
    if (cmDom) {
      cmDom.remove();
    }
  }
}
