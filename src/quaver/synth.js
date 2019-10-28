var Tone = require('tone')



const monoSynth = (type) => (paras) => (trigger) => {
    const sawtooth = new Tone.MonoSynth({
        oscillator: {
            type: type
        }, 
        filter: {
            Q: 1
        }
    })
    // console.log("connector", trigger)
    return trigger.connector(sawtooth)
}

const lfo = (paras) => {
    // paras should be freq, min, max
    var freq = parseFloat(paras[0])
    var min = parseFloat(paras[1])
    var max = parseFloat(paras[2])

    return () => {

        let sig = new Tone.LFO({
            min: min === "_" ? 100 : paras[1],
            max: max === "_" ? 10000 : paras[2]
        })

        if (isNaN(freq)) {
            if (freq === "_") {
                sig.frequency.value = 10 // defaul
            } else { // freq is ref
                freq = window.funcList[paras[0]][0]()
                freq.connect(sig.frequency)
                freq.start()
            }
        } else {
            sig.frequency.value = freq // freq is number
        }
        return sig
    }
}

const noise = (type) => (paras) => (trigger) => {
    const noise = new Tone.NoiseSynth({
        noise: {
            type: type
        }
    })
    return trigger.connector(noise)
}

const membrane = (paras) => (trigger) => {
    var synth = new Tone.MembraneSynth()
    return trigger.connector(synth)
}

const pluck = (paras) => (trigger) => {
    const pluck = new Tone.PluckSynth({
        attackNoise : !isNaN(paras[0]) ? parseFloat(paras[0]): 1 ,
        dampening : !isNaN(paras[1])  ? parseFloat(paras[1]):  4000 ,
        resonance : !isNaN(paras[2]) ? parseFloat(paras[2]):  0.7
    })
    return trigger.connector(pluck)
}

const metalphone = (paras) => (trigger) => {
    var synth = new Tone.MetalSynth()
    return trigger.connector(synth)
}

const fm = (paras) => (trigger) => {
    var synth = new Tone.FMSynth({
        harmonicity: !isNaN(paras[0])  ? parseFloat(paras[0]): 3,
        modulationIndex : !isNaN(paras[1]) ? parseFloat(paras[1]): 10
    })
    return trigger.connector(synth)
}
const sampler = (paras) => (trigger) => {
    // "./Clap.wav"

    
    return trigger.connector(sampler)
}


export {noise, monoSynth, lfo, membrane, pluck, metalphone, fm, sampler}