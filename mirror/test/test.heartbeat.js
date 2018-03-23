const assert = require('assert');
const heartbeat = require('../src/caster/heartbeat');

describe('Heartbeat', function() {
    describe('Add new peer', function() {
        it ('should add peer to the peerList', function() {
            const protocol = new heartbeat.Heartbeat(10);
            const message = {address:'address', port:'port', timestamp: 1};
            protocol.update(2, message);

            assert.equal(protocol.peerList.length, 1);
            assert.equal(protocol.peerList[0].address, message.address);
            assert.equal(protocol.peerList[0].port, message.port);
        });
    });

    describe('Update peer', function() {
        it ('should update timestamp of peer', function() {
            const protocol = new heartbeat.Heartbeat(10);
            const message = {address:'address', port:'port', timestamp: 1};
            protocol.peerList.push({...message, alive:true});
            message.timestamp = 10;

            assert.equal(protocol.peerList[0].timestamp, 1);
            protocol.update(5, message);

            assert.equal(protocol.peerList[0].timestamp, message.timestamp);
        });
    });

    describe('Dead peer', function() {
        it ('should peer to dead', function() {
            const protocol = new heartbeat.Heartbeat(10);
            protocol.peerList.push({address:'address', port:'port', timestamp: 1, alive:true});
            const message = {address:'address1', port:'port', timestamp: 5};

            assert.equal(protocol.peerList[0].alive, true);
            protocol.update(13, message);
            assert.equal(protocol.peerList[0].alive, false);
        });
    });
});
