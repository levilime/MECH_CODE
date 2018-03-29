const assert = require('assert');

const trailingstate = require('../src/synchronization/trailingstate');

describe('Trailing State Logic', function() {
   describe('Add Action with Empty List', function() {
      it('should add to list', function() {
            const state = new trailingstate.TrailingState(1,1,6,0);
            const action = {type: "SPAWN", actionID: '0', identifier: "player1", data: {objectType: "player"}, timestamp: 1};
            assert.equal(state.actions.length, 0);
            state.addAction(action);
            assert.equal(state.actions.length, 1);
            assert.equal(state.actions[0].identifier, action.identifier);
      });
   });

    describe('Add Action to List with 1 element', function() {
        it('should add to head of list', function() {
            const state = new trailingstate.TrailingState(1,1,6,0);
            const action = {type: "SPAWN", actionID: "1",  identifier: "player1", data: {objectType: "player"}, timestamp: 1};
            const action2 = {type: "SPAWN", actionID: "2", identifier: "player2", data: {objectType: "player"}, timestamp: 0};
            state.actions.push(action);

            assert.equal(state.actions.length, 1);
            state.addAction(action2);
            assert.equal(state.actions.length, 2);
            assert.equal(state.actions[0].identifier, action2.identifier);
        });
    });

    describe('Add Action to List with 2 elements', function() {
        it('should add to middle of list', function() {
            const state = new trailingstate.TrailingState(1,1,6,0);
            const action = {type: "SPAWN", actionID: 0, identifier: "player1", data: {objectType: "player"}, timestamp: 2};
            const action2 = {type: "SPAWN", actionID: 1, identifier: "player2", data: {objectType: "player"}, timestamp: 0};
            const action3 = {type: "SPAWN", actionID: 2, identifier: "player3", data: {objectType: "player"}, timestamp: 1};
            state.actions.unshift(action);
            state.actions.unshift(action2);

            assert.equal(state.actions.length, 2);
            state.addAction(action3);
            assert.equal(state.actions.length, 3);
            assert.equal(state.actions[1].identifier, action3.identifier);
        });
    });

    describe('Add duplicate Action to List', function() {
        it('should add to middle of list', function() {
            const state = new trailingstate.TrailingState(1,1,6,0);
            const action = {type: "SPAWN", identifier: "player1", data: {objectType: "player"}, timestamp: 2};
            state.actions.unshift(action);

            assert.equal(state.actions.length, 1);
            state.addAction(action);
            assert.equal(state.actions.length, 1);
        });
    });

    describe('Execute Action', function() {
        it('should execute and put in executedActions', function() {
            const state = new trailingstate.TrailingState(1,1,6,0);
            const action = {type: "SPAWN", identifier: "player1", data: {objectType: "player"}, timestamp: 2};
            // seedrandom(state.seed, {global: true});
            state.actions.push(action);

            assert.equal(state.actions.length, 1);
            state.executeActions(5);
            assert.equal(state.actions.length, 0);
            assert.equal(state.executedActions.length, 1);
            assert.equal(state.executedActions[0].action.identifier, action.identifier);
        });
    });

    describe('Execute on time Actions', function() {
        it('should execute only first action', function() {
            const state = new trailingstate.TrailingState(1,1,6,0);
            const action = {type: "SPAWN", actionID: '0', identifier: "player1", data: {objectType: "player"}, timestamp: 2};
            const action2 = {type: "SPAWN", actionID: '1', identifier: "player2", data: {objectType: "player"}, timestamp: 6};
            state.actions.push(action);
            state.actions.push(action2);

            assert.equal(state.actions.length, 2);
            state.executeActions(5);
            assert.equal(state.actions.length, 1);
            assert.equal(state.executedActions.length, 1);
            assert.equal(state.executedActions[0].action.identifier, action.identifier);
        });
    });

    describe('Remove list from ExecutedActions list', function() {
        it('should remove list from executedActions', function() {
            const state = new trailingstate.TrailingState(1,1,6,0);
            const action = {type: "SPAWN", actionID: 0, identifier: "player1", data: {objectType: "player"}, timestamp: 2};
            const action2 = {type: "SPAWN", actionID: 1, identifier: "player2", data: {objectType: "player"}, timestamp: 6};
            state.executedActions.push({action:action, effect:''});
            state.executedActions.push({action:action2, effect:''});

            assert.equal(state.executedActions.length, 2);
            state.removeExecutedActions([{action:action, effect:''}]);
            assert.equal(state.executedActions.length, 1);
            assert.equal(state.executedActions[0].action.identifier, action2.identifier);
        });
    });
});
