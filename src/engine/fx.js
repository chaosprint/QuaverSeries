var Tone = require('tone')

const fxLib = {
    amp: (paras) => {
        return Tone.Master
    },

    lpf: (paras) => {

        // well you get a list of paras
        // you need to analyse where the ref is (it can be refs too!)
        let ref = {}
        let filter = new Tone.Filter({
            type: "lowpass",
        })

        if (paras[0][0] === '~') {
            ref[paras[0]] = filter.frequency
        } else {
            filter.frequency.value = parseFloat(paras[0])
        }

        // modulate Q is not a good idea
        filter.Q.value = parseFloat(paras[1])

        return {item: filter, ref: ref}
    },

    freeverb: (paras) => {
        let ref = {}
        let roomSize = paras[0] ? parseFloat(paras[0]) : 0.7
        let dampening = paras[1] ? parseFloat(paras[1]) : 3000
        let item = new Tone.Freeverb({
            roomSize: roomSize,
            dampening: dampening
        });

        return {item: item, ref: ref}
    },

    pingpong: (paras) => {
        let delayTime = paras[0] ? parseFloat(paras[0]) : 0.25
        let maxDelayTime = paras[1] ? parseFloat(paras[1]) : 1
        let item = new Tone.PingPongDelay({
            delayTime: delayTime,
            maxDelayTime: maxDelayTime
        });

        return {item: item, ref: {}}
    },

    hpf: (paras) => {

        // well you get a list of paras
        // you need to analyse where the ref is (it can be refs too!)
        let ref = {}
        let filter = new Tone.Filter({
            type: "highpass",
        })

        if (paras[0][0] === '~') {
            ref[paras[0]] = filter.frequency
        } else {
            filter.frequency.value = parseFloat(paras[0])
        }

        // modulate Q is not a good idea
        filter.Q.value = parseFloat(paras[1])

        return {item: filter, ref: ref}
    }, //

    lfo: (paras) => {
        let ref = {}
        let lfo = new Tone.LFO({
        })

        if (paras[0][0] === '~') {
            ref[paras[1]] = lfo.frequency
        } else {
            lfo.frequency.value = parseFloat(paras[0])
        };

        // min and max cannot be modulated!

        lfo.min = parseFloat(paras[1])
        lfo.max = parseFloat(paras[2])

        return {item: lfo, ref: ref}
    }
}

export {fxLib}