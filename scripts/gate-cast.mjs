// The gate's cast: which of the narrative's nodes are a character's, read from Light Garden's own canon lines
// (boxed omi-files/light-garden, the source each node's node_id points to; the timeline keeps no names).
//   node scripts/gate-cast.mjs [light-garden]  ->  public/narrative/cast.json
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const LG = process.argv[2] ?? new URL('../../boxed/omi-files/light-garden/', import.meta.url).pathname;
const narrative = new URL('../public/narrative/', import.meta.url);
const tl = readFileSync(new URL('timeline.ndjson', narrative), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const files = new Map();
const nodes = [];
for (const n of tl) {
  if (!files.has(n.series_path)) files.set(n.series_path, existsSync(LG + n.series_path) ? readFileSync(LG + n.series_path, 'utf8').split('\n') : null);
  const line = files.get(n.series_path)?.[n.source_line - 1];
  if (!line) continue;
  const s = JSON.parse(line), name = s.name ?? s.character;
  if (name) nodes.push({ seq: n.seq, node_id: n.node_id, event: n.event, name, quote: s.quote ?? s.text ?? "" });
}
const missing = [...files].filter(([, v]) => !v).map(([k]) => k);
if (missing.length) throw new Error(`canon files missing: ${missing.join(', ')}`);
writeFileSync(new URL('cast.json', narrative), JSON.stringify({ source: 'boxed omi-files/light-garden, each node_id\'s line, its name or character', nodes }, null, 1) + '\n');
console.log(`gate-cast: ${nodes.length} named nodes of ${tl.length}`);
