const ClientAgent = require('./clientagent');
const BaseAddress = 'http://localhost:300';
const knownAdresses = Array(1).fill(0).map((x,i) => BaseAddress + i);

const amountOfAgents = 25;

const initialize = () =>  {
    Array(amountOfAgents).fill('').forEach(() => {
        console.log('new client');
        new ClientAgent(knownAdresses);
    });
};

// get this through an argument
initialize('http://localhost:3000');
