## Enter a room

To get started, you can simply enter a room. If it is empty, then you can click the key icon on the bottom right to creat a password. Then, you can start editing. This also means that next time when you come to the same room, you need to remember your password to edit it.

## Make some noise

Just try this line of code in your newly created room:
```loop 20 20 20 20 >> membrane >> amp 0.3```

Put it into the editing area, and then press ```Run``` button or use the shortcut ```Command + Enter```. 

This will create a flat-four kick drum loop, with the default beat-per-minute of 120. The numbers after ```loop``` means MIDI notes. As QuaverSeries is a beat-based live coding environment, ```loop``` will be very useful.

The ```membrane``` function means a sound generator. It is essentially a sine wave oscillator, with some build-in envelop.

Obviously, ```amp``` means amplitute. It is treated as part of the audio effect chain in QuaverSeries. In this line of code, the audio effect only contains the ```amp```.

So, the example above demonstrates how the syntax works: the order matters. Always have a ```loop``` on the far left, followed by a ```synth```. The order of effects can be reorganised, while the ```amp``` should always be the last function.

You can change the parameters to experience the differences, e.g. changing 20 to 40, 0.3 to 0.8. After you modify the parameters, you need to click the ```Update``` button of use keyboard shortcut ```Shift + Enter``` to update the whole piece. The update will be effective on the beginning of the next bar.

## Understand the note representation

Currently, we use only MIDI notes. Everything after the ```loop``` is called ```sequence```, and it is separated into different ```notes``` by blank spaces. A ```sequence``` will always occupy the length a bar. Since we always use 4/4, the ```sequence``` occupies a whole note, and all the ```notes``` will be divided equally.

Try the following code:
```loop 20 30 40 50 >> membrane >> amp 0.3```
Then change the line and update it:
```loop 20 30 40 50 60 >> membrane >> amp 0.3```
Change again to:
```loop 20 30 40 >> membrane >> amp 0.3```

Besides MIDI note, a ```note``` can also be an underscore that represents a rest ```_```, or a compound one (e.g. ```50_50_```, ```_50```).

This means that a ```note``` can be further equally divided by the total number of MIDI note numbers and underscores. For example, if a ```note``` occupies the length of an eighth note, ```_33``` means that a sixteenth MIDI note 33 will be played after a sixteenth rest. Likewise, ```33_33``` means a swing rhythm. ```1_1_1_``` means sixteenth triplets.

## Synth

Currently, there are only a few available synths, including ```sawtooth```, ```square```, ```membrane```, ```fm```, ```brown```, ```white```, ```pluck```. No parameter after the synth can be edited, which we will update soon.

## Effect

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
loop 1 1 1 1, 1 1 1 1 >> brown
>> adsr 0.005 0.2 0 _
>> lpf 12000 1 >> hpf 9000 1
>> pingpong 0.5 2
>> reverb 0.6 0.8
>> amp 0.3
```

This will create a hi-hat sequence. The comma after the ```loop``` is only for the sake of visibility of the total numbers. Since the MIDI note will be sent to trigger the brown noise oscillator, the pitch can be any number.

The underscore can also be used in effect parameters to be a placeholder. For instance, ```adsr 0.01 0.2 0 _``` means we keep the release as default value as the sustain is already set to 0.

## Reference (to a part)

The ```ref``` is vital for modulating a parameter.
For example:
```
loop 30 31 >> sawtooth
>> lpf ~cutoff_freq 1 >> amp 0.5

~cutoff_freq: lfo 20 200 3000
```

Intuitively, the ```~cutoff_freq``` is a ```ref```. It begins with a tilde (~). In this example, the low-frequency osscillator (```lfo```) is used to modulate the cut-off frequency parameter of the low-pass filter.

The syntax for ```lfo``` is as below:
```
lfo [frequency] [min] [max]
```
For the sake of consistency, we strongly recommend you add a ```ref``` to the main function chain too:
```

~lead: loop 30 31 >> sawtooth >> lpf ~cutoff_freq 1 >> amp 0.3

~cutoff_freq: lfo 20 200 3000
```

## Block

To form a complete music piece, you need to separate each function chain with an empty line.

The following code is a simplified cover of Kraftwerk's *The Model*:

```

bpm 68

~bass: loop 33 _33 _ 33 >> fm >> adsr 0.04 0.2 0 _ >> amp 1

~lead: loop 45 _45 48_45_ 48_45_ 40 _40 43_40_ 43
>> sawtooth
>> lpf 800 1
>> amp 0.5

~kick: loop 10_10_ 10_10_ 10_10_ 10_10_ >> membrane >> amp 2

~snare: loop _1 _1 _1 _1
>> white >> adsr 0.01 0.02 0 _
>> lpf 4000 1 >> amp 0.3

~hh: loop 1 1 1 1, 1 1 1 1, 1 1 1 1, 1 1 1 1
>> brown >> adsr 0.01 0.01 0 _ >> hpf 8000 3 >> amp 0.8
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

## Miscellaneous

- Always use the lowered case characters for the reference name, connected with underscores. So, no numbers are allowed in the reference name, at least for now.

- Always make sure to have a blank line between two function chains.

## Reference

The parser is written with [Ohm.js](https://github.com/harc/ohm).

There is a great [tutorial for Ohm.js](https://nextjournal.com/dubroy/ohm-parsing-made-easy).

The web deployment is based on [Google Firebase](https://firebase.com/).