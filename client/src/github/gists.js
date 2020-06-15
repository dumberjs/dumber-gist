import {inject} from 'aurelia-framework';
import {ApiClient} from './api-client';
import _ from 'lodash';

// GitHub gist doesn't allow file in folder.
// Followed gist-run, we use windows path separator
// to bypass the file name check.
// GitHub gist will treat the file name as the whole
// base file name without any folder.
function toWindows(name) {
  return name.replace(/\//g, '\\');
}

function toUnix(name) {
  return name.replace(/\\/g, '/');
}

function fromGitHubGist(gist) {
  const {files} = gist;
  const normalizedFiles = {};

  _.each(files, (f, filename)=> {
    const fn = toUnix(filename);
    normalizedFiles[fn] = {
      ...f,
      filename: fn
    };
  });

  return {
    ...gist,
    files: normalizedFiles,
    filesCount: Object.keys(normalizedFiles).length
  };
}

function toGitHubGist(gist) {
  const {files} = gist;
  const strangeFiles = {};

  _.each(files, (f, filename)=> {
    const fn = toWindows(filename);
    strangeFiles[fn] = f ? {content: f.content} : null;
  });

  return {
    ...gist,
    files: strangeFiles
  };
}

@inject(ApiClient)
export class Gists {
  constructor(api) {
    this.api = api;
  }

  async load(id, sha) {
    let url;
    if (sha) {
      url = `gists/${id}/${sha}`;
    } else {
      url = `gists/${id}`;
    }

    const response = await this.api.fetch(url);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}\nGist ${id}`);
    }

    // TODO: handle truncated files
    const gist = await response.json();
    return fromGitHubGist(gist);
  }


  async list(login) {
    const {totalPages, page, gists} = await this._list(login, 1);
    if (totalPages > page) {
      const results = await Promise.all(
        _.range(page + 1, totalPages + 1)
          .map(page => this._list(login, page))
      );

      results.forEach(r => {
        gists.push(...r.gists);
      });
    }

    return gists;
  }

  async _list(login, page) {
    const response = await this.api.fetch(`users/${login}/gists?per_page=100&page=${page}`);
    if (!response.ok) {
      throw new Error(`unable to list gists for user ${login}: ${response.statusText}`);
    }

    const link = response.headers.get('link');
    let totalPages = page;
    if (link) {
      const m = link.match(/(?:\?|&)page=(\d+)[^"]+?rel="last"/);
      if (m) {
        totalPages = parseInt(m[1], 10);
      }
    }

    const list = await response.json();
    return {totalPages, page, gists: list.map(fromGitHubGist)};
  }

  async update(id, gist) {
    const opts = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(toGitHubGist(gist))
    };

    const response = await this.api.fetch(`gists/${id}`, opts);
    if (!response.ok) {
      throw new Error('unable to patch gist');
    }

    const g = await response.json();
    return fromGitHubGist(g);
  }

  async create(gist) {
    const opts = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body:JSON.stringify(toGitHubGist(gist))
    };

    const response = await this.api.fetch(`gists`, opts);
    if (!response.ok) {
      throw new Error('unable to create gist');
    }

    const g = await response.json();
    return fromGitHubGist(g);
  }

  async fork(id) {
    const response = await this.api.fetch(`gists/${id}/forks`, { method: 'POST' });
    if (!response.ok) {
      throw new Error('unable to fork gist');
    }

    const forked = await response.json();
    return await this.load(forked.id);
  }

  async delete(id) {
    const response = await this.api.fetch(`gists/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error('unable to delete gist');
    }
  }
}
