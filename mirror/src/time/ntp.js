//https://www.eecis.udel.edu/~mills/database/reports/ntp4/ntp4.pdf
const timemachine = require('timemachine');

//THIS FUNCTION DOES THE SAME AS 2^a
const log2d = (a) => {
    return a < 0 ? 1. / (1 << -(a)) : 1 << a;
};

//CONSTANTS ??
const MAXDISP = 16;
const MINDISP = 0.005;

//S
const PANIC_THRESHOLD = 1000;
const STEP_THRESHOLD = 0.125;
const WATCH = 900; // stepout treshold
const AVG = 8;

const MAXPOLL = 17;
const MINPOLL = 4;
const ALLAN = 2048;
const MAXFREQ = 500e-6;
const PLL = 65536;
const FLL = MAXPOLL + 1;
const PGATE = 4;
const LIMIT = 30;

const IGNORE = 0;
const SLEW = 1;
const STEP = 2;
const PANIC = 3;

//Clock states
const NSET = 0;
const FSET = 1;
const SPIK = 2;
const FREQ = 3;
const SYNC = 4;

const NUM_FILTER_SAMPLES = 8;

class Time {
    constructor(peerList, sender) {
        this.sender = sender;
        this.clock = new Date(Date.now());
        //Packet Variables On-Wire Protocol (ms)
        // this.numFilterSamples = 8;

        timemachine.reset();
        //Default values currently
        this.tolerance = 15e-6;
        this.precision = -18; // in log2 s

        this.peers = peerList.map((peer) => {
            // const filter = [];
            // for (let i =0; i < numsamples; i++) {
            //     filter.push({offset:0, delay:maxdisp, dispersion:maxdisp, timestamp:0});
            // }
            return {address: peer.address, port: peer.port, /*packet: {precision: this.precision, timestamps: [0,0,0]},*/
                state: {org:0, rec:0, xmt:0}, filter: [], statistics: {}};
        });
        //State variables On-Wire protocol (ms)
        //Org: time at client when request departed for the server
        //Rec: Time at server when request arrived from the client
        //Xmt: Time at the server when the response left for the client
        //Precision + reference clock precision//?????
        this.system = {rootdelay:0, rootdispersion:log2d(this.precision),offset:0, jitter:0, timestamp:0, poll:MINPOLL};//time is lastupdate time

        this.c = {base:0, offset:0, t:0, last:0, freq:0, wander:0, count:0, jitter:log2d(this.precision)};
        // this.clock = {};

        this.sender.on('message', (msg, rinfo) => {
            const parsedMsg = JSON.parse(msg.toString('utf8'));
            const content = {...parsedMsg, address: rinfo.address, port: rinfo.port};
            console.log(content);
            if (content.address === content.sync_address && content.port === content.sync_port) {
                this.replyPacket(content);
            } else {
                this.receivePacket(content);
            }
        });
        //TODO need 8 rounds for each peer
        this.peers.forEach((peer) => {
            this.sendPacket(peer, [0,0,0]);
        });
    }

    replyPacket(packet) {
        const changedTimeStamps = [packet.timestamps[2]];
        const receiveTime = Date.now();
        changedTimeStamps.push(receiveTime);
        const transmitTime = Date.now();
        changedTimeStamps.push(transmitTime);
        const replyPacket = {sync_address: packet.sync_address, sync_port: packet.sync_port,
            precision:this.precision, timestamps:changedTimeStamps};

        const content = new Buffer(JSON.stringify(replyPacket));
        this.sender.send(content, 0, content.length, packet.sync_port, packet.sync_address);
    }

    sendPacket(peer, timestamps) {
        //Add Current Time to end of list
        const currentTime = Date.now();
        timestamps.shift();
        timestamps.push(currentTime);
        // const timestamps = [0,0,currentTime];
        peer.state.xmt = currentTime;
        //send packet over UDP
        const syncerInfo = this.sender.address();
        const info = {sync_address:syncerInfo.address, sync_port:syncerInfo.port, precision:this.precision, timestamps};
        const packet = new Buffer(JSON.stringify(info));
        this.sender.send(packet, 0, packet.length, peer.port, peer.address);
    }

