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
            const agentAction = annotation(agentLibrary[agent.type](state, agent, currentTime));
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
            self.synchronization.addAction(currentTime, action);
            return action;
        });
    }

};

// TODO put this at one place
const attackDistance = 2;
const healDistance = 5;


const monsterMove = (state, object, timestamp) =>  {
    return {type: "ATTACK", identifier: object.id, data: {}, timestamp};
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