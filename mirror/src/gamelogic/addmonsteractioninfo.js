
let actionCount = 0;

module.exports = (currentTime, action, interval) => {
    return {...action, actionID: action.identifier + actionCount++, timestamp: currentTime - currentTime % interval};
};