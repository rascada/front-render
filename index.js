'use strict';

let render = require('./render.js'),    
    express = require('express'),    
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server);

server.listen(80, function(){
		render.log(`Serwer uruchomiony ${server.address().port}`); 
		render.log(`zapisuje logi do ${render.logs}`, true);
});

app.use(express.static('public'));
app.set('view engine', 'jade');
app.get('/', function(req, res){
		res.render('index.jade');
});

io.on('connection', function (socket) {
  render.log(`nawiązano połączenie ${socket.id}`);    
});