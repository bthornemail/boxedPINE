// THE EXCHANGE: Atomics.compareExchange(svg, 60 ^ frame, 127, 63)
//
// The author, 2026-10-13, of a character's two Hasse diagrams, XOR the read
// state and XNOR the write state, "one is XOR, one is XNOR, so complement";
// "do the Atomics.compareExchange(svg, 60 animation frame, ...)", "and the
// other do [it the other way]", "make it 60 XOR animation frame", and "the
// proofs say 63 and 127": as proofs I-133 and I-141, the SVG's state is 128
// bytes (0-127) filled with 127 (0x7F, DEL), and the exchange is 127 for 63
// (0x3F). 127 XOR 63 is 0x40: one bit trades. On animation frame f the
// exchange works at index 60 ^ f; XOR with 60 is one-to-one on 0-127, so in
// 128 frames every byte is exchanged once (frame 0 at byte 60, frame 60 at
// byte 0). Frames 0-127 are the XOR file's, compareExchange(svg, 60 ^ f, 127,
// 63), read then write; frames 128-255 the XNOR file's, the other way,
// compareExchange(svg, 60 ^ f, 63, 127). Reading is the compare, writing the
// exchange: a byte something else wrote first is read and left.
//
// And "we should be able to Proxy or Reflect a Catch for an animation frame to
// transfer control of the index to Atomics": frameGate wraps the state in a
// Proxy (rosetta/src/grammar/interface.ts, the interface carrier). Assigning
// gate.frame = n is the hand-over: the set trap performs the write with
// Reflect, then runs the exchange at 60 ^ n inside Catch, so the outcome comes
// back as a value, { ok, value } or { ok: false, error }, never as a throw.
//
// And the reset: "we can set the reset to animation frame to auto restore a
// state using a Proxy and Reflect at the uncanny Catch 22 index". The gate
// keeps the state's literal, the state as it stood when the gate was made.
// When the index handed over is 22 (frame 42 in each half: 60 XOR 22 = 42),
// the trap does not exchange: it restores every byte from the literal, and
// the outcome counts the bytes it put back (the scrub, I-190: the state XOR
// the literal, byte by byte). By frame 42, frames 0-41 have written 42 bytes.
import { DEFAULT_INTERFACE, type CatchResult, type KernelInterface } from '../../rosetta/src/grammar/interface.ts';

export const STATE_BYTES = 128, BASE = 60, READ = 127, WRITE = 63;

/** Each file's exchange: [expected, replacement]. */
export const EXCHANGES = { Hasse_XOR: [READ, WRITE], Hasse_XNOR: [WRITE, READ] } as const;
export type HasseFile = keyof typeof EXCHANGES;
export type Exchanged = { index: number; read: number; file: HasseFile };

/** The SVG's state, 128 bytes of 127 (I-133): shared when the page may share memory, otherwise plain (compareExchange works on both). */
export function newState(): Uint8Array {
  const buffer = typeof SharedArrayBuffer === 'function' ? new SharedArrayBuffer(STATE_BYTES) : new ArrayBuffer(STATE_BYTES);
  const state = new Uint8Array(buffer);
  for (let i = 0; i < STATE_BYTES; i++) Atomics.store(state, i, READ);
  return state;
}

/** The byte frame f works on: 60 XOR f, within 0-127. */
export const indexOf = (frame: number) => BASE ^ (frame & 127);

/** Whose exchange frame f is: the XOR file's in the first 128 frames of each 256, the XNOR file's in the second. */
export const fileOf = (frame: number): HasseFile => ((frame & 128) === 0 ? 'Hasse_XOR' : 'Hasse_XNOR');

/** One animation frame's exchange. */
export function tick(state: Uint8Array, frame: number): Exchanged {
  const file = fileOf(frame), index = indexOf(frame);
  return { index, read: Atomics.compareExchange(state, index, ...EXCHANGES[file]), file };
}

/** The bytes now written (63). */
export const written = (state: Uint8Array) => state.reduce((n, b) => n + (b === WRITE ? 1 : 0), 0);

/** Which Hasse file a byte shows. */
export const hasseFor = (value: number): HasseFile => (value === WRITE ? 'Hasse_XNOR' : 'Hasse_XOR');

export const CATCH22 = 22;
export type Restored = { index: number; restored: number };
export type FrameGate = { frame: number; catchAt: number; readonly last: CatchResult<Exchanged | Restored> | null };

/** Put the literal back: every byte that differs from it (state XOR literal not 0), counted. */
export function restore(state: Uint8Array, literal: Uint8Array): number {
  let n = 0;
  for (let i = 0; i < state.length; i++) if ((Atomics.load(state, i) ^ literal[i]!) !== 0) { Atomics.store(state, i, literal[i]!); n++; }
  return n;
}

/** The hand-over: gate.frame = n gives the index to Atomics (or, at the reset's index, 22 unless CATCH n moved it, restores the literal); gate.last is the Catch's outcome. */
export function frameGate(state: Uint8Array, k: KernelInterface = DEFAULT_INTERFACE, exchange: (s: Uint8Array, f: number) => Exchanged = tick): FrameGate {
  const literal = Uint8Array.from(state);
  const target = { frame: -1, catchAt: CATCH22, last: null as CatchResult<Exchanged | Restored> | null };
  return new k.Proxy(target, {
    set(t, key, value, receiver) {
      if (key === 'catchAt') return Number.isInteger(value) && value >= 0 && value < STATE_BYTES && k.Reflect.set(t, key, value, receiver); // CATCH n
      if (key !== 'frame') return false; // only the frame and the reset's index are handed over; last is the gate's to write
      const ok = k.Reflect.set(t, key, value, receiver);
      const frame = value as number;
      t.last = k.catch((): Exchanged | Restored => (indexOf(frame) === t.catchAt ? { index: t.catchAt, restored: restore(state, literal) } : exchange(state, frame)));
      return ok;
    },
  }) as FrameGate;
}
