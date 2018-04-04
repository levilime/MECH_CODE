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
                address: message.address, port: message.port, alive: true, isRecovering: this.intialPhase >= 2,
                timestamp: message.timestamp, playerList: []
            };
            global.log.push('heartbeat', 'add new peer to the peerList: ' + JSON.stringify(newPeer));
            this.peerList.push(newPeer);
            this.checkAlive(currentTime);
            return newPeer;
        }
        if (!peer.alive) {
            peer.playerList = [];
            peer.isRecovering = true;
            //peer has come back alive, so send states to this peer
        }
        peer.alive = true;
        peer.timestamp = message.timestamp;
        this.checkAlive(currentTime);
        return peer;
    }

    /**
     * Check new or was dead (checking if it needs a recovery message)
     * @param message
     * @returns {boolean}
     */
    checkNewOrDead(message) {
        const peer = this.peerList.find((peer) => peer.address === message.address && peer.port === message.port);
        return peer === undefined || !peer.alive;
    }

    /**
     * Check for each peer in peer list if still alive
     * @param currentTime
     */
    checkAlive(currentTime) {
        //Check if still within alive period
        this.peerList.forEach((peer) => {
            if (Math.abs(currentTime - peer.timestamp) > this.max_alive_time && peer.alive) {
                peer.alive = false;
                global.log.push('heartbeat', 'set peer to dead in the peerList: ' + JSON.stringify(peer));
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
            global.log.push('heartbeat', 'Failed to find peer that send message or ID already exists in player list' + JSON.stringify(spawnAction));
            return;
        }
        global.log.push('heartbeat', 'Connected new player to playerlist of peer: ' + JSON.stringify(peer));
        peer.playerList.push(spawnAction.identifier);
    }

    /**
     * The content of the heartbeat message is for now just the current time
     * @param currentTime
     * @returns {{timestamp: *}}
     */
    heartbeatMessage(currentTime) {
        global.log.push('heartbeat', 'send a heartbeat message');
        if (this.intialPhase < 2) {
            this.intialPhase++;
        }
        return {timestamp: currentTime};
    }

}

module.exports = {Heartbeat};