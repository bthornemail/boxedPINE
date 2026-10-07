// Checks the verified findings in core/src/verified against the facts
// recorded in the wiki. Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  makeSlots, exchange, digest,
  swap16, swap32, swap64, swapDelta, xorBytes,
  delta16Steps,
  lastBlockOffset, orbit60, BUFFERS_PER_BLOB, coordinate, POLES, quadrantReadings, separation, GAUGE,
  xorTriples,
} from '../../core/src/verified/index.ts';

test('Level 0: a matched exchange writes and reports no difference', () => {
  const slots = makeSlots(64);
  slots[60] = 60;
  assert.deepEqual(exchange(slots, 60, 60, 7), { matched: true, old: 60, difference: 0 });
  assert.equal(slots[60], 7);
});

test('Level 0: a missed exchange leaves the slot and reports expected XOR old', () => {
  const slots = makeSlots(64);
  slots[60] = 9;
  assert.deepEqual(exchange(slots, 60, 7, 4), { matched: false, old: 9, difference: 7 ^ 9 });
  assert.equal(slots[60], 9);
});

test('Level 0: the digest is 0 on a hit and expected XOR replacement on a miss', () => {
  const slots = makeSlots(1);
  slots[0] = 7;
  assert.equal(digest(slots, 0, 7, 9), 0);
  assert.equal(digest(slots, 0, 7, 4), 7 ^ 4);
});

test('Swaps move byte j to j XOR 1, 3 and 7, and never touch the input', () => {
  const bytes = Uint8Array.from([0, 1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual([...swap16(bytes)], [1, 0, 3, 2, 5, 4, 7, 6]);
  assert.deepEqual([...swap32(bytes)], [3, 2, 1, 0, 7, 6, 5, 4]);
  assert.deepEqual([...swap64(bytes)], [7, 6, 5, 4, 3, 2, 1, 0]);
  assert.deepEqual([...bytes], [0, 1, 2, 3, 4, 5, 6, 7]); // permutation, not mutation
});

test('Swaps agree with Node Buffer.swap16/32/64', () => {
  const bytes = Uint8Array.from([10, 20, 30, 40, 50, 60, 70, 80]);
  assert.deepEqual([...swap16(bytes)], [...Buffer.from(bytes).swap16()]);
  assert.deepEqual([...swap32(bytes)], [...Buffer.from(bytes).swap32()]);
  assert.deepEqual([...swap64(bytes)], [...Buffer.from(bytes).swap64()]);
});

test('All six orderings of the three swaps give one permutation (3! → 1!)', () => {
  const x = Uint8Array.from([0, 1, 2, 3, 4, 5, 6, 7]);
  const fs = [swap16, swap32, swap64];
  const orders = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  const results = orders.map((o) => o.reduce((acc, i) => fs[i](acc), x).join());
  assert.equal(new Set(results).size, 1);
  assert.equal(results[0], [5, 4, 7, 6, 1, 0, 3, 2].join()); // j ⊕ 5
});

test('The swap delta without carry is its own inverse; with a carry it returns after 4 steps', () => {
  const zero = new Uint8Array(16);
  const x = Uint8Array.from({ length: 16 }, (_, i) => (i * 37 + 11) & 0xff);
  assert.deepEqual([...swapDelta(swapDelta(x, zero), zero)], [...x]);
  const carry = Uint8Array.from({ length: 16 }, (_, i) => (i * 91 + 5) & 0xff);
  let y = x;
  for (let i = 0; i < 4; i++) y = swapDelta(y, carry);
  assert.deepEqual([...y], [...x]);
  assert.notDeepEqual([...xorBytes(x, x)], [...x]);
});

test('The bit-level delta16 returns after 8 steps (Coq-proved period)', () => {
  for (const c of [0x0000, 0x001d, 0x1d1d, 0x1337, 0xffff]) {
    for (const x of [0x0001, 0x3c3c, 0xbeef]) assert.equal(delta16Steps(x, c, 8), x);
  }
});

test('12, 60, 124 and 252 are one wordform at widths 4, 6, 7 and 8', () => {
  assert.deepEqual([4, 6, 7, 8].map(lastBlockOffset), [12, 60, 124, 252]);
  assert.equal(60 ^ 64, 124);
  assert.equal(60 ^ 192, 252);
  assert.equal(BUFFERS_PER_BLOB, 128);
});

test('The orbit of 60 starts with the four blocks < = > ? 8 9 : ; 4 5 6 7 0 1 2 3', () => {
  const chars = orbit60().slice(0, 16).map((n) => String.fromCharCode(n)).join('');
  assert.equal(chars, '<=>?89:;45670123');
});

test('Distinguished triples: 7, 35, 155, 651', () => {
  assert.deepEqual([3, 4, 5, 6].map((w) => xorTriples(w).length), [7, 35, 155, 651]);
});

test('60 ⊕ 64 is the lower-8 reading and 60 ⊕ 128 the higher-8 reading: rows 7 and 11, column 12', () => {
  assert.deepEqual(coordinate(POLES.lower), { row: 7, column: 12 });
  assert.deepEqual(coordinate(POLES.higher), { row: 11, column: 12 });
  assert.ok(coordinate(POLES.lower).row < 8 && coordinate(POLES.higher).row >= 8);
});

test("The four readings of 60 keep column 12; their rows are the four-block family", () => {
  const readings = quadrantReadings();
  assert.deepEqual(readings, [60, 124, 188, 252]);
  assert.ok(readings.every((b) => coordinate(b).column === 12));
  assert.deepEqual(readings.map((b) => coordinate(b).row), [0, 4, 8, 12].map((k) => 3 ^ k));
});

test('The two poles differ by the diagonal: row 7 ⊕ row 11 = 12, and all four readings close', () => {
  assert.equal(coordinate(POLES.lower).row ^ coordinate(POLES.higher).row, 12);
  assert.equal(quadrantReadings().reduce((a, b) => a ^ b, 0), 0);
});

test('Bit 64 splits the alphanumerics into the 10 digits and the 52 letters; folding case gives base36', () => {
  const alnum = [...Array(128).keys()].filter((c) => /[0-9A-Za-z]/.test(String.fromCharCode(c)));
  const numeric = alnum.filter((c) => !separation(c).alphaSide);
  const alpha = alnum.filter((c) => separation(c).alphaSide);
  assert.equal(String.fromCharCode(...numeric), '0123456789');
  assert.ok(alpha.every((c) => /[A-Za-z]/.test(String.fromCharCode(c))) && alpha.length === 52);
  assert.equal(numeric.length + new Set(alpha.map((c) => c & ~32)).size, 36);
  assert.ok(separation(60 ^ 128).beyondAscii && !separation(60 ^ 64).beyondAscii);
});

test('The Polybius gauge diagonals each XOR to 0 and sum to 0x1E; all sixteen nibbles sum to 0x78', () => {
  for (const d of [GAUGE.dPlus, GAUGE.dMinus]) {
    assert.equal(d.reduce((a, b) => a ^ b, 0), 0);
    assert.equal(d.reduce((a, b) => a + b, 0), 0x1e);
  }
  assert.equal([...Array(16).keys()].reduce((a, b) => a + b, 0), 0x78);
});
