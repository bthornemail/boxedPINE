// The domino cube: a word laid as dominoes in the 256 x 256 x 256 cube, each face a step.svg, each domino on its own
// frame of the step. The author, 2026-11-04: "wait we need a 256 by 256 by 256 dominoes game in a cune with each face a
// step.svg so that each word has the step.svg timing to the 6 degrees of freedom to the same reptands directives".
//
// Derived, as cube256.ts derives a place: a word's UTF-8 bytes, three at a time (the last padded with zeros), are
// cells of the cube, (x, y, z) one byte each; a domino joins a cell to the next, and the last cell to the first, so a
// word's dominoes close into a loop, the word's repetend, its period the number of cells. Domino k is laid on frame
// k of the step (half a second a frame, 30 to a turn, cube256.ts frameAt); a word and the step come round together
// after lcm(period, 30) frames. Each face shows the loop projected: (x, y) on the front and back, (z, y) on the sides,
// (x, z) on the top and bottom: the six faces, the six directions +-x, +-y, +-z.
import { SIDE } from './cube256.ts';

export type Cell = [number, number, number];
export type Domino = { k: number; from: Cell; to: Cell };
export const FRAMES = 30;

/** A word's cells: its UTF-8 bytes three at a time. */
export function cellsOf(word: string): Cell[] {
  const bytes = [...new TextEncoder().encode(word)];
  while (bytes.length % 3) bytes.push(0);
  const cells: Cell[] = [];
  for (let i = 0; i < bytes.length; i += 3) cells.push([bytes[i]!, bytes[i + 1]!, bytes[i + 2]!]);
  return cells;
}

/** The dominoes: each cell to the next, the last to the first, a closed loop. */
export function dominoesOf(word: string): Domino[] {
  const c = cellsOf(word);
  return c.map((from, k) => ({ k, from, to: c[(k + 1) % c.length]! }));
}

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
/** The word's period (its dominoes) and the frames before the word and the step come round together. */
export function periodOf(word: string) {
  const period = cellsOf(word).length;
  return { period, together: (period * FRAMES) / gcd(period, FRAMES) };
}

export type FaceName = '+z' | '-z' | '+x' | '-x' | '+y' | '-y';
/** Which two coordinates a face shows, and whether its first axis runs mirrored (the face seen from behind). */
export const FACES: Record<FaceName, { u: 0 | 1 | 2; v: 0 | 1 | 2; mirror: boolean }> = {
  '+z': { u: 0, v: 1, mirror: false }, '-z': { u: 0, v: 1, mirror: true },
  '+x': { u: 2, v: 1, mirror: true }, '-x': { u: 2, v: 1, mirror: false },
  '+y': { u: 0, v: 2, mirror: false }, '-y': { u: 0, v: 2, mirror: true },
};
/** A cell's place on a face, 0..1 each way. */
export function onFace(c: Cell, f: FaceName): [number, number] {
  const { u, v, mirror } = FACES[f];
  const a = (c[u] + 0.5) / SIDE, b = (c[v] + 0.5) / SIDE;
  return [mirror ? 1 - a : a, 1 - b];
}
