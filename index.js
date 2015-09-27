'use strict';

let render = require('./render.js'),
    fs = require('fs'), gui;

switch (process.argv[2]) {
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

if (gui) {
    let path = require('path'),
        express = require('express'),
        app = express(),
        server = require('http').createServer(app),
        io = require('socket.io')(server);

    server.listen(8080, function () {
        render.log(`Serwer uruchomiony localhost:${server.address().port}`);
    });

    app.use(express.static('public'));
    app.set('view engine', 'jade');
    app.get('/', function (req, res) {
        res.render('index.jade', {
            dir: render.dirTree
        });
    });

    io.on('connection', function (socket) {
        render.log(`nawiązano połączenie ${socket.id}`);
        render.socket = socket;
        render.log('Witaj');
        socket.emit('dirTree', {dirTree: render.dirTree});
    });

}
render.log(`zapisuje logi do ${render.logs}`, true);

try{
    render.toRender(require('./toRenderFiles'));
}catch(e){
    render.log(e);
    fs.writeFile('toRenderFiles.json', JSON.stringify( [ ['stylus', 'views/main.styl', 'public/main.css'] ] ), function(){
        render.log("toRenderFiles.json created");

        render.toRender(require('./toRenderFiles'));
    });
}

