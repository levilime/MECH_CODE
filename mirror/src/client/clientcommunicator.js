

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

            io.on('connection', function(socket){
                log.push('client connection', 'new client with socket id: ' + socket.id + ' has connected');
                // create action when client (dis)connects
                actionListener({type: "SPAWN", identifier: socket.id, data: {type: "player"}});
                // send the id to the client so it knows about it
                socket.emit('id', {id: socket.id});

                // FIXME this emitting can be removed because state is just
                // pushed by normal flow of leading state
                // socket.emit('state',{state: {sizeX: 25, sizeY: 25, objects:{}}});

                socket.on('action', function(action) {
                    // connect action with correct client
                    // create an action for consumption by the converter
                    actionListener(action);
                });
            });

            http.listen(port, function() {
                global.log.push('client socket', 'listening on port: ' + port)
            });
            return send;
        }
};