import {handlePara} from './helpers'
import Tone from 'tone'

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
        sig.frequency.value = freq.replace("`", "")
    } else if (freq.includes("~")) { // freq is ref
        freq = window.funcList[paras[0]][0]()
        freq.connect(sig.frequency)
        freq.start()
    } else {
        sig.frequency.value = 10 // defaul
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
    var osc = new Tone.Oscillator(handlePara(paras[0], 440), type)
    return trigger.connector(osc) 
}

const noise = type => paras => trigger => {
    var noise = new Tone.Noise(type)
    return trigger.connector(noise)

}

export {pwm, oscillator, noise, lfo}