'use strict';

let fs = require('fs');
let Path = require('path');

let stylus = require('stylus');
let stylusAP = require('autoprefixer-stylus');
let nib = require('nib');

module.exports = function(styl, css, done) {
  if (!done) done = function() {};

  fs.readFile(styl, (err, file) => {
    if (err) done(this.log(err));

    let $$path = Path.join(process.cwd(), styl).split(Path.sep);
    $$path.pop();
    $$path = `"` + $$path.join(Path.sep) + Path.sep;

    file = file.toString().replace(/@import\s+"/gi, `@import ${$$path}`);

    stylus(file)
      .use(nib()).use(stylusAP())
      .render((err, cssFile) => {
        if (err) {
          done(render.log(err));
          return false;
        }

        fs.writeFile(css, cssFile, () =>
          done(null, this.log(`${css} rendered with 'stylus', 'nib', 'auto-prefixer'`)));
      });
  });
};
