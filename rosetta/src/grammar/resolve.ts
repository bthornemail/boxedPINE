// THE RESOLVER: A DECLARATION AND A SEED, NOTHING ELSE
//
// Author, 2026-10-09: "everything is an index resolved from and derived from
// a regex constraint based on a seed string … the user derives all
// definitions, words, terms, operations and everything from prompting the
// meta tree using a declaration regex expression and a seed string, nothing
// else." And: "a polynomial is a regex expression"; its terms are "any unique
// unit or attribute, simply put exceptions" (wiki: SPEC-04 "The Only Input").
//
// So this file defines no words. It takes the two inputs and returns indices.

export type Seed = string | Uint8Array;

/** A byte seed is read one byte per character, so every byte keeps its index. */
const text = (seed: Seed): string => (typeof seed === 'string' ? seed : String.fromCharCode(...seed));

const global = (declaration: RegExp) =>
  new RegExp(declaration.source, declaration.flags.includes('g') ? declaration.flags : declaration.flags + 'g');

export type Term = { term: string; positions: number[]; groups?: Record<string, string> };

/**
 * Bind a declaration to a seed. Every unique unit the declaration admits is a
 * term, indexed by the positions where it occurs in the seed.
 *   enumeration — the terms by first position (the seed's own order)
 *   cascade     — the terms by their bytes (the ASCII order)
 *   shape       — shape[n] = how many terms have length n: the polynomial
 */
export function resolve(declaration: RegExp, seed: Seed) {
  const s = text(seed);
  const found = new Map<string, Term>();
  for (const m of s.matchAll(global(declaration))) {
    if (m[0] === '') continue;
    const t = found.get(m[0]);
    if (t) t.positions.push(m.index!);
    else found.set(m[0], { term: m[0], positions: [m.index!], ...(m.groups ? { groups: { ...m.groups } } : {}) });
  }
  const enumeration = [...found.values()];
  const cascade = [...enumeration].sort((a, b) => (a.term < b.term ? -1 : a.term > b.term ? 1 : 0));
  const shape: number[] = [];
  for (const { term } of enumeration) shape[term.length] = (shape[term.length] ?? 0) + 1;
  return { enumeration, cascade, shape: Array.from(shape, (c) => c ?? 0) };
}

/**
 * The polynomial a declaration is, over the alphabet a seed supplies:
 * coefficient n = how many strings of length n the declaration admits whole.
 * Exact for a bounded declaration (no * or +) when maxLength reaches its
 * longest string; with * or + it is the start of a series, not a polynomial.
 */
export function polynomial(declaration: RegExp, seed: Seed, maxLength: number): number[] {
  const alphabet = [...new Set(text(seed))];
  const whole = new RegExp(`^(?:${declaration.source})$`, declaration.flags.replace('g', ''));
  const out: number[] = [];
  let layer = [''];
  for (let n = 0; n <= maxLength; n++) {
    out.push(layer.filter((w) => whole.test(w)).length);
    layer = layer.flatMap((w) => alphabet.map((c) => w + c));
  }
  return out;
}
