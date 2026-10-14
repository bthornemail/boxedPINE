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
