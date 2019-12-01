import {lang} from './lang'
import {funcLib} from './func'
import {nextBar, reducer} from './helpers'
import {sampleList} from './samples'
import Tone from 'tone'

var ohm = require('ohm-js')
var grammar = ohm.grammar(lang)
var semantics = grammar.createSemantics();

var refName = "";
var funcNameTemp, funcDefTemp;
var userFuncLib = {};

var codeRef = {}
var unModifiedRefList = []
var modifiedRefList = []

window.funcList = {}
window.tracks = {}
window.playlist = []

var actions = {

    Piece: pieceStackOrBlock => {
        pieceStackOrBlock.run()
    },

    Piece_stack: (piece, _listOfNewLineToken, block) => {
        piece.run()
        block.run()
    },

    Block: block => {
        if (block.ctorName !== "comment") { // otherwise it is a comment
            if (block.sourceString !== "") {
                block.run()
            }    
        }
    },

    Def: (funcName, _is, funcDef, _end) => {

        // let args = funcDef.sourceString.match(/(?<=\[).*?(?=\])/g)
        let args = funcDef.sourceString.match("random") // temp; to support Firefox
        funcNameTemp = funcName.sourceString
        funcDefTemp = args.join("=>")
        funcDef.run()
    },

    FuncDef: (def) => {
        def.run()
    },

    FuncDef_new: (_funcDef, funcBody) => {
        // _funcDef.run()
        funcBody.run()
    },

    FuncBody: (chain) => {

        let init, arr;
        if (chain.sourceString.match(/>>/g) === null) {
            arr = chain.sourceString.split(" ")
            init = arr.shift()
        }

        funcDefTemp = "ref=>" + funcDefTemp + "=>" + init

        arr.forEach(i=> funcDefTemp += "(" + i + ")" )
        userFuncLib[funcNameTemp] = eval(funcDefTemp)

    },

    Track: (ref, _colon, chain) => {

        refName = ref.sourceString  // can be "", anonymous
        refName = refName === "" ? "anonymous" : refName

        window.funcList[refName] = []

        if (codeRef[refName] === chain.sourceString) {
            unModifiedRefList.push(refName)
        } else {
            modifiedRefList.push(refName)
        }

        codeRef[refName] = chain.sourceString // an obj to store code
        chain.run()
    },

    Chain: (chainStackOrFunc) => {
        chainStackOrFunc.run();
    },

    Chain_stack: (chain, _doubleGreaterThanToken, func) => {
        chain.run() // another chain_rec
        func.run() // a func
    },

    Func: (name, elem) => {
       
        let funcName = name.sourceString
        let funcElem = elem.sourceString.replace(/,/g, "").split(" ")

        // console.log(funcName, funcElem)
        if (funcName === "") { // the func is only a ref e.g. >> ~func >>
            window.funcList[refName].push(funcElem[0]) // funcElem is sth like "~my_fx"

        } else {
            // console.log(funcLib)
            let func;
            
            if (funcLib[funcName]) {
                func = funcLib[funcName](funcElem)
                window.funcList[refName].push(func)
            } else if (funcName in userFuncLib) {
                func = userFuncLib[funcName]
                window.funcList[refName].push(func)
                funcElem.forEach( e => window.funcList[refName].push(f=>f(e)))//curry
            }
            
        }
    }
}

semantics.addOperation('run', actions);

const initGlobalVariables = () => {
    window.funcList = {}
    window.playlist = []
    unModifiedRefList = []
    modifiedRefList = []
}

const sampleInfo = () => {
    let arr = []
    Object.keys(sampleList).sort((a,b)=>a.length - b.length).forEach((item)=>{
        arr.push(item, sampleList[item].length, " ")
    })
    console.info(...arr)
}

