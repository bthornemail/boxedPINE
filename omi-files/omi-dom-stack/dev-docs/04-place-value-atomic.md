# 04 — Place-value computing and the 0p / 0n atomics

> The goal is not to encode numbers. The goal is to change computing from a
> sign-value model to a **place-value** model, and leave the interpretation of
> data to users.

## Sign-value vs place-value

- **Sign-value** is what mainstream computing does: a byte is a *number* with a
  sign and a magnitude; four bytes "are" an int; bytes "mean" floats.
  Interpretation is baked into the format.
- **Place-value** is what this project does: a glyph occupies a *position*. The
  value is wherever the glyph sits, nothing more. Two datum are compared by
  exchanging positions (XOR); the *meaning* of "how far apart" is left to the
  user.

Corollaries the user insists on:

1. **Nothing mutates.** No operation changes a datum. Everything is a swap or
   exchange — hence XOR (self-inverse) and `Atomics.compareExchange`.
2. **Interpretation is by the user.** The protocol provides positions, folds,
   and discrepancies — not "28.5" or "true/false". Users (or agent code) read
   the fold.

## The one metric the protocol actually tracks: Hamming distance

A `0p` atom is one *position*. A `0n` atom is another position. The only thing
the protocol asks about two datum is:

```
distance(a, b) = popcount(a ^ b)
```

That's it. XOR gives the bit-difference; popcount converts it to a count. Both
operations are pure, both are exchange-safe (`a ^ b ^ b == a`), neither needs a
reference table, and neither interprets meaning. **The ratio 0n/0p (or 0p/0n)
is what the user reads** from that distance — the protocol never computes the
ratio; it just folds positions apart.

> This is why the user, after reading Wikipedia, said "ASCII was made to do
> this": every landmark of ASCII is a *bit-distance decision*, not a meaning
> decision. Control codes were placed 0x00–0x1F with the transmission-critical
> ones spread out; digits sit at 011 + BCD (low nibble is the digit); lowercase
> is exactly one bit (bit 5) from uppercase; space 0x20 comes before all
> graphics so sorting is trivial. The Hamming distance is the pinch point of
> the Fano plane: positions at distance 0 are the same datum, distances 1–3 are
> the lattice spacing, and the fold to zero is the coincidence of positions.

## The user character encoding: 72 seats on the tangent axes

