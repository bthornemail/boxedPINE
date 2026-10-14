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

test('The colour synsets: 144, one tree to entity, each hue its own CSS name or its nearest ancestor\'s', async () => {
  const { readFileSync } = await import('node:fs');
  const { colors } = JSON.parse(readFileSync(new URL('../../public/polytron/colors.json', import.meta.url), 'utf8')) as { colors: { id: number; parent: number | null; word: string; depth: number; hue: number | null; hueFrom: string | null }[] };
  assert.equal(colors.length, 144, 'proofs I-199');
  const byId = new Map(colors.map((c) => [c.id, c]));
  assert.equal(byId.size, 144);
  assert.deepEqual(colors.filter((c) => c.parent === null).map((c) => c.word), ['entity']);
  for (const c of colors) {
    if (c.parent !== null) assert.equal(c.depth, byId.get(c.parent)!.depth + 1, `${c.word}: one deeper than its parent`);
    if (c.hue !== null) {
      assert.ok(c.hue >= 0 && c.hue < 360);
      if (c.hueFrom !== c.word) { const p = byId.get(c.parent!)!; assert.equal(c.hue, p.hue, `${c.word} inherits ${p.word}'s hue`); }
    }
  }
  const hue = (w: string) => colors.find((c) => c.word === w)!.hue;
  assert.deepEqual(['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'].map(hue), [0, 39, 60, 120, 240, 275, 300]);
  assert.equal(hue('black'), null);
});

test('An agent avatar: Light Garden\'s z-indexed parts, drawn lowest first, recorded without a hash', async () => {
  const { avatarParts, avatarSvg, avatarRecords } = await import('../../space/src/avatar.ts');
  const red = { id: 104962784, word: 'red', depth: 7, hue: 0 };
  assert.deepEqual(avatarParts(red).map((p) => [p.category, p.zIndex]), [['ring', 0], ['head', 5], ['body', 10], ['label', 20]]);
  const svg = avatarSvg(red);
  assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'));
  assert.ok(svg.indexOf('data-part="ring.0"') < svg.indexOf('data-part="label.104962784"'), 'lowest z first');
  assert.equal((svg.match(/<g /g) ?? []).length, (svg.match(/<\/g>/g) ?? []).length);
  const lines = avatarRecords(red).trim().split('\n').map((l) => JSON.parse(l));
  assert.deepEqual(lines.map((l) => l.kind), ['avatar.part', 'avatar.part', 'avatar.part', 'avatar.part', 'avatar.manifest']);
  assert.deepEqual(lines.at(-1).payload.z_order, [0, 5, 10, 20]);
  assert.ok(!JSON.stringify(lines).includes('sha'), 'no hash: the parts are named by their ids');
  assert.equal(avatarSvg(red), avatarSvg(red), 'the same agent, the same avatar');
  assert.ok(avatarSvg({ ...red, word: '<b>' }).includes('&lt;b&gt;'), 'the word is escaped');
});

test('Light Garden\'s characters stand on whole sectors of 30', () => {
  const ratios = [0, 1 / 12, 1 / 6, 1 / 3, 2 / 3, 3 / 4, 5 / 6];
  assert.deepEqual(ratios.map((r) => Math.round(r * 360)), [0, 30, 60, 120, 240, 270, 300]);
  assert.ok(ratios.every((r) => Number.isInteger(Math.round(r * 360 * 1e9) / 1e9 / 30)), 'each a whole number of 30-degree sectors');
});

test('Identity without hashing: words are indices, the check is the nibble parity, the identity is the entropy as tags', async () => {
  const { readFileSync } = await import('node:fs');
  const { wordsOf, entropyOf, foldCheck, tagsOf, Chain, verifyChain, pairsOf } = await import('../../space/src/identity.ts');
  const { K } = await import('../../space/src/gnomon.ts');
  const list = readFileSync(new URL('../../public/identity/bip39_english.txt', import.meta.url), 'utf8').trim().split('\n');
  assert.equal(list.length, 2048, '2048 words: an 11-bit index each');
  // 12 words: 128 bits of entropy and a 4-bit check, the XOR of its 32 nibbles
  const e = Uint8Array.from({ length: 16 }, (_, i) => (i * 37 + 11) & 0xff);
  let nibbles = 0; for (const b of e) nibbles ^= (b >> 4) ^ (b & 15);
  assert.equal(foldCheck(e), nibbles, 'the check of 128 bits is the nibble parity');
  const words = wordsOf(e, list);
  assert.equal(words.length, 12);
  const back = entropyOf(words, list);
  assert.ok('entropy' in back && Buffer.from(back.entropy).equals(Buffer.from(e)), 'the words give the entropy back');
  // one word changed: the check catches it (when the change is not in the check's own 4 bits' blind spot)
  const changed = [...words]; changed[0] = list[(list.indexOf(words[0]!) + 1) % 2048]!;
  assert.deepEqual(entropyOf(changed, list), { error: 'the check does not hold' });
  assert.deepEqual(entropyOf(words.slice(0, 11), list), { error: 'the word count is 12, 15, 18, 21 or 24' });
  // 24 words: 256 bits and an 8-bit check, the XOR of its bytes
  const e32 = Uint8Array.from({ length: 32 }, (_, i) => (i * 91 + 7) & 0xff);
  assert.equal(foldCheck(e32), e32.reduce((x, b) => x ^ b, 0), 'the check of 256 bits is the byte parity');
  assert.equal(wordsOf(e32, list).length, 24);
  // the identity: the entropy as /A-Z0-9/ tags
  const tags = tagsOf(e);
  assert.equal(tags.length, 4);
  for (const t of tags) assert.match(t, /^[A-Z0-9]{1,8}$/);
  assert.deepEqual(tagsOf(new Uint8Array(16).fill(255)), Array(4).fill('1Z141Z3'), '2^32 - 1 is 1Z141Z3: seven characters at most');
  // the chain: polytron's sid = K(sid, pair), every pair of every record
  const c = new Chain(e);
  assert.equal(c.root, K((e[0]! << 8) | e[1]!));
  const l1 = c.add('hello, world'), l2 = c.add('he');
  let sid = c.root; for (const p of pairsOf('hello, world')) sid = K(sid, p);
  assert.equal(l1.sid, sid);
  assert.notEqual(c.add('hello, there').sid, l1.sid, 'records that start alike step apart (polytron used only the first two bytes)');
  assert.equal(verifyChain(c.root, c.links), null, 'the chain replays');
  assert.equal(verifyChain(c.root, [l1, { ...l2, text: 'hf' }, ...c.links.slice(2)]), 2, 'a changed record is found by its place');
  assert.equal(l1.by, tags[0]);
});

