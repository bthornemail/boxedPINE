/**
 * Edge n-grams from a solid's graph (spectral address)
 */
'use strict';

function buildAdjacency(vCount, edges) {
  const adj = Array.from({ length: vCount }, () => []);
  for (const [a, b] of edges) {
    if (a >= 0 && a < vCount && b >= 0 && b < vCount) {
      adj[a].push(b);
      adj[b].push(a);
    }
  }
  return adj;
}

/** Complete graph edges for a solid with v vertices (when explicit edge list unknown) */
function completeEdges(v) {
  const edges = [];
  for (let i = 0; i < v; i++) {
    for (let j = i + 1; j < v; j++) edges.push([i, j]);
  }
  return edges;
}

/** Cycle edges for regular polygon / simple skeleton */
function cycleEdges(v) {
  const edges = [];
  for (let i = 0; i < v; i++) edges.push([i, (i + 1) % v]);
  return edges;
}

function enumerateNgrams(adj, n, maxGrams = 5000) {
  const grams = [];
  function walk(path) {
    if (grams.length >= maxGrams) return;
    if (path.length === n + 1) {
      grams.push(path.slice());
      return;
    }
    const last = path[path.length - 1];
    for (const next of adj[last]) {
      path.push(next);
      walk(path);
      path.pop();
      if (grams.length >= maxGrams) return;
    }
  }
  for (let start = 0; start < adj.length && grams.length < maxGrams; start++) {
    walk([start]);
  }
  return grams;
}

function hashNgram(gram) {
  let h = 0;
  for (const v of gram) h = (Math.imul(h, 31) + (v | 0)) >>> 0;
  return h;
}

function spectralAddress(adj, n = 2) {
  const grams = enumerateNgrams(adj, n);
  const hashes = grams.map(hashNgram);
  let fold = 0;
  for (const h of hashes) fold ^= h;
  return { gramCount: grams.length, xorFold: fold >>> 0, sample: hashes.slice(0, 8) };
}

function selfTest() {
  const results = [];
  const assert = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail: detail || '' });
  };

  // square: 4-cycle
  const adj = buildAdjacency(4, cycleEdges(4));
  assert('adj degree 2', adj.every(n => n.length === 2));
  const grams = enumerateNgrams(adj, 2, 100);
  assert('ngrams > 0', grams.length > 0);
  assert('hash stable', hashNgram([0, 1, 2]) === hashNgram([0, 1, 2]));
  const addr = spectralAddress(adj, 2);
  assert('spectral fold number', typeof addr.xorFold === 'number');

  const failed = results.filter(r => !r.pass);
  return { passed: failed.length === 0, total: results.length, failed: failed.length, results };
}

module.exports = {
  buildAdjacency,
  completeEdges,
  cycleEdges,
  enumerateNgrams,
  hashNgram,
  spectralAddress,
  selfTest
};
