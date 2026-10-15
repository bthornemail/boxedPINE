// THE CHARACTERS: Light Garden's eight in the 3D Commons, as plain data (hub.ts draws and sounds them)
//
// Each stands at its hue on the rim of the Commons: the ratio of the circle in
// Light Garden's table (docs/index.md) times 360, the same angles the map uses
// (Metatron 0, Solomon 30, Solon 60, Asabiyah 120, Enoch 240, Speaker 270,
// Genesis 300). The Observer, white, the 8th, stands above the centre. Each
// walks the story from the first line through its own point (story.ts), steps
// by K from a seed that is the pair of its tag's first letter and its point (a
// literal, not a hash: the first two letters would make SOLOMON and SOLON twins), sounds its steps through its own graph and panner (sound.ts,
// score.ts), and exchanges its 128 bytes (exchange.ts).
import { CHARACTER_TAGS } from './border.ts';
import { linesThrough } from './story.ts';

export type Character = { point: number; tag: string; hue: number | null; at: [number, number, number]; seed: number; line: number };

/** Light Garden's ratios of the circle, as hues: point 1-7; the Observer (8) has none. */
export const CHARACTER_HUES: Record<number, number | null> = { 1: 0, 2: 30, 3: 60, 4: 120, 5: 240, 6: 270, 7: 300, 8: null };
export const RIM = 7;

/** Where a character stands: its hue on the rim (the map's convention, hue 0 to the north), the Observer above the centre. */
export function placeOf(point: number): [number, number, number] {
  const hue = CHARACTER_HUES[point];
  if (hue === null || hue === undefined) return [0, 3.4, 0];
  const a = ((hue - 90) * Math.PI) / 180;
  return [Math.cos(a) * RIM, 0, Math.sin(a) * RIM];
}

/** The seed: the pair (car, cdr) of the tag's first letter and the character's point. */
export const seedOf = (tag: string, point: number) => ((tag.charCodeAt(0) & 0xff) << 8) | (point & 0xff);

export const CHARACTERS: Character[] = Object.entries(CHARACTER_TAGS).map(([p, tag]) => {
  const point = Number(p);
  return { point, tag, hue: CHARACTER_HUES[point] ?? null, at: placeOf(point), seed: seedOf(tag, point), line: point <= 7 ? linesThrough(point)[0]! : 1 };
});
