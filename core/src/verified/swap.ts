// THE SWAPS — PERMUTATION, NOT MUTATION
//
// The delta law's rotations were replaced by swap16, swap32 and swap64
// (author, DeepSeek3 lines 42400–44719). On an 8-byte group they move
// byte j to:
//
//   swap16 → j ⊕ 1   (XOR)
//   swap32 → j ⊕ 3   (XOR)
//   swap64 → j ⊕ 7   (XNOR: every bit of the index flipped)
//
// Node's Buffer.swapN() reorders the buffer IN PLACE and returns the same
// object, so calling it twice undoes it. These functions always work on a
// copy and leave the input untouched.
//
// Verified 2026-10-07 (wiki: OPEN-00 Contradiction Register #48).

/** The index each swap XORs into a byte position. */
export const SWAP_MASK = { swap16: 1, swap32: 3, swap64: 7 } as const;
export type SwapName = keyof typeof SWAP_MASK;

/** Return a new array with byte j moved to j ⊕ mask (within each 8-byte group). */
export function permute(bytes: Uint8Array, mask: number): Uint8Array {
  if (bytes.length % 8 !== 0) throw new RangeError('length must be a multiple of 8');
  const out = new Uint8Array(bytes.length);
  for (let j = 0; j < bytes.length; j++) out[j] = bytes[j ^ mask]!;
  return out;
}

export const swap16 = (bytes: Uint8Array) => permute(bytes, SWAP_MASK.swap16);
export const swap32 = (bytes: Uint8Array) => permute(bytes, SWAP_MASK.swap32);
export const swap64 = (bytes: Uint8Array) => permute(bytes, SWAP_MASK.swap64);

/** Byte-by-byte XOR of two equal-length arrays. */
export function xorBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  if (a.length !== b.length) throw new RangeError('lengths differ');
  return a.map((v, i) => v ^ b[i]!);
}

/**
 * The swap delta: swap16(x) ⊕ swap32(x) ⊕ swap64(x) ⊕ carry.
 * Verified: without the carry it is its own inverse, and with a carry
 * it returns to its start after 4 steps (the block period).
 */
export function swapDelta(x: Uint8Array, carry: Uint8Array): Uint8Array {
  return xorBytes(xorBytes(xorBytes(swap16(x), swap32(x)), swap64(x)), carry);
}
