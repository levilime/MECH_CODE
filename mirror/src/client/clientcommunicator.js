module.exports =
    class ClientCommunicator {

        /**
         * Initializes the ClientCommunicator
         * @param actionListener
         * @return {function(*=)}
         */
        constructor (actionListener, port) {
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

            io.on('connection', function(socket) {
                global.log.push('client connection', 'new client with socket id: ' + socket.id + ' has connected');
                // create action when client (dis)connects

                actionListener({type: "SPAWN", identifier: socket.id, data: {type: "player"}});
                // send the id to the client so it knows about it
                // TODO create reasonable secure handshake for this
                socket.emit('id', {id: socket.id});

                socket.on('action', function(action) {
                    // connect action with correct client
                    // create an action for consumption by the converter

                    // TODO need to check here whether the player is on the board, otherwise cannot perform the action

                    actionListener(action);
                });
                socket.on('disconnect', function(socket) {
                    global.log.push('client connection', 'client with socket id: ' + socket.id + ' has disconnected');
                })
            });

            http.listen(port, function() {
                global.log.push('client connection', 'listening on port: ' + port)
            });
            return send;
        }
};
