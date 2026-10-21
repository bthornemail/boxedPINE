// Checks the pure perfect-negotiation core in space/src/signal.ts. Run: npm test
import { test } from 'node:test';
import assert from 'node:assert';
import { politeByTag, onSignal, type NegState, type Signal } from '../../space/src/signal.ts';

const base = (over: Partial<NegState> = {}): NegState => ({ polite: false, makingOffer: false, stable: true, ignoring: false, ...over });
const offer: Signal = { kind: 'description', from: 'OTHER', description: { type: 'offer', sdp: 'o' } };
const answer: Signal = { kind: 'description', from: 'OTHER', description: { type: 'answer', sdp: 'a' } };
const cand: Signal = { kind: 'candidate', from: 'OTHER', candidate: 'c' };

test('politeness is decided from the tags, symmetric and total', () => {
  // both peers compute the same roles without coordination
  assert.equal(politeByTag('METATRON', 'SOLOMON'), true);
  assert.equal(politeByTag('SOLOMON', 'METATRON'), false);
  // exactly one of a pair is polite
  assert.notEqual(politeByTag('A', 'B'), politeByTag('B', 'A'));
  assert.throws(() => politeByTag('SOLON', 'SOLON')); // a peer cannot negotiate with itself
});

test('no collision: an offer is answered, an answer is accepted', () => {
  assert.deepEqual(onSignal(base(), offer).action, { do: 'answer' });
  assert.deepEqual(onSignal(base(), answer).action, { do: 'accept-answer' });
});

test('glare, impolite peer: the colliding offer is ignored', () => {
  const r = onSignal(base({ polite: false, makingOffer: true }), offer);
  assert.equal(r.action.do, 'ignore');
  assert.equal(r.state.ignoring, true); // and we remember we are ignoring it
});

test('glare, polite peer: roll back and accept the offer', () => {
  const r = onSignal(base({ polite: true, makingOffer: true }), offer);
  assert.equal(r.action.do, 'rollback-then-answer');
  assert.equal(r.state.ignoring, false);
});

test('a collision is also when we are not stable, not only mid-offer', () => {
  assert.equal(onSignal(base({ polite: false, stable: false }), offer).action.do, 'ignore');
  assert.equal(onSignal(base({ polite: true, stable: false }), offer).action.do, 'rollback-then-answer');
});

test('candidates: added normally, dropped while ignoring the colliding offer', () => {
  assert.deepEqual(onSignal(base(), cand).action, { do: 'add-candidate', candidate: 'c' });
  assert.equal(onSignal(base({ ignoring: true }), cand).action.do, 'drop-candidate');
});

test('accepting an answer returns to stable', () => {
  assert.equal(onSignal(base({ makingOffer: true, stable: false }), answer).state.stable, true);
});
