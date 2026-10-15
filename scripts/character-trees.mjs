// Each character's own SVG tree: 16 of them, 14 Fano planes and 2 Hasse diagrams.
//
// The author, 2026-10-13: "give each one their own set of 16; it's the first
// SVG tree"; "its 16 of them, 14 Fano planes and 2 Hasse diagrams"; "2 Hasse
// diagrams, the XOR and the XNOR, for read and write state". For each of Light
// Garden's characters (space/src/border.ts), the generator in tree-set.mjs
// stamps the shared 16-SVG set with the character's tag and place.
//   node scripts/character-trees.mjs  ->  public/characters/<TAG>/
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { CHARACTER_TAGS } from '../space/src/border.ts';
import { buildTreeSet, SET16 } from './tree-set.mjs';

const out = new URL('public/characters/', new URL('..', import.meta.url));
rmSync(out, { recursive: true, force: true });
const manifest = [];
for (const [point, tag] of Object.entries(CHARACTER_TAGS)) {
  const dir = new URL(`${tag}/`, out);
  mkdirSync(dir, { recursive: true });
  for (const { name, svg } of buildTreeSet(tag)) writeFileSync(new URL(`${name}.svg`, dir), svg);
  manifest.push({ point: Number(point), tag, set: SET16.map((n) => `characters/${tag}/${n}.svg`) });
}
writeFileSync(new URL('trees.json', out), JSON.stringify({ source: 'proofs/svg/fano (the 14 planes) + proofs/svg/hasse/pair-6.svg (XOR read, XNOR write), with each character\'s border (space/src/border.ts)', characters: manifest }, null, 1) + '\n');
console.log(`character-trees: ${manifest.length} characters x 16 (14 Fano planes, Hasse_XOR, Hasse_XNOR) in public/characters`);
