// Checks the grammar and the self-generating kernel in rosetta/src/grammar.
// Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { RULES, makeGrammar, classifyAll } from '../../rosetta/src/grammar/grammar.ts';
import { makeKernel, regenerate, admissible, digest, readAsProgram } from '../../rosetta/src/grammar/kernel.ts';
import { catalog, readCatalog, CATALOG } from '../../rosetta/src/grammar/catalog.ts';

test('The grammar holds the 29 Level 3 symbols from DeepSeek0, plus the EXCEPTION face', () => {
  const level3 = RULES.filter((r) => ['set', 'bracket', 'face', 'palindrome', 'higher'].includes(r.group));
  assert.equal(level3.length, 30);
  assert.ok(level3.some((r) => r.name === 'PALINDROME'));
});

test('LEFT and RIGHT differ, and so do DEFLECT and REFLECT', () => {
  const g = makeGrammar();
  assert.notEqual(String(g.get('LEFT')), String(g.get('RIGHT')));
  assert.notEqual(String(g.get('DEFLECT')), String(g.get('REFLECT')));
});

test('Radix wordforms accept only their own digits (HEX accepts 0xFF)', () => {
  const g = makeGrammar();
  assert.ok(g.get('HEX')!.test('0xFF'));
  assert.ok(g.get('BINARY')!.test('0b1011'));
  assert.ok(!g.get('BINARY')!.test('0b9'));
  assert.ok(!g.get('OCTAL')!.test('0o8'));
});

test('EXCHANGE matches instruction wordforms', () => {
  const g = makeGrammar();
  assert.ok(classifyAll('0p3x40n', g).includes('EXCHANGE'));
  assert.ok(classifyAll('0n7b60p', g).includes('EXCHANGE'));
  assert.ok(!classifyAll('0p3x4', g).includes('EXCHANGE'));
});

test('The handler admits grammar positions and refuses others', () => {
  const k = makeKernel();
  k.state['5p'] = 42;
  assert.equal(k.state['5p'], 42);
  assert.throws(() => { k.state['hello world'] = 1; }, TypeError);
});

test('A step is a compare-exchange: the miss reports the XOR difference', () => {
  const k = makeKernel();
  k.state['5p'] = 7;
  assert.equal(k.step('5p', 7, 9).matched, true);
  const miss = k.step('5p', 7, 9);
  assert.equal(miss.matched, false);
  assert.equal(miss.difference, 7 ^ 9);
});

test('A digest of zeros closes', () => {
  const k = makeKernel();
  for (const p of ['0p', '1p', '2p']) k.state[p] = 0;
  assert.deepEqual(digest(k.state, ['0p', '1p', '2p']), { fold: 0, closed: true });
});

test('Mixing Level 3 into position checks admits every word (why POSITION_RULES exists)', () => {
  assert.ok(admissible('42z', makeGrammar()));           // INCLUDE swallows it
  assert.ok(!admissible('42z', makeKernel().state.grammar!)); // positions only
});

test('learn adds a pattern, and the next access obeys it', () => {
  const k = makeKernel();
  assert.ok(!admissible('42z', k.state.grammar!));
  k.learn('ZED', '^(\\d+)z$');
  assert.equal(k.generation, 1);
  k.state['42z'] = 7;
  assert.equal(k.state['42z'], 7);
});

test('Kernels do not share a grammar unless one is passed in', () => {
  const a = makeKernel();
  const b = makeKernel();
  a.learn('ZED', '^(\\d+)z$');
  assert.ok(!admissible('42z', b.state.grammar!));
});

test('regenerate rebuilds the learned grammar from the description', () => {
  const k = makeKernel();
  k.learn('ZED', '^(\\d+)z$');
  const r = regenerate(k.describe());
  assert.equal(r.generation, 1);
  assert.ok(admissible('42z', r.state.grammar!));
});

test('Level 4 is not built yet, and says so', () => {
  assert.throws(() => readAsProgram('0p3x40n'), /Level 4 not built/);
});

