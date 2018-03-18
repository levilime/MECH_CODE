import randomJS from 'random-js';
    /**
     *
     * @param position
     * @param direction
     *
     * @return the new position after the direction, if it is out of bounds than
     * undefined is returned.
     */
    const directionPosition = (position, direction) => {
        const dir = {
            "up": (position) => {
                return {...position, y: position.y + 1};
            },
            "down": (position) => {
                    return {...position, y: position.y - 1};
            },
            "left": (position) => {
                    return {...position, x: position.x - 1};
            },
            "right": (position) => {
                    return {...position, x: position.x + 1};
            }
        };

        if (! dir[direction]) {
            // TODO log unknown direction
            return undefined;
        } else {
            return dir[direction](position);
            }
        };

    const canMoveObject = (state, position, direction) => {
        const newPosition = this.directionPosition(position, direction);
        return positionExists(state, newPosition) && positionIsEmpty(state, newPosition);
    };

    const moveObject = (state, object, direction) =>  {
        const position = findPositionOfObject(state, object);
        return moveObjectFromPosition(state, position, direction);
     };

    const moveObjectFromPosition = (state, position, direction) => {
        if (this.canMoveObject(position, direction)) {
            const newPosition = this.directionPosition(position, direction);
            return placeObject(removeObject(position), newPosition, object);
        }
        return state;
    };

    const positionIsEmpty = (state, position) =>  {
        return !findObjectByPosition(state, position);
    };

    const findObjectByPosition = (state, position) => {
        const objects = !Object.keys(state.objects).filter(identifier =>
            state.objects[identifier].position.x === position.x &&
            state.objects[identifier].position.y === position.y
        );
        return objects.length ? objects[0] : undefined;
    };

    const findPositionOfObject = (state, object) => {
        if (state.objects[object.id]) {
            return state.objects[object.id].position;
        }
        return undefined;
    };

    const findFreeSpot = (state, rng) => {
        const taken = Object.keys(state.objects).map(object => {
            const position = object.position;
            return position.x * state.sizeX + position.y;
        });
        // FIXME make a seeded function, now it is random over mirror servers
        const aim = Math.floor(Math.random * state.sizeX * state.sizeY - taken.length);
        const spots = Array(sizeX * sizeY).map((x,i) => i).filter(value => !taken.includes(value));
        const found = spots[aim];
        // convert one number back to two numbers in position
        return {x: (found - (found % state.sizeX))/ state.sizeX, y: found % state.sizeX};
    };

   const placeObject = (state, position, object) =>  {
        if(this.positionExists(state.board, position) && this.positionIsEmpty(state.board, position)) {
            if(state.objects[object.id]) {
                // TODO log id already exists
            } else {
                state.objects[object.id] = {...object, position};
                return {...state, objects: {...state.objects, [object.id]: object}}
            }
        }
        return state;
    };

    const positionExists = (board, position) =>  {
        return position.y < board.sizeY && position.y >= 0 && position.x < board.sizeX &&
            position.x >= 0;
        };

    const removeObject = (state, object) => {
            const newObjects = Object.assign({}, state.objects);
            if (newObjects[object.id]) {
                delete newObjects[object.id];
                return {...state, objects: newObjects};
            }
            // TODO log Removing failed because object does not exist
            return state;
    };

    export default {placeObject, removeObject, moveObject, findFreeSpot};