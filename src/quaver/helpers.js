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

export {pipe, nextBar}