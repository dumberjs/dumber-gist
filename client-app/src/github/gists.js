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

function fromGist(gist) {
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

function toGist(gist) {
  const {files} = gist;
  const strangeFiles = {};

  _.each(files, (f, filename)=> {
    const fn = toWindows(filename);
    strangeFiles[fn] = {
      content: f.content
    };
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
        if (response.status === 404) {
          return Promise.reject('Gist not found.');
        }
        return Promise.reject('Error loading Gist.');
      })
      .then(fromGist);
  }

  update(id, gist) {
    let init = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(toGist(gist))
    };
    return this.api.fetch(`gists/${id}`, init)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        // todo: handle rate limit, etc
        throw new Error('unable to patch gist');
      })
      .then(fromGist);
  }

  create(gist) {
    let init = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body:JSON.stringify(toGist(gist))
    };
    return this.api.fetch(`gists`, init)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        // todo: handle rate limit, etc
        throw new Error('unable to create gist');
      })
      .then(fromGist);
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
