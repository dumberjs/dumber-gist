import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import moment from 'moment';

@inject(EventAggregator)
export class RateLimit {
  limit = 99999;
  remaining = 99999;
  reset = null;

  constructor(ea) {
    this.ea = ea;
  }

  readHeaders(response) {
    this.limit = parseInt(response.headers.get('X-RateLimit-Limit'), 10),
    this.remaining = parseInt(response.headers.get('X-RateLimit-Remaining'), 10),
    this.reset = new Date(parseInt(response.headers.get('X-RateLimit-Reset'), 10) * 1000);

    const resetIn = moment(this.reset).fromNow();

    if (this.remaining === 0) {
      this.ea.publish('error', {
        title: 'GitHub API rate limit',
        message: `You have reached GitHub API rate limit, it will reset ${resetIn}. Read more at https://developer.github.com/v3/#rate-limiting`
      });
    }
  }
}
