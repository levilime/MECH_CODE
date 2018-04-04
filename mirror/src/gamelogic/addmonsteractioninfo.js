const hash = require('object-hash');

let actionCount = 0;

module.exports = (currentTime, action) => {
    return {...action, actionID: hash(action.identifier + currentTime + actionCount++), timestamp: currentTime};
};