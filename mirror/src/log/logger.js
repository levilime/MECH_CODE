/*
all log messages are send through the multicaster and logged in all mirror servers.
At intervals the log is appended to disc.
 */

const fs = require('fs');


class Logger {
    constructor() {
        this.log = [];
        this.file = "log.txt";
        this.spillInterval = 1000;
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
        const time = new Date().toISOString();
        this.log.push({time,  type, msg});
        console.log({time, type, msg});
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

let instantiatedLogger = new Logger();

module.exports = {instantiatedLogger, Logger};