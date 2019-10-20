var Tone = require('tone')

const bpm = paras => {
    try {
        Tone.Transport.bpm.value = parseFloat(paras[0])
    } catch(e) {console.log(e)} 
    return () => {}
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

const loop = (notes) => {

    notes = notes.map( // convert notes from string array to Tone.js note array
        (x) => {
            if (x.indexOf("_")===-1) { // x is only MIDI note number
                // return "C1"
                return Tone.Frequency(parseFloat(x), "midi").toNote()
            } else if (x ==="_") { // x is a rest
                return null
            } else { // x is compound note
                while (x.indexOf("_") !== -1) {
                    x = x.replace("_", ",r,")
                }
                return x.split(",").filter(x => x !== "").map(
                    x => x==="r" ? null: Tone.Frequency(parseFloat(x), "midi").toNote() )
            }
        }
    )
    return (ref) => synth => {
        return {
            ref: ref,
            synth: synth,
            effects: [],
            seq: new Tone.Sequence(
                (time, note) => {
                    if (synth.noise) {
                        synth.triggerAttack(time);
                    } else {
                        synth.triggerAttackRelease(note, "16n", time);
                    }
                }, notes, Tone.Time('1m') / notes.length)
        }
    }
}

export {bpm, adsr, loop}