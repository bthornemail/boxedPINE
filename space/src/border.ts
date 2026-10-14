// THE BORDER: a character's name and its cues, in an SVG's margin
//
// The author, 2026-10-13: "if you change the character names to all
// uppercase letters, we should be able to XOR for them in an SVG image from
// the borders, then edit and add proto cues from the 14 Fano planes and 2
// Hasse diagrams". As the proofs' margin codes (proofs/svg/tools/build.mjs):
// invisible one-unit cells in the 8-unit border, present = 1, so the image
// does not change while the border is rewritten. Here each of the four sides
// carries:
//   row 1  two letters of the name, ASCII, 16 cells: a name of up to 8 capitals
//          (an /A-Z0-9/ tag) goes round the four sides, METATRON = ME TA TR ON;
//   row 4  a cue, 4 cells: a nibble, an index of the 16 (rosetta INDEX16: the
//          empty plane, the 7 points, the 7 lines, the full plane).
// Capitals are 010xxxxx, so XOR with 0x20 reads the same border in lowercase:
// the case bit (proofs I-196) changes the reading, not the image.
import { TAG, INDEX16 } from '../../rosetta/src/agent.ts';

export type Border = { name: string; cues: number[] };

function viewBox(svg: string): [number, number] {
  const v = /viewBox="\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)"/.exec(svg);
  if (v) return [Number(v[1]), Number(v[2])];
  const w = /\swidth="([\d.]+)"/.exec(svg), h = /\sheight="([\d.]+)"/.exec(svg);
  if (!w || !h) throw new Error('the SVG has no viewBox or width and height');
  return [Number(w[1]), Number(h[1])];
}

const cell = (W: number, H: number, side: number, row: number, i: number, n: number, kind: string) => {
  const along = (side % 2 === 0 ? W : H), at = 12 + (i * (along - 24)) / n;
  const [x, y] = side === 0 ? [at, row] : side === 1 ? [W - 1 - row, at] : side === 2 ? [at, H - 1 - row] : [row, at];
  return `<rect data-${kind}="${side}.${i}" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="1" height="1" fill="#000" fill-opacity="0"/>`;
};

/** Write a name (up to 8 capitals or digits) and up to 4 cues into the border; any old border is replaced. */
export function writeBorder(svg: string, b: Border): string {
  if (!TAG.test(b.name)) throw new Error(`the name is an /A-Z0-9/ tag of 1 to 8: ${b.name}`);
  if (b.cues.length > 4 || b.cues.some((c) => !Number.isInteger(c) || c < 0 || c > 15)) throw new Error('up to 4 cues, each 0 to 15');
  const [W, H] = viewBox(svg);
  const bytes = [...b.name.padEnd(8, '\0')].map((c) => c.charCodeAt(0));
  let cells = '';
  for (let side = 0; side < 4; side++) {
    const word = (bytes[side * 2]! << 8) | bytes[side * 2 + 1]!;
    for (let i = 0; i < 16; i++) if ((word >> (15 - i)) & 1) cells += cell(W, H, side, 1, i, 16, 'name');
    const cue = b.cues[side];
    if (cue !== undefined) { cells += `<rect data-cued="${side}" width="0" height="0" fill-opacity="0"/>`; for (let i = 0; i < 4; i++) if ((cue >> (3 - i)) & 1) cells += cell(W, H, side, 4, i, 4, 'cue'); }
  }
  return clearBorder(svg).replace(/<\/svg>\s*$/, `<g id="border">${cells}</g></svg>\n`);
}

/** The SVG without its border: the image as drawn. */
export const clearBorder = (svg: string) => svg.replace(/<g id="border">.*?<\/g><\/svg>\s*$/s, '</svg>\n');

/** Read the border back; with a key, each name byte is XORed with it first. */
export function readBorder(svg: string, key = 0): Border {
  const words = [0, 0, 0, 0], cueBits = [0, 0, 0, 0], cued = new Set<number>();
  for (const [, s, i] of svg.matchAll(/data-name="(\d)\.(\d+)"/g)) words[+s!]! |= 1 << (15 - +i!);
  for (const [, s, i] of svg.matchAll(/data-cue="(\d)\.(\d)"/g)) cueBits[+s!]! |= 1 << (3 - +i!);
  for (const [, s] of svg.matchAll(/data-cued="(\d)"/g)) cued.add(+s!);
  const bytes = words.flatMap((w) => [w >> 8, w & 0xff]).filter((b) => b !== 0).map((b) => b ^ key);
  return { name: String.fromCharCode(...bytes), cues: [0, 1, 2, 3].filter((s) => cued.has(s)).map((s) => cueBits[s]!) };
}

/** A cue's icon name: 0 the empty plane, 1-7 the points, 8-14 the lines, 15 the full plane. */
export const cueName = (cue: number) => INDEX16[cue]!;

/** Light Garden's characters as tags (the square's numbering: 5 Enoch, 6 Speaker, 7 Genesis; 8 the Observer). ASABIYAH: the author, "lose the YY, that's a closure" (Y XOR Y = 0), then "asabiyah, that's perfect": the double Y closed to one, 8 letters, a tag. */
export const CHARACTER_TAGS: Record<number, string> = { 1: 'METATRON', 2: 'SOLOMON', 3: 'SOLON', 4: 'ASABIYAH', 5: 'ENOCH', 6: 'SPEAKER', 7: 'GENESIS', 8: 'OBSERVER' };
