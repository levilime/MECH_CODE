const board = require('./board');
const createObject = require('./createobject');

/**
 * state is composed of
 * {
 *      objects: all the objects on the board, with as key the identifier,
 *      board: the properties of the board, {sizeX: number, sizeY: number},
 *      seed: the seed for pseudo random generation of numbers
 * }
 */

/**
 * action is composed of:
 * {
 *      type: type of action,
 *      identifier: identifies the object,
 *      data: data of the action, for movement gives the direction, for attack and
 *          heal it is empty and objectType: type of object(player, monster) that requested the action,
 * }
 */

const player = "player";
const monster = "monster";

const attackDistance = 2;
const healDistance = 5;

/**
 *  game logic provides a function which consumes a state and a action and returns a
 *  new state.
 * @param state
 * @param action
 * @returns {*}
 */
module.exports = (state, action, rng) => {
    if (!converters[action.type]) {
        global.log.push('action', 'action: ' + action.type + ' does not exist');
        return state;
    }
    return converters[action.type](state, action, rng);
};

const converters =
    {
        "MOVE": (state, action) => {
            if(action.data.objectType === player) {
                return board.moveObject(state, state.objects[action.identifier], action.data.direction);
            } else {
                global.log.push('action', 'action: ' + action.type + ' cannot be performed by: ' + action.data.objectType);
                // TODO log action cannot be performed by this action.objectType
                return state;
            }
        },
        "SPAWN": (state, action, rng) => {
            const newObject = createObject(action.data.objectType, action.identifier, rng);
            return newObject ? board.placeObject(state, board.findFreeSpot(state, rng), newObject): state;
        },
        "ATTACK": (state, action) => {
            const attacker = state.objects[action.identifier];
            const victim = board.findClosestObject(state, attacker, (object) => object.type !== attacker.type);
            return victim && board.distanceBetweenObjects(attacker, victim) <= attackDistance
                ? board.attack(state, attacker, victim): state;
        },
        "HEAL": (state, action) => {
            const healer = state.objects[action.identifier];
            const patient = board.findClosestObject(state, healer, (object) => object.type === player);
            return patient && board.distanceBetweenObjects(healer, patient) <= healDistance
                ? board.heal(state, healer, patient): state;
        }
    };
    