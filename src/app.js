/* globals toastr */
import {inject, computedFrom} from 'aurelia-framework';
import {DndService} from 'bcx-aurelia-dnd';
import {EventAggregator} from 'aurelia-event-aggregator';
import {EditSession} from './edit-session';
import {combo} from 'aurelia-combo';
import {activate, init, postMessageToWorker} from './worker-activator';
import _ from 'lodash';

toastr.options.positionClass = 'toast-top-center';

const MIN_PANEL_WIDTH = 150;
const MIN_DEV_TOOLS_HEIGHT = 50;

@inject(EventAggregator, DndService, EditSession)
export class App {
  showSideBarInSmallLayout = false;
  showEditorsInSmallLayout = true;
  showBrowserWindowInSmallLayout = true;
  duringFileDrop = false;

  isBundling = false;
  bundlerError = null;
  intension = {sideBar: 0, editors: 0, devTools: 0};

  sideBarWidth = 400;
  editorsWidth = 500;
  devToolsHeight = 0;
  windowWidth = null;
  windowHeight = null;

  constructor(ea, dndService, session) {
    this.ea = ea;
    this.dndService = dndService;
    this.session = session;
    // For dev only
    session.loadGist({
      description: '',
      files: []
    });
    this.onResize = _.debounce(this.onResize.bind(this), 100);
    this.gotMessage = this.gotMessage.bind(this);
    this.onResize();
  }

  attached() {
    this.dndService.addTarget(this);
    this._subscribers = [
      this.ea.subscribe('dnd:willStart', () => this.resetIntention()),
      this.ea.subscribe('dnd:didEnd', () => {
        if (this.intension.sideBar) this.sideBarWidth += this.intension.sideBar;
        if (this.intension.editors) this.editorsWidth += this.intension.editors;
        if (this.intension.devTools) this.devToolsHeight += this.intension.devTools;
        this.resetIntention();
      }),
      this.ea.subscribe('edit-file', () => {
        this.showSideBarInSmallLayout = false;
        this.showEditorsInSmallLayout = true;
        if (this.windowWidth <= 450) {
          this.showBrowserWindowInSmallLayout = false;
        }
      }),
      this.ea.subscribe('success', (message) => {
        toastr.success(message);
      }),
      this.ea.subscribe('info', (message) => {
        toastr.info(message);
      }),
      this.ea.subscribe('error', (message) => {
        toastr.error(message);
      }),
      this.ea.subscribe('warning', (message) => {
        toastr.warning(message);
      }),
    ];
    this._setupFileDrop();
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener("message", this.gotMessage);
    activate();
  }

