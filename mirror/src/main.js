const seedrandom = require('seedrandom');

const initialize = (state) =>  {
    // initialize the random state
    seedrandom(state.seed, {global: true});
};
