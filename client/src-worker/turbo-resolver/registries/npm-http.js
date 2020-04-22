export class NpmHttpRegistry {
  constructor() {
    // Cannot use https://registry.npmjs.org which
    // doesn't have CORS enabled
    this.registryUrl = 'https://registry.npmjs.cf';
    this.cache = {};
    this.fetching = {};
  }

  resetCache() {
    this.cache = {};
  }

  async fetch(name){
    if(this.cache[name]) {
      return this.cache[name];
    }

    if (!this.fetching[name]) {
      this.fetching[name] = fetch(`${this.registryUrl}/${name}`).then(async response => {
        if(!response.ok){
          // npm can send a json error
          const dataError = (await (response.json().then(j => j && j.error).catch( () => null)));
          const error = `Could not load npm registry for ${name}: ${dataError || response.statusText}`;

          console.error(error);
          throw new Error(error);
        }

        return response.json();
      }).then(json => {
        this.cache[name] = json;
        delete this.fetching[name];
        return json;
      });
    }

    return this.fetching[name];
  }

  batchFetch(names){
    return Promise.all(names.map(name => this.fetch(name)));
  }
}
