'use strict';

let render = require('./render.js'),
    fs = require('fs'), gui;

if(process.argv[4]){ //when 3 arguments render one file - stylus views/main.styl public/main.css
    render[process.argv[2]](process.argv[3], process.argv[4]);
}else {
    switch (process.argv[2]) {
        case "watch": // watch files from toRenderFiles.json
            render.inspect(process.argv[3], true);
            break;
        case "gui": // gui beta on localhost:8080
            render.log('gui mode');
            render.inspect(process.argv[3], true);
            gui = true;
            break;
        default: // 0 arguments - one compile from toRenderFiles.json
            render.render();
            break;
    }
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

