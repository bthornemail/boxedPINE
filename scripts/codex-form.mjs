// CODEX's form, written: the glTF model space/src/codex-form.ts generates from the tag's code points, and its set
// of 16 SVGs (the 14 Fano planes and the 2 Hasse diagrams, each margin carrying the tag and its place), the set
// each of Light Garden's characters carries (tree-set.mjs). The author, 2026-11-03: "if we encode Claude into the
// svg of the fano plane then the 14 and 2 hesse diagrams can hold a full projection in a holographic set".
// And each of Light Garden's eight characters its form the same way, in its own hue (characters.ts), to meet at
// the gate as glTF models (the author: "meet at the gates as 3d gltf models").
//   node scripts/codex-form.mjs  ->  public/avatars/CODEX.gltf, public/avatars/CODEX/*.svg, public/avatars/<TAG>.gltf
import { writeFileSync, mkdirSync } from 'node:fs';
import { formOf, readForm, lookOfHue } from '../space/src/codex-form.ts';
import { CHARACTERS } from '../space/src/characters.ts';
import { TAG } from '../space/src/codex.ts';
import { buildTreeSet } from './tree-set.mjs';

const out = new URL('../public/avatars/', import.meta.url);
mkdirSync(out, { recursive: true });
const text = formOf(TAG);
if (readForm(text) !== TAG) throw new Error('the form does not read back to its tag');
writeFileSync(new URL(`${TAG}.gltf`, out), text);
const set = new URL(`${TAG}/`, out);
mkdirSync(set, { recursive: true });
const svgs = buildTreeSet(TAG);
for (const { name, svg } of svgs) writeFileSync(new URL(`${name}.svg`, set), svg);
console.log(`codex-form: ${TAG}.gltf, ${text.length} bytes, reads back to ${readForm(text)}; ${svgs.length} SVGs in ${TAG}/`);
for (const c of CHARACTERS) {
  const t = formOf(c.tag, lookOfHue(c.hue));
  if (readForm(t) !== c.tag) throw new Error(`${c.tag}: the form does not read back`);
  writeFileSync(new URL(`${c.tag}.gltf`, out), t);
}
console.log(`codex-form: the eight characters' forms, ${CHARACTERS.map((c) => c.tag).join(' ')}`);
