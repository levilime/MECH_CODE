const dgram = require('dgram');

const BROADCAST_ADDRESS = '255.255.255.255';

//TODO logging of actions

class Multicaster{

    constructor(port) {
        this.port = port;
        this.receiver = this.initReceiver();
        this.sender = this.initSender();
    }

    /**
     * Initialize the Receiver UDP socket on the broadcast address on the given port
     * @returns {*}
     */
    initReceiver() {
        const receiver = dgram.createSocket({type:'udp4', reuseAddr:true});

        receiver.on('message', (msg, rinfo) => {
            console.log('Receiver got: ' + msg + ' from ' + rinfo.address + ':' + rinfo.port);
        });

        receiver.on('listening', () => {
            const address = receiver.address();
            console.log('Receiver listening ' + address.address + ':' + address.port);
        });

        receiver.on('error', (error) => {
            console.log('Receiver error: ' + error);
        });

        receiver.on('close', () => {
            console.log('Receiver closed');
        });

        receiver.bind(this.port);
        return receiver;
    }

    /**
     * Initialize the Sender UDP socket on a random port and address
     * @returns {*}
     */
    initSender() {
        const sender = dgram.createSocket('udp4');
        sender.on('listening', () => {
            sender.setBroadcast(true);
            console.log('')
        });

        sender.on('error', (error) => {
            console.log('Receiver error: ' + error);
        });

        sender.on('close', () => {
            console.log('Receiver closed');
        });

        sender.bind();
        return sender;
    }

    /**
     * Use the Sender socket to broadcast the message on the Broadcast Address and given port
     * @param msg
     */
    sendMessage(msg) {
        const message = new Buffer(msg);
        this.sender.send(message, 0, message.length, this.port, BROADCAST_ADDRESS);
    }

    closeSockets() {
        this.receiver.close();
        this.sender.close();
    }
}

