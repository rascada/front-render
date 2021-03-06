'use strict';

let Path = require('path');
let rdp = require('readdirp');
let es = require('event-stream');

module.exports = class DirectoryTree{
  constructor() {
    this.tree = {};
  }

  create(userPath) {
    let stream = rdp({
      root: Path.join(userPath || __dirname),
      directoryFilter: ['!node_modules', '!.git', '!.idea'],
    });

    return stream
      .on('warn', err => render.log('non-fatal error', err))
      .on('error', err => render.log('fatal error', err))
      .on('data', data => this.createDir(data));
  }

  createDir(data) {
    if (!data.parentDir) this.tree[data.name] = data;
    else {
      let path = data.parentDir.split(Path.sep);
      let currentDir = this.tree;

      path.forEach(directory => {
        currentDir = currentDir[directory] = {};
      });
      currentDir[data.name] = data;
    }
  }
};
