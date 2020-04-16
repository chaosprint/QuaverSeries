# QuaverSeries Crash Course

Just try this line of code in your newly created room:

```
loop 20 20 20 20 >> membrane >> amp 0.3
```

Put it into the editing area, and then press ```Run``` button or use the shortcut ```Command + Enter``` (```CTRL + Enter``` on Windows, similarly hereinafte).

This will create a flat-four kick drum loop, with the default beat-per-minute of 120.

The numbers after ```loop``` means MIDI notes. As QuaverSeries is a beat-based live coding environment, ```loop``` will be very useful. Note that all the integers in QuaverSeries refer to MIDI notes. So if you want to use 69 in some occasions, you should write 69.0, otherwise 69 will be interpreted as 440.0.

The ```membrane``` function means a sound generator. It is essentially a sine wave oscillator, with a build-in envelop to simulate a membrane instrument.

Obviously, ```amp``` means amplitute. It is treated as part of the audio effect chain in QuaverSeries. In this line of code, the audio effect only contains the ```amp```.

So, the example above demonstrates how the syntax works: we have three functions, i.e. ```loop```, ```membrane``` and ```amp```, written from left to right and connected by the double greater-than sign ```>>```. Note that the audio effects must have an ```amp``` function to make sound.

This also indicates the signal flows. The ```loop``` function takes a sequence as input and outputs a ```trigger``` (in the function blackbox). The ```membrane``` takes a trigger from left, and outputs a ```signal```. The ```amp``` takes a ```signal``` and outputs it as sound in the browser.

You can tweek the parameters, e.g. changing 20 to 40, 0.3 to 0.8. After you modify the parameters, you need to click the ```Update``` button or use keyboard shortcut ```Shift + Enter``` to update the whole piece. The update will be effective on the beginning of the next bar.

## Understand the note representation

Currently, we use only MIDI notes. Everything after the ```loop``` is called ```sequence```, and it is separated into different ```notes``` by blank spaces. A ```sequence``` will always occupy the length a bar. Since we always use 4/4, the ```sequence``` occupies a whole note, and all the ```notes``` will be divided equally.

Besides MIDI note, a ```note``` can also be an underscore that represents a rest ```_```.

Try to run the code blow to see what will happen if you change a number to an underscore ```_```.

```
loop 20 30 40 50 >> membrane >> amp 0.3
```

A ```note``` can be further equally divided by the total number of MIDI note numbers and underscores. For example, if a ```note``` occupies the length of an eighth note, ```_33``` means that a sixteenth MIDI note 33 will be played after a sixteenth rest. Likewise, ```33_33``` means a swing rhythm. ```1_1_1_``` means sixteenth triplets.

This example may help you understand the note representation better:
```
loop 30 _ _31 _ >> sawtooth >> amp 0.3
```

## Synth

Besides the ```membrane``` function, there are many sound generatoring functions including:
- ```sawtooth```, also written as ```saw_synth```
- ```square```, also written as ```squ_synth```
- ```fm_synth```
- ```pluck```
- ```brown```
- ```white```
- ```sampler```

