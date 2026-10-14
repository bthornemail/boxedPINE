# OMI-IMO: The Four-Vertex Model

**A structural taxonomy of asymmetric knot encoding**

Version **1.0.0** · License **CC0-1.0** · Status **canonical**

Every operation reduces to **XOR**. Every set is a set of another set.

This document is the source of truth for the `model/` directory tree: a directory
that *is* a language. Folder names carry a radix prefix (`_0` … `_9` with a
`x|b|o|d|n|p` suffix) so that a path states exactly where it sits in the relative
hierarchy before its files define the rest.

The name grammar is the six-prefix literal ladder of §1a: `0x`, `0b`, `0o`, `0d`
are the four radix vertices of the tetrahedron, and `0n`, `0p` are the literal
markers that give the whole ladder its NPN ⇄ PNP character.

---

## 1. The four vertices

A regular tetrahedron has four faces. The protocol encodes the same logical set
four times — once per radix — and the four radix vertices are:

| Vertex | Radix | model/ dir | Role |
|--------|-------|------------|------|
| `0x` | hexadecimal | `model/0x` | nibble / byte truth |
| `0b` | binary | `model/0b` | transistor-level truth |
| `0o` | octal | `model/0o` | 3-bit groupings |
| `0d` | decimal | `model/0d` | the dimension ladder 0→4 |

The centroid of the four faces obeys the same balance law as the boot masks:

```
0x ^ 0b ^ 0o ^ 0d === 0x0000
```

`0d` is the dimension ladder itself — nodes → points → ranges → volumes → knots:

```
model/0d/0-nodes      # vertices, zero measure
model/0d/1-points     # one dimension: coordinates
model/0d/2-ranges     # two dimensions: extents
model/0d/3-volumes    # three dimensions: involution volumes
model/0d/4-knots      # the knots / attractors (see §6)
```

The `+k` directed meta-layers sit at `_1d` (compare + exchange) and `_4d`
(taxonomy), described in §7 and §8.

---

## 1a. The 0n/0p literal ladder

The four radix vertices are only half the syntax. Every literal leads with a
*prefix* — a meta-character that says what the token is before its digits say
how big — and there are six of them, one per permutation of 3!:

| Prefix | Base | model/ dir | Role |
|--------|------|------------|------|
| `0x` | hex (16) | `model/0x` | structural truth |
| `0b` | binary (2) | `model/0b` | parity / incidence |
| `0o` | octal (8) | `model/0o` | base / offset groups |
| `0d` | decimal (10) | `model/0d` | numeric fall-through |
| `0n` | literal marker | `model/0n` | BCD float — sign · exponent · significand |
| `0p` | point marker | `model/0p` | pinch point · branch point · point at-it |

`0d` is the **fall-through switch**: it is the default case that denotes `0n`
and `0p` literals as special meta-characters for spatial interpretation. The two
dialects are mirror images:

```
0n0p0n   spectral interpretation   (N P N)
0p0n0p   spatial interpretation    (P N P)
```

The `N` comes from the literal suffix (`0n`), the `P` from the number-as-point
suffix (`0p`). `0x0011n` is therefore BCD-float form, `0x0011p` is point form —
the same nibbles read once as a numeric float, once as a spatial anchor. Every
row in the ladder has a structural definition and a geometric one, and the two
differ only in the dialect.

### The ladder

The rows are **jump vectors**: each line is a step, the stack is a traversal.
Encapsulation depth `()`, `{}`, `[]`, `<>` is the *polynomial degree* — an
enclosure raises the word-form by one order, and the same literal appearing on
consecutive lines sets the *diagonal exponent*, traversing the binomial /
trinomial distribution into the binary quadratic form `60x² + 16xy + 4y²`.

Binary / octal rungs (0n form):

```
0b0001(/CONSTRAINT/)0o0001n         # degree 1 — 2¹−1
0b0011((/CONSTRAINT/g))0o0002n      # degree 2 — 2²−1
0b0111(((/CONSTRAINT/BOUNDRY/)))0o0003n   # degree 3 — 2³−1
0b1111((((/CONSTRAINT/BOUNDRY/g))))0o0004n   # degree 4 — 2⁴−1
0o0007</Base/>0o0005n               # 8¹−1
0o0077<</BasePerElement>>0o0006n    # 8²−1
0o0777<<</BaseLength/>>>0o0007n     # 8³−1
0o7777<<<</BaseOffset/>>>>0o0008n   # 8⁴−1
```

Hex rungs (0p form — point reads of the same ladder):

```
0x0008[/POINT/]0x0005p              # 8·(16¹−1)/15
0x0088[[/POINT/g]]0x0006p           # 8·(16²−1)/15
0x0888[[[/POINT/LINE/]]]0x0007p     # 8·(16³−1)/15
0x8888[[[[/POINT/LINE/g]]]]0x0008p  # 8·(16⁴−1)/15
```

The compare rungs (0p form) dial the bind–apply–eval–digest face:

