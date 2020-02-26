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
    return 'text-white-light';
  }

  @computedFrom('method')
  get icon() {
    const m = this.method;

    if (m === 'error') return 'fa-fw fas fa-exclamation-circle';
    if (m === 'warn') return 'fa-fw fas fa-exclamation-circle';
    if (m === 'info') return 'fa-fw fas fa-info-circle';
    if (m === 'debug') return 'fa-fw fas fa-bug';
    if (m === 'system') return 'fa-fw fas fa-power-off';
    return 'fa-fw fas fa-list-alt';
  }
}
