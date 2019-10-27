var Tone = require('tone')

const amp = (vol) => (signal) => {

    // console.log(signal)
    let amp = vol[0] !== "_" ? parseFloat(vol[0]) : 0.5
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

    let roomSize = paras[0] ? parseFloat(paras[0]) : 0.7
    let dampening = paras[1] ? parseFloat(paras[1]) : 3000
    let fx = new Tone.Freeverb(roomSize, dampening);     
    signal.effects.push(fx)
    return signal
}

const pingpong = (paras) => (signal) => {

        let delayTime = paras[0] ? parseFloat(paras[0]) : 0.25
        let maxDelayTime = paras[1] ? parseFloat(paras[1]) : 1
        let fx = new Tone.PingPongDelay({
            delayTime: delayTime,
            maxDelayTime: maxDelayTime
        });
        signal.effects.push(fx)
        return signal
}

export {amp, filter, reverb, pingpong, adsr}