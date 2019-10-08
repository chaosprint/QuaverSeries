var Tone = require('tone')

const synthLib = {
    sawtooth: () => {
        return new Tone.MonoSynth({
            oscillator: {
                type: "sawtooth"
            }, 
        })
    },
    square: () => {
        return new Tone.MonoSynth({
            oscillator: {
                type: "square"
            }, 
        })
    },

    pluck: () => {
        return new Tone.PluckSynth();
    },

    metalphone: () => {

        // paras are needed
        return new Tone.MetalSynth()
    },

    membrane: () => {
        return new Tone.MembraneSynth()
    },

    fm: () => {
        // paras are needed
        return new Tone.FMSynth()
    },

    white: () => {
        return new Tone.NoiseSynth({noise:{type:"white"}})
    },

    brown: () => {
        return new Tone.NoiseSynth({noise:{type:"brown"}})
    }
}

export {synthLib}