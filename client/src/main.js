export function configure(aurelia) {
  aurelia.use.feature('resources');
  aurelia.use.standardConfiguration();

  if (process.env.NODE_ENV === 'production') {
    aurelia.use.developmentLogging('warn');
  } else {
    aurelia.use.developmentLogging('info');
  }

  aurelia.use.plugin('aurelia-dialog-lite', {lock: false, overlayDismiss: true});
  aurelia.use.plugin('aurelia-combo');
  aurelia.use.plugin('bcx-aurelia-reorderable-repeat');

  aurelia.start().then(() => aurelia.setRoot());
}
