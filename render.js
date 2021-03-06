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
  logs: true, watcher: false,
  logsDirectory: Path.join(__dirname, 'main.log'),
  directoryTree: new DirectoryTree(),

  // engines
  jade,
  stylus,
  babel,

  toRender: function(toRenderFiles) {
    if (toRenderFiles[0])
      toRenderFiles.forEach(file => {
        this.watch(this[file[0]], file[1], file[2]);
      });
    else this.log('rendering abort, toRender.json is empty');
  },

  watch: function(engine, file, render) {
    engine.call(this, file, render);
    if (this.watcher) fs.watchFile(file, _ => engine.call(this, file, render));
  },

  renderJSON: function(userPath) {
    if (userPath) this.watcher = true;
    else userPath = process.cwd();

    this.log(`${this.watcher ? 'watching' : 'render once '}${userPath}${Path.sep}*`);

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
        render.toRender([]);
      });
    }
  },

  log: function(message, consoleOnly) {
    let log = `| ${new Date().toLocaleString()} |front-render| ${message}`;

    if (this.logs) {
      console.log(log);
      if (!consoleOnly && this.logsDirectory)
        fs.appendFile(this.logsDirectory, `${log}\n`);
    }

    return {
      log,
      message,
    };
  },
};

module.exports = render;
