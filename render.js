'use strict';

let fs = require('fs'),   
    path = require('path'),
    jade = require('jade'),
    stylus = require('stylus'), 
    babel = require('babel');

module.exports = {
    logs: path.join(__dirname, 'main.log'),
    watch: function (engine, file, render) {
        engine.call(this, file, render);
        fs.watchFile(file, () => engine.call(this, file, render));
    },
    watchFolder: function(dir){
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
        fs.writeFile(html, jade.renderFile(jadeFile),(err) =>{
            if (err) this.log(err);
            this.log(html + ' skompilowany');
        });
    },
    stylus: function (styl, css) {
        fs.readFile(styl,(err, file) => {
            if (err) this.log(err);
            fs.writeFile(css, stylus.render(file.toString()), () => this.log(css + ' skompilowany'));
        });
    },
    babel: function(es6, js){
       babel.transformFile(es6, (err, babel) => {
            if(err) this.log(err);
            fs.writeFile(js, babel.code,{
                comments: false,
                compact: true,
                stage: 0
            }, (err) => {
                if(err) this.log(err);
                this.log(js + ' skompilowany');
            });
        });
    },
    log: function(message){
		message = `[${new Date().toLocaleString()}] [renderjs] ${message}`;

        console.log(message);
        if(this.logs) fs.appendFile(this.logs, `${message}\n`);
    }
};