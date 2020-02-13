import {inject, bindable, computedFrom} from 'aurelia-framework';
import {ConsoleLog} from './console-log';
import _ from 'lodash';

@inject(ConsoleLog)
export class BrowserDevTools {
  @bindable height;
  @bindable toggleDevTools;
  // Synchronize filters on two logs
  filter = '';

  constructor(consoleLog) {
    this.consoleLog = consoleLog;
  }

  activeTool = 'console';

  activateTool(tool) {
    this.activeTool = tool;
    this.toggleDevTools({open: true});
  }

  resetAppLogs() {
    this.consoleLog.resetAppLogs();
  }

  resetDumberLogs() {
    this.consoleLog.resetDumberLogs();
  }

  @computedFrom('consoleLog.appLogs.length')
  get appErrorsCount() {
    return _.filter(this.consoleLog.appLogs, {method: 'error'}).length;
  }

  @computedFrom('consoleLog.dumberLogs.length')
  get dumberErrorsCount() {
    return _.filter(this.consoleLog.dumberLogs, {method: 'error'}).length;
  }
}
