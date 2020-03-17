import {inject, bindable, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {ConsoleLog} from './console-log';
import {EditSession} from '../edit/edit-session';
import {HistoryTracker} from '../history-tracker';
import _ from 'lodash';

@inject(EventAggregator, ConsoleLog, EditSession, HistoryTracker)
export class BrowserDevTools {
  @bindable height;
  @bindable toggleDevTools;
  // Synchronize filters on two logs
  filter = '';

  constructor(ea, consoleLog, session, historyTracker) {
    this.ea = ea;
    this.consoleLog = consoleLog;
    this.session = session;
    this.historyTracker = historyTracker;
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

  runApp() {
    this.historyTracker.currentUrl = '/';
    this.ea.publish('history-reload');
  }

  runUnitTests() {
    this.historyTracker.currentUrl = '/run-tests.html';
    this.ea.publish('history-reload');
  }

  @computedFrom('session.mutation')
  get hasUnitTests() {
    return _.some(this.session.files, {filename: 'run-tests.html'});
  }

  @computedFrom('historyTracker.currentUrl')
  get isRunningUnitTests() {
    return _.startsWith(this.historyTracker.currentUrl, '/run-tests.html');
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
