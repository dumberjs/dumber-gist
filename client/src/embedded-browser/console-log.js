export class ConsoleLog {
  appLogs = [];
  dumberLogs = [];

  resetAppLogs() {
    this.appLogs.splice(0, this.appLogs.length);
  }

  resetDumberLogs() {
    this.dumberLogs.splice(0, this.dumberLogs.length);
  }
}