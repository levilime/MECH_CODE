const assert = require('assert');
const seedrandom = require('seedrandom');
const {Simulation, agentLibrary} = require('../src/gamelogic/simulation');


const board = require('../src/gamelogic/board');

describe('Simulation logic', function() {
    describe('monster', function() {
        it('monster should attack whenever it can execute an action', function() {
            const monster = {id: "monster", type: "monster", position: {x: 0, y: 0}, health: 100, ap:20};
            const state = {
                board : {
                    sizeX: 1,
                    sizeY: 1
                },
                objects: {monster},
                seed: 6
            };
            const time = 150000;
            assert.deepEqual(agentLibrary[monster.type](state, monster, time),
                {type: "ATTACK", identifier: monster.id, data: {}, timestamp: time});
        });
    });
    describe('player', function() {
        it('player should do nothing if there is nothing to do', function() {
            const player = {id: "player", type: "player", position: {x: 0, y: 0}, health: 100, ap:20};
            const state = {
                board : {
                    sizeX: 1,
                    sizeY: 1
                },
                objects: {player},
                seed: 6
            };
            const time = 150000;
            assert.equal(agentLibrary[player.type](state, player, time), undefined);
        });
        it('player should attack if there is a monster around', function() {
            const player = {id: "player", type: "player", position: {x: 0, y: 0}, health: 20, ap:10};
            const monster = {id: "monster", type: "monster", position: {x: 0, y: 1}, health: 100, ap:20};
            const state = {
                board : {
                    sizeX: 1,
                    sizeY: 2
                },
                objects: {player, monster},
                seed: 6
            };
            const time = 150000;
            assert.deepEqual(agentLibrary[player.type](state, player, time),
                {type: "ATTACK", identifier: player.id, data: {objectType: player.type}, timestamp: time});
        });
        it('player should heal if there is a player around that needs it', function() {
            const player = {id: "player", type: "player", position: {x: 0, y: 0}, health: 20, ap:5};
            const player2 = {id: "player2", type: "player", position: {x: 0, y: 1}, health: 1, ap:5};
            const state = {
                board : {
                    sizeX: 1,
                    sizeY: 2
                },
                objects: {player, player2},
                seed: 6
            };
            const time = 150000;
            assert.deepEqual(agentLibrary[player.type](state, player, time),
                {type: "HEAL", identifier: player.id, data: {objectType: player.type}, timestamp: time});
        });
    });
});