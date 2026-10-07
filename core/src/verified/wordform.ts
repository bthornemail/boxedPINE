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

// THE TWO POLES — 60 ⊕ 64 AND 60 ⊕ 128
//
// A byte is a coordinate in a 16 × 16 table: row = high nibble, column =
// low nibble. Rows 0–7 are the lower 8 indices (local), rows 8–15 the
// higher 8 (shared) (wiki: SRC-01a, "16 indices (0–7 local … 8–15 shared)").
// The author: 60 ⊕ 64 is the reading for the lower 8 indices and 60 ⊕ 128
// for the higher; these are the root relation's two poles {c − r, c + r}
// (_archive/_deprecated/clock.md).
//
//   60       = 0x3C   row 3,  column 12
//   60 ⊕ 64  = 0x7C   row 7,  column 12   (lower 8)
//   60 ⊕ 128 = 0xBC   row 11, column 12   (higher 8)
//   60 ⊕ 192 = 0xFC   row 15, column 12
//
// The column never moves; it is the diagonal 12. The four rows are the
// four-block family 3 ⊕ {0, 4, 8, 12}, the two poles' rows XOR to the
// diagonal (7 ⊕ 11 = 12), and all four readings XOR to 0.
// Verified 2026-10-07 (wiki: OPEN-01 Open Questions #18).

/** Row (high nibble) and column (low nibble) of a byte in the 16 × 16 table. */
export function coordinate(byte: number): { row: number; column: number } {
  return { row: (byte >> 4) & 0xf, column: byte & 0xf };
}

/** The two poles of 60: the lower-8 reading (⊕ 64) and the higher-8 reading (⊕ 128). */
export const POLES = { lower: 60 ^ 64, higher: 60 ^ 128 } as const;

/** 60 read in each of the four row quadrants: ⊕ 0, 64, 128, 192. */
export function quadrantReadings(index = 60): number[] {
  return [0, 64, 128, 192].map((t) => index ^ t);
}

// BASE36 FROM THE BLOCK BITS
//
// The bits that move 60 between blocks also separate the characters:
//   bit 128 (60 ⊕ 128)  outside 7-bit ASCII vs inside
//   bit 64  (60 ⊕ 64)   among alphanumerics: clear = the 10 digits, set = the 52 letters
//   bit 32  (e ⊕ E)     case; folding it leaves 26 letters
// 10 + 26 = 36: the base36 alphabet is cut out by these three bits.
// Verified 2026-10-07 (wiki: SPEC-36 The Literal Separation).

/** Which side of each separating bit a byte falls on. */
export function separation(byte: number) {
  return { beyondAscii: (byte & 128) !== 0, alphaSide: (byte & 64) !== 0, lowerCase: (byte & 32) !== 0 };
}

/** The Polybius gauge diagonals: each XORs to 0 (and sums to 0x1E). */
export const GAUGE = { dPlus: [0x0, 0x5, 0xa, 0xf], dMinus: [0x3, 0x6, 0x9, 0xc] } as const;
