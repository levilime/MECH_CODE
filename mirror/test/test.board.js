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
    describe('find object by position', function() {
        it('should not find an object', function() {
            const state = {
                board : {
                    sizeX: 1,
                    sizeY: 1
                },
                objects: {},
                seed: 6
            };
            const object = board.findObjectByPosition(state, {x: 0, y: 0});
            assert.equal(object, undefined)
        });
        it('should find an object', function() {
            const player = {id: "player", position: {x: 0, y: 0}};
            const state = {
                board : {
                    sizeX: 1,
                    sizeY: 1
                },
                objects: {player},
                seed: 6
            };
            const object = board.findObjectByPosition(state, {x: 0, y: 0});
            assert.deepEqual(object, player)
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
            const position = board.findFreeSpot(state, Math.random);
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
            const position = board.findFreeSpot(state, Math.random);
            assert.deepEqual(position, {x: 1, y: 1});
        });
    });
    describe('attack', function() {
        it('attack function handles the attacking between two objects', function() {
            const player = {id: "player", type: "player", position: {x: 0, y: 0}, health: 100, ap: 20};
            const monster = {id: "monster", type: "monster", position: {x: 1, y: 0}, health: 100, ap:20};
            const state = {
                board : {
                    sizeX: 2,
                    sizeY: 1
                },
                objects: {[player.id] :player, [monster.id]: monster},
                seed: 6
            };
            const nextState = board.attack(state, player, monster);
            const newState = Object.assign({}, state);
            newState.objects.monster.health = state.objects.monster.health - state.objects.player.ap;
            assert.deepEqual(nextState, newState);
        });
    });
    describe('heal', function() {
        it('heal function handles the healing between two objects', function() {
            const player = {id: "player1", type: "player", position: {x: 0, y: 0}, health: 100, ap: 20};
            const player2 = {id: "player2", type: "player", position: {x: 1, y: 0}, health: 80, ap:20};
            const state = {
                board : {
                    sizeX: 2,
                    sizeY: 1
                },
                objects: {[player.id] :player, [player2.id]: player2},
                seed: 6
            };
            const nextState = board.heal(state, player, player2);
            const newState = Object.assign({}, state);
            newState.objects.player2.health = state.objects.player2.health + state.objects.player1.ap;
            assert.deepEqual(nextState, newState);
        });
    });
    describe('find closest object', function() {
        it('find nearest player', function() {
            const player = {id: "player1", type: "player", position: {x: 0, y: 0}, health: 100, ap: 20};
            const player2 = {id: "player2", type: "player", position: {x: 1, y: 0}, health: 80, ap:20};
            const state = {
                board : {
                    sizeX: 2,
                    sizeY: 1
                },
                objects: {[player.id] :player, [player2.id]: player2},
                seed: 6
            };
            const closestPlayer = board.findClosestObject(state, player,
                (current) => current.type === player.type);
            assert.deepEqual(player2, closestPlayer);
        });
        it('find nearest player that is low on health', function() {
            const player = {id: "player1", type: "player", position: {x: 0, y: 0}, health: 100, ap: 20};
            const player2 = {id: "player2", type: "player", position: {x: 1, y: 0}, health: 1, ap:20};
            const state = {
                board : {
                    sizeX: 2,
                    sizeY: 1
                },
                objects: {[player.id] :player, [player2.id]: player2},
                seed: 6
            };
            const closestPlayer = board.findClosestObject(state, player, (current) => current.type === player.type && current.health < 10);
            assert.deepEqual(player2, closestPlayer);
        });
        it('find nearest monster', function() {
            const player = {id: "player1", type: "player", position: {x: 0, y: 0}, health: 100, ap: 20};
            const player2 = {id: "player2", type: "player", position: {x: 1, y: 0}, health: 1, ap:20};
            const monster = {id: "monster", type: "monster", position: {x: 2, y: 0}, health: 1000, ap:20};
            const state = {
                board : {
                    sizeX: 3,
                    sizeY: 1
                },
                objects: {[player.id] :player, [player2.id]: player2, monster},
                seed: 6
            };
            const closestMonster = board.findClosestObject(state, player, (current) => current.type !== player.type);
            assert.deepEqual(monster, closestMonster);
        });
    });
});