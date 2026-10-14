// THE TAG FUNCTOR: any word toggled to an /A-Z0-9/ type literal
//
// The author, 2026-10-14: "I started with types, but using an uppercase
// functor, or a function that converts uppercase to lowercase, we can toggle
// any word to a type literal for the /A-Z0-9/ template literal". At the bit
// level the functor is XOR 0x20: a letter's two cases differ only by the case
// bit (proofs I-196), so toggling twice gives the word back. At the type level
// it is TypeScript's intrinsic Uppercase<S>, checked against a template
// literal type that admits only 1 to 8 of A-Z and 0-9 (rosetta TAG). And the
// two directions mean two things: "lower to upper to generate tag literals,
// and upper to lower to deprecate, or degenerate". A deprecated tag keeps its
// letters with the case bit set: it can be generated again, but it is not a
// tag while lowered. A tag of digits alone has no case, so it cannot be
// deprecated: numbers stay indices.
export type TagChar = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

/** true when S is 1 to 8 tag characters. */
export type IsTag<S extends string, N extends 0[] = []> =
  S extends '' ? (N['length'] extends 0 ? false : true)
  : N['length'] extends 8 ? false
  : S extends `${infer C}${infer R}` ? (C extends TagChar ? IsTag<R, [...N, 0]> : false) : false;

/** The word as a tag type literal: Uppercase<S> when that is a tag, never when it cannot be one. */
export type ToTag<S extends string> = IsTag<Uppercase<S>> extends true ? Uppercase<S> : never;

/** The case toggle on letters: XOR 0x20 (digits and everything else stay). */
export const toggle = (word: string) => word.replace(/[A-Za-z]/g, (c) => String.fromCharCode(c.charCodeAt(0) ^ 0x20));

/** The uppercase functor at run time, refusing what cannot be a tag (as ToTag refuses it at compile time). */
export function toTag<S extends string>(word: S): ToTag<S> | null {
  const up = word.replace(/[a-z]/g, (c) => String.fromCharCode(c.charCodeAt(0) ^ 0x20));
  return (/^[A-Z0-9]{1,8}$/.test(up) ? up : null) as ToTag<S> | null;
}

/** Upper to lower: the deprecated form of a tag (Lowercase<S>), never for what is not a tag. */
export type Deprecate<S extends string> = IsTag<S> extends true ? Lowercase<S> : never;

/** Deprecate a tag: its letters lowered (XOR 0x20); null for what is not a tag. */
export function deprecate<S extends string>(tag: S): Deprecate<S> | null {
  return (/^[A-Z0-9]{1,8}$/.test(tag) ? tag.replace(/[A-Z]/g, (c) => String.fromCharCode(c.charCodeAt(0) ^ 0x20)) : null) as Deprecate<S> | null;
}

/** A deprecated tag: lowered letters that uppercase back into a tag. Digits alone are never deprecated. */
export const isDeprecated = (word: string) => /[a-z]/.test(word) && !/[A-Z]/.test(word) && toTag(word) !== null;
