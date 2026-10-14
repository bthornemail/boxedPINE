// The polyform generator of the Agent Commons, as plain data.
//
// The author: polytron's frame is split by the Aztec and MaxiCode automata, and
// from it "we were able to encode a polyform generator for the space
// environment". MaxiCode carries the type declaration (polytron docs/BARCODE.md):
// basis 4 bits, degree 4 bits, dimension 2 bits, group 4 bits, reserved 1 bit,
// 15 bits in all. Here a declaration and a seed give the cells: growth starts at
// the origin, and each new cell is the free neighbour that K (I-195, I-197)
// picks, the seed stepped once per cell, so the same declaration and seed give
// the same polyform every time. And the Dalí cross, the tesseract's net of 8
// cubes (a column of four, four more around its second), drawn by its standard
// definition: polytron's make_dali_cross is not that shape, and polytron's
// sources stay as they are.
import { K } from './gnomon.ts';

export type Declaration = { basis: number; degree: number; dimension: 0 | 1 | 2 | 3; group: number };
export const BASES = ['square', 'triangle', 'hex', 'cube'] as const;
export const DIMENSIONS = ['1D', '2D', '2.5D', '3D'] as const;
export type Cell = [number, number, number];

/** The 15-bit MaxiCode type declaration: basis, degree (1-16 stored as 0-15), dimension, group. */
export function packDeclaration(d: Declaration): number {
  return ((d.basis & 0xf) << 11) | (((d.degree - 1) & 0xf) << 7) | ((d.dimension & 3) << 5) | ((d.group & 0xf) << 1);
}
export function unpackDeclaration(w: number): Declaration {
  return { basis: (w >> 11) & 0xf, degree: ((w >> 7) & 0xf) + 1, dimension: ((w >> 5) & 3) as Declaration['dimension'], group: (w >> 1) & 0xf };
}

const key = (c: Cell) => c.join(',');
const STEPS: Record<Declaration['dimension'], Cell[]> = {
  0: [[1, 0, 0], [-1, 0, 0]],
  1: [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]],
  2: [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]], // grown flat, then extruded
  3: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]],
};

/** Grow the declared polyform from a seed: each cell is the free neighbour K picks. */
export function grow(d: Declaration, seed: number): Cell[] {
  const cells: Cell[] = [[0, 0, 0]];
  const taken = new Set([key(cells[0]!)]);
  let state = seed & 0xffff;
  while (cells.length < d.degree) {
    const free: Cell[] = [];
    for (const c of cells) for (const s of STEPS[d.dimension]) {
      const n: Cell = [c[0] + s[0], c[1] + s[1], c[2] + s[2]];
      if (d.dimension === 3 && n[1] < 0) continue; // stand on the floor
      if (!taken.has(key(n)) && !free.some((f) => key(f) === key(n))) free.push(n);
    }
    state = K(state);
    const next = free[state % free.length]!;
    cells.push(next);
    taken.add(key(next));
  }
  // 2.5D: the flat form extruded through three layers (polyform.h DIM_2_5D)
  return d.dimension === 2 ? [0, 1, 2].flatMap((y) => cells.map(([x, , z]): Cell => [x, y, z])) : cells;
}

/** The Dalí cross: the net of the tesseract, a column of four cubes with four more around the second. */
export function daliCross(): Cell[] {
  return [[0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0], [1, 2, 0], [-1, 2, 0], [0, 2, 1], [0, 2, -1]];
}

/** Every cell shares a face with another, all in one piece. */
export function connected(cells: Cell[]): boolean {
  const all = new Set(cells.map(key)), seen = new Set([key(cells[0]!)]), todo = [cells[0]!];
  while (todo.length) {
    const c = todo.pop()!;
    for (const s of STEPS[3]) {
      const n: Cell = [c[0] + s[0], c[1] + s[1], c[2] + s[2]];
      if (all.has(key(n)) && !seen.has(key(n))) { seen.add(key(n)); todo.push(n); }
    }
  }
  return seen.size === all.size;
}
