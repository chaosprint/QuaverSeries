import {lang} from './engine/lang'
import {funcLib} from './engine/func'
import {pipe, nextBar} from './helpers'

const Tone = require('tone')
var ohm = require('ohm-js')
var grammar = ohm.grammar(lang)
var semantics = grammar.createSemantics();

var refName;
window.playlist = []
window.funcList = {};

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
        ref = ref.sourceString
        refName = ref === "" ? Math.random() : ref // refering to current function chain
        window.funcList[refName] = []
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
            chain()
        }
    };
}

const update = (code) => {

    let match = grammar.match(code)

    if (match.succeeded()) {
        semantics(match).run() // will get window.funcList right

        let next = nextBar()

        // stop current playlist at the beginning of next bar
        window.playlist.forEach( trackObject => trackObject.seq.stop(next) )

        // schedule playlist for the next bar
        for (let item in window.funcList) {
            let chain = pipe(...window.funcList[item])
            chain(next)
        }
    };
}

const stop = () => {
    window.playlist.forEach( trackObject => trackObject.seq.stop(nextBar()))
    Tone.context.dispose()
    Tone.context = new AudioContext();
}

export default {run, stop, update}