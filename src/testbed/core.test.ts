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
  FACES, vertexReading, faceReading, vertexClosed, faceClosed,
  circulate, xnor, delta16, swapDelta as swapDeltaFold,
} from '../../core/src/verified/index.ts';
import type { Circulator, Decision } from '../../core/src/verified/index.ts';

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

// The closure law ∂(b) = 0000, tested with non-zero input (wiki: SPEC-67).
const bits = (s: string) => parseInt(s, 2);

test('Closure fails when it should: one edge is open at both its ends', () => {
  assert.deepEqual(vertexReading(bits('100000')), [1, 1, 0, 0]); // e01 alone: vertices 0 and 1 open
  assert.equal(vertexClosed(bits('100000')), false);
  assert.deepEqual(vertexReading(bits('100001')), [1, 1, 1, 1]); // two opposite edges: open everywhere
});

test('Closure succeeds when it should: every face, and every four-cycle, is vertex-closed', () => {
  for (const f of FACES) assert.ok(vertexClosed(f), f.toString(2));
  for (const c of ['011110', '101101', '110011']) assert.ok(vertexClosed(bits(c)), c);
});

test('Of the 64 states: 8 vertex-closed, 8 face-closed, and 4 closed both ways', () => {
  const all = [...Array(64).keys()];
  const v = all.filter(vertexClosed), f = all.filter(faceClosed);
  assert.equal(v.length, 8);
  assert.equal(f.length, 8);
  assert.deepEqual(all.filter((b) => vertexClosed(b) && faceClosed(b)).map((b) => b.toString(2).padStart(6, '0')),
    ['000000', '011110', '101101', '110011']);
  assert.deepEqual(faceReading(bits('111000')), [0, 0, 0, 0]); // the star at vertex 0 is face-closed
});

// The Circulator and the Axiom of Propagation (wiki: SPEC-05, SPEC-06, SPEC-07).
const boundary = (decide: Circulator['decide'], handler?: Circulator['handler']) => {
  let departures = 0;
  const c: Circulator = { decide, depart: () => { departures++; }, ...(handler ? { handler } : {}) };
  return { c, departures: () => departures };
};

test('Conservation of departure: the departure runs exactly once in all five states', () => {
  const decisions: Decision[] = [{ kind: 'terminate' }, { kind: 'forward' }, { kind: 'modify-and-forward', delta: 4 }, { kind: 'exit' }];
  for (const d of decisions) {
    const b = boundary(() => d);
    circulate(b.c, 60);
    assert.equal(b.departures(), 1, d.kind);
  }
  const raising = boundary(() => { throw new Error('not resolvable here'); });
  assert.equal(circulate(raising.c, 60).state, 'raise');
  assert.equal(raising.departures(), 1);
});

test('Decision and delta are separate: forward carries unchanged; only modify-and-forward has a delta, and it is recoverable', () => {
  assert.deepEqual(circulate(boundary(() => ({ kind: 'forward' })).c, 60), { state: 'forward', carried: 60 });
  const out = circulate(boundary(() => ({ kind: 'modify-and-forward', delta: 64 })).c, 60);
  assert.deepEqual(out, { state: 'modify-and-forward', carried: 124, delta: 64 });
  if (out.state === 'modify-and-forward') assert.equal(out.carried ^ 60, out.delta); // the delta is attributable
  assert.deepEqual(circulate(boundary(() => ({ kind: 'terminate' })).c, 60), { state: 'terminate' });
});

test('A handler turns a raise into a decision; without one the raise continues', () => {
  const handled = boundary(() => { throw new Error('raised'); }, () => ({ kind: 'forward' }));
  assert.deepEqual(circulate(handled.c, 7), { state: 'forward', carried: 7 });
  const unhandled = boundary(() => { throw new Error('raised'); });
  assert.equal(circulate(unhandled.c, 7).state, 'raise');
});

test('Exit contributes nothing to the difference reading but the full complement to the sameness reading', () => {
  const x = 0x3c;
  assert.equal(x ^ 0, x);              // XOR: an absent reading changes nothing
  assert.equal(xnor(x, 0, 8), 0xc3);   // XNOR at 8 bits: an absent reading is the complement
  assert.equal(xnor(x, x, 8), 0xff);   // sameness of a reading with itself: all ones
});

test('The carry-forward fold (the carry is the previous state) has period 24 for the bit delta and 6 for the swap delta', () => {
  const period16 = (a: number, b: number) => { let x = a, y = b, k = 0; do { [x, y] = [delta16(x, y), x]; k++; } while ((x !== a || y !== b) && k < 1000); return k; };
  for (const [a, b] of [[1, 0], [60, 64], [0x1d1d, 0x1337], [0xbeef, 0x3c3c]]) assert.equal(24 % period16(a!, b!), 0);
  assert.equal(period16(60, 64), 24);
  const same = (u: Uint8Array, v: Uint8Array) => u.every((q, i) => q === v[i]);
  const a = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]), b = Uint8Array.from([9, 10, 11, 12, 13, 14, 15, 16]);
  let x = a, y = b, k = 0;
  do { [x, y] = [swapDeltaFold(x, y), x]; k++; } while (!(same(x, a) && same(y, b)) && k < 100);
  assert.equal(k, 6);
});

test('The fold points split without carries: 60 = 44 XOR 16 and 15 = 11 XOR 4; 240 counts the ordered pairs of distinct indices in 16', () => {
  assert.equal(60 ^ 44, 16); assert.equal(44 & 16, 0);
  assert.equal(11 ^ 4, 15); assert.equal(11 & 4, 0);
  let pairs = 0;
  for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) if (i !== j) pairs++;
  assert.equal(pairs, 240);
});

