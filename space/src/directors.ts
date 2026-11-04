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
export type Bound = { point: number; tag: string; term: Term; hue: number | null; braille: string };

/** The eight bindings, point 1 to 8, each term its Braille dot (the author: "if the 8 we just did are the braille"):
 *  term n dot n, the cell U+2800 + 2^(n - 1). */
export const DIRECTORS: Bound[] = DIRECTOR_TERMS.map((term, i) => ({ point: i + 1, tag: CHARACTER_TAGS[i + 1]!, term, hue: CHARACTER_HUES[i + 1] ?? null, braille: String.fromCodePoint(0x2800 + (1 << i)) }));

// The production: the nine arts directors (Wikipedia, Board of directors, Arts and design, in its order), the author:
// "this is the aegean for this narrtive production", "the hue is basically like a mood ring for the trajector toward
// these directives". Bound by ordinal to the nine Aegean signs of a band, ONE to NINE (U+10107 to U+1010F), and to the
// canon's nine series, the city's districts (city.ts), in the canon's order, each role its district's hue.
export const PRODUCTION_ROLES = [
  'Animation director', 'Artistic director', 'Creative director', 'Design director', 'Film director',
  'Music director', 'Music video director', 'Television director', 'Theatre director',
] as const;
export type Role = (typeof PRODUCTION_ROLES)[number];
export type Production = { order: number; role: Role; aegean: string; district: string; hue: number };

/** The nine bindings, given the districts in the canon's order (districtsOf). */
export function productionOf(districts: { name: string; hue: number }[]): Production[] {
  if (districts.length !== PRODUCTION_ROLES.length) throw new Error(`nine districts for nine roles, not ${districts.length}`);
  return PRODUCTION_ROLES.map((role, i) => ({ order: i + 1, role, aegean: String.fromCodePoint(0x10107 + i), district: districts[i]!.name, hue: districts[i]!.hue }));
}

/** A character's term by its tag. */
export const termOf = (tag: string): Term | undefined => DIRECTORS.find((d) => d.tag === tag)?.term;

/** A narrative speaker's binding, through the gate's cast (a name as the canon writes it). */
export const directorOfSpeaker = (name: string): Bound | undefined => DIRECTORS.find((d) => d.tag === GATE_CAST[name]);
