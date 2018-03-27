const board = require('./board');

const player = "player";
const monster = "monster";

module.exports = class Simulation {

    constructor(monsterAmount, playerAgentAmount, synchronization, currentTime) {
        const self = this;
        this.synchronization = synchronization;
        const monsters = Array(monsterAmount).fill().map((x, i) => {
                return {id: monster + i, objectType: monster};
            }
        );

        const players = Array(playerAgentAmount).fill().map((x, i) => {
                return {id: player + "Agent" + i, objectType: player};
            }
        );

        this.agents = [...monsters, ...players];

        // initial spawning
        this.agents.forEach((agent) => {
            self.spawn(agent.id, agent.objectType, currentTime);
        });
        return this;
    }

    spawn(id, objectType, currentTime) {
        const spawn = {
            type: "SPAWN",
            identifier: id,
            data: {objectType},
            timestamp: currentTime
        };
        global.log.push('simulation', 'spawn: ' + JSON.stringify(spawn));
        this.synchronization.addAction(currentTime, spawn);
    }

    updateAgents(currentTime) {
        this.agents.forEach((agent) => {
            const objects = this.synchronization.getLeadingState().objects;
            if (!objects[agent.id]) {
                global.log.push('simulation', 'nonexistent simulation agent not updated: ' + agent.id);
                return;
            }
            const action = agentLibrary[agent.objectType](this.synchronization.getLeadingState(), objects[agent.id]);
            if (action) {
                const agentAction = agentLibrary[agent.objectType](this.synchronization.getLeadingState(), objects[agent.id]);
                global.log.push('simulation', 'agent: ' + agent.id + ' gets action: ' + JSON.stringify(agentAction));
                this.synchronization.addAction(currentTime,
                    agentLibrary[agent.objectType](this.synchronization.getLeadingState(), objects[agent.id]));
            }
        });
    }

    updateAgentsContinuously(interval) {
        const self = this;
        setInterval(() => {
            // TODO kill agents that are dead
            // self.agents  = self.agents.filter(agent => self.synchronization.getLeadingState().objects[agent.id]);
            // TODO replace placeholder time by synchronized time
            self.updateAgents(Date.now());
        }, interval)
    }
};

// TODO put this at one place
const attackDistance = 2;
const healDistance = 5;


const monsterMove = (state, object) =>  {
    return {type: "ATTACK", identifier: object.identifier, data: {objectType: "monster"}, timestamp: Date.now()};
};

const playerAgentMove = (state, object) => {
    if(!state.objects[object.id]) {
        return;
    }
        const baseAction = {identifier: object.identifier, timestamp: Date.now()};
        // close to player who needs healing
        // directly taken from assignment, a player will be healed but not necessarily the one that has hp below 50%
        const patient = board.findClosestObject(state, object, (current) => current.data.objectType === object.data.objectType && current.health < 10);
        if(patient && board.distanceBetweenObjects(patient, object) <= healDistance) {
            return {...baseAction, type: "HEAL", identifier: object.identifier, data: {}}}
        // if there is a monster
        const monster = board.findClosestObject(state, object, (current) => current.data.objectType !== object.data.objectType);
        if (monster && board.distanceBetweenObjects(monster, object) <= attackDistance) {
            return {...baseAction, type: "ATTACK", identifier: object.identifier, data:{}};
        } else if(monster) {
            const xDiscrepancy = object.position.x - monster.position.x;
            const yDiscrepancy = object.position.y - monster.position.y;
            if(Math.abs(xDiscrepancy) > Math.abs(yDiscrepancy)) {
                return {...baseAction, type: "MOVE", identifier: object.identifier, data:{movement: xDiscrepancy > 0? "up": "down"}};
            } else {
                return {...baseAction, type: "MOVE", identifier: object.identifier, data:{movement: yDiscrepancy > 0? "left": "right"}};
            }
        }
};

const agentLibrary = {
    monster: monsterMove,
    player: playerAgentMove
};
