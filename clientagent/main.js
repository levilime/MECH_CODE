const ClientAgent = require('./clientagent');
const BaseAddress = 'http://localhost:300';
const knownAdresses = Array(1).fill(0).map((x,i) => BaseAddress + i);

const amountOfAgents = 40;

const initialize = () =>  {
    Array(amountOfAgents).fill('').forEach(() => {
        console.log(knownAdresses);
        new ClientAgent(knownAdresses);
    });
};

// get this through an argument
initialize();
