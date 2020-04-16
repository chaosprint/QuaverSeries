# Cheat sheet

## Control

### bpm
```
bpm 120.0
```

### loop

```
~bass: loop 60 >> sawtooth >> amp 0.3
```

```
~note: loop 30 _32

~aa: ~note >> sawtooth >> amp 0.3

~bb: ~note >> membrane >> amp 0.3
```

### speed
```
~hh: loop 1 >> speed 16.0 >> white >> hpf 8000.0 2.0 >> amp 0.3
```

### shift
```
~aa: loop 30 31

~bb: ~aa >> shift -7

~xx: sawtooth >> amp 0.3

~track_a: ~aa >> ~xx

~track_b: ~bb >> ~xx
```

### every
```
~aa: loop 30 31

~bb: ~aa >> shift -7

~xx: sawtooth >> amp 0.3

~tt: ~aa >> every 4.0 ~bb >> ~xx
```
### choose

```
~bass: loop 30 _ _~a _ >> sawtooth >> amp 0.3

~a: choose 33 37 0 0 40
```

*Note: zero means rest; more zeros can change the probability.*

*Note: ```choose``` is used as a ref to a note in the sequence. To make it more tidy, it is recommened to use only the tilde plus a-z, e.g ```~a```, ```~b```, ```~z```.*

### range

```
~test: loop ~a >> speed 16.0 >> membrane >> amp 0.3

~a: range 0 60
```

Similar to ```choose```, range is also used as a ref to a note. Everytime the func runs, it will choose a note within the given range.

### play

Different from ```loop```, ```play``` is used with an optional time in second to triggger an oscillator rather than a synth.

This will play 10 second white noise as a riser:
```
~pp: play 10.0 >> white_noise >> adsr 9.99 0.01 0 _ >> amp 0.1
```

### adsr
```
>> adsr [attack] [decay] [sustain] [release]
```

## Synth

### fm_synth

```
>> fm [harmonicity = 3.0] [modulationIndex = 10.0] >>
```

### pluck

```
>> pluck [attackNoise = 1.0] [dampening = 4000.0] [resonance = 0.7] >>
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

There are four types of low freq oscillators:

- lfo
- sin_lfo
- squ_lfo
- tri_lfo
- saw_lfo

The syntax is 

```
lfo [freq] [min] [max]
```

You can use a note (\ + 4n|8n|16n|1m) to sync:
```
~aa: play >> saw_osc 100.0 >> lpf ~ll 1.0 >> amp 0.1

~ll: squ_lfo \8n 100.0 1000.0
```

## Effect

The *Synth* functions take a *Trigger* as input, and output a *Signal*. The *Effect* functions take the *Signal* and output the processed *Signal*. Hence, changing the order will not cause errors. But the ```amp``` function should always be the end of a function chain to get the sound to the real world.

### lpf

Low pass filter.

```
>> lpf [cut_off_frequency] [Q] >>
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