var Tone = require('tone')

const amp = (paras) => (signal) => {

    // console.log(signal)
    let amp = isNaN(paras[0]) ? 0.3 : parseFloat(paras[0])
    signal.synth.volume.value = 20 * Math.log10(amp)
    signal.effects.push(Tone.Master)
    signal.synth.chain(...signal.effects)
    window.playlist.push(signal.ref)
    window.tracks[signal.ref] = signal
    // console.log(window.playlist)
}

const filter = (type) => {
    return (paras) => {
        // paras has freq and q
        var freq = parseFloat(paras[0])
        var q = parseFloat(paras[1])

        return (signal) => {

            var fx = new Tone.Filter({
                type: type,
                Q: isNaN(q) ? 1 : q // if Q is not number, it is "_", use default val 1
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
    }
}


const adsr = (paras) => {

    return signal => {

        let p = paras.map(parseFloat)
        let env = {
            "attack": isNaN(p[0]) ? 0.1 : p[0],
            "decay": isNaN(p[1]) ? 0.1 : p[1],
            "sustain": isNaN(p[2]) ? 0.5 : p[2],
            "release": isNaN(p[3]) ? 0.5 : p[3] 
        }
        try {
            signal.synth.set({envelope: env})
        } catch {}
        return signal
    }
}


const reverb = (paras) => (signal) => {

    // let decay = isNaN(paras[0]) ? 1.5 : parseFloat(paras[0]) 
    // let preDelay = isNaN(paras[1]) ? 0.01 : parseFloat(paras[1])

    // let fx = new Tone.Reverb({
    //     decay: decay,
    //     preDelay: preDelay
    // });
    // signal.effects.push(fx)
    // return signal
    let roomSize = isNaN(paras[0]) ? 0.7 : parseFloat(paras[0]) 
    let dampening = isNaN(paras[1]) ? 3000 : parseFloat(paras[1])
    let fx = new Tone.Freeverb(roomSize, dampening);     
    signal.effects.push(fx)
    return signal
}

const freeverb = (paras) => (signal) => {
    
    let roomSize = isNaN(paras[0]) ? 0.7 : parseFloat(paras[0]) 
    let dampening = isNaN(paras[1]) ? 3000 : parseFloat(paras[1])
    let fx = new Tone.Freeverb(roomSize, dampening);     
    signal.effects.push(fx)
    return signal
}

const jcreverb = (paras) => (signal) => {
    
    let roomSize = isNaN(paras[0]) ? 0.5 : parseFloat(paras[0]) 
    let fx = new Tone.JCReverb(roomSize)     
    signal.effects.push(fx)
    return signal
}

const delay = (paras) => (signal) => {

    let delayTime = isNaN(paras[0]) ? 0.25:  parseFloat(paras[0])
    let maxDelay = isNaN(paras[1]) ? 1: parseFloat(paras[0])
    let fx = new Tone.FeedbackDelay({
        delayTime: delayTime,
        maxDelay: maxDelay
    });   
    signal.effects.push(fx)
    return signal
}

const pingpong = (paras) => (signal) => {

        let delayTime = isNaN(paras[0]) ? 0.25 : parseFloat(paras[0])
        let maxDelayTime = isNaN(paras[1]) ? 1: parseFloat(paras[1])
        let fx = new Tone.PingPongDelay({
            delayTime: delayTime,
            maxDelayTime: maxDelayTime
        });
        signal.effects.push(fx)
        return signal
}

export {amp, filter, reverb, pingpong, adsr, freeverb, jcreverb, delay}