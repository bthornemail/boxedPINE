/**
 * Offscreen / worker coordinator for 4-slice audio-video transmutation
 * Shared Blob size default 2^16 = 65536
 *
 * Works in browser Worker and Node worker_threads (via parentPort).
 */
'use strict';

let shared = null;

function xorAll(arr) {
  let acc = 0;
  for (let i = 0; i < arr.length; i++) acc ^= arr[i];
  return acc >>> 0;
}

function toU8(data) {
  if (data instanceof Uint8Array) return data;
  if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  if (Array.isArray(data)) return Uint8Array.from(data);
  return new Uint8Array(0);
}

function xorSlice(offset, data, len) {
  const src = toU8(data);
  if (!src.length) return;
  for (let i = 0; i < len; i++) {
    shared[offset + i] ^= src[i % src.length];
  }
}

function compose(payload) {
  const sliceLen = Math.floor(shared.length / 4);
  // Clear then place slices (composition as XOR into zeroed regions = copy via XOR identity)
  shared.fill(0);
  xorSlice(0 * sliceLen, payload.audio || [], sliceLen);
  xorSlice(1 * sliceLen, payload.video || [], sliceLen);
  xorSlice(2 * sliceLen, payload.rgb || [], sliceLen);
  xorSlice(3 * sliceLen, payload.mask || [], sliceLen);
  return { type: 'composed', digest: xorAll(shared) };
}

function decompose() {
  const sliceLen = Math.floor(shared.length / 4);
  const audio = Array.from(shared.slice(0 * sliceLen, 1 * sliceLen));
  const video = Array.from(shared.slice(1 * sliceLen, 2 * sliceLen));
  const rgb = Array.from(shared.slice(2 * sliceLen, 3 * sliceLen));
  const mask = Array.from(shared.slice(3 * sliceLen, 4 * sliceLen));
  return {
    type: 'decomposed',
    audio, video, rgb, mask,
    digest: xorAll(shared)
  };
}

function handle(msg) {
  const type = msg.type;
  const payload = msg.payload || {};
  let out;
  switch (type) {
    case 'init':
      shared = new Uint8Array(payload.size || 65536);
      out = { type: 'ready', size: shared.length };
      break;
    case 'compose':
      out = compose(payload);
      break;
    case 'decompose':
      out = decompose();
      break;
    case 'xor': {
      const data = toU8(payload.data);
      for (let i = 0; i < data.length && (payload.offset + i) < shared.length; i++) {
        shared[payload.offset + i] ^= data[i];
      }
      out = { type: 'xor', digest: xorAll(shared) };
      break;
    }
    case 'digest':
      out = { type: 'digest', value: shared ? xorAll(shared) : 0 };
      break;
    default:
      out = { type: 'error', error: 'unknown type ' + type };
  }
  if (msg.id !== undefined) out.id = msg.id;
  return out;
}

// Browser worker
if (typeof self !== 'undefined' && typeof self.onmessage !== 'undefined' && typeof importScripts === 'function') {
  self.onmessage = function (e) {
    self.postMessage(handle(e.data));
  };
}

// Node worker_threads
try {
  const { parentPort, workerData } = require('worker_threads');
  if (parentPort) {
    parentPort.on('message', (msg) => {
      parentPort.postMessage(handle(msg));
    });
    if (workerData && workerData.bootstrap) {
      parentPort.postMessage(handle({ type: 'init', payload: { size: workerData.size || 65536 } }));
    }
  }
} catch (_) { /* not in worker_threads */ }

// Export for same-thread Node tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { handle, xorAll };
}
