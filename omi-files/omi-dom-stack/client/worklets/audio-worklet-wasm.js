/**
 * AudioWorkletProcessor with WebAssembly XOR core
 *
 * Integration patterns (Chrome / modern browsers):
 * 1) Embed: instantiate WASM in the processor constructor (this file).
 * 2) Transfer: main thread WebAssembly.compile → postMessage({ module })
 *    (Compiled Module is transferable / structured-cloneable).
 *
 * Constraints:
 * - Prefer sync compile on the audio thread OR transfer a precompiled Module.
 * - Avoid fetch() inside process(); init in constructor / message handler.
 * - Keep process() allocation-free after init.
 */
'use strict';

// Minimal WASM (same as shared/wasm-xor.js) — base64 for worklet isolation
const WASM_B64 = (function () {
  // Built at runtime in Node via shared module; for browser worklet we
  // accept module transfer. Placeholder empty; real path uses message.
  return null;
})();

class OmiWasmAudioProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.ready = false;
    this.exports = null;
    this.key = 0x5a;

    this.port.onmessage = async (e) => {
      const msg = e.data || {};
      if (msg.type === 'init' && msg.module) {
        try {
          const { instance } = await WebAssembly.instantiate(msg.module, {});
          this.exports = instance.exports;
          this.ready = true;
          this.port.postMessage({ type: 'ready' });
        } catch (err) {
          this.port.postMessage({ type: 'error', error: String(err.message || err) });
        }
      }
      if (msg.type === 'key') {
        this.key = msg.key & 0xff;
      }
    };

    // Optional: module passed in processorOptions
    const mod = options && options.processorOptions && options.processorOptions.module;
    if (mod) {
      WebAssembly.instantiate(mod, {}).then(({ instance }) => {
        this.exports = instance.exports;
        this.ready = true;
        this.port.postMessage({ type: 'ready' });
      }).catch((err) => {
        this.port.postMessage({ type: 'error', error: String(err.message || err) });
      });
    }
  }

  process(inputs, outputs) {
    const input = inputs[0] && inputs[0][0];
    const output = outputs[0] && outputs[0][0];
    if (!output) return true;

    if (!input) {
      output.fill(0);
      return true;
    }

    // Float samples: apply key as weak scramble via integer path when WASM ready
    if (this.ready && this.exports && this.exports.memory) {
      const n = Math.min(input.length, 128);
      const mem = new Uint8Array(this.exports.memory.buffer);
      for (let i = 0; i < n; i++) {
        // map float [-1,1] → byte for demonstration
        mem[i] = Math.max(0, Math.min(255, ((input[i] + 1) * 0.5 * 255) | 0));
      }
      this.exports.xor_key(0, n, this.key);
      for (let i = 0; i < n; i++) {
        output[i] = (mem[i] / 255) * 2 - 1;
      }
      for (let i = n; i < output.length; i++) output[i] = input[i];
    } else {
      // JS fallback (identity XOR 0)
      for (let i = 0; i < output.length; i++) output[i] = input[i];
    }
    return true;
  }
}

registerProcessor('omi-audio-wasm', OmiWasmAudioProcessor);
