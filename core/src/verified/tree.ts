// THE TREE: SIXTEEN BLOBS, AN INDEX OF INDEX INDICES
//
// The tree classification model (wiki: SPEC-09, "The Tree"). DEFINITION.
// Sixteen files, each one Blob of 65,536 bits (8,192 bytes). An address is
// three indices in one: file (4 bits) · byte (13 bits) · bit (3 bits) = 20 bits.
// File i stands for upper-half index 16 + i (SPEC-07 I-16); which tree
// algorithm each file holds is still open.
//
// The model only indexes. The author seeds the bytes, e.g. with fill().

export const FILES = 16;
export const BITS_PER_FILE = 65536;
export const BYTES_PER_FILE = BITS_PER_FILE / 8;
export const TREE_BITS = FILES * BITS_PER_FILE;

export type Address = { file: number; byte: number; bit: number };

/** Three indices to one: file · byte · bit. */
export function address(file: number, byte: number, bit: number): number {
  if (!(file >= 0 && file < FILES && byte >= 0 && byte < BYTES_PER_FILE && bit >= 0 && bit < 8)) {
    throw new RangeError(`no address ${file} · ${byte} · ${bit}`);
  }
  return (file << 16) | (byte << 3) | bit;
}

/** One index to three. */
export function split(index: number): Address {
  if (!(index >= 0 && index < TREE_BITS)) throw new RangeError(`no index ${index}`);
  return { file: index >>> 16, byte: (index >>> 3) & 0x1fff, bit: index & 7 };
}

/** Sixteen empty files, or each filled with seed(file). */
export function makeTree(seed?: (file: number) => number): Uint8Array[] {
  return Array.from({ length: FILES }, (_, file) => new Uint8Array(BYTES_PER_FILE).fill(seed ? seed(file) : 0));
}

/** The bit at an index. DECISION: bit 0 is the byte's lowest bit. */
export function readBit(tree: Uint8Array[], index: number): number {
  const { file, byte, bit } = split(index);
  return (tree[file]![byte]! >>> bit) & 1;
}
