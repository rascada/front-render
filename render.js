'use strict';

let fs = require('fs'),
    path = require('path'),
    jade = require('jade'),
    stylus = require('stylus'),
    stylusAP = require('autoprefixer-stylus'),
    nib = require('nib'),
    babel = require('babel');

let render = {
    version:'0.0.5',
    logs: path.join(__dirname, 'main.log'),
    socket: null, watcher: false, dirTree: {},
    toRender: function (toRenderFiles) {
        if (toRenderFiles[0])
            toRenderFiles.forEach((file)=> {
                this.watch(this[file[0]], file[1], file[2]);
            });
        else this.log('rendering abort, toRender.json is empty');
    },
    inspect: function (userPath, watchFiles) {
        userPath = userPath || __dirname;
        this.log(`render dir root is ${userPath}`);

        if (watchFiles) {
            this.renderJSON(userPath);
        }
        fs.readdir(userPath || __dirname, (err, files)=> {
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
        this.log(`directory tree ${userPath}/* created`);
    },
    watch: function (engine, file, render) {
        engine.call(this, file, render);
        if (this.watcher) fs.watchFile(file, () => engine.call(this, file, render));
    },
    renderJSON: function (userPath) {
        if (userPath) this.watcher = true;
        else userPath = process.cwd();

        this.watcher ? this.log(`watching ${userPath}/*`) : this.log(`just one rendering ${userPath}/*`);

        this.log('looking for toRender.json in working directory');

        let toRender = path.join(userPath, 'toRender');

        try {
            let json = require(toRender);
            this.log(`${toRender}.json loaded`);
            render.toRender(json);
        } catch (e) {
            render.log('toRender.json not found');
            fs.writeFile(`${toRender}.json`, JSON.stringify([]), function () {
                render.log("toRender.json created");
                render.toRender(require(toRender));
            });
        }
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
        fs.writeFile(html, jade.renderFile(jadeFile, {pretty: true}), (err) => {
            if (err) this.log(err);
            this.log(`${html} rendered with 'jade'`);
        });
    },
    stylus: function (styl, css) {
        fs.readFile(styl, (err, file) => {
            if (err) this.log(err);

            let $$path = path.join(process.cwd(), styl).split(path.sep);
            $$path.pop();
            $$path = `"` + $$path.join(path.sep) + path.sep;

            file = file.toString().replace(/@import\s+"/gi, `@import ${$$path}`);

            stylus( file )
                .use(nib()).use(stylusAP())
                .render((err, cssFile) =>{
                    if(err) {
                        render.log(err);
                        return false;
                    }
                    fs.writeFile(css, cssFile, () =>
                        this.log(`${css} rendered with 'stylus', 'nib', 'auto-prefixer'`));
                });
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
                this.log(`${js} rendered with 'babel'`);
            });
        });
    },
    log: function (message, consoleOnly) {
        message = `[${new Date().toLocaleString()}] [front-render] ${message}`;

        console.log(message);
        if (this.socket) this.socket.emit('log', {log: message});
        if (!consoleOnly && this.logs) fs.appendFile(this.logs, `${message}\n`);
    }
};

module.exports = render;