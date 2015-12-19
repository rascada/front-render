'use strict';

let fs = require('fs');
let tape = require('tape');
let fRender = require('../render');
let unlink = ext => fs.unlink(`test.${ext}`);

fRender.logs = false;

tape('stylus compilation engine', test => {
  test.plan(1);

  let styl = `
      body
          background red + 10%
      `;

  fs.writeFile('test.styl', styl, function(err) {
    if (err) test.fail(err);

    fRender.stylus('test.styl', 'test.css', function(err, log) {
      if (err) test.fail(err);

      fs.readFile('test.css', function(err, file) {

        if (err) test.fail(err);

        test.equal(file.toString(), 'body {\n  background: #ff1a1a;\n}\n', log.message);
        ['css', 'styl'].forEach(unlink);
      });
    });
  });
});

tape('babel compilation engine', test => {
  test.plan(1);

  let es6 = `
      let b = b => b <= 5;
      `;

  fs.writeFile('test.es6.js', es6, function(err) {

    if (err) test.fail(err);

    fRender.babel('test.es6.js', 'test.js', function(err, log) {
      if (err) test.fail(err);

      fs.readFile('test.js', function(err, file) {
        if (err) test.fail(err);

        test.equal(file.toString(), '"use strict";\n\nvar b = function b(_b) {\n      return _b <= 5;\n};', log.message);
        ['js', 'es6.js'].forEach(unlink);
      });
    });
  });
});

tape('jade compilation engine', test => {
  test.plan(1);

  let jade = 'doctype html\nbody\n   h1 test';

  fs.writeFile('test.jade', jade, function(err) {
    if (err) test.fail(err);

    fRender.jade('test.jade', 'test.html', function(err, log) {
      if (err) test.fail(err);

      fs.readFile('test.html', function(err, file) {
        if (err) test.fail(err);

        test.equal(file.toString(), '<!DOCTYPE html><body><h1>test</h1></body>', log.message);
        ['jade', 'html'].forEach(unlink);
      });
    });
  });
});

tape(`jade when file don't exist`, test => {
  test.plan(1);

  fRender.jade('err.jade', 'err.html', function(err, log) {
    if (err) test.pass(err);
    else test.fail(log);
  });
});
