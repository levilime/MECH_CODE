module.exports =
    class ClientCommunicator {

        constructor (actionListener) {
            const app = require('express')();
            const http = require('http').Server(app);
            const io = require('socket.io')(http);

            const send = (state) => {
                // broadcast state to all listening clients
                io.emit(state);
            };

            app.get('/', function(req, res){
                res.sendFile(__dirname + '/index.html');
            });

            io.on('connection', function(socket){
                // create action when client (dis)connects
                // actionListener(msg);
                socket.on('chat message', function(msg){
                    io.emit('chat message', msg);
                });
                socket.on('action', function(action) {
                    // connect action with correct client
                    // create an action for consumption by the converter
                    actionListener(action);
                });
            });

            http.listen(3000, function() {
                console.log('listening on *:3000');
            });
            return send;
        }
};