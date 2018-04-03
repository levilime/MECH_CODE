const ClientAgent = require('./clientagent');
const BaseAddress = 'http://localhost:300';
const knownAdresses = Array(10).fill(0).map((x,i) => BaseAddress + i);

const amountOfAgents = 200;

const initialize = () =>  {
    Array(amountOfAgents).fill('').forEach((x,i) => {
        setTimeout(()=> new ClientAgent(knownAdresses), i * 1000);
    });
};

// get this through an argument
initialize();
