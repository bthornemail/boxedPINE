// Dominoes: the extended slide rule as a board. The author, 2026-11-04: "ye lets make th xtened version with a drag
// and drop dominoes like infinite canvas game where we can bind lexeme paths to game proto cues narrativess", after
// "with the slide_rule.html the ageean needs to cycle theough all 5 charrtctert sets to make the repetend directive a
// command i historiclly refered to this as the block design mchanism" (unbound global.vtt, block-design-mechanism).
//
// Two kinds of tile, both derived, nothing assigned:
//   a repetend's dominoes: the digits of 1/q in a base, two to a domino (the author's 0.05..88...23..52...94..11...
//     76..47, 1/17 in base 100); digit i is written in Aegean set i mod 5, the five sets of nine (ONE, TEN, ONE
//     HUNDRED, ONE THOUSAND, TEN THOUSAND), zero having no sign;
//   a lexeme's dominoes: its UTF-8 bytes, a byte a domino of two nibbles (the ququarts' shape, high and low), its
//     face the 8-dot Braille cell U+2800 + byte.
// A path is the order the tiles are laid; it is read as a WebVTT track, one cue a domino, a second a cue (the
// record's convention), so the portal can tell every room its cues. A path's parity is all its halves XORed: for a
// tag's letters it is the gate's nibble (rosetta tagParity), the port the tag must arrive on.

export type Half = number;
export type Tile = { kind: 'repetend' | 'lexeme'; halves: [Half, Half]; faces: [string, string]; braille?: string; from: string; k: number };

/** The five Aegean sets of nine, by their first sign: ONE, TEN, ONE HUNDRED, ONE THOUSAND, TEN THOUSAND. */
export const AEGEAN_SETS = [0x10107, 0x10110, 0x10119, 0x10122, 0x1012b] as const;

/** Digit d (0..9) at place i: its sign in set i mod 5; zero has none, written as a middle dot. */
export function aegeanOf(d: number, i: number): string {
  if (d === 0) return '·';
  if (d > 9) return d.toString(36).toUpperCase();
  return String.fromCodePoint(AEGEAN_SETS[i % 5]! + d - 1);
}

/** 1/q in base b by long division: the digits before the repetend and the repetend itself. */
export function repetendOf(q: number, b = 10): { pre: number[]; digits: number[] } {
  if (!Number.isInteger(q) || q < 2 || !Number.isInteger(b) || b < 2) throw new RangeError('q and b are whole numbers from 2');
  const seen = new Map<number, number>(), out: number[] = [];
  let r = 1 % q;
  while (r !== 0 && !seen.has(r)) { seen.set(r, out.length); r *= b; out.push(Math.floor(r / q)); r %= q; }
  if (r === 0) return { pre: out, digits: [] };
  const at = seen.get(r)!;
  return { pre: out.slice(0, at), digits: out.slice(at) };
}

/** The repetend two digits a domino; an odd period is taken twice so the turn closes on a whole domino. */
export function repetendDominoes(q: number, b = 10): Tile[] {
  const { digits } = repetendOf(q, b);
  const ds = digits.length % 2 ? [...digits, ...digits] : digits;
  const tiles: Tile[] = [];
  for (let i = 0; i < ds.length; i += 2) {
    tiles.push({ kind: 'repetend', halves: [ds[i]!, ds[i + 1]!], faces: [aegeanOf(ds[i]!, i), aegeanOf(ds[i + 1]!, i + 1)], from: `1/${q} base ${b}`, k: i / 2 });
  }
  return tiles;
}

const hex = (n: number) => n.toString(16).toUpperCase();
/** A lexeme's dominoes: each UTF-8 byte two nibbles, its face the 8-dot Braille cell of the byte. */
export function lexemeDominoes(word: string): Tile[] {
  return [...new TextEncoder().encode(word)].map((byte, k) => ({
    kind: 'lexeme', halves: [byte >> 4, byte & 15], faces: [hex(byte >> 4), hex(byte & 15)], braille: String.fromCodePoint(0x2800 + byte), from: word, k,
  }));
}

/** All the halves XORed: a path's nibble (for a tag's letters, rosetta tagParity). */
export const parityOf = (tiles: { halves: [Half, Half] }[]) => tiles.reduce((x, t) => x ^ t.halves[0] ^ t.halves[1], 0);

/** Two dominoes laid end to end join: matched when the touching halves are equal, else the joint shows their XOR. */
export const joint = (a: { halves: [Half, Half] }, b: { halves: [Half, Half] }) => ({ matched: a.halves[1] === b.halves[0], xor: a.halves[1] ^ b.halves[0] });

const stamp = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}.000`;
/** A path as a WebVTT track: one cue a domino, a second each, its id the label and the place. */
export function vttOf(path: Tile[], label = 'path'): string {
  const id = label.replace(/[^A-Za-z0-9_-]+/g, '-') || 'path';
  const cues = path.map((t, k) => {
    const text = `${t.from} ${t.k + 1}: ${t.faces[0]}|${t.faces[1]}${t.braille ? ` ${t.braille}` : ''}`.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `${id}-${k + 1}\n${stamp(k)} --> ${stamp(k + 1)}\n${text}`;
  });
  return `WEBVTT - ${label}\n\n${cues.join('\n\n')}\n`;
}
