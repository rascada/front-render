'use strict';

let fs = require('fs');
let babel = require('babel');

module.exports = function(es6, js, done) {
  babel.transformFile(es6, (err, babel) => {
    if (!done) done = function() {};

    if (err) {
      done(this.log(err));
      return false;
    }

    fs.writeFile(js, babel.code, {
      comments: false,
      compact: true,
      stage: 0,
    }, (err) => {
      if (err) done(this.log(err));
      done(null, this.log(`${js} rendered with 'babel'`));
    });
  });
};
