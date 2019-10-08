var Tone = require('tone')

const newLoop = (notes, dur=0.2, synth) => {
    return new Tone.Sequence( (time, note) => {
        if (synth.noise) {
            synth.triggerAttack(time);
        } else {
            synth.triggerAttackRelease(note, dur, time);
        }
    }, notes, Tone.Time('1m') / notes.length
    );
}

const ctrLib = {
    loop: (paras) => {return paras.map(
        (x) => { // x can be compound
            if (x.indexOf("_")===-1) { // if this is only number
                // return "C1"
                return Tone.Frequency(parseFloat(x), "midi").toNote()
            } else if (x ==="_") {
                return null
            } else {
                while (x.indexOf("_") !== -1) {
                    x = x.replace("_", ",r,")
                }
                return x.split(",").filter(x => x !== "").map(
                    x => x==="r" ? null: Tone.Frequency(parseFloat(x), "midi").toNote() )
            }
        } 
    )},

    bpm: (paras) => {
        Tone.Transport.bpm.value = parseFloat(paras[0])
    },

    adsr: (paras) => {

        // well you get a list of paras
        // you need to analyse where the ref is (it can be refs too!)
        let p = paras.map((x)=>{return x === "_"? null: parseFloat(x)})
        let env = {
            "attack": (p[0] !== null) ? p[0] : 0.1,
            "decay": (p[1] !== null) ? p[1] : 0.1,
            "sustain": (p[2] !== null) ? p[2] : 0.5,
            "release": (p[3] !== null) ? p[3] : 0.5
        }
        return env
    },
}

export {newLoop, ctrLib}