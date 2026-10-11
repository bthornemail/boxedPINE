// THE COLOUR GATE: INDICES TO A TERMINAL WITHOUT THE BELL
//
// The author: instead of the bell (60 ⊕ 59 = 7, BEL), move to the colour
// spectrum, \x1b[30m … \x1b[36m with \x1b[0m, "especially for gating kernel
// space". ANSI's foreground colours are SGR 30 + n with n a 3-bit index
// (bit 0 red, bit 1 green, bit 2 blue): 0 is black and 1..7 are the seven Fano
// points, so mixing two colours is XOR and complementary pairs XOR to white (7).
// The gate never lets a control byte reach the terminal: each byte is drawn in
// the colour of its low three bits, and a control byte (below 0x20, or 0x7F) is
// drawn as '·'. The only escapes sent are colours and the closing reset.
// wiki: SPEC-07 I-90.

export const RESET = '\x1b[0m';
export const COLOURS = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'] as const;

/** The SGR foreground escape for a 3-bit colour index. */
export const colour = (n: number) => `\x1b[${30 + (n & 7)}m`;

/** Draw bytes through the gate: colour by low three bits; controls become '·'. */
export function gate(bytes: Iterable<number>): string {
  let out = '';
  for (const b of bytes) {
    const glyph = b < 0x20 || b === 0x7f || b > 0x7e ? '·' : String.fromCharCode(b);
    out += colour(b) + glyph;
  }
  return out + RESET;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // The orbit of 60 through every byte, sixteen to a line, gated.
  for (let row = 0; row < 16; row++) {
    console.log(gate(Array.from({ length: 16 }, (_, k) => 60 ^ ((row << 4) | k))));
  }
}
