'use strict';

let fs = require('fs'),
    path = require('path'),
    jade = require('jade'),
    stylus = require('stylus'),
    stylusAP = require('autoprefixer-stylus'),
    nib = require('nib'),
    babel = require('babel');

module.exports = {
    logs: path.join(__dirname, 'main.log'),
    socket: null, watcher: false, dirTree: {},
    toRender: function (toRenderFiles) {
        toRenderFiles.forEach((file)=> {
            this.watch(this[file[0]], file[1], file[2]);
        });
    },
    inspect: function (userPath) {
        fs.readdir( userPath || __dirname, (err, files)=> {
            let isFolder = (files, prevDir, folder) => {
                files.forEach(function (file) {
                    let dir = path.join(prevDir, file);
                    if (fs.statSync(dir).isDirectory()) {
                        if (!folder.hasOwnProperty(file)) folder[file] = {};
                        isFolder(fs.readdirSync(dir), dir, folder[file]);
                    } else
                        folder[file] = dir;
                });
            };
            isFolder(files, userPath || __dirname, this.dirTree);
        });
        this.log('directory tree created');
    },
    watch: function (engine, file, render) {
        engine.call(this, file, render);
        if (this.watcher) fs.watchFile(file, () => engine.call(this, file, render));
    },
    watchFolder: function (dir) {
        fs.watch(dir, function (event, filename) {
            console.log('event is: ' + event);
            if (filename) {
                console.log('filename provided: ' + filename);
            } else {
                console.log('filename not provided');
            }
        });
    },
    jade: function (jadeFile, html) {
        fs.writeFile(html, jade.renderFile(jadeFile), (err) => {
            if (err) this.log(err);
            this.log(`${html} skompilowany przez 'jade'`);
        });
    },
    stylus: function (styl, css) {
        fs.readFile(styl, (err, file) => {
            if (err) this.log(err);
            stylus(file.toString())
                .use(nib()).use(stylusAP())
                .render((err, cssFile) =>
                    fs.writeFile(css, cssFile, () =>
                        this.log(`${css} skompilowany przez 'stylus', 'nib', 'auto-prefixer'`)));
        });
    },
    babel: function (es6, js) {
        babel.transformFile(es6, (err, babel) => {
            if (err) this.log(err);
            fs.writeFile(js, babel.code, {
                comments: false,
                compact: true,
                stage: 0
            }, (err) => {
                if (err) this.log(err);
                this.log(`${js} skompilowany przez 'babel'`);
            });
        });
    },
    log: function (message, consoleOnly) {
        message = `[${new Date().toLocaleString()}] [renderjs] ${message}`;

        console.log(message);
        if (this.socket) this.socket.emit('log', {log: message});
        if (!consoleOnly && this.logs) fs.appendFile(this.logs, `${message}\n`);
    }
};