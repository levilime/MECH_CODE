const board = require('./board');

const updateInterval = 5000;

const player = "player";
const monster = "monster";

module.exports = class Simulation {

    constructor(monsterAmount, playerAgentAmount, synchronization) {
        const monsters = Array(monsterAmount).fill().map((x,i) =>
        {return {id:  monster + i, objectType: monster};}
        );

        const players = Array(playerAgentAmount).fill().map((x,i) =>
            {return {id:  player + "Agent" +  i, objectType: player};}
        );
        [...monsters, ...players].forEach((agent) => {
            synchronization.addAction(Date.now(), {type: "SPAWN", identifier: agent.id, data:{objectType: agent.objectType}, timestamp: Date.now()});
            setInterval(() => {
                const objects = synchronization.getLeadingState().objects;
                // TODO replace placeholder time by synchronized time
                if(!objects[agent.id]) {
                    return;
                }
                const action =  agentLibrary[agent.objectType](synchronization.getLeadingState(), objects[agent.id]);
                if(action) {
                    synchronization.addAction(Date.now(), agentLibrary[agent.objectType](synchronization.getLeadingState(), objects[agent.id]));
                }
            }, updateInterval);
        });
    }

}

// TODO put this at one place
const attackDistance = 2;
const healDistance = 5;


const monsterMove = (state, object) =>  {
    return {type: "ATTACK", identifier: object.identifier, data: {objectType: "monster"}, timestamp: Date.now()};
};

const playerAgentMove = (state, object) => {
    if(!state.objects[object.identifier]) {
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