test('Bridge messages may carry who (an identity tag) and sid (its chain, 16 bits), together and checked', async () => {
  const { check } = await import('../../rosetta/src/agent.ts');
  assert.deepEqual(check({ kind: 'say', from: 'author', text: 'hi', who: '1Z141Z3', sid: 0x4242 }), { kind: 'say', from: 'author', text: 'hi', who: '1Z141Z3', sid: 0x4242 });
  assert.equal(check({ kind: 'say', from: 'author', text: 'hi', who: 'abc', sid: 1 }), 'who is an /A-Z0-9/ tag');
  assert.equal(check({ kind: 'say', from: 'author', text: 'hi', who: 'ABC', sid: 0x10000 }), 'sid is 16 bits');
  assert.equal(check({ kind: 'say', from: 'author', text: 'hi', who: 'ABC' }), 'who and sid go together');
  assert.deepEqual(check({ kind: 'say', from: 'author', text: 'hi' }), { kind: 'say', from: 'author', text: 'hi' }, 'and both may be absent');
});

test('The border: a character\'s name and its cues in an SVG\'s margin; XOR 0x20 reads it in lowercase; the image does not change', async () => {
  const { readFileSync } = await import('node:fs');
  const { writeBorder, readBorder, clearBorder, cueName, CHARACTER_TAGS } = await import('../../space/src/border.ts');
  const square = readFileSync(new URL('../../proofs/svg/fano/Fano_full.svg', import.meta.url), 'utf8');
  for (const [point, name] of Object.entries(CHARACTER_TAGS)) {
    const cues = [Number(point) % 16, 11, 15];
    const framed = writeBorder(square, { name, cues });
    assert.deepEqual(readBorder(framed), { name, cues }, `${name} reads back`);
    assert.equal(readBorder(framed, 0x20).name, name.toLowerCase(), `${name} XOR 0x20 is ${name.toLowerCase()}`);
    assert.equal(clearBorder(framed), clearBorder(square), 'the image as drawn is unchanged');
    assert.deepEqual(readBorder(writeBorder(framed, { name: 'SOLON', cues: [] })), { name: 'SOLON', cues: [] }, 'an old border is replaced');
  }
  assert.equal(cueName(11), 'Fano_line_1_3_2');
  assert.throws(() => writeBorder(square, { name: 'ASABIYYAH', cues: [] }), /tag of 1 to 8/, 'nine letters is not a tag');
  assert.equal(CHARACTER_TAGS[4], 'ASABIYAH', 'the double Y closed to one: eight letters');
  assert.equal(CHARACTER_TAGS[4], 'ASABIYAH', 'the double Y closed to one: eight letters');
  assert.throws(() => writeBorder(square, { name: 'METATRON', cues: [16] }), /each 0 to 15/);
});

test('Restoring an agent\'s 16 icons from the Hasse diagram: two icons leave 4 to 8 labellings; three points off one line leave 1', () => {
  // the Fano plane's symmetries: the invertible 3 x 3 bit matrices acting on the points 1..7 (lines {a, b, a ^ b})
  const autos: ((v: number) => number)[] = [];
  for (let a = 1; a < 8; a++) for (let b = 1; b < 8; b++) for (let c = 1; c < 8; c++) {
    const g = (v: number) => (v & 1 ? a : 0) ^ (v & 2 ? b : 0) ^ (v & 4 ? c : 0);
    if (new Set([1, 2, 3, 4, 5, 6, 7].map(g)).size === 7 && ![1, 2, 3, 4, 5, 6, 7].map(g).includes(0)) autos.push(g);
  }
  assert.equal(autos.length, 168);
  const fixes = (pins: number[]) => autos.filter((g) => pins.every((p) => g(p) === p)).length;
  assert.equal(fixes([1, 2]), 4, 'two point icons: 4 labellings left');
  assert.equal(fixes([1, 2, 3]), 4, 'three points on one line (1, 2, 3): still 4');
  assert.equal(fixes([1, 2, 4]), 1, 'three points off one line, a basis: exactly 1');
});

