const board = require('./board');

const playerName = "player";
const monsterName = "monster";

class Simulation {

    constructor(monsterAmount, playerAgentAmount, synchronization, currentTime, annotation) {
        const self = this;
        this.synchronization = synchronization;
        const monsters = Array(monsterAmount).fill().map((x, i) => {
                return {id: monsterName + i, type: monsterName};
            }
        );

        const players = Array(playerAgentAmount).fill().map((x, i) => {
                return {id: playerName + "Agent" + i, type: playerName};
            }
        );

        this.agents = [...monsters, ...players];

        // initial spawning
        this.agents.forEach((agent) => {
            self.spawn(agent.id, agent.type, currentTime, annotation);
        });
        return this;
    }

    spawn(id, objectType, currentTime, annotation) {
        const spawn = {
            type: "SPAWN",
            identifier: id,
            data: {objectType},
            timestamp: currentTime
        };
        global.log.push('simulation', 'spawn: ' + JSON.stringify(spawn));
        this.synchronization.addAction(currentTime, annotation(spawn));
    }

    static updateAgent(state, agent, currentTime, annotation) {
        if(!annotation) {
            annotation = (action) => action;
        }
        const action = agentLibrary[agent.type];
        if (action) {
            const performedAction = agentLibrary[agent.type](state, agent, currentTime);
            if(!performedAction) {
                return undefined;
            }
            const agentAction = annotation(performedAction);
            global.log.push('simulation', 'agent: ' + agent.id + ' gets action: ' + JSON.stringify(agentAction));
            return agentAction;
        } else {
            global.log.push('simulation', 'no actions for agent type: ' + agent.type +
                ' object: ' + JSON.stringify(agent));
        }
    }

    updateAgents(currentTime, annotation) {
        const self  = this;
        return this.agents.map((agent) => {
            const action = Simulation.updateAgent(this.synchronization.getLeadingState(), agent, currentTime, annotation);
            if (action) {
                self.synchronization.addAction(currentTime, action);
                return action;
            }
        }).filter((x) => x !== undefined);
    }

};

// TODO put this at one place
const attackDistance = 2;
const healDistance = 5;


const monsterMove = (state, object, timestamp) =>  {
    const monster = state.objects[object.id];
    if(!monster) {
        return;
    }
    const player = board.findClosestObject(state, monster, (current) => current.type !== monster.type);
    if (player &&  board.distanceBetweenObjects(player, monster) <= attackDistance) {
        return {type: "ATTACK", identifier: object.id, data: {}, timestamp};
    } else {
        global.log.push('simulation', 'monster: ' + monster.id + ' was not able to find anyone');
    }
};

const playerAgentMove = (state, object, timestamp) => {
        const baseAction = {identifier: object.id, timestamp};
        // close to player who needs healing
        // directly taken from assignment, a player will be healed but not necessarily the one that has hp below 50%
        const patient = board.findClosestObject(state, object, (current) => current.type === object.type && current.health < 10);
        if(patient && board.distanceBetweenObjects(patient, object) <= healDistance) {
            return {...baseAction, type: "HEAL", data: {objectType: playerName}}}
        // if there is a monster
        const monster = board.findClosestObject(state, object, (current) => current.type !== object.type);
        if (monster && board.distanceBetweenObjects(monster, object) <= attackDistance) {
            return {...baseAction, type: "ATTACK", data:{objectType: playerName}};
        } else if(monster) {
            const xDiscrepancy = object.position.x - monster.position.x;
            const yDiscrepancy = object.position.y - monster.position.y;
            if(Math.abs(xDiscrepancy) > Math.abs(yDiscrepancy)) {
                return {...baseAction, type: "MOVE", data:{direction: xDiscrepancy > 0? "left": "right", objectType: playerName}};
            } else {
                return {...baseAction, type: "MOVE", data:{direction: yDiscrepancy > 0? "up": "down", objectType: playerName}};
            }
        }
};

const agentLibrary = {
    monster: monsterMove,
    player: playerAgentMove
};


module.exports = {Simulation, agentLibrary};