const seedrandom = require('seed-random');

module.exports = class RNG {

    constructor (seed) {
        this.seed = seed;
    }

    gen () {
        this.seed = seedrandom(this.seed)();
        return this.seed;
    }

    getSeed () {
        return this.seed;
    }

};