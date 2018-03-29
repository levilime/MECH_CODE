const ClientAgent = require('./clientagent');

const amountOfAgents = 25;

const initialize = (address) =>  {
    Array(amountOfAgents).fill('').forEach(() => {
        console.log('new client');
        new ClientAgent(address);
    });
};

// get this through an argument
initialize('http://localhost:3000');
