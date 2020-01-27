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
    files: normalizedFiles
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

  load(id, sha) {
    let url;
    if (sha) {
      url = `gists/${id}/${sha}`;
    } else {
      url = `gists/${id}`;
    }
    return this.api.fetch(url)
      .then(response => {
        if (response.ok) {
          // todo: handle truncated files
          return response.json();
        }
        throw new Error(`Error: ${response.statusText}\nGist ${id}`);
      })
      .then(fromGitHubGist);
  }

  update(id, gist) {
    const opts = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(toGitHubGist(gist))
    };
    return this.api.fetch(`gists/${id}`, opts)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        // todo: handle rate limit, etc
        throw new Error('unable to patch gist');
      })
      .then(fromGitHubGist);
  }

  create(gist) {
    const opts = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body:JSON.stringify(toGitHubGist(gist))
    };
    return this.api.fetch(`gists`, opts)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        // todo: handle rate limit, etc
        throw new Error('unable to create gist');
      })
      .then(fromGitHubGist);
  }

  fork(id) {
    return this.api.fetch(`gists/${id}/forks`, { method: 'POST' })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        // todo: handle rate limit, etc
        throw new Error('unable to fork gist');
      })
      .then(fork => this.load(fork.id));
  }
}
