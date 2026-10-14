// The synset agents of the Agent Commons, from polytron's barcodes and WordNet.
//
// Polytron drew its barcodes for WordNet synsets (omi-files/polytron/polyform:
// aztec-<id>.svg, maxicode-<id>.svg, beetag-<id>.svg, the id a WordNet 3.0
// synset). The author's layering: Aztec and MaxiCode split the frame, Code 16K
// is the modem, Code 128 the message carrier, BEEtag the pixels. This copies
// those SVGs into public/polytron/svg and writes public/polytron/commons.json:
// one agent per synset, with its word, gloss, hypernym and depth read from
// WordNet's Prolog files (the same files polytron's wn-geometry reads), and the
// geometry wn-geometry names for that depth. Synsets polytron drew that WordNet
// 3.0 does not hold are listed as missing, not made into agents.
//   node scripts/polytron-commons.mjs          (re-run when polytron draws more)
import { readFileSync, readdirSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const repo = new URL('..', import.meta.url).pathname;
const polyform = join(repo, 'omi-files/polytron/polyform');
const WN = process.env.WNPROLOG ?? '/home/main/Downloads/WNprolog-3.0/prolog';
const out = join(repo, 'public/polytron'), svgOut = join(out, 'svg');
mkdirSync(svgOut, { recursive: true });

// wn-geometry.c's depth_to_geom
const GEOMETRY = ['point', 'line', 'triangle', 'tetrahedron', '5-cell', '8-cell', '16-cell', '24-cell', '120-cell', '600-cell'];
const ROOT = 100001740; // entity

const ids = [...new Set(readdirSync(polyform).map((f) => /^(?:aztec|maxicode|beetag)-(\d{9})\.svg$/.exec(f)?.[1]).filter(Boolean))].map(Number).sort((a, b) => a - b);
const lines = (file, id) => readFileSync(join(WN, file), 'latin1').split('\n').filter((l) => l.startsWith(`${file === 'wn_hyp.pl' ? 'hyp' : file === 'wn_g.pl' ? 'g' : 's'}(${id},`));
const word = (id) => /^s\(\d+,\d+,'((?:[^']|'')*)'/.exec(lines('wn_s.pl', id)[0] ?? '')?.[1]?.replace(/''/g, "'");
const gloss = (id) => /^g\(\d+,'((?:[^']|'')*)'\)/.exec(lines('wn_g.pl', id)[0] ?? '')?.[1]?.replace(/''/g, "'");
const hypernym = (id) => Number(/^hyp\(\d+,(\d+)\)/.exec(lines('wn_hyp.pl', id)[0] ?? '')?.[1]) || null;
function depth(id) { let d = 0; for (let h = id; h !== ROOT; d++) { h = hypernym(h); if (h === null || d > 30) return null; } return d; }

const agents = [], missing = [];
for (const id of ids) {
  const w = word(id);
  if (!w) { missing.push(id); continue; }
  const svg = {};
  for (const kind of ['aztec', 'maxicode', 'beetag']) {
    const file = `${kind}-${id}.svg`;
    try { copyFileSync(join(polyform, file), join(svgOut, file)); svg[kind] = `polytron/svg/${file}`; } catch { /* polytron did not draw this one */ }
  }
  const d = depth(id);
  agents.push({ id, word: w, gloss: gloss(id), hypernym: hypernym(id), depth: d, geometry: GEOMETRY[Math.min(d ?? 0, 9)], svg });
}
writeFileSync(join(out, 'commons.json'), JSON.stringify({ source: 'omi-files/polytron/polyform + WordNet 3.0 (Prolog)', agents, missing }, null, 2) + '\n');
console.log(`polytron-commons: ${agents.length} synset agents (${agents.map((a) => a.word).join(', ')}); not in WordNet 3.0: ${missing.join(', ') || 'none'}`);
