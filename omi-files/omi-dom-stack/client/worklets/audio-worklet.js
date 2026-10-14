// OMI AudioWorklet — Canvas A (browser only)
class OmiAudioWorklet extends AudioWorkletProcessor {
  process(inputs, outputs) {
    const input = inputs[0] && inputs[0][0];
    const output = outputs[0] && outputs[0][0];
    if (!input || !output) return true;
    for (let i = 0; i < output.length; i++) {
      output[i] = input[i] ^ 0.0; // pass-through identity for proof
    }
    return true;
  }
}
registerProcessor('omi-audio', OmiAudioWorklet);
