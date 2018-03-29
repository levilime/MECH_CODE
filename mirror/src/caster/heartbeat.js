//HeartBeat Protocol class
//rinfo: {address,port}
// peer: {address, port, alive (boolean), timestamp of last message}

class Heartbeat {
    constructor(max_alive_time) {
        this.max_alive_time = max_alive_time; //Depends on frequency of heartbeat messages
        this.peerList = [];
        this.intialPhase = 0;
    }

    /**
     * Beat method of the heartbeat protocol to update the timestamps and alive status of the peers
     * @param currentTime
     * @param message
     */
    update(currentTime, message) {
        const peer = this.peerList.find((peer) => peer.address === message.address && peer.port === message.port);
        if (peer === undefined) {
            const newPeer = {
                address: message.address, port: message.port, alive: true, isRecovering: this.intialPhase < 2,
                timestamp: message.timestamp, playerList: []
            };
            this.peerList.push(newPeer);
            this.checkAlive(currentTime);
            return newPeer;
        }
        if (!peer.alive) {
            peer.alive = true;
            peer.timestamp = message.timestamp;
            peer.playerList = [];
            peer.isRecovering = true;
            //peer has come back alive, so send states to this peer
            return peer;
        }
        peer.alive = true;
        peer.timestamp = message.timestamp;
        peer.isRecovering = false;
        this.checkAlive(currentTime);
        return peer;
    }

    /**
     * Check for each peer in peer list if still alive
     * @param currentTime
     */
    checkAlive(currentTime) {
        //Check if still within alive period
        this.peerList.forEach((peer) => {
            if (Math.abs(currentTime - peer.timestamp) > this.max_alive_time) {
                peer.alive = false;
            }
        });
    }

    /**
     * Return the dead peers
     * @returns {Array.<*>}
     */
    getDeadPeers() {
        return this.peerList.filter((peer) => !peer.alive);
    }

    /**
     * Return the recovering peers
     * @returns {Array.<*>}
     */
    getRecoveringPeers() {
        return this.peerList.filter((peer) => peer.isRecovering);
    }

    /**
     * Update player list of peer
     * @param spawnAction
     */
    updatePlayerList(spawnAction) {
        const peer = this.peerList.find((peer) => peer.address === spawnAction.address && peer.port === spawnAction.port);
        if (peer === undefined || peer.playerList.indexOf(spawnAction.identifier) !== -1) {
            //TODO Failed to find peer that send the message or ID already exists in player list
            global.log.push('heartbeat', 'Failed to find peer that send message or ID already exists in player list');
        }
        peer.playerList.push(spawnAction.identifier);
    }

    /**
     * The content of the heartbeat message is for now just the current time
     * @param currentTime
     * @returns {{timestamp: *}}
     */
    heartbeatMessage(currentTime) {
        if (this.intialPhase < 2) {
            this.intialPhase++;
        }
        return {timestamp: currentTime};
    }

}

module.exports = {Heartbeat};