'use strict';

let render = require('./render.js'),
	gui;

switch(process.argv[2]){
	case "watch":
		render.log('watch mode');
		render.watcher = true;
		break;
	case "gui":
		render.log('gui mode')
		render.watcher = true;
		gui = true;
		break;
	default:
		render.log('Just one compile');
		break;
}

if(gui){
	let	fs = require('fs'),
		path = require('path'),
		express = require('express'),
		app = express(),
		server = require('http').createServer(app),
		io = require('socket.io')(server);

	server.listen(80, function(){
		render.log(`Serwer uruchomiony localhost:${server.address().port}`);
	});

	let dirTree = {};
	fs.readdir(__dirname, function(err, files){
		let isFolder = (files, prevFile, prevPer) =>{
			files.forEach(function(file){
				let dir = path.join(prevFile, file);
				if( fs.statSync(dir).isDirectory() ){
					if(!prevPer.hasOwnProperty(file)) prevPer[file] = {};
					isFolder(fs.readdirSync(dir), dir, prevPer[file]);
				}else
					prevPer[file] = dir;
			});
		};
		isFolder(files, __dirname, dirTree);
	});

	app.use(express.static('public'));
	app.set('view engine', 'jade');
	app.get('/', function(req, res){
		res.render('index.jade', {
			dir: dirTree
		});
	});

	io.on('connection', function (socket) {
		render.log(`nawiązano połączenie ${socket.id}`);
		render.socket = socket;
		render.log('Witaj')
		socket.emit('dirTree', {dirTree: dirTree});
	});

}
render.log(`zapisuje logi do ${render.logs}`, true);
render.toRender(require('./toRenderFiles'));