const assert = require('assert');
const lamport = require('../src/time/lamport');

describe('Lamport', function() {
   describe ('Timestamp with later date than the current time', function() {
       it('should forward the clock to the timestamp + 1', function() {
           const laterTime = Date.now() + 500;
           const lamportTime = lamport.lamportClock(laterTime);
           assert.equal(lamportTime, laterTime + 1);
       });
   });
});
