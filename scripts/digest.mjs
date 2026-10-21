// digest.mjs — the definitive stateless digest of the Agent Commons.
//
// Each of the 8 named characters carries a set of 16 SVGs (14 Fano + 2 Hasse).
// Every SVG carries its OWN place (0-15) in its margin — the `data-cue` nibble:
// Hasse_XOR = place 0 (read), Hasse_XNOR = place 15 (write), points 1-7, lines
// 8-14 — and its tag in `data-name`. So the set is stateless: the SVGs ARE the
// state, no external store. The digest folds each set by XOR of its places; an
// intact set is the permutation {0..15}, which XORs to 0 (XNOR, the 15-
// complement, to 15). No hash is identity: the tag names the agent, the fold is
// the digest, and it can say no — a missing or re-placed file breaks the fold.
//
// The 144 colour/WordNet agents are not materialized as 144 x 16 SVGs. The 8
// characters refer to all of them through their 2 Hasse diagrams — read (place
// 0) and write (place 15) — collated by the `ls` / `ls -r` modem (forward =
// KNOWN/read, reverse = UNKOW/write; the author's `cat -An` + `rev` list).
//
// Exits nonzero if any set is not intact.   node scripts/digest.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const root = new URL('../public/characters/', import.meta.url);

// a file's place: the cue nibble in segment 0 (readBorder: cueBits[0] |= 1 << (3 - i))
const placeOf = (svg) => { let b = 0; for (const m of svg.matchAll(/data-cue="0\.(\d)"/g)) b |= 1 << (3 - +m[1]); return b; };
// a file's tag: data-name words -> bytes -> string (readBorder, key 0)
const tagOf = (svg) => {
  const w = [0, 0, 0, 0];
  for (const m of svg.matchAll(/data-name="(\d)\.(\d+)"/g)) w[+m[1]] |= 1 << (15 - +m[2]);
  return String.fromCharCode(...w.flatMap((x) => [x >> 8, x & 0xff]).filter((b) => b !== 0));
};

const dirs = readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
let ok = true;
const manifest = [];

for (const tag of dirs) {
  const dir = new URL(tag + '/', root);
  const files = readdirSync(dir).filter((f) => f.endsWith('.svg')).sort(); // ls (forward / KNOWN / read)
  const rows = files.map((f) => { const svg = readFileSync(new URL(f, dir), 'utf8'); return { file: f, place: placeOf(svg), tag: tagOf(svg) }; });
  const places = rows.map((r) => r.place);
  const fold = places.reduce((a, b) => a ^ b, 0);          // XOR of the 16 places
  const xnorFold = places.reduce((a, b) => a ^ (15 - b), 0); // the 15-complement fold
  const distinct = new Set(places);
  const intact = files.length === 16 && distinct.size === 16 && [...distinct].every((p) => p >= 0 && p < 16) && fold === 0;
  const tags = new Set(rows.map((r) => r.tag));
  const tagOK = tags.size === 1 && [...tags][0] === tag;
  const read = rows.find((r) => r.place === 0)?.file;   // Hasse_XOR
  const write = rows.find((r) => r.place === 15)?.file; // Hasse_XNOR
  const good = intact && tagOK;
  if (!good) ok = false;
  manifest.push({ tag, files: files.length, trace: fold, xnorTrace: xnorFold, intact, tagOK, read, write });
  console.log(`${good ? '✓' : '✗'} ${tag.padEnd(9)} ${String(files.length).padStart(2)}/16  places{0..15}=${intact ? 'yes' : 'NO '}  XOR=${fold} XNOR=${xnorFold}  read=${read || 'MISSING'} write=${write || 'MISSING'}`);
}

const intactCount = manifest.filter((m) => m.intact && m.tagOK).length;
writeFileSync(new URL('digest.json', root), JSON.stringify({
  note: 'stateless digest: each character set folds (XOR of its 16 places) to 0 when intact (XNOR, the 15-complement, to 15); the 2 Hasse diagrams (place 0 read / 15 write) index all agents, collated ls (KNOWN) / ls -r (UNKOW) — the cat -An/rev modem; no hash is identity, the tag names the agent and the fold is the digest',
  characters: manifest,
}, null, 2) + '\n');

console.log(`\ndigest: ${intactCount}/${manifest.length} sets intact (XOR trace 0) -> public/characters/digest.json`);
console.log('the 144 agents are referenced through each character\'s 2 Hasse (read place 0 / write place 15), collated ls/ls -r — not materialized.');
if (!ok) { console.error('DIGEST FAILED: a set is not intact (it can say no, and it did).'); process.exit(1); }
