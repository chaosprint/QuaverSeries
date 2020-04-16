# Reference

A ```loop``` takes the *Sequence* and outputs a *Trigger*. The *Trigger* can trigger the *Synth* or *Oscillator* and output a *Signal*. The *Signal* will then go through several *Effects*, in which the ```amp``` should be the last to play the *Signal* out.

*Note: ```play``` is another function that can output a Trigger*

## Control

### bpm
```bpm``` sets the tempo of the piece. The default value is 120. Typically, the ```bpm``` function should be the only function without a ref name.
```
bpm 200.0
```

### loop

```
~bass: loop 30 _32 >> sawtooth >> amp 0.3
```


### speed
```
~hh: loop 1 >> speed 16.0 >> white >> hpf 8000.0 2.0 >> amp 0.3
```

### shift
```
~aa: loop 57 67 >> shift -7 >> sawtooth >> amp 0.3
```

This is the same as:

```
~aa: loop 50 60 >> sawtooth >> amp 0.3 
```

It can be used with ```every``` explained below.

### every

```
~aa: loop 57 67

~bb: ~aa >> shift -7

~xx: sawtooth >> amp 0.3

~tt: ~aa >> every 4.0 ~bb >> ~xx
```

### choose

```choose``` is used as a ref to a note in the sequence. To make it more tidy, it is recommened to use only the tilde plus a-z, e.g ```~a```, ```~b```, ```~z```.

```
~bass: loop 30 _ _~a _ >> sawtooth >> amp 0.3

~a: choose 33 37 0 0 40
```

*Note: zero means rest; more zeros can change the probability.*

### range

Similar to ```choose```, range is also used as a ref to a note. Everytime the func runs, it will choose a note within the given range.

```
~random: loop ~a >> speed 16.0 >> membrane >> amp 0.3

~a: range 0 60
```

### play

```play``` is used to triggger an oscillator rather than a synth.

Different from ```loop```, ```play``` takes an optional parameter (time in second) and outputs a *Trigger*.

This will play 10 second white noise as a riser:
```
~pp: play 10.0 >> adsr 9.99 0.01 0 _  >> white_noise>> amp 0.1
```

### adsr
```
>> adsr [attack] [decay] [sustain] [release]
```

### set_gate

```set_gate``` can set the duration of sustain. The parameters will match the notes recursively.

```
~test: loop 33 _ _37 30  >> set_gate 0.01 1 >> sawtooth >> amp 0.3
```

## Synth

*Synth* is a group of functions that take a *Trigger* as input and output a *Signal*.

Hence, it has build-in envelops and filters, which is difference from the *Oscillator* functions we will introduce below.

### fm_synth

```
>> fm_synth [harmonicity = 3.0] [modulationIndex = 10.0] >>
```

### pluck

```
>> pluck [attackNoise = 1.0] [dampening = 4000.0] [resonance = 0.7] >>
```

### sampler

The samples are from Tidal.

See [Dirt-Samples](https://github.com/tidalcycles/Dirt-Samples).

You can find available samples in the browser console.

```
>> sampler [sample symbol] [index] >>
```

Parameter-free synth functions:
- membrane
- sawtooth
- square
- brown
- white

Example:
```
~bd: loop 20 >> speed 4.0 >> membrane >> amp 0.3
```

## Oscillator

- white_noise
- brown_noise
- pink_noise
- sin_osc
- saw_osc
- tri_osc
- squ_osc

```
~pp: play >> saw_osc 220.0 >> amp 0.3
```

### lfo

*LFO* is a specially kind of *Oscillator*.

There are four types of low freq oscillators.

- lfo
- sin_lfo
- squ_lfo
- tri_lfo
- saw_lfo

The syntax is:

```
lfo [freq] [min] [max]
```

You can use a note *Symbol* ( a slash \ + 4n|8n|16n|1m ) to sync to the beat:
```
~aa: play >> saw_osc 100.0 >> lpf ~ll 1 >> amp 0.1

~ll: squ_lfo \8n 100.0 1000.0
```

## Effect

The *Synth* functions take a *Trigger* as input, and output a *Signal*. The *Effect* functions take the *Signal* and output the processed *Signal*. Hence, changing the order will not cause errors. But the ```amp``` function should always be the end of a function chain to get the sound to the real world.

### lpf(hpf)

Low(High) pass filter.

```
>> lpf [cut_off_frequency] [Q] >>
```

```
>> hpf [cut_off_frequency] [Q] >>
```

*Note: [cut_off_frequency] can be modulated by a ```lfo```*

### jcreverb

Usage:
```
>> jcreverb [roomSize] >>
```

*Note: [roomSize] can be modulated by a ```lfo```*

### pingpong

```
>> pingpong [delayTime] [maxDelayTime] >>
```

### delay
```
>> delay [delayTime] [maxDelayTime] >>
```
### amp

```
>> amp [amplitude value]
```

*Note: [amplitude value] can be modulated by a ```lfo```*