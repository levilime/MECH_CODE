module.exports =  (type, identifier) => {
    return objects[type] ? objects[type](identifier) : undefined;
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
    player: (identifier) => {return                     {
        id: identifier,
        health: playerBaseHealth + Math.round(Math.random() * playerVariableHealth),
        ap: Math.ceil(Math.random() * playerVariableAP)
    };},
    monster: (identifier) => {return                     {
        id: identifier,
        health: monsterBaseHealth +  Math.round(Math.random() * monsterVariableHealth),
        ap: monsterBaseAP + Math.round(Math.random() * monsterVariableAP)
    };}
}
