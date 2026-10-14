// The story's passages, indexed on the plane (omi-files/light-garden canon-*.ndjson).
//
// Light Garden's canon carries an angle and a 7-place matrix on 218 passages.
// Their angles are of two kinds: sevenths of a turn (0, 51.4 ... 308.6, and
// 359.9 = 360) and eighths (45.2, 90.3 ... 315.8, 180). The square's plane is
// cyclic, line i = {1,2,4} + (i - 1) (mod 7, 7 for 0), so a turn of a seventh
// carries each line onto the next: a seventh passage stands on a line, line
// round(angle / (360/7)) mod 7 + 1. An eighth passage stands on a point,
// point round(angle / 45) (1-7). The matrix is kept as it is, in the square's
// numbering of the characters (the canon's manifest numbers 5-7 otherwise,
// see docs; the matrix places are not remapped here). Nothing is written to
// Light Garden.
//   node scripts/story-index.mjs  ->  public/story/passages.json
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const repo = new URL('..', import.meta.url).pathname;
const LG = process.env.LIGHT_GARDEN ?? join(repo, 'omi-files/light-garden');
if (!existsSync(LG)) { console.log(`story-index: no Light Garden at ${LG}; nothing written`); process.exit(0); }
const SEVENTH = 360 / 7;
const passages = [], unplaced = [];
for (const file of readdirSync(LG).filter((f) => /^canon-.*\.ndjson$/.test(f)).sort()) {
  const series = file.replace(/^canon-|\.ndjson$/g, '');
  readFileSync(join(LG, file), 'utf8').split('\n').forEach((line, n) => {
    if (!line.trim()) return;
    let o; try { o = JSON.parse(line); } catch { return; }
    if (!Array.isArray(o.matrix) || typeof o.angle !== 'number') return;
    const a = ((o.angle % 360) + 360) % 360, s = a / SEVENTH, e = a / 45;
    const base = { series, n: n + 1, id: o.id ?? null, event: o.event ?? null, text: o.text ?? '', matrix: o.matrix, angle: o.angle };
    if (Math.abs(s - Math.round(s)) * SEVENTH < 0.25) passages.push({ ...base, on: 'line', at: (Math.round(s) % 7) + 1 });
    else if (Math.abs(e - Math.round(e)) * 45 < 1) passages.push({ ...base, on: 'point', at: Math.round(e) % 8 });
    else unplaced.push(base);
  });
}
mkdirSync(join(repo, 'public/story'), { recursive: true });
writeFileSync(join(repo, 'public/story/passages.json'), JSON.stringify({ source: 'omi-files/light-garden canon-*.ndjson', passages, unplaced }, null, 1) + '\n');
const count = (on) => [...new Set(passages.filter((p) => p.on === on).map((p) => p.at))].sort((a, b) => a - b).map((k) => `${k}:${passages.filter((p) => p.on === on && p.at === k).length}`).join(' ');
console.log(`story-index: ${passages.length} passages; on lines ${count('line')}; on points ${count('point')}; unplaced ${unplaced.length}`);
