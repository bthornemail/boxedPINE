// THE DISTINGUISHED TRIPLES
//
// The octonions have 7 distinguished triples, the sedenions 35, the
// trigintaduonions 155 and the 64-ions 651. They are exactly the triples
// {a, b, a ⊕ b} of non-zero indices of 3, 4, 5 and 6 bits.
// The 7 are the Fano plane.
//
// Verified 2026-10-07: all 155 triples listed in core/src/animation.frame.ts
// satisfy a ⊕ b = c (wiki: OPEN-03 Glossary, "distinguished triples").

/** Every triple {a, b, a ⊕ b} of non-zero `width`-bit indices, smallest first. */
export function xorTriples(width: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  const top = 1 << width;
  for (let a = 1; a < top; a++) {
    for (let b = a + 1; b < top; b++) {
      const c = a ^ b;
      if (c > b) out.push([a, b, c]);
    }
  }
  return out;
}
