// The directors: the eight terms of a board (Wikipedia, Board of directors, its Terminology, in its order) bound to
// Light Garden's eight characters by ordinal, term n to the character at point n (border.ts), so each term takes that
// character's colour (characters.ts) and, through the gate's cast (production.ts), the narrative's speakers take
// their term. The author, 2026-11-03: "bind these to colors and to the cast of the narrative to give it reference",
// and earlier, "here are the 8 terms for the roles of the 8 agents that we have", and that the members and votes "are
// the literal terms cast from types by regular expressions". The binding is by ordinal, a labelling, not a reading of
// any character; another order is another binding.
import { CHARACTER_TAGS } from './border.ts';
import { CHARACTER_HUES } from './characters.ts';
import { GATE_CAST } from './production.ts';

export const DIRECTOR_TERMS = [
  'Director', 'Inside director', 'Outside director', 'Executive director',
  'Non-executive director', 'De facto director', 'Shadow director', 'Nominee director',
] as const;
export type Term = (typeof DIRECTOR_TERMS)[number];
export type Bound = { point: number; tag: string; term: Term; hue: number | null };

/** The eight bindings, point 1 to 8. */
export const DIRECTORS: Bound[] = DIRECTOR_TERMS.map((term, i) => ({ point: i + 1, tag: CHARACTER_TAGS[i + 1]!, term, hue: CHARACTER_HUES[i + 1] ?? null }));

/** A character's term by its tag. */
export const termOf = (tag: string): Term | undefined => DIRECTORS.find((d) => d.tag === tag)?.term;

/** A narrative speaker's binding, through the gate's cast (a name as the canon writes it). */
export const directorOfSpeaker = (name: string): Bound | undefined => DIRECTORS.find((d) => d.tag === GATE_CAST[name]);
