// THE EXCHANGE: Atomics.compareExchange(svg, 60 ^ frame, 128, 64)
//
// The author, 2026-10-13, of a character's two Hasse diagrams, XOR the read
// state and XNOR the write state, "one is XOR, one is XNOR, so complement";
// then "do the Atomics.compareExchange(svg, 60 animation frame, 128, 64)",
// "and the other do 64 then 128", and "make it 60 XOR animation frame". So the
// SVG's state is 64 bytes (0-63), each 128 (0x80, XOR, read) or 64 (0x40,
// XNOR, write), and on animation frame f the exchange works at index 60 ^ f.
// XOR with 60 is one-to-one on 0-63, so in 64 frames every byte is exchanged
// once (frame 0 at byte 60, frame 60 at byte 0). Frames 0-63 are the XOR
// file's: compareExchange(svg, 60 ^ f, 128, 64), read then write; frames
// 64-127 the XNOR file's, the other way: compareExchange(svg, 60 ^ f, 64, 128).
// Reading is the compare, writing the exchange: a byte something else wrote
// first is read and left. A cycle is 128 frames (128 XOR 64 is 0xC0, the two
// bits that trade places).
export const STATE_BYTES = 64, BASE = 60, READ = 128, WRITE = 64;

/** Each file's exchange: [expected, replacement]. */
export const EXCHANGES = { Hasse_XOR: [READ, WRITE], Hasse_XNOR: [WRITE, READ] } as const;

/** The SVG's state, every byte read (128): shared when the page may share memory, otherwise plain (compareExchange works on both). */
export function newState(): Uint8Array {
  const buffer = typeof SharedArrayBuffer === 'function' ? new SharedArrayBuffer(STATE_BYTES) : new ArrayBuffer(STATE_BYTES);
  const state = new Uint8Array(buffer);
  for (let i = 0; i < STATE_BYTES; i++) Atomics.store(state, i, READ);
  return state;
}

/** The byte frame f works on: 60 XOR f, within 0-63. */
export const indexOf = (frame: number) => BASE ^ (frame & 63);

/** One animation frame's exchange: the XOR file's in the first 64 frames of each 128, the XNOR file's in the second. Returns the index and what was read. */
export function tick(state: Uint8Array, frame: number): { index: number; read: number; file: keyof typeof EXCHANGES } {
  const file = (frame & 64) === 0 ? 'Hasse_XOR' : 'Hasse_XNOR';
  const index = indexOf(frame);
  return { index, read: Atomics.compareExchange(state, index, ...EXCHANGES[file]), file };
}

/** How far the state has turned: the bytes now written (64). */
export const written = (state: Uint8Array) => state.reduce((n, b) => n + (b === WRITE ? 1 : 0), 0);

/** Which Hasse file a byte shows. */
export const hasseFor = (value: number) => (value === WRITE ? 'Hasse_XNOR' : 'Hasse_XOR');
