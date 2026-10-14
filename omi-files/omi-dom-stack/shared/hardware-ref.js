/**
 * OMI-IMO Hardware C/Verilog correspondence vectors (JS side)
 * Mirrors hardware/c/omi_hw_ref.c and hardware/verilog/*
 */
'use strict';

const { xorNumber, createClock } = (() => {
  // minimal local deps to avoid circular requires in tests
  return {
    xorNumber: (a, b) => ((a | 0) ^ (b | 0)) >>> 0,
    createClock: null
  };
})();

function bqfEval(x, y) {
  const linear = ((x & 0xffff) << 2) + ((y & 0xffff) << 1);
  const lin16 = linear & 0xffff;
  return {
    q_value: (lin16 * lin16) >>> 0,
    is_void_centroid: linear === 0 ? 1 : 0
  };
}

function swap16(v) {
  const Big = typeof BigInt !== 'undefined';
  // operate via 32-bit halves for portability
  const hi = Number((BigInt(v) >> 32n) & 0xffffffffn);
  const lo = Number(BigInt(v) & 0xffffffffn);
  const sw = (w) => ((w & 0x00ff00ff) << 8) | ((w & 0xff00ff00) >>> 8);
  const hs = sw(hi >>> 0) >>> 0;
  const ls = sw(lo >>> 0) >>> 0;
  return BigInt(hs) << 32n | BigInt(ls);
}

function swap64(v) {
  let x = BigInt(v);
  let out = 0n;
  for (let i = 0; i < 8; i++) {
    out = (out << 8n) | (x & 0xffn);
    x >>= 8n;
  }
  return out;
}

function casU32(mem, expected, replacement) {
  const old = mem >>> 0;
  if (old === (expected >>> 0)) {
    return { old, mem: replacement >>> 0, swapped: 1 };
  }
  return { old, mem: old, swapped: 0 };
}

function selfTest() {
  const results = [];
  const assert = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail: detail || '' });
  };

  assert('xor', xorNumber(0xf0f0f0f0, 0x0f0f0f0f) === 0xffffffff);
  assert('xor id', xorNumber(0xabcd, 0xabcd) === 0);

  const b1 = bqfEval(1, 0);
  assert('bqf(1,0)', b1.q_value === 16 && b1.is_void_centroid === 0);
  const b0 = bqfEval(0, 0);
  assert('bqf void', b0.is_void_centroid === 1);
  const b2 = bqfEval(2, 1);
  assert('bqf(2,1)', b2.q_value === 100);

  const v = 0x0123456789abcdefn;
  assert('swap64 ends', (swap64(v) & 0xffn) === 0x01n);

  const c1 = casU32(5, 5, 99);
  assert('cas hit', c1.swapped === 1 && c1.mem === 99);
  const c2 = casU32(5, 6, 99);
  assert('cas miss', c2.swapped === 0 && c2.mem === 5);

  // clock via shared module if available
  try {
    const { createClock } = require('./clock-sliderule');
    const clock = createClock();
    for (let i = 0; i < 240; i++) clock.step(1);
    assert('clock wrap', clock.phase === 0 && clock.cycle === 1);
    clock.seek(481);
    assert('clock seek', clock.phase === 1 && clock.cycle === 2);
  } catch (_) {
    assert('clock module', false, 'clock-sliderule missing');
  }

  const failed = results.filter(r => !r.pass);
  return {
    passed: failed.length === 0,
    total: results.length,
    failed: failed.length,
    results
  };
}

module.exports = {
  bqfEval,
  swap16,
  swap64,
  casU32,
  selfTest
};
