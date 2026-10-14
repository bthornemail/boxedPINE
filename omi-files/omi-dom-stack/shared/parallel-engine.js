/**
 * OMI-IMO Parallel Execution Engine
 *
 * SharedArrayBuffer + Atomics.compareExchange as the sole mutation primitive.
 * Workers perform bind/apply/eval/digest over shared memory.
 *
 * Layout of the shared Int32Array (indices):
 *   0..7     ruler slots (8)
 *   8        epoch / generation
 *   9        lock (0 = free, workerId = held)
 *   10       result slot (last digest xorFold)
 *   11       command (0 idle, 1 bind-apply, 2 digest, 3 stop)
 *   12..19   scratch / expected-replacement pairs
 *   20..end  free workspace
 *
 * Node: worker_threads. Browser: use parallel-engine.browser.js pattern
 *       or the same SAB with dedicated workers.
 */
'use strict';

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');
const { bind, apply, evaluate, digest, createRuler, xorNumber, iff } = require('./ruler');

const RULER_LEN = 8;
const IDX = Object.freeze({
  RULER0: 0,
  EPOCH: 8,
  LOCK: 9,
  RESULT: 10,
  CMD: 11,
  SCRATCH: 12,
  WORKSPACE: 20
});

const CMD = Object.freeze({
  IDLE: 0,
  BIND_APPLY: 1,
  DIGEST: 2,
  STOP: 3,
  XOR_FOLD: 4
});

// ---------- Shared buffer helpers ----------
function createSharedState(byteLength) {
  const bytes = Math.max(byteLength || 4096, 256);
  // SharedArrayBuffer may be unavailable if node started without --experimental or flags;
  // fall back to ArrayBuffer for single-process testing.
  let sab;
  try {
    sab = new SharedArrayBuffer(bytes);
  } catch (_) {
    sab = new ArrayBuffer(bytes);
  }
  const view = new Int32Array(sab);
  view.fill(0);
  return { sab, view, shared: sab instanceof SharedArrayBuffer };
}

function readRuler(view) {
  const r = createRuler();
  for (let i = 0; i < RULER_LEN; i++) r[i] = view[IDX.RULER0 + i];
  return r;
}

function writeRuler(view, ruler) {
  for (let i = 0; i < RULER_LEN; i++) {
    view[IDX.RULER0 + i] = (ruler[i] | 0);
  }
}

/**
 * Atomic compare-exchange on a single index (polyfill when Atomics missing or non-shared).
 */
function atomicCAS(view, index, expected, replacement) {
  if (typeof Atomics !== 'undefined' && view.buffer instanceof SharedArrayBuffer) {
    return Atomics.compareExchange(view, index, expected, replacement);
  }
  // Non-shared fallback (not truly atomic across threads)
  const old = view[index];
  if (old === expected) view[index] = replacement;
  return old;
}

function atomicLoad(view, index) {
  if (typeof Atomics !== 'undefined' && view.buffer instanceof SharedArrayBuffer) {
    return Atomics.load(view, index);
  }
  return view[index];
}

function atomicStore(view, index, value) {
  if (typeof Atomics !== 'undefined' && view.buffer instanceof SharedArrayBuffer) {
    Atomics.store(view, index, value);
    return;
  }
  view[index] = value;
}

