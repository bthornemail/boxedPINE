/**
 * Cross-worker barrier + XOR digest of partials
 */
'use strict';

const { Worker } = require('worker_threads');

/**
 * Run processFn on each slot in a worker; XOR-combine results.
 * processFn is serialized via toString() — keep it pure and closed.
 */
function barrier(workerCount, slots, processFn) {
  return new Promise((resolve, reject) => {
    const n = Math.max(1, workerCount | 0);
    const partials = new Array(n);
    let completed = 0;
    let settled = false;

    const finish = (err, value) => {
      if (settled) return;
      settled = true;
      if (err) reject(err);
      else resolve(value);
    };

    for (let i = 0; i < n; i++) {
      const worker = new Worker(
        `
        const { parentPort, workerData } = require('worker_threads');
        try {
          const fn = ${processFn.toString()};
          const result = fn(workerData);
          parentPort.postMessage({ index: workerData.index, result });
        } catch (e) {
          parentPort.postMessage({ index: workerData.index, error: String(e.message || e) });
        }
        `,
        {
          eval: true,
          workerData: { index: i, slot: slots[i % slots.length] }
        }
      );

      worker.on('message', (msg) => {
        if (msg.error) {
          finish(new Error(msg.error));
          return;
        }
        partials[msg.index] = msg.result;
        completed++;
        worker.terminate().catch(() => {});
        if (completed === n) {
          let digest = 0;
          for (let j = 0; j < n; j++) digest ^= (partials[j] | 0);
          finish(null, { partials, digest: digest >>> 0 });
        }
      });

      worker.on('error', (err) => finish(err));
    }
  });
}

async function selfTest() {
  const results = [];
  const assert = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail: detail || '' });
  };

  const slots = [0, 1, 2, 3];
  const { partials, digest } = await barrier(4, slots, (data) => data.slot * 7);
  const ref = slots.reduce((a, s) => a ^ (s * 7), 0);
  assert('partials length 4', partials.length === 4);
  assert('digest match', digest === (ref >>> 0), String(digest) + ' vs ' + ref);

  const failed = results.filter(r => !r.pass);
  return { passed: failed.length === 0, total: results.length, failed: failed.length, results };
}

module.exports = { barrier, selfTest };
