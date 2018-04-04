//Trailing State Class
const stateconverter = require('../gamelogic/stateconverter');
const hash = require('object-hash');
const RNG = require('../gamelogic/rng');
const MAX_MESSAGES = 10000;

class TrailingState {

    constructor(sizeX, sizeY, seed, delay) {
        const rngObject = new RNG(seed);
        // the function defintion like makes it possible to call the class function
        // anywhere with the intialized class scope
        const rng = () => rngObject.gen.call(rngObject);
        const seedf = () => rngObject.getSeed.call(rngObject);
        this.state = {board: {sizeX, sizeY}, seed: seedf, rng, objects: {}};
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

        if (this.actions.length > MAX_MESSAGES) {
            global.log.push('trailingState, delay: ' + this.delay, 'queue is full, not added:' + JSON.stringify({[action.identifier]: action}));
            return;
        }

        if (this.actions.find((a) => a.actionID === action.actionID) !== undefined ||
            this.executedActions.find((a) => a.action.actionID === action.actionID) !== undefined) {
            //log that action with same identifier is already in the list
            global.log.push('trailingState, delay: ' + this.delay, 'could not add action due to same id:' + action.actionID+ ', ' + JSON.stringify(action));
            return;
        }

        if (this.actions.length === 0 || this.actions[0].timestamp > action.timestamp) {
            //Place action at head of pending list
            this.actions.unshift(action);
        } else if (this.actions[this.actions.length - 1].timestamp < action.timestamp) {
            this.actions.push(action);
        } else {
            const currentSize = this.actions.length;
            for (let i = this.actions.length - 1; i >= 0; i--) {
                //Insert sort action
                if (this.actions[i].timestamp < action.timestamp || (this.actions[i].timestamp === action.timestamp
                    && this.actions[i].actionID < action.actionID)) {
                    this.actions.splice(i + 1, 0, action);
                    break;
                } else if (this.actions.length === currentSize && i === 0) {
                    this.actions.unshift(action);
                    break;
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
            this.state = stateconverter(this.state, executedAction, this.state.rng);
            this.executedActions.push({action:executedAction, effect:hash(this.state)});
        }
    }

    /**
     * Remove executed actions that are contained in the executedActionsList
     * Used for removing executed actions from the last trailing state
     * @param executedActionsList
     */
    removeExecutedActions(executedActionsList) {
        const idList = executedActionsList.map((a) => a.action.actionID);
        this.executedActions = this.executedActions.filter((action) => idList.indexOf(action.action.actionID) === -1);
    }

    /**
     * Method to copy the state of the trailing state
     * @returns {{board: {sizeX: *, sizeY: *}, seed: *, objects}}
     */
    cloneState() {
        return {board:this.state.board, rng: this.state.rng, seed: this.state.seed,
            objects: JSON.parse(JSON.stringify(this.state.objects))};
    }

    /**
     * Remove list of player ids
     * @param playerList
     */
    removePlayers(playerList) {
      Object.keys(this.state.objects).forEach((o) => {
          if (playerList.indexOf(o) !== -1) {
              delete this.state.objects[o];
          }
      });
    }
}

module.exports = {TrailingState};