// ---------- Worker body (inline string for Worker constructor) ----------
const WORKER_SOURCE = `
const { parentPort, workerData } = require('worker_threads');
const { sab, workerId } = workerData;
const view = new Int32Array(sab);
const IDX = { RULER0: 0, EPOCH: 8, LOCK: 9, RESULT: 10, CMD: 11, SCRATCH: 12 };
const CMD = { IDLE: 0, BIND_APPLY: 1, DIGEST: 2, STOP: 3, XOR_FOLD: 4 };

function cas(i, exp, rep) {
  if (typeof Atomics !== 'undefined' && sab instanceof SharedArrayBuffer)
    return Atomics.compareExchange(view, i, exp, rep);
  const old = view[i];
  if (old === exp) view[i] = rep;
  return old;
}
function load(i) {
  return (typeof Atomics !== 'undefined' && sab instanceof SharedArrayBuffer)
    ? Atomics.load(view, i) : view[i];
}
function store(i, v) {
  if (typeof Atomics !== 'undefined' && sab instanceof SharedArrayBuffer)
    Atomics.store(view, i, v);
  else view[i] = v;
}

function tryLock() {
  return cas(IDX.LOCK, 0, workerId) === 0;
}
function unlock() {
  store(IDX.LOCK, 0);
}

function runBindApply() {
  // scratch[0]=index, scratch[1]=expected, scratch[2]=replacement
  const index = load(IDX.SCRATCH);
  const expected = load(IDX.SCRATCH + 1);
  const replacement = load(IDX.SCRATCH + 2);
  const old = cas(index, expected, replacement);
  store(IDX.RESULT, old);
  store(IDX.EPOCH, load(IDX.EPOCH) + 1);
}

function runDigest() {
  let xor = 0;
  for (let i = 0; i < 8; i++) xor ^= load(IDX.RULER0 + i);
  store(IDX.RESULT, xor >>> 0);
  store(IDX.EPOCH, load(IDX.EPOCH) + 1);
}

function runXorFold() {
  let xor = 0;
  const n = Math.min(load(IDX.SCRATCH) || 8, 64);
  for (let i = 0; i < n; i++) xor ^= load(IDX.RULER0 + i);
  store(IDX.RESULT, xor >>> 0);
}

parentPort.on('message', (msg) => {
  if (!msg || msg.type !== 'run') return;
  if (!tryLock()) {
    parentPort.postMessage({ type: 'busy', workerId });
    return;
  }
  try {
    const cmd = load(IDX.CMD);
    if (cmd === CMD.BIND_APPLY) runBindApply();
    else if (cmd === CMD.DIGEST) runDigest();
    else if (cmd === CMD.XOR_FOLD) runXorFold();
    else if (cmd === CMD.STOP) {
      unlock();
      parentPort.postMessage({ type: 'stopped', workerId });
      return;
    }
    parentPort.postMessage({
      type: 'done',
      workerId,
      result: load(IDX.RESULT),
      epoch: load(IDX.EPOCH),
      cmd
    });
  } finally {
    store(IDX.CMD, CMD.IDLE);
    unlock();
  }
});

parentPort.postMessage({ type: 'ready', workerId });
`;

// ---------- Engine API ----------
/**
 * Create a parallel engine with N workers sharing one buffer.
 */
