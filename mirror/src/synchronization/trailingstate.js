//Trailing State Class
const stateconverter = require('../gamelogic/stateconverter');
const seedrandom = require('seedrandom');
const hash = require('object-hash');

class TrailingState {

    constructor(sizeX, sizeY, seed, delay) {
        const rng = seedrandom(seed);
        this.state = {board: {sizeX, sizeY}, seed: rng, objects: {}};
        this.executedActions = [];
        this.actions = [];
        this.delay = delay;
    }

    /**
     * Method to add the
     * @param action
     */
    addAction(action) {
        // currentTime - state.delay > action.timestamp
        if (this.actions.find((a) => a.identifier === action.identifier) !== undefined) {
            //TODO log that action with same identifier is already in the list
            return;
        }

        if (this.actions.length === 0 || this.actions[0].timestamp > action.timestamp) {
            //Place action at head of pending list
            this.actions.unshift(action);
        } else if (this.actions[this.actions.length - 1].timestamp < action.timestamp) {
            this.actions.push(action);
        } else {
            for (let i = this.actions.length - 1; i > 0; i--) {
                //Insert sort action
                if (this.actions[i].timestamp > action.timestamp && this.actions[i - 1].timestamp <= action.timestamp) {
                    this.actions.splice(i, 0, action);
                }
            }
        }
    }

    /**
     * Method to execute actions according to the current time
     * The action and effect are put in the executedActions list
     * @param currentTime
     */
    executeActions(currentTime) {
        while (this.actions.length > 0 && currentTime - this.delay >= this.actions[0].timestamp) {
            const executedAction = this.actions.shift();
            this.state = stateconverter(this.state, executedAction, this.state.seed);
            this.executedActions.push({action:executedAction, effect:hash(this.state)});
        }
    }

    /**
     * Remove executed actions that are contained in the executedActionsList
     * Used for removing executed actions from the last trailing state
     * @param executedActionsList
     */
    removeExecutedActions(executedActionsList) {
        const idList = executedActionsList.map((a) => a.action.identifier);
        this.executedActions = this.executedActions.filter((action) => idList.indexOf(action.action.identifier) === -1);
    }

    /**
     * Method to copy the state of the trailing state
     * @returns {{board: {sizeX: *, sizeY: *}, seed: *, objects}}
     */
    cloneState() {
        return {board:this.state.board, seed: this.state.seed,
            objects: JSON.parse(JSON.stringify(this.state.objects))};
    }
}

module.exports = {TrailingState};