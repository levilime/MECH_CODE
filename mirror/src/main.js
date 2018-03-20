const seedrandom = require('seedrandom');
const ClientCommunicator = require('./client/clientcommunicator');

const initialize = (state) =>  {
    // initialize the random state
    seedrandom(state.seed, {global: true});
    const send = new ClientCommunicator();

    listen( (action) => {
        // action could be to denote client connect or client disconnect
        // or a game action
        console.log("Action received: " + action);
    });
};

initialize({});
