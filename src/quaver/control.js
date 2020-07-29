import {noteToNum, numToMIDI, notesFuncExec, reducer, handlePara} from './helpers'
import Tone from 'tone'

const JZZ = require('jzz');

// console.log(JZZ().info())

const bpm = paras => {
    try {
        Tone.Transport.bpm.value = handlePara(paras[0], 120)
    } catch(e) {console.log(e)}
    return () => {}
}

const midi_out = paras => () => {
    var devices = []
    navigator.requestMIDIAccess()
    .then(
        // success
        (midi) => {
            for (let output of midi.outputs.values()) {
                console.log(output)
                devices.push(output.name)
            }
        },
    // failure
    ()=>{});

    const seq = new Tone.Sequence(
        // the function to call for each note
        (time, note) => {

            if (typeof note === "function") {      
                note = numToMIDI(note())
            }

            if (note !== "C-1") {
                devices.forEach((d)=>{
                    JZZ().or('Cannot start MIDI engine!')
                    .openMidiOut(d).or('Cannot open MIDI Out port!')
                    .wait(0).send([0x90,Tone.Midi(note).toMidi(),127]) // note on
                    .wait(Tone.Time("0.5").toMilliseconds()).send(
                        [0x80,Tone.Midi(note).toMidi(),0]);
                })
            }
        },
        
        // an array of notes
        paras
        .map(notesFuncExec) // keep the shape same, only process functions
        .map( noteToNum(0) ) // one array or nested array
        .map(numToMIDI),
        // the gap between each note
        Tone.Time('1m') / paras.map( noteToNum(0) ).length
    )
    seq.start()
}

const loop = paras => ref => {
    paras = paras[0] ? paras : ["60"]
    var initEnv = undefined
    return { // this obj is the trigger for sytnh
        env: initEnv,
        notes: paras,
        shift: 0,
        period: 1,
        connector: function (synth) { // non-arrow function in order to use "this"
            let i = 0;
            // console.log(this.notes.map(notesFuncExec))
            return { // this obj is the signal for fx
                env: this.env,
                ref: ref, // ref can be empty ""
                synth: synth,
                effects: [],
                seq: new Tone.Sequence(
                    // the function to call for each note
                    (time, note) => {
                        
                        if (typeof note === "function") {      
                            note = numToMIDI(note())
                        }

                        if (typeof this.gate === "undefined") {
                            this.gate = ["_"]
                        }

                        if (typeof this.defaultGate === "undefined") {
                            this.defaultGate = "16n"
                        }

                        let dur = isNaN(
                            parseFloat(this.gate[i])
                        ) ? this.defaultGate : this.gate[i]

                        if (synth.noise) {
                            synth.triggerAttackRelease(dur, time);
                        } else if (synth._buffer) {
                            try {
                                synth.start(0)
                            } catch (e) {
                                console.log(e)
                            }
                        } else if (synth._buffers) {
                            try {
                                synth.triggerAttack(note, time)
                            } catch (e) {
                                console.log(e)
                            }
                        }  else {
                            if (note !== "C-1") {
                                try {
                                    // console.log(note, dur)
                                    synth.triggerAttackRelease(note, dur, time)
                                    i += 1
                                    i = (i === this.gate.length) ? 0 : i                    
                                } catch(e) {console.log(e)}
                            }
                        }
                    },

                    // an array of notes
                    this.notes
                    .map(notesFuncExec) // keep the shape same, only process functions
                    .map( noteToNum(this.shift) ) // one array or nested array
                    .map(numToMIDI),

                    // the gap between each note
                    Tone.Time('1m') * this.period / this.notes.map(noteToNum(this.shift)).length
                )
            }
        }
    }
}

