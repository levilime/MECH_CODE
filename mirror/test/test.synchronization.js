const assert = require('assert');
const seedrandom = require('seedrandom');
const hash = require('object-hash');

const sync = require('../src/synchronization/synchronization');

describe('Trailing State Synchronization', function() {
    global.log = {push: () => {}};
   describe('Add Action on time', function() {
       it('should add action to all trailing states', function() {
          const synchronization = new sync.Synchronization(1,1,6,2,10);
          const action = {type: "SPAWN", actionID: '0', identifier: "player1", data: {objectType: "player"}, timestamp: 1};

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
            const action = {type: "SPAWN", actionID: '0', identifier: "player1", data: {objectType: "player"}, timestamp: 1};

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
            const action = {type: "SPAWN", actionID: '0', identifier: "player1", data: {objectType: "player"}, timestamp: 1};
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

    describe('One Trailing State Execute action', function() {
        it('should let only one trailing state execute action', function() {
            const synchronization = new sync.Synchronization(1,1,6,2,10);
            const action = {type: "SPAWN", actionID: '0', identifier: "player1", data: {objectType: "player"}, timestamp: 1};
            synchronization.addAction(15, action);

            assert.equal(synchronization.states[0].actions.length, 1);
            assert.equal(synchronization.states[1].actions.length, 1);
            assert.equal(synchronization.execute(16), true);
            assert.equal(synchronization.states[0].actions.length, 0);
            assert.equal(synchronization.states[1].actions.length, 1);
            assert.equal(synchronization.states[0].executedActions.length, 1);
        });
    });

    describe('Execute actions with Rollback', function() {
        it('should execute actions in all trailing states', function() {
            const synchronization = new sync.Synchronization(1,1,6,2,10);
            const action = {type: "SPAWN", actionID: '0', identifier: "player1", data: {objectType: "player"}, timestamp: 1};
            synchronization.addAction(15, action);
            synchronization.execute(16);
            synchronization.states[0].state.objects['player1'].position = {x:-1, y:-1};
            synchronization.states[0].executedActions[0].effect = hash(synchronization.states[0].state);

            assert.equal(synchronization.states[1].actions.length, 1);
            assert.equal(synchronization.execute(25), false);
            assert.equal(synchronization.states[1].actions.length, 0);
            assert.equal(synchronization.states[1].executedActions.length, 0);
            const actualPos = synchronization.states[0].state.objects['player1'].position;
            const truePos = synchronization.states[1].state.objects['player1'].position;
            assert.equal(actualPos.x, truePos.x);
            assert.equal(actualPos.y, truePos.y);
        });
    });

    describe('Execute actions after Rollback', function() {
        it('should execute actions in all trailing states', function() {
            const synchronization = new sync.Synchronization(2,2,6,2,10);
            const action = {type: "SPAWN", actionID: '0', identifier: "player1", actionID: "0", data: {objectType: "player"}, timestamp: 1};
            synchronization.addAction(15, action);
            synchronization.execute(16);
            synchronization.states[0].state.objects['player1'].position = {x:-1, y:-1};
            synchronization.states[0].executedActions[0].effect = hash(synchronization.states[0].state);
            synchronization.execute(25);
            const action2 = {type: "SPAWN", actionID: '1', identifier: "player2", actionID: "1", data: {objectType: "player"}, timestamp: 10};
            synchronization.addAction(26, action2);
            assert.equal(synchronization.execute(27), true);
            assert.equal(Object.keys(synchronization.states[0].state.objects).length, 2);
            assert.equal(Object.keys(synchronization.states[1].state.objects).length, 1);
        });
    });

    describe('Remove players from player list', function() {
        it('should remove player2 from the player list', function() {
            const synchronization = new sync.Synchronization(2,2,6,2,10);
            const action = {type: "SPAWN", actionID: '0', identifier: "player1", data: {objectType: "player"}, timestamp: 1};
            const action2 = {type: "SPAWN", actionID: '1', identifier: "player2", data: {objectType: "player"}, timestamp: 2};
            synchronization.addAction(15, action);
            synchronization.addAction(15, action2);
            synchronization.execute(23);

            assert.equal(Object.keys(synchronization.states[0].state.objects).length, 2);
            assert.equal(Object.keys(synchronization.states[1].state.objects).length, 2);
            synchronization.removePlayers([action2.identifier]);
            assert.equal(Object.keys(synchronization.states[0].state.objects)[0], action.identifier);
            assert.equal(Object.keys(synchronization.states[1].state.objects)[0], action.identifier);
        });
    });

    describe('Synchronization has restarted', function() {
        it('should recover from the given trailing states', function() {
            const synchronization = new sync.Synchronization(2,2,6,2,10);
            const action = {type: "SPAWN", actionID: '0', identifier: "player1", data: {objectType: "player"}, timestamp: 1};
            const action2 = {type: "SPAWN", actionID: '1', identifier: "player2", data: {objectType: "player"}, timestamp: 20};
            synchronization.addAction(10, action);
            synchronization.addAction(18, action2);
            synchronization.execute(19);

            const trailingstates =  synchronization.states.map((ts) => {
                return {...ts, state:{board: ts.state.board, objects: ts.state.objects}, seed: ts.state.seed()};
            });
            const recoveryMessage = {states:trailingstates};

            const restarted = new sync.Synchronization(2,2,6,2,10);
            const action3 = {type: "SPAWN", actionID: '2' ,identifier: "player3", data: {objectType: "player"}, timestamp: 1};
            synchronization.addAction(10, action3);
            synchronization.addAction(17, action2);

            restarted.recover(19, recoveryMessage);
            assert.equal(Object.keys(restarted.states[0].state.objects).length, 2);
            assert.equal(restarted.states[0].actions.length, 1);
            assert.equal(restarted.states[0].executedActions.length, 2);
        });
    });
});