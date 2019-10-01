import {inject, bindable} from 'aurelia-framework';
import {DndService} from 'bcx-aurelia-dnd';

@inject(DndService, bindable)
export class PanelResizer {
  @bindable panel = '';

  constructor(dndService) {
    this.dndService = dndService;
  }

  attached() {
    this.dndService.addSource(this, {noPreview: true});
  }

  detached() {
    this.dndService.removeSource(this);
  }

  dndModel() {
    return {type: 'resize-panel', panel: this.panel};
  }
}
