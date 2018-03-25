const ClientCommunicator = require('./client/clientcommunicator');
const Logger = require('./log/logger').Logger;

const initialize = (state) =>  {
    // this import takes care of also initialzing the logger, so
    // this is put here as first task of the initialize for extra
    // clarity
    global.log = new Logger("log.txt", 1000);

    // Initialize the trailing state with the

    // listen is called everytime there is an action that needs to be broadcasted
    const listen = ( (action) => {
        // action is one of the state converter compatible actions

        log.push('action', 'received action: ' + JSON.stringify(action));

        // TODO put here the multicast functionality to feed the data to all mirror servers
    });

    // TODO put here the logic of the mirror server receiving a multicast message and sending it
    // to the trailing logic.

    const send = new ClientCommunicator(listen, state.port);

    // TODO put here the client state updating, using send(state) so that the state is broadcasted
    // to all clients
};

// TODO instead of hardcoding the initial state it should be an argument when starting the mirror server
initialize({sizeX: 25, sizeY: 25, objects:{}, seed: "MECH_CODE", port: 3000});
