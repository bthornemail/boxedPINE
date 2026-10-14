// The autonomous agents of the Agent Commons, as plain data (drawn by hub.ts).
//
// Two kinds walk the Commons floor:
//   synset agents  one per WordNet synset polytron drew barcodes for
//                  (public/polytron/commons.json, scripts/polytron-commons.mjs).
//                  Each steps its own K on its own beat, and walks to the sector
//                  the state names: autonomous, nothing outside moves them.
//   bridge agents  one per speaker on the agent bridge (Claude Code, OpenCode,
//                  the author, the hub). Each steps K once per message it
//                  sends: the gnomon as their clock, a step per message, not per
//                  second. A message naming a synset's word sends the speaker to
//                  that synset.
// An agent's seed is a literal, never a hash: a synset's id (its low 16 bits),
// a speaker's name (its first two characters as a pair, car and cdr).
import { K } from './gnomon.ts';
import { type Declaration } from './polyform.ts';

export type SynsetAgent = { id: number; word: string; gloss: string; depth: number | null; geometry: string; svg: { aztec?: string; maxicode?: string; beetag?: string } };

/** The ring the agents walk, outside the stations (radius 3.4) and inside the floor (8). */
export const WALK_RADIUS = 5.6;
export const SECTORS = 8;

/** A synset's polyform: deeper synsets are higher in dimension and degree. */
export function synsetDeclaration(a: SynsetAgent): Declaration {
  const d = a.depth ?? 0;
  return { basis: d >= 3 ? 3 : 0, degree: Math.min(4 + d, 8), dimension: Math.min(d, 3) as Declaration['dimension'], group: 0 };
}

export const synsetSeed = (a: SynsetAgent) => a.id & 0xffff;
export const speakerSeed = (name: string) => ((name.charCodeAt(0) & 0xff) << 8) | (name.charCodeAt(1) & 0xff || 0);

/** The sector a state names: its top three bits, one octal digit (I-196). */
export const sectorOf = (state: number) => state >> 13;

/** Where on the ring a state stands; each agent keeps its own lane by its index. */
export function placeOf(state: number, lane: number): [number, number] {
  const a = ((sectorOf(state) + lane / 16) / SECTORS) * 2 * Math.PI;
  const r = WALK_RADIUS + (lane % 3) * 0.45;
  return [Math.cos(a) * r, Math.sin(a) * r];
}

/** One step of an agent: K, and where it then stands. */
export function stepAgent(state: number, lane: number) {
  const next = K(state);
  return { state: next, at: placeOf(next, lane) };
}

/** The synset a message names, if any (whole words, any case). */
export function namedSynset(text: string, synsets: SynsetAgent[]): SynsetAgent | undefined {
  const t = ` ${text.toLowerCase().replace(/[^a-z' ]+/g, ' ')} `;
  return [...synsets].sort((a, b) => b.word.length - a.word.length).find((s) => t.includes(` ${s.word.toLowerCase()} `));
}
