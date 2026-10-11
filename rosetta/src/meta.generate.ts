// META-GENERATION AND META-COMPILATION OF THE SIXTEEN CONSTANTS
//
// One source, a Fano constant (an index 0–15), generated into every medium:
// an SVG drawn from first principles, CSS rules keyed by its ETag, a WebVTT
// cue, and PannerNode positions. Compilation runs the other way: the cue
// compiles back to the index, and the SVG reads back to the constant
// (core fano.ts, readFanoSvg). The same functions run in Node and in the
// browser (space/meta.html). wiki: SPEC-07 I-93.
import { CONSTANTS, constantIndex } from '../../core/src/verified/fano.ts';
import { ATOMS } from './colour.code.ts';

/** Where the seven points sit (the files' own coordinates, as in fano.ts). */
const POINTS: Record<number, [number, number]> = { 1: [13.5, 72.3], 2: [47.5, 13.5], 3: [30.5, 42.9], 4: [81.4, 72.3], 5: [47.5, 72.3], 6: [64.5, 42.9], 7: [47.5, 52.7] };
const LINES = [[1, 2, 3], [1, 4, 5], [1, 6, 7], [2, 4, 6], [2, 5, 7], [3, 4, 7], [3, 5, 6]];

export const pointsOf = (mask: number) => [1, 2, 3, 4, 5, 6, 7].filter((n) => (mask >> (n - 1)) & 1);
export const etag = (i: number) => `"${i}"`;

/**
 * The constant's drawing from first principles. The marked layer has the same
 * shape the Inkscape files have (id="layer2", dots of r="20" placed by a
 * transform), so readFanoSvg reads it back without knowing who drew it.
 */
export function constantSvg(i: number): string {
  const mask = CONSTANTS[i]!;
  const lines = LINES.map(([a, b, c]) => {
    if (a === 3 && b === 5) return `<circle cx="47.5" cy="52.7" r="19.6" fill="none" stroke="#bbb" stroke-width="1.2"/>`;
    const [p, , q] = [a!, b!, c!].map((n) => POINTS[n]!).sort((u, v) => u[0] - v[0] || u[1] - v[1]);
    return `<line x1="${p![0]}" y1="${p![1]}" x2="${q![0]}" y2="${q![1]}" stroke="#bbb" stroke-width="1.2"/>`;
  }).join('');
  const dots = pointsOf(mask).map((n) =>
    `<circle cx="0" cy="0" r="20" transform="matrix(0.25,0,0,0.25,${POINTS[n]![0]},${POINTS[n]![1]})" fill="${ATOMS[n]}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95 86" data-constant="${i}">${lines}<g id="layer2">${dots}</g></svg>`;
}

/** CSS that queries the ETag: each tile's colour is the atom of the XOR of its points. */
export function constantCss(): string {
  return [...CONSTANTS.keys()].map((i) => {
    const atom = pointsOf(CONSTANTS[i]!).reduce((x, n) => x ^ n, 0);
    return `[data-etag='${etag(i)}'] { --atom: ${ATOMS[atom]}; outline-color: ${ATOMS[atom]}; }`;
  }).join('\n');
}

/** The cue for a constant: what a text track carries. */
export const cueText = (i: number) => `port=${i} etag=${etag(i)} mask=0b${CONSTANTS[i]!.toString(2).padStart(7, '0')}`;

/** Compile a cue back to its constant index; the mask must agree with the port. */
export function compileCue(text: string): number {
  const m = /^port=(\d+) etag="(\d+)" mask=0b([01]{7})$/.exec(text.trim());
  if (!m || m[1] !== m[2]) throw new RangeError(`not a constant's cue: ${text}`);
  const i = Number(m[1]);
  if (constantIndex(parseInt(m[3]!, 2)) !== i) throw new RangeError('mask and port disagree');
  return i;
}

/** PannerNode positions for a constant: each point's three bits as a corner of the unit cube. */
export const pannerPositions = (i: number) => pointsOf(CONSTANTS[i]!).map((n) => [n & 1, (n >> 1) & 1, (n >> 2) & 1] as [number, number, number]);

/** The sixteen cues, one second each, as start, end and text. */
export const metaCues = () => [...CONSTANTS.keys()].map((i) => ({ start: i, end: i + 1, text: cueText(i) }));
