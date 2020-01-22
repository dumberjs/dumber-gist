import {DialogController} from 'aurelia-dialog';
import {inject} from 'aurelia-framework';
import {combo} from 'aurelia-combo';

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
      value: 'react',
      label: 'React',
      image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K'
    },
    {
      value: 'vue',
      label: 'Vue 2',
      description: 'SFC (.vue file) is not yet supported.',
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
}
