import board from './board';

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
            if (action.objectType === player) {
                // just positions the player somewhere
                const object =
                    // TODO don't hardcode this here
                    {
                        health: 20,
                        ap: 10
                    };
                return board.placeObject(state, board.findFreeSpot(state), object);
            } else if (action.objectType === monster) {
                const object =
                    // TODO don't hardcode this here
                    {
                        health: 100,
                        ap: 20
                    };
                return board.placeObject(state, board.findFreeSpot(state), object);
            }

        },
        "ATTACK": (state, action) => {

        },
        "HEAL": (state, action) => {

        }
    };