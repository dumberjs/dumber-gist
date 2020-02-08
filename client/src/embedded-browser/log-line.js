import {bindable, computedFrom} from 'aurelia-framework';

export class LogLine {
  @bindable method;
  @bindable args;

  @computedFrom('method')
  get lineColor() {
    const m = this.method;

    if (m === 'error') return 'text-error-light';
    if (m === 'warn') return 'text-warning';
    if (m === 'info') return 'text-cyan';
    if (m === 'debug') return 'text-muted';
    if (m === 'system') return 'text-muted bg-dark';
    return '';
  }

  @computedFrom('method')
  get icon() {
    const m = this.method;

    if (m === 'error') return 'fas fa-exclamation-circle';
    if (m === 'warn') return 'fas fa-exclamation-circle';
    if (m === 'info') return 'fas fa-info-circle';
    if (m === 'debug') return 'fas fa-bug';
    if (m === 'system') return 'fas fa-power-off';
    return 'fas fa-list-alt';
  }
}
