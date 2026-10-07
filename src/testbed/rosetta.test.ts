// Checks the grammar and the self-generating kernel in rosetta/src/grammar.
// Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RULES, makeGrammar, classifyAll } from '../../rosetta/src/grammar/grammar.ts';
import { makeKernel, regenerate, admissible, digest, readAsProgram } from '../../rosetta/src/grammar/kernel.ts';

test('The grammar holds all 29 Level 3 symbols from DeepSeek0', () => {
  const level3 = RULES.filter((r) => ['set', 'bracket', 'face', 'palindrome', 'higher'].includes(r.group));
  assert.equal(level3.length, 29);
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
