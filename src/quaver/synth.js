var Tone = require('tone')

const monoSynth = (type) => (paras) => (trigger) => {
    const sawtooth = new Tone.MonoSynth({
        oscillator: {
            type: type
        }, 
    })
    console.log(trigger)
    return trigger(sawtooth)
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
                freq = paras[0]
                freq = window.funcList[freq][0]()
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
    return trigger(noise)
}

const membrane = (paras) => (trigger) => {
    var synth = new Tone.MembraneSynth()
    return trigger(synth)
}

const pluck = (paras) => (trigger) => {
    const pluck = new Tone.PluckSynth()
    return trigger(pluck)
}

const metalphone = (paras) => (trigger) => {
    var synth = new Tone.MetalSynth()
    return trigger(synth)
}

const fm = (paras) => (trigger) => {
    var synth = new Tone.FMSynth()
    return trigger(synth)
}

export {noise, monoSynth, lfo, membrane, pluck, metalphone, fm}