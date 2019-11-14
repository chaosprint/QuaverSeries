## Think in function

As you may have noticed, all the build-in functions consist of lower-cased letters.

You can write very straight-forward code as this:

```
~kick: loop 10_10_ 10_10_ 10_10_ 10_10_ >> membrane >> amp 2

~snare: loop _1 _1 _1 _1
>> white >> adsr 0.01 0.02 0 _
>> lpf 4000 1 >> amp 0.3

~hh: loop 1 2 3 4, 1 2 3 4, 1 2 3 4, 1 2 3 4
>> brown >> adsr 0.01 0.01 0 _ >> hpf 8000 3 >> amp 0.8
```

However, to discover more potential of the functional musicking:

```
bpm 320

~bass: sawtooth
>> adsr 0.01 0.5 0 _
>> amp 0.2

~a: loop 36 45 41 43

~b: loop 40 48 45 47

~x: ~a >> ~bass

~y: ~b >> ~bass
```

In the example above, ```~bass``` is a reference to a function chain. To some degree, it can be seemed as a ```SynthDef``` function.