test('commands.vtt has one cue per REPL command in src/define.commands.ts, in order', () => {
  const vtt = readFileSync(new URL('../../rosetta/src/assets/commands.vtt', import.meta.url), 'utf8');
  const repl = readFileSync(new URL('../../repl/src/define.commands.ts', import.meta.url), 'utf8');
  assert.ok(vtt.startsWith('WEBVTT'));
  const cueIds = [...vtt.matchAll(/^(\w+)\n\d\d:\d\d\.\d{3} --> /gm)].map((m) => m[1]);
  const commands = [...repl.matchAll(/defineCommand\('(\w+)'/g)].map((m) => m[1]);
  assert.deepEqual(cueIds, commands);
  for (const m of vtt.matchAll(/--> [^\n]+\n(\{[^\n]+\})/g)) JSON.parse(m[1]); // every payload is JSON
});

// The author's current draft literal /0?[boxd]?\d+[eE.]?\d[PIN]/ (wiki: SPEC-36 The Literal Separation).
const SPLIT = /^(0)?([boxd])?(\d+)([eE.])?(\d)([PIN])$/;

test('PINEBOXED reads frame, radix, value, e/E/. marker, one-digit scale and index axis', () => {
  const g = makeGrammar();
  for (const w of ['0x5e3P', '0d12E3I', '0b101.1N', '1e5N']) assert.ok(g.get('PINEBOXED')!.test(w), w);
  assert.deepEqual(SPLIT.exec('0b101.1N')!.slice(1), ['0', 'b', '101', '.', '1', 'N']);
});

test('PINEBOXED as drafted: 0P and 0x5P are not admitted, the scale is one digit, unmarked digits split', () => {
  const g = makeGrammar();
  for (const w of ['0P', '0x5P', '0x5e30P']) assert.ok(!g.get('PINEBOXED')!.test(w), w);
  assert.deepEqual(SPLIT.exec('0x55P')!.slice(1), ['0', 'x', '5', undefined, '5', 'P']);
});

test('At a fixed width, XNOR counts agreement: popcount(a XNOR b) = width - Hamming distance', () => {
  const pop = (n: bigint) => { let c = 0; while (n) { c += Number(n & 1n); n >>= 1n; } return c; };
  const width = 16n, mask = (1n << width) - 1n;
  for (const [a, b] of [[0x3cn, 0x7cn], [0x1234n, 0xabcdn], [0n, mask], [5n, 5n]] as const) {
    assert.equal(pop(~(a ^ b) & mask), Number(width) - pop(a ^ b));
  }
  assert.ok(~(5n ^ 3n) < 0n); // with no width, a BigInt XNOR is negative, not a count
});

test('The exponent and the exception differ by the case bit: e XOR E = 0x20', () => {
  assert.equal('e'.charCodeAt(0) ^ 'E'.charCodeAt(0), 0x20);
});

test('The catalog coordinate <base32?base36=base64> round-trips name and meter', () => {
  for (const [name, meter] of [['RFC-OMI-II', 0], ['PINEboxed', 60], ['omi', 65535], ['0x5e3P', 124]] as const) {
    const c = catalog(name, meter);
    assert.ok(CATALOG.test(c), c);
    assert.deepEqual(readCatalog(c), { name, meter, consistent: true });
  }
  assert.equal(catalog('RFC-OMI-II', 0), '<KJDEGLKPJVES2SKJ?0=UkZDLU9NSS1JSQ==>');
});

test('The catalog delimiters < = > ? are block 0 of the orbit of 60, and a mismatched coordinate is caught', () => {
  assert.deepEqual(['<', '=', '>', '?'].map((c) => c.charCodeAt(0)), [60, 61, 62, 63]);
  const forged = '<KJDEGLKPJVES2SKJ?0=b21p>'; // base32 says RFC-OMI-II, base64 says omi
  assert.equal(readCatalog(forged)!.consistent, false);
});

test('The four face cells CENTER, LEFT, RIGHT, EXCEPTION partition every printable x.y exactly', () => {
  const g = makeGrammar();
  const faces = ['CENTER', 'LEFT', 'RIGHT', 'EXCEPTION'];
  const cell = (t: string) => faces.filter((f) => g.get(f)!.test(t));
  assert.deepEqual(['3.5', '3.a', 'a.3', 'a.b'].map(cell), [['CENTER'], ['LEFT'], ['RIGHT'], ['EXCEPTION']]);
  let none = 0, multi = 0;
  for (let a = 32; a < 127; a++) for (let b = 32; b < 127; b++) {
    const n = cell(String.fromCharCode(a) + '.' + String.fromCharCode(b)).length;
    if (n === 0) none++; if (n > 1) multi++;
  }
  assert.equal(multi, 0);
  assert.equal(none, 0);
  assert.deepEqual(['+.5', '5.-', '-.+'].map(cell), [['CENTER'], ['CENTER'], ['CENTER']]);
});
