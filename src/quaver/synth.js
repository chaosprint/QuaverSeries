import {handlePara} from './helpers'
import Tone from 'tone'

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

const lfo = (paras) => () => {

    let freq = parseFloat(paras[0])

    let sig = new Tone.LFO({
        min: handlePara(paras[1], 100),
        max: handlePara(paras[2], 10000),
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
        attackNoise : handlePara(paras[0], 1),
        dampening : handlePara(paras[1], 4000),
        resonance : handlePara(paras[2], 0.7),
    })
    return trigger.connector(pluck)
}

const metalphone = (paras) => (trigger) => {
    var synth = new Tone.MetalSynth({
        frequency: handlePara(paras[0], 200),
        harmonicity : handlePara(paras[1], 5.1),
        modulationIndex : handlePara(paras[2], 32),
        resonance : handlePara(paras[3], 4000),
        octaves : handlePara(paras[4], 1.5)
    })
    return trigger.connector(synth)
}

const fm = (paras) => (trigger) => {
    var synth = new Tone.FMSynth({
        harmonicity: handlePara(paras[0], 3),
        modulationIndex : handlePara(paras[1], 10)
    })
    return trigger.connector(synth)
}
const sampler = (paras) => (trigger) => {
    
    return trigger.connector(sampler)
}


export {noise, monoSynth, lfo, membrane, pluck, metalphone, fm, sampler}