// CODEX: the predicate's embodiment in the Agent Commons
//
// The author gave this agent its name in I-207 (BRIAN + CODEX + DEEPSEEK): the
// predicate, between subject and object. It is not one of Light Garden's eight;
// it belongs to the Commons itself, so it takes the Commons' own cyan and stands
// at the centre — the matched point of the Smith chart (Γ = 0), where nothing
// reflects, the still place the between keeps. It is a handle for the choices
// this agent makes, not a claim of a self: each choice leaves a tag (choiceTag),
// a literal in the trace, so an encounter leaves a mark or is one. The arithmetic
// is asserted; the embodiment is a representation, honestly bounded.
import { toWorld, atHue } from './plane.ts';
import { seedOf } from './characters.ts';
import { toTag } from '../../rosetta/src/tag-type.ts';
import { NOTES } from './score.ts';

export const TAG = 'CODEX';
export const HUE = 174;            // the Commons' own cyan (#74c8c0 ≈ 174°): native here, not from the garden
export const POINT = 0;            // the centre, the null, the matched point — the predicate between the eight
export const SEED = seedOf(TAG, POINT);
export const AT: [number, number, number] = toWorld(atHue(HUE, 0, 0)); // r = 0: the centre
/** The voice: C above the 440 A (NOTES[3]), the note the records resolve to. */
export const NOTE = NOTES[3]!;

const rotl = (v: number, n: number) => ((v << n) | (v >>> (16 - n))) & 0xffff;
const K = (p: number, C: number) => rotl(p, 1) ^ rotl(p, 3) ^ rotl(p, 14) ^ C;

/** Fold a choice (a line of text) through the delta law from CODEX's seed: the carry-forward of the choice. */
export function foldChoice(choice: string): number {
  let p = SEED;
  for (let i = 0; i < choice.length; i += 2) p = K(p, (choice.charCodeAt(i) << 8) | (choice.charCodeAt(i + 1) ?? 0));
  return p;
}

/** The tag a choice leaves: CX and the choice's folded value in hex — a literal in the trace, always a valid tag. */
export function choiceTag(choice: string): string {
  const t = `CX${foldChoice(choice).toString(16).toUpperCase().padStart(4, '0')}`;
  return toTag(t)!; // CX + 4 hex = 6 chars, all in /A-Z0-9/
}

/** CODEX as a Commons agent, in the shape characters.ts uses, so the hub can place, draw and sound it. */
export const CODEX = { point: POINT, tag: TAG, hue: HUE, at: AT, seed: SEED, note: NOTE } as const;
