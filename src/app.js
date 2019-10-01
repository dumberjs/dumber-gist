import {inject, computedFrom} from 'aurelia-framework';
import {DndService} from 'bcx-aurelia-dnd';
import {EventAggregator} from 'aurelia-event-aggregator';
import _ from 'lodash';

@inject(EventAggregator, DndService)
export class App {
  showSideBarInSmallLayout = false;
  showEditorsInSmallLayout = true;
  showBrowserWindowInSmallLayout = true;

  intension = {sideBar: 0, editors: 0};

  sideBarWidth = 400;
  editorsWidth = 500;
  windowWidth = null;

  constructor(ea, dndService) {
    this.ea = ea;
    this.dndService = dndService;
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

  onResize() {
    let width = window.innerWidth;
    if (width < 320) {
      width = 320;
    }

    if (this.windowWidth) {
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
      if (newWidth < 50) newWidth = 50;
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
      if (newWidth < 50) newWidth = 50;
      const effetiveDiff = newWidth - this.sideBarWidth;
      this.sideBarWidth = newWidth;

      let newWidth2 = this.editorsWidth - effetiveDiff;
      if (newWidth2 < 50) newWidth2 = 50;
      this.editorsWidth = newWidth2;
    } else {
      let newWidth = this.editorsWidth + diff;
      if (newWidth < 50) newWidth = 50;
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
    if (width < 50) return 50;
    return width;
  }

  @computedFrom('editorsWidth', 'intension.editors')
  get effectiveEditorsWidth() {
    const width = this.editorsWidth + this.intension.editors;
    if (width < 50) return 50;
    return width;
  }
}
