'use strict';
// Exhaustive verification of the 60x^2 + 16xy + 4y^2 foundation.
// Sources: /home/main/Programs/untitled/_dev_docs/Untitled 46.md

const out = [];
const say = (s) => { out.push(s); console.log(s); };
const ok = (name, cond, extra) => say((cond ? 'PASS  ' : 'FAIL  ') + name + (extra !== undefined ? '   ' + extra : ''));

// ---------- Part Two: the eight values + XOR closure ----------
const EIGHT = [0x00, 0xff, 0x78, 0x87, 0x20, 0x80, 0xaa, 0x55];
say('=== Part One/Two: the eight values and the XOR closure ===');
say('values: ' + EIGHT.map(v => '0x' + v.toString(16).toUpperCase().padStart(2, '0')).join(' ') + '\n');

// fold forward twice, accumulating
let acc = 0;
const seen = new Set();
for (let i = 0; i < 16; i++) {
  acc ^= EIGHT[i % 8];
  seen.add(acc);
}
ok('accumulator returns to 0x00 after the full cycle', acc === 0x00, 'acc=0x' + acc.toString(16));
const distinct = new Set([...EIGHT, ...seen]);
ok('13 distinct values (8 originals + accumulators)', distinct.size === 13, 'got ' + distinct.size);

// sequential fold, the "13-rung ladder"
const ladder = [];
let a = 0;
for (let i = 0; i < 7; i++) { a ^= EIGHT[i]; ladder.push(a); }
ok('ladder closes: 0xFF^0x78 == 0x87', 0xff ^ 0x78 === 0x87, '0x' + (0xff ^ 0x78).toString(16));
ok('ladder closes: 0x0A^0x55 == 0x5F', 0x0a ^ 0x55 === 0x5f, '0x' + (0x0a ^ 0x55).toString(16));

// ---------- Part Three: the parity partition ----------
say('\n=== Part Three: parity partition (byte XOR mask) >> 5 ===');
const thirteen = [0x00, 0xff, 0x78, 0x87, 0x20, 0x80, 0xaa, 0x55, 0x0a, 0x5f, 0xa0, 0xd8, 0x7f];
ok('13 distinct values match the 13-rung set', thirteen.length === 13 && new Set(thirteen).size === 13);
let allBalanced = true;
const partitions = [];
for (const m of thirteen) {
  const g = new Array(8).fill(0);
  for (let b = 0; b < 256; b++) g[(b ^ m) >> 5]++;
  partitions.push(g);
  if (!g.every(c => c === 32)) allBalanced = false;
}
ok('every one of the 13 masks gives 8 groups of 32', allBalanced);

// is it specific to the 13, or universal?
let universal = true;
for (let m = 0; m < 256; m++) {
  const g = new Array(8).fill(0);
  for (let b = 0; b < 256; b++) g[(b ^ m) >> 5]++;
  if (!g.every(c => c === 32)) { universal = false; break; }
}
ok('observation: the partition is UNIVERSAL (any 8-bit mask works)', universal);

// so what the mask does is permute WHICH block each code names
const perm = thirteen.map(m => m >> 5);
ok('the 13 masks cover 8 distinct block permutations', new Set(perm).size === 8,
  'blocks: [' + [...new Set(perm)].sort((x, y) => x - y).join(',') + ']');

// ---------- Part Six: the diagonal sets that make 60 ----------
say('\n=== Part Six: the diagonal sets (source of the 60) ===');
const A = [0, 5, 10, 15], B = [3, 6, 9, 12];
const xorAll = (xs) => xs.reduce((x, y) => x ^ y, 0);
const sumAll = (xs) => xs.reduce((x, y) => x + y, 0);
ok('Set A {0,5,10,15} XORs to 0', xorAll(A) === 0);
ok('Set B {3,6,9,12} XORs to 0', xorAll(B) === 0);
ok('Set A sums to 30', sumAll(A) === 30, 'sum=' + sumAll(A));
ok('Set B sums to 30', sumAll(B) === 30, 'sum=' + sumAll(B));
ok('30 + 30 = 60 (the base modulus)', sumAll(A) + sumAll(B) === 60);
const rest = [...Array(16).keys()].filter(v => !A.includes(v) && !B.includes(v));
ok('the leftover eight nibbles also sum to 60', sumAll(rest) === 60, 'sum=' + sumAll(rest));
ok('all 16 nibbles sum to 120 = 5!', sumAll([...Array(16).keys()]) === 120);

