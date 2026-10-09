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

## What Is Still Open

- ⟦I-26: what the "16-character, 32-bit" of the preheader counts.⟧
- ⟦I-16 and I-18: if "XNOR space" is meant as more than a name, which operation makes block 1 the sameness reading of block 0?⟧
