'use strict';

let fs = require('fs');
let jade = require('jade');

module.exports = function(jadeFile, html, done) {
  if (!done) done = function() {};

  try {
    fs.writeFile(html, jade.renderFile(jadeFile), (err) => {
      if (err) done(this.log(err));
      done(null, this.log(`${html} rendered with 'jade'`));
    });
  } catch (err) {
    done(err);
  }
};