  _setupFileDrop() {
    let toFinish;
    const cancelFinish = () => {
      if (toFinish) {
        clearTimeout(toFinish);
        toFinish = null;
      }
    };

    const finish = () => {
      cancelFinish();
      toFinish = setTimeout(() => this.duringFileDrop = false, 50);
    };

    const scanFiles = item => {
      if (item.isDirectory) {
        const reader = item.createReader();
        reader.readEntries(entries => {
          entries.forEach(entry => {
            scanFiles(entry);
          })
        });
      } else if (item.isFile) {
        item.file(file => {
          const reader = new FileReader();
          reader.onload = e => {
            const content = e.target.result;
            const filename = _.trim(item.fullPath, '/');
            this.session.createFile(filename, content);
          };
          reader.readAsText(file);
        });
      }
    };

    document.addEventListener('dragenter', e => {
      e.stopPropagation();
      e.preventDefault();
      cancelFinish();
      this.duringFileDrop = true;
    });
    document.addEventListener('dragover', e => {
      e.stopPropagation();
      e.preventDefault();
      finish();
    });
    document.addEventListener('drop', e => {
      e.stopPropagation();
      e.preventDefault();
      finish();
      const {items} = e.dataTransfer;
      for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry();
        scanFiles(item);
      }
    });
  }

  gotMessage(event) {
    console.log('app gotMessage', event.data);
    const type = _.get(event, 'data.type');

    if (type === 'worker-up') {
      init();
    } else if (type === 'worker-ready') {
      console.log('ready to roll!');
    } else if (type === 'build-done') {
      this.isBundling = false;
      console.log('done bundling', this.isBundling);
    } else if (type === 'worker-error') {
      const error = _.get(event, 'data.error') || 'unknown error';
      if (this.isBundling) {
        this.isBundling = false;
        this.bundlerError = error;
      }
      console.log('worker-error ' + error);
    }
  }

  bundle() {
    if (this.isBundling) return;
    if (this.session.isRendered) return;

    this.isBundling = true;
    this.bundlerError = null;

    this.session.renderFiles();
    setTimeout(() => {
      postMessageToWorker({type: 'build'});
    }, 200);
  }

  detached() {
    this.dndService.removeTarget(this);
    this._subscribers.forEach(s => s.dispose());
    window.removeEventListener('resize');
  }

  onResize(reset) {
    let width = window.innerWidth;
    let height = window.innerHeight;

    if (width < 320) {
      width = 320;
    }

    if (height < 200) {
      height = 200;
    }

    if (this.windowWidth && !reset) {
      this.sideBarWidth = Math.round(this.sideBarWidth / this.windowWidth * width);
      this.editorsWidth = Math.round(this.editorsWidth / this.windowWidth * width);
      this.devToolsHeight = Math.round(this.devToolsHeight / this.windowHeight * height);
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
    this.windowHeight = height;
  }

  resetIntention() {
    this.intension.sideBar = 0;
    this.intension.editors = 0;
    this.intension.devTools = 0;
  }

  dndCanDrop(model) {
    return model.type === 'resize-panel';
  }

  _buildIntension(location) {
    const intension = {sideBar: 0, editors: 0, devTools: 0};
    const {mouseStartAt, mouseEndAt} = location;
    const diff = mouseEndAt.x - mouseStartAt.x;
    const diffY = mouseStartAt.y - mouseEndAt.y;

    if (this.dnd.model.panel === 'side-bar') {
      let newWidth = this.sideBarWidth + diff;
      if (newWidth < MIN_PANEL_WIDTH) {
        newWidth = MIN_PANEL_WIDTH;
      } else if (newWidth > this.windowWidth - 2 * MIN_PANEL_WIDTH) {
        newWidth = this.windowWidth - 2 * MIN_PANEL_WIDTH;
      }
      const effetiveDiff = newWidth - this.sideBarWidth;
      intension.sideBar = effetiveDiff;

      let newWidth2 = this.editorsWidth - effetiveDiff;
      if (newWidth2 < MIN_PANEL_WIDTH) newWidth2 = MIN_PANEL_WIDTH;
      intension.editors = newWidth2 - this.editorsWidth;
    } else if (this.dnd.model.panel === 'editors') {
      let newWidth = this.editorsWidth + diff;
      if (newWidth < MIN_PANEL_WIDTH) {
        newWidth = MIN_PANEL_WIDTH;
      } else {
        if (this.windowWidth >= 800) {
          if (newWidth > this.windowWidth - MIN_PANEL_WIDTH - this.sideBarWidth) {
            newWidth = this.windowWidth - MIN_PANEL_WIDTH - this.sideBarWidth;
          }
        } else {
          if (newWidth > this.windowWidth - MIN_PANEL_WIDTH) {
            newWidth = this.windowWidth - MIN_PANEL_WIDTH;
          }
        }
      }
      intension.editors = newWidth - this.editorsWidth;
    } else if (this.dnd.model.panel === 'dev-tools') {
      let newHeight = this.devToolsHeight + diffY;

      if (newHeight > this.windowHeight - 150) {
        newHeight = this.windowHeight - 150;
      }

      if (newHeight < MIN_DEV_TOOLS_HEIGHT) {
        newHeight = 0;
      }

      intension.devTools = newHeight - this.devToolsHeight;
    }

    return intension;
  }

  dndHover(location) {
    const intension = this._buildIntension(location);
    if (this.intension.sideBar !== intension.sideBar) this.intension.sideBar = intension.sideBar;
    if (this.intension.editors !== intension.editors) this.intension.editors = intension.editors;
    if (this.intension.devTools !== intension.devTools) this.intension.devTools = intension.devTools;
  }

  dndDrop() {
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

  toggleDevTools() {
    if (this.devToolsHeight) {
      this.devToolsHeight = 0;
    } else {
      this.devToolsHeight = 200;
    }
  }

  // TODO test ctrl-w in Win10 Chrome
  @combo('ctrl+w')
  closeActiveTab() {
    const {editingFile} = this.session;
    if (editingFile) {
      this.session.closeFile(editingFile.filename);
    }
  }

  @computedFrom('sideBarWidth', 'intension.sideBar')
  get effectiveSideBarWidth() {
    const width = this.sideBarWidth + this.intension.sideBar;
    return width;
  }

  @computedFrom('editorsWidth', 'intension.editors')
  get effectiveEditorsWidth() {
    const width = this.editorsWidth + this.intension.editors;
    return width;
  }

  @computedFrom('devToolsHeight', 'intension.devTools')
  get effectiveDevToolsHeight() {
    const hight = this.devToolsHeight + this.intension.devTools;
    return hight;
  }
}
