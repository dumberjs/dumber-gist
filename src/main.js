import 'regenerator-runtime/runtime';

export function configure(aurelia) {
  aurelia.use.feature('resources');
  aurelia.use.standardConfiguration();
  // @if isProduction
  aurelia.use.developmentLogging('warn');
  // @endif
  // @if !isProduction
  aurelia.use.developmentLogging('info');
  aurelia.use.plugin('aurelia-testing');
  // @endif
  aurelia.start().then(() => aurelia.setRoot());
}
