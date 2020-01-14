export class NpmHttpRegistry {
  constructor() {
    // Cannot use https://registry.npmjs.org which
    // doesn't have CORS enabled
    this.registryUrl = 'https://registry.npmjs.cf';
    this.cache = {};
    this.fetching = {};
  }

  async fetch(name){
    if(this.cache[name]) {
      return this.cache[name];
    }

    if (!this.fetching[name]) {
      this.fetching[name] = fetch(`${this.registryUrl}/${name}`).then(response => {
        if(!response.ok){
          console.log(`Could not load npm registry for ${name}: ${response.statusText}`);
          throw new Error(response.statusText);
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