    receivePacket(packet) {
        const currentPeer = this.peers.find((x) => x.address === packet.address && x.port === packet.port);
        const currentTime = Date.now();
        const timestamps = packet.timestamps;
        // if (currentPeer === undefined || this.checkFakePacket(currentTime, currentPeer, packet)) {
        //     return;
        // }
        currentPeer.state.rec = currentTime;
        currentPeer.state.org = timestamps[2];

        //Check if all 3 timestamps are available
        const roundDone = timestamps.find((x) => x === 0) === undefined;
        if (!roundDone) {
            console.log('Receive packet round is not done');
            //Something is wrong
        }
        //calculate statistics
        const offset = 1/2 * ((timestamps[1] - timestamps[0]) + (timestamps[2] - currentTime));
        const roundtripDelay = Math.max((currentTime - timestamps[0]) - (timestamps[2] - timestamps[1]), log2d(this.precision));
        const dispersion = log2d(packet.precision) + log2d(this.precision) + this.tolerance * (currentTime - timestamps[0]);
            //TODO clock filter
        currentPeer.statistics = this.clock_filter(offset, roundtripDelay, dispersion, currentTime, currentPeer.filter);

        //Check if 8 samples for each peer has been received
        let enoughSamples = true;
        this.peers.forEach((peer) => {
            if (peer.filter.length !== NUM_FILTER_SAMPLES) {
                enoughSamples = false;
                console.log('New Round');
                this.sendPacket(peer, [0,0,0]);
            }
        });
        if (enoughSamples) {
            console.log('asd');
            //TODO ALGORITHMS
            //IF COMBINE WITHOUT SELECT AND CLuSTER IS DONE THEN
            //ITEMS NEED TO BE SORTED BASED ON increasing stratum x MAXDIST + lambda (Root distance)
            //SORT PEERS
            const sortedPeers = [...this.peers].sort((a,b) => {
                return this.root_dist(a) - this.root_dist(b);
            });
            // this.clock_combine();
            this.clock_update(sortedPeers[0]);
            console.log(this.system);
            //RESET VARIABLES
        }

    }

    clock_filter(offset, delay, dispersion, currentTime, filter) {
        //Add new sample to head of list and increase dispersion
        if (filter.length === NUM_FILTER_SAMPLES) {
            filter.pop();
        }
        // filter.forEach((sample) => {
        //     sample.dispersion += this.tolerance *  (currentTime - sample.timestamp);
        // });
        filter.unshift({offset,delay,dispersion,timestamp:currentTime});

        const tempList = [...filter].sort((a,b) => {
            return a.delay - b.delay;
        });
        let peerDispersion = 0;
        let jitter = 0;
        tempList.forEach((sample, index) => {
            peerDispersion += sample.dispersion / Math.pow(2, (index + 1));
            jitter += Math.pow(tempList[0].offset - sample.offset, 2);
        });
        if (tempList.length > 1) {
            jitter = Math.max(Math.sqrt((1 / (tempList.length - 1)) * jitter), log2d(this.precision));
        } else {
            jitter = log2d(this.precision);
        }
        return {rootdelay:0,rootdispersion:0,offset:tempList[0].offset, delay:tempList[0].delay,
            dispersion:peerDispersion, jitter, timestamp:tempList[0].timestamp};
    }
    //Rootdispersion = peer precision + precision + tolerancce * (t4-t1)
    //Rootdelay = 0

    clock_combine() {
        let y = 0, z = 0, w = 0;
        this.peers.forEach((packet) => {
            const x = this.root_dist(packet);
            y += 1 / x;
            z += packet.statistics.offset / x;
            w += (Math.pow(packet.statistics.offset - this.peers[0].statistics.offset,2)) / x;
        });
        this.system.offset = z / y;
        this.system.jitter = Math.sqrt(w / y);
    }

    root_dist(packet) {
        const peer = packet.statistics;
        return Math.max(MINDISP, peer.rootdelay + peer.delay) / 2 + peer.rootdispersion
            + peer.dispersion + this.tolerance * (packet.state.rec - packet.state.xmt) + peer.jitter;
    }

    clock_update(peer) {
        if (peer.statistics.timestamp >= this.system.timestamp) {
            this.system.timestamp = peer.statistics.timestamp;

            this.clock_combine();
            switch (this.local_clock(peer, this.system.offset)) {
                case PANIC:
                    return;
                case STEP:
                //     while (/* all associations */ 0)
                //         clear(p, X_STEP);
                //     s.stratum = MAXSTRAT;
                    this.system.poll = MINPOLL;
                    break;
                case SLEW:
                    // s.leap = p->leap;
                    // s.stratum = p->stratum + 1;
                    // s.refid = p->refid;
                    // s.reftime = p->reftime;
                    this.system.rootdelay = peer.statistics.rootdelay + peer.statistics.delay;
                    let dtemp = Math.sqrt(Math.pow(peer.statistics.jitter, 2) + Math.pow(this.system.jitter, 2));
                    dtemp += Math.max(peer.statistics.dispersion + this.tolerance * (Date.now() - peer.statistics.timestamp) +
                    Math.abs(peer.statistics.offset), MINDISP);
                    this.system.rootdispersion = peer.statistics.rootdispersion + dtemp;
                    break;
                case IGNORE:
                    break;

            }
            // console.log(this.system);
            console.log('c: ',this.c);
        }
    }