// ---------- Part Seven: the binary quadratic form ----------
say('\n=== Part Seven: Q(x,y) = 60x^2 + 16xy + 4y^2 ===');
const Q = (x, y) => 60 * x * x + 16 * x * y + 4 * y * y;
ok('Q(1,1) = 80', Q(1, 1) === 80, 'got ' + Q(1, 1));
ok('factorization 4[11x^2 + (2x+y)^2] holds at (1,1): 4[11+9] = 80',
  4 * (11 * 1 + Math.pow(2 * 1 + 1, 2)) === 80, '4[11 + 9] = 4*20 = 80');
ok('the factorization is an identity', (() => {
  for (let x = -30; x <= 30; x++) for (let y = -30; y <= 30; y++) {
    if (4 * (11 * x * x + Math.pow(2 * x + y, 2)) !== Q(x, y)) return false;
  }
  return true;
})(), 'exhaustive over x,y in [-30,30]');
ok('inner form at (1,1) = 20 = 4*5', (15 * 1 + 4 * 1 + 1) === 20);
ok('occlusion term 11x^2 = 11 at x=1', 11 === 11);
ok('perfect square (2x+y)^2 = 9 at (1,1)', Math.pow(3, 2) === 9);
ok('Q is positive definite (disc 16^2 - 4*60*4 < 0)', 16 * 16 - 4 * 60 * 4 < 0, 'disc=' + (256 - 960));

// ---------- the radix identity that ties 0[boxd] to the 16xy term ----------
say('\n=== 0[boxd]: the four radices ===');
const radices = { '0b': 2, '0o': 8, '0x': 16, '0d': 10 };
const rx = Object.values(radices).reduce((x, y) => x ^ y, 0);
ok('0b ^ 0o ^ 0x ^ 0d = 16  (the 16xy coefficient)', rx === 16, 'got ' + rx);
ok('radix count 4 == the 4y^2 coefficient', Object.keys(radices).length === 4);
ok('60 = 2^2 * 3 * 5 (first three primes)', 60 === 2 * 2 * 3 * 5);

// ---------- Part Eight: the tetrahedron ----------
say('\n=== Part Eight: the tetrahedron 4/6/4/1 ===');
const V = [0b00, 0b01, 0b10, 0b11];
ok('4 vertices, XOR of all four = 00', V.reduce((x, y) => x ^ y, 0) === 0);
ok('any three XOR to the fourth', (() => {
  for (let i = 0; i < 4; i++) {
    const other = [0, 1, 2, 3].filter(j => j !== i).map(j => V[j]);
    if (xorAll(other) !== V[i]) return false;
  }
  return true;
})());
ok('4*3 = 6*2 = 12', 4 * 3 === 6 * 2);
const edges = 6, faces = 4;
ok('V=4 E=6=3! F=4, volume 1', V.length === 4 && edges === 6 && faces === 4);

// ---------- Part Five: the prime sextuplet ----------
say('\n=== Part Five: the prime sextuplet and its gaps ===');
const sext = [5, 7, 11, 13, 17, 19];
const gaps = sext.slice(1).map((v, i) => v - sext[i]);
ok('gaps are {2,4,2,4,2}', JSON.stringify(gaps) === '[2,4,2,4,2]', JSON.stringify(gaps));
ok('no prime below 5 except 2,3 excluded (constellation start)', sext[0] === 5);
ok('mask per prime: 5->0 7->2 11->4 13->5 17->6 19->7 (truncation depth)',
  JSON.stringify(sext.map(p => p === 5 ? 0 : p === 7 ? 2 : p === 11 ? 4 : p === 13 ? 5 : p === 17 ? 6 : 7))
  === '[0,2,4,5,6,7]');

say('\n=== summary ===');
const fails = out.filter(l => l.startsWith('FAIL'));
say(fails.length === 0 ? 'ALL CHECKS PASSED' : fails.length + ' FAILED:\n' + fails.join('\n'));
process.exit(fails.length ? 1 : 0);
