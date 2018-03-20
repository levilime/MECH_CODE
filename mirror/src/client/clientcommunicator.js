export class ClientCommunicator {

    constructor () {
        const io = require('socket.io')();
        io.on('connection', function(client){
            console.log('ok');
        });
        io.listen(3000);
    }
}