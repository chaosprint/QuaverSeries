## Cheat sheet

### Control

#### bpm
```bpm``` sets the tempo of the piece. The default value is 120.
```
bpm 200
```
Typically, the ```bpm``` function should be the only function without a ref name.

#### loop
Every function chain starts with a loop, though the rest of the function chain can be written in different places.

Example:
```
~bass: loop 30 _32 >> sawtooth >> amp 0.3
```
```
~note: loop 30 _32

~aa: ~note >> sawtooth >> amp 0.3

~bb: ~note >> membrane >> amp 0.3
```

#### speed
```
~hh: loop 1 >> speed 16 >> white >> hpf 8000 2 >> amp 0.3
```

#### shift
```
~aa: loop 30 31

~bb: ~aa >> shift -7

~xx: sawtooth >> amp 0.3

~track_a: ~aa >> ~xx

~track_b: ~bb >> ~xx
```

#### every
```
~aa: loop 30 31

~bb: ~aa >> shift -7

~xx: sawtooth >> amp 0.3

~tt: ~aa >> every 4 ~bb >> ~xx
```
#### choose
```choose``` is used as a ref to a note in the sequence. To make it more tidy, it is recommened to use only the tilde plus a-z, e.g ```~a```, ```~b```, ```~z```.

Example:
```
~bass: loop 30 _ _~a _ >> sawtooth >> amp 0.3

~a: choose 33 37 0 40

// zero means rest

```
#### range

Similar to ```choose```, range is also used as a ref to a note. Everytime the func runs, it will choose a note within the given range.

Example:
```
~test: loop ~a >> speed 16 >> membrane >> amp 0.3

~a: range 0 60
```

### Synth

Currently, there are only two synths that need parameters.

#### fm

```
~aa: loop 30 >> fm [harmonicity](3) [modulationIndex](10) >> amp 0.3
```

#### pluck

#### lfo

Parameter-free synth functions:
- sawtooth
- square
- brown
- white
- membrane

Example:
```
~bd: loop 20 >> speed 4 >> membrane >> amp 0.3
```

### Effect

The *Synth* functions take a *Trigger* as input, and output a *Signal*. The *Effect* functions take the *Signal* and output the processed *Signal*. Hence, changing the order will not cause errors. But the ```amp``` function should always be the end of a function chain to get the sound to the real world.

#### lpf

Low pass filter.

```
>> lpf [cut_off_frequency] [Q] >>
```
*Note: [cut_off_frequency] can be modulated by a ```lfo```*
#### jcreverb

Usage:
```
>> jcreverb [roomSize] >>
```

#### pingpong
```
>> pingpong [delayTime] [maxDelayTime] >>
```
#### adsr
```
>> adsr [attack] [decay] [sustain] [release]
```
#### amp

```
>> amp [amplitude value]
```