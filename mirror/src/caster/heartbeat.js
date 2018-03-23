//HeartBeat Protocol class
//rinfo: {address,port}
// peer: {address, port, alive (boolean), timestamp of last message}

class Heartbeat {
    constructor(max_alive_time) {
        this.max_alive_time = max_alive_time; //Depends on frequency of heartbeat messages
        this.peerList = [];
    }

    /**
     * Beat method of the heartbeat protocol to update the timestamps and alive status of the peers
     * @param currentTime
     * @param message
     */
    update(currentTime, message) {
        const peer = this.peerList.find((peer) => peer.address === message.address && peer.port === message.port);
        if (peer === undefined) {
            this.peerList.push({address: message.address, port: message.port, alive: true, timestamp: message.timestamp});
        } else {
            if (!peer.alive) {
                //TODO peer has come back alive, so send states to this peer
            }
            peer.alive = true;
            peer.timestamp = message.timestamp;
        }

        //Check if still within alive period
        this.peerList.forEach((peer) => {
            if (Math.abs(currentTime - peer.timestamp) >  this.max_alive_time) {
                peer.alive = false;
            }
        });

    }

    /**
     * The content of the heartbeat message is for now just the current time
     * @param currentTime
     * @returns {{timestamp: *}}
     */
    heartbeatMessage(currentTime) {
        return {timestamp:currentTime};
    }

}

module.exports = {Heartbeat};