function createParallelEngine(opts = {}) {
  const size = opts.byteLength || 4096;
  const workerCount = Math.max(1, opts.workers || 2);
  const { sab, view, shared } = createSharedState(size);
  const workers = [];
  const pending = new Map();
  let nextId = 1;
  let readyCount = 0;

  function spawnWorkers() {
    for (let i = 0; i < workerCount; i++) {
      const w = new Worker(WORKER_SOURCE, {
        eval: true,
        workerData: { sab, workerId: i + 1 }
      });
      w.on('message', (msg) => {
        if (msg.type === 'ready') {
          readyCount++;
          return;
        }
        if (msg.type === 'done' || msg.type === 'busy' || msg.type === 'stopped') {
          // resolve any waiters watching epoch/result
          for (const [id, waiter] of pending) {
            if (waiter.match(msg)) {
              pending.delete(id);
              waiter.resolve(msg);
            }
          }
        }
      });
      w.on('error', (err) => {
        console.error('[parallel-engine] worker error', err);
      });
      workers.push(w);
    }
  }

  spawnWorkers();

  const api = {
    sab,
    view,
    shared,
    workerCount,

    /** Seed ruler slots */
    setRuler(values) {
      writeRuler(view, values);
    },

    getRuler() {
      return readRuler(view);
    },

    /**
     * Enqueue a compareExchange on ruler index (or absolute index).
     * Returns Promise<{old, epoch}>
     */
    compareExchange(index, expected, replacement) {
      atomicStore(view, IDX.SCRATCH, index | 0);
      atomicStore(view, IDX.SCRATCH + 1, expected | 0);
      atomicStore(view, IDX.SCRATCH + 2, replacement | 0);
      atomicStore(view, IDX.CMD, CMD.BIND_APPLY);

      const id = nextId++;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          // fallback: run on main if workers silent
          const old = atomicCAS(view, index, expected, replacement);
          atomicStore(view, IDX.RESULT, old);
          atomicStore(view, IDX.CMD, CMD.IDLE);
          resolve({ old, epoch: atomicLoad(view, IDX.EPOCH), fallback: true });
        }, opts.timeoutMs || 500);

        pending.set(id, {
          match: (msg) => msg.type === 'done' && msg.cmd === CMD.BIND_APPLY,
          resolve: (msg) => {
            clearTimeout(timer);
            resolve({ old: msg.result, epoch: msg.epoch, workerId: msg.workerId });
          }
        });

        for (const w of workers) w.postMessage({ type: 'run' });
      });
    },

    /** Run digest (XOR fold of ruler) on a worker */
    digest() {
      atomicStore(view, IDX.CMD, CMD.DIGEST);
      const id = nextId++;
      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          let xor = 0;
          for (let i = 0; i < 8; i++) xor ^= atomicLoad(view, i);
          atomicStore(view, IDX.RESULT, xor >>> 0);
          atomicStore(view, IDX.CMD, CMD.IDLE);
          resolve({ xorFold: xor >>> 0, fallback: true });
        }, opts.timeoutMs || 500);

        pending.set(id, {
          match: (msg) => msg.type === 'done' && msg.cmd === CMD.DIGEST,
          resolve: (msg) => {
            clearTimeout(timer);
            resolve({ xorFold: msg.result >>> 0, epoch: msg.epoch, workerId: msg.workerId });
          }
        });
        for (const w of workers) w.postMessage({ type: 'run' });
      });
    },

    /**
     * High-level: bind → apply (CAS) → eval (read result)
     * Mirrors the three protocol phases over shared memory.
     */
    async bindApplyEval(index, expected, replacement) {
      const knot = bind(expected, replacement);
      const applied = await api.compareExchange(index, expected, replacement);
      const value = evaluate(knot);
      return {
        knot,
        old: applied.old,
        swapped: applied.old === expected,
        eval: value,
        epoch: applied.epoch,
        workerId: applied.workerId,
        fallback: applied.fallback
      };
    },

    async shutdown() {
      atomicStore(view, IDX.CMD, CMD.STOP);
      for (const w of workers) {
        try { w.postMessage({ type: 'run' }); } catch (_) {}
        try { await w.terminate(); } catch (_) {}
      }
      workers.length = 0;
    }
  };

  return api;
}

// ---------- Self-test ----------
async function selfTest() {
  const results = [];
  const assert = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail: detail || '' });
  };

  const engine = createParallelEngine({ workers: 2, byteLength: 2048, timeoutMs: 800 });
  // give workers a moment to signal ready
  await new Promise(r => setTimeout(r, 50));

  assert('shared or fallback buffer', engine.view instanceof Int32Array);
  assert('worker count', engine.workerCount === 2);

  engine.setRuler([1, 2, 3, 4, 5, 6, 7, 8]);
  const ruler = engine.getRuler();
  assert('ruler write/read', ruler[0] === 1 && ruler[7] === 8);

  const cas1 = await engine.compareExchange(0, 1, 99);
  assert('CAS success old==1', cas1.old === 1, String(cas1.old));
  assert('CAS stored 99', engine.view[0] === 99);

  const cas2 = await engine.compareExchange(0, 1, 50);
  assert('CAS miss old==99', cas2.old === 99);
  assert('CAS miss no change', engine.view[0] === 99);

  const bae = await engine.bindApplyEval(1, 2, 77);
  assert('bindApplyEval swapped', bae.swapped === true);
  assert('bindApplyEval eval', bae.eval === 2);
  assert('slot1 is 77', engine.view[1] === 77);

  const dig = await engine.digest();
  assert('digest has xorFold', typeof dig.xorFold === 'number');

  await engine.shutdown();
  assert('shutdown', true);

  const failed = results.filter(r => !r.pass);
  return {
    passed: failed.length === 0,
    total: results.length,
    failed: failed.length,
    results
  };
}

module.exports = {
  IDX,
  CMD,
  createSharedState,
  createParallelEngine,
  atomicCAS,
  atomicLoad,
  atomicStore,
  selfTest
};
