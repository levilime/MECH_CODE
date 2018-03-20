const assert = require('assert');
const seedrandom = require('seedrandom');

const sync = require('../src/synchronization/synchronization');

describe('Trailing State Synchronization', function() {
   describe('Add Action on time', function() {
       it('should add action to all trailing states', function() {
          const synchronization = new sync.Synchronization(1,1,6,2,10);
          const action = {type: "SPAWN", identifier: "player1", data: {objectType: "player"}, timestamp: 1};

          assert.equal(synchronization.states[0].actions.length, 0);
          assert.equal(synchronization.states[1].actions.length, 0);
          synchronization.addAction(15, action);
          assert.equal(synchronization.states[0].actions.length, 1);
          assert.equal(synchronization.states[1].actions.length, 1);
          assert.equal(synchronization.states[0].actions[0].identifier, action.identifier);
          assert.equal(synchronization.states[1].actions[0].identifier, action.identifier);
       });
   });

   describe('Add Action too late', function() {
        it('should do nothing', function() {
            const synchronization = new sync.Synchronization(1,1,6,2,10);
            const action = {type: "SPAWN", identifier: "player1", data: {objectType: "player"}, timestamp: 1};

            assert.equal(synchronization.states[0].actions.length, 0);
            assert.equal(synchronization.states[1].actions.length, 0);
            synchronization.addAction(22, action);
            assert.equal(synchronization.states[0].actions.length, 0);
            assert.equal(synchronization.states[1].actions.length, 0);
        });
    });

    describe('Execute actions without Rollback', function() {
        it('should execute actions in all trailing states', function() {
            const synchronization = new sync.Synchronization(1,1,6,2,10);
            const action = {type: "SPAWN", identifier: "player1", data: {objectType: "player"}, timestamp: 1};
            seedrandom(synchronization.states[0].seed, {global: true});
            synchronization.addAction(15, action);

            assert.equal(synchronization.states[0].actions.length, 1);
            assert.equal(synchronization.states[1].actions.length, 1);
            assert.equal(synchronization.execute(25), true);
            assert.equal(synchronization.states[0].actions.length, 0);
            assert.equal(synchronization.states[1].actions.length, 0);
            assert.equal(synchronization.states[0].executedActions.length, 0);
            assert.equal(synchronization.states[1].executedActions.length, 0);
        });
    });

    describe('Execute actions with Rollback', function() {
        it('should execute actions in all trailing states', function() {
            const synchronization = new sync.Synchronization(1,1,6,2,10);
            const action = {type: "SPAWN", identifier: "player1", data: {objectType: "player"}, timestamp: 1};
            seedrandom(synchronization.states[0].seed, {global: true});
            synchronization.addAction(15, action);
            synchronization.execute(16);
            synchronization.states[1].state.objects.push({id: "player1", position:{x:0, y:0}});

            assert.equal(synchronization.states[1].actions.length, 1);
            assert.equal(synchronization.execute(25), false);
            assert.equal(synchronization.states[1].actions.length, 0);
            assert.equal(synchronization.states[1].executedActions.length, 0);
        });
    });
});