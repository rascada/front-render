'use strict';

let render = require('./render.js'),
    fs = require('fs'), gui,
    inspectFolder = '';

switch (process.argv[2]) {
    case "watch":
        render.log('watch mode');
        render.inspect(inspectFolder);
        break;
    case "gui":
        render.log('gui mode');
        render.inspect(inspectFolder);
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
        render.socket = socket;
        render.log(`nawiązano połączenie ${socket.id}`);
        socket.emit('dirTree', {dirTree: render.dirTree});
    });

}

try{
    render.toRender(require('./toRenderFiles'));
}catch(e){
    render.log(e);
    render.log('Nie odnaleziono pliku toRenderFiles.json');
    fs.writeFile('toRenderFiles.json', JSON.stringify( [ ['stylus', 'views/main.styl', 'public/main.css'] ] ), function(){
        render.log("toRenderFiles.json created");

        render.toRender(require('./toRenderFiles'));
    });
}

