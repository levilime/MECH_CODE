const assert = require('assert');
const multicaster = require('../src/caster/multicaster');

describe('Multicaster', function() {
    global.log = {push: () => {}};
    describe('Send and Receive Multicast message', function() {
        it('should receive message from eventemitter', function() {
            const mcaster = new multicaster.Multicaster(5000);
            const eventemitter = mcaster.getEventEmitter();
            const topic = 'TESTTOPIC';
            const content = {test: 'TESTCONTENT'};
            eventemitter.on(topic, (x) => {
                mcaster.closeSockets();
                assert.equal(x.test, content.test);
            });
            mcaster.sendMessage(topic, content);
        });
        it('should receive heartbeat message from eventemitter', function() {
            const mcaster = new multicaster.Multicaster(5000);
            const eventemitter = mcaster.getEventEmitter();
            const topic = 'HEARTBEAT';
            const content = {test: 'TESTCONTENT'};
            eventemitter.on(topic, (x) => {
                mcaster.closeSockets();
                assert.equal(x.test, content.test);
                assert.notEqual(x.address, undefined);
                assert.notEqual(x.port, undefined);
            });
            mcaster.sendMessage(topic, content);
        });
    });
});
