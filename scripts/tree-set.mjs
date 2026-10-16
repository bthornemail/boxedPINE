// The SVG tree-set generator: 16 SVGs — 14 Fano planes and 2 Hasse diagrams —
// stamped with a tag's border. Shared by character-trees.mjs (the eight Light
// Garden characters) and project-trees.mjs (every project). In the places of
// rosetta INDEX16: 0 Hasse_XOR (read), 1-14 the 7 points and 7 lines of the
// Fano plane, 15 Hasse_XNOR (write). Each file's border carries the tag and,
// as its first cue, its place: any one file says whose it is and which. An
// intact set of 16 traces to zero (space/src/trace.ts), so the set is also a
// restore anchor.
import { readFileSync } from 'node:fs';
import { writeBorder, readBorder } from '../space/src/border.ts';
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
export const diagram = (keep) => pair
  .replace(/<title>[^<]*<\/title>/, `<title>${keep === 'ring' ? 'XOR: the read state' : 'XNOR: the write state'} (a Hasse diagram pair, point 6)</title>`)
  .replace(keep === 'ring' ? /<circle class="ring2"[^>]*\/>/g : /<circle class="ring" cx="490" cy="360"[^>]*\/>/g, '')
  .replace(/<image href="..\/fano\/(Fano_(?:empty|full))\.svg" x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"\/>/g, (_, n, x, y, w, h) => inline(n, x, y, w, h))
  .replaceAll('href="../fano/', 'href="./');

/** The 16 named SVGs for a tag: 14 Fano planes, Hasse_XOR (place 0), Hasse_XNOR (place 15), each stamped with the tag's border. */
export function buildTreeSet(tag) {
  return SET16.map((name, i) => {
    const source = i === 0 ? diagram('ring') : i === 15 ? diagram('ring2') : fano(name);
    const svg = writeBorder(source, { name: tag, cues: [i] });
    const back = readBorder(svg);
    if (back.name !== tag || back.cues[0] !== i) throw new Error(`${tag}/${name}: the border does not read back`);
    return { name, svg };
  });
}