const run = (code) => {

    console.clear()
    sampleInfo()

    Tone.context.latencyHint = "interactive"

    let match = grammar.match(code)

    console.log(match.succeeded())

    if (match.succeeded()) {

        // clean global variables right
        initGlobalVariables()
        window.tracks = {}
        codeRef = {}

        Tone.Transport.start()

        // get global variables right
        semantics(match).run()

        // lazy evaluation
        for (let ref in window.funcList) {
            if (unModifiedRefList.indexOf(ref) === -1) {
                try {
                    window.funcList[ref].reduce(reducer, ref)
                } catch(e){
                    console.log(e)
                }
            }
        }

        for (let item in window.tracks) {
            if ("seq" in window.tracks[item]) {
                window.tracks[item].seq.start()
            } else {
                if (window.tracks[item].dur === "hold") {
                    
                    window.tracks[item].env.triggerAttack()
                } else {
                    window.tracks[item].env.triggerAttackRelease(window.tracks[item].dur)
                }
            }
        }

        console.log(
            "window.funcList\n\n",window.funcList,
            "\n\nwindow.playlist\n\n", window.playlist,
            "\n\nwindow.tracks\n\n", window.tracks,
            "\n\nunModifiedRefList\n\n", unModifiedRefList,
            "\n\nmodifiedRefList\n\n", modifiedRefList
        )

        console.log(Tone.context.latencyHint)
    };
}

const update = (code) => {

    console.clear()
    sampleInfo()

    let match = grammar.match(code)

    console.log(match.succeeded())
    if (match.succeeded()) {

        let next = nextBar()

        initGlobalVariables()

        // get global variables right
        semantics(match).run()

        // 1. user can comment in and out the same thing
        let commentOutList = Object.keys(codeRef).filter(
            // neither in unModifiedRefList nor in modifiedRefList
            item => (unModifiedRefList.concat(modifiedRefList).indexOf(item) === -1) )

        commentOutList.forEach( i => {
            codeRef[i] = "commented out" // this string can be anything
        })

        // 2. recursively use the modifiedRefList to search unmodifiedRefList

        if (unModifiedRefList.length > 0) {

            const relatedToModifiedRefs = ref => {
                let code = codeRef[ref]
                let searchResult = modifiedRefList.filter( serachItem => {
                    return code.search(serachItem) !== -1
                })
                return searchResult.length !== 0
            }

            const has = (arr) => (item) => !arr.includes(item)

            for (let i = 0; i < 500; i++) { // can change to while true
                let findings = unModifiedRefList.filter(relatedToModifiedRefs)
                modifiedRefList.push(...findings)
                unModifiedRefList = unModifiedRefList.filter( has(findings) )

                if (findings.length === 0) {
                    break
                }
            }
        }

        // schedule to stop current playing tracks on the start of next bar 
        for (let item in window.tracks) {
            if ("seq" in window.tracks[item]) {
                console.log("progress", item, window.tracks[item].seq.progress)
            }

            if (unModifiedRefList.indexOf(item) === -1) {
                if ("seq" in window.tracks[item]) {
                    window.tracks[item].seq.stop(next)
                } else {
                    window.tracks[item].env.triggerRelease()
                }
            }
        }

        // create new tracks and playlist
        for (let ref in window.funcList) {
            if (unModifiedRefList.indexOf(ref) === -1) {
                try {
                    window.funcList[ref].reduce(reducer, ref)
                } catch(e){
                    console.log(e)
                }
            }
        }

        // schedule to start new playlist
        window.playlist.forEach( item => {
            if (unModifiedRefList.indexOf(item) === -1) {
                if ("seq" in window.tracks[item]) {
                    window.tracks[item].seq.start(next)
                } else {
                    if (window.tracks[item].dur === "hold") {
                        window.tracks[item].env.triggerAttack()
                    } else {
                        window.tracks[item].env.triggerAttackRelease(window.tracks[item].dur)
                    }
                }
            }
        })

        console.log(
            "window.funcList\n\n",window.funcList,
            "\n\nwindow.playlist\n\n", window.playlist,
            "\n\nwindow.tracks\n\n", window.tracks,
            "\n\nunModifiedRefList\n\n", unModifiedRefList,
            "\n\nmodifiedRefList\n\n", modifiedRefList
        )

    };
}

const stop = () => {
    Tone.context.dispose()
    Tone.context = new AudioContext();
    initGlobalVariables()
    codeRef = {}

}

export default {run, stop, update}