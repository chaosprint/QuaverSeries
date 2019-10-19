import {amp, filter, reverb, pingpong} from "./fx"
import {monoSynth, noise, lfo, membrane, metalphone, fm, pluck} from './synth'
import {bpm, adsr, loop} from './control'

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
    amp: amp,

    // control
    bpm: bpm,
    adsr: adsr,
    loop: loop,
}

export {funcLib}