const every = paras => trigger => {

    let period = handlePara(paras[0], 4)
    try {
        var ref = paras[1] // how to check
    } catch (e){console.log(e)}

    let notes = () => {
        // this will ignore the speed
        let alternativeRef = window.funcList[ref].reduce(reducer, ref)
        return alternativeRef.notes.map( noteToNum(alternativeRef.shift) )
    }

    let newNotes = []
    for (let i = 0; i < period - 1; i++) {
        newNotes.push(trigger.notes)
    }
    newNotes.push(notes)
    // console.log(newNotes)
    trigger.period = trigger.period * period
    trigger.notes = newNotes
    return trigger
}

const speed = paras => trigger => {
    let speedTimes = handlePara(paras[0], 1)
    trigger.period = trigger.period / speedTimes
    return trigger
}

const shift = paras => trigger => {
    let note = paras[0]
    note = parseInt(paras[0])
    trigger.shift = isNaN(note) ? 0 : note;
    console.log("trigger.shift", trigger.shift)
    return trigger
}

const set_gate_all = paras => trigger => {
    trigger.defaultGate = isNaN(parseFloat(paras[0])) ? "16n" : paras[0]
    return trigger
}

const set_gate = paras => trigger => {
    trigger.gate = paras
    return trigger
}

const range = paras => shift => {
    // console.log("shift is", shift)
    let condition = paras.length === 2 & (
        typeof parseFloat(paras[0]) === "number") & (
        typeof parseFloat(paras[1]) === "number")
    if (condition) {
        let a = parseFloat(paras[0])
        let b = parseFloat(paras[1])
        let min = a < b ? a : b
        let max = a < b ? b : a
        let range = Math.abs(max - min)
        return () => Math.floor( Math.random() * range + min + shift)
    } else {
        return () => Math.floor(30 + shift)
    }
}

const choose = paras => shift => {
    let choice = paras.map(parseFloat)
    let condition = choice.every(currentValue => typeof currentValue === "number")
    if (condition) {
        return () => choice[Math.floor(Math.random() * choice.length)] + shift
    } else {
        return () => (30 + shift)
    }
}

const play = paras => ref => {
    var initEnv = {
        "attack" : 0.6,
        "decay" : 0,
        "sustain" : 1,
        "release" : 0.6,
    }
    return { // this is a trigger
        env: initEnv,
        connector: function (synth) {
            let dur = handlePara(paras[0], "hold")
            let synthEnv = new Tone.Envelope(this.env)

            if (synth.filter) {
                console.log("mismatch play and synth")
            } else {
                return { // a Signal
                    ref: ref,
                    env: synthEnv,
                    dur: dur,
                    synth: synth,
                    effects: []
                }
            }
        }
    }
}

const mode = paras => {
    try {
        Tone.context.latencyHint = paras[0].replace("\\", "")
    } catch (e) {console.log(e)}
}

const adsr = paras => trigger => {
    let env = {
        "attack": handlePara(paras[0], 0.1),
        "decay": handlePara(paras[1], 0.1),
        "sustain": handlePara(paras[2], 0.5),
        "release": handlePara(paras[3], 0.5),
    }
    try {
        if ("env" in trigger) {
            trigger.env = env
        }
    } catch {}
    return trigger
}

const line = paras => () => {
    let curve = paras[3] === "\\exp" ? "exponential": "linear"
    let env = new Tone.ScaledEnvelope({
        "attack" : handlePara(paras[0], 1),
        "decay": 0,
        "sustain": handlePara(paras[2], 1),
        "min" : handlePara(paras[1], 0),
        "max" : handlePara(paras[2], 1),
        "attackCurve": curve
    });

    return env
}

const noise_control = paras => () => {
    
    let a = handlePara(paras[0], 0)
    let b = handlePara(paras[1], 1)
    let min = a < b ? a : b
    let max = a < b ? b : a
    let scale = new Tone.Scale(min, max);
    let controller = new Tone.Noise().connect(scale)
    controller._playbackRate = handlePara(paras[2], 1)
    // let scale = new Tone.Scale(min, max);
    // controller.connect(scale)
    controller.start(0)
    return scale
}

export {bpm, loop, shift, every, speed, range, mode,
    choose, play, set_gate, set_gate_all, midi_out, adsr, line, noise_control}