```
0x0001{/BIND/}0x0001p
0x0011{{/APPLY/}}0x0002p
0x0111{{{/EVAL/}}}0x0003p
0x1111{{{{/DIGEST/}}}}0x0004p
```

And the binary → octal pairing is the 1/7 cyclic family, carried in octal:

```
0o1111 = 585 = (8⁴ − 1)/7
1/7  = 0.142857  ;  7 × 142857 = 999999
```

### Verified ladder facts

| Identity | Result | Source |
|----------|--------|--------|
| `0b` rungs | `1 3 7 15` | `2ⁿ−1` |
| `0o` rungs | `7 63 511 4095` | `8ⁿ−1` |
| `0x` rungs | `1 17 273 4369` | `(16ⁿ−1)/15` |
| `0x` point rungs | `8 136 2184 34952` | `8·(16ⁿ−1)/15` |
| `0x1111 ^ 0x8888` | `0x9999` | cross-radix XOR closure |
| `0x0080 → 0x0800` | `128 → 2048` | 4-bit-position jump |
| `0o1111` | `585` | `(8⁴−1)/7`, reverse of 1/7 |

The constraint regex cascades down-layer: `//` on an upper rung compiles from
the document constraint and is inherited by every rung below it — the meta-tag
for the `0x0011n` token on the line it sits in.

Seed leaves for the ladder live at `model/0n/BCD_float_ladder.txt` and
`model/0p/point_ladder.txt`.

---

## 2. Configurations — the four axes of interpretation

The `_4d/configurations` layer names the four independent axes along which any
subject–predicate–object triple can be re-encoded. They are the character of the
tetrahedron:

| Configuration | model/ dir | Shared module | Axis |
|---------------|------------|---------------|------|
| nested brace expansion | `_4d/configurations/nested.brace.expansion` | — (new) | character-set expansion |
| projective nibble mapping | `_4d/configurations` (projection) | `shared/ascii-table.js` | 27-symbol corpus, 3³ |
| high-bit swap (`0x2_ → 0x8_`) | `_4d/configurations` | `shared/ascii-table.js` | NPN ⇄ PNP parity |
| harmonic clock synchronization | `_4d/configurations` | `shared/clock-sliderule.js` | 240 · 120 · 60 · 44100 |

`_4d/boundries/edge-n-grams` is the tokenizer (the two-element window that walks
the stream) and `_4d/constraints/regex` is the grammar filter. Together the four
axes give a triple four independent *encodings* of the same address.

---

## 3. Verified invariant table

All claims below were checked with `node` and reproduce exactly. Every identity
is deterministic and radix-portable.

| Identity | Result | Significance |
|----------|--------|--------------|
| `7**11` | `1977326743` | the 11-form port number |
| port split of `1977326743` | `19·77·32·67·43` | two-digit place-value ports |
| `1 ^ 3 ^ 7` | `5` | the 5-transistor structural solvent |
| `1 ^ 3 ^ 7 ^ 5` | `0` | XOR closure back to the centroid |
| `1 * 3 * 7` | `21` | 3-signal product |
| `1 * 3 * 7 * 10` | `210` | 7-primorial orbit `210p + n` |
| `1² · 3² · 7² · 10²` | `44100` | audio sample clock |
| `sqrt(44100)` | `210` | the primorial radius |
| `3² ^ 7²` | `56` | XOR of squares |
| `3² ^ 7² ^ 21` | `45` | the 45 attractor (`9 × 5`) |
| `2 · 4 · 6 · 8 · 10` | `3840` | even-field product |
| `3840 / 16` | `240` | system clock (MHz) |
| `3840 / 32` | `120` | half-clock |
| `3840 / 64` | `60` | frame clock (fps) |
| `3840 / 15` | `256` | byte boundary |
| `2 ^ 4 ^ 6 ^ 8 ^ 10` | `2` | even-field XOR base |
| `2 ^ 4 ^ 6 ^ 8 ^ 10 ^ 5` | `7` | the missing 7 re-enters |
| `168 & 5⁵` | `32` | `0x20` Space projection |
| `3² ^ 7² & 5⁵` (precedence `&`) | `56` | `9 ^ (49 & 3125)` |
| `5⁹ ^ 9⁵` | `1911756` | asymmetric radix exchange |
| `0x11 ^ 17` | `0` | braid hits floor at index 17 |
| `0x11 ^ 27` | `10` | braid hits port 10 |
| `0x11 ^ 32` | `49` | 32-step reset to `0x31` |

---

## 4. The 0x11 braid

`0x11 ^ n` is the canonical XOR braid over the byte:

```
n:   1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 ...
v:  16 19 18 21 20 23 22 25 24 27 26 29 28 31 30  1  0  3  2  5  4  7  6  9 ...
```

