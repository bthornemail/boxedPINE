// THE TREE: SIXTEEN BLOBS, AN INDEX OF INDEX INDICES
//
// The tree classification model (wiki: SPEC-09, "The Tree"). DEFINITION.
// Sixteen files, each one Blob of 65,536 bits (8,192 bytes). An address is
// three indices in one: file (4 bits) · byte (13 bits) · bit (3 bits) = 20 bits.
// Structure confirmed by the author 2026-10-09 ("yes thats correct structrue").
// File i stands for upper-half index 16 + i (SPEC-07 I-16). File 0 is the BOM,
// which holds the Prompt Tree; files 1–15 hold the 15 treemap algorithms
// (rosetta/src/grammar/treemaps.ts).
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

// THE PROMPT TREE (wiki: SPEC-26)
//
// Author, 2026-10-09: 1 (16 of exponent:number) → 2 (8 of exception:reference)
// → 4 (4 of declaration:RegExp) → 8 (2 of definition:string) → 1 (16 = the
// Binary Blob, 65,536 bits max: a meta proof, a meta type, a meta mask).
//
// Every level is the same 16 positions read as nodes × branching. A path picks
// one position per level, one nibble each, so a path is 16 bits: exactly an
// index into the 65,536-bit leaf. DECISION: the exponent is the high nibble
// and the definition the low one, so the path order is the reading order.

/** DECISION: the BOM is the prefix, file 0. The suffix reading would make it file 15. */
export const BOM_FILE = 0;

export const LEVELS = [
  { role: 'exponent', type: 'number', nodes: 1, branching: 16 },
  { role: 'exception', type: 'reference', nodes: 2, branching: 8 },
  { role: 'declaration', type: 'RegExp', nodes: 4, branching: 4 },
  { role: 'definition', type: 'string', nodes: 8, branching: 2 },
] as const;

/** A level's reading of one position: which node, and which child of it. */
export function levelReading(level: number, position: number) {
  if (!(level >= 0 && level < 4 && position >= 0 && position < 16)) {
    throw new RangeError(`no position ${position} at level ${level}`);
  }
  const childBits = 4 - level;
  return { node: position >>> childBits, child: position & ((1 << childBits) - 1) };
}

/** Four positions, one per level, to the 16-bit index of a bit in the leaf. */
export function promptPath(exponent: number, exception: number, declaration: number, definition: number): number {
  const nibbles = [exponent, exception, declaration, definition];
  if (!nibbles.every((n) => n >= 0 && n < 16)) throw new RangeError(`no path ${nibbles.join(' · ')}`);
  return (exponent << 12) | (exception << 8) | (declaration << 4) | definition;
}

/** A 16-bit leaf index back to its four positions. */
export function promptLevels(path: number): [number, number, number, number] {
  if (!(path >= 0 && path < BITS_PER_FILE)) throw new RangeError(`no path ${path}`);
  return [path >>> 12, (path >>> 8) & 15, (path >>> 4) & 15, path & 15];
}

/** Read the leaf of one file through a prompt path: the mask bit for that path. */
export function prompt(tree: Uint8Array[], file: number, path: number): number {
  return readBit(tree, (file << 16) | path);
}
