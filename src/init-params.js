import queryString from 'query-string';

export class InitParams {
  constructor() {
    const params = queryString.parse(location.search);
    Object.assign(this, params);
  }
}
