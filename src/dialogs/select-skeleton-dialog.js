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
      label: 'None, just a bare app'
    },
    {
      value: 'aurelia',
      label: 'Aurelia',
      icon: 'https://aurelia.io/styles/images/aurelia-icon.svg'
    },
    {
      value: 'aurelia2',
      label: 'Aurelia 2 (pre-alpha)',
      icon: 'https://aurelia.io/styles/images/aurelia-icon.svg'
    },
    {
      value: 'inferno',
      label: 'Inferno',
      icon: 'https://user-images.githubusercontent.com/2021355/36063342-626d7ea8-0e84-11e8-84e1-f22bb3b8c4d5.png'
    },
    {
      value: 'react',
      label: 'React',
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K'
    },
    {
      value: 'vue',
      label: 'Vue 2',
      icon: 'https://vuejs.org/images/logo.png'
    }
  ];

  transpilers = [
    {
      value: 'esnext',
      label: 'ESNext (.js)'
    },
    {
      value: 'typescript',
      label: 'TypeScript (.ts)'
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
