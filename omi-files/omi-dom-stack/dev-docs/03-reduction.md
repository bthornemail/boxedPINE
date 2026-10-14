# 03 — The reduction: XOR, transistors, BQF, cyclic numbers, 3!

This document captures *why* the whole stack reduces to XOR-only, and the
specific numeric jewels the user discovered along the way. Numbers get marked
[verified] or [story] — never mix the two.

## XOR is the primitive

| a | b | a ^ b |
|---|---|-------|
| 0 | 0 | 0     |
| 0 | 1 | 1     |
| 1 | 0 | 1     |
| 1 | 1 | 0     |

- Commutative, associative, self-inverse: `a ^ b ^ b == a`.
- **XOR *is* Hamming distance when we count the set bits:**
  `distance(a, b) = popcount(a ^ b)`.
  XOR gives you *positions apart* directly — no multiplication, no tables, no
  references. That is why "the Hamming distance is what we are tracking": it is
  the pinch point of the Fano plane, and ASCII was built to place glyph classes
  at tuned bit distances (next doc).

## Hamming-distance facts (measured, 2026)

Run: `node /tmp/opencode/hamming-verify.js`

| Claim | Result |
|-------|--------|
| 7 Fano points (non-zero 3-bit) distances | {d=1: 9 pairs, d=2: 9, d=3: 3} — **max is 3**, not 2 |
| Antipodal (complement) pairs at d=3 | {(1,6), (2,5), (3,4)} |
| Fano lines = Steiner triples with XOR 0 | 7 lines, every line XORs to 0 — **true** |
| Digits 0x30–0x39 low nibble = BCD | **true** (`0x30+i` → low 4 bits = i) |
| Consecutive digits Hamming distance 1 | **false at 7→8** (0111→1000 nibble carry, d=4); true everywhere else |
| Uppercase↔lowercase = bit-5 flip | **true**, exactly 1 bit (`0x41^0x61 == 0x20`) |
| Faces 0x1C–0x1F pairwise | {d=1: 4 pairs, d=2: 2}; XOR of all four = **0** |
| Face 0x1F → space 0x20 distance | **6 bits** — the hinge is positional, not Hamming-adjacent |
| Time-critical control codes | min pairwise d=1, histogram {1:7,2:12,3:8,4:1} — "max separation" claim is overstated |
| 13 canonical masks net XOR | **0x20 = space** (verified again) |
| popcount examples | BOOT0↔USER = 2; digit0↔digit9 = 2; A↔Z = 4 |
- **Every** gate can be built from XOR + one constant (SPF expansion): for
  example `and(a,b) = a ^ (a ^ b) ^ b` — i.e. the whole boolean algebra is a
  function of XOR and the fixed identity. This is the "reduction to XOR" claim.
- Four XOR realizations exist physically [verified hardware]: **5T, 6T, 8T,
  10T** (transistors) built on breadboards (Cody Wabiszewski, 2024-07, 2N2222 /
  2N3904). The four faces are named after these four.

## The four transistor-XORs ↔ the four faces

| Transistor count | Face    | Used as |
|------------------|---------|---------|
| 5T  (3-transistor/2-diode-ish) | BOOT0  | bind  |
| 6T  | BOOT1  | apply |
| 8T  | SECURE | eval  |
| 10T | USER   | digest|

## The BQF (binary quadratic form)

```
BQF(x, y) = 60x² + 16xy + 4y²
```

- This is the closed-form polynomial the transmit path is said to reduce to
  [story per notes; arithmetic verified as a polynomial identity only].
- Related jewels the user found:
  - `60, 16, 4` — from 60×x² + (the 16 from 4×4 grid) + (4 axes).
  - **33600** [arithmetic verified]: 60×560 = 70×480 = 33600; 33600/44100 = 16/21.
  - **44100** = 44.1kHz, the CD audio master rate (a real standard; that part is true).
  - The "real-world 33600 crossover" claim is [story/unsubstantiated] — it is not
    an audio standard rate. Keep 33600 as a derived marker, not a fact.

## Cyclic numbers

- **1/7 = 0.142857…** — cyclic number 142857; 7 is Mersenne-adjacent; its six
  multiples are rotations of itself. 1 ⟷ 6, and 3! = 6.
- **1/73 = 0.01369863…** — repeating, used in RFC/DHCP lore.
- Both 7 and 73 are "Mersenne-adjacent" primes (7 = 2³−1, 73 = 8⋅9+1). The
  user's story: the pipeline is *deterministic* because repeated XOR of a state
  with a fixed mask cycles with a period that these numbers describe [story,
  unverified as a *system* claim — though `applyDeltaLaw` does roll with period
  8 [verified]].

## The factorial / binary ladders

- **Factorial ladder:** 0! 1! 2! 3! 4! 5! 6! 7! = 1 1 2 6 24 120 720 5040.
  3! = 6 — the six orderings (the "active 3! of any 3").
- **Binary ladder:** 2² 2³ … 2¹⁶ = 4 … 65536; two 16-bit words make the base.

## Leibniz π, as told

π = 4·(1 − 1/3 + 1/5 − 1/7 + …) — the alternating-sign series. The user reads
this as "the 0 of the denominator" / the pinch point: as the terms alternate
sign, the series *closes* on π, "the fold that is never zero but converges".
Story, kept as narrative in the wiki.

## The baseline invariant: 3! = 6

Six orderings of bind/apply/eval = the six lines of the Fano triangle around
the central dot. Everything spatial in this project is *positional* — six
readings of a triple, not one numeric reading. That is the "leave interpretation
to the user" idea made structural.

### A note on DeepSeek's Fano statement

DeepSeek asserted the 7 Fano points have "every distance 1 or 2, maximum 2." We
measured: **{d=1: 9, d=2: 9, d=3: 3}** — maximum is **3** (antipodal/complement
pairs (1,6),(2,5),(3,4)). When transcribing the insight, keep the measured
histogram, not the LLM's rounding. See [08-ascii-hamming.md](08-ascii-hamming.md).

Read on → [04-place-value-atomic.md](04-place-value-atomic.md).