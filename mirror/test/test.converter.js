const assert = require('assert');
const seedrandom = require('seedrandom');

const converter = require('../src/gamelogic/stateconverter');

describe('Converter logic', function() {
    describe('spawn Object', function() {
        it('should spawn an player', function() {
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
            const newState = converter(state, action, Math.random);
            assert.equal(newState.objects["player1"].id, "player1");
        });
        it('should spawn an monster', function() {
            const state = {
                board : {
                    sizeX: 1,
                    sizeY: 1
                },
                objects: {},
                seed: 6
            };
            seedrandom(state.seed, {global: true});
            const action = {type: "SPAWN", identifier: "monster1", data: {objectType: "monster"}};
            const newState = converter(state, action, Math.random);
            assert.equal(newState.objects["monster1"].id, "monster1");
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
            const newState = converter(state, action, Math.random);
            assert.equal(newState.objects["player1"].position.x, 1);
        });
        it('object cannot move beyond the edge', function() {
            const state = {
                board : {
                    sizeX: 2,
                    sizeY: 1
                },
                objects:  { player1: { id: 'player1', health: 11, ap: 9, position: {x: 0, y: 0} } },
                seed: 6
            };
            seedrandom(state.seed, {global: true});
            const action = {type: "MOVE", identifier: "player1", data: {objectType: "player", direction: "left"}};
            const newState = converter(state, action, Math.random);
            assert.equal(newState.objects["player1"].position.x, 0);
        });
        it('object cannot move where an other object resides', function() {
            const player = { id: 'player', health: 11, ap: 9, position: {x: 0, y: 0} };
            const player2 = { id: 'player2', health: 11, ap: 9, position: {x: 1, y: 0} };
            const state = {
                board : {
                    sizeX: 2,
                    sizeY: 1
                },
                objects:  {player, player2},
                seed: 6
            };
            seedrandom(state.seed, {global: true});
            const action = {type: "MOVE", identifier: "player1", data: {objectType: "player", direction: "right"}};
            const newState = converter(state, action, Math.random);
            assert.equal(newState.objects[player.id].position.x, 0);
        });
    });
    describe('attack Object', function() {
        it('player should attack a monster', function() {
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
                const action = {type: "ATTACK", identifier: player.id};
                const nextState = converter(state, action, Math.random);
                const newState = Object.assign({}, state);
                newState.objects.monster.health = state.objects.monster.health - state.objects.player.ap;
                assert.deepEqual(nextState, newState);
        });
        it('player cannot attack a monster if it is too far away', function() {
            const player = {id: "player", type: "player", position: {x: 0, y: 0}, health: 100, ap: 20};
            const monster = {id: "monster", type: "monster", position: {x: 10, y: 0}, health: 100, ap:20};
            const state = {
                board : {
                    sizeX: 10,
                    sizeY: 1
                },
                objects: {[player.id] :player, [monster.id]: monster},
                seed: 6
            };
            const action = {type: "ATTACK", identifier: player.id};
            const nextState = converter(state, action, Math.random);
            const newState = Object.assign({}, state);
            assert.deepEqual(nextState, newState);
    });
        it('monster should attack a player', function() {
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
            const action = {type: "ATTACK", identifier: monster.id};
            const nextState = converter(state, action, Math.random);
            const newState = JSON.parse(JSON.stringify(state));
            newState.objects.player.health = state.objects.player.health - state.objects.monster.ap;
            assert.deepEqual(nextState, newState);
    });
    it('player cannot attack another player, will not do damage', function() {
        const player1 = {id: "player1", type: "player", position: {x: 0, y: 0}, health: 100, ap: 20};
        const player2 = {id: "player2", type: "player", position: {x: 1, y: 0}, health: 100, ap:20};
        const state = {
            board : {
                sizeX: 2,
                sizeY: 1
            },
            objects: {[player1.id] :player1, [player2.id]: player2},
            seed: 6
        };
        const action = {type: "ATTACK", identifier: player1.id};
        const nextState = converter(state, action, Math.random);
        const newState = Object.assign({}, state);
        assert.deepEqual(nextState, newState);
});
it('monster cannot attack another monster, will not do damage', function() {
    const monster1 = {id: "monster1", type: "monster", position: {x: 0, y: 0}, health: 100, ap: 20};
    const monster2 = {id: "monster", type: "monster", position: {x: 1, y: 0}, health: 100, ap:20};
    const state = {
        board : {
            sizeX: 2,
            sizeY: 1
        },
        objects: {[monster1.id] :monster1, [monster2.id]: monster2},
        seed: 6
    };
    const action = {type: "ATTACK", identifier: monster1.id};
    const nextState = converter(state, action, Math.random);
    const newState = Object.assign({}, state);
    assert.deepEqual(nextState, newState);
});
    });
    describe('heal Object', function() {
        it('player cannot heal a monster', function() {
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
                const action = {type: "HEAL", identifier: player.id};
                const nextState = converter(state, action, Math.random);
                const newState = Object.assign({}, state);
                assert.deepEqual(nextState, newState);
        });
    it('player can heal another player', function() {
        const player1 = {id: "player1", type: "player", position: {x: 0, y: 0}, health: 100, ap: 20};
        const player2 = {id: "player2", type: "player", position: {x: 1, y: 0}, health: 100, ap:20};
        const state = {
            board : {
                sizeX: 2,
                sizeY: 1
            },
            objects: {[player1.id] :player1, [player2.id]: player2},
            seed: 6
        };
        const action = {type: "HEAL", identifier: player1.id};
        const nextState = converter(state, action, Math.random);
        const newState = Object.assign({}, state);
        newState.objects.player2.health = state.objects.player2.health + state.objects.player1.ap;
        assert.deepEqual(nextState, newState);
});
it('player cannot heal another player if he is too far away', function() {
    const player1 = {id: "player1", type: "player", position: {x: 0, y: 0}, health: 100, ap: 20};
    const player2 = {id: "player2", type: "player", position: {x: 10, y: 0}, health: 100, ap:20};
    const state = {
        board : {
            sizeX: 10,
            sizeY: 1
        },
        objects: {[player1.id] :player1, [player2.id]: player2},
        seed: 6
    };
    const action = {type: "HEAL", identifier: player1.id};
    const nextState = converter(state, action, Math.random);
    const newState = Object.assign({}, state);
    assert.deepEqual(nextState, newState);
});
    });
});