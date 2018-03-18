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
        const newPosition = directionPosition(position, direction);
        return positionExists(state.board, newPosition) && positionIsEmpty(state, newPosition);
    };

    const moveObject = (state, object, direction) =>  {
        const position = object.position;
        console.log(position);
        if (canMoveObject(state, position, direction)) {
            const newPosition = directionPosition(position, direction);
            console.log({newPosition});
            return placeObject(removeObject(state, object), newPosition, object);
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

    const findFreeSpot = (state) => {
        const sizeX = state.board.sizeX;
        const sizeY = state.board.sizeY;
        const taken = Object.keys(state.objects).map(key => {
            const object = state.objects[key];
            const position = object.position;
            return position.x * sizeX + position.y;
        });
        // Math.random has been altered to use a seed in the main
        const aim = Math.ceil(Math.random() * (sizeX * sizeY - (taken.length + 1)));
        const spots = Array(sizeX * sizeY).fill(0).map((x,i) => i).filter(value => !taken.includes(value));
        const found = spots[aim];
        // convert one number back to two numbers in position
        return {x: found % sizeX, y: Math.floor(found/ sizeX)};
    };

   const placeObject = (state, position, object) =>  {
        if(positionExists(state.board, position) && positionIsEmpty(state, position)) {
            if(state.objects[object.id]) {
                // TODO log id already exists
            } else {
                return {...state, objects: {...state.objects, [object.id]: {...object, position}}}
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

 module.exports =  {placeObject, removeObject, moveObject, findFreeSpot};