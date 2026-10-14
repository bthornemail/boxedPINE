/**
 * OMI-IMO BusyBox — stdin / stdout / stderr + FIFO
 *
 * Maps the classic three streams onto the same 3! structure as the DOM
 * (<dl>/<dt>/<dd> ↔ stdin/stdout/stderr). FIFO pipes connect producers
 * and consumers without sharing mutable objects — only ordered messages.
 *
 * Spec: DOM = BusyBox on the XOR / 3! basis.
 */
'use strict';

const { EventEmitter } = require('events');
const { bind, apply, evaluate } = require('./ruler');

const STREAM = Object.freeze({
  STDIN: 0,
  STDOUT: 1,
  STDERR: 2
});

const STREAM_NAME = Object.freeze(['stdin', 'stdout', 'stderr']);

/**
 * In-memory FIFO pipe.
 * push → ordered delivery to readers; backpressure via highWaterMark.
 */
function createFIFO(opts = {}) {
  const highWaterMark = opts.highWaterMark || 256;
  const queue = [];
  let closed = false;
  const ee = new EventEmitter();

  const api = {
    get length() { return queue.length; },
    get closed() { return closed; },

    write(chunk) {
      if (closed) return false;
      if (queue.length >= highWaterMark) {
        ee.emit('drain-wait');
        return false;
      }
      queue.push(chunk);
      ee.emit('data', chunk);
      return true;
    },

    read() {
      return queue.length ? queue.shift() : null;
    },

    peek() {
      return queue.length ? queue[0] : null;
    },

    on(event, fn) {
      ee.on(event, fn);
      return () => ee.off(event, fn);
    },

    close() {
      closed = true;
      ee.emit('close');
    },

    /** Drain all pending as array */
    drain() {
      const out = queue.splice(0, queue.length);
      return out;
    }
  };

  return api;
}

/**
 * BusyBox instance: three streams + optional applet map.
 */
function createBusyBox(opts = {}) {
  const stdin = createFIFO(opts);
  const stdout = createFIFO(opts);
  const stderr = createFIFO(opts);
  const streams = [stdin, stdout, stderr];

  // Applet registry: name → (args, box) => result
  const applets = new Map();

  // Built-in applets
  applets.set('echo', (args) => {
    const line = (args || []).join(' ');
    stdout.write(line);
    return { ok: true, written: line.length };
  });

  applets.set('true', () => ({ ok: true, code: 0 }));
  applets.set('false', () => ({ ok: false, code: 1 }));

  applets.set('cat', () => {
    const chunks = stdin.drain();
    for (const c of chunks) stdout.write(c);
    return { ok: true, count: chunks.length };
  });

  applets.set('xor', (args) => {
    // XOR integer args and print
    let x = 0;
    for (const a of args || []) x ^= (parseInt(a, 10) || 0);
    stdout.write(String(x >>> 0));
    return { ok: true, value: x >>> 0 };
  });

  /**
   * Map a DOM-style knot onto streams:
   *   bind(stdin_chunk, applet_name) → apply → eval writes stdout/stderr
   */
  function runLine(line) {
    const trimmed = String(line || '').trim();
    if (!trimmed) return { ok: true, empty: true };

    const parts = trimmed.split(/\s+/);
    const name = parts[0];
    const args = parts.slice(1);
    const applet = applets.get(name);

    if (!applet) {
      stderr.write(`busybox: ${name}: not found`);
      return { ok: false, code: 127 };
    }

    try {
      // Protocol framing: knot = bind(name, args)
      const knot = bind(name, args);
      const result = apply(knot, (n, a) => applet(a, api));
      evaluate(knot); // principal = name
      return result || { ok: true };
    } catch (err) {
      stderr.write(String(err.message || err));
      return { ok: false, error: String(err.message || err) };
    }
  }

  const api = {
    stdin,
    stdout,
    stderr,
    streams,
    STREAM,
    STREAM_NAME,

    register(name, fn) {
      applets.set(name, fn);
    },

    has(name) {
      return applets.has(name);
    },

    list() {
      return [...applets.keys()].sort();
    },

    /** Write to stdin and process as a command line */
    exec(line) {
      return runLine(line);
    },

    /** Pipe: write text to stdin, run cat (or custom), return stdout drain */
    pipe(text, appletName = 'cat') {
      stdin.write(text);
      const r = runLine(appletName);
      return {
        result: r,
        stdout: stdout.drain(),
        stderr: stderr.drain()
      };
    },

    /** 3! identity: streams correspond to dt/dd structure indices */
    threeFactorial() {
      return {
        orderings: 6,
        streams: STREAM_NAME.slice(),
        mapping: {
          stdin: 'dt-key-in',
          stdout: 'dd-value-out',
          stderr: 'dd-error-out'
        }
      };
    }
  };

  return api;
}

// ---------- Self-test ----------
function selfTest() {
  const results = [];
  const assert = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail: detail || '' });
  };

  const box = createBusyBox();
  assert('has echo', box.has('echo'));
  assert('has cat', box.has('cat'));
  assert('has xor', box.has('xor'));

  const r1 = box.exec('echo hello world');
  assert('echo ok', r1.ok === true);
  assert('echo stdout', box.stdout.read() === 'hello world');

  const r2 = box.exec('xor 1 2 3');
  assert('xor ok', r2.ok === true && r2.value === (1 ^ 2 ^ 3));
  assert('xor printed', box.stdout.read() === String(1 ^ 2 ^ 3));

  box.stdin.write('line-a');
  box.stdin.write('line-b');
  const piped = box.pipe(null, 'cat'); // already on stdin
  // cat drained previous; pipe with null still runs cat on empty
  box.stdin.write('z');
  const p2 = box.pipe('ignored-for-cat-uses-stdin', 'cat');
  // actually pipe writes text then runs cat — rewrite test cleanly
  const box2 = createBusyBox();
  const p = box2.pipe('alpha', 'cat');
  assert('pipe cat', p.stdout.includes('alpha'));

  const miss = box.exec('no-such-applet');
  assert('missing applet', miss.ok === false && miss.code === 127);
  assert('stderr message', String(box.stderr.read() || '').includes('not found'));

  const tf = box.threeFactorial();
  assert('3! orderings', tf.orderings === 6);
  assert('3 streams', tf.streams.length === 3);

  // FIFO ordering
  const fifo = createFIFO();
  fifo.write(1);
  fifo.write(2);
  fifo.write(3);
  assert('fifo order', fifo.read() === 1 && fifo.read() === 2 && fifo.read() === 3);

  const failed = results.filter(r => !r.pass);
  return {
    passed: failed.length === 0,
    total: results.length,
    failed: failed.length,
    results
  };
}

module.exports = {
  STREAM,
  STREAM_NAME,
  createFIFO,
  createBusyBox,
  selfTest
};
