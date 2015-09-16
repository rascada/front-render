'use strict';

let render = require('./render.js'),
	fs = require('fs'),
    path = require('path'),
	express = require('express'),    
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io')(server);

server.listen(80, function(){
	render.log(`Serwer uruchomiony ${server.address().port}`); 
	render.log(`zapisuje logi do ${render.logs}`, true);
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
});

render.watch(
	render.stylus,
	'views/main.styl',
	'public/main.css'
);