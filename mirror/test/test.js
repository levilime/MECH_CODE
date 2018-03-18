const board = require('../src/gamelogic/board');
const seedrandom = require('seedrandom');

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
console.log(position);