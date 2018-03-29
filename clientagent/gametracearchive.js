const linebyline = require('line-by-line');
const ClientAgent = require('./clientagent');
const BaseAddress = 'http://localhost:300';
const knownAdresses = Array(10).fill(10).map((x,i) => BaseAddress + i);

const WOWtext = 'WoWSession_Node_Player_Fixed_Dynamic';

const startLine = 7;

const basicReader = new linebyline(WOWtext);
const playerSpawnEvent = 'PLAYER_LOGIN';

let currentLine = 0;

let startTimeSystem = undefined;
let firstTimeLog = undefined;
let inQueue = 0;

const startAgent =  () => {
    inQueue = Math.max(0, inQueue - 1);
    basicReader.resume();
    new ClientAgent(knownAdresses);
    console.log('player spawned');
};

basicReader.on('error', function (err) {
    console.log(err);
});

basicReader.on('end', function () {
    console.log('All lines are read, file is closed now.');
});

basicReader.on('line', (basicLine) => {
    try {
        currentLine++;
        if(currentLine < startLine) {
            console.log(basicLine);
            return;
        }
        const splittedLine = basicLine.split(', ');
        const timestamp = Number(splittedLine[2]);
        const event = splittedLine[3];

        if(!firstTimeLog && event === playerSpawnEvent) {
            startTimeSystem = Date.now()/ 1000;
            firstTimeLog = timestamp;
            startAgent();
            basicReader.resume();
        } else if (inQueue < 10 && event === playerSpawnEvent) {
            const passedTime = Date.now()/1000 - startTimeSystem;
            const topassTime = timestamp - firstTimeLog;
            const timeToWait = topassTime - passedTime;
            timeToWait < 0
                ? (() => {console.log('starting agent straight away'); startAgent()})()
                : (() =>  { inQueue ++; setTimeout(() => {
                console.log('agent starting at: ' + timestamp);
                startAgent()}, timeToWait)})();
            basicReader.resume();
        } else if (event === playerSpawnEvent) {
            basicReader.pause();
        }
    } catch (e) {
        console.log(e);
    }
});

