QuaverSeries consists of a collaborative live coding environment and a domain-specific language.

## Room Hierarchy

#### Enter an existed room

Room  ```on-the-run```, ```the-model```, ```shape-of-you``` are for demonstration.

Enter the name of the room in the box top right. Then hit "Enter" key.

You can only read and copy the code.

To run the code, you need to create a new room.

#### Create a new room

To create a new room, enter some name in the room box. Then hit "Enter" key.

If the name is not occupied, a new room will be created.

Click the ```key``` icon on the bottom right.

The password you create will become the only password for the room.

Then the buttons will be available, and you can now paste some code and run it.

#### Watch a code stream

Enter an existed room to watch a performance.

Though you cannot co-edit, every change of text and sound will be broadcast to you.    

#### Backup your code

As this the current version is just for the test, please take care of the backup by yourself.

## Run the code

Run: ```command(ctrl) + enter```

Update: ```shift + enter```

Stop: ```command + period```

It will read the whole page and run.

Updating will take effect on the beginning of the next bar.

## Syntax

#### Function chain

The Quaver language is a minimal and beat-based live coding DSL.

The syntax of Quaver is very easy:

```
~bass: loop 30 _ _31 _ >> sawtooth >> lpf 300 1 >> amp 0.5
```

This is a basic signal chain. It demonstrates how the syntax works: the order matters. Hence, always have a ```loop``` on the far left, followed by a ```synth```. The order of effects can be reorganised, while the ```amp``` should always be the last function.

#### Notation system

The notation system is the key of the syntax.

Despite the controversity of MIDI, from a personal perspective, it is necessary that electronic musicians remember the MIDI note. Another reason is that compared with some other character notation, numbers are cleaner for me.

Everything after the ```loop``` is called ```sequence```, and it is separated into different ```notes``` by blank spaces.

A ```note``` can be a MIDI note number(e.g. 60, 30), an underscore placeholder that represents a rest ```_```, or a compound one (e.g. ```50_50_```, ```_50```).

A ```sequence``` will always occupy the length a bar. Since we always use 4/4, the ```sequence``` occupies a whole note, and all the ```notes``` will be divided equally.

Within each ```note```, it can be further equally divided by the total number of MIDI note numbers and underscores. For example, if a ```note``` occupies the length of an eighth note, ```_33``` means that a sixteenth MIDI note 33 will be played after a sixteenth rest. Likewise, ```33_33``` means a swing rhythm. ```1_1_1_``` means sixteenth triplets.

Try these with ```update```:

```
~test: loop 20 20 20 20 >> membrane >> amp 0.3
```
```
~test: loop 20 20 20 20 20 >> membrane >> amp 0.3
```
```
~test: loop 20_20 20 20 20 20 >> membrane >> amp 0.3
```

#### Synth

Currently, there are only a few available synths, including ```sawtooth```, ```square```, ```membrane```, ```fm```, ```brown```, ```white```. No parameter for the synth can be edited. We will update it soon.

#### Effect

```
low pass filter: >> lpf [cutOffFrequency] [Q value] >>

high pass filter: >> hpf [cutOffFrequency] [Q value] >>

freeverb: >> freeverb [roomSize] [dampening] >>

pingpong delay:  >> pingpong [delayTime] [maxDelayTime] >>

adsr: >> adsr [attack] [decay] [sustain] [release] >>
```

Everything between the brackets is the parameters.

The underscore can also be used in effect parameters to be a placeholder. For instance, ```adsr 0.01 0.2 0 _``` means we keep the release as default value as the sustain is already set to 0.

#### Reference (to a function)

```
loop 30 31 >> sawtooth >> lpf ~cutoff_freq 1 >> amp

~cutoff_freq: lfo 20 200 3000
```

The ```~cut``` here is a reference so that an LFO can control the cut-off frequency of the low pass filter.

The name of the ref should start with a tilde, and we strongly recommend to add a ref to the main loop:

```
~lead: loop 30 31 >> sawtooth >> lpf ~cutoff_freq 1 >> amp

~cutoff_freq: lfo 20 200 3000
```

#### Block

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

~hh: loop 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
>> brown >> adsr 0.01 0.01 0 _ >> hpf 8000 3 >> amp 0.8
```

#### Comment

Comment should start with ```//```.

For multi lines, just use multiple ```//```.

You can alwasy use keyboard shortcut ```command + /```.

## Miscellaneous

- Always use the lowered case characters for the reference name, connected with underscores. So, no numbers are allowed in the reference name, at least for now.
- Always make sure to have a blank line between two function chains. 

## Reference

The parser is written with [Ohm.js](https://github.com/harc/ohm).

There is a great [tutorial for Ohm.js](https://nextjournal.com/dubroy/ohm-parsing-made-easy).

The web deployment is based on [Google Firebase](https://firebase.com/).

## Usage

If you want to make some modification on the open-source code, you need to create a new Firebase account and copy the key to the key.js file.