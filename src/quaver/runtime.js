import {lang} from './lang'
import {funcLib} from './func'
import {pipe, nextBar} from './helpers'

var Tone = require('tone')
var ohm = require('ohm-js')
var grammar = ohm.grammar(lang)
var semantics = grammar.createSemantics();

var refName = "";

var codeRef = {}
var bypass = []
var modify = []

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
        if (refName !== "") {
            window.funcList[refName] = []
        } else {
            refName = "anonymous"
        }

        if (codeRef[refName] === chain.sourceString) {// there is no update
            // do not stop this ref in update, no need to schedule its playing
            bypass.push(refName)
        } else { // there is some update
            modify.push(refName)
        }

        codeRef[refName] = chain.sourceString
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
        let funcElem = paras.sourceString.replace(/,/g, "").split(" ") // an array with string paras

        if (refName === "anonymous") { // for anonymous ref, use funcName as refName
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

const initGlobalVariables = () => {
    window.funcList = {}
    window.lazyList = {}
    window.playlist = []
    bypass = []
    modify = []
}

const run = (code) => {

    let match = grammar.match(code)

    if (match.succeeded()) {

        initGlobalVariables()
        window.tracks = {}
        codeRef = {}

        Tone.Transport.start()

        semantics(match).run() // get the tracks object right

        for (let item in window.lazyList) { // set funcList Right
            let shift = 0
            window.lazyList[item].forEach( (lazyFunc)=> {
                window.funcList[item].splice(lazyFunc.index+shift,
                    0, ...window.funcList[lazyFunc.item])
                shift += window.funcList[lazyFunc.item].length
    
            })
        }

        for (let item in window.funcList) {
            if (bypass.indexOf(item) === -1) {
                let chain = pipe(...window.funcList[item])
                try {chain(item)} catch(e) {
                    console.log(e)
                }
            }
        }

        for (let item in window.tracks) {
            window.tracks[item].seq.start()
        }
    };
}

const update = (code) => {

    let match = grammar.match(code)

    if (match.succeeded()) {

        let next = nextBar()

        initGlobalVariables()

        semantics(match).run() // set window.funcList right

        if (bypass.length > 0) {
            bypass = bypass.filter(i=>{
                return modify.filter( j=>(codeRef[i].search(j) !== -1) ).length === 0
            })
        }

        let comment = Object.keys(codeRef).filter(
            item => (bypass.concat(modify).indexOf(item) === -1) )
            
        comment.forEach( i => {
            codeRef[i] = "commented"
        })

        // console.log(
        //     "bypass", bypass,
        //     "\n modify", modify
        // )

        // stop current tracks at the beginning of next bar
        for (let item in window.tracks) {
            if (bypass.indexOf(item) === -1) {
                window.tracks[item].seq.stop(next)
            }
        }

        for (let item in window.lazyList) { // set funcList Right
            let shift = 0
            window.lazyList[item].forEach( (lazyFunc)=> {
    
                window.funcList[item].splice(lazyFunc.index+shift,
                    0, ...window.funcList[lazyFunc.item])
                shift += window.funcList[lazyFunc.item].length
            })
        }
    
        for (let item in window.funcList) {
            if (bypass.indexOf(item) === -1) {
                // console.log(item, "chain and run")
                let chain = pipe(...window.funcList[item])
                try {chain(item)} catch(e) {
                    // console.log(e)
                }
            }
        }

        window.playlist.forEach( item => {
            if (bypass.indexOf(item) === -1) {
                // console.log(item, "play")
                window.tracks[item].seq.start(next)
            }     
        })
    };
}

const stop = () => {
    Tone.context.dispose()
    Tone.context = new AudioContext();
    initGlobalVariables()
    codeRef = {}
}

export default {run, stop, update}