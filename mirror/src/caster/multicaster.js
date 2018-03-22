const dgram = require('dgram');
const events = require('events');
const BROADCAST_ADDRESS = '255.255.255.255';

//TODO logging of actions
// Message: {topic/type, content}

class Multicaster{

    constructor(port) {
        this.port = port;
        this.receiver = this.initReceiver();
        this.sender = this.initSender();
        this.eventEmitter = new events.EventEmitter();
    }

    /**
     * Initialize the Receiver UDP socket on the broadcast address on the given port
     * @returns {*}
     */
    initReceiver() {
        const receiver = dgram.createSocket({type:'udp4', reuseAddr:true});

        receiver.on('message', (msg, rinfo) => {
            this.receiveMessage(msg, rinfo);
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
     * Emit the topic and the content of the message
     * For heartbeat messages, add the sender information
     * @param msg
     * @param rinfo
     */
    receiveMessage(msg, rinfo) {
        const parsedMsg = JSON.parse(msg.toString('utf8'));
        if (parsedMsg.topic === 'HEARTBEAT') {
            const content = parsedMsg.content;
            content.rinfo = rinfo;
            this.eventEmitter.emit(parsedMsg.topic, content);
        } else {
            this.eventEmitter.emit(parsedMsg.topic, parsedMsg.content);
        }
    }

    /**
     * Initialize the Sender UDP socket on a random port and address
     * @returns {*}
     */
    initSender() {
        const sender = dgram.createSocket('udp4');
        sender.on('listening', () => {
            sender.setBroadcast(true);
            console.log('Sender listening');
        });

        sender.on('error', (error) => {
            console.log('Sender error: ' + error);
        });

        sender.on('close', () => {
            console.log('Sender closed');
        });

        sender.bind();
        return sender;
    }

    /**
     * Use the Sender socket to broadcast the message on the Broadcast Address and given port
     * @param topic
     * @param content
     */
    sendMessage(topic, content) {
        const message = new Buffer(JSON.stringify({topic, content}));
        this.sender.send(message, 0, message.length, this.port, BROADCAST_ADDRESS);
    }

    closeSockets() {
        this.receiver.close();
        this.sender.close();
    }

    getEventEmitter() {
        return this.eventEmitter;
    }
}

module.exports = {Multicaster};
