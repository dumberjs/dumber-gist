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
import "codemirror/mode/markdown/markdown";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/vue/vue";
import "codemirror/mode/jsx/jsx";

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
  @bindable lineWrapping = false;
  mode = '';

  constructor(ea) {
    this.ea = ea;
    this.onChange = this.onChange.bind(this);
    this.closeEditor = this.closeEditor.bind(this);
    this.newFile = this.newFile.bind(this);
    this.bundle = this.bundle.bind(this);
    this.openAny = this.openAny.bind(this);
  }

  closeEditor() {
    if (this.file) {
      this.ea.publish('close-file', this.file.filename);
    }
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
    this.ea.publish('bundle');
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
        readOnly: this.readOnly,
        lineWrapping: this.lineWrapping,
        highlightSelectionMatches: {showToken: /\w|-|_|\./},
        gutters: ["CodeMirror-lint-markers"],
        lint: true,
        extraKeys: {
          // When codemirror has the focus, it consumes almost
          // all keybord events.
          // So we need to bind those shortcuts in editor too.
          'Ctrl-W': this.closeEditor,
          'Ctrl-N': this.newFile,
          'Ctrl-S': this.bundle,
          'Ctrl-P': this.openAny,
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
