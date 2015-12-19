# Front-render
front end assets compiler

## Installation

```sh
$ git clone https://github.com/rascada/front-render
$ cd front-render
~/front-render$ npm run init
# or
$ npm i -g front-render
```


## Available engines:
- [babel](https://babeljs.io/)
- [stylus](https://learnboost.github.io/stylus/)
- [jade](http://jade-lang.com/)

## rendering single file

```sh
# front-render [engine] [input] [output]
$ front-render babel views/main.js public/main.js
$ [10/12/2015, 2:09:03 AM] [front-render] public/main.js rendered with 'babel'
$ front-render stylus main.styl main.css
_
```


## toRender.json

#### Setting up file with predefined files to render

```json
[
    [ "stylus", "views/main.styl", "public/main.css" ],
	[ "babel", "views/main.js", "public/main.js" ],
]
```

#### and using it

```sh
# one compilation files listen in toRenderFiles.json
$ front-render
$ [10/12/2015, 2:04:20 AM] [front-render] looking for toRender.json in working directory
```
```sh
# compilation and watching files from toRenderFiles.json
$ front-render watch
_
```

## [up-render](https://github.com/rascada/up-render)
### a.k.a front-render-cli
Work in progress
