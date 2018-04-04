const ClientCommunicator = require('./client/clientcommunicator');
const Logger = require('./log/logger').Logger;
const Multicaster = require('./caster/multicaster').Multicaster;
const Synchronization = require('./synchronization/synchronization').Synchronization;
const {Simulation} = require('./gamelogic/simulation');
const Heartbeat = require('./caster/heartbeat').Heartbeat;
const addActionInfo = require('./gamelogic/addactioninfo');
const addMonsterActionInfo = require('./gamelogic/addmonsteractioninfo');
const process = require('process');
const convert = require('./gamelogic/stateconverter');


const initialize = (state) => {
    const clientport = process.argv[2];
    if (clientport === undefined) {
        process.exit(1);
    }
    const actionEvent = 'action';
    const heartbeatEvent = 'HEARTBEAT';
    const recoveryEvent = 'RECOVERY';
    const monsterActionEvent = 'monsteraction';
    const numStates = 10;
    const syncDelay = 100;
    const updateInterval = 100;
    const dragonAmount = 20;
    const agentAmount = 0;
    const actionTimeoutInterval = 50;
    const heartbeatInterval = 2000;
    const max_peer_alive_time = 4000;
    const anyIp = '0.0.0.0';

    let recovering = false;

    // this import takes care of also initialzing the logger, so
    // this is put here as first task of the initialize for extra
    // clarity
    global.log = new Logger("log" + clientport + ".txt", 1000);

    const multicaster = new Multicaster(state.multiport, actionEvent, updateInterval);
    // const address = multicaster.sender.address().address + multicaster.sender.address().port;
    const address = state.port;
    // initializes the trailing state manager
    const synchronization = new Synchronization(state.sizeX, state.sizeY, state.seed, numStates, syncDelay);

    //Heartbeat protocol
    const heartbeat = new Heartbeat(max_peer_alive_time);

    setInterval(() => {
        const deadPeers = heartbeat.getDeadPeers();
        if (deadPeers.length > 0) {
            //Remove players from the states
            deadPeers.forEach((deadPeer) => {
                if (deadPeer.playerList.length > 0) {
                    synchronization.removePlayers(deadPeer.playerList);
                    deadPeer.playerList = [];
                }
            });
        }

        multicaster.sendMessage(heartbeatEvent, heartbeat.heartbeatMessage(Date.now()));
    }, heartbeatInterval);

    multicaster.getEventEmitter().on(heartbeatEvent, (hbmsg) => {
        const peerIsNewOrWasDead = heartbeat.checkNewOrDead(hbmsg);
        const peer = heartbeat.update(Date.now(), hbmsg);

        if (peerIsNewOrWasDead && peer.isRecovering) {
            //Peer has come back alive
            const trailingstates = synchronization.states.map((ts) => {
                return {...ts, state: {board: ts.state.board, objects: ts.state.objects}, seed: ts.state.seed()};
            });
            const recoveryMessage = {states: trailingstates, recovery_address: peer.address, recovery_port: peer.port};

            multicaster.sendMessage(recoveryEvent, recoveryMessage);
            global.log.push('main', 'send recovery message to peer: ' + JSON.stringify(peer));
        }
    });
    multicaster.getEventEmitter().on(recoveryEvent, (recovery) => {
        const address = multicaster.sender.address();
        //Only recover if you are the intended target
        if ((address.address === anyIp || recovery.recovery_address === address.address) && recovery.recovery_port === address.port) {
            synchronization.recover(Date.now(), recovery);
            recovering = true;
        }
    });


    // with this the code is not deterministic, spawning of the character is seperate from the trailing state flow.
    const convertSpawnToPut = (action) => {
        const id = action.identifier;
        const state = synchronization.getLeadingState();
        const newObject = convert(state, action, Math.random).objects[id];
        return {...action, type: 'PUT', identifier: id, data: {object: newObject}}
    };

    // listen is called every time there is an action that needs to be broadcasted
    const listen = ( (action) => {
        // action is one of the state converter compatible actions
        // TODO replace placeholder time by synchronized time
        // FIXME fix that right now the id is decided upon by the client
        const withActionIDandTimestamp = addActionInfo(Date.now(), action,
            address);
        global.log.push('action', 'received action: ' + JSON.stringify(withActionIDandTimestamp));
        let sentAction;
        if (action.type === 'SPAWN') {
            sentAction = convertSpawnToPut(withActionIDandTimestamp);
        } else {
            sentAction = withActionIDandTimestamp;
        }
        // multicast functionality to feed the data to all mirror servers
        multicaster.addToMessageQueue(sentAction);
        // multicaster.sendMessage(actionEvent, sentAction);
    });


    // logic of the mirror server receiving a multicast message and sending it
    // to the trailing logic.
    multicaster.getEventEmitter().on(actionEvent, (actions) => {
        actions.actions.forEach((action) => {
            action.address = actions.address;
            action.port = actions.port;
            if (action.type === 'SPAWN' || action.type === 'PUT') {
                heartbeat.updatePlayerList(action);
            }
            // TODO replace placeholder time by synchronized time
            synchronization.addAction(Date.now(), action);
        });
    });

    multicaster.getEventEmitter().on(monsterActionEvent, (monsterAction) => {
        if (recovering) {
            // TODO replace placeholder time by synchronized time
            synchronization.addAction(Date.now(), monsterAction);
            global.log.push('main', 'recovering server uses broadcasted monster actions');

        }
    });

    const send = new ClientCommunicator(listen, clientport, actionTimeoutInterval);

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

    const monsterAnnotation = (action) => {
        return addMonsterActionInfo(Date.now(), action);
    };

    const simulation = new Simulation(dragonAmount, agentAmount, synchronization, Date.now(), monsterAnnotation);
    setInterval(() => {
        // TODO kill agents that are dead
        // TODO replace placeholder time by synchronized time
        if (!recovering) {
            const monsterActions = simulation.updateAgents(Date.now(), monsterAnnotation);
            //Broadcast monster actions if there are recovering peers and this node is not recovering
            if (heartbeat.getRecoveringPeers().length > 0) {
                global.log.push('main', 'send monster actions for recovering node servers');
                monsterActions.forEach((monsterAction) => {
                    multicaster.sendMessage(monsterActionEvent, monsterAction);
                });
            }
        }

    }, updateInterval);
};

initialize(require('../config'));