    local_clock(peer, offset) {
        let state, freq, mu, rval, etemp, dtemp;

        if (Math.abs(offset) > PANIC_THRESHOLD) {
            return PANIC;
        }

        rval = SLEW;
        mu = peer.statistics.timestamp - this.system.timestamp;
        freq = 0;

        if (Math.abs(offset) > STEP_THRESHOLD) {
            switch(this.c.state) {
                case SYNC:
                    state = SPIK;
                    return rval;
                case FREQ:
                    if (mu < WATCH) {
                        return IGNORE;
                    }
                    freq = (offset - this.c.base - this.c.offset) / mu;
                    /*FALL THROUGH NEXT CASE*/
                case SPIK:
                    if (mu < WATCH) {
                        return IGNORE;
                    }
                    /*FALL THROUGH TO DEFAULT*/
                default:
                    //TODO
                    this.step_time(offset);
                    this.c.count = 0;
                    rval = STEP;
                    if (state === NSET) {
                        this.rstclock (FREQ, peer.statistics.timestamp, 0);
                        return rval;
                    }
                    break;
            }
            this.rstclock(SYNC, peer.statistics.timestamp, 0);
        } else {
            etemp = Math.pow(this.c.jitter, 2);
            dtemp = Math.pow(Math.max(offset - this.c.last, log2d(this.precision)), 2);
            this.c.jitter = Math.sqrt(etemp + (dtemp - etemp) / AVG);

            switch(this.c.state) {
                case NSET:
                    this.c.offset = offset;
                    this.rstclock(FREQ, peer.statistics.timestamp, offset);
                    return IGNORE;
                case FSET:
                    this.c.offset = offset;
                    break;
                case FREQ:
                    if (this.c.timestamp - this.system.timestamp < WATCH) {
                        return IGNORE;
                    }
                    freq = (offset - this.c.base - this.c.offset) / mu;
                    break;
                default:
                    if (log2d(this.system.poll) > ALLAN / 2) {
                        etemp = FLL -this.system.poll;
                        if (etemp < AVG) {
                            etemp = AVG;
                        }
                        freq +=(offset - this.c.offset)  / (Math.max(mu, ALLAN) * etemp);
                    }
                    etemp = Math.min(mu, log2d(this.system.poll));
                    dtemp = 4 * PLL * log2d(this.system.poll);
                    freq += offset * etemp / (dtemp * dtemp);
                    break;
            }
            this.rstclock(SYNC, peer.statistics.timestamp, offset);
        }

        freq += this.c.freq;
        this.c.freq = Math.max(Math.min(MAXFREQ, freq), -MAXFREQ);
        etemp = Math.pow(this.c.wander, 2);
        dtemp = Math.pow(freq, 2);
        this.c.wander = Math.sqrt(etemp + (dtemp - etemp) / AVG);

        if (Math.abs(this.c.offset) < PGATE * this.c.jitter) {
            this.c.count +=this.system.poll;
            if (this.c.count > LIMIT) {
                this.c.count = LIMIT;
                if (this.system.poll < MAXPOLL) {
                    this.c.count = 0;
                    this.system.poll++;
                }
            }
        } else {
            this.c.count -=this.system.poll << 1;
            if (this.c.count < -LIMIT) {
                this.c.count = -LIMIT;
                if (this.system.poll > MINPOLL) {
                    this.c.count = 0;
                    this.system.poll--;
                }
            }
        }
        return rval;

    }

    rstclock(state, offset, time) {
        this.c.state = state;
        this.c.base = offset - this.c.offset;
        this.c.last = this.c.offset = offset;
        this.system.timestamp = time;
    }



    step_time(offset) {
        console.log('step', offset);
        console.log('Before:', new Date(Date.now()));
        timemachine.config({
            timestamp: Date.now() + offset
        });
        console.log('After: ',new Date(Date.now()));
    }


    //EVERY SECOND THIS SHOULD RUN
    clock_adjust() {
        let dtemp;
        this.c.t++;
        this.system.rootdispersion += this.tolerance;

        dtemp = this.c.offset / (PLL * Math.min(log2d(this.system.poll), ALLAN));
        this.c.offset -= dtemp;

        console.log('TODO SHOULD ADJUST_TIME:',this.c.freq + dtemp);

        // while (/* all associations */ 0) {
        //     struct p *p;/* dummy peer structure pointer */
        //     if (this.c.t >= p->next)
        //     poll(p);
        // }
    }

    //Packet as defined by this.peers
    checkFakePacket(currentTime, currentPeer, packet) {

        //Check if Duplicate or Bogus
        if (packet.timestamps[2] === currentPeer.state.xmt || packet.timestamps[0] !== currentPeer.state.org) {
            //TODO update state variables
            currentPeer.state.org = 0;
            currentPeer.state.rec = currentTime;
            return true;
        }
        return false;
    }
}

