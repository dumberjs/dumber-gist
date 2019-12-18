import {bindable} from 'aurelia-framework';

export class BrowserDevTools {
  @bindable height;
  @bindable toggleDevTools;

  tools = [
    {label: 'Console', value: 'console'},
    {label: 'Bundler', value: 'bundler'}
  ];

  activeTool = 'console';

}
