import {noteToNum, numToMIDI, notesFuncExec, reducer, handlePara} from './helpers'
import Tone from 'tone'

const JZZ = require('jzz');

// console.log(JZZ().info())

const bpm = paras => {
    try {
        Tone.Transport.bpm.value = parseFloat(paras[0])
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

const loop = paras => ref => ({ // this obj is the trigger for sytnh
    notes: paras,
    shift: 0,
    period: 1,
    connector: function (synth) { // non-arrow function in order to use "this"
        let i = 0;

        // console.log(this.notes.map(notesFuncExec))
        return { // this obj is the signal for fx
            ref: ref, // ref can be empty ""
            synth: synth,
            effects: [],
            seq: new Tone.Sequence(
                // the function to call for each note
                (time, note) => {
                    // console.log(note)

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

                    // console.log(dur, time)
                    // console.log(typeof synth)
                    if (synth.noise) {
                        synth.triggerAttackRelease(dur, time);
                    } else if (synth._buffer) {
                        try {
                            synth.start()
                        } catch (e) {
                            console.log(e)
                        }
                        
                    }  else if (synth._buffers) {
                        try {
                            synth.triggerAttack(note)
                        } catch (e) {
                            console.log(e)
                        }
                    }  else {
                        if (note !== "C-1") {
                            try {
                                // console.log(note, dur)
                                synth.triggerAttackRelease(note, dur, time)
                                i += 1
                                i = i === this.gate.length ? 0 : i                    
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
})

const every = paras => trigger => {

    let period = parseFloat(paras[0])
    let ref = paras[1]

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
    let speedTimes = parseFloat(paras[0])
    trigger.period = trigger.period / speedTimes
    return trigger
}

const shift = shift => trigger => {
    trigger.shift = parseFloat(shift)
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
    console.log(choice)
    let condition = choice.every(currentValue => typeof currentValue === "number")
    console.log(condition)
    if (condition) {
        return () => choice[Math.floor(Math.random() * choice.length)] + shift
    } else {
        return () => (30 + shift)
    }
    
}

const play = paras => ref => ({
    connector: function (synth) {

        let dur = handlePara(paras[0], "hold")
        
        var env = new Tone.Envelope({
            "attack" : 0.6,
            "decay" : 0,
            "sustain" : 1,
            "release" : 0.6,
        });
        
        return { // a Signal
            ref: ref,
            env: env,
            dur: dur,
            synth: synth,
            effects: []
        }
    }
})

export {bpm, loop, shift, every, speed, range, choose, play, set_gate, set_gate_all, midi_out}