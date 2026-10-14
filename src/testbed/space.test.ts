// Checks space/src/breadboard.geometry.ts: the geometry is plain data, so it is
// checked here without a browser. Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { breadboardGeometry, toAframe } from '../../space/src/breadboard.geometry.ts';
import { createKernel } from '../../breadboard/kernel.mjs';

test('The geometry has one board and one LED per build, and one cylinder per transistor', () => {
  const circuits = createKernel().circuits as { id: string; transistorCount: number }[];
  const shapes = breadboardGeometry();
  assert.equal(shapes.filter((s) => s.role === 'board').length, circuits.length);
  assert.equal(shapes.filter((s) => s.role === 'led').length, circuits.length);
  for (const c of circuits) {
    assert.equal(shapes.filter((s) => s.kind === 'cylinder' && s.build === c.id).length, c.transistorCount, c.id);
  }
  assert.deepEqual(circuits.map((c) => c.transistorCount), [5, 6, 8, 10]);
});

test('The same geometry writes out as A-Frame entities', () => {
  const shapes = breadboardGeometry();
  const html = toAframe(shapes);
  assert.equal(html.split('\n').length, shapes.length);
  assert.equal((html.match(/<a-cylinder /g) ?? []).length, 29); // 5 + 6 + 8 + 10
  assert.equal((html.match(/<a-sphere /g) ?? []).length, 4);
});

// ---- The four XOR builds: XOR outside, universal inside (SPEC-07 I-105) ----
import { evaluate, ledLit, VECTORS } from '../../breadboard/kernel.mjs';

test('Every build lights on XOR, but each is made of NAND or NOR, and their nodes together reach all 16 two-input gates', () => {
  const k = createKernel();
  const AFFINE = new Set([0b0000, 0b1111, 0b1100, 0b0011, 0b1010, 0b0101, 0b0110, 0b1001]);
  const column = (c: (typeof k.circuits)[number], read: (bits: Map<string, number>) => number) =>
    VECTORS.reduce((m: number, [a, b]: number[], i: number) => m | (read(evaluate(c, a, b)) << i), 0);
  const found = new Set<number>();
  for (const c of k.circuits) {
    assert.equal(column(c, (bits) => ledLit(c, bits)), 0b0110, `${c.id} lights on XOR`);
    const nodes = c.gates.map((g: { net: string }) => column(c, (bits) => bits.get(g.net)!));
    nodes.forEach((f: number) => found.add(f));
    assert.ok(nodes.some((f: number) => !AFFINE.has(f)), `${c.id} has a node XOR gates cannot make`);
  }
  // wire the found node functions as two-input gates, starting from a and b
  let reach = new Set([0b1100, 0b1010]);
  for (let round = 0; round < 6; round++)
    for (const op of found) for (const x of [...reach]) for (const y of [...reach])
      reach.add([0, 1, 2, 3].reduce((m, i) => m | (((op >> (((x >> i) & 1) * 2 + ((y >> i) & 1))) & 1) << i), 0));
  assert.equal(reach.size, 16);
  assert.ok(found.has(0b0111) && found.has(0b0001)); // NAND and NOR, each complete alone
});

test("Polytron's gnomon for the Agent Commons: 8 steps from 0x4242, as tetra-gnomon-anim prints them", async () => {
  const { gnomon, hex16 } = await import('../../space/src/gnomon.ts');
  const steps = gnomon(0x4242);
  assert.deepEqual(steps.map((s) => `${hex16(s.state)} ${hex16(s.sid)}`), [
    '0x4242 0x061B', '0x061B 0xFD75', '0xFD75 0x6E04', '0x6E04 0xB7B7',
    '0xB7B7 0x3F22', '0x3F22 0x0880', '0x0880 0x573D', '0x573D 0x4242',
  ]);
  for (const seed of [0x0000, 0xdead, 0xbeef, 0xffff]) assert.equal(gnomon(seed).length, 8, hex16(seed));
});
