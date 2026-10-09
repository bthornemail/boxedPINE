// THE PERIODS OF 1/7 AND 1/73, AND THE LENS
//
// The author's Axiom of Direction (wiki: SPEC-05, "The Axiom of Direction"):
// the linear sequencing of causality of order, from the interaction of the
// 1/7 and 1/73 periodicity with the two-prime-gap sequencing, through the
// lens of 60 ⊕ offset, reflecting upon a prompt.
//
// This file only derives the numbers in it (SPEC-07 I-57, I-58). Like
// isPrime in metron.ts, it computes on values to produce evidence.

/** How many digits 1/p repeats over when written in `base` (the order of base mod p). */
export function period(base: number, p: number): number | null {
  if (base % p === 0) return null;
  let x = base % p;
  let k = 1;
  while (x !== 1) { x = (x * base) % p; k++; }
  return k;
}

/** The two prime gaps, alternating in the sextuplets: {5,7,11,13,17,19} steps 2,4,2,4,2. */
export const GAPS = [2, 4] as const;

/** The byte offsets m for which 1/7 and 1/73, written in base 60 ⊕ m, repeat over 6 and 8 digits. */
export function lensesKeepingPeriods(): number[] {
  const out: number[] = [];
  for (let m = 0; m < 256; m++) {
    const base = 60 ^ m;
    if (base > 1 && period(base, 7) === 6 && period(base, 73) === 8) out.push(m);
  }
  return out;
}
