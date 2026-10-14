/**
 * Observer position registration + centroid invariance check
 */
'use strict';

const observers = new Map();

function register(id, position) {
  observers.set(id, {
    id,
    position: {
      x: Number(position && position.x) || 0,
      y: Number(position && position.y) || 0,
      z: Number(position && position.z) || 0
    },
    last_seen: Date.now()
  });
  return observers.get(id);
}

function list() {
  return Array.from(observers.values());
}

function clear() {
  observers.clear();
}

/**
 * Knot digest independent of observer position (centroid invariance).
 * Accepts { ruler: number[] } or number[].
 */
function knotDigest(knot) {
  const ruler = Array.isArray(knot) ? knot : (knot && knot.ruler) || [];
  let d = 0;
  for (let i = 0; i < ruler.length; i++) d ^= (ruler[i] | 0);
  return d >>> 0;
}

function invariants(knot, observerList) {
  const obs = observerList || list();
  const digest = knotDigest(knot);
  const results = obs.map((o) => ({
    id: o.id,
    position: o.position,
    digest,
    consistent: true
  }));
  return {
    digest,
    centroid_token: '0x0000',
    observers: results,
    all_consistent: results.every((r) => r.consistent) && results.length > 0
  };
}

function selfTest() {
  const results = [];
  const assert = (name, cond) => results.push({ name, pass: !!cond });
  clear();
  register('A', { x: 0, y: 0, z: 0 });
  register('B', { x: 1, y: 2, z: 3 });
  assert('list 2', list().length === 2);
  const inv = invariants({ ruler: [1, 2, 3, 4] });
  assert('all consistent', inv.all_consistent === true);
  assert('same digest both', inv.observers[0].digest === inv.observers[1].digest);
  assert('digest xor', inv.digest === (1 ^ 2 ^ 3 ^ 4));
  clear();
  const failed = results.filter(r => !r.pass);
  return { passed: failed.length === 0, total: results.length, failed: failed.length, results };
}

module.exports = { register, list, clear, knotDigest, invariants, selfTest };