The ```sampler``` is of particular importance to live coders. Currently, we use [Dirt Samples from TidalCycles Live Coding Language](https://github.com/tidalcycles/Dirt-Samples). You can open the console in your browsers to see the avalable samples and total numbers in a sample class.

The ```sampler``` function takes two parameters. The first is the samples name, and the second is the the number. For example, the console shows there are 25 ```808bd``` samples. Then you can write:

```
// slash + [a-z] means a symbol
loop 60 >> sampler \808bd 0.0 >> amp 0.3
```

The MIDI number 60 refers to the default pitch. Change this number will modify the pitch of the sample.

For the rest synth functions, see [QuaverSeries Reference](/doc/reference.md).

## Effect

Several sound effects can be used in QuaverSeries so far.

Low-pass filter:

```
>> lpf [cutOffFrequency] [Q value] >>
```

High-pass filter:

```
>> hpf [cutOffFrequency] [Q value] >>
```

Reverb:

```
>> reverb [roomSize] [dampening] >>
```

Ping-ping delay:

```
>> pingpong [delayTime] [maxDelayTime] >>
```

ADSR envelop:

```
>> adsr [attack] [decay] [sustain] [release] >>
```

A simple example to show how they can be connected:

```
loop 1 2 3 4 >> brown
>> adsr 0.005 0.2 0.0 _
>> lpf 12000.0 1.0 >> hpf 9000.0 1.0
>> pingpong 0.5 2.0
>> reverb 0.6 1000.0
>> amp 0.3
```

This will create a hi-hat sequence. The comma after the ```loop``` is only for the sake of readability of the total numbers. Since the MIDI note will be sent to trigger the brown noise oscillator, the pitch can be any number.

The underscore can also be used in effect parameters to be a placeholder. For instance, ```adsr 0.005 0.2 0 _``` means we keep the release as default value as the sustain is already set to 0.

## Reference (to a part)

The ```ref``` is very important in QuaverSeries.
For example:

```
loop 30 _ _31 _ >> sawtooth
>> lpf ~cutoff_freq 1.0 >> amp 0.5

~cutoff_freq: lfo 3.0 100.0 1000.0
```

Intuitively, the ```~cutoff_freq``` is a ```ref```. It begins with a tilde (~). In this example, the low-frequency osscillator (```lfo```) is used to modulate the cut-off frequency parameter of the low-pass filter.

The syntax for ```lfo``` is as below:

```
lfo [frequency] [min] [max]
```

For the sake of consistency, we strongly recommend you add a ```ref``` to every function chain, except the ```bpm``` function:

```
bpm 100.0

~lead: loop 30 31 >> sawtooth >> lpf ~cutoff_freq 1 >> amp 0.3

~cutoff_freq: lfo 20 200 3000
```

*Functions without refs are "anonymous".*

*Only the last one anonymous function will be effective.*

## Laziness
The reference in QuaverSeries is lazy, which means that you can define a ref before or after using it. For the abovementioned example, the following order is also valid:
```
~cutoff_freq: lfo 20.0 200.0 3000.0

~lead: loop 30 31 >> sawtooth >> lpf ~cutoff_freq 1 >> amp 0.3
```
To use it more expressively, you can write some code like this:
```
~note: loop 30 31

~fx: reverb 0.6 1000.0

~mod: lfo 30.0 1.0 20.0

~cutoff_freq: lfo ~mod 200 3000

~lead: ~note >> sawtooth
>> lpf ~cutoff_freq 1.0
>> ~fx >> amp 0.3
```

Also, ```range``` and ```choose``` functions are very helpful for some simple algorithmic composition:

```
~bd: loop 60 >> speed 1.0 >> sampler \808bd 0.0 >> amp 0.6

~sd: loop _60 >> speed 2.0 >> sampler \808sd 0.0 >> amp 0.2

~hc: loop ~a >> speed 8.0 >> sampler \808hc 0.0 >> pan ~mod >> amp 0.0625

~ht: loop ~b >> speed 8.0 >> sampler \808ht 0.0 >> pan ~mod_b >> amp 0.05

// the more zeros, the more likely you get a rest
~a: choose 60 70 63 65 0 0 0 0 0

~b: choose 30 32 40 45 50 0 0 0

~mod: squ_lfo \4n -1.0 1.0

~mod_b: squ_lfo \4n 0.5 -0.5
```

## Block

To form a complete music piece, you need to separate each function chain with an **empty line**.

The following code is a simplified cover of Kraftwerk's *The Model*:

```
bpm 66.0

~solo: loop 64_60_ 57_60_ 64_60_ 64_65_ 64_59_ 55_59_ 64 62
>> square >> adsr 0.06 0.4 0.1 0.4 >> lpf ~cut_off 0.4
>> amp 0.2

~cut_off: lfo 4.0 2000.0 3000.0

~bass: loop 33 _33 36_33_ 36_33_ 28 _28 31_28_ 31
>> sawtooth
>> adsr 0.005 0.5 0.1 0.4
>> lpf 200.0 5.0
>> amp 0.5

~bass_hi: loop 45 _45 48_45_ 48_45_ 40 _40 43_40_ 43
>> sawtooth
>> adsr 0.01 0.8 0.1 0.2
>> lpf 1000.0 1.0
>> amp 0.3

// speed is very helpful to avoid repeating one pattern many times
~kick: loop 20 >> speed 8.0 >> membrane >> amp 0.9

~snare: loop _1 >> speed 4.0
>> white >> adsr 0.01 0.3 0.0 _
>> lpf 4000.0 1.0 >> amp 0.3

~hh: loop 1 >> speed 16.0
>> brown >> adsr 0.01 0.25 0.0 _ >> hpf 8000.0 1.0
>> amp 0.8
```

## Performance
Now, since you can write a complete piece, you can start to perform, even with your friends in different places.

You can invite your collaborator to enter the same room you are in. Once your collaborator enters the password, you can co-edit the editing area, which is similar to using a Google-doc.

You can see the cursor position or all your collaborators in real-time, thanks to the [firepad](https://firepad.io/).

The online 'audience' can also watch the cursor moving and code change in real-time, though they cannot edit the code.

Co-running is an important feature of QuaverSeries. Once any online performer clicks the ```run``` button of hotkey, the code will run in every client, including all the collaborators and the online audience. This is also the case with ```update```.

## Comment

Comment should start with ```//```. For multi lines, just use multiple ```//```. You can alwasy use keyboard shortcut ```command + /```.

Comment can be used with the ```update``` button or hotkey to mute a track in a performance.

## Best practice

Always use the lowered case characters for the reference name, connected with underscores. So, no numbers are allowed in the reference name, at least for now.

Always make sure to have an **empty line** between two *Blocks*.