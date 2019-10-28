import {handlePara} from './helpers'
import Tone from 'tone'

const amp = paras => signal => {

    // console.log(signal)
    let amp = isNaN(paras[0]) ? 0.3 : parseFloat(paras[0])
    signal.synth.volume.value = 20 * Math.log10(amp)
    signal.effects.push(Tone.Master)
    signal.synth.chain(...signal.effects)
    window.playlist.push(signal.ref)
    window.tracks[signal.ref] = signal
    // console.log(window.playlist)
}

const filter = type => paras => signal => {

    var freq = parseFloat(paras[0])

    var fx = new Tone.Filter({
        type: type,
        Q: handlePara(paras[1], 1)
    })
    
    if (isNaN(freq)) {
        if (freq === "_") {
            fx.frequency.value = 1000
        } else {
            freq = paras[0]
            freq = window.funcList[freq][0]()
            freq.connect(fx.frequency)
            freq.start()  
        }
    } else {
        fx.frequency.value = freq
    }

    signal.effects.push(fx)
    return signal
}


const adsr = paras => signal => {
    let env = {
        "attack": handlePara(paras[0], 0.1),
        "decay": handlePara(paras[1], 0.1),
        "sustain": handlePara(paras[2], 0.5),
        "release": handlePara(paras[3], 0.5),
    }
    try {
        signal.synth.set({envelope: env})
    } catch {}
    return signal
}

const reverb = paras => signal => {
    
    let roomSize = handlePara(paras[0], 0.7)
    let dampening = handlePara(paras[1], 3000)
    let fx = new Tone.Freeverb(roomSize, dampening);     
    signal.effects.push(fx)
    return signal
}

const freeverb = paras => signal => {
    
    let roomSize = handlePara(paras[0], 0.7)
    let dampening = handlePara(paras[1], 3000)
    let fx = new Tone.Freeverb(roomSize, dampening);     
    signal.effects.push(fx)
    return signal
}

const jcreverb = paras => signal => {
    
    let roomSize = handlePara(paras[0], 0.5)
    let fx = new Tone.JCReverb(roomSize)     
    signal.effects.push(fx)
    return signal
}

const delay = paras => signal => {

    let delayTime = handlePara(paras[0], 0.25)
    let maxDelay = handlePara(paras[1], 1)
    let fx = new Tone.FeedbackDelay({
        delayTime: delayTime,
        maxDelay: maxDelay
    });   
    signal.effects.push(fx)
    return signal
}

const pingpong = paras => signal => {

        let delayTime = handlePara(paras[0], 0.25)
        let maxDelayTime = handlePara(paras[1], 1)
        let fx = new Tone.PingPongDelay({
            delayTime: delayTime,
            maxDelayTime: maxDelayTime
        });
        signal.effects.push(fx)
        return signal
}

export {amp, filter, pingpong, adsr, reverb, freeverb, jcreverb, delay}