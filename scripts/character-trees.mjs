// Each character's own SVG tree: 16 of them, 14 Fano planes and 2 Hasse diagrams.
//
// The author, 2026-10-13: "give each one their own set of 16; it's the first
// SVG tree"; "its 16 of them, 14 Fano planes and 2 Hasse diagrams"; "2 Hasse
// diagrams, the XOR and the XNOR, for read and write state". For each of Light
// Garden's characters (space/src/border.ts), in the places of rosetta INDEX16:
//   0       Hasse_XOR   the read state: proofs/svg/hasse/pair-6.svg (XOR 0110 /
//                       XNOR 1001, point 6) with XOR's mark only;
//   1-14    the 7 points and the 7 lines of proofs/svg/fano;
//   15      Hasse_XNOR  the write state: the same pair with XNOR's mark only.
// (XOR in the empty plane's place, XNOR in the full plane's: XOR 0, XNOR 1.)
// Inside the two diagrams the empty and full planes are drawn inline, so the
// set is these 16 files and nothing more, and every other node is the
// character's own icon. Each file's border carries the character's tag and,
// as its first cue, its place: any one file says whose it is and which.
//   node scripts/character-trees.mjs  ->  public/characters/<TAG>/
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { writeBorder, readBorder, CHARACTER_TAGS } from '../space/src/border.ts';
import { INDEX16 } from '../rosetta/src/agent.ts';

const repo = new URL('..', import.meta.url);
const fano = (name) => readFileSync(new URL(`proofs/svg/fano/${name}.svg`, repo), 'utf8');
const pair = readFileSync(new URL('proofs/svg/hasse/pair-6.svg', repo), 'utf8');
export const SET16 = ['Hasse_XOR', ...INDEX16.slice(1, 15), 'Hasse_XNOR'];
/** An Inkscape icon as a nested <svg>, without its editor's namespaced parts. */
const inline = (name, x, y, w, h) => {
  const body = fano(name).replace(/<\?xml[^>]*>|<!--.*?-->/gs, '').replace(/<metadata.*?<\/metadata>/s, '').replace(/<(sodipodi|inkscape):[^>]*?\/>/gs, '').replace(/<(sodipodi|inkscape):(\w+)[^>]*>.*?<\/\1:\2>/gs, '');
  const inner = body.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/\s[\w-]+:[\w-]+="[^"]*"/g, '');
  const [, W, H] = /width="([\d.]+)"[\s\S]*?height="([\d.]+)"/.exec(fano(name));
  return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${W} ${H}">${inner}</svg>`;
};
const diagram = (keep) => pair
  .replace(/<title>[^<]*<\/title>/, `<title>${keep === 'ring' ? 'XOR: the read state' : 'XNOR: the write state'} (a Hasse diagram pair, point 6)</title>`)
  .replace(keep === 'ring' ? /<circle class="ring2"[^>]*\/>/g : /<circle class="ring" cx="490" cy="360"[^>]*\/>/g, '')
  .replace(/<image href="..\/fano\/(Fano_(?:empty|full))\.svg" x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"\/>/g, (_, n, x, y, w, h) => inline(n, x, y, w, h))
  .replaceAll('href="../fano/', 'href="./');
const out = new URL('public/characters/', repo);
rmSync(out, { recursive: true, force: true });
const manifest = [];
for (const [point, tag] of Object.entries(CHARACTER_TAGS)) {
  const dir = new URL(`${tag}/`, out);
  mkdirSync(dir, { recursive: true });
  SET16.forEach((name, i) => {
    const source = i === 0 ? diagram('ring') : i === 15 ? diagram('ring2') : fano(name);
    const svg = writeBorder(source, { name: tag, cues: [i] });
    const back = readBorder(svg);
    if (back.name !== tag || back.cues[0] !== i) throw new Error(`${tag}/${name}: the border does not read back`);
    writeFileSync(new URL(`${name}.svg`, dir), svg);
  });
  manifest.push({ point: Number(point), tag, set: SET16.map((n) => `characters/${tag}/${n}.svg`) });
}
writeFileSync(new URL('trees.json', out), JSON.stringify({ source: 'proofs/svg/fano (the 14 planes) + proofs/svg/hasse/pair-6.svg (XOR read, XNOR write), with each character\'s border (space/src/border.ts)', characters: manifest }, null, 1) + '\n');
console.log(`character-trees: ${manifest.length} characters x 16 (14 Fano planes, Hasse_XOR, Hasse_XNOR) in public/characters`);
