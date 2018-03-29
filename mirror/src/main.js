const ClientCommunicator = require('./client/clientcommunicator');
const Logger = require('./log/logger').Logger;
const Multicaster = require('./caster/multicaster').Multicaster;
const Synchronization = require('./synchronization/synchronization').Synchronization;
const {Simulation} = require('./gamelogic/simulation');
const addActionInfo = require('./gamelogic/addactioninfo');

const initialize = (state) =>  {
    const actionEvent = 'action';
    const numStates = 5;
    const syncDelay = 50;
    const updateInterval = 100;
    const dragonAmount = 0;
    const agentAmount = 0;

    // this import takes care of also initialzing the logger, so
    // this is put here as first task of the initialize for extra
    // clarity
    global.log = new Logger("log.txt", 1000);

    const multicaster = new Multicaster(state.multiport);
    // const address = multicaster.sender.address().address + multicaster.sender.address().port;
    const address = state.port;
    // initializes the trailing state manager
    const synchronization = new Synchronization(state.sizeX, state.sizeY, state.seed, numStates, syncDelay);

    // listen is called every time there is an action that needs to be broadcasted
    const listen = ( (action) => {
        // action is one of the state converter compatible actions
        // TODO replace placeholder time by synchronized time
        // FIXME fix that right now the id is decided upon by the client
        const withActionIDandTimestamp = addActionInfo(Date.now(), action,
            address);
        global.log.push('action', 'received action: ' + JSON.stringify(withActionIDandTimestamp));
        // multicast functionality to feed the data to all mirror servers
        multicaster.sendMessage(actionEvent, withActionIDandTimestamp);
    });

    // logic of the mirror server receiving a multicast message and sending it
    // to the trailing logic.
    multicaster.getEventEmitter().on(actionEvent, (action) => {
        // TODO replace placeholder time by synchronized time
        synchronization.addAction(Date.now(), action);
    });

    const send = new ClientCommunicator(listen, state.port);

    setInterval(() => {
        // TODO replace placeholder time by synchronized time
        // trailing state synchronization
        synchronization.execute(Date.now());
        // state is broadcasted to all clients
        send(synchronization.getLeadingState());
    }, updateInterval);

    // create agents
    // TODO because simulation must also initialize after the game has started, it needs to take in
    // the state of the game and be able to continue it


    const annotation = (action) => {
        return addActionInfo(Date.now(), action,
            address);
    };

    const simulation = new Simulation(dragonAmount, agentAmount, synchronization, Date.now(), annotation);
    simulation.updateAgentsContinuously(updateInterval, annotation);
};

initialize(require('../config'));
