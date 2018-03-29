module.exports =
    class ClientCommunicator {

        /**
         * Initializes the ClientCommunicator
         * @param actionListener
         * @return {function(*=)}
         */
        constructor (actionListener, port, actionTimeoutInterval) {
            const app = require('express')();
            const http = require('http').Server(app);
            const io = require('socket.io')(http);

            const timeoutSockets = {};

            const send = (state) => {
                // broadcast state to all listening clients
                io.emit('state', state);
            };

            app.get('/', function(req, res){
                res.sendFile(__dirname + '/index.html');
            });

            io.on('connection', function(socket) {
                global.log.push('client connection', 'new client with socket id: ' + socket.id + ' has connected');
                // create action when client (dis)connects

                actionListener({type: "SPAWN", identifier: socket.id, data: {objectType: "player"}});
                // send the id to the client so it knows about it
                // TODO create reasonable secure handshake for this
                socket.emit('id', {id: socket.id});

                socket.on('action', function(action) {
                    // connect action with correct client
                    // create an action for consumption by the converter

                    // if the client is on a timeout because it did a previous action,
                    // then don't allow his action
                    if(timeoutSockets[socket.id]) {
                        global.log.push('client connection', 'not processed too soon action of id:' +  socket.id);
                        return;
                    }

                    // put as identifier the socket id, so player is identified by the
                    // socket connection it has
                    actionListener({...action, identifier: socket.id});
                    timeoutSockets[socket.id] = true;
                    setTimeout(() => {
                        delete timeoutSockets[socket.id]
                    }, actionTimeoutInterval);

                });
                socket.on('disconnect', function() {
                    global.log.push('client connection', 'client has disconnected');
                    actionListener({type: "KILL", identifier: socket.id, data: {objectType: "player"}});
                });
            });

            http.listen(port, function() {
                global.log.push('client connection', 'listening on port: ' + port)
            });
            return send;
        }
};
