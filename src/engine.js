import {lang} from './engine/lang'
import {funcLib} from './engine/func'
import {pipe, nextBar} from './helpers'

const Tone = require('tone')
var ohm = require('ohm-js')
var grammar = ohm.grammar(lang)
var semantics = grammar.createSemantics();

var refName = "";
window.tracks = {}
window.playlist = []
window.funcList = {};
window.refNameList = {}

var actions = {

    Piece_stack: (top, n1, n2, n3, down) => {
        top.run()
        down.run()
    },

    Piece: block => {
        block.run()
    },

    Block: block => {
        if (block.ctorName === "Track") {
            block.run()
        } // otherwise it is a comment
    },

    Track: (ref, colon, chain) => {
        refName = ref.sourceString  // can be "", anonymous
        if (refName !== "") { window.funcList[refName] = [] }
        chain.run()
    },

    Chain_stack: (left, shiftOp, right) => {
        left.run() // another chain_rec
        right.run() // a func
    },

    Chain: (func) => { // the final chain_rec
        func.run();
    },

    Func: (name, paras) => {

        let funcName = name.sourceString
        let funcElem = paras.sourceString.split(" ") // an array with string paras

        if (refName === "") {
            refName = funcName // todo: logic connction with Tracks
            window.funcList[refName] = []
        }
        
        if (funcName === "") { // the func is only a ref e.g. >> ~func >>
            window.funcList[refName].push(...window.funcList[funcElem])
        } else {
            let func = funcLib[funcName](funcElem)
            window.funcList[refName].push(func)
        }
    },
}

semantics.addOperation('run', actions);

const run = (code) => {

    let match = grammar.match(code)

    if (match.succeeded()) {
        Tone.context.dispose()
        Tone.context = new AudioContext()
        Tone.Transport.stop()
        Tone.Transport.start()

        semantics(match).run() // get the tracks object right

        for (let item in window.funcList) {
            let chain = pipe(...window.funcList[item])
            chain(item) // this should be different
        }

        for (let item in window.tracks) {
            if ("seq" in window.tracks[item]) {
                window.tracks[item].seq.start()
            }
        }
    };
}

const update = (code) => {

    let match = grammar.match(code)

    if (match.succeeded()) {

        window.playlist = [] // clean the playlist ref
        window.funcList = {}
        semantics(match).run() // will get window.funcList right

        let next = nextBar()

        // stop current tracks at the beginning of next bar
        for (let item in window.tracks) {
            window.tracks[item].seq.stop(next)
        }

        // schedule tracks for the next bar
        for (let item in window.funcList) {
            let chain = pipe(...window.funcList[item])
            chain(item) // this refName should be different
        }

        window.playlist.forEach( item => {
            window.tracks[item].seq.start(next)
        })
    };
}

const stop = () => {
    Tone.context.dispose()
    Tone.context = new AudioContext();
}

export default {run, stop, update}