import board from './board';
import createObject from './createobject';

/**
 * state is composed of
 *
 * {
 *      objects: all the objects on the board, with as key the identifier,
 *      board: the properties of the board, {sizeX: number, sizeY: number},
 *      seed: the seed for pseudo random generation of numbers
 * }
 *
 */

/**
 * action is composed of:
 * {
 *      type: type of action,
 *      objectType: type of object(player, monster) that requested the action,
 *      identifier: identifies the object,
 *      data: data of the action, for movement gives the direction, for attack and
 *          heal it is empty
 * }
 */

const player = "player";
const monster = "monster";

/**
 *  game logic provides a function which consumes a state and a action and returns a
 *  new state.
 * @param state
 * @param action
 * @returns {*}
 */
export default (state, action) => {
    if (!converters[action.type]) {
        // TODO log unknown action
        return state;
    }
    return converters[action.type](state, action);
}

const converters =
    {
        "MOVE": (state, action) => {
            if(action.objectType === player) {
                return board.moveObject(state, action.identifier, action.data.direction);
            } else {
                // TODO log action cannot be performed by this action.objectType
                return state;
            }
        },
        "SPAWN": (state, action) => {
            const newObject = createObject(action.objectType);
            return newObject ? board.placeObject(state, board.findFreeSpot(state), newObject): state;
        },
        "ATTACK": (state, action) => {
            const attacker = state.objects[action.identifier];
            const victim = board.findClosestObject(attacker, (object) => object.type === monster);
            return victim && board.distanceBetweenObjects(attacker, victim) < 3 
                ? board.attack(state, attacker, victim): state;

        },
        "HEAL": (state, action) => {
            const healer = state.objects[action.identifier];
            const patient = board.findClosestObject(healer, (object) => object.type === player);
            return patient && board.distanceBetweenObjects(healer, patient) < 2
                ? board.heal(state, healer, patient): state;
        }
    };