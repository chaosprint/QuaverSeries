import {handlePara} from './helpers'
import Tone from 'tone'

const amp = paras => signal => {
    console.log(signal)

    let amp = paras[0] !== "" ? paras[0] : "0.1"
    let vol

    if (amp.includes("~")) {
        vol = new Tone.Volume(20 * Math.log10(0.1))
        amp = window.funcList[amp][0]()
        amp.connect(vol.volume)
        if (amp.start) { // an LFO
            amp.max = 20 * Math.log10(amp.max)
            amp.min = 20 * Math.log10(amp.min)
            amp.start(0)
        } else if (amp.triggerAttack) { // an Env
            amp.triggerAttack()
        }

    } else {
        amp = handlePara(amp, 0.1)
        vol = new Tone.Volume(20 * Math.log10(amp));
    }

    // console.log(signal.env)
    signal.effects.push(vol)
    signal.effects.push(Tone.Master)
    signal.synth.chain(...signal.effects)

    // console.log(signal.synth)

    if (signal.env !== undefined) {
        signal.synth.set({envelope: signal.env})
    }

    try {
        signal.synth.start(0.01)
        signal.env.connect(signal.synth.volume)
    } catch {}

    window.playlist.push(signal.ref)
    // if (window.tracks[signal.ref]) {
    //     window.tracks[signal.ref].synth = signal.synth
    //     window.tracks[signal.ref].seq = signal.seq
    // } else {
    window.tracks[signal.ref] = signal
    // }
    
    // console.log(window.playlist)
}

const filter = type => paras => signal => {

    let freq = paras[0] ? paras[0] : 1000
    let q = paras[1] ? paras[1] : 1

    var fx = new Tone.Filter({
        type: type,
        Q: handlePara(q, 1)
    })

    if (freq.includes("~")) {
        freq = window.funcList[freq][0]()
        freq.connect(fx.frequency)
        if (freq.start) {
            freq.start(0.01)
        } else if (freq.triggerAttack) {
            freq.triggerAttack()
        }

    } else {
        fx.frequency.value = handlePara(freq, 1000)
    }

    signal.effects.push(fx)
    return signal
}

const reverb = paras => signal => {
    
    let roomSize = handlePara(paras[0], 0.7)
    let dampening = handlePara(paras[1], 3000)
    let fx = new Tone.Freeverb(roomSize, dampening);     
    signal.effects.push(fx)
    return signal
}

const pan = paras => signal => {

    let lr = paras[0] ? paras[0] : 0
    let fx
    
    if (lr.includes("~")) {
        lr = window.funcList[lr][0]()
        fx = new Tone.Panner(0);
        lr.connect(fx.pan)
        if (lr.start) {
            lr.start(0.01)
        } else if(lr.triggerAttack) {
            lr.triggerAttack()
        }  
    } else {
        lr = handlePara(lr, 0)
        fx = new Tone.Panner(lr)
    }
     
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

    let roomSize = paras[0] ? paras[0] : 0.3
    let fx
    
    if (roomSize.includes("~")) {
        roomSize = window.funcList[roomSize][0]()
        fx = new Tone.JCReverb(0.3)
        roomSize.connect(fx.roomSize)
        roomSize.start(0.01)
    } else {
        roomSize = handlePara(roomSize, 0.3)
        fx = new Tone.JCReverb(roomSize)
    }

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

export {amp, filter, pingpong, reverb, freeverb, jcreverb, delay, pan}