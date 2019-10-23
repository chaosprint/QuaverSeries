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

export {pipe, nextBar, slightlyBefore}