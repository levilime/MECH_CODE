const ClientAgent = require('./clientagent');
const BaseAddress = 'http://localhost:300';
const knownAdresses = Array(5).fill(0).map((x,i) => BaseAddress + i);

const amountOfAgents = 100;
const waitUntillNextConnection = 100;

const initialize = () =>  {
    Array(amountOfAgents).fill('').forEach((x,i) => {
        setTimeout(()=> new ClientAgent(shuffleArray(knownAdresses), false), i * waitUntillNextConnection);
    });
};

function shuffleArray(array) {
    const arr = Array(array.length).fill(0).map((x,i) => {return {val: Math.random(), i}});
    arr.sort((a,b) => a.val < b.val);
    return arr.map((x) => array[x.i]);
}

// get this through an argument
initialize();
