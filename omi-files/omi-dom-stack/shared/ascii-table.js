/**
 * OMI-IMO ASCII Table + Formal 6-Core Test Suite
 *
 * ASCII table: 0..127 with printable, control, and 3!-slot annotations.
 * Six core tests formalize the protocol invariants from the checklist:
 *   1. bind symmetry
 *   2. apply compareExchange semantics
 *   3. eval extraction
 *   4. digest F-mean + XOR fold
 *   5. iff (XOR ⊕ 1)
 *   6. XOR ruler identity / involution
 */
'use strict';

const {
  bind, apply, evaluate, digest, createRuler,
  xorNumber, xorRuler, iff, selfTest: rulerSelfTest
} = require('./ruler');

// ---------- ASCII table (0–127) ----------
const CONTROL_NAMES = Object.freeze({
  0: 'NUL', 1: 'SOH', 2: 'STX', 3: 'ETX', 4: 'EOT', 5: 'ENQ', 6: 'ACK', 7: 'BEL',
  8: 'BS', 9: 'HT', 10: 'LF', 11: 'VT', 12: 'FF', 13: 'CR', 14: 'SO', 15: 'SI',
  16: 'DLE', 17: 'DC1', 18: 'DC2', 19: 'DC3', 20: 'DC4', 21: 'NAK', 22: 'SYN', 23: 'ETB',
  24: 'CAN', 25: 'EM', 26: 'SUB', 27: 'ESC', 28: 'FS', 29: 'GS', 30: 'RS', 31: 'US',
  127: 'DEL'
});

/**
 * Build the 128-entry ASCII table.
 * Each entry: { code, char, printable, control, name, slot (code % 8), band (code % 4) }
 */
function buildAsciiTable() {
  const table = [];
  for (let code = 0; code < 128; code++) {
    const printable = code >= 32 && code < 127;
    const control = code < 32 || code === 127;
    const char = printable ? String.fromCharCode(code) : '';
    const name = CONTROL_NAMES[code] || (printable ? char : `x${code.toString(16).padStart(2, '0')}`);
    table.push(Object.freeze({
      code,
      char,
      printable,
      control,
      name,
      slot: code % 8,       // maps onto 8-slot ruler
      band: (code % 4) + 1  // 1..4 bands
    }));
  }
  return Object.freeze(table);
}

const ASCII_TABLE = buildAsciiTable();

function asciiLookup(codeOrChar) {
  if (typeof codeOrChar === 'string' && codeOrChar.length === 1) {
    return ASCII_TABLE[codeOrChar.charCodeAt(0)] || null;
  }
  const n = Number(codeOrChar);
  if (n >= 0 && n < 128) return ASCII_TABLE[n];
  return null;
}

function printableAscii() {
  return ASCII_TABLE.filter(e => e.printable);
}

/**
 * Map a string onto ruler slots via ASCII slot field.
 */
function stringToRuler(str) {
  const r = createRuler();
  const s = String(str || '');
  for (let i = 0; i < 8; i++) {
    const ch = s[i];
    r[i] = ch ? ch.charCodeAt(0) : 0;
  }
  return r;
}

// ---------- Formal 6-core test suite ----------
/**
 * Six core protocol tests (checklist §55 / §59).
 * Returns a structured report.
 */
function runSixCoreTests() {
  const results = [];
  const assert = (id, name, cond, detail) => {
    results.push({ id, name, pass: !!cond, detail: detail || '' });
  };

  // 1. bind symmetry — delta(a,b) === delta(b,a)
  {
    const a = 42, b = 17;
    const k1 = bind(a, b);
    const k2 = bind(b, a);
    assert(1, 'bind symmetry', k1.delta === k2.delta && k1.kind === 'knot', `d1=${k1.delta} d2=${k2.delta}`);
  }

  // 2. apply compareExchange semantics
  {
    const k = bind(5, 99);
    const hit = apply(k, 5);
    const miss = apply(k, 6);
    assert(2, 'apply compareExchange', hit === 99 && miss === 6, `hit=${hit} miss=${miss}`);
  }

  // 3. eval extraction
  {
    const k = bind(7, 3);
    assert(3, 'eval extraction', evaluate(k) === 7, String(evaluate(k)));
  }

  // 4. digest F-mean + XOR fold
  {
    const r = createRuler([2, 4, 6, 8, 10, 12, 14, 16]);
    const d = digest(r, 1);
    const mean = (2 + 4 + 6 + 8 + 10 + 12 + 14 + 16) / 8;
    const meanOk = Math.abs(d.value - mean) < 1e-9;
    const foldOk = typeof d.xorFold === 'number';
    assert(4, 'digest F-mean + XOR fold', meanOk && foldOk, `mean=${d.value} fold=${d.xorFold}`);
  }

  // 5. iff (XOR ⊕ 1 equivalence)
  {
    assert(5, 'iff equivalence', iff(9, 9) === 1 && iff(9, 8) === 0, `eq=${iff(9, 9)} ne=${iff(9, 8)}`);
  }

  // 6. XOR ruler identity / involution
  {
    const r1 = createRuler([1, 2, 3, 4, 5, 6, 7, 8]);
    const zero = xorRuler(r1, r1);
    let allZero = true;
    for (let i = 0; i < 8; i++) if (zero[i] !== 0) allZero = false;
    const twice = xorNumber(xorNumber(0xab, 0xcd), 0xcd);
    assert(6, 'XOR identity / involution', allZero && twice === 0xab, `twice=${twice}`);
  }

  const failed = results.filter(r => !r.pass);
  return {
    passed: failed.length === 0,
    total: results.length,
    failed: failed.length,
    results
  };
}

// Combined self-test (ASCII + 6-core + ruler smoke)
function selfTest() {
  const results = [];
  const assert = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail: detail || '' });
  };

  assert('table length 128', ASCII_TABLE.length === 128);
  assert('NUL', ASCII_TABLE[0].name === 'NUL' && ASCII_TABLE[0].control);
  assert('space printable', ASCII_TABLE[32].printable && ASCII_TABLE[32].char === ' ');
  assert('A', ASCII_TABLE[65].char === 'A' && ASCII_TABLE[65].slot === 65 % 8);
  assert('DEL', ASCII_TABLE[127].name === 'DEL');
  assert('lookup A', asciiLookup('A').code === 65);
  assert('lookup 10', asciiLookup(10).name === 'LF');
  assert('printable count', printableAscii().length === 95);

  const r = stringToRuler('ABCDEFGH');
  assert('stringToRuler', r[0] === 65 && r[7] === 72);

  const six = runSixCoreTests();
  assert('six-core all pass', six.passed, six.failed ? `${six.failed} failed` : '');

  const rulerSmoke = rulerSelfTest();
  assert('ruler selfTest', rulerSmoke.passed);

  const failed = results.filter(x => !x.pass);
  return {
    passed: failed.length === 0,
    total: results.length,
    failed: failed.length,
    results,
    sixCore: six
  };
}

module.exports = {
  ASCII_TABLE,
  buildAsciiTable,
  asciiLookup,
  printableAscii,
  stringToRuler,
  runSixCoreTests,
  selfTest
};
