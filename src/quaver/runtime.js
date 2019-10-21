import {lang} from './lang'
import {funcLib} from './func'
import {pipe, nextBar} from './helpers'

var Tone = require('tone')
var ohm = require('ohm-js')
var grammar = ohm.grammar(lang)
var semantics = grammar.createSemantics();

var refName = "";

window.funcList = {}
window.lazyList = {}
window.tracks = {}
window.playlist = []

var actions = {

    Piece: pieceStackOrBlock => {
        pieceStackOrBlock.run()
    },

    Piece_stack: (piece, _newLineToken1, _newLineToken2, _newLineToken3, block) => {
        piece.run()
        block.run()
    },

    Block: block => {
        if (block.ctorName === "Track") {
            block.run()
        } // otherwise it is a comment
    },

    Track: (ref, _colon, chain) => {
        refName = ref.sourceString  // can be "", anonymous
        if (refName !== "") { window.funcList[refName] = [] }
        chain.run()
    },

    Chain: (chainStackOrFunc) => {
        chainStackOrFunc.run();
    },

    Chain_stack: (chain, _doubleGreaterThanToken, func) => {
        chain.run() // another chain_rec
        func.run() // a func
    },

    Func: (name, paras) => {

        let funcName = name.sourceString
        let funcElem = paras.sourceString.split(" ") // an array with string paras

        if (refName === "") { // for anonymous ref, use funcName as refName
            refName = funcName // todo: logic connction with Tracks
            window.funcList[refName] = []
        }
        
        if (funcName === "") { // the func is only a ref e.g. >> ~func >>

            let newLazyFunc = {
                index: window.funcList[refName].length,
                item: funcElem
            }

            window.lazyList[refName] = window.lazyList[refName] ? 
               [...window.lazyList[refName], newLazyFunc] : [newLazyFunc] 

        } else {
            let func = funcLib[funcName](funcElem)
            window.funcList[refName].push(func)
        }
    }
}

semantics.addOperation('run', actions);

const handleLazyFunc = () => {

    for (let item in window.lazyList) { // set funcList Right
        let shift = 0
        window.lazyList[item].forEach( (lazy)=> {
            window.funcList[item].splice(lazy.index+shift, 0, ...window.funcList[lazy.item])
            shift += window.funcList[lazy.item].length
        })
    }

    for (let item in window.funcList) {
        let chain = pipe(...window.funcList[item])
        try {chain(item)} catch(e) {
            // console.log(e)
        }
    }
}

const initGlobalVariable = () => {
    window.funcList = {}
    window.lazyList = {}
    window.playlist = []
}

const run = (code) => {

    let match = grammar.match(code)

    if (match.succeeded()) {

        initGlobalVariable()
        window.tracks = {}

        Tone.context.dispose()
        Tone.context = new AudioContext()
        Tone.Transport.stop()
        Tone.Transport.start()

        semantics(match).run() // get the tracks object right

        handleLazyFunc()

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

        let next = nextBar()
        initGlobalVariable()
        semantics(match).run() // set window.funcList right
        
        // stop current tracks at the beginning of next bar
        for (let item in window.tracks) {
            window.tracks[item].seq.stop(next)
        }

        handleLazyFunc()

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