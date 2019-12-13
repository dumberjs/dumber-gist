export function configure(aurelia) {
  aurelia.use.feature('resources');
  aurelia.use.standardConfiguration();

  if (process.env.NODE_ENV === 'production') {
    aurelia.use.developmentLogging('warn');
  } else {
    aurelia.use.developmentLogging('info');
    aurelia.use.plugin('aurelia-testing');
  }

  aurelia.use.plugin('aurelia-dialog', config => {
    config.useDefaults();
    config.useCSS(''); // css in scss partial _dialog.scss
    config.settings.lock = false;
    config.settings.overlayDismiss = true;
    config.settings.ignoreTransitions = true;
    config.settings.centerHorizontalOnly = true;
  });

  aurelia.use.plugin('aurelia-combo');
  aurelia.start().then(() => aurelia.setRoot());
}
