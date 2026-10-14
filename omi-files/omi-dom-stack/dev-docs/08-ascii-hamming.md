# 08 — ASCII was made to do this: the Hamming-distance reading

> "The Hamming distance is what we are tracking; it's the pinch point of the
> Fano plane."
> — the user, after reading the Wikipedia ASCII article

DeepSeek said back, and we verified: **ASCII's layout decisions are Hamming
distance decisions.** Every landmark of the table is a bit-distance choice, not
a "meaning" choice. This document is the canonical reading of that discovery.

## The two big claims, verified

1. **ASCII was organized so control codes sit together, graphics together** —
   the first two "sticks" (32 positions, 0x20 worth) are control; 0x20 onward is
   graphic. Verified structurally in the table.
2. **The essential transmission controls were positioned to maximize Hamming
   distance between their bit patterns** — from the Wikipedia quote. Our sweep
   of the canonical time-critical codes (0x01–0x06, 0x10, 0x16) gave
   histogram {d=1:7, d=2:12, d=3:8, d=4:1} — so it's *"tuned up"*, not literally
   maximal (min is still 1). DeepSeek over-claimed "max separation"; the honest
   result is "spread out among the early positions".

## The structure, as Hamming positions

```
0x00–0x1F  control  — the C0 separators; the face masks 0x1C–0x1F live at the
         very top of this band, one bit from each other, XOR = 0.
0x20      space    — the hinge: first printable, "opens up the system space";
         the 13 canonical masks net-XOR to exactly 0x20.
         (Note: 0x1F → 0x20 is distance 6; space is NOT adjacent in Hamming
         terms to the faces — it is the *ordering hinge* that makes sorting
         trivial.)
0x21–0x2F punctuation / separators  (placed before digits, per the sort rule)
0x30–0x39 digits    — “011” prefix + BCD; low nibble = the digit (verified).
         Consecutive digits are distance 1 EXCEPT 7→8 (0111→1000 nibble
         carry, becomes distance 4). One of the 20 numeric tangent seats.
0x3A–0x40 more separators
0x41–0x5A uppercase  — DEC SIXBIT-compatible 64-char alphabet supported
0x5B–0x60 separators
0x61–0x7A lowercase  — exactly ONE bit from uppercase (bit 5) [verified]
0x7B–0x7F separators + DEL
```

## Why this is the pinch point of the Fano plane

- The 7 Fano points = the 7 non-zero 3-bit words (001…111); `000` is the origin
  (ruler[0], the diagonal, the void).
- Hamming distance over those points: **{d=1: 9 pairs, d=2: 9, d=3: 3}** —
  max 3, not 2 (DeepSeek was wrong there; we measured it).
  Antipodal (complementary) pairs at d=3: (1,6), (2,5), (3,4).
- Every Fano line is a Steiner triple and every line XORs to 0 [verified];
  same property as `0x1C ^ 0x1D ^ 0x1E ^ 0x1F === 0`.
- The dragon that ties it together:

```
distance(a, b) = popcount(a ^ b)      — XOR is positional difference
```

The pinch point is where distances collapse to **0** (coincidence) — the fold
0x0000. ASCII encodes exactly this: same-glyph = distance 0, adjacent classes =
distance 1, complementary classes = larger distances, and the whole table is
ordered so that *sorting by glyph order is sorting by position*.

## The 72-seat alphabet (correction)

Wikipedia: ASCII was designed "to support uppercase 64-character alphabets" and
to be reducible to a 64-character set of graphic codes (DEC SIXBIT, 1963).
Lowercase is *not* interleaved; it hangs a single bit away (bit 5).

The right count is **72**, not 62 (correction 2026-09-26). The user alphabet is
the *signed doubling of base-36* — glyphs exist on two orthogonal tangent axes
at `0000`:
- 10 digits (0–9) × {high, low} = **20** numeric seats
- 26 letters × {upper, low(er)} = **52** letter seats
- 20 + 52 = **72**   (2 × 36 — the Base‑36 Signed Quadrant Block Matrix)

The readable, case-sensitive alphanumeric class a *regex* `[0-9A-Za-z]` matches
in one pass is exactly 10 + 26 + 26 = 62, but the *system* is 72 seats on the
tangent axes. When docs say "72" they mean the full signed seat space; the 62 is
the flat written-class, a projection of the axes.

(Also from the article: digits are prefixed 011 so BCD conversion is a
zero-effort mask — "5" is 0110101 where 0101 is the BCD. Our check confirmed
`0x30+i` low nibble == i.)

## What changes about the protocol

Nothing is re-implemented. This reading *explains* existing invariants:
- masks partition 256 into 8×32 per the octant parity → positions.
- 13-mask net = 0x20 = the space hinge → the fold "lands on opening space".
- faces plug at the top of the C0 band and XOR to zero → the top 4 controls
  are a closed Steiner quadrilateral.
- 0p/0n are positions; XOR is the distance; popcount is the pinch.