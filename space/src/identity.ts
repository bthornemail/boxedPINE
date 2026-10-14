// IDENTITY: Light Garden's universe gate, retrofitted without hashing
//
// omi-files/light-garden/universe-gate/index.html takes a BIP39 mnemonic (12 to
// 24 words of the 2048-word English list), checks it with BIP39's checksum
// (the first bits of sha256(entropy)) and names the universe sha256(entropy).
// The author, 2026-10-13: "I found the old identity generator; we can retrofit
// it and use the updated version in /space, so it's automatic participation in
// blockchains, like for memory and messages", and "the nibble is the parity
// check". So here, with no hash anywhere:
//   - each word is an index, 11 bits; the words are the entropy and its check;
//   - the check is the entropy XOR-folded to the check's width (ENT/32 bits):
//     for 12 words, 4 bits, the XOR of the entropy's 32 nibbles: the nibble
//     parity; for 24 words, 8 bits, the XOR of its bytes. (So these mnemonics
//     are not BIP39 wallets' mnemonics: the check differs.)
//   - the identity is the entropy itself, as /A-Z0-9/ tags: each 32 bits in
//     base 36, at most 7 characters;
//   - the chain is polytron's (tetra-block.h): sid = K(sid, pair), each 16-bit
//     pair of a record stepping it once with the pair as K's constant, from a
//     root of K(the identity's first pair). Every pair counts, not only the
//     first two bytes, so the chain carries the whole record forward.
import { K } from './gnomon.ts';

export const WORD_COUNTS = [12, 15, 18, 21, 24] as const;

/** The entropy XOR-folded to w bits (w = ENT/32): the check. */
export function foldCheck(entropy: Uint8Array): number {
  const w = (entropy.length * 8) / 32;
  let check = 0, acc = 0, n = 0;
  for (const byte of entropy) for (let b = 7; b >= 0; b--) {
    acc = (acc << 1) | ((byte >> b) & 1);
    if (++n === w) { check ^= acc; acc = 0; n = 0; }
  }
  return check;
}

/** The words for an entropy of 16, 20, 24, 28 or 32 bytes. */
export function wordsOf(entropy: Uint8Array, list: string[]): string[] {
  if (![16, 20, 24, 28, 32].includes(entropy.length)) throw new Error('entropy is 16 to 32 bytes, by 4');
  const w = (entropy.length * 8) / 32;
  const bits = [...entropy].map((b) => b.toString(2).padStart(8, '0')).join('') + foldCheck(entropy).toString(2).padStart(w, '0');
  return bits.match(/.{11}/g)!.map((chunk) => list[parseInt(chunk, 2)]!);
}

/** The entropy of a mnemonic, or why not. */
export function entropyOf(words: string[], list: string[]): { entropy: Uint8Array } | { error: string } {
  if (!(WORD_COUNTS as readonly number[]).includes(words.length)) return { error: 'the word count is 12, 15, 18, 21 or 24' };
  const index = new Map(list.map((w, i) => [w, i]));
  const missing = words.find((w) => !index.has(w));
  if (missing) return { error: `not in the list: ${missing}` };
  const bits = words.map((w) => index.get(w)!.toString(2).padStart(11, '0')).join('');
  const ent = (words.length / 3) * 32;
  const entropy = Uint8Array.from(bits.slice(0, ent).match(/.{8}/g)!, (b) => parseInt(b, 2));
  if (parseInt(bits.slice(ent), 2) !== foldCheck(entropy)) return { error: 'the check does not hold' };
  return { entropy };
}

/** The identity: the entropy as /A-Z0-9/ tags, 32 bits each. */
export function tagsOf(entropy: Uint8Array): string[] {
  const tags: string[] = [];
  for (let i = 0; i < entropy.length; i += 4) tags.push((((entropy[i]! << 24) | (entropy[i + 1]! << 16) | (entropy[i + 2]! << 8) | entropy[i + 3]!) >>> 0).toString(36).toUpperCase());
  return tags;
}

/** A new identity: 16 bytes of entropy from the platform's random source. */
export function newEntropy(bytes = 16): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(bytes));
}

/** The 16-bit pairs of a record (UTF-8, a last odd byte paired with 0). */
export function pairsOf(text: string): number[] {
  const b = new TextEncoder().encode(text), pairs: number[] = [];
  for (let i = 0; i < b.length; i += 2) pairs.push((b[i]! << 8) | (b[i + 1] ?? 0));
  return pairs;
}

export type Link = { seq: number; by: string; text: string; sid: number };

/** Polytron's chain for one identity: each record's pairs step it, in order. */
export class Chain {
  readonly by: string;
  readonly root: number;
  sid: number;
  links: Link[] = [];
  constructor(entropy: Uint8Array) {
    this.by = tagsOf(entropy)[0]!;
    this.root = K((entropy[0]! << 8) | entropy[1]!);
    this.sid = this.root;
  }
  add(text: string): Link {
    for (const p of pairsOf(text)) this.sid = K(this.sid, p);
    const link = { seq: this.links.length + 1, by: this.by, text, sid: this.sid };
    this.links.push(link);
    return link;
  }
}

/** Replay a chain from its root: the first link whose sid does not follow, or none. */
export function verifyChain(root: number, links: Link[]): number | null {
  let sid = root;
  for (const l of links) {
    for (const p of pairsOf(l.text)) sid = K(sid, p);
    if (sid !== l.sid) return l.seq;
  }
  return null;
}
