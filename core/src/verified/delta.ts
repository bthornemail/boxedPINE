// THE BIT-LEVEL DELTA (the earlier form of the step law)
//
//   delta16(x, c) = rotl(x, 1) ⊕ rotl(x, 3) ⊕ rotr(x, 2) ⊕ c   on 16-bit words
//
// Exact period 8, proved in Coq:
//   omi-files/omi-axioms/coq/04-execution/Delta16HasExactPeriodEight.v
// Superseded by the swap delta (swap.ts), kept because the proof and the
// Haskell reference (omi-files/omi-canvas/src/OMI/Delta.hs) use it.

const rotl16 = (x: number, n: number) => ((x << n) | (x >>> (16 - n))) & 0xffff;
const rotr16 = (x: number, n: number) => rotl16(x, 16 - n);

/** One step of the bit-level delta on a 16-bit word. */
export function delta16(x: number, c: number): number {
  return (rotl16(x, 1) ^ rotl16(x, 3) ^ rotr16(x, 2) ^ c) & 0xffff;
}

/** Apply delta16 `steps` times. */
export function delta16Steps(x: number, c: number, steps: number): number {
  for (let i = 0; i < steps; i++) x = delta16(x, c);
  return x;
}
