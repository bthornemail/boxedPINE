/**
 * Cross-instance agreement — witness construction & equality
 */
'use strict';

const crypto = require('crypto');

function hashInput(input) {
  return crypto.createHash('sha256')
    .update(JSON.stringify(input))
    .digest('hex');
}

function makeWitness(instanceId, input, result) {
  return Object.freeze({
    instance_id: String(instanceId),
    input_hash: hashInput(input),
    codex_version: '2.0.0',
    triple_index: result.triple && result.triple.index != null ? result.triple.index : -1,
    ngram_hash: result.ngram && result.ngram.hash != null ? result.ngram.hash : -1,
    gnn_digest: result.gnn && result.gnn.digest != null ? result.gnn.digest : -1,
    orch_diff: result.orch && result.orch.diff != null ? result.orch.diff : -1,
    fixed: result.fixed === true,
    centroid: (result.orch && result.orch.fixed) || result.fixed ? '0x0000' : 'non-fixed'
  });
}

function witnessEquals(a, b) {
  if (!a || !b) return false;
  const keys = [
    'input_hash', 'codex_version', 'triple_index',
    'ngram_hash', 'gnn_digest', 'orch_diff', 'fixed', 'centroid'
  ];
  for (const k of keys) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

function diffWitnesses(a, b) {
  const diff = {};
  if (!a || !b) return { error: 'missing witness' };
  for (const k of Object.keys(a)) {
    if (a[k] !== b[k]) diff[k] = { a: a[k], b: b[k] };
  }
  return diff;
}

function agree(witnessA, witnessB) {
  return {
    agreed: witnessEquals(witnessA, witnessB),
    witnessA,
    witnessB,
    diff: diffWitnesses(witnessA, witnessB)
  };
}

function selfTest() {
  const results = [];
  const assert = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail: detail || '' });
  };

  const input = { clientX: 1, clientY: 2 };
  const result = {
    triple: { index: 7 },
    ngram: { hash: 99 },
    gnn: { digest: 42 },
    orch: { diff: 0, fixed: true },
    fixed: true
  };
  const w1 = makeWitness('A', input, result);
  const w2 = makeWitness('B', input, result);
  assert('same input same hash', w1.input_hash === w2.input_hash);
  assert('equals across instances', witnessEquals(w1, w2));
  assert('agree.agreed', agree(w1, w2).agreed === true);
  assert('centroid 0x0000', w1.centroid === '0x0000');
  assert('version', w1.codex_version === '2.0.0');

  const w3 = makeWitness('C', input, { ...result, triple: { index: 8 }, fixed: true, orch: { diff: 0, fixed: true } });
  assert('diff detects mismatch', witnessEquals(w1, w3) === false);

  const failed = results.filter(r => !r.pass);
  return { passed: failed.length === 0, total: results.length, failed: failed.length, results };
}

module.exports = {
  hashInput,
  makeWitness,
  witnessEquals,
  agree,
  diffWitnesses,
  selfTest
};
