'use strict';

let fs = require('fs'),
    tape = require('tape'),
    fRender = require('../render');

fRender.logs = false;

tape('stylus compilation engine', test => {
    test.plan(1);

    let styl = `
        body
            background red + 10%
        `;

    fs.writeFile('test.styl', styl, function(err){

        if (err) test.fail(err);

        fRender.stylus('test.styl', 'test.css', function(err, log){

            if(err) test.fail(err);

            fs.readFile('test.css', function(err, file){

                if(err) test.fail(err);

                test.equal(file.toString(), 'body {\n  background: #ff1a1a;\n}\n', log.message);
                ['css', 'styl'].forEach( ext => fs.unlink( `test.${ext}` ) );
            });
        });
    });
});

tape('babel compilation engine', test => {
    test.plan(1);

    let es6 = `
        let b = b => b <= 5;
        `;

    fs.writeFile('test.es6.js', es6, function(err){

        if (err) test.fail(err);

        fRender.babel('test.es6.js', 'test.js', function(err, log){

            if(err) test.fail(err);

            fs.readFile('test.js', function(err, file){

                if(err) test.fail(err);

                test.equal(file.toString(), '"use strict";\n\nvar b = function b(_b) {\n        return _b <= 5;\n};', log.message);
                ['js', 'es6.js'].forEach( ext => fs.unlink( `test.${ext}` ) );
            });
        });
    });
});