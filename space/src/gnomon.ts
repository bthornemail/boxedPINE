// The gnomon of omi-files/polytron/tetra-gnomon-anim.c, as plain data for the
// Agent Commons (space/src/hub.ts). Polytron's K(p,C) = rotl(p,1) ^ rotl(p,3) ^
// rotr(p,2) ^ C with its constitutional constant C = 0x1D: every 16-bit state
// returns after 8 steps, so the gnomon is a dial of 8 points. Step n shows the
// state and its SID, K(state); the SID is the next step's state.
const rotl = (x: number, n: number) => ((x << n) | (x >>> (16 - n))) & 0xffff;
const rotr = (x: number, n: number) => ((x >>> n) | (x << (16 - n))) & 0xffff;
export const K = (p: number, c = 0x1d) => rotl(p, 1) ^ rotl(p, 3) ^ rotr(p, 2) ^ c;

export type GnomonStep = { step: number; state: number; sid: number };

/** The steps from a seed until the state returns (8 for every seed under 0x1D). */
export function gnomon(seed = 0x4242, c = 0x1d): GnomonStep[] {
  const steps: GnomonStep[] = [];
  let state = seed;
  do {
    steps.push({ step: steps.length, state, sid: K(state, c) });
    state = K(state, c);
  } while (state !== seed && steps.length < 0x10000);
  return steps;
}

export const hex16 = (v: number) => `0x${v.toString(16).toUpperCase().padStart(4, '0')}`;
