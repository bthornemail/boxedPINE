# WebAssembly × Worklets (OMI-IMO)

## Why WASM in worklets

| Worklet | WASM fit |
|---------|----------|
| **AudioWorklet** | Real-time DSP without GC/JIT jitter; port C/C++/Rust |
| **PaintWorklet** | Heavy procedural textures / cellular automata state |
| **AnimationWorklet** | Physics integrators |
| **LayoutWorklet** | Geometry solvers (limited API surface) |
| **Worker** (transmute) | Shared Blob XOR fold at native speed |

## Two load patterns (AudioWorklet)

### 1. Transfer a compiled `WebAssembly.Module`

```js
const bytes = /* from shared/wasm-xor assembleModule() */;
const module = await WebAssembly.compile(bytes);
await audioContext.audioWorklet.addModule('/client/worklets/audio-worklet-wasm.js');
const node = new AudioWorkletNode(audioContext, 'omi-audio-wasm', {
  processorOptions: { module }
});
// or: node.port.postMessage({ type: 'init', module });
```

Compiled modules are structured-cloneable / transferable — preferred for the audio thread.

### 2. Embed / single-file (Emscripten)

```
emcc dsp.c -O3 -s SINGLE_FILE=1 -s BINARYEN_ASYNC_COMPILATION=0 \
  --post-js processor.js -o worklet-bundle.js
```

Synchronous instantiation inside the worklet scope.

## Constraints

- No `fetch()` inside `process()` — init in constructor or `port.onmessage`.
- Keep `process()` allocation-free after warm-up.
- SharedArrayBuffer + threads need COOP/COEP headers (cross-origin isolation).
- Paint worklets: WASM for *state updates*; still draw via CanvasRenderingContext2D in `paint()`.

## OMI stack pieces

| File | Role |
|------|------|
| `shared/wasm-xor.js` | Hand-built WASM: `xor_fold`, `xor_key`, `memory` |
| `client/worklets/audio-worklet-wasm.js` | AudioWorkletProcessor + Module transfer |
| `client/transmute-worker.js` | Can call JS XOR; optional WASM fold for digests |

## Node verification

```bash
node -e "require('./shared/wasm-xor').selfTest().then(console.log)"
```

## Map to 4-canvas transmutation

```
Canvas A (AudioWorklet + WASM DSP)
Canvas B (PaintWorklet ± WASM state)
Canvas C (LayoutWorklet)
Canvas D (AnimationWorklet ± WASM)
        ↓
Offscreen worker + shared Blob 2¹⁶
        ↓
xor_fold digest (WASM) === JS XOR digest
```

Lossless compose/decompose remains the proof; WASM accelerates the fold.
