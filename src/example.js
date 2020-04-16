var exampleCode = 
`// use cmd+enter to run the code
// tweek the numbers and use shift+enter to update
// note that the integer means the midi pitch
bpm 100.0

~seq_a: loop 61 _64 _ 61

~seq_b: loop 63 _61 _ 59

~riff: ~seq_a >> every 4.0 ~seq_b
>> speed 2.0
>> sawtooth
>> adsr 0.01 0.3 0.1 0.3
>> lpf 200.0 1.0
>> amp 0.6

~bd: loop 20 >> speed 4.0
>> membrane >> amp 0.6`

export {exampleCode}