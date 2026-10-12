// Runs the I-series checks (I-108 … I-156, from the 2026-10-12 session), which now
// live in the proofs repo as proofs/js/catalog/I-*.ts: the roll-up I-122 first,
// then every module on its own. Each passes when its process exits 0.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';

const src = new URL('../../proofs/js/catalog/', import.meta.url).pathname;
const modules = readdirSync(src)
  .filter((f) => /^I-1\d\d[a-z]?\.ts$/.test(f))
  .sort((a, b) => (a === 'I-122.ts' ? -1 : b === 'I-122.ts' ? 1 : a.localeCompare(b)));

for (const file of modules) {
  test(`proofs/js/catalog/${file}`, () => {
    const r = spawnSync(process.execPath, [src + file], { encoding: 'utf8', timeout: 60000 });
    const tail = `${r.stdout}${r.stderr}`.trim().split('\n').slice(-6).join('\n');
    assert.equal(r.status, 0, tail);
  });
}

test('the I-series is all here (the roll-up and 38 modules)', () => assert.equal(modules.length, 39));

test('proofs/js: every subject-predicate-object triple holds and every must-reject fails', () => {
  const r = spawnSync(process.execPath, [new URL('../../proofs/js/spo/check.mjs', import.meta.url).pathname], { encoding: 'utf8', timeout: 60000 });
  assert.equal(r.status, 0, r.stdout.split('\n').filter((l) => l.startsWith('✗')).join('\n'));
  assert.match(r.stdout, /0 problems/);
});
