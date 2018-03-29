const io = require('socket.io-client');
const simulation = require('../mirror/src/gamelogic/simulation');

const updateInterval = 100;
const minimumDeathCount = 100;
global.log = {push: () => {}};
const request = require('request');

const connections = '/connections';

module.exports = class ClientAgent {
    constructor(addresses) {
        const self  = this;
        const connectionPromises = addresses.map(address => new Promise((res, rej) => {
            request(address + connections, {json: true}, (err, result, body) => {
                res({...body, address});
            })
        }));

        Promise.all(connectionPromises).then((results) => {
            const bestConnection = results.reduce((best, current) => {
                if(!best) {
                    return current;
                }
                else if(best.connections > current.connections) {
                    return current;
                } else {
                    return best;
                }
            }, undefined);
            if(bestConnection) {
                const lessloadedAddress = bestConnection.address;
                self.runAgent(lessloadedAddress);
            } else {
                console.log('there were no connections available');
            }
        }).catch(e => console.log(e));
    }

    runAgent(address) {
        let currentState = undefined;
        let id = undefined;
        let intervalId = undefined;
        let amIDeath = 0;

        const socket = io(address);
        console.log('client started');

        socket.on('id', (msg) => {
            console.log('listen', msg);
            id = msg.id});

        socket.on('state', (state) => {
            currentState = state;
            if(!state.objects[socket.id]) {
                // have to check multiple times if player is spawned or died because of trailing state waiting with execution
                // of spawn and waiting on consensus in terms of having died.
                amIDeath ++;
                if(amIDeath >= minimumDeathCount){
                    console.log('disconnect', 'client: ' + socket.id + ' disconnects because it has died.');
                    socket.disconnect();
                }
            } else {amIDeath = 0}
        });

        socket.on('disconnect', () =>
        {
            console.log('disconnected', 'server has closed the connection with: ' + id);
            intervalId ? clearInterval(intervalId): undefined;
        });

        intervalId = setInterval(() => {
            if (!currentState || !currentState.objects[id]) {
                return;
            }
            // TODO fix on the server that the following does not need to be sent: id, type
            const action = simulation.Simulation.updateAgent(currentState, currentState.objects[id], undefined);
            if(action) {
                console.log('emit', action);
                socket.emit('action', action);
            }
        }, updateInterval);
    }
};