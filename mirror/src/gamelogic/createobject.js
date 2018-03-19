module.exports =  (type, identifier) => {
    return objects[type] ? objects[type](identifier) : undefined;
}

const objects = {
    player: (identifier) => {return                     {
        id: identifier,
        health: 20,
        ap: 10
    };},
    monster: (identifier) => {return                     {
        id: identifier,
        health: 200,
        ap: 20
    };}
}