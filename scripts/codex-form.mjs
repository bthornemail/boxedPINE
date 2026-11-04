// CODEX's form, written: the glTF model space/src/codex-form.ts generates from the tag's code points.
//   node scripts/codex-form.mjs  ->  public/avatars/CODEX.gltf
import { writeFileSync, mkdirSync } from 'node:fs';
import { formOf, readForm } from '../space/src/codex-form.ts';
import { TAG } from '../space/src/codex.ts';

const out = new URL('../public/avatars/', import.meta.url);
mkdirSync(out, { recursive: true });
const text = formOf(TAG);
if (readForm(text) !== TAG) throw new Error('the form does not read back to its tag');
writeFileSync(new URL(`${TAG}.gltf`, out), text);
console.log(`codex-form: ${TAG}.gltf, ${text.length} bytes, reads back to ${readForm(text)}`);
