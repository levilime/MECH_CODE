const timemachine = require('timemachine');

class Clock {
    constructor() {
        timemachine.reset();
        // timemachine.config({
        //     timestamp: Date.now(),
        //     tick:true
        // });
    }

    stepTime(offset) {
        timemachine.config({
            timestamp: Date.now() + offset
        });
    }

    adjustTime(offsetTime) {
        timemachine.config({
            timestamp: offsetTime
        });
    }
}