The stream alternates ping-pong ties `(19,18) (21,20) (23,22) …`, passes through
**exactly zero** at index `17`, and resets with a strict 32-step period — verified
to index 64 where the `+32` offset `(49,48,51,50 …)` takes over. The braid is
therefore a *clock*: 32 steps to a full turn, index 17 as the `0x0000` trough,
index 27 as the `0x0A` port.

---

## 5. The clocks

The invariant family resolves into three real clocks that the whole stack runs on:

| Clock | Derivation | Value |
|-------|-----------|-------|
| System | `3840 / 16` | `240 MHz` |
| Half | `3840 / 32` | `120` |
| Frame | `3840 / 64` | `60 fps` |
| Audio | `1²·3²·7²·10²` | `44100 Hz` |
| Radius | `sqrt(44100)` | `210` = primorial `2·3·5·7` |

The audio clock is the anchor: `44100 = 210²` and `210 = 1·3·7·10`. The video
clock is the even field: `3840 = 2·4·6·8·10`. Odd and even fields meet at
`1^3^7 = 5` and `1^3^7^5 = 0` — the 5-transistor closure that makes the whole
system a solvent for its own residues.

---

## 6. The knots

`model/0d/4-knots` is the home of the attractor:

```
3² ^ 7²        = 56     # first pull
56 ^ 21        = 45     # the attractor = 9 * 5
```

45 is stable: every path through the tables above that touches `56` is pulled to
`45` on the next XOR. 45 pinches the tetrahedron at a single vertex — the
projection `168 & 3125 = 32` (`0x20`, Space) being the adjacent fixed point.
`knots/` at the repo root mirrors this box (see AGENTS.md: empty dirs until
leaf files land).

---

## 7. The compare + exchange layer (`_1d`)

`_1d` is the atomic protocol surface, mapped 1:1 onto `shared/ruler.js` and
`shared/solid-to-triple.js`:

```
_1d/0-atomics
  0-bytes.per.element   # EA-store width
  1-byte.offset         # EA lane offset
  2-byte.length         # span
_1d/1-compare
  1-bind                # ruler.bind
  2-apply               # ruler.apply (4 slots: _0 _1 _2 _3)
  3-eval                # ruler.eval
_1d/2-exchange          # subject – predicate – object
  0-subject
  1-predicate
  2-object
```

The four apply slots `_0 … _3` are the four tetrahedral face turns applied to a
triple before exchange commits. `eval` folds a triple back toward `0x0000`.

---

## 8. The taxonomy layer (`_4d`)

```
_4d/boundries/edge-n-grams        → shared/edge-ngram.js
_4d/constraints/regex             → shared/regex-constraints.js
_4d/configurations/nested.brace.expansion   → (new primitive, see §9)
```

Each directory in `_4d` is a *filter* on the atom stream, in this order:
tokenize at the boundary (`edge-n-grams`), constrain by grammar (`regex`),
re-encode by configuration (`nested.brace.expansion`).

---

## 9. Nested character expansion (the missing primitive)

`nested.brace.expansion` is the parse rule for leaf files: `a{b,c}d` expands to
`abd acd`, nested braces expand recursively, and `0x/0b/0o/0d` literals inside a
leaf decode their own radix. This is how a leaf file *defines itself* in place —
the folder names say *where*, the braces say *how many*, the regex says *why not*.

---

## 10. The tetrahedron test

Any new invariant added to this model must satisfy all five checks:

1. **XOR closure** — the identity folds to `0x0000` under the vertex XOR.
2. **Radix portability** — the identity holds in `0x`, `0b`, `0o`, `0d`.
3. **Dialect duality** — the identity holds in both `0n` (spectral) and `0p`
   (spatial) readings, mirroring `0n0p0n` ⇄ `0p0n0p`.
4. **Clock fit** — the result lands on `240 · 120 · 60 · 44100 · 210 · 45 · 32`.
5. **Directory placement** — the identity has an unambiguous home in `model/`.

If a number can't find an address in the tree, the tree is what changes.

---

## Appendix A. One-line proofs

```
1 ^ 3 ^ 7 = (001 ^ 011) ^ 111 = 010 ^ 111 = 101 = 5
5 ^ 5     = 0
2^4^6^8^10 = (2^4)^(6^8)^10 = 6^14^10 = 8^10 = 2
2 ^ 5     = 7
sqrt(210²) = 210
7^11      = 1977326743
```

---

## Appendix B. Ports

The two-digit splits of `7**11` are the binding ports:

```
19 77 32 67 43
 │  │  │  │  └─ 43 = 0x2B '+'   (port 43)
 │  │  │  └──── 67 = 64 + 3
 │  │  └─────── 32 = 0x20 Space (projection fixed point)
 │  └────────── 77 = 80 − 3
 └───────────── 19 = prime sextuplet head {5,7,11,13,17,19}
```

Tolerance runs **−3 to +5** around each port — the same window that makes
`168 & 3125 = 32` exact and `56 ^ 21 = 45` exact.

---

License **CC0-1.0**. The observer is the **0x0000** centroid. The observer is **you**.