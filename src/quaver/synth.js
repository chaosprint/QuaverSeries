var Tone = require('tone')

const monoSynth = (type) => (paras) => (obj) => {
    const sawtooth = new Tone.MonoSynth({
        oscillator: {
            type: type
        }, 

        filter: {
            Q: 1
        }
        // envelope : {
        //     attack: 0.005,
        //     release: 1,
        //     sustain: 0.1,
        //     release: 0.5/4
        // }
    })
    return obj.trigger(sawtooth)
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

const noise = (type) => (paras) => (obj) => {
    const noise = new Tone.NoiseSynth({
        noise: {
            type: type
        }
    })
    return obj.trigger(noise)
}

const membrane = (paras) => (obj) => {
    var synth = new Tone.MembraneSynth()
    return obj.trigger(synth)
}

const pluck = (paras) => (obj) => {
    const pluck = new Tone.PluckSynth()
    return obj.trigger(pluck)
}

const metalphone = (paras) => (obj) => {
    var synth = new Tone.MetalSynth()
    return obj.trigger(synth)
}

const fm = (paras) => (obj) => {
    var synth = new Tone.FMSynth()
    return obj.trigger(synth)
}

export {noise, monoSynth, lfo, membrane, pluck, metalphone, fm}