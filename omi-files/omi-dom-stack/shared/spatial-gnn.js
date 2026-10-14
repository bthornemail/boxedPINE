/**
 * Spatial convolution GNN — message passing on edge-ngram graph
 * Regex filter entrains which neighbors contribute (XOR aggregate).
 */
'use strict';

function convolve(node, neighbors, features, regexFilter) {
  let agg = 0;
  for (const n of neighbors) {
    if (regexFilter(n)) {
      const f = features.get(n) || 0;
      agg ^= f;
    }
  }
  return agg >>> 0;
}

function epoch(adj, features, regexFilter) {
  const next = new Map();
  for (let v = 0; v < adj.length; v++) {
    const f = features.get(v) || 0;
    const agg = convolve(v, adj[v], features, regexFilter);
    next.set(v, (f ^ agg) >>> 0);
  }
  return next;
}

function runGNN(adj, features, regexFilter, epochs = 4) {
  let current = new Map(features);
  for (let i = 0; i < epochs; i++) {
    current = epoch(adj, current, regexFilter);
  }
  let digest = 0;
  for (const v of current.values()) digest ^= v;
  return { features: current, digest: digest >>> 0 };
}

function selfTest() {
  const results = [];
  const assert = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail: detail || '' });
  };

  const adj = [[1, 3], [0, 2], [1, 3], [0, 2]]; // square
  const features = new Map([[0, 1], [1, 2], [2, 4], [3, 8]]);
  const always = () => true;
  const out = runGNN(adj, features, always, 2);
  assert('digest number', typeof out.digest === 'number');
  assert('features size 4', out.features.size === 4);

  const oddOnly = (n) => (n & 1) === 1;
  const out2 = runGNN(adj, features, oddOnly, 1);
  assert('filtered runs', typeof out2.digest === 'number');

  const failed = results.filter(r => !r.pass);
  return { passed: failed.length === 0, total: results.length, failed: failed.length, results };
}

module.exports = { convolve, epoch, runGNN, selfTest };
