// THE MÊTRON AND THE PRIME CLUSTERS
//
// From the last stretch of the ontology conversation (wiki: SRC-10, lines
// 15219–16487; SPEC-07 I-42 to I-46).
//
// A BigInt64Array is the unassigned carrier. `bind` places the canonical
// coordinates into it. Hexadecimal is always marked: 0x17n is 23, 17n is 17.

/** The fifteen canonical coordinates: 0x00–0x03, 0x05, 0x07, 0x09, 0x0A–0x0F, 0x17, 0x19. */
export const METRON = BigInt64Array.of(
  0x00n, 0x01n, 0x02n, 0x03n, 0x05n, 0x07n, 0x09n,
  0x0an, 0x0bn, 0x0cn, 0x0dn, 0x0en, 0x0fn, 0x17n, 0x19n,
);

/** Assign the coordinates to an unbound carrier. The carrier is copied, never mutated. */
export function bind(unbound: BigInt64Array, metron: BigInt64Array = METRON) {
  if (unbound.length < metron.length) {
    throw new RangeError(`carrier holds ${unbound.length}, the mêtron needs ${metron.length}`);
  }
  const carrier = unbound.slice();
  carrier.set(metron);
  return { carrier, metron: metron.slice() };
}

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

/** The prime quadruplet pattern p, p+2, p+6, p+8: {5,7,11,13} and {11,13,17,19}. */
export const QUADRUPLET = [0, 2, 6, 8] as const;
/** The prime sextuplet pattern p, p+4, p+6, p+10, p+12, p+16: {7,…,23}, {97,…,113}, … */
export const SEXTUPLET = [0, 4, 6, 10, 12, 16] as const;

/** Every start p < limit at which all of p + pattern are prime. */
export function clusters(pattern: readonly number[], limit: number): number[] {
  const out: number[] = [];
  for (let p = 2; p < limit; p++) if (pattern.every((k) => isPrime(p + k))) out.push(p);
  return out;
}

/** The ladder as written in the conversation: rung r gives 210r + {5,7,11,13,17,19}. */
export function ladderAsWritten(rung: number): number[] {
  return [5, 7, 11, 13, 17, 19].map((k) => 210 * rung + k);
}
