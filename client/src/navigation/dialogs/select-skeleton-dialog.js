import {DialogController} from 'aurelia-dialog';
import {inject} from 'aurelia-framework';
import {combo} from 'aurelia-combo';
import _ from 'lodash';

@inject(DialogController)
export class SelectSkeletonDialog {
  framework = 'none';
  transpiler = 'esnext';
  testFramework = 'none';

  frameworks = [
    {
      value: 'none',
      label: 'None',
      icon: 'fas fa-puzzle-piece',
      description: 'Just a bare app.'
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
      description: 'Uses legacy decorator syntax.'
    },
    {
      value: 'typescript',
      label: 'TypeScript (.ts/.tsx)',
      icon: 'fab fa-js-square',
      description: 'Uses legacy decorator syntax, esModuleInterop is turned on.'
    }
  ];

  unitTests = [
    {
      value: 'none',
      label: 'None',
      icon: 'far fa-meh',
      description: 'No unit tests'
    },
    {
      value: 'jasmine',
      label: 'jasmine',
      image: 'https://avatars2.githubusercontent.com/u/4624349?s=200&v=4',
      description: 'A behavior-driven development framework for testing JavaScript code.'
    },
    {
      value: 'mocha',
      label: 'Mocha + Chai',
      image: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20192%20191.99999%22%20width%3D%22192%22%20height%3D%22192%22%3E%3Cpath%20d%3D%22M169.47386%20143.90113l-68.70282%2039.69498c-2.958045%201.71756-6.584028%201.71756-9.542066%200L22.52614%20143.90113c-2.958038-1.71757-4.77103-4.86645-4.77103-8.20617V56.305021c0-3.435142%201.812992-6.488601%204.77103-8.206172L91.228974%208.403878c2.958038-1.717571%206.584021-1.717571%209.542056%200l68.70282%2039.694971c2.95804%201.717571%204.77104%204.866451%204.77104%208.206172v79.389939c-.0954%203.33972-1.90842%206.4886-4.77104%208.20617z%22%20clip-rule%3D%22evenodd%22%20fill%3D%22%238d6748%22%20fill-rule%3D%22evenodd%22%2F%3E%3Cpath%20d%3D%22M95.904583%2022.049024c.954207%200%201.812992.286262%202.671781.763365l59.351606%2034.255996c1.62216.954206%202.67177%202.767198%202.67177%204.67561v68.511985c0%201.90842-1.04962%203.72141-2.67177%204.67562l-59.351606%2034.25599c-.858789.47711-1.717574.76336-2.671781.76336-.954206%200-1.908412-.28625-2.671777-.76336L33.881192%20134.9316c-1.62215-.95421-2.671778-2.7672-2.671778-4.67562V61.743995c0-1.908412%201.049628-3.721404%202.671778-4.67561l59.351614-34.255996c.858785-.477103%201.812992-.763365%202.671777-.763365m0-2.862618c-1.431309%200-2.862618.381683-4.103085%201.145048L32.449883%2054.58745c-2.576357%201.431309-4.103086%204.198506-4.103086%207.061124v68.511996c0%202.95803%201.526729%205.62981%204.103086%207.06112l59.351615%2034.25599c1.240467.76337%202.671776%201.14506%204.103085%201.14506%201.431309%200%202.862617-.38169%204.103097-1.14506l59.35159-34.25599c2.57636-1.43131%204.10309-4.1985%204.10309-7.06112V61.648574c0-2.958038-1.52673-5.629815-4.10309-7.061124l-59.35159-34.255996c-1.24048-.763365-2.671788-1.145048-4.103097-1.145048z%22%20fill%3D%22%23fff%22%2F%3E%3Cpath%20d%3D%22M104.3493%2061.648574c0-.477103-.381682-.954206-.954206-.954206H85.456021c-.477103%200-.954206.381682-.954206.954206%200%203.2443.477103%2014.40851%205.248133%2019.847485.190841.190841.381683.286262.667944.286262h8.01533c.286263%200%20.477104-.09542.667945-.286262%204.77103-5.343554%205.248133-16.507764%205.248133-19.847485zm-7.061124%2017.36655H91.65836c-.286262%200-.477103-.095421-.667944-.286263-3.2443-3.816824-3.625983-11.450472-3.721403-14.122249%200-.477103.381682-.954206.954206-.954206h12.595519c.477103%200%20.954206.381683.954206.954206%200%202.671777-.477103%2010.210005-3.721403%2014.12225-.286262.19084-.477103.286261-.763365.286261zM96.23855%2058.785956s3.43514-2.003833%201.335888-5.629816c-1.240468-1.908412-1.812992-3.530562-1.335889-4.198506-1.240468%201.52673-3.339721%203.14888-1.049627%206.584021.763365.858786%201.145048%202.671777%201.049627%203.2443zM92.421725%2059.072217s2.290094-1.335888.858785-3.816824c-.858785-1.240467-1.240467-2.385515-.858785-2.767197-.858785%201.049627-2.194674%202.099253-.667944%204.484768.477103.477103.667944%201.717571.667944%202.099253z%22%20fill%3D%22%23fff%22%2F%3E%3Cpath%20d%3D%22M100.246214%2070.141007c-.381682%202.576357-1.145047%205.534395-2.767197%207.442807-.190841.190841-.381682.286262-.572524.286262h-4.77103c-.190841%200-.477103-.09542-.572523-.286262-1.145048-1.431309-1.908412-3.33972-2.385515-5.343553%200%200%205.534394.763364%208.683274-.381683%202.290095-.858785%202.385515-1.71757%202.385515-1.71757z%22%20fill%3D%22%23fff%22%2F%3E%3Cg%20fill%3D%22%23fff%22%3E%3Cpath%20d%3D%22M37.554879%2085.599145h3.530562l5.820657%208.969536%205.820657-8.969536h3.530562v19.08412h-3.339721V91.03812l-6.011498%208.969537h-.09542L40.8946%2091.13354v13.645146h-3.339721V85.599145zM73.528446%20104.969527c-1.43131%200-2.767198-.286262-4.007665-.763365-1.240468-.477103-2.290095-1.240468-3.14888-2.099253-.858786-.858785-1.52673-1.908412-2.003833-3.14888-.477103-1.145047-.763365-2.480936-.763365-3.816824v-.09542c0-1.335889.286262-2.576357.763365-3.816825.477103-1.145047%201.145047-2.194674%202.099253-3.14888.858786-.858785%201.908412-1.62215%203.14888-2.099253%201.240468-.572523%202.576356-.763365%204.007665-.763365%201.43131%200%202.767198.286262%204.007666.763365%201.240468.477103%202.290094%201.240468%203.14888%202.099253.858785.858786%201.52673%201.908412%202.003832%203.14888.477103%201.145048.763365%202.480936.763365%203.816824v.095421c0%201.335888-.286262%202.576356-.763365%203.816824-.477103%201.145047-1.145047%202.194674-2.099253%203.14888-.858785.858785-1.908412%201.62215-3.14888%202.099253-1.240468.572524-2.576356.763365-4.007665.763365zm0-3.05346c.954206%200%201.812991-.19084%202.576356-.572523.763365-.381682%201.43131-.858785%202.003833-1.431309.572523-.572524.954206-1.335888%201.335888-2.099253.286262-.858786.477103-1.717571.477103-2.576356v-.095421c0-.954206-.190841-1.812991-.477103-2.671777-.286262-.858785-.763365-1.52673-1.335888-2.194674-.572524-.572523-1.240468-1.049626-2.003833-1.431309-.763365-.381682-1.62215-.572523-2.576356-.572523-.954206%200-1.812992.19084-2.576356.572523-.763365.381683-1.43131.858786-2.003833%201.43131-.572524.572523-.954206%201.335888-1.335888%202.099253-.286262.858785-.477104%201.71757-.477104%202.576356v.09542c0%20.954206.190842%201.812992.477104%202.671777.286261.858786.763364%201.52673%201.335888%202.194674.572524.572524%201.240468%201.049627%202.003833%201.43131.763364.381682%201.71757.572523%202.576356.572523zM99.67369%20104.969527c-1.431308%200-2.671776-.286262-3.816823-.763365-1.145048-.477103-2.194674-1.240468-3.05346-2.099253-.858785-.858785-1.52673-1.908412-2.003832-3.14888-.477103-1.240468-.763365-2.480936-.763365-3.816824v-.09542c0-1.335889.286262-2.671777.763365-3.816825.477103-1.145047%201.145047-2.194674%202.003832-3.14888.858786-.858785%201.908412-1.62215%203.14888-2.099253%201.240468-.477103%202.480936-.763365%204.007666-.763365.858785%200%201.62215.095421%202.385515.190842.763364.19084%201.335888.381682%202.003832.572523.572524.286262%201.145047.572524%201.62215.954206.477104.381683.954207.763365%201.43131%201.240468l-2.194674%202.480936c-.763365-.667945-1.52673-1.240468-2.385515-1.717571-.858786-.477103-1.812992-.667944-2.958039-.667944-.954206%200-1.71757.19084-2.480936.572523-.763364.381683-1.431309.858786-2.003832%201.43131-.572524.572523-.954206%201.335888-1.335889%202.099253-.286262.858785-.477103%201.71757-.477103%202.576356v.09542c0%20.954206.190841%201.812992.477103%202.671777.286262.858786.763365%201.52673%201.335889%202.194674.572523.572524%201.240468%201.145047%202.003832%201.43131.763365.28626%201.62215.572523%202.480936.572523%201.145047%200%202.194674-.190841%202.958039-.667944.763364-.477103%201.62215-1.049627%202.480935-1.812992l2.194674%202.194674c-.477103.572524-.954206.954206-1.52673%201.431309-.572523.477103-1.145047.763365-1.71757%201.049627-.572524.286261-1.335889.572523-2.003833.667944-.858785.190841-1.71757.190841-2.576356.190841zM114.177622%2085.599145h3.339721v7.91991h9.160378v-7.91991h3.339721v19.08412h-3.33972v-8.01533h-9.160379v8.01533h-3.33972v-19.08412zM144.807636%2085.503724h3.053459l8.397013%2019.179541h-3.530563l-1.908412-4.580189h-8.969536l-2.003833%204.58019h-3.435141l8.397013-19.179542zm4.77103%2011.641314l-3.2443-7.633649-3.244301%207.633649h6.4886z%22%2F%3E%3C%2Fg%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M35.169365%20110.69476h121.66127v1.049627H35.169365zM156.83062%2074.816618h-51.71797c0%20.381682-.0954.667943-.0954%201.049626h51.81338v-1.049626zM35.169364%2074.816618v1.049626h48.759928c0-.381683-.09542-.667944-.09542-1.049626H35.169365z%22%2F%3E%3C%2Fsvg%3E',
      description: 'A feature-rich JavaScript test framework running on Node.js and in the browser, making asynchronous testing simple and fun.'
    },
    {
      value: 'tape',
      label: 'Tape',
      icon: 'fas fa-tape',
      description: 'Tap-producing test harness for node and browsers.'
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
