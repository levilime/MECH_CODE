const ClientAgent = require('./clientagent');
const BaseAddress = 'http://localhost:300';
const knownAdresses = Array(1).fill(0).map((x,i) => BaseAddress + i);

const amountOfAgents = 20;

const initialize = () =>  {
    Array(amountOfAgents).fill('').forEach(() => {
        new ClientAgent(knownAdresses);
    });
};

// get this through an argument
initialize();
