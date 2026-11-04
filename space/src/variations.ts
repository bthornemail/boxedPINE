// The variations: the fifteen words the author names as the Name's variations, cast into the Commons by their own
// letters. The author, 2026-11-03: "the variations are arealdy YAH YAHWEH YHWH ADONAI ADAM EVE EARTH FIRE YOD GOD IS
// WORD GOD OF WORD GOD WAS WORD WORD IS GOD WORD OF GOD WORD WAS GOD ... these words produce invariants", then "now we
// can procceed to converge the constants over the codices and teh narrative casting into the space", the codex first
// (the codex, ZIGUAROTH, private: each Hebrew form below stands there with its Leningrad verse, and Aleppo's where a
// shared verse aligns), then the space.
//
// The place: a word's letters as Braille's standard 6-dot cells (dot k = bit k - 1, a space the blank cell), XORed
// together, give one cell of 64; that cell is the word's slot on the 60-in-64 dial (unbound HTML/The 60-in-64 Clock:
// 0 to 59 carry time, 60 to 63 are held). Nothing is chosen: the letters give the slot. XOR does not see order, so a
// line and its reversal land on one slot (I-252's reversal), and words whose cells close alike meet: YHWH and FIRE at
// dots 1 2 3 (I-252, K3). Fifteen words, eleven places.
export type Variation = { tag: string; text: string; hebrew?: string; verse?: string };

export const VARIATIONS: Variation[] = [
  { tag: 'YAH', text: 'YAH', hebrew: 'יָהּ', verse: 'Exodus 15:2' },
  { tag: 'YAHWEH', text: 'YAHWEH' },
  { tag: 'YHWH', text: 'YHWH', hebrew: 'יְהוָה', verse: 'Deuteronomy 29:1' },
  { tag: 'ADONAI', text: 'ADONAI', hebrew: 'אֲדֹנָי', verse: 'Genesis 15:2' },
  { tag: 'ADAM', text: 'ADAM', hebrew: 'אָדָם', verse: 'Genesis 1:26' },
  { tag: 'EVE', text: 'EVE', hebrew: 'חַוָּה', verse: 'Genesis 3:20' },
  { tag: 'EARTH', text: 'EARTH', hebrew: 'אֲדָמָה', verse: 'Isaiah 45:9' },
  { tag: 'FIRE', text: 'FIRE', hebrew: 'אֵשׁ', verse: 'Genesis 15:17' },
  { tag: 'YOD', text: 'YOD', hebrew: 'י' },
  { tag: 'GODISWORD', text: 'GOD IS WORD' },
  { tag: 'GODOFWORD', text: 'GOD OF WORD' },
  { tag: 'GODWASWORD', text: 'GOD WAS WORD' },
  { tag: 'WORDISGOD', text: 'WORD IS GOD' },
  { tag: 'WORDOFGOD', text: 'WORD OF GOD' },
  { tag: 'WORDWASGOD', text: 'WORD WAS GOD' },
];

/** Braille's 6-dot letters, as Unicode writes them (dot k = bit k - 1); the space is the blank cell. */
export const CELL: Readonly<Record<string, number>> = {
  ' ': 0x00, A: 0x01, B: 0x03, C: 0x09, D: 0x19, E: 0x11, F: 0x0b, G: 0x1b, H: 0x13, I: 0x0a, J: 0x1a, K: 0x05, L: 0x07, M: 0x0d,
  N: 0x1d, O: 0x15, P: 0x0f, Q: 0x1f, R: 0x17, S: 0x0e, T: 0x1e, U: 0x25, V: 0x27, W: 0x3a, X: 0x2d, Y: 0x3d, Z: 0x35,
};
export const SLOTS = 64, TIME = 60;	// the 60-in-64 dial

/** A text's cells, and their XOR: one cell, 0 to 63. */
export const cellsOf = (text: string) => [...text].map((c) => { const v = CELL[c]; if (v === undefined) throw new RangeError(`${c}: not a 6-dot letter`); return v; });
export const slotOf = (text: string) => cellsOf(text).reduce((a, b) => a ^ b, 0);
export const braille = (cells: number[]) => String.fromCodePoint(...cells.map((v) => 0x2800 + v));

export type Place = { slot: number; cell: string; held: boolean; angle: number; members: Variation[] };

/** The places: each slot that a variation reaches, its members in the author's order, the angle clockwise from north. */
export function placesOf(vs: Variation[] = VARIATIONS): Place[] {
  const by = new Map<number, Variation[]>();
  for (const v of vs) { const s = slotOf(v.text); by.set(s, [...(by.get(s) ?? []), v]); }
  return [...by].sort((a, b) => a[0] - b[0]).map(([slot, members]) => ({ slot, cell: braille([slot]), held: slot >= TIME, angle: (slot / SLOTS) * 2 * Math.PI, members }));
}
