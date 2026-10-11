// A DEVICE'S MEDIA FRAME AS ONE INDEX
//
// Derived from the W3C Media Queries Level 5 draft (the seed:
// _archive/_inbox/Media Queries Level 5.md) by one declaration, FEATURE below,
// which reads each "Name: … Value: …" pair. The 25 features whose values are
// keywords (not lengths or numbers) pack, in the spec's order, into 36 bits:
// each feature gets the bits its value count needs, and a value's index is its
// place in the spec's list. Two frames XOR to show which features differ.
// wiki: SPEC-07 I-82.
import FEATURES from './assets/media-features.json' with { type: 'json' };

export type Feature = { name: string; values: string[] };
export const MEDIA_FEATURES = FEATURES as Feature[];

/** The declaration that reads the spec: Name, For: @media, then a Value line of bare keywords. */
export const FEATURE = /^Name:\s+([a-z-]+)\nFor:\s+@media\nValue:\s+([a-z0-9-]+(?: \| [a-z0-9-]+)+)$/gm;

/** Derive the keyword features from the spec's text (the seed). */
export function deriveFeatures(spec: string): Feature[] {
  return [...spec.matchAll(FEATURE)].map((m) => ({ name: m[1]!, values: m[2]!.split(' | ') }));
}

/** Bits a feature needs: the smallest b with 1 << b ≥ its value count. */
export const width = (f: Feature) => { let b = 0; while ((1 << b) < f.values.length) b++; return b; };

export const FRAME_BITS = MEDIA_FEATURES.reduce((n, f) => n + width(f), 0);

/** Pack a frame (feature → value) into one index; the first feature is the highest bits. */
export function frameIndex(frame: Record<string, string>, features = MEDIA_FEATURES): bigint {
  let n = 0n;
  for (const f of features) {
    const i = f.values.indexOf(frame[f.name] ?? f.values[0]!);
    if (i < 0) throw new RangeError(`${f.name} has no value ${frame[f.name]}`);
    n = (n << BigInt(width(f))) | BigInt(i);
  }
  return n;
}

/** Read an index back to its frame. */
export function frameOf(index: bigint, features = MEDIA_FEATURES): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of [...features].reverse()) {
    const w = BigInt(width(f));
    out[f.name] = f.values[Number(index & ((1n << w) - 1n))] ?? '?';
    index >>= w;
  }
  return out;
}

/** The features on which two frames differ: the set bits of their XOR, by name. */
export function frameDeviation(a: bigint, b: bigint, features = MEDIA_FEATURES): string[] {
  const fa = frameOf(a, features), fb = frameOf(b, features);
  return features.filter((f) => fa[f.name] !== fb[f.name]).map((f) => f.name);
}

/** In a browser: read the current frame with matchMedia, one query per value. */
export function currentFrame(matchMedia: (q: string) => { matches: boolean }): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of MEDIA_FEATURES) out[f.name] = f.values.find((v) => matchMedia(`(${f.name}: ${v})`).matches) ?? f.values[0]!;
  return out;
}

// ---- The frame in transport, and the port it converges to ----
import { converge, constantIndex } from '../../core/src/verified/fano.ts';

/** The frame as an HTTP/1.1 header value or a WebVTT cue line: 0x and the index. */
export const FRAME_HEADER = 'Omi-Media-Frame';
export const frameText = (index: bigint) => `0x${index.toString(16)}`;
export function parseFrameText(text: string): bigint {
  if (!/^0x[0-9a-f]+$/i.test(text.trim())) throw new RangeError(`not a frame: ${text}`);
  return BigInt(text.trim());
}

/** Fold the frame's bits into 7 by XOR of 7-bit pieces (35 bits = 5 pieces). */
export function fold7(index: bigint): number {
  let m = 0;
  for (let n = index; n; n >>= 7n) m ^= Number(n & 0x7fn);
  return m;
}

/** The port of a frame: its fold, converged to one of the sixteen Fano constants (0 to 15). */
export const framePort = (index: bigint) => constantIndex(converge(fold7(index)));
