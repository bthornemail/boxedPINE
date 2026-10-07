// LEVEL 1 — ONE WORDFORM, MANY WIDTHS
//
// 12, 60, 124 and 252 are the same index read at different widths:
// every bit set except the lowest two. Each is where the last block of
// four starts in a space of 16, 64, 128 or 256 slots.
//
//   width 4:   12 = 1100        the receipt offset 0x0C
//   width 6:   60 = 111100      the "60 of 64"
//   width 7:  124 = 1111100     60 ⊕ 64
//   width 8:  252 = 11111100    60 ⊕ 192
//
// The Blob is 65,536 bits = 8,192 bytes = 128 buffers of 64 bytes, so each
// of these is an address inside one transportable Blob.
//
// Verified 2026-10-07 (wiki: OPEN-01 Open Questions #13; the reading is the author's).

export const BLOB_BITS = 65536;
export const BLOB_BYTES = BLOB_BITS / 8;      // 8192
export const BUFFER_BYTES = 64;
export const BUFFERS_PER_BLOB = BLOB_BYTES / BUFFER_BYTES; // 128

/** The last-block offset at a given bit width: all ones except the lowest two bits. */
export function lastBlockOffset(width: number): number {
  return ((1 << width) - 1) & ~3;
}

/**
 * The orbit of 60: 60 ⊕ n for n = 0..63.
 * Four descending blocks of four repeat across it: < = > ?, 8 9 : ;, 4 5 6 7, 0 1 2 3 …
 */
export function orbit60(): number[] {
  return Array.from({ length: 64 }, (_, n) => 60 ^ n);
}

/** The complement of an index at a width (the protocol's "negative"). */
export function complement(index: number, width: number): number {
  return index ^ ((1 << width) - 1);
}