test('The upper block of the orbit is the lower block with bit 6 set, not its bitwise XNOR', () => {
  for (let m = 0; m < 64; m++) {
    assert.equal(60 ^ (64 + m), 64 + (60 ^ m));
    assert.notEqual(60 ^ (64 + m), xnor(60, m, 7));
  }
});

// ---- The last stretch of the ontology conversation (SPEC-07 I-28 to I-44) ----
import { METRON, bind, isPrime, clusters, QUADRUPLET, SEXTUPLET, ladderAsWritten } from '../../core/src/verified/index.ts';

test('Small closed facts: e ⊕ E, the ruler, the generator, the BQF', () => {
  assert.equal('e'.charCodeAt(0) ^ 'E'.charCodeAt(0), 0x20);
  assert.equal(2 + 6, 8); // 2! + 3!
  const generator = [[0, 2, 1], [3, 7, 11, 15], [17, 19]];
  assert.deepEqual(generator.map((g) => g.length), [3, 4, 2]);
  assert.equal(3 + 4 + 2, 9);
  assert.equal(3 * 4 * 2, 24); // 4!
  for (let x = -5; x <= 5; x++) for (let y = -5; y <= 5; y++) {
    const Q = 60 * x * x + 16 * x * y + 4 * y * y;
    assert.equal(Q, 4 * (11 * x * x + (2 * x + y) ** 2));
    assert.equal(16 * x * x + 16 * x * y + 4 * y * y, (4 * x + 2 * y) ** 2);
    if (x !== 0 || y !== 0) assert.ok(Q > 0); // positive definite
  }
  assert.equal(16 * 16 - 4 * 60 * 4, -704);
  assert.equal(16 * 16 - 4 * 16 * 4, 0);
});

test('The mêtron: fifteen coordinates; bind copies them into an unbound carrier', () => {
  assert.equal(METRON.length, 15);
  assert.deepEqual([...METRON].map(Number), [0, 1, 2, 3, 5, 7, 9, 10, 11, 12, 13, 14, 15, 23, 25]);
  assert.equal(0x17n, 23n);
  assert.equal(0x19n, 25n);
  assert.notEqual(0x17n, 17n);
  const unbound = new BigInt64Array(16);
  const { carrier } = bind(unbound);
  assert.deepEqual([...carrier.subarray(0, 15)], [...METRON]);
  assert.equal(carrier[15], 0n);
  assert.deepEqual([...unbound], new Array(16).fill(0n)); // not mutated
  assert.throws(() => bind(new BigInt64Array(14)), RangeError);
});

test('Prime clusters: the two quadruplets share the bridge {11, 13}', () => {
  assert.deepEqual(clusters(QUADRUPLET, 20), [5, 11]);
  assert.ok([5, 7, 11, 13, 17, 19].every(isPrime));
  assert.deepEqual(clusters(SEXTUPLET, 20000), [7, 97, 16057, 19417]);
  for (const p of clusters(SEXTUPLET, 20000).slice(1)) assert.equal(p % 210, 97);
});

test('The 210 ladder as written fails at rung 1', () => {
  assert.deepEqual(ladderAsWritten(0), [5, 7, 11, 13, 17, 19]);
  assert.equal(ladderAsWritten(1)[2], 221);
  assert.equal(221, 13 * 17);
  assert.ok(!ladderAsWritten(1).every(isPrime));
  // {5,…,19} has every residue mod 5, so it can happen only where 5 itself is in it.
  assert.deepEqual(new Set([5, 7, 11, 13, 17, 19].map((k) => k % 5)).size, 5);
});

test('The preheader names: PINEboxed is boxedPINE rotated by 5; boxdpin is pin + boxd', () => {
  const name = 'boxedPINE';
  assert.equal(name.slice(5) + name.slice(0, 5), 'PINEboxed');
  const letters = (s: string) => [...s].sort().join('');
  assert.equal(letters('boxdpin'), letters('pin' + 'boxd'));
  assert.equal('<boxdpin?boxedPINE=PINEboxed>'.length, 29); // I-26
});

// ---- The tree: sixteen Blobs as an index of index indices (SPEC-09) ----
import { FILES, BYTES_PER_FILE, TREE_BITS, address, split, makeTree, readBit } from '../../core/src/verified/index.ts';

test('The tree: 16 files of 65,536 bits, addressed by one 20-bit index', () => {
  assert.equal(FILES, 16);
  assert.equal(BYTES_PER_FILE, 8192);
  assert.equal(TREE_BITS, 2 ** 20);
  for (const index of [0, 1, 7, 8, 65535, 65536, 0x3c3c3, TREE_BITS - 1]) {
    const { file, byte, bit } = split(index);
    assert.equal(address(file, byte, bit), index);
  }
  assert.deepEqual(split(65536), { file: 1, byte: 0, bit: 0 });
  assert.throws(() => split(TREE_BITS), RangeError);
  assert.throws(() => address(16, 0, 0), RangeError);
});

test('The tree is seeded by fill and read by index', () => {
  const tree = makeTree((file) => (file === 0 ? 0x3c : 0xff));
  assert.equal(tree.length, 16);
  assert.ok(tree.every((f) => f.length === 8192));
  // 0x3C = 00111100: bits 2 to 5 set
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 7].map((bit) => readBit(tree, address(0, 100, bit))), [0, 0, 1, 1, 1, 1, 0, 0]);
  assert.equal(readBit(tree, address(15, 8191, 7)), 1);
  assert.equal(readBit(makeTree(), 12345), 0);
});
