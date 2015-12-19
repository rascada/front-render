'use strict';

let fs = require('fs');
let Path = require('path');

let pkg = require('./package');
let DirectoryTree = require('./classes/DirectoryTree');

let jade = require('./engines/jade');
let stylus = require('./engines/stylus');
let babel = require('./engines/babel');

let render = {
  version: pkg.version,
  logs: true,
  logsDirectory: Path.join(__dirname, 'main.log'),
  watcher: false,
  directoryTree: new DirectoryTree(),

  // engines
  jade,
  stylus,
  babel,

  toRender: function(toRenderFiles) {
    if (toRenderFiles[0])
      toRenderFiles.forEach((file)=> {
        this.watch(this[file[0]], file[1], file[2]);
      });
    else this.log('rendering abort, toRender.json is empty');
  },

  watch: function(engine, file, render) {
    engine.call(this, file, render);
    if (this.watcher) fs.watchFile(file, () => engine.call(this, file, render));
  },

  renderJSON: function(userPath) {
    if (userPath) this.watcher = true;
    else userPath = process.cwd();

    this.watcher ? this.log(`watching ${userPath}/*`) : this.log(`just one rendering ${userPath}/*`);

    this.log('looking for toRender.json in working directory');

    let toRender = Path.join(userPath, 'toRender');

    try {
      let json = require(toRender);
      this.log(`${toRender}.json loaded`);
      render.toRender(json);
    } catch (e) {
      render.log('toRender.json not found');
      fs.writeFile(`${toRender}.json`, JSON.stringify([]), function() {
        render.log(`toRender.json created`);
        render.toRender(require(toRender));
      });
    }
  },

  watchFolder: function(dir) {
    fs.watch(dir, function(event, filename) {
      console.log('event is: ' + event);
      if (filename) {
        console.log('filename provided: ' + filename);
      } else {
        console.log('filename not provided');
      }
    });
  },

  log: function(message, consoleOnly) {
    let log = `[${new Date().toLocaleString()}] [front-render] ${message}`;

    if (this.logs) {
      console.log(log);
      if (this.socket) this.socket.emit('log', {log: log});
      if (!consoleOnly && this.logsDirectory) fs.appendFile(this.logsDirectory, `${log}\n`);
    }

    return {
      log,
      message,
    };
  },
};

module.exports = render;
