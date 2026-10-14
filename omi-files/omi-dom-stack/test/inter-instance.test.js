/**
 * Inter-instance · inter-observer · inter-worker · Byzantine suite
 */
'use strict';

const { runPatternPipeline } = require('../shared/pattern-pipeline');
const { makeWitness, witnessEquals, agree, selfTest: agreementSelf } = require('../shared/codex-agreement');
const { submit, compare, clear: clearWitnesses, selfTest: exchangeSelf } = require('../shared/witness-exchange');
const { register, list, invariants, clear: clearObs, selfTest: obsSelf } = require('../shared/observer-sync');
const { barrier, selfTest: barrierSelf } = require('../shared/worker-barrier');
const { checkQuorum, selfTest: byzSelf } = require('../shared/byzantine-check');

async function testInterInstance() {
  const results = [];
  const assert = (name, cond) => results.push({ name, pass: !!cond });

  const input = { clientX: 100.4, clientY: 50.6, pressure: 0.8 };
  const config = { snap: { mode: 'square', size: 16 }, mediaType: 'svg', converge: true };

  const resultA = runPatternPipeline(input, config);
  const resultB = runPatternPipeline(input, config);
  const witnessA = makeWitness('instance-A', input, resultA);
  const witnessB = makeWitness('instance-B', input, resultB);

  assert('cross-instance witness equal', witnessEquals(witnessA, witnessB));
  assert('both fixed', witnessA.fixed && witnessB.fixed);
  assert('centroid 0x0000', witnessA.centroid === '0x0000');

  clearWitnesses();
  const idA = submit(witnessA);
  const idB = submit(witnessB);
  const comparison = compare(idA, idB);
  assert('exchange agreed', comparison.agreed === true);

  return results;
}

async function testInterObserver() {
  const results = [];
  const assert = (name, cond) => results.push({ name, pass: !!cond });
  clearObs();
  register('observer-A', { x: 0, y: 0, z: 0 });
  register('observer-B', { x: 1, y: 2, z: 3 });
  const inv = invariants({ ruler: [65, 80, 53, 48, 97, 112, 0, 0] });
  assert('all consistent', inv.all_consistent);
  assert('digests match', inv.observers[0].digest === inv.observers[1].digest);
  assert('two observers', list().length === 2);
  return results;
}

async function testInterWorker() {
  const results = [];
  const assert = (name, cond) => results.push({ name, pass: !!cond });
  const slots = [0, 1, 2, 3];
  const { partials, digest } = await barrier(4, slots, (data) => data.slot * 7);
  const refDigest = slots.reduce((a, s) => a ^ (s * 7), 0);
  assert('digest match single-thread', digest === (refDigest >>> 0));
  assert('4 partials', partials.length === 4);
  return results;
}

async function testByzantine() {
  const results = [];
  const assert = (name, cond) => results.push({ name, pass: !!cond });
  const honest = {
    input_hash: 'a', codex_version: '2.0.0', triple_index: 42,
    ngram_hash: 1, gnn_digest: 2, orch_diff: 0, fixed: true, centroid: '0x0000'
  };
  const corrupt = { ...honest, triple_index: 43 };
  const r = checkQuorum([honest, honest, honest, corrupt], 0.667);
  assert('quorum holds', r.quorum === true);
  assert('majority 3', r.majority_count === 3);
  assert('rejects 1', r.rejected === 1);
  return results;
}

async function main() {
  const all = [];
  console.log('=== INTER-INSTANCE ===');
  all.push(...await testInterInstance());
  console.log('=== INTER-OBSERVER ===');
  all.push(...await testInterObserver());
  console.log('=== INTER-WORKER ===');
  all.push(...await testInterWorker());
  console.log('=== BYZANTINE ===');
  all.push(...await testByzantine());

  // Module self-tests
  for (const [name, fn] of [
    ['agreement', agreementSelf],
    ['exchange', exchangeSelf],
    ['observer', obsSelf],
    ['byzantine', byzSelf]
  ]) {
    const r = fn();
    all.push(...r.results.map((x) => ({ name: name + ':' + x.name, pass: x.pass })));
  }
  const br = await barrierSelf();
  all.push(...br.results.map((x) => ({ name: 'barrier:' + x.name, pass: x.pass })));

  const failed = all.filter((x) => !x.pass);
  for (const x of all) console.log((x.pass ? 'PASS' : 'FAIL') + '  ' + x.name);
  console.log('===', all.length - failed.length + '/' + all.length, 'passed ===');
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
