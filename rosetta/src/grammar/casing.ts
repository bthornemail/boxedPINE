// ONE WORD SEQUENCE, WRITTEN FIVE WAYS
//
// The author: map camelCase vs snake_case vs hyphen to an axis using the A-Z0-9
// delineation of positions, with an uppercase letter in the first position.
// (The lens dial is two numbers from a point; see wordform.ts dialLens.)
// (wiki: SPEC-27 §8)
//
// The words are the index: the A-Z0-9 runs, read without the case bit. The
// style is the literal: where the case bit (0x20) is set, and what marks a
// boundary (a case flip, '_' or '-'). Same words, five literals.
import { RULES } from './grammar.ts';

const CASING = RULES.filter((r) => r.group === 'casing');

/** The one declaration that reads words out of any of the five styles. */
export const WORDS = /[A-Z]?[a-z0-9]+|[A-Z0-9]+(?![a-z])/g;

/** The word sequence: the index every style shares, written without the case bit. */
export const words = (text: string) => (text.match(WORDS) ?? []).map((w) => w.toLowerCase());

/** Which of the five styles a text is written in, or null. */
export const style = (text: string) => CASING.find((r) => r.pattern.test(text))?.name ?? null;

/** The axis coordinate of a style: the first position's case bit, and the boundary mark. */
export function axis(text: string): { firstUpper: boolean; boundary: 'case' | '_' | '-' } | null {
  const s = style(text);
  if (!s) return null;
  const firstUpper = (text.charCodeAt(0) & 0x20) === 0; // A-Z has bit 32 clear
  return { firstUpper, boundary: s === 'SNAKE' || s === 'SCREAMING' ? '_' : s === 'KEBAB' ? '-' : 'case' };
}

/** Write a word sequence in a style. */
export function write(ws: string[], to: 'CAMEL' | 'PASCAL' | 'SNAKE' | 'KEBAB' | 'SCREAMING'): string {
  const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
  if (to === 'CAMEL') return ws.map((w, i) => (i ? cap(w) : w)).join('');
  if (to === 'PASCAL') return ws.map(cap).join('');
  if (to === 'SNAKE') return ws.join('_');
  if (to === 'KEBAB') return ws.join('-');
  return ws.map((w) => w.toUpperCase()).join('_');
}

// The lens is dialled by any two numbers from a point (core/src/verified/wordform.ts, dialLens),
// not by the first letter: the author corrected that reading.
