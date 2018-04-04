/*
all log messages are send through the multicaster and logged in all mirror servers.
At intervals the log is appended to disc.
 */

const fs = require('fs');

/**
 * One time instantiated logger
 */
class Logger {
    constructor(file, spillInterval) {
        this.log = [];
        this.file = file;
        this.spillInterval = spillInterval;
        this.createLogFile(this.file);

        // spill log to disc every second
        const interval = (context, func) => {
            setTimeout(() => {
                const copyLog = [...context.log];
                context.log = [];
                func(copyLog, context.file);
                interval(context, func);
            } , context.spillInterval)
        };
        interval(this, this.spill);
        this.push('logger', 'initialized the logger');
    };

    /**
     * creates a logfile at the location
     * @param location
     */
    createLogFile(location) {
        fs.writeFile(location, "", (err) => {
            if (err) throw err;
        });
    };

    /**
     * Takes a message and logs it appropriately.
     * @param type
     * @param msg
     */
    push(type, msg) {
        // FIXME get the time correctly
        const newTime = new Date();
        const time = newTime.toISOString();
        const utc = newTime.getTime();
        const logEntry = {time, utc, type, msg};
        this.log.push(logEntry);
        console.log(logEntry);
    };

    /**
     * spills the log to disc
     * @param log
     * @param file
     */
    spill(log, file) {
        const stream = fs.createWriteStream(file, {flags:'a'});
        log.forEach( function (item) {
            stream.write(JSON.stringify(item) + "\n");
        });
    }
}

module.exports = {Logger};