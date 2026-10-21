// narrative-verify.mjs — run the narrative canon's verify spine cold.
// The Scribe's record (timeline.ndjson), the Observer's map (scene.patch.json) and the
// save template each have their sha256 recorded in narrative.verify.json. This recomputes
// those hashes and confirms the canon still replays to the same bytes — the trace is intact.
//   node scripts/narrative-verify.mjs [artifactsDir]
// default artifactsDir: public/narrative/canon (the shipped canon the gate serves)
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const repo = new URL('..', import.meta.url);
const dir = process.argv[2]
  ? new URL(process.argv[2].replace(/\/?$/, '/'), `file://${process.cwd()}/`)
  : new URL('public/narrative/canon/', repo);

const v = JSON.parse(readFileSync(new URL('narrative.verify.json', dir), 'utf8'));
const sha = (p) => 'sha256:' + createHash('sha256').update(readFileSync(new URL(p, dir))).digest('hex');

const checks = [];
if (v.inputs?.check) checks.push({ role: 'input/check', ...v.inputs.check });
for (const f of v.outputs?.files || []) checks.push({ role: 'output', ...f });

let pass = true;
console.log('narrative verify — recomputing sha256 of the canon (run cold):\n');
for (const c of checks) {
  let got; try { got = sha(c.path); } catch { got = 'MISSING'; }
  const ok = got === c.sha256;
  if (!ok) pass = false;
  console.log(`  ${ok ? 'OK  ' : 'FAIL'}  ${c.role.padEnd(12)} ${c.path}`);
  if (!ok) console.log(`        recorded ${c.sha256}\n        got      ${got}`);
}
console.log(`\nverify.json claims pass=${v.pass}; recomputed -> ${pass ? 'MATCH — the trace is intact' : 'MISMATCH — a canon file changed since the hash was recorded'}`);
process.exit(pass ? 0 : 1);
