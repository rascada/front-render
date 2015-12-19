#! /usr/bin/env node

'use strict';

let render = require('./render.js');
let fs = require('fs');

if (process.argv[4]) { //when 3 arguments render one file - front-render stylus views/main.styl public/main.css
  render[process.argv[2]](process.argv[3], process.argv[4]);
}else {
  switch (process.argv[2]) {
    case 'watch': // watch files from toRender.json
      render.inspect(process.cwd(), true);
      break;
    case '-v':
      render.log(render.version);
      break;
    default: // 0 arguments - one compile from toRender.json
      render.renderJSON();
      break;
  }
}
