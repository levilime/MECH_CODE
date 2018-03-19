const assert = require('assert');
const seedrandom = require('seedrandom');

const board = require('../src/gamelogic/board');

describe('Board logic', function() {
    describe('place Object', function() {
        it('should place an object', function() {
            const state = {
                board : {
                    sizeX: 1,
                    sizeY: 1
                },
                objects: {},
                seed: 6
            };
            const player = {id: "player1"};
            const newState = board.placeObject(state, {x: 0, y: 0}, player);
            assert.equal(newState.objects["player1"].id, player.id);
        });
    });
    describe('remove Object', function() {
        it('should remove an object', function() {
            const player = {id: "player1"};
            const state = {
                board : {
                    sizeX: 1,
                    sizeY: 1
                },
                objects: {[player.id] :player},
                seed: 6
            };
            const newState = board.removeObject(state, player);
            assert(!Object.keys(newState.objects).length);
        });
    });
    describe('move Object', function() {
        it('should move an object', function() {
            const player = {id: "player1", position: {x: 0, y: 0}};
            const state = {
                board : {
                    sizeX: 2,
                    sizeY: 1
                },
                objects: {[player.id] :player},
                seed: 6
            };
            const newState = board.moveObject(state, player, "right");
            assert.equal(newState.objects[player.id].position.x, 1);
        });
    });
    describe('find random spot', function() {
        it('should find a free position', function() {
            const player = {id: "player1", position: {x: 0, y: 0}};
            const state = {
                board : {
                    sizeX: 2,
                    sizeY: 1
                },
                objects: {[player.id] :player},
                seed: 6
            };
            seedrandom(state.seed, {global: true});
            const position = board.findFreeSpot(state);
            assert.deepEqual(position, {x: 1, y: 0});
        });
        it('should find a free position', function() {
            const player = {id: "player1", position: {x: 0, y: 0}};
            const player1 = {id: "player2", position: {x: 0, y: 1}};
            const player2 = {id: "player3", position: {x: 1, y: 0}};
            const state = {
                board : {
                    sizeX: 2,
                    sizeY: 2
                },
                objects: {[player.id] :player, [player1.id]: player1, [player2.id]: player2},
                seed: 6
            };
            seedrandom(state.seed, {global: true});
            const position = board.findFreeSpot(state);
            assert.deepEqual(position, {x: 1, y: 1});
        });
    });
    describe('attack', function() {
        it('should attack a monster', function() {
            const player = {id: "player", type: "player", position: {x: 0, y: 0}, health: 100, ap: 20};
            const monster = {id: "monster", type: "monster", position: {x: 1, y: 0, health: 80, ap:20}};
            const state = {
                board : {
                    sizeX: 2,
                    sizeY: 1
                },
                objects: {[player.id] :player, [monster.id]: monster},
                seed: 6
            };
            const position = board.attack(state, player, monster);
            const newState = Object.assign({}, state);
            newState.objects.monster.health = 200 - 20;
            assert.deepEqual(state, newState);
        });
    });
    describe('heal', function() {
        it('should heal another player', function() {
            const player = {id: "player1", type: "player", position: {x: 0, y: 0}, health: 100, ap: 20};
            const player2 = {id: "player2", type: "player", position: {x: 1, y: 0, health: 80, ap:20}};
            const state = {
                board : {
                    sizeX: 2,
                    sizeY: 1
                },
                objects: {[player.id] :player, [player2.id]: player2},
                seed: 6
            };
            const position = board.heal(state, player, player2);
            const newState = Object.assign({}, state);
            newState.objects.player2.health = 80 + 20;
            assert.deepEqual(state, newState);
        });
    });
});