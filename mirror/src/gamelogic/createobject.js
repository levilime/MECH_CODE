module.exports =  (type, identifier, rng) => {
    return objects[type] ? objects[type](identifier, rng) : undefined;
};

const playerBaseHealth = 10;
const playerVariableHealth = 10;
const playerVariableAP = 10;
const monsterBaseHealth = 50;
const monsterVariableHealth = 50;
const monsterBaseAP = 5;
const monsterVariableAP = 15;

// TODO add some randomization logic for health and ap
const objects = {
    player: (identifier, rng) => {return                     {
        id: identifier,
        health: playerBaseHealth + Math.round(rng() * playerVariableHealth),
        ap: Math.ceil(rng() * playerVariableAP)
    };},
    monster: (identifier, rng) => {return                     {
        id: identifier,
        health: monsterBaseHealth +  Math.round(rng() * monsterVariableHealth),
        ap: monsterBaseAP + Math.round(rng() * monsterVariableAP)
    };}
};
