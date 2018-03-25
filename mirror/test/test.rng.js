const assert = require('assert');
const RNG = require('../src/gamelogic/rng');

    describe('RNG', function() {
        it('generate a random number, retaining the seed', function() {
            const seed = 5;
            const rng = new RNG(seed);
            assert.equal(rng.getSeed(), 5);
            assert.equal(rng.gen(), 0.8975141500470741);
            assert.equal(rng.getSeed(), 0.8975141500470741);
        });
    });