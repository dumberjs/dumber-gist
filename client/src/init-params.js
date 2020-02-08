import queryString from 'querystring';

export class InitParams {
  constructor() {
    const params = queryString.parse(location.search.slice(1));
    Object.assign(this, params);
  }
}
