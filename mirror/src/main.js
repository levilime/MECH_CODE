const ClientCommunicator = require('./client/clientcommunicator');
const Logger = require('./log/logger').Logger;

const StateConverter = require('./gamelogic/stateconverter');

const initialize = (state) =>  {
    // this import takes care of also initialzing the logger, so
    // this is put here as first task of the initialize for extra
    // clarity
    global.log = new Logger("log.txt", 1000);

    // global.RandomNumberGenerator = new RNG(state.seed);

    // Initialize the trailing state with the

    // listen is called every time there is an action that needs to be broadcasted
    const listen = ( (action) => {
        // action is one of the state converter compatible actions

        global.log.push('action', 'received action: ' + JSON.stringify(action));

        if(action.type === "SPAWN") {
            // TODO get leading state to find out where the object can be spawned
            const state = {};
            const newState = StateConverter(state, action);
            const object = newState[action.identifier];
            if (object) {
                // TODO cast this message when the object could be placed
                const toCast = {...action, type: "PLACE", data: {...action.data, object}};
            }
        } else {
            // TODO cast the action
        }

        // TODO put here the multicast functionality to feed the data to all mirror servers
    });

    // TODO put here the logic of the mirror server receiving a multicast message and sending it
    // to the trailing logic.

    const send = new ClientCommunicator(listen, state.port);

    // TODO put here the client state updating, using send(state) so that the state is broadcasted
    // to all clients
};

initialize(require('../config'));
