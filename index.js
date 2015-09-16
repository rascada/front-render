'use strict';

let render = require('./render.js'),    
    express = require('express'),    
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server);

server.listen(80, function(){
	render.log(`Serwer uruchomiony ${server.address().port}`); 
});

app.get('/', function(req, res){
  res.send('renderjs');
});

io.on('connection', function (socket) {
  render.log(`nawiązano połączenie ${socket.id}`);    
});