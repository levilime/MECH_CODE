const io = require('socket.io-client');
const simulation = require('../mirror/src/gamelogic/simulation');
const updateInterval = 100;

global.log = {push: () => {}};

const initialize = (address) =>  {

    let currentState = undefined;
    let id = undefined;

    const socket = io(address);
    console.log('client started');

    socket.on('id', (msg) => {
        console.log('listen', msg);
        id = msg.id});

    socket.on('state', (state) =>
        currentState = state);

    socket.on('disconnect', () => process.exit());

    setInterval(() => {
        if (!currentState || !currentState.objects[id]) {
            return;
        }
        // TODO fix on the server that the following does not need to be sent: id, type
        const action = simulation.Simulation.updateAgent(currentState, currentState.objects[id], undefined);
        console.log('emit', action);
        socket.emit('action', action);
    }, updateInterval);
};

// get this through an argument
initialize('http://localhost:3000');
