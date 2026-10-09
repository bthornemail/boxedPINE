---
id: SPEC-07
title: "The Fundamental Invariants"
kind: spec
layer: canonical
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-00 Canonical Statement]]"
down: []
related:
  - "[[SPEC-04 First Principles]]"
  - "[[SPEC-05 The Axiom of Propagation]]"
  - "[[SPEC-06 The Circulator]]"
  - "[[SPEC-08 The Derivation Path]]"
  - "[[SPEC-67 The Block and Its Closure]]"
  - "[[SPEC-36 The Literal Separation]]"
  - "[[SPEC-37 The Catalog Coordinate]]"
  - "[[OPEN-00 Contradiction Register]]"
  - "[[OPEN-01 Open Questions]]"
sources:
  - "[[SRC-10 The Ontology Conversation]]"
code:
  - "core/src/verified/index.ts"
  - "core/src/verified/metron.ts"
  - "src/testbed/core.test.ts"
  - "src/testbed/rosetta.test.ts"
  - "omi-files/omi-axioms/coq/04-execution/Delta16HasExactPeriodEight.v"
dimensions: []
symbols: []
tags: [omi-imo, canonical, invariants, ontology, theorem, definition]
---

# The Fundamental Invariants

The ontology conversation ([[SRC-10 The Ontology Conversation]]) set out to reveal the protocol's fundamental invariants. This note is the one list, gathered from that conversation and from the vault's earlier work. Each entry is marked:

| Mark | Meaning |
|------|---------|
| **THEOREM** | true, and checked: by a test in `npm test`, a Coq proof, or exhaustive enumeration |
| **DEFINITION** | chosen by the author; true because the protocol says so |
| **FAILS** | a claim that does not hold as stated; the correct statement is given |

## I. The Medium

| # | Invariant | Mark | Evidence |
|---|-----------|------|----------|
| I-1 | **Everything is an index, never a magnitude.** Positions combine by XOR, walk, compare and complement | DEFINITION | the Supreme Notion primer; [[SPEC-04 First Principles]] |
| I-2 | **One primitive.** compare · conditionally write · return the prior value. The difference `expected ⊕ actual` is the reading, and it is 0 exactly when the frame closes | THEOREM | `exchange.ts` tests |
| I-3 | **The three swaps are XOR on the index:** byte j → j⊕1, j⊕3, j⊕7. They copy rather than mutate, and all six orderings give one permutation (j⊕5), so 3! → 1! | THEOREM | `swap.ts` tests |
| I-4 | **The alphabet is base36, cut by three bits.** Bit 128 separates ASCII from beyond it, bit 64 digits from letters, bit 32 the case: 10 + 26 = 36 | THEOREM | [[SPEC-36 The Literal Separation]] |

## II. Difference and Sameness