The user-facing glyph alphabet for declaring rules/facts/clauses is **72 seats**,
not 62 (correction, 2026-09-26: "62 is wrong. it's 72 — the high and low numbers
and the high and low letters. they are orthogonal tangent axes of the 0x0000").

```
              high side (+1 tangent)
                     │
        high letters │ high numbers
        A B C … Z    │ 0? 1? …
   ──────────────────┼─────────────────  low side (−1 tangent)   ← orthogonal
        low  letters │ low  numbers
        a b c … z    │ 0? 1? …
                     │
```

Arithmetic:
- **20 numeric seats** — the 10 digits (0–9) each with a *high* seat and a
  *low* seat (10 × 2).
- **52 letter seats** — the 26 letters each with *uppercase* (high) and
  *lowercase* (low) seats (26 × 2; ASCII's lowercase is exactly one bit, bit 5,
  from uppercase — the "low" half of the letter pair).
- **20 + 52 = 72** — the doubled base-36: the Base-36 Signed Quadrant Block
  Matrix (4×9 = 36 glyphs) extended by signed polarity (high/low), 2 × 36 = 72.

Why "orthogonal tangent axes of the 0x0000": at the pinch point, two tangent
directions cross orthogonally — one axis carries numbers (high/low), the other
carries letters (high/low). Every glyph is a *position on a tangent*, never a
magnitude.

So the seat set is 72. When a *written atom* is composed, the user may write any
of the 72 seats; the compact form the regex `[0-9A-Za-z]` matches only handles
62 of them in one pass — the regex is a writing convenience, the system is 72.

## The atomic literal: `0p` and `0n`

Two place-value scalar types bridge the value↔position duality:

- **0p** — the *position* scalar: "the 0th place of position", the bridge
  between the sign-value of BigInt and the place-value of Float.
- **0n** — the *number* scalar: the value-side partner.

They are *duals*: 0p is where a thing sits, 0n is the thing. Their XOR is the
pinch point — the dot between them is literally the decimal that divides
position from number.

### 0p and 0n are integers — indices (correction, 2026-09-26)

The user's precise model: **0p and 0n are integers — indices** into a buffer,
array, string, or anything else that can be indexed and XOR'd, "like a Latin
square". They are *not* wrapped ratios, *not* sign-value numbers, *not* a
special numeric format. They are offsets.

- The blackboard is the shared indexable thing; the reference anchor is
  **`Buffer.offset(0)`** — 0p and 0n sit at the base of the shared buffer.
- Their "3!" is expressed *with the indices of the target*: indexing the buffer
  at 0p and at 0n, then XORing the two readings, is the Latin-square movement
  that reveals the discrepancy.
- Every "nD" the user speaks of ("−5D → 12D") is the **dimension of the index**
  — the rank of the index (how many sub-indices a single index decomposes
  into), not a count of memory layers. A 1D index is a scalar offset; a 2D
  index is a (row, column) pair into the Latin square; and so on.

## The canonical atomic grammar

A "port" — an address describing where a datum sits — is written like this:

```
[0p | 0n]  [field]  [· | ∅]  [field]  [0n | 0p]
```

or, in the regex the user gave (the *state of truth* as of this writing):

```
/^[pn][0-9A-Za-z]\.?[0-9A-Za-z][np]$/
```

### What each part is

| part | seat | meaning |
|------|------|---------|
| leading scalar | `[pn]` | p = position, n = number |
| first field | `[0-9A-Za-z]` | one seat of the 72 (written 62-in-class for brevity) |
| dot | `\.?` | the pinch point — **optional** |
| second field | `[0-9A-Za-z]` | one seat |
| trailing scalar | `[np]` | p or n, the far side |

Examples that match:
```
pA.5n    pA5n     nZ.9p    nQ7n     p0.0n
```
Examples that do NOT match:
```
pAd5n    (5 fields, no dot — must be 4 or 5 with the dot)
0pA5n    (leading 0 is outside the grammar; bare `0p` is the type name, not the atom)
px.yz    (3 glyphs, wrong arity)
```

## What the dot does

The dot is the **pinch point** — the Fano 7th point — and it is optional:
- `pA.5n` = "position A, five" — a declared pair separated by the point.
- `pA5n`  = "position A and five", the same pair with the point folded away.
- When both fields are digits (`p0.9n`, `n3.7p`) the atom *reads like* a decimal
  (`0.9`, `3.7`) — that is a user reading, *not* an arithmetic guarantee. The
  protocol stores fields; it does not evaluate decimals.

## n/p vs p/n — chirality of reading

The `[np]` pairing sets the **reading direction**:
- `p…n` reads "position first, then number" — *at* a place there is a value.
- `n…p` reads "number first, then position" — a value *settles into* a place.
- When you XOR a `p…n` atom against an `n…p` atom you describe the
  *discrepancy between two datum* — the exchange reveals how far apart the two
  data sit, without anyone having to agree on what the glyphs "mean".

This is the "super sed": a text script that *addresses* two datum and XORs their
ports to show the delta. (like `sed` addresses lines; here addresses datum.)

## The full 0-prepended grammar (for declared types)

The richer forms from the spec-in-progress — all must pass through the same
fold:
```
boundary  0[pn][boxd]0[np]        e.g. 0p0x0n, 0nb0p
declared  0[pn][\d][boxd][\d]0[np]   e.g. 0p1x20n
delimited 0[pn][\d][separator]0[boxd][separator][\d]0[np]
           e.g. 0p1_0x_20n, 0p1.0x.20n, 0p1/0d_20n
decimal   [np]\.[\d]\.[np]        e.g. p.6.n, n.3.p
```
(Multiple separator spellings were verified to match — `_`, `.`, `/`.)

## What gets stored, not computed

- Positions (0..71 per seat: 20 numeric + 52 letter).
- The dot bit (present/absent).
- The scalar pair (p/n polarity at each end).
- The word: a bijective 16-bit packing (front 1 · first-field 6 · dot 1 · second-field 6 · back 1 = 15 bits → fits 16-bit word), kept as a word, **never evaluated into a number the protocol interprets**.

Constraints recap (from the verification session):
- alphabet is 72 (20 numeric + 52 letter seats), not 62/64
- the regex `[0-9A-Za-z]` is a *writing* class; the system is 72
- `decodeBase36` with the wrong offset collided (`a`→10 = `A`); correct offset is 61 for lowercase
- `pAd5n` fails its own regex; the true example is `pA.5n` → 5/10 → gcd → 1/2
- byte order: none assumed; reads are whole-word via DataView (endian-safe). `Int8Array[0]` is the *low* byte on little-endian — any code that claims "bytes[0] is high" is wrong there.

## Validation: no truth/false — only is / isn't, triangulated by expectations

There is no way to validate truth or false. A position either **is** or **isn't**.
But if you know what to look for, you can triangulate with expectations — the
`Atomics.compareExchange` of the **blackboard pattern**:

```js
Atomics.compareExchange(shared, idx, expected, replacement)
// if the cell == expected → it IS → write replacement, return old (the was)
// if the cell != expected → it ISN'T → return what it actually is
```

That returned value is the discrepancy. Two datum on a shared blackboard
("shared data representation" — the one place the type system works, because
only a *shared* position can be expected-and-checked) reveal how far apart they
sit by the exchange returning the actual instead of the expected. This is the
only truth the protocol has — **0 is the only truth** — and it is exactly what
`compareExchange` is: swap if it is, report if it isn't.

## The Fano set of the atom

Seven glyphs where the 7th is the dot:
```
{0p, 0n, 0b, 0o, 0x, 0d, ·}
```
If we make the first index (the 0-index) represent `[np][0-9A-Za-z]\.?[0-9A-Za-z][np]`,
we can factor the n/p or p/n depending on the reading of the `[np]` — and when
both fields are digits it is a float `0-9[.]0-9` *for the user to read*.

## The Fano plane is the 7 non-zero 3-bit words

Measured exactly (see [03-reduction.md](03-reduction.md)):

```
points {1..7} = non-zero 3-bit patterns; distance histogram {1:9, 2:9, 3:3}
```

- The 8th word, `000`, is the **origin** — the diagonal (ruler[0]), the fold.
- The 7 Fano lines are the Steiner triples, and every line XORs to 0 (verified).
- That is the *same* geometry serving the masks: the C0 faces are
  `0x1C ^ 0x1D ^ 0x1E ^ 0x1F === 0`. The "pinch point" is where distances
  collapse — Hamming distance 0 is coincidence, and the fold keeps finding it.

## The "no numbers" rule in one line

The type system never answers "how much". It answers "**where** and *how many
bits apart*." Everything after that is user interpretation.

Read on → [05-layout.md](05-layout.md).