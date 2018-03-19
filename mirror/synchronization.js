/*
 Trailing State Synchronization Logic
 */

//Get/set leading and trailing states, rollback, check inconsistencies
//Current Execution Time for trailing state = simulation/current time - delay
//Action = {id, action, timestamp, effect}, state = {state, actions, delay}
class Synchronization {

    constructor(numStates, syncDelay) {
        // this.numStates = numStates;
        // this.syncDelay = syncDelay;
        this.states = this.initStates(numStates, syncDelay);
    }

    /**
     * Initialize the trailing states
     * @param numStates
     * @param syncDelay
     * @returns {Array}
     */
    initStates = (numStates, syncDelay) => {
        const states = [];
        for (let i = 1; i <= numStates; i++) {
            // TODO push actual initialized states
            // Different spacing between delays
            states.push({state: '', actions: [], delay: i * syncDelay});
        }
        return states;
    };

    /**
     * Getter for the leading state
     * @returns {*}
     */
    getLeadingState = () => {
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
    addAction = (currentTime, action) => {
        //Check if Action falls within the window of the last trailing state
        if (currentTime - this.states[numStates - 1].delay > action.timestamp) {
            //TODO log that action is too late to be added
            return;
        }
        this.states.forEach((state) => {
            // currentTime - state.delay > action.timestamp
            if (state.actions.length === 0 || state.actions[0].timestamp > action.timestamp) {
                //Place action at head of pending list
                state.actions.unshift(action);
            } else if (state.actions[state.actions.length - 1].timestamp < action.timestamp) {
                state.actions.push(action);
            } else {
                for (let i = state.actions.length - 1; i > 0; i--) {
                    //Insert sort action
                    if (state.actions[i].timestamp > action.timestamp && state.actions[i - 1].timestamp <= action.timestamp) {
                        state.actions.splice(i, 0, action);
                    }
                }
            }

        });
    };

    executeStateActions = (currentTime, state) => {
        return state.actions.filter((action) => currentTime - state.delay > action.timestamp && action.effect === undefined)
            .forEach((execAction) => {
                //TODO Execute currentAction on current state and assign effect (changed state) to action
                // set to null if no effect
                execAction.effect = null;
            });
    };
    /**
     * Execute the actions according to the current time and remove performed actions from pending list
     * @param currentTime
     */
    execute = (currentTime) => {
        this.states.forEach((state, index) => {
            executeStateActions(currentTime, state);
        });

        //Check for inconsistencies after execution of actions in all states
        this.checkInconsistencies(currentTime);
        const lastTrailingStateActions = this.states[this.states.length - 1].actions.filter((a) => a.effect !== undefined);
        this.states.forEach((state) => {
            state.actions = state.actions.filter((action) => lastTrailingStateActions.indexOf(action.id) === -1);
        });
    };

    /**
     * Check if there are inconsistencies between each pair of succeeding states
     * @param currentTime
     */
    checkInconsistencies = (currentTime) => {
        for (let i = this.states.length - 1; i > 0; i++) {
            const executedActions = this.states[i].actions.filter((a) => a.effect !== undefined);
            executedActions.forEach((executedAction) => {
                //TODO comparison of effect (changed state) maybe different
                const actionComparison = this.states[i - 1].actions.find((x) => x.id === executedAction.id && x.effect === executedAction.effect);
                if (actionComparison === undefined) {
                    //Inconsistency found, so rollback
                    this.rollback(currentTime, i, i-1);
                }
            });
        }
    };

    /**
     * Rollback the rollbackStateIndex to the copyStateIndex version and catch up with actions
     * @param currentTime
     * @param copyStateIndex
     * @param rollbackStateIndex
     */
    rollback = (currentTime, copyStateIndex, rollbackStateIndex) => {
        const copyState = this.states[copyStateIndex];
        //TODO deep clone actions list and state
        const tempState = {state:'', actions:[], delay: this.states[rollbackStateIndex].delay};
        this.states[rollbackStateIndex] = tempState;
        //Catching up with the actions
        this.executeStateActions(currentTime, this.states[rollbackStateIndex]);
    };
}

module.exports = {Synchronization};