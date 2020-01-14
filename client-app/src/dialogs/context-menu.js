import {DialogController} from 'aurelia-dialog';
import {inject} from 'aurelia-framework';

@inject(DialogController)
export class ContextMenu {
  constructor(controller) {
    this.controller = controller;
  }

  activate(model) {
    this.items = model.items;
    const {top, left, bottom, right} = model;
    const style = {};
    if (top) style.top = top + 'px';
    if (left) style.left = left + 'px';
    if (bottom) style.bottom = bottom + 'px';
    if (right) style.right = right + 'px';
    this.style = style;
  }
}
