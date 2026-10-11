// EVERY PREFIX IS A COLOUR CODE
//
// The author: "on all platforms a prefix or escape sequence can be considered
// a color code". A byte's colour atom is its low three bits (I-90, I-91), a pure
// bit operation, so any sequence of bytes reads as a sequence of atoms, and its
// XOR-fold is one atom: the sequence's colour code. Showing the colour is a door
// per platform: SGR 30 + n in a terminal, the same eight names in CSS (all are
// CSS colour keywords). wiki: SPEC-07 I-92.

export const ATOMS = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'] as const;

const bytesOf = (s: string | Uint8Array) => (typeof s === 'string' ? Array.from(s, (c) => c.charCodeAt(0) & 0xff) : [...s]);

/** The atoms of a sequence, one per byte. */
export const atoms = (s: string | Uint8Array) => bytesOf(s).map((b) => b & 7);

/** The sequence's colour code: the XOR of its atoms. */
export const colourCode = (s: string | Uint8Array) => atoms(s).reduce((x, a) => x ^ a, 0);

/** The code drawn in a terminal (SGR) and named for a browser (CSS). */
export const sgr = (atom: number) => `\x1b[${30 + (atom & 7)}m`;
export const css = (atom: number) => ATOMS[atom & 7];

// ---- Status codes on the try / catch / finally plane (SPEC-07 I-96) ----
// try = 001, catch = 010, finally = 100 (OPEN-01 #19); a status code's atom is
// its low three bits. The author: "206 is the built-in throw coordinate to Proxy
// or Reflect the Catch throw at 218 index".
export const ROLES = ['none', 'try', 'catch', 'throw', 'finally', 'Reflect', 'Proxy', 'full path'] as const;

/** A status code's atom and role. */
export const statusRole = (code: number) => ({ atom: code & 7, role: ROLES[code & 7]!, colour: ATOMS[code & 7]! });
