/**
 * Byzantine fault detection via witness quorum
 */
'use strict';

function signatureKey(w) {
  return JSON.stringify({
    input_hash: w.input_hash,
    codex_version: w.codex_version,
    triple_index: w.triple_index,
    ngram_hash: w.ngram_hash,
    gnn_digest: w.gnn_digest,
    orch_diff: w.orch_diff,
    fixed: w.fixed,
    centroid: w.centroid
  });
}

function checkQuorum(witnesses, threshold) {
  threshold = threshold != null ? threshold : 0.667;
  if (!witnesses || witnesses.length === 0) {
    return { quorum: false, majority_count: 0, total: 0, threshold };
  }

  const groups = new Map();
  for (const w of witnesses) {
    const key = signatureKey(w);
    groups.set(key, (groups.get(key) || 0) + 1);
  }

  let maxCount = 0;
  let majorityKey = null;
  for (const [key, count] of groups) {
    if (count > maxCount) {
      maxCount = count;
      majorityKey = key;
    }
  }

  const quorum = maxCount / witnesses.length >= threshold;
  return {
    quorum,
    majority_count: maxCount,
    total: witnesses.length,
    threshold,
    majority_key: majorityKey,
    rejected: witnesses.length - maxCount
  };
}

function selfTest() {
  const results = [];
  const assert = (name, cond) => results.push({ name, pass: !!cond });

  const honest = {
    input_hash: 'a', codex_version: '2.0.0', triple_index: 42,
    ngram_hash: 1, gnn_digest: 2, orch_diff: 0, fixed: true, centroid: '0x0000'
  };
  const corrupt = { ...honest, triple_index: 43 };
  const r = checkQuorum([honest, honest, honest, corrupt], 0.667);
  assert('quorum true', r.quorum === true);
  assert('majority 3', r.majority_count === 3);
  assert('rejected 1', r.rejected === 1);

  const split = checkQuorum([honest, corrupt], 0.667);
  assert('split no quorum', split.quorum === false);

  const failed = results.filter(x => !x.pass);
  return { passed: failed.length === 0, total: results.length, failed: failed.length, results };
}

module.exports = { checkQuorum, signatureKey, selfTest };
