import {amp, filter, reverb, pingpong, adsr} from "./fx"
import {monoSynth, noise, lfo, membrane, metalphone, fm, pluck} from './synth'
import {bpm, loop, dub} from './control'

const funcLib = {

    // oscillator
    sawtooth: monoSynth("sawtooth"),
    square: monoSynth("square"),
    membrane: membrane,
    metalphone: metalphone,
    fm: fm,
    pluck: pluck,
    white: noise("white"),
    pink: noise("pink"),
    brown: noise("brown"),
    lfo: lfo,

    // effect
    lpf: filter("lowpass"),
    hpf: filter("highpass"),
    reverb: reverb,
    pingpong: pingpong,
    adsr: adsr,
    amp: amp,

    // control
    bpm: bpm,
    loop: loop,
    dub: dub
}

export {funcLib}