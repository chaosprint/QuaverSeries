import {lang} from './engine/lang'
import {synthLib} from  './engine/synth'
import {newLoop, ctrLib} from './engine/control'
import {fxLib} from './engine/fx'

var ohm = require('ohm-js')
var Tone = require('tone')
var grammar = ohm.grammar(lang)
var semantics = grammar.createSemantics();

var env, notes, dur
var trackName, synthName, refTarget
var refName, anonymous
var tracks = {}
var refList = {}
var playlist = []

var nextBar = () => {
    let pos = Tone.Transport.position.split(":")
    pos[0] = (parseInt(pos[0]) + 1).toString()
    pos[1] = "0"
    pos[2] = "0"
    pos = pos.join(":")
    return pos
}

var actions = {

    Piece_stack: (top, n1, n2, n3, down) => {
        top.run()
        down.run()
    },

    Piece: block => {
        block.run()
    },

    Block: block => {
        if (block.ctorName === "Track") {block.run()} // otherwise it is a comment
    },

    Track: (ref, colon, chain) => {        
        let name = ref.sourceString
        // refList is an Array that has many refs; refs are objects
        // {~cut_freq: filter.frequency}
        if (name !== "") { // can be a mod or synth
            anonymous = false
            if (refList[name]) { // it is a ref, e.g. ~cut_freq: lfo 10 300 3000
                refTarget = refList[name] //returns a ref
            } else { // it is a synth ref, or users forget to write the ref target
                refName = name // will use it later
                playlist.push(refName) // synth ref should be put to playlist          
            }
        } else {
            anonymous = true
        }
        chain.run()
    },

    Chain_stack: (left, shiftOp, right) => {
        left.run() // another chain_rec
        right.run() // a func
    },

    Chain: (func) => { // the final chain_rec
        func.run();
    },

    Func: (name, list) => {
        let kind = name.sourceString
        let paras = list.sourceString.split(' ')

        if (ctrLib[kind]) {

            notes = kind === "loop" ? ctrLib[kind](paras) : notes
            if (kind === "bpm") {ctrLib[kind](paras)}
            if (kind === "adsr") {env = ctrLib[kind](paras)}

        } else if (synthLib[kind]) {
            synthName = kind
            trackName = anonymous ? synthName : refName
            tracks[trackName] = {effectList: []}

        } else if (fxLib[kind]) {

            if (kind !== "amp") {
                if (refTarget) { // if there is a need to connect
                    let fx = fxLib[kind](paras)
                    // return a fx = {item: a Tone.LFO, ref:{~anotherLFOName: lfo.freq}}
                    // the LFO freq can also be modulated by another LFO
                    refList = {...refList, ...fx.ref} // add fx modulation to refList
                    try {
                        fx.item.connect(refTarget)
                    } catch(e) {console.log(e)} // avoid unsupported modulation              
                    refTarget = null
                    try {
                        if (fx.item.state !== "started") { fx.item.start()}
                        // currently fx menas lfo, so it needs to start
                    } catch(e) {console.log(e)} 
                } else {
                    let fx = fxLib[kind](paras)
                    tracks[trackName].effectList.push(fx.item)
                    refList = {...refList, ...fx.ref}
                }
            } else {
                // when there is an amp, we need to organise the current synth
                if (anonymous) {playlist.push(trackName)}
                let track = tracks[trackName]
                let amp = paras[0] !== "_" ? parseFloat(paras[0]) : 1
                track.effectList.push(Tone.Master)
                track.synth = synthLib[synthName]()
                track.synth.volume.value = 20 * Math.log10(amp)
                if (env) {
                    track.synth.set({envelope: env})
                    dur = env.attack + env.decay
                    env = null
                } else {
                    dur = 0.2
                }
                track.synth.chain(...track.effectList)
                track.seq = newLoop(notes, dur, track.synth)
            }
        }
    }
}

semantics.addOperation('run', actions);

var run = (code) => {
    Tone.context.dispose()
    Tone.context = new AudioContext()

    try {
        var match = grammar.match(code)
        // tracks = {}
        if (match.succeeded()) {
            semantics(match).run() // get the tracks object right

            Tone.Transport.stop()
            Tone.Transport.start()
    
            try {
                for (let item in tracks) {
                    tracks[item].seq.stop()
                }
            } catch (e) {console.log(e)}
        
            for (let item in tracks) {
                if ("seq" in tracks[item]) {
                    tracks[item].seq.start()
                }
            }
        };
    } catch(e) {
        console.log(e)
    }
}

var update = (code) => {
    // try {
        var match = grammar.match(code)

        if (match.succeeded()) { // if not, no update
            playlist = [] // clear previous playlist

            let next = nextBar()
            for (let item in tracks) {
                if ("seq" in tracks[item]) {
                    try {
                        tracks[item].seq.stop(next)
                    } catch (e) {console.log(e)}
                   
                }
            }

            semantics(match).run() // get the tracks object right

            playlist.forEach( item => {
                if (item in tracks) {
                    if ("seq" in tracks[item]) {
                        try {
                            tracks[item].seq.start(next)
                        } catch (e) {console.log(e)} 
                       
                    }
                }
            })
        };
}

var stop = () => {
    try {
        Tone.context.dispose()
        Tone.context = new AudioContext();
    } catch (e) {
        console.log(e)
    }
}

export default {run, stop, update}