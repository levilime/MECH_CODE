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

// TODO put this at one place
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
    //return state.objects[action.identifier]? converters[action.type](state, action, rng): state;
    return converters[action.type](state, action, rng);
};

const converters =
    {
        "MOVE": (state, action) => {
            if(!state.objects[action.identifier]) {
                global.log.push('action', 'action: ' + action.type + ' cannot be performed by nonexistent: ' + action.identifier);
                return state;
            }
            if(action.data.objectType === player) {
                return board.moveObject(state, state.objects[action.identifier], action.data.direction);
            } else {
                global.log.push('action', 'action: ' + action.type + ' cannot be performed by: ' + action.data.objectType);
                return state;
            }
        },
        "PUT": (state, action) => {
            const newObject = action.data.object;
            global.log.push('action', 'spawned:  ' + JSON.stringify(newObject) + 'by PUT action');
            return board.placeObject(state, newObject.position, newObject);
        },
        "SPAWN": (state, action, rng) => {
            const newObject = createObject(action.data.objectType, action.identifier, rng);
            global.log.push('action', 'spawned:  ' + JSON.stringify(newObject));
            return newObject ? board.placeObject(state, board.findFreeSpot(state, rng), newObject): state;
        },
        "ATTACK": (state, action) => {
            const attacker = state.objects[action.identifier];
            if(!attacker) {
                global.log.push('action', 'action: ' + action.type + ' cannot be performed by nonexistent: ' + action.identifier);
                return state;
            }
            const victim = board.findClosestObject(state, attacker, (object) => object.type !== attacker.type);
            return victim && board.distanceBetweenObjects(attacker, victim) <= attackDistance
                ? board.attack(state, attacker, victim): state;
        },
        "HEAL": (state, action) => {
            const healer = state.objects[action.identifier];
            if(!healer) {
                global.log.push('action', 'action: ' + action.type + ' cannot be performed by nonexistent: ' + action.identifier);
                return state;
            }
            const patient = board.findClosestObject(state, healer, (object) => object.type === healer.type);
            return patient && board.distanceBetweenObjects(healer, patient) <= healDistance
                ? board.heal(state, healer, patient): state;
        },
        "KILL": (state, action) => {
            const killed = state.objects[action.identifier];
            if(!killed) {
                global.log.push('action', 'action: ' + action.type + ' cannot be performed on nonexistent: ' + action.identifier);
                return state;
            }
            return board.removeObject(state, killed);
        }
    };


    