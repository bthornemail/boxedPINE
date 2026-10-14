/**
 * Witness transmission + verification (in-process store; API routes wrap this)
 */
'use strict';

const { agree } = require('./codex-agreement');

const witnesses = new Map();

function submit(witness) {
  if (!witness || !witness.instance_id || !witness.input_hash) {
    throw new TypeError('witness requires instance_id and input_hash');
  }
  const id = witness.instance_id + ':' + witness.input_hash;
  witnesses.set(id, witness);
  return id;
}

function retrieve(id) {
  return witnesses.get(id) || null;
}

function compare(idA, idB) {
  const a = witnesses.get(idA);
  const b = witnesses.get(idB);
  if (!a || !b) return { error: 'witness not found', agreed: false };
  return agree(a, b);
}

function clear() {
  witnesses.clear();
}

function size() {
  return witnesses.size;
}

function selfTest() {
  const results = [];
  const assert = (name, cond) => results.push({ name, pass: !!cond });
  clear();
  const w = {
    instance_id: 't1', input_hash: 'abc', codex_version: '2.0.0',
    triple_index: 1, ngram_hash: 2, gnn_digest: 3, orch_diff: 0,
    fixed: true, centroid: '0x0000'
  };
  const id = submit(w);
  assert('submit id', id === 't1:abc');
  assert('retrieve', retrieve(id).triple_index === 1);
  const id2 = submit({ ...w, instance_id: 't2' });
  assert('compare agreed', compare(id, id2).agreed === true);
  clear();
  assert('cleared', size() === 0);
  const failed = results.filter(r => !r.pass);
  return { passed: failed.length === 0, total: results.length, failed: failed.length, results };
}

module.exports = { submit, retrieve, compare, clear, size, selfTest };
