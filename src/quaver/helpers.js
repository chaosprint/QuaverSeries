const Tone = require('tone')

const reducer = (funcChain, currentFunc) => {
    if (typeof currentFunc === "function") {
        return currentFunc(funcChain)
    } else { // should be a ref String
        return window.funcList[currentFunc].reduce(reducer, funcChain)
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

const noteToNum = (shift) => (note) => {

    // console.log(note)

    if (typeof note === "function" || typeof note  === "number" || note  === null) {

        return note

    } else if (Array.isArray(note)) {

        return note.map( noteToNum(shift) )

    } else {

        if (note.indexOf("_")===-1) { // x is only MIDI note number

            if (!isNaN(parseFloat(note))) {
                return parseFloat(note) + shift
            } else {
                return window.funcList[note].reduce(reducer, shift)
            }
        
        } else if (note ==="_") { // x is a rest

            return null

        } else { // note is compound note

            while (note.indexOf("_") !== -1) { // seperate the compound note
                note = note.replace("_", "@$")
            }

            // return an array to make it nested, Tone.js uses Tidal style
            return note.split("$").filter(note => note !== "").map(
                note => {
                    if (note === "@") {
                        return null
                    } else {
                        if (!isNaN(parseFloat(note))) {
                            return parseFloat(note) + shift
                        } else {
                            return window.funcList[note].reduce(reducer, shift)
                        }
                    }
            })
        }
    }
}

const numToMIDI = (item) => {
    // console.log("tomidi", typeof item)

    if ( Array.isArray(item) ) {
        item = item.map(numToMIDI)
        return item
    }

    if (typeof item === "function") {
        // console.log("return", item)
        return item
    } else {
        return item === null ? null : Tone.Frequency(item, "midi").toNote()
    }
}

const notesFuncExec = firstLayerArray => {
        if (typeof firstLayerArray === "function"){
            firstLayerArray = firstLayerArray()
        }
        return firstLayerArray
}

export {nextBar, noteToNum, numToMIDI, notesFuncExec, reducer}