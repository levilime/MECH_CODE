const timemachine = require('timemachine');

const lamportClock = (timestamp) => {
  if (timestamp > Date.now()) {
    timemachine.config({timestamp:timestamp+1, tick:true});
  }
  return Date.now();
};

const resetClock = () => {
    timemachine.reset();
};

module.exports = {lamportClock, resetClock};