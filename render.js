'use strict';

let fs = require('fs'),
    path = require('path'),

    jade = require('jade'),
    babel = require('babel'),
    stylus = require('stylus'),
    stylusAP = require('autoprefixer-stylus'),
    nib = require('nib');

let rdp = require('readdirp');
let es = require('event-stream');

let render = {
    version:'0.0.6',
    logs: true,
    logsDirectory: path.join(__dirname, 'main.log'),
    socket: null, watcher: false, dirTree: {},
    toRender: function (toRenderFiles) {
        if (toRenderFiles[0])
            toRenderFiles.forEach((file)=> {
                this.watch(this[file[0]], file[1], file[2]);
            });
        else this.log('rendering abort, toRender.json is empty');
    },
    inspect: function (userPath, watchFiles) {
        let stream = rdp({
          root: path.join(userPath || __dirname),
          directoryFilter: ['!node_modules', '!.git', '!.idea']
        });

        stream
          .on('warn', err => this.log('non-fatal error', err))
          .on('error', err => this.log('fatal error', err))
          .on('data', data => console.log(data.parentDir, data.name))
          //.pipe(es.stringify())
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
    jade: function (jadeFile, html, done) {

        if(!done) done = function(){};

        try {
            fs.writeFile(html, jade.renderFile(jadeFile), (err) => {
                if (err) done(this.log(err));
                done(null, this.log(`${html} rendered with 'jade'`));
            });
        }catch(err){
            done(err);
        }
    },
    stylus: function (styl, css, done) {

        if(!done) done = function(){};

        fs.readFile(styl, (err, file) => {
            if (err) done( this.log(err) );

            let $$path = path.join(process.cwd(), styl).split(path.sep);
            $$path.pop();
            $$path = `"` + $$path.join(path.sep) + path.sep;

            file = file.toString().replace(/@import\s+"/gi, `@import ${$$path}`);

            stylus( file )
                .use(nib()).use(stylusAP())
                .render((err, cssFile) =>{
                    if(err) {
                        done( render.log(err) );
                        return false;
                    }
                    fs.writeFile(css, cssFile, () =>
                        done( null, this.log(`${css} rendered with 'stylus', 'nib', 'auto-prefixer'`) ));
                });
        });
    },
    babel: function (es6, js, done) {
        babel.transformFile(es6, (err, babel) => {

            if(!done) done = function(){};

            if (err) {
                done( this.log(err) );
                return false
            }

            fs.writeFile(js, babel.code, {
                comments: false,
                compact: true,
                stage: 0
            }, (err) => {
                if (err) done(this.log(err) );
                done( null, this.log(`${js} rendered with 'babel'`) );
            });
        });
    },
    log: function (message, consoleOnly) {
        let log = `[${new Date().toLocaleString()}] [front-render] ${message}`;

        if(this.logs){
            console.log(log);
            if (this.socket) this.socket.emit('log', {log: log});
            if (!consoleOnly && this.logsDirectory) fs.appendFile(this.logsDirectory, `${log}\n`);
        }

        return {
            log,
            message
        };
    }
};

module.exports = render;
