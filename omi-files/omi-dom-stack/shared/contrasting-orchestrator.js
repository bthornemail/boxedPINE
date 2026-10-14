/**
 * Contrasting orchestrator
 * GNN digest ⊕ target → entrain filter → converge when diff === 0 (0x0000)
 */
'use strict';

const { runGNN } = require('./spatial-gnn');
const { buildAdjacency, cycleEdges } = require('./edge-ngram');

function orchestrator(adj, features, regexFilter, target, epochs = 4) {
  const { digest } = runGNN(adj, features, regexFilter, epochs);
  const diff = (digest ^ (target >>> 0)) >>> 0;
  const newFilter = (n) => regexFilter(n) && (((n ^ diff) & 1) === 0);
  return { diff, newFilter, digest: digest >>> 0, target: target >>> 0 };
}

function isFixed(state) {
  return state.diff === 0;
}

/**
 * Iterate until fixed or maxSteps.
 */
function converge(adj, features, regexFilter, target, opts = {}) {
  const maxSteps = opts.maxSteps || 16;
  const epochs = opts.epochs || 2;
  let filter = regexFilter;
  let last = null;
  const history = [];
  for (let i = 0; i < maxSteps; i++) {
    last = orchestrator(adj, features, filter, target, epochs);
    history.push(last.diff);
    if (isFixed(last)) break;
    filter = last.newFilter;
  }
  return { final: last, steps: history.length, history, fixed: isFixed(last) };
}

function selfTest() {
  const results = [];
  const assert = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail: detail || '' });
  };

  const adj = buildAdjacency(4, cycleEdges(4));
  const features = new Map([[0, 1], [1, 2], [2, 4], [3, 8]]);
  const always = () => true;

  const one = orchestrator(adj, features, always, 0, 2);
  assert('has diff', typeof one.diff === 'number');
  assert('has digest', typeof one.digest === 'number');

  // Target = current digest → immediate fixed point
  const aligned = orchestrator(adj, features, always, one.digest, 2);
  assert('aligned fixed', isFixed(aligned), String(aligned.diff));

  const conv = converge(adj, features, always, one.digest, { maxSteps: 4 });
  assert('converge fixed', conv.fixed === true);

  const failed = results.filter(r => !r.pass);
  return { passed: failed.length === 0, total: results.length, failed: failed.length, results };
}

module.exports = {
  orchestrator,
  isFixed,
  converge,
  selfTest
};
