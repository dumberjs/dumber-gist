import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {EditSession} from '../edit/edit-session';
import none from './none';
import aurelia from './aurelia';
import aurelia2 from './aurelia2';
import inferno from './inferno';
import preact from './preact';
import react from './react';
import svelte from './svelte';
import vue from './vue';
import _ from 'lodash';

const skeletons = {
  none,
  aurelia,
  aurelia2,
  inferno,
  preact,
  react,
  svelte,
  vue
};

@inject(EventAggregator, EditSession)
export class SkeletonGenerator {
  constructor(ea, session) {
    this.ea = ea;
    this.session = session;
  }

  generate(framework, transpiler) {
    const skeleton = skeletons[framework];
    if (!skeleton) {
      this.ea.publish('warning', `Framework ${framework} is not yet implemented.`);
      return;
    }

    const files = _.map(skeleton({transpiler}), f => ({...f, isChanged: true}));
    this.session.importData({files});
    this.ea.publish('generated-from-skeleton');
  }
}
