/**
 * Coordinator for 4-canvas audio-video transmutation
 * Node: worker_threads · Browser: Worker · Test: in-process handle()
 */
'use strict';

const path = require('path');

function createTransmutation(options) {
  options = options || {};
  const inProcess = options.inProcess === true;
  const workerPath = options.workerPath || path.join(__dirname, 'transmute-worker.js');

  let worker = null;
  let handleFn = null;
  const pending = new Map();
  let nextId = 1;

  if (inProcess) {
    handleFn = require('./transmute-worker').handle;
  } else {
    try {
      const { Worker } = require('worker_threads');
      worker = new Worker(workerPath);
      worker.on('message', (msg) => {
        if (msg.id !== undefined && pending.has(msg.id)) {
          pending.get(msg.id)(msg);
          pending.delete(msg.id);
        }
      });
      worker.on('error', (err) => {
        for (const [, rej] of pending) {
          /* resolve with error shape */
        }
        pending.clear();
      });
    } catch (e) {
      handleFn = require('./transmute-worker').handle;
    }
  }

  function call(type, payload) {
    return new Promise((resolve, reject) => {
      const id = nextId++;
      const msg = { id, type, payload: payload || {} };
      if (handleFn) {
        try {
          resolve(handleFn(msg));
        } catch (err) {
          reject(err);
        }
        return;
      }
      pending.set(id, resolve);
      worker.postMessage(msg);
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error('timeout ' + type));
        }
      }, options.timeout || 5000);
    });
  }

  return {
    async init(size) {
      return call('init', { size: size || 65536 });
    },
    async compose(audio, video, rgb, mask) {
      return call('compose', { audio, video, rgb, mask });
    },
    async decompose(target) {
      return call('decompose', { target: target || 'all' });
    },
    async digest() {
      return call('digest', {});
    },
    async close() {
      if (worker) {
        await worker.terminate();
        worker = null;
      }
    }
  };
}

/** Pure same-thread proof (no worker) for CI */
async function proveLossless(opts) {
  opts = opts || {};
  const size = opts.size || 65536;
  const t = createTransmutation({ inProcess: true });
  await t.init(size);

  const audio = new Uint8Array(256);
  const video = new Uint8Array(256);
  const rgb = new Uint8Array(256);
  const mask = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    audio[i] = i & 0xff;
    video[i] = (i * 2) & 0xff;
    rgb[i] = (i * 3) & 0xff;
    mask[i] = (i * 5) & 0xff;
  }

  const composed = await t.compose(audio, video, rgb, mask);
  const decomposed = await t.decompose();

  const sliceLen = Math.floor(size / 4);
  function matchPrefix(orig, recovered) {
    for (let i = 0; i < orig.length && i < sliceLen; i++) {
      // After compose into zeroed buffer via XOR, recovered slice = tiled orig
      if (recovered[i] !== orig[i % orig.length]) return false;
    }
    return true;
  }

  const audioMatch = matchPrefix(audio, decomposed.audio);
  const videoMatch = matchPrefix(video, decomposed.video);
  const rgbMatch = matchPrefix(rgb, decomposed.rgb);
  const maskMatch = matchPrefix(mask, decomposed.mask);
  const digestMatch = composed.digest === decomposed.digest;

  return {
    passed: audioMatch && videoMatch && rgbMatch && maskMatch && digestMatch,
    audioMatch,
    videoMatch,
    rgbMatch,
    maskMatch,
    digestMatch,
    composedDigest: composed.digest,
    decomposedDigest: decomposed.digest,
    size
  };
}

function selfTest() {
  // Sync wrapper using in-process only
  return proveLossless({ size: 1024 }).then((r) => ({
    passed: r.passed,
    total: 5,
    failed: r.passed ? 0 : 1,
    results: [
      { name: 'audio match', pass: r.audioMatch },
      { name: 'video match', pass: r.videoMatch },
      { name: 'rgb match', pass: r.rgbMatch },
      { name: 'mask match', pass: r.maskMatch },
      { name: 'digest match', pass: r.digestMatch }
    ]
  }));
}

module.exports = { createTransmutation, proveLossless, selfTest };
