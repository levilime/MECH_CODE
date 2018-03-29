/*
 Trailing State Synchronization Logic
 */
const t_states = require('./trailingstate');

//Get/set leading and trailing states, rollback, check inconsistencies
//Current Execution Time for trailing state = simulation/current time - delay
class Synchronization {

    constructor(sizeX, sizeY, seed, numStates, syncDelay) {
        const states = [];
        for (let i = 1; i <= numStates; i++) {
            // Different spacing between delays
            states.push(new t_states.TrailingState(sizeX, sizeY, seed, i * syncDelay));
        }
        this.states = states;
    }


    /**
     * Getter for the leading state
     * @returns {*}
     */
    getLeadingState() {
        if (this.states.length === 0) {
            return undefined;
        }
        return this.states[0].state;
    };

    /**
     * Method to add an action to all trailing state pending action lists
     * @param currentTime
     * @param action
     */
    addAction(currentTime, action) {
        //Check if Action falls within the window of the last trailing state
        if (currentTime - this.states[this.states.length - 1].delay > action.timestamp) {
            global.log.push('synchronization', 'action too late to be added:' + JSON.stringify(action));
            return;
        }
        this.states.forEach((state) => {
            state.addAction(action);
        });
    };

    /**
     * Execute the actions according to the current time and remove performed actions from pending list
     * Returns boolean for consistent or not
     * @param currentTime
     */
    execute(currentTime) {
        this.states.forEach((state, index) => {
            state.executeActions(currentTime);
        });

        //Check for inconsistencies after execution of actions in all states
        const consistent = this.checkInconsistencies(currentTime);
        const lastTrailingStateActions = this.states[this.states.length - 1].executedActions;
        this.states.forEach((state) => {
            state.removeExecutedActions(lastTrailingStateActions);
        });
        return consistent;
    };

    /**
     * Check if there are inconsistencies between each pair of succeeding states
     * @param currentTime
     */
    checkInconsistencies(currentTime) {
        let consistent = true;
        for (let i = this.states.length - 1; i > 0; i--) {
            this.states[i].executedActions.forEach((executedAction) => {
                const actionComparison = this.states[i - 1].executedActions.find((x) => {
                    return x.action.actionID === executedAction.action.actionID && x.effect === executedAction.effect;
                });
                if (actionComparison === undefined) {
                    //Inconsistency found, so rollback
                    this.rollback(currentTime, i, i - 1);
                    consistent = false;
                }
            });
        }
        return consistent;
    };

    /**
     * Rollback the rollbackStateIndex to the copyStateIndex version and catch up with actions
     * @param currentTime
     * @param copyStateIndex
     * @param rollbackStateIndex
     */
    rollback(currentTime, copyStateIndex, rollbackStateIndex) {
        global.log.push('synchronization', 'rollback occured between: ' + [rollbackStateIndex, copyStateIndex].join(', '));
        const copyState = this.states[copyStateIndex];
        this.states[rollbackStateIndex].actions = [...copyState.actions];
        this.states[rollbackStateIndex].executedActions = [...copyState.executedActions];
        this.states[rollbackStateIndex].state = copyState.cloneState();

        //Catching up with the actions
        this.states[rollbackStateIndex].executeActions(currentTime);
    };

    /**
     * Method to recover from restarting the node, when trailing states are received
     * @param currentTime
     * @param trailingstates
     */
    recover(currentTime, trailingstates) {
        global.log.push('synchronization', 'recovering from given trailing states' + JSON.stringify(trailingstates));
        const leadingState = this.states[0];
        const actionQueue = [...leadingState.executedActions.map((x) => x.action), ...leadingState.actions];

        this.states = trailingstates.states.map((ts, index) => {
            const newState = new t_states.TrailingState(ts.state.board.sizeX, ts.state.board.sizeY, ts.seed, ts.delay);
            newState.actions = ts.actions;
            newState.executedActions = ts.executedActions;
            newState.state.objects = ts.state.objects;

            //Add actions that needed to wait
            actionQueue.forEach((action) => {newState.addAction(action);});
            return newState;
        });
        this.execute(currentTime);
    }

    /**
     * Remove list of player ids from all trailing states
     * @param playerList
     */
    removePlayers(playerList) {
        this.states.forEach((state) => state.removePlayers(playerList));
    }
}

module.exports = {Synchronization};