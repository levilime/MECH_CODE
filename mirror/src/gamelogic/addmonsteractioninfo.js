
let actionCount = 0;

module.exports = (currentTime, action) => {
    return {...action, actionID: action.identifier + actionCount++, timestamp: currentTime};
};