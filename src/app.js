import {inject, computedFrom} from 'aurelia-framework';
import {DndService} from 'bcx-aurelia-dnd';
import {EventAggregator} from 'aurelia-event-aggregator';
import {EditSession} from './edit-session';
import _ from 'lodash';

const MIN_PANEL_WIDTH = 150;

@inject(EventAggregator, DndService, EditSession)
export class App {
  showSideBarInSmallLayout = false;
  showEditorsInSmallLayout = true;
  showBrowserWindowInSmallLayout = true;

  intension = {sideBar: 0, editors: 0};

  sideBarWidth = 400;
  editorsWidth = 500;
  windowWidth = null;

  constructor(ea, dndService, session) {
    this.ea = ea;
    this.dndService = dndService;
    this.session = session;
    // For dev only
    session.loadFiles([
      {
        filename: 'index.html',
        content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Aurelia</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no">
  <base href="/">
</head>

<body>
<div id="vue-root"></div>
<script src="/dist/entry-bundle.js" data-main="main"></script>
</body>
</html>
`
      },
      {
        filename: 'src/main.js',
        content: `import Vue from 'vue';
import App from './App';

new Vue({
  components: {App},
  template: '<App></App>'
}).$mount('#vue-root');
 `
      },
      {
        filename: 'src/App.js',
        content: `import "./App.css";

export default {
  template: \`
    <div class="app">
      <h2>{{ msg }}</h2>
    </div>
  \`,
  data() {
    return {
      msg: 'Hello Vue!'
    };
  }
};
`
      },
      {
        filename: 'src/App.css',
        content: `.app {
  color: #333333;
  font-family: --apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif;
  line-height: 4rem;
  padding-left: 5rem;
}
`
      },
      {
        filename: 'test/one/two/three/some.svg',
        content: 'hello'
      }
    ]);
    this.onResize = _.debounce(this.onResize.bind(this), 100);
    this.onResize();
  }

  attached() {
    this.dndService.addTarget(this);
    this.subscribers = [
      this.ea.subscribe('dnd:willStart', () => this.resetIntention()),
      this.ea.subscribe('dnd:didEnd', () => this.resetIntention())
    ];
    window.addEventListener('resize', this.onResize);
  }

  detached() {
    this.dndService.removeTarget(this);
    this.subscribers.forEach(s => s.dispose());
    window.removeEventListener('resize');
  }

  onResize(reset) {
    let width = window.innerWidth;
    if (width < 320) {
      width = 320;
    }

    if (this.windowWidth && !reset) {
      this.sideBarWidth = Math.round(this.sideBarWidth / this.windowWidth * width);
      this.editorsWidth = Math.round(this.editorsWidth / this.windowWidth * width);
    } else if (width >= 800) {
      this.sideBarWidth = Math.round(.2 * width);
      this.editorsWidth = Math.round(.4 * width);
    } else {
      this.sideBarWidth = Math.round(.2 * width);
      this.editorsWidth = Math.round(.5 * width);
    }

    if (width <= 450 && this.showEditorsInSmallLayout) {
      this.showBrowserWindowInSmallLayout = false;
    }

    this.windowWidth = width;
  }

  resetIntention() {
    this.intension.sideBar = 0;
    this.intension.editors = 0;
  }

  dndCanDrop(model) {
    return model.type === 'resize-panel';
  }

  dndHover(location) {
    const {mouseStartAt, mouseEndAt} = location;
    const diff = mouseEndAt.x - mouseStartAt.x;

    if (this.dnd.model.panel === 'side-bar') {
      let newWidth = this.sideBarWidth + diff;
      if (newWidth < MIN_PANEL_WIDTH) newWidth = MIN_PANEL_WIDTH;
      const effetiveDiff = newWidth - this.sideBarWidth;
      this.intension.sideBar = effetiveDiff;
      this.intension.editors = -effetiveDiff;
    } else {
      this.intension.editors = diff;
    }
  }

  dndDrop(location) {
    const {mouseStartAt, mouseEndAt} = location;
    const diff = mouseEndAt.x - mouseStartAt.x;

    if (this.dnd.model.panel === 'side-bar') {
      let newWidth = this.sideBarWidth + diff;
      if (newWidth < MIN_PANEL_WIDTH) newWidth = MIN_PANEL_WIDTH;
      const effetiveDiff = newWidth - this.sideBarWidth;
      this.sideBarWidth = newWidth;

      let newWidth2 = this.editorsWidth - effetiveDiff;
      if (newWidth2 < MIN_PANEL_WIDTH) newWidth2 = MIN_PANEL_WIDTH;
      this.editorsWidth = newWidth2;
    } else {
      let newWidth = this.editorsWidth + diff;
      if (newWidth < MIN_PANEL_WIDTH) newWidth = MIN_PANEL_WIDTH;
      this.editorsWidth = newWidth;
    }
  }

  toggleEditors() {
    this.showEditorsInSmallLayout = !this.showEditorsInSmallLayout;
    if (!this.showEditorsInSmallLayout) {
      this.showBrowserWindowInSmallLayout = true;
    } else if (this.windowWidth <= 450) {
      this.showBrowserWindowInSmallLayout = false;
    }
  }

  toggleBrowserWindow() {
    this.showBrowserWindowInSmallLayout = !this.showBrowserWindowInSmallLayout;
    if (!this.showBrowserWindowInSmallLayout) {
      this.showEditorsInSmallLayout = true;
    } else if (this.windowWidth <= 450) {
      this.showEditorsInSmallLayout = false;
    }
  }

  @computedFrom('sideBarWidth', 'intension.sideBar')
  get effectiveSideBarWidth() {
    const width = this.sideBarWidth + this.intension.sideBar;
    if (width < MIN_PANEL_WIDTH) return MIN_PANEL_WIDTH;
    return width;
  }

  @computedFrom('editorsWidth', 'intension.editors')
  get effectiveEditorsWidth() {
    const width = this.editorsWidth + this.intension.editors;
    if (width < MIN_PANEL_WIDTH) return MIN_PANEL_WIDTH;
    return width;
  }
}
