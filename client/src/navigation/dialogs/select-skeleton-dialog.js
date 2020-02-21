import {DialogController} from 'aurelia-dialog';
import {inject} from 'aurelia-framework';
import {combo} from 'aurelia-combo';
import _ from 'lodash';

@inject(DialogController)
export class SelectSkeletonDialog {
  framework = 'none';
  transpiler = 'esnext';

  frameworks = [
    {
      value: 'none',
      label: 'None',
      icon: 'fas fa-puzzle-piece',
      description: 'Just a bare app'
    },
    {
      value: 'aurelia',
      label: 'Aurelia',
      image: 'https://aurelia.io/styles/images/aurelia-icon.svg'
    },
    {
      value: 'aurelia2',
      label: 'Aurelia 2 (pre-alpha)',
      image: 'https://aurelia.io/styles/images/aurelia-icon.svg',
      description: 'Not for production yet.'
    },
    {
      value: 'inferno',
      label: 'Inferno',
      image: 'https://avatars2.githubusercontent.com/u/14214240?s=200&v=4'
    },
    {
      value: 'preact',
      label: 'Preact',
      image: 'https://github.githubassets.com/images/icons/emoji/unicode/269b.png',
      description: 'css-modules is not turned on.'
    },
    {
      value: 'react',
      label: 'React',
      image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K'
    },
    {
      value: 'svelte',
      label: 'Svelte',
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 139 139' class='svelte-c8tyih'%3E%3Cpath fill='red' d='M110 28a34 34 0 0 0-46-9L38 35a30 30 0 0 0-13 20 32 32 0 0 0 3 20 30 30 0 0 0-5 12 32 32 0 0 0 6 24c10 15 31 19 46 10l26-17a30 30 0 0 0 13-20 32 32 0 0 0-3-20 30 30 0 0 0 5-11 32 32 0 0 0-6-25'%3E%3C/path%3E%3Cpath fill='%23fff' d='M62 112a21 21 0 0 1-22-8 19 19 0 0 1-4-15 17 17 0 0 1 1-2v-1l2 1a34 34 0 0 0 10 5h1v1a6 6 0 0 0 1 4 6 6 0 0 0 7 2 6 6 0 0 0 1-1l26-16a5 5 0 0 0 3-4 6 6 0 0 0-1-4 6 6 0 0 0-7-3 6 6 0 0 0-2 1l-10 6a19 19 0 0 1-5 3 21 21 0 0 1-22-8 19 19 0 0 1-3-15 18 18 0 0 1 8-12l26-17a19 19 0 0 1 5-2 21 21 0 0 1 22 8 19 19 0 0 1 4 15 20 20 0 0 1-1 2v2l-2-1a34 34 0 0 0-10-5l-1-1v-1a6 6 0 0 0-1-4 6 6 0 0 0-7-2 6 6 0 0 0-1 1L54 57a5 5 0 0 0-3 4 6 6 0 0 0 1 4 6 6 0 0 0 7 3 6 6 0 0 0 2-1l10-6a19 19 0 0 1 5-3 21 21 0 0 1 22 9 19 19 0 0 1 3 14 18 18 0 0 1-8 12l-26 17a19 19 0 0 1-5 2'%3E%3C/path%3E%3C/svg%3E"
    },
    {
      value: 'vue',
      label: 'Vue 2',
      description: 'SFC (.vue file) is not supported.',
      image: 'https://vuejs.org/images/logo.png'
    }
  ];

  transpilers = [
    {
      value: 'esnext',
      label: 'ESNext (.js/.jsx)',
      icon: 'fab fa-js-square',
      description: 'Uses legacy decorator syntax'
    },
    {
      value: 'typescript',
      label: 'TypeScript (.ts/.tsx)',
      icon: 'fab fa-js-square',
      description: 'Uses legacy decorator syntax, esModuleInterop is turned on'
    }
  ];

  constructor(controller) {
    this.controller = controller;
  }

  @combo('enter')
  ok() {
    this.controller.ok({
      framework: this.framework,
      transpiler: this.transpiler
    });
  }

  @combo('up')
  selectPreviousFramework() {
    let idx = _.findIndex(this.frameworks, {value: this.framework});
    idx -= 1;
    if (idx < 0) {
      idx = this.frameworks.length - 1;
    }
    this.framework = this.frameworks[idx].value;
    this.scrollIfNeeded();
  }

  @combo('down')
  selectNextFramework() {
    let idx = _.findIndex(this.frameworks, {value: this.framework});
    idx += 1;
    if (idx >= this.frameworks.length) {
      idx = 0;
    }
    this.framework = this.frameworks[idx].value;
    this.scrollIfNeeded();
  }

  scrollIfNeeded() {
    setTimeout(() => {
      const selected = this.list.querySelector('.selection.selected');
      if (selected) {
        if (selected.scrollIntoViewIfNeeded) {
          selected.scrollIntoViewIfNeeded();
        } else if (selected.scrollIntoView) {
          selected.scrollIntoView();
        }
      }
    });
  }
}
