const assert = require('assert');
const seedrandom = require('seedrandom');

const converter = require('../src/gamelogic/stateconverter');

describe('Converter logic', function() {
    describe('spawn Object', function() {
        it('should spawn an object', function() {
            const state = {
                board : {
                    sizeX: 1,
                    sizeY: 1
                },
                objects: {},
                seed: 6
            };
            seedrandom(state.seed, {global: true});
            const action = {type: "SPAWN", identifier: "player1", data: {objectType: "player"}};
            const newState = converter(state, action);
            assert.equal(newState.objects["player1"].id, "player1");
        });
    });
    describe('move Object', function() {
        it('should move an object', function() {
            const state = {
                board : {
                    sizeX: 2,
                    sizeY: 1
                },
                objects:  { player1: { id: 'player1', health: 11, ap: 9, position: {x: 0, y: 0} } },
                seed: 6
            };
            seedrandom(state.seed, {global: true});
            const action = {type: "MOVE", identifier: "player1", data: {objectType: "player", direction: "right"}};
            const newState = converter(state, action);
            console.log(newState);
            assert.equal(newState.objects["player1"].position.x, 1);
        });
    });
});