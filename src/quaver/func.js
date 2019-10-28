import {amp, filter, pingpong, adsr, reverb, freeverb, jcreverb, delay} from "./fx"
import {monoSynth, noise, lfo, membrane, metalphone, fm, pluck, sampler} from './synth'
import {bpm, loop, shift, every, speed, range, choose} from './control'

const funcLib = {

    // oscillator
    sawtooth: monoSynth("sawtooth"),
    square: monoSynth("square"),
    membrane: membrane,
    metalphone: metalphone,
    fm: fm,
    pluck: pluck,
    sampler: sampler,
    white: noise("white"),
    pink: noise("pink"),
    brown: noise("brown"),
    lfo: lfo,

    // effect
    lpf: filter("lowpass"),
    hpf: filter("highpass"),
    pingpong: pingpong,
    reverb: reverb,
    jcreverb: jcreverb,
    freeverb: freeverb,
    delay: delay,
    adsr: adsr,
    amp: amp,

    // control
    bpm: bpm,
    loop: loop,
    shift: shift,
    every: every,
    speed: speed,
    range: range,
    choose: choose
}

export {funcLib}