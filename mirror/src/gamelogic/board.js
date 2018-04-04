/**
     * @param position
     * @param direction
     *
     * @return the new position after the direction, if it is out of bounds than
     * undefined is returned.
     */
    const directionPosition = (position, direction) => {
        const dir = {
            "up": (position) => {
                return {...position, y: position.y - 1};
            },
            "down": (position) => {
                    return {...position, y: position.y + 1};
            },
            "left": (position) => {
                    return {...position, x: position.x - 1};
            },
            "right": (position) => {
                    return {...position, x: position.x + 1};
            }
        };

        if (! dir[direction]) {
            global.log.push('action', 'action: MOVE cannot be performed with direction: ' + direction);
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
        if (canMoveObject(state, position, direction)) {
            const newPosition = directionPosition(position, direction);
            return placeObject(removeObject(state, object), newPosition, object);
        }
        return state;
     };

    const positionIsEmpty = (state, position) =>  {
        return !findObjectByPosition(state, position);
    };

    const findObjectByPosition = (state, position) => {
        const ids = Object.keys(state.objects).filter(identifier =>
            state.objects[identifier].position.x === position.x &&
            state.objects[identifier].position.y === position.y
        );
        return ids.length ? state.objects[ids[0]] : undefined;
    };

    const findClosestObject = (state, object, additionalCheck) => {
        return Object.keys(state.objects).reduce((closest, currentKey) => {
            const current = state.objects[currentKey];
            // checks that are done in both branches
            const additionalCheckOK = additionalCheck ? (!!additionalCheck(current)): true;
            const notSameAsObject = object.id !== currentKey;
            // if there has not been a closest match
            if(!closest) {
                return (additionalCheckOK && notSameAsObject ? current: undefined);
            } else {
                const swapCurrent = additionalCheckOK
                &&
                // distance between current and object is smaller than previous
                // smallest distance
                distanceBetweenObjects(current, object)
                 < distanceBetweenObjects(closest, object)
                    && notSameAsObject;
                return swapCurrent ? current : closest;
            }
        }, undefined)
    };

    const distanceBetweenObjects = (a, b) => {
        return Math.abs(a.position.x - b.position.x) + Math.abs(a.position.y - b.position.y);
    };

    const findFreeSpot = (state, rng) => {
        const sizeX = state.board.sizeX;
        const sizeY = state.board.sizeY;
        // taken is a list of all taken spots written as one number
        const taken = Object.keys(state.objects).map(key => {
            const object = state.objects[key];
            const position = object.position;
            return position.y * sizeX + position.x;
        });
        // take a permitted random location
        const aim = Math.ceil(rng() * ((sizeX * sizeY - 1) - (taken.length)));
        // find all free spots
        const spots = Array(sizeX * sizeY).fill(0).map((x,i) => i).filter(value => !taken.includes(value));
        // take the one that was chosen by the rng
        const found = spots[aim];
        // convert one number back to two numbers in position
        return {x: found % sizeX, y: Math.floor(found/ sizeX)};
    };

   const placeObject = (state, position, object) =>  {
        if(positionExists(state.board, position) && positionIsEmpty(state, position)) {
            if(state.objects[object.id]) {
                global.log.push('action', 'place object is not possible because id: ' + object.id + ' already exists.' );
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
        global.log.push('action', 'remove object failed because id: ' + object.id + ' does not exist.' );
            return state;
    };

    const attack = (state, attacker, victim) => {
        const newHealth = victim.health - attacker.ap;
        const newVictim = {...victim, health: newHealth};
        if(newHealth <= 0) {
            return removeObject(state, victim);
        }
        return {...state, objects: {...state.objects, [victim.id]: newVictim}};
    };

    const heal = (state, healer, patient) => {
        // FIXME save max health otherwise patient can get infinitely strong, which is stupid
        const newHealth = patient.health + healer.ap;
        const newPatient = {...patient, health: newHealth};
        return {...state, objects: {...state.objects, [patient.id]: newPatient}};
    };

 module.exports =  {placeObject, removeObject, moveObject,
    findFreeSpot, findClosestObject, attack, heal, distanceBetweenObjects, findObjectByPosition};
    