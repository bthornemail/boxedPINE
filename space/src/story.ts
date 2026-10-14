// THE STORY: a choose-your-own-adventure on the Fano plane (public/story/passages.json)
//
// The author, 2026-10-13: Light Garden's canon is "a full narrative that the
// agents can cycle decisions through like a choose your own adventure", and
// "let's proceed to see if by building the Commons we can logically derive the
// hints and clues". The plane is the square's, cyclic: line i is {1,2,4} +
// (i - 1), so a seventh of a turn carries each line onto the next, and the
// passages at sevenths stand on lines, those at eighths on points
// (scripts/story-index.mjs). A step: from a line, choose one of its 3 points
// (a passage there, a decision), then one of the 2 other lines through it
// (the next passage of the story). An agent with no one to choose for it
// chooses by K (gnomon.ts): its state steps, and the state picks.
import { K } from './gnomon.ts';
import { CHARACTER_TAGS } from './border.ts';

export type Passage = { series: string; n: number; id: string | null; event: string | null; text: string; matrix: number[]; angle: number; on: 'line' | 'point'; at: number };

/** The square's plane: line i = {1,2,4} + (i - 1), points 1-7. */
export const LINES: number[][] = [1, 2, 3, 4, 5, 6, 7].map((i) => [1, 2, 4].map((x) => ((x + i - 2) % 7) + 1).sort((a, b) => a - b));
export const linesThrough = (point: number) => LINES.map((_, i) => i + 1).filter((l) => LINES[l - 1]!.includes(point));
/** The line two lines share a point on: in a projective plane, exactly one. */
export const meet = (a: number, b: number) => LINES[a - 1]!.filter((p) => LINES[b - 1]!.includes(p));
/** From a line: each of its points, and the two other lines through it. */
export const choices = (line: number) => LINES[line - 1]!.map((point) => ({ point, character: CHARACTER_TAGS[point]!, lines: linesThrough(point).filter((l) => l !== line) }));

export type Walker = { line: number; state: number; read: Record<string, number>; path: { line: number; point: number }[] };
export const newWalker = (seed: number, line = 1): Walker => ({ line, state: seed & 0xffff, read: {}, path: [] });

/** The next passage at a place, in the canon's order, going round when all are read. */
export function nextPassage(w: Walker, passages: Passage[], on: 'line' | 'point', at: number): Passage | undefined {
  const here = passages.filter((p) => p.on === on && p.at === at);
  if (!here.length) return undefined;
  const key = `${on}${at}`, i = w.read[key] ?? 0;
  w.read[key] = i + 1;
  return here[i % here.length];
}

/** One step: at the walker's line, a point (chosen, or by K), its passage, then a next line (chosen, or by K) and its passage. */
export function step(w: Walker, passages: Passage[], chosen?: { point: number; line: number }) {
  let point: number, line: number;
  if (chosen) {
    if (!LINES[w.line - 1]!.includes(chosen.point)) throw new Error(`point ${chosen.point} is not on line ${w.line}`);
    if (!linesThrough(chosen.point).includes(chosen.line) || chosen.line === w.line) throw new Error(`line ${chosen.line} does not go on from point ${chosen.point}`);
    ({ point, line } = chosen);
  } else {
    w.state = K(w.state);
    const c = choices(w.line)[w.state % 3]!;
    point = c.point;
    line = c.lines[(w.state >> 8) & 1]!;
  }
  const decision = nextPassage(w, passages, 'point', point);
  w.path.push({ line: w.line, point });
  w.line = line;
  return { point, character: CHARACTER_TAGS[point]!, decision, line, passage: nextPassage(w, passages, 'line', line) };
}
