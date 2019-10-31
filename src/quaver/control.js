import {noteToNum, numToMIDI, notesFuncExec, reducer} from './helpers'
import Tone from 'tone'

const bpm = paras => {
    try {
        Tone.Transport.bpm.value = parseFloat(paras[0])
    } catch(e) {console.log(e)} 
    return () => {}
}

const loop = paras => ref => ({ // this obj is the trigger for sytnh
    notes: paras,
    shift: 0,
    period: 1,
    connector: function (synth) { // non-arrow function in order to use "this"

        // console.log(this.notes.map(notesFuncExec))
        return { // this obj is the signal for fx

            ref: ref, // ref can be empty ""
            synth: synth,
            effects: [],
            seq: new Tone.Sequence(

                // the function to call for each note

                (time, note) => {
                    
                    if (synth.noise) {
                        synth.triggerAttack(time);
                    } else {
                        // console.log(typeof note)
                        if (typeof note === "function") {      
                            note = numToMIDI(note())
                        }
                        if (note !== "C-1") {
                            synth.triggerAttackRelease(note, "16n", time);
                            // todo: sustain time should not be limited to "16n"
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

const range = paras => shift => {
    // console.log("shift is", shift)
    let a = parseFloat(paras[0])
    let b = parseFloat(paras[1])
    let min = a < b ? a : b
    let max = a < b ? b : a
    let range = Math.abs(max - min)
    return () => Math.floor( Math.random() * range + min + shift)
}

const choose = paras => shift => {
    let choice = paras.map(parseFloat)
    return () => choice[Math.floor(Math.random() * choice.length)] + shift
}

const switch_on = paras => ref => ({
    connector: function (synth) {
        var env = new Tone.Envelope({
            "attack" : 0.002,
            "decay" : 0,
            "sustain" : 1,
            "release" : 0.002,
        });
        return { // a Signal
            ref: ref,
            env: env,
            synth: synth,
            effects: []
        }
    }
})

export {bpm, loop, shift, every, speed, range, choose, switch_on}