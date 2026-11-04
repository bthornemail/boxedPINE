// CODEX's form, written: the glTF model space/src/codex-form.ts generates from the tag's code points, and its set
// of 16 SVGs (the 14 Fano planes and the 2 Hasse diagrams, each margin carrying the tag and its place), the set
// each of Light Garden's characters carries (tree-set.mjs). The author, 2026-11-03: "if we encode Claude into the
// svg of the fano plane then the 14 and 2 hesse diagrams can hold a full projection in a holographic set".
//   node scripts/codex-form.mjs  ->  public/avatars/CODEX.gltf, public/avatars/CODEX/*.svg
import { writeFileSync, mkdirSync } from 'node:fs';
import { formOf, readForm } from '../space/src/codex-form.ts';
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
