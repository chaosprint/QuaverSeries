import {amp, filter, pingpong, adsr, reverb, freeverb, jcreverb, delay} from "./fx"
import {monoSynth, noiseSynth, membrane, metalphone, fm, pluck, sampler} from './synth'
import {noise, pwm, oscillator, lfo} from './oscillator'
import {bpm, loop, shift, every, speed, range, choose, play, set_gate, set_gate_all, midi_out} from './control'
import {print} from './fp'

const funcLib = {

    // synth
    sawtooth: monoSynth("sawtooth"),
    square: monoSynth("square"),
    triangle: monoSynth("triangle"),
    white: noiseSynth("white"),
    pink: noiseSynth("pink"),
    brown: noiseSynth("brown"),
    membrane: membrane,

    saw_synth: monoSynth("sawtooth"),
    squ_synth: monoSynth("square"),
    tri_synth: monoSynth("square"),
    sin_synth: membrane,
    pluck: pluck,

    // incomplete
    metalphone: metalphone,
    fm_synth: fm,
    sampler: sampler,

    // oscillator
    pwm: pwm,
    lfo: lfo("sine"),
    sin_lfo: lfo("sine"),
    squ_lfo: lfo("square"),
    saw_lfo: lfo("sawtooth"),
    tri_lfo: lfo("triangle"),
    sin_osc: oscillator("sine"),
    saw_osc: oscillator("sawtooth"),
    squ_osc: oscillator("square"),
    tri_osc: oscillator("triangle"),
    white_noise: noise("white"),
    pink_noise: noise("pink"),
    brown_noise: noise("brown"),

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
    play: play,
    set_gate: set_gate,
    midi_out: midi_out,
    set_gate_all: set_gate_all,

    print:print
}

export {funcLib}