const timemachine = require('timemachine');

const lamportClock = (timestamp) => {
  if (timestamp >= Date.now()) {
    timemachine.config({timestamp:timestamp+1, tick:true});
    global.log.push('lamport', 'time is forwarded from: ', Date.now().toString(), ' to: ', (timestamp + 1).toString());
    return timestamp + 1;
  }
  return Date.now();
};

const resetClock = () => {
    timemachine.reset();
};

module.exports = {lamportClock, resetClock};