| # | Invariant | Mark | Evidence |
|---|-----------|------|----------|
| I-5 | **XOR and XNOR carry the same information at a fixed width:** `popcount(a XNOR b) = width − Hamming(a, b)` | THEOREM | `rosetta.test.ts` |
| I-6 | **A BigInt `0n` has no width,** so its XNOR is negative, not a count. The width must come from the frame, for example the radix digits | THEOREM | `~(5n ^ 3n) = -7n` |
| I-7 | **The observer cancels in pairs:** `β ⊕ β = 0`, `β ⊕ β ⊕ β = β` | THEOREM | Coq (OPEN-00 #7); arithmetic |
| I-8 | **Exit is invisible to difference and maximal to sameness:** `x ⊕ 0 = x`, `XNOR(x, 0) = ~x` | THEOREM | circulator tests |

## III. Closure and Period

| # | Invariant | Mark | Evidence |
|---|-----------|------|----------|
| I-9 | **The closure law `∂(b) = 0000`** on the tetrahedron: 8 vertex-closed states, 8 face-closed, 4 both | THEOREM | [[SPEC-67 The Block and Its Closure]] |
| I-10 | **The delta with a constant carry:** period 8 for the bit rotation, 4 for the swaps | THEOREM | Coq `Delta16HasExactPeriodEight.v`; tests |
| I-11 | **The carry-forward fold, where the carry is the previous state** ("the `c` is the carry forward"): period **24 = 4!** for the bit rotation and **6 = 3!** for the swaps | THEOREM | `core.test.ts` |
| I-12 | "The carry-forward fold returns after 8 steps, or 4 for the swap version" (Derivation Part 4) | **FAILS** | 8 and 4 are the constant-carry periods (I-10). With the true carry they are 24 and 6 (I-11) |
| I-13 | **The periods nest:** 8 \| 240 \| 5040. 240 = 15 × 16 = 256 − 16 = the number of ordered pairs of distinct indices among 16 | THEOREM | arithmetic; `core.test.ts` |

## IV. The Orbit of 60 and the Two Halves

| # | Invariant | Mark | Evidence |
|---|-----------|------|----------|
| I-14 | **The two poles:** `60 ⊕ 64` (row 7, the lower 8 indices) and `60 ⊕ 128` (row 11, the higher 8). The column stays at 12, the four readings' rows are the four-block family {3, 7, 11, 15}, and `7 ⊕ 11 = 12` | THEOREM | `core.test.ts`; OPEN-01 #18 |
| I-15 | **The fold points split without carries:** 60 = 44 ⊕ 16 and 15 = 11 ⊕ 4, so the BQF's "+" there is index-legal | THEOREM | `core.test.ts` |
| I-16 | **The buffer's two halves:** lower 16 (0–15) is the XOR **lens**, the `60 ⊕ 64` reading; upper 16 (16–31) is the XNOR **tree**, the `60 ⊕ 128` reading, holding the 15 treemap algorithms and the Hamming/Polybius row | DEFINITION | author, [[SRC-10 The Ontology Conversation]] |
| I-17 | **`{17, 19}`:** 17 is the Hamming-distance index and 19 the tree-algorithm index of the upper half | DEFINITION | author-confirmed ("Yes exactly") |
| I-18 | "Block 1 of the orbit is the XNOR space of block 0" read as a bitwise identity | **FAILS** | `60 ⊕ (64 + m) = 64 + (60 ⊕ m)` for every m: block 1 is block 0 with bit 6 set, and equals the 7-bit XNOR for none of the 64 values. "XNOR space" is a naming (I-16), not an identity |

## V. Propagation

| # | Invariant | Mark | Evidence |
|---|-----------|------|----------|
| I-19 | **A circulator ends in exactly one of five states:** raise, terminate, forward, modify-and-forward, exit | DEFINITION (type) + THEOREM (implementation) | [[SPEC-06 The Circulator]] |
| I-20 | **Conservation of departure:** `finally` runs exactly once in every state | THEOREM | circulator tests |
| I-21 | **Decision ≠ delta:** forward carries unchanged, and only modify-and-forward has a delta, recoverable as `carried ⊕ received` | THEOREM | circulator tests |
| I-22 | **The Axiom of Propagation locates the choice the Axiom of Choice left unlocated** | DEFINITION (philosophical thesis) | it does **not** prove the classical axiom ([[SPEC-05 The Axiom of Propagation]]) |
| I-23 | **A reading evolves in one of four ways:** divergent, stable, convergent, harmonic (periodic). "An algorithm is a period" | DEFINITION | [[SRC-10 The Ontology Conversation]] |

## VI. Naming and Framing

| # | Invariant | Mark | Evidence |
|---|-----------|------|----------|
| I-24 | **The catalog frame `< ? = >` is block 0 of the orbit of 60**, and `<base32?base36=base64>` checks itself | THEOREM | [[SPEC-37 The Catalog Coordinate]] |
| I-25 | **In the preheader `<boxdpin?boxedPINE=PINEboxed>`:** `PINEboxed` is `boxedPINE` rotated by 5, and `boxdpin` has exactly the letters of `pin` + `boxd` | THEOREM | arithmetic |
| I-26 | "The preheader is a 16-character, 32-bit sequence" | **FAILS** as written | `<boxdpin?boxedPINE=PINEboxed>` is 29 characters. ⟦The 16 may be the 16-lens it describes rather than its length; author to say⟧ |
| I-27 | **try / catch / finally as three independent indices span the whole Fano plane:** 7 points, 7 lines; `try ⊕ catch` is the throw, `try ⊕ catch ⊕ finally` the full path | THEOREM | OPEN-01 #19 |

## VII. Counts, Generators and Forms

Added 2026-10-09 after a coverage review of this list. I-1 to I-27 keep their numbers.

| # | Invariant | Mark | Evidence |
|---|-----------|------|----------|
| I-28 | **The distinguished triples** `{a, b, a ⊕ b}` of non-zero indices number **7, 35, 155, 651** at 3, 4, 5, 6 bits (octonion, sedenion, 32-ion, 64-ion). The 7 are the Fano plane | THEOREM | `triples.ts`; `core.test.ts` |
| I-29 | **One wordform at four widths:** the last block offset is **12, 60, 124, 252** at widths 4, 6, 7, 8 | THEOREM | `wordform.ts`; `core.test.ts` |
| I-30 | **Exponent and exception differ by the case bit:** `e ⊕ E = 0x20` | THEOREM | `rosetta.test.ts`, `core.test.ts` |
| I-31 | **The four face cells** CENTER, LEFT, RIGHT, EXCEPTION partition every printable `x.y` exactly, and CENTER accepts the signs. Assigning **P = LEFT, I = RIGHT, N = CENTER, E = EXCEPTION** is a choice | THEOREM (partition) + DEFINITION (letters) | `rosetta.test.ts`; [[SPEC-36 The Literal Separation]] |
| I-32 | **The ruler is `2! + 3! = 8` slots** | THEOREM (arithmetic) + DEFINITION (that the ruler is built this way) | SRC-10 line 6458 |
| I-33 | **The generator `{0,2,1}{3,7,11,15}{17,19}`:** arities 3 : 4 : 2, sum 9, product **24 = 4!**, the same 24 as the carry-forward period (I-11) | THEOREM (arithmetic) + DEFINITION (the generator) | `core.test.ts`. That the two 24s are one structure is not shown |
| I-34 | **The binary quadratic form** `Q = 60x² + 16xy + 4y² = 4·(15x² + 4xy + y²) = 4·[11x² + (2x + y)²]`. Its discriminant is **−704**, and the affine form `16x² + 16xy + 4y² = (4x + 2y)²` has discriminant **0**. Q is **positive definite**: Q > 0 for every (x, y) ≠ (0, 0) | THEOREM | `core.test.ts` (checked on −5..5²) |
| I-35 | "Positive definite? No … negative discriminant means definite" (SRC-10 line 12985) and "a definite metric means the sequence returns to its start" | **FAILS** in part | Δ < 0 with 60 > 0 **is** positive definite, so the "No" is wrong. That definiteness makes the walk close is not proven; closure is I-9's law, not a consequence of Q |
| I-36 | **Point–line at the 4:** 16 is the point, 64 the line, 4 the connector (256 = 4 × 64) | DEFINITION | SRC-10 lines 12815–12905 |
| I-37 | **The `{2,n}:{n,2}` generator** is the controller space, read through the dual Schläfli pairs `{3,4}:{4,3}` (octahedron/cube), `{3,5}:{5,3}` (icosahedron/dodecahedron), `{3,3,4}:{4,3,3}` (16-cell/tesseract) | DEFINITION (controller space) + THEOREM (each pair is a dual pair) | SRC-10 lines 14078–14160 |
| I-38 | "`{2,3}`: the tetrahedron / triangle" and "`{2,4}`: the square" (SRC-10 line 14090) | **FAILS** as written | `{2,n}` is the hosohedron (n digons on a sphere), dual to `{n,2}`, the dihedron (two n-gons). The tetrahedron is `{3,3}`, the square `{4}` |
| I-39 | **The flip-flop:** the orbit of 60 is blocks of 64, alternately named XOR space and XNOR space, up to 65,536. Every block is block 0 shifted: `60 ⊕ (64k + m) = 64k + (60 ⊕ m)` for m < 64 | THEOREM (the shift) + DEFINITION (the names) | I-18; SRC-10 lines 14205–14310 |
| I-40 | **The 15 treemap algorithms** fill the upper 16 indices, one each, with the 16th as the Hamming/Polybius row | DEFINITION | SRC-10 lines 5322–5500; I-16 |
| I-41 | **The seven catalog heads** (SRC-10 lines 6129–6200): `<A?B=C>`, `<?B=C>`, `<A?B>`, `<A=C>`, `<?=C>`, `<A>`, `<A,B,?>`, each slot a set of `{base32, base36, base64}`. Seven = 2³ − 1 | DEFINITION (the seven) + THEOREM (the count) | the rosetta `CATALOG` rule accepts **only** the first form today ([[OPEN-01 Open Questions]] #20) |

## VIII. Radix, the Mêtron and the Prime Clusters

From the last stretch of the conversation (SRC-10 lines 15219–16487).

| # | Invariant | Mark | Evidence |
|---|-----------|------|----------|
| I-42 | **The radix belongs to the literal, never to the value.** `0x17n` is 23, `17n` is 17; the stored number has no radix. So hexadecimal is always marked with `0x`. This is I-6 again: width and radix come from the frame | THEOREM | `core.test.ts` |
| I-43 | **The mêtron** is fifteen canonical coordinates `0x00–0x03, 0x05, 0x07, 0x09, 0x0A–0x0F, 0x17, 0x19` (the last two are 23 and 25). A `BigInt64Array` is the unassigned carrier; **`bind(unbound, metron)`** copies the coordinates into it and refuses a carrier that is too short | DEFINITION (the fifteen) + THEOREM (`bind`'s behaviour) | `core/src/verified/metron.ts`; `core.test.ts` |
| I-44 | **The prime clusters:** `{5,7,11,13}` and `{11,13,17,19}` are the only prime quadruplets below 20, sharing the **bridge `{11, 13}`**. `{5,…,19}` and `{7,…,23}` are all prime. In `{5,…,19}` the complement of the first quadruplet is **`{17, 19}`** | THEOREM | `core.test.ts` |
| I-45 | **Sextuplets lie on the 210 ladder:** past `{7,…,23}`, every prime sextuplet starts at `210n + 97` (found: 97, 16057, 19417) | THEOREM below 20,000; known in general | `core.test.ts` |
| I-46 | "The ladder is `210·rung + {5, 7, 11, 13, 17, 19}`" (SRC-10 lines 15748–15790) | **FAILS** | rung 1 gives 221 = 13 × 17. `{5,…,19}` hits every residue mod 5, so it can only occur where 5 is in it, once. The regular offsets are `{97, 101, 103, 107, 109, 113}` |
| I-47 | **Floats, Poisson processes, black-body radiation, pulsars and the prime meridian** are analogies: the frame is arbitrary, the structure is forced, and floating point hides a radix the protocol marks | DEFINITION (pedagogy) | SRC-10 lines 15219–15600 |

## What Is Still Open

- ⟦I-26: what the "16-character, 32-bit" of the preheader counts.⟧
- ⟦I-16 and I-18: if "XNOR space" is meant as more than a name, which operation makes block 1 the sameness reading of block 0?⟧
- ⟦I-41: should the grammar accept all seven catalog heads? Form 7, `<A,B,?>`, needs a meaning for a `?` inside a set.⟧
- ⟦I-33: are the generator's 24 and the carry-forward's 24 the same structure?⟧
- ⟦I-43, I-44: the "point-line triangulation" of 23, which the author says is in the docs ([[OPEN-01 Open Questions]] #20).⟧
