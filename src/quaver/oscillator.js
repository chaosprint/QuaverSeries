import {handlePara} from './helpers'
import Tone from 'tone'

const lfo = type => paras => () => {

    let freq = paras[0] !== "" ? paras[0] : "1"
    let sig = new Tone.LFO({
        type: type,
        min: handlePara(paras[1], 100),
        max: handlePara(paras[2], 1000),
    })

    if (!isNaN(parseFloat(freq))) {
        sig.frequency.value = parseFloat(freq)
    } else if (freq.includes("n")) {
        // console.log(freq)
        sig.frequency.value = freq.replace("\\", "")
    } else if (freq.includes("~")) { // freq is ref
        freq = window.funcList[freq][0]()
        freq.connect(sig.frequency)
        if (freq.start) {
            freq.start(0)
        } else if (freq.triggerAttack) {
            freq.triggerAttack()
        }
    } else {
        sig.frequency.value = 10 // default
    }

    return sig
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
    let freq = paras[0] !== "" ? paras[0] : "440"
    var osc
    if (freq.includes("~")) {
        freq = window.funcList[freq][0]()
        osc = new Tone.Oscillator(440, type)
        freq.connect(osc.frequency)
        if (freq.start) {
            freq.start(0)
        } else if (freq.triggerAttack) {
            freq.triggerAttack()
        }
    } else {
        freq = handlePara(paras[0], 440)
        osc = new Tone.Oscillator(freq, type)
    }
    
    return trigger.connector(osc) 
}

const noise = type => _paras => trigger => {
    var noise = new Tone.Noise(type)
    return trigger.connector(noise)
}

export {pwm, oscillator, noise, lfo}