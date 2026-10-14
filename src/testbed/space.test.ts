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

test('The Commons polyform generator: a MaxiCode declaration and a seed give one connected polyform', async () => {
  const { packDeclaration, unpackDeclaration, grow, daliCross, connected } = await import('../../space/src/polyform.ts');
  for (let w = 0; w < 1 << 15; w += 2) assert.equal(packDeclaration(unpackDeclaration(w)), w & 0x7ffe, 'the 15-bit declaration round-trips (the reserved bit aside)');
  for (const dimension of [0, 1, 2, 3] as const) for (const degree of [1, 4, 5, 8, 16]) for (const seed of [0x4242, 0xdead, 0x0000]) {
    const cells = grow({ basis: 0, degree, dimension, group: 0 }, seed);
    assert.equal(cells.length, dimension === 2 ? degree * 3 : degree, `${dimension} ${degree}`);
    assert.equal(new Set(cells.map((c) => c.join())).size, cells.length, 'no cell twice');
    assert.ok(connected(cells), `connected: dimension ${dimension}, degree ${degree}`);
    if (dimension === 0) assert.ok(cells.every((c) => c[1] === 0 && c[2] === 0), '1D is a stick');
    if (dimension === 1) assert.ok(cells.every((c) => c[1] === 0), '2D is flat');
    assert.deepEqual(grow({ basis: 0, degree, dimension, group: 0 }, seed), cells, 'the same every time');
  }
  const dali = daliCross();
  assert.equal(dali.length, 8);
  assert.ok(connected(dali), 'the Dalí cross is one piece');
  const neighbours = (c: number[]) => dali.filter((d) => Math.abs(d[0]! - c[0]!) + Math.abs(d[1]! - c[1]!) + Math.abs(d[2]! - c[2]!) === 1).length;
  assert.deepEqual(dali.map(neighbours).sort(), [1, 1, 1, 1, 1, 1, 2, 6], 'one cube with six faces taken, its column-mate, and six ends: the tesseract net');
});

test('The Commons agents: synset agents and bridge agents step K; messages naming a synset find it', async () => {
  const { readFileSync } = await import('node:fs');
  const { synsetSeed, speakerSeed, stepAgent, sectorOf, namedSynset, placeOf, WALK_RADIUS } = await import('../../space/src/commons-agents.ts');
  const { K } = await import('../../space/src/gnomon.ts');
  const m = JSON.parse(readFileSync(new URL('../../public/polytron/commons.json', import.meta.url), 'utf8'));
  assert.deepEqual(m.agents.map((a: { word: string }) => a.word), ['entity', 'physical entity', 'abstraction', 'thing', 'object', 'person']);
  assert.deepEqual(m.missing, [100017480, 100020890], 'two synsets polytron drew are not in WordNet 3.0');
  assert.equal(speakerSeed('claude'), 0x636c, 'a speaker seed is its first two characters as a pair, not a hash');
  for (const a of m.agents) {
    let s = synsetSeed(a);
    for (let i = 0; i < 8; i++) { const n = stepAgent(s, 0); assert.equal(n.state, K(s)); s = n.state; }
    assert.equal(s, synsetSeed(a), `${a.word} comes back after 8 steps`);
  }
  assert.equal(sectorOf(0xe000), 7);
  for (let s = 0; s < 0x10000; s += 0x111) assert.ok(Math.abs(Math.hypot(...placeOf(s, 0)) - WALK_RADIUS) < 1e-9, 'lane 0 walks the ring');
  assert.equal(namedSynset('is that a Physical Entity or a thing?', m.agents)?.word, 'physical entity', 'the longer name first');
  assert.equal(namedSynset('nothing here', m.agents), undefined);
});
