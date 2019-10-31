import {amp, filter, pingpong, adsr, reverb, freeverb, jcreverb, delay} from "./fx"
import {monoSynth, noise, lfo, membrane, metalphone, fm, pluck, sampler, pwm} from './synth'
import {bpm, loop, shift, every, speed, range, choose, switch_on} from './control'

const funcLib = {

    // oscillator
    sawtooth: monoSynth("sawtooth"),
    square: monoSynth("square"),
    membrane: membrane,
    metalphone: metalphone,
    fm: fm,
    pluck: pluck,
    sampler: sampler,
    pwm: pwm,
    white: noise("white"),
    pink: noise("pink"),
    brown: noise("brown"),
    lfo: lfo("sine"),
    sin_lfo: lfo("sine"),
    squ_lfo: lfo("square"),
    saw_lfo: lfo("sawtooth"),
    tri_lfo: lfo("triangle"),

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
    choose: choose,
    switch_on: switch_on
}

export {funcLib}