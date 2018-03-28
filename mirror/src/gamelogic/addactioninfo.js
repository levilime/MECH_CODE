const hash = require('object-hash');

let actionCount = 0;

module.exports = (currentTime, action, address) => {
    return {...action, actionID: hash('' + address + currentTime + actionCount++), timestamp: currentTime};
};