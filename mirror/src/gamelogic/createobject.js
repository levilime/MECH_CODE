module.exports =  (type, identifier) => {
    return objects[type] ? objects[type](identifier) : undefined;
};

// TODO add some randomization logic for health and ap
const objects = {
    player: (identifier) => {return                     {
        id: identifier,
        health: 10 + Math.round(Math.random() * 10),
        ap: Math.ceil(Math.random() * 10)
    };},
    monster: (identifier) => {return                     {
        id: identifier,
        health: 50 +  Math.round(Math.random() * 50),
        ap: 5 + Math.round(Math.random() * 15)
    };}
}