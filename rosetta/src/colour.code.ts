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
