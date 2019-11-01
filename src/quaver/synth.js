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

const lfo = type => paras => () => {

    let freq = paras[0]
    let sig = new Tone.LFO({
        type: type,
        min: handlePara(paras[1], 100),
        max: handlePara(paras[2], 10000),
    })

    if (!isNaN(parseFloat(freq))) {
        sig.frequency.value = parseFloat(freq)
    } else if (freq.includes("n")) {
        // console.log(freq)
        sig.frequency.value = freq.replace("\\", "")
    } else if (freq.includes("~")) { // freq is ref
        freq = window.funcList[paras[0]][0]()
        freq.connect(sig.frequency)
        freq.start()
    } else {
        sig.frequency.value = 10 // defaul
    }

    return sig
}

const noise = type => paras => trigger => {
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

const pwm = paras => trigger => {
    
    var synth = new Tone.PWMOscillator({
        frequency: handlePara(paras[0], 440),
        detune: 0,
        phase: 0,
        modulationFrequency: handlePara(paras[1], 0.5),
    })
    return trigger.connector(synth)
}

const oscillator = type => paras => trigger => {
    var osc = new Tone.Oscillator(handlePara(paras[0], 440), type)
    return trigger.connector(osc) 

}

export {noise, monoSynth, lfo, membrane, pluck, metalphone, fm, sampler, pwm, oscillator}