test('Each character has its own set of 16: the 14 Fano planes and two Hasse diagrams, XOR (read) and XNOR (write), each bordered with the tag and its place', async () => {
  const { readFileSync } = await import('node:fs');
  const { readBorder, clearBorder, CHARACTER_TAGS } = await import('../../space/src/border.ts');
  const { INDEX16 } = await import('../../rosetta/src/agent.ts');
  const { characters } = JSON.parse(readFileSync(new URL('../../public/characters/trees.json', import.meta.url), 'utf8')) as { characters: { tag: string; set: string[] }[] };
  assert.deepEqual(characters.map((c) => c.tag), Object.values(CHARACTER_TAGS));
  const pub = (p: string) => readFileSync(new URL(`../../public/${p}`, import.meta.url), 'utf8');
  for (const c of characters) {
    assert.equal(c.set.length, 16);
    assert.ok(c.set[0]!.endsWith('/Hasse_XOR.svg') && c.set[15]!.endsWith('/Hasse_XNOR.svg'), 'XOR in place 0, XNOR in place 15');
    c.set.forEach((path, i) => assert.deepEqual(readBorder(pub(path)), { name: c.tag, cues: [i] }, `${path}: whose, and which of the 16`));
    for (let i = 1; i < 15; i++) assert.equal(clearBorder(pub(c.set[i]!)), clearBorder(readFileSync(new URL(`../../proofs/svg/fano/${INDEX16[i]}.svg`, import.meta.url), 'utf8')), `${c.set[i]}: the plane as drawn`);
    const [xor, xnor] = [pub(c.set[0]!), pub(c.set[15]!)];
    assert.ok(xor.includes('class="ring" cx="490"') && !xor.includes('class="ring2"'), 'the XOR diagram marks XOR');
    assert.ok(xnor.includes('class="ring2" cx="630"') && !xnor.includes('class="ring" cx="490"'), 'the XNOR diagram marks XNOR');
    for (const d of [xor, xnor]) {
      assert.ok(!d.includes('../fano/') && !/href="\.\/Fano_(empty|full)/.test(d) && !d.includes('Hasse_'), 'every node is one of the 16 or drawn inline; nothing points at itself');
      assert.ok(!/\s(sodipodi|inkscape):/.test(d), 'no editor namespaces left inline');
    }
  }
});

test('Atomics.compareExchange(svg, 60 ^ frame, 127, 63): as I-133, 128 bytes of 127; in 128 frames every byte reads XOR and writes XNOR; the next 128, the other way', async () => {
  const { newState, tick, indexOf, fileOf, written, hasseFor, EXCHANGES, READ, WRITE } = await import('../../space/src/exchange.ts');
  assert.deepEqual(EXCHANGES, { Hasse_XOR: [127, 63], Hasse_XNOR: [63, 127] }, 'the proofs\' values: 127 then 63; the other, 63 then 127');
  assert.equal(READ ^ WRITE, 0x40, 'one bit trades');
  assert.equal(indexOf(0), 60, 'frame 0 works on byte 60');
  assert.equal(indexOf(60), 0, 'frame 60 on byte 0');
  assert.equal(new Set([...Array(128).keys()].map(indexOf)).size, 128, '60 XOR f is one-to-one on 0-127: 128 frames, 128 bytes, each once');
  const state = newState();
  assert.equal(state.length, 128);
  assert.ok(state.every((b) => b === 127), 'filled with DEL, as I-133');
  for (let f = 0; f < 128; f++) assert.deepEqual(tick(state, f), { index: 60 ^ f, read: READ, file: 'Hasse_XOR' });
  assert.equal(written(state), 128, 'after 128 frames every byte is written');
  for (let f = 128; f < 256; f++) assert.deepEqual(tick(state, f), { index: 60 ^ (f & 127), read: WRITE, file: 'Hasse_XNOR' });
  assert.equal(written(state), 0, 'and after 256, every byte is read again');
  assert.equal(fileOf(255), 'Hasse_XNOR');
  assert.equal(fileOf(256), 'Hasse_XOR', 'and the cycle begins again');
  // the compare: a byte something else wrote first is read and left
  const other = newState();
  Atomics.store(other, 60, 7);
  assert.deepEqual(tick(other, 0), { index: 60, read: 7, file: 'Hasse_XOR' });
  assert.equal(Atomics.load(other, 60), 7, 'not finding 127, it writes nothing');
  assert.equal(hasseFor(63), 'Hasse_XNOR');
});

test('The frame hands the index to Atomics through a Proxy; Reflect writes the frame; Catch carries the outcome', async () => {
  const { newState, frameGate, READ, WRITE } = await import('../../space/src/exchange.ts');
  const state = newState();
  const gate = frameGate(state);
  assert.equal(gate.last, null, 'nothing exchanged before a frame is handed over');
  gate.frame = 0;
  assert.equal(gate.frame, 0, 'Reflect wrote the frame');
  assert.deepEqual(gate.last, { ok: true, value: { index: 60, read: READ, file: 'Hasse_XOR' } });
  assert.equal(state[60], WRITE, 'and the exchange happened at 60 ^ 0');
  gate.frame = 60;
  assert.deepEqual(gate.last, { ok: true, value: { index: 0, read: READ, file: 'Hasse_XOR' } }, 'frame 60 at byte 0');
  assert.throws(() => { (gate as { last: unknown }).last = null; }, TypeError, 'only the frame is handed over');
  // a failing exchange comes back as a value, not a throw (I-127: an index out of range is a RangeError)
  const broken = frameGate(new Uint8Array(4), undefined, (s, f) => ({ index: f, read: Atomics.compareExchange(s, f, 0, 1), file: 'Hasse_XOR' as const }));
  broken.frame = 99;
  assert.equal(broken.last?.ok, false);
  assert.ok(broken.last && !broken.last.ok && broken.last.error instanceof RangeError, 'the Catch carries the RangeError');
});

test('The story on the plane: the hints a walk can derive (every two lines meet once; any line is one step from any other)', async () => {
  const { readFileSync } = await import('node:fs');
  const { LINES, linesThrough, meet, choices, newWalker, step } = await import('../../space/src/story.ts');
  assert.deepEqual(LINES, [[1, 2, 4], [2, 3, 5], [3, 4, 6], [4, 5, 7], [1, 5, 6], [2, 6, 7], [1, 3, 7]], 'the square\'s plane: line i = {1,2,4} + (i - 1)');
  for (let p = 1; p <= 7; p++) assert.equal(linesThrough(p).length, 3, `point ${p} is on three lines`);
  for (let a = 1; a <= 7; a++) for (let b = 1; b <= 7; b++) if (a !== b) assert.equal(meet(a, b).length, 1, `lines ${a} and ${b} meet in one point`);
  // so from any line every other line is one step away: through the point they meet at
  for (let l = 1; l <= 7; l++) assert.deepEqual(new Set(choices(l).flatMap((c) => c.lines)), new Set([1, 2, 3, 4, 5, 6, 7].filter((x) => x !== l)), `from line ${l}, all six others`);
  const { passages } = JSON.parse(readFileSync(new URL('../../public/story/passages.json', import.meta.url), 'utf8'));
  assert.equal(passages.length, 218, 'every passage with an angle is placed');
  // a chosen step, and a step by K
  const w = newWalker(0x4242);
  const s1 = step(w, passages, { point: 2, line: 6 });
  assert.equal(s1.character, 'SOLOMON');
  assert.equal(s1.decision?.on, 'point');
  assert.equal(s1.passage?.at, 6);
  assert.throws(() => step(w, passages, { point: 1, line: 1 }), /not on line 6/);
  // walking by K alone, the walk closes into a loop (K's period is 8) and may never reach some lines:
  // from here, 0x4242 on line 6, it reaches six; across every seed and start, about a third reach all seven
  const seen = new Set<number>([w.line]), at = new Map<string, number>();
  let loop = 0;
  for (let i = 0; i < 64; i++) { const k = `${w.line},${w.state}`; if (at.has(k)) { loop = i - at.get(k)!; break; } at.set(k, i); seen.add(step(w, passages).line); }
  assert.equal(loop % 8, 0, `the walk by K closes in a multiple of 8 steps (${loop})`);
  assert.equal(seen.size, 6, 'and reaches six lines of seven: the seventh takes a choice from outside');
});

test('The trace: tag characters XOR into the control and lowercase columns; an intact set of 16 traces to zero; a changed margin shows at its pairs', async () => {
  const { readFileSync } = await import('node:fs');
  const { pairsOfTag, newTrace, traceFile, marked, orderOf, columnOf, TAG_CHARS } = await import('../../space/src/trace.ts');
  const { writeBorder, readBorder } = await import('../../space/src/border.ts');
  const tagChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.match(TAG_CHARS)!.map((c) => c.charCodeAt(0));
  const letters = tagChars.slice(0, 26), digits = tagChars.slice(26);
  const cols = (as: number[], bs: number[], f: (x: number) => number) => [...new Set(as.flatMap((a) => bs.map((b) => columnOf(f(a ^ b)))))];
  assert.deepEqual(cols(letters, letters, (x) => x), [0], 'letter XOR letter: the control codes');
  assert.deepEqual(cols(digits, digits, (x) => x), [0], 'digit XOR digit: the control codes');
  assert.deepEqual(cols(letters, digits, (x) => x), [3], 'letter XOR digit: the lowercase column');
  assert.deepEqual(cols(letters, letters, (x) => 0x7f ^ x), [3], 'XNOR swaps: same kind to lowercase');
  assert.deepEqual(cols(letters, digits, (x) => 0x7f ^ x), [0], 'and mixed to the control codes');
  // the order of the indices under the replicated constant
  const orders: Record<number, number> = {};
  for (let i = 0; i < 65536; i++) orders[orderOf(i)] = (orders[orderOf(i)] ?? 0) + 1;
  assert.deepEqual(orders, { 1: 8, 2: 56, 4: 4032, 8: 61440 });
  const fixed = [...Array(65536).keys()].filter((i) => orderOf(i) === 1);
  assert.ok(fixed.every((i) => fixed.includes(((i & 0xff) << 8) | (i >> 8))), 'the 8 fixed indices come in byte-swapped pairs');
  // the trace of an agent's 16 files
  assert.deepEqual(pairsOfTag('METATRON'), [0x4d45, 0x5441, 0x5452, 0x4f4e], 'ME TA TR ON');
  const { characters } = JSON.parse(readFileSync(new URL('../../public/characters/trees.json', import.meta.url), 'utf8')) as { characters: { tag: string; set: string[] }[] };
  const files = (tag: string) => characters.find((c) => c.tag === tag)!.set.map((p) => readFileSync(new URL(`../../public/${p}`, import.meta.url), 'utf8'));
  const t = newTrace();
  for (const svg of files('METATRON')) traceFile(t, svg);
  assert.deepEqual(marked(t), [], 'an intact set of 16 traces to all zeros (0 ^ 1 ^ ... ^ 15 = 0)');
  // change one file's margin: place 5 rewritten as 6
  const changed = files('METATRON');
  changed[5] = writeBorder(changed[5]!, { name: 'METATRON', cues: [6] });
  const u = newTrace();
  for (const svg of changed) traceFile(u, svg);
  assert.deepEqual(marked(u), pairsOfTag('METATRON').sort((a, b) => a - b), 'the change shows at the agent\'s four pairs');
  assert.equal(u.xor[0x4d45], 5 ^ 6, 'and its size is the change: 5 XOR 6');
  assert.equal(readBorder(changed[5]!).cues[0], 6);
});

test('The score: the 7 points as voices and gains, the 7 lines as filters, the Hasse pair as the panner; a walk as automation; scrub; uppercase terms', async () => {
  const { NOTES, noteOf, lineFrequency, WIRES, scoreOf, scrubFrom, parseTerms, BEAT, HIGH, LOW } = await import('../../space/src/score.ts');
  assert.equal(noteOf(1), 440, 'point 1 is A 440');
  assert.deepEqual(NOTES.map((f) => Math.round(f)), [440, 494, 523, 587, 659, 698, 784], 'A B C D E F G');
  assert.equal(WIRES.length, 21, 'the 21 point-line incidences: each of 7 points into 3 lines');
  assert.ok(lineFrequency(1) > 440 && lineFrequency(1) < 784);
  const steps = [{ point: 2, line: 6, state: 'read' as const }, { point: 6, line: 3, state: 'write' as const }];
  const score = scoreOf(steps);
  assert.equal(score.length, 2 * 15, 'per step: 7 point gains, 7 line gains, the pan');
  assert.deepEqual(score.filter((e) => e.value === HIGH).map((e) => `${e.at}:${e.node}`), ['0:P2', '0:L6', `${BEAT}:P6`, `${BEAT}:L3`]);
  assert.deepEqual(score.filter((e) => e.param === 'pan').map((e) => e.value), [-1, 1], 'read left, write right');
  assert.ok(score.filter((e) => e.param === 'gain' && e.value !== HIGH).every((e) => e.value === LOW));
  // a scrub from the middle carries each node's last value in at time 0
  const s = scrubFrom(score, 0.25);
  assert.equal(s.filter((e) => e.at === 0).length, 15, 'every node starts where it stood');
  assert.deepEqual(s.find((e) => e.node === 'HASSE' && e.at === 0)?.value, -1);
  assert.deepEqual(s.filter((e) => e.at > 0).map((e) => e.at), Array(15).fill(BEAT - 0.25));
  // uppercase terms
  assert.deepEqual(parseTerms('METATRON P2 L6'), { agent: 'METATRON', point: 2, line: 6 });
  assert.deepEqual(parseTerms('metatron P2'), { error: 'every term is an /A-Z0-9/ tag: uppercase letters and digits, 1 to 8' });
  assert.deepEqual(parseTerms('NOBODY'), { error: 'no agent NOBODY' });
  assert.deepEqual(parseTerms('SOLON P1 L3'), { error: 'P1 is not on L3' });
});

const chrome = (await import('node:child_process')).spawnSync('google-chrome', ['--version']).status === 0;
test('The sound, in a browser: the graph renders offline; read is left, write right; each step sounds its point; re-renders agree to one part in a million', { skip: !chrome && 'google-chrome not installed', timeout: 120000 }, async () => {
  const { spawnSync } = await import('node:child_process');
  const r = spawnSync(process.execPath, [new URL('../../scripts/sound-check.mjs', import.meta.url).pathname], { encoding: 'utf8', timeout: 110000 });
  const result = JSON.parse(r.stdout.trim().split('\n').at(-1)!);
  assert.equal(result.ok, true, r.stdout);
  assert.equal(result.storedReplayExact, true, 'a stored render replays exactly');
  assert.ok(result.maxDiff < 1e-5, 'two renders of one score agree closely');
  assert.deepEqual(result.rows.map((x: { side: string; loudest: number }) => [x.side, x.loudest]), [['left', 2], ['right', 6], ['left', 3], ['right', 5]]);
});

test('The reset at the Catch-22 index: frame 42 (60 XOR 22) restores the literal through the Proxy, putting back the 42 bytes frames 0-41 wrote', async () => {
  const { newState, frameGate, written, CATCH22, READ } = await import('../../space/src/exchange.ts');
  assert.equal(60 ^ CATCH22, 42, 'the Catch-22 index comes at frame 42');
  const state = newState();
  const gate = frameGate(state);
  for (let f = 0; f < 42; f++) gate.frame = f;
  assert.equal(written(state), 42, 'frames 0-41 wrote 42 bytes');
  gate.frame = 42;
  assert.deepEqual(gate.last, { ok: true, value: { index: 22, restored: 42 } }, 'at index 22 the trap restores, and counts 42');
  assert.equal(written(state), 0, 'the state is its literal again');
  assert.ok(state.every((b) => b === READ));
  gate.frame = 43;
  assert.equal(written(state), 1, 'and the exchange goes on from frame 43');
  gate.frame = 128 + 42;
  assert.equal(gate.last?.ok && 'restored' in gate.last.value ? gate.last.value.restored : -1, 1, 'in the XNOR half the reset comes again at frame 170, putting back what changed');
});

test('CATCH 22, with the space: a command pair, the verb and the reset\'s index; the gate takes it through the Proxy', async () => {
  const { parseTerms } = await import('../../space/src/score.ts');
  const { newState, frameGate, written } = await import('../../space/src/exchange.ts');
  const { TAG } = await import('../../rosetta/src/agent.ts');
  assert.ok(!TAG.test('CATCH 22') && TAG.test('CATCH') && TAG.test('22'), 'not one tag, but two');
  assert.deepEqual(parseTerms('CATCH 22'), { catch: 22 });
  assert.deepEqual(parseTerms('CATCH 128'), { error: 'CATCH takes one index, 0 to 127: CATCH 22' });
  const state = newState(), gate = frameGate(state);
  gate.catchAt = 60;
  assert.equal(gate.catchAt, 60);
  gate.frame = 0;
  assert.deepEqual(gate.last, { ok: true, value: { index: 60, restored: 0 } }, 'CATCH 60: the reset fires at frame 0 (60 XOR 0), with nothing to put back yet');
  gate.frame = 1;
  assert.equal(written(state), 1);
  assert.throws(() => { gate.catchAt = 200; }, TypeError, 'an index outside the 128 bytes is refused');
});

test('The witness draws the story\'s (cyclic) plane: every line is three collinear points, except the one drawn as the circle', async () => {
  globalThis.AudioContext ??= class {} as never; // witness.ts imports sound.ts, which only builds graphs when asked
  const { P, CIRCLE, CENTRE } = await import('../../space/src/witness.ts');
  const { LINES } = await import('../../space/src/story.ts');
  const area = (a: number[], b: number[], c: number[]) => Math.abs((b[0]! - a[0]!) * (c[1]! - a[1]!) - (c[0]! - a[0]!) * (b[1]! - a[1]!));
  const circles = LINES.filter((l) => area(P[l[0]!]!, P[l[1]!]!, P[l[2]!]!) > 1e-9);
  assert.deepEqual(circles.map((l) => [...l].sort().join()), [CIRCLE], 'six lines straight, one the circle');
  const [cx, cy] = P[CENTRE]!;
  const r = CIRCLE.split(',').map((p) => Math.hypot(P[Number(p)]![0] - cx, P[Number(p)]![1] - cy));
  assert.ok(Math.abs(r[0]! - r[1]!) < 0.02 && Math.abs(r[0]! - r[2]!) < 0.02, 'the circle\'s three points are about equally far from the centre');
});

test('An agent by its tag: //metatron.localhost/P2/L6 (the host folds to lowercase, the tag XOR 0x20) or /METATRON/P2/L6', async () => {
  const { tagRoute } = await import('../../rosetta/src/agent.ts');
  assert.equal(new URL('http://METATRON/').host, 'metatron', 'a host folds to lowercase');
  assert.equal([...'METATRON'].map((c) => String.fromCharCode(c.charCodeAt(0) ^ 0x20)).join(''), 'metatron', 'which is the tag XOR 0x20, letter by letter');
  assert.deepEqual(tagRoute('metatron.localhost:8743', '/P2/L6'), { agent: 'METATRON', terms: ['P2', 'L6'], via: 'host', text: 'METATRON P2 L6' });
  assert.deepEqual(tagRoute('127.0.0.1:8743', '/METATRON/P2/L6'), { agent: 'METATRON', terms: ['P2', 'L6'], via: 'path', text: 'METATRON P2 L6' });
  assert.deepEqual(tagRoute('localhost:8743', '/CATCH/22'), { agent: 'CATCH', terms: ['22'], via: 'path', text: 'CATCH 22' }, 'the command pair as a path');
  assert.equal(tagRoute('localhost:8743', '/metatron'), null, 'a path keeps its case: lowercase is not a tag');
  assert.equal(tagRoute('localhost:8743', '/events'), null);
  assert.equal(tagRoute('toolongname9.localhost', '/'), null, 'a host label of more than 8 is no tag');
});

test('The bridge answers an agent by its tag, and a POST says its terms', { timeout: 30000 }, async () => {
  const { spawn } = await import('node:child_process');
  const port = 8791;
  const bridge = spawn(process.execPath, [new URL('../../repl/src/agent-bridge.ts', import.meta.url).pathname], { env: { ...process.env, AGENT_BRIDGE_PORT: String(port), AGENT_BRIDGE_STAY: '1', AGENT_NAME: 'hub' }, stdio: ['pipe', 'ignore', 'ignore'] });
  try {
    for (let i = 0; i < 40; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/health`)).ok) break; } catch {} await new Promise((r) => setTimeout(r, 150)); }
    const said = await (await fetch(`http://127.0.0.1:${port}/METATRON/P2/L6`, { method: 'POST' })).json();
    assert.equal(said.text, 'METATRON P2 L6');
    const { request } = await import('node:http');
    const viaHost = await new Promise<{ agent: string; via: string }>((ok, fail) => request({ host: '127.0.0.1', port, path: '/P2/L6', headers: { host: `metatron.localhost:${port}` } }, (res) => { let b = ''; res.on('data', (d) => (b += d)).on('end', () => ok(JSON.parse(b))); }).on('error', fail).end());
    assert.ok(viaHost.agent === 'METATRON' || (viaHost as { refused?: string }).refused === 'Misdirected Request', 'on the bridge\'s own port, METATRON by Host is answered only if the parities match');
    assert.equal((await fetch(`http://127.0.0.1:${port}/nothing`)).status, 404);
    // the port as the 4-bit parity header: METATRON by Host on its own port, and refused on another
    const { portFor, portParity, tagParity } = await import('../../rosetta/src/agent.ts');
    const own = portFor('METATRON', port), wrong = (port & ~0xf) | ((own & 0xf) ^ 1);
    assert.equal(portParity(own), tagParity('METATRON'));
    const viaPort = (p: number) => new Promise<{ status: number; body: { agent?: string; refused?: string; use?: number } }>((ok, fail) => request({ host: '127.0.0.1', port: p, path: '/P2/L6', headers: { host: `metatron.localhost:${p}` } }, (res) => { let b = ''; res.on('data', (d) => (b += d)).on('end', () => ok({ status: res.statusCode!, body: JSON.parse(b) })); }).on('error', fail).end());
    const right = await viaPort(own);
    assert.equal(right.status, 200, `METATRON on ${own}, parity ${tagParity('METATRON')}`);
    const miss = await viaPort(wrong);
    assert.equal(miss.status, 421, 'on a port of another parity: Misdirected Request');
    assert.equal(miss.body.use, own, 'and the refusal names the right port');
  } finally { bridge.kill(); }
});

test('The port as the 4-bit parity: a block of 16 ports holds each parity once; the hub\'s 8743 is parity 5; METATRON 8745, SOLOMON 8740', async () => {
  const { portParity, tagParity, portFor, nibbleParity } = await import('../../rosetta/src/agent.ts');
  assert.equal(8743, 0x2227);
  assert.equal(portParity(8743), 2 ^ 2 ^ 2 ^ 7, 'the hub: 5');
  assert.deepEqual([...Array(16).keys()].map((i) => portParity(0x2220 + i)).sort((a, b) => a - b), [...Array(16).keys()], 'in 0x2220-0x222F every parity once');
  assert.deepEqual(['METATRON', 'SOLOMON', 'SOLON', 'ASABIYAH', 'ENOCH', 'SPEAKER', 'GENESIS', 'OBSERVER', 'CATCH'].map(tagParity), [11, 6, 4, 8, 11, 14, 4, 8, 8]);
  assert.equal(portFor('METATRON', 8743), 8745);
  assert.equal(portFor('SOLOMON', 8743), 8740);
  assert.equal(nibbleParity([0x4d, 0x45]), 4 ^ 0xd ^ 4 ^ 5, 'M E: the nibbles XORed');
});

test('The colour agents\' natural language: Unicode glyphs inherited like hues, and homographs where the letters name a letter', async () => {
  const { readFileSync } = await import('node:fs');
  const { colors } = JSON.parse(readFileSync(new URL('../../public/polytron/colors.json', import.meta.url), 'utf8')) as { colors: { word: string; glyph?: string; glyphName?: string; glyphFrom?: string; homographs?: string[] }[] };
  const by = (w: string) => colors.find((c) => c.word === w)!;
  assert.equal(by('red').glyph, '\u{1F7E5}');
  assert.equal(by('red').glyphName, 'LARGE RED SQUARE');
  assert.deepEqual([by('scarlet').glyph, by('scarlet').glyphFrom], ['\u{1F7E5}', 'red'], 'scarlet takes red\'s');
  assert.equal(by('tan').glyphFrom, 'brown');
  assert.ok(by('tan').homographs!.includes('GEORGIAN CAPITAL LETTER TAN'), 'the letters TAN also name a Georgian letter');
  assert.ok(by('black').glyphName === 'BLACK LARGE SQUARE');
  assert.equal(by('entity').glyph, undefined, 'the route above color has none');
});

test('The tag functor: XOR 0x20 toggles case and back; Uppercase<S> makes any word a type literal, or never', async () => {
  const { toggle, toTag } = await import('../../rosetta/src/tag-type.ts');
  assert.equal(toggle('Metatron'), 'mETATRON');
  assert.equal(toggle(toggle('Metatron 22')), 'Metatron 22', 'twice gives the word back');
  assert.equal(toTag('metatron'), 'METATRON');
  assert.equal(toTag('procedural'), null, 'ten letters: not a tag');
  assert.equal(toTag('catch 22'), null, 'the space: not one tag');
  const { deprecate, isDeprecated } = await import('../../rosetta/src/tag-type.ts');
  assert.equal(deprecate('METATRON'), 'metatron', 'upper to lower: deprecated');
  assert.equal(toTag(deprecate('METATRON')!), 'METATRON', 'and lower to upper generates it again');
  assert.equal(isDeprecated('metatron'), true);
  assert.equal(isDeprecated('22'), false, 'digits have no case: a number cannot be deprecated');
  assert.equal(deprecate('22'), '22');
  assert.equal(new URL('http://METATRON/').host, deprecate('METATRON'), 'a host holds a tag deprecated');
  // the triple: lowercase the subject, uppercase the object, and between them the space
  const s = 'metatron', o = toTag(s)!;
  const p = [...s].map((c, i) => c.charCodeAt(0) ^ o.charCodeAt(i));
  assert.deepEqual(p, Array(8).fill(0x20), 'subject XOR object: a space in every letter, the predicate');
  assert.ok([...s].every((c, i) => (c.charCodeAt(0) ^ p[i]! ^ o.charCodeAt(i)) === 0), 'S ^ P ^ O = 0');
  // and at compile time: tsc checks src/testbed/tag-type.check.ts
  const { spawnSync } = await import('node:child_process');
  const r = spawnSync('npx', ['--no-install', 'tsc', '--ignoreConfig', '--noEmit', '--strict', '--target', 'es2022', '--module', 'nodenext', '--allowImportingTsExtensions', new URL('./tag-type.check.ts', import.meta.url).pathname], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('CanvasL: a Markdown document as a tree (front matter, headings, fenced blocks with evidence, as OMI.Markdown), written as CanvasL and read back', async () => {
  const { markdownTree, toCanvasL, parseCanvasL, toJsonCanvas, verifyEvidence, checksumOf } = await import('../../rosetta/src/canvasl.ts');
  const md = ['---', 'title: Light Garden', 'tag: OBSERVER', '---', '# The Garden', 'text', '## Metatron the observer', '```omi fs=1 gs=2', '(point 1)', '```', '## Solon and law', '```decision-table', '| a | b |', '```', '# Coda', '```js', 'x', '```'].join('\n');
  const tree = markdownTree(md);
  assert.deepEqual(tree.directives, { version: '1.0', schema: 'jsoncanvas-1.0+canvasl-min', title: 'Light Garden', tag: 'OBSERVER' }, 'the front matter as directives');
  const kinds = tree.nodes.map((n) => (n.kind === 'heading' ? `h${n.level}` : n.block));
  assert.deepEqual(kinds, ['front-matter', 'h1', 'h2', 'omi-lisp', 'h2', 'decision-table', 'h1', 'evidence']);
  const heading = tree.nodes.find((n) => n.kind === 'heading' && n.level === 2)!;
  assert.deepEqual(heading.kind === 'heading' && heading.tags, ['METATRON', 'THE', 'OBSERVER'], 'the heading\'s words promoted to tags');
  const omi = tree.nodes.find((n) => n.kind === 'block' && n.block === 'omi-lisp')!;
  assert.deepEqual(omi.kind === 'block' && omi.scope, { fs: '1', gs: '2' }, 'the fence line\'s scope');
  assert.equal(omi.kind === 'block' && omi.body, '(point 1)');
  for (const n of tree.nodes) assert.ok(verifyEvidence(md, n.evidence), `${n.id}: its span checks`);
  assert.equal(checksumOf([...'(point 1)']), [...'(point 1)'].reduce((s, c) => s + c.charCodeAt(0), 0) % 256, 'the sum of the characters mod 256, as Haskell');
  // the tree: each heading the parent of what follows, until a heading at its level or above
  const parentOf = (id: string) => tree.edges.find((e) => e.toNode === id)?.fromNode;
  const [h1, h2a, , h2b, , coda, js] = tree.nodes.slice(1).map((n) => n.id);
  assert.equal(parentOf(h2a!), h1);
  assert.equal(parentOf(h2b!), h1, 'the second h2 is the first h1\'s, not the first h2\'s');
  assert.equal(parentOf(coda!), undefined, 'a new h1 starts a new tree');
  assert.equal(parentOf(js!), coda);
  // CanvasL out and back, and its JSON Canvas projection
  const src = toCanvasL(tree);
  assert.ok(src.startsWith('@version: "1.0"\n@schema: "jsoncanvas-1.0+canvasl-min"'));
  const back = parseCanvasL(src);
  assert.equal(back.directives.title, 'Light Garden');
  assert.equal(back.items.filter((x) => x.kind === 'edge').length, tree.edges.length);
  const canvas = toJsonCanvas(src);
  assert.equal(canvas.nodes.length, 8);
  assert.ok(canvas.edges.every((e) => canvas.nodes.some((n) => n.id === e.fromNode) && canvas.nodes.some((n) => n.id === e.toNode)), 'every edge joins two nodes');
  // a changed character is caught by its span
  const changed = md.replace('(point 1)', '(point 2)');
  assert.equal(verifyEvidence(changed, omi.evidence), false);
});

test('A folder as a lattice that meta-log-db reads: tree edges vertical (v:child), shared tags horizontal (h:tag)', async () => {
  const { markdownTree, toCanvasL, toJsonCanvas, latticeOf } = await import('../../rosetta/src/canvasl.ts');
  const a = markdownTree('# Metatron\n## Law of the garden\n'), b = markdownTree('# Solon\n## Law\n### Metatron again\n'), c = markdownTree('# Elsewhere\n');
  // meta-log-db's extractFacts (src/jsonl/parser.ts), its rule for edges: v: vertical, h: horizontal
  const facts = (canvas: { edges: { id: string; type?: string; fromNode: string; toNode: string }[] }) => canvas.edges.map((e) => (e.type?.startsWith('v:') ? 'vertical' : e.type?.startsWith('h:') ? 'horizontal' : 'edge'));
  assert.deepEqual(facts(toJsonCanvas(toCanvasL(b))), ['vertical', 'vertical'], 'a tree\'s edges are vertical facts');
  const lattice = toJsonCanvas(latticeOf([{ name: 'a', tree: a }, { name: 'b', tree: b }, { name: 'c', tree: c }]));
  assert.deepEqual(lattice.nodes.filter((n) => String(n.id).startsWith('tag:')).map((n) => n.id).sort(), ['tag:LAW', 'tag:METATRON'], 'the joins: tags two documents share');
  assert.ok(facts(lattice).every((f) => f === 'horizontal'), 'the lattice\'s edges are horizontal facts');
  assert.equal(lattice.edges.length, 4, 'a and b each join LAW and METATRON; c joins nothing');
});
