// THE ORGAN'S LINES AS MIDI
//
// The author: Web MIDI as "a ubiquitous low level computation control point of
// convergence for sensory input at these 8 ports". A MIDI status byte is
// 1kkk cccc: three bits of kind (the 8 status nibbles 8-F, 8 of the 16) and
// four of channel (16 lanes); a data byte is 7 bits, the width of a Fano mask.
// The organ's lines are ASCII, every byte below 0x80, so a line rides unchanged
// as SysEx under 0x7D, the maker ID MIDI keeps for non-commercial use. A
// reflection also rides as one Control Change, readable without SysEx
// permission. The bridge is repl/native/organ-midi.c. wiki: SPEC-07 I-104.
import { parseReflect } from './organ.ts';

export const MAKER = 0x7d;
export const ORGAN_PORT = 'omi organ';

/** The 8 status kinds: a status byte's three kind bits, 8 of the 16 nibbles. */
export const statusKind = (status: number) => (status >> 4) & 7;
export const statusChannel = (status: number) => status & 15;
export const isStatus = (byte: number) => (byte & 0x80) !== 0;

/** A line as SysEx: F0 7D <line> F7. */
export function lineToSysex(line: string): Uint8Array {
  const body = [...line].map((c) => c.charCodeAt(0) & 0x7f);
  return Uint8Array.from([0xf0, MAKER, ...body, 0xf7]);
}

/** SysEx back to its line; null if it is not this maker's. */
export function sysexToLine(bytes: ArrayLike<number>): string | null {
  const n = bytes.length;
  if (n < 3 || bytes[0] !== 0xf0 || bytes[1] !== MAKER || bytes[n - 1] !== 0xf7) return null;
  let s = '';
  for (let i = 2; i < n - 1; i++) s += String.fromCharCode(bytes[i]! & 0x7f);
  return s;
}

/** A reflect line as Control Change: channel = tick & 15, controller = parity, value = pole << 6 | (dev != 0). */
export function reflectToCC(line: string): Uint8Array | null {
  const r = parseReflect(line);
  if (!r || r.parity > 0x7f) return null;
  return Uint8Array.from([0xb0 | (r.count & 15), r.parity, (r.pole << 6) | (r.dev ? 1 : 0)]);
}

/** A Control Change back to what it carries. */
export function ccToReflect(bytes: ArrayLike<number>): { channel: number; parity: number; pole: number; deviated: boolean } | null {
  if (bytes.length !== 3 || (bytes[0]! & 0xf0) !== 0xb0) return null;
  return { channel: bytes[0]! & 15, parity: bytes[1]!, pole: (bytes[2]! >> 6) & 1, deviated: (bytes[2]! & 1) === 1 };
}
