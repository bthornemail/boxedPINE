// THE TRACE: a 65,536 buffer of each agent's modifications, read from the margins
//
// The author, 2026-10-14: English as a mnemonic language, numbers as indices,
// uppercase letters XOR and XNOR'd into "a 65536 pixel mask of the ASCII
// table in colour gradients of the polynomial order of the constant
// replication in each index"; "with regular expression /A-Z0-9/ xor and xnor
// the /A-Z0-9/g on a 65536 buffer of tracing each agent's modification of
// their 14 Fano plane SVGs and 2 Hasse diagrams from the margins, I think we
// can test this idea". So:
//   - the buffer is 65,536 bytes, one per 16-bit index: a pair (high byte,
//     low byte), a pixel of a 256 x 256 image (y the high byte, x the low);
//   - a tag's pairs are its letters two by two, as its border carries them
//     (border.ts: METATRON = ME TA TR ON);
//   - each file of an agent's set XORs its place (0-15, its border's first
//     cue) into the buffer at the agent's pairs, and the XNOR buffer takes
//     the place's complement (15 - place). 0 ^ 1 ^ ... ^ 15 = 0, so an
//     intact set of 16 traces to all zeros in both; a file whose border was
//     changed leaves nonzero bytes at exactly the pairs it touches;
//   - the order of an index: its period under K with the constant
//     replicated in both bytes, 0x1D1D (1, 2, 4 or 8).
import { readBorder } from './border.ts';
import { K } from './gnomon.ts';

export const TAG_CHARS = /[A-Z0-9]/g;

/** A tag's 16-bit pairs, two letters at a time (a last odd letter paired with 0). */
export function pairsOfTag(tag: string): number[] {
  const c = [...tag].map((ch) => ch.charCodeAt(0)), out: number[] = [];
  for (let i = 0; i < c.length; i += 2) out.push((c[i]! << 8) | (c[i + 1] ?? 0));
  return out;
}

export type Trace = { xor: Uint8Array; xnor: Uint8Array };
export const newTrace = (): Trace => ({ xor: new Uint8Array(65536), xnor: new Uint8Array(65536) });

/** Trace one file: its border's name pairs take its place (XOR) and the place's complement (XNOR). */
export function traceFile(t: Trace, svg: string) {
  const { name, cues } = readBorder(svg);
  const place = cues[0] ?? 0;
  for (const p of pairsOfTag(name)) { t.xor[p]! ^= place; t.xnor[p]! ^= 15 - place; }
}

/** The indices a trace marks: nonzero in either buffer. */
export const marked = (t: Trace) => [...Array(65536).keys()].filter((i) => t.xor[i] || t.xnor[i]);

/** An index's order: its period under K with the constant replicated, 0x1D1D. */
export function orderOf(index: number): number {
  let w = K(index, 0x1d1d), n = 1;
  while (w !== index) { w = K(w, 0x1d1d); n++; }
  return n;
}

/** Where a XOR (or 7-bit XNOR) of two tag characters lands: its ASCII column (0 controls, 1 punctuation and digits, 2 uppercase, 3 lowercase). */
export const columnOf = (byte: number) => (byte & 0x7f) >> 5;
