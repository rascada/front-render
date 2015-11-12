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