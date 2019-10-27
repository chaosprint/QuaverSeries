const Tone = require('tone')

const pipe = (...args) => {
    return x => {
        args.reduce(
            (outputValue, currentFunction) => currentFunction(outputValue),
        x)
    }
}

const nextBar = () => {
    let pos = Tone.Transport.position.split(":")
    pos[0] = (parseInt(pos[0]) + 1).toString()
    pos[1] = "0"
    pos[2] = "0"
    pos = pos.join(":")
    return pos
}

const slightlyBefore = (pos) => {
    pos = pos.split(":")
    pos[0] = (parseInt(pos[0]) - 1).toString()
    pos[1] = "3"
    // convert 0.01s to 16th note portion
    pos[2] = (1 - (0.01 /(60 / Tone.Transport.bpm.value /4))).toString()
    pos = pos.join(":")
    console.log("join", pos)
    return pos
}

const noteToNum = (shift) => (note) => {

    // console.log(note)

    if (typeof note === "function") {
        return note
    } else if (Array.isArray(note)) {
        return note.map(noteToNum(shift))
    } else if (typeof note  === "number") {
            return note
    } else if (note  === null) {
        return note
    } else {

        if (note.indexOf("_")===-1) { // x is only MIDI note number

            return parseFloat(note) + shift
        
        } else if (note ==="_") { // x is a rest

            return null

        } else { // note is compound note

            while (note.indexOf("_") !== -1) { // seperate the compound note
                note = note.replace("_", "@$")
            }

            // return an array to make it nested, Tone.js uses Tidal style
            return note.split("$").filter(note => note !== "").map(
                note => note === "@" ? null: (parseFloat(note) + shift) )
        }
    }
}

const numToMIDI = (item) => {
    if ( Array.isArray(item) ) {
        item = item.map(numToMIDI)
        return item
    }
    return item === null ? null : Tone.Frequency(item, "midi").toNote()
}

const notesFuncExec = firstLayerArray => {
        if (typeof firstLayerArray === "function"){
            firstLayerArray = firstLayerArray()
        }
        return firstLayerArray
}

const reducer = (funcChain, currentFunc) => {

    // console.log(funcChain, currentFunc)

    if (typeof currentFunc === "function") {
        return currentFunc(funcChain)
    } else { // should be a ref String
        return window.funcList[currentFunc].reduce(reducer, funcChain)
    }
}

export {pipe, nextBar, slightlyBefore, noteToNum, numToMIDI, notesFuncExec, reducer}