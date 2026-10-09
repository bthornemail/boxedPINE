---
id: SPEC-09
title: "The Structure Map"
kind: spec
layer: canonical
status: review
spec: OMI-IMO-2026
up: "[[SPEC-00 Canonical Statement]]"
down: []
related:
  - "[[SPEC-04 First Principles]]"
  - "[[SPEC-07 The Fundamental Invariants]]"
  - "[[SPEC-08 The Derivation Path]]"
  - "[[META-04 Repository Frame]]"
  - "[[USE-00 Use Case Scenarios]]"
  - "[[SPEC-61 Implementation Status]]"
sources:
  - "[[SRC-10 The Ontology Conversation]]"
code:
  - "core/src/verified/index.ts"
  - "rosetta/src/grammar/grammar.ts"
  - "src/testbed/core.test.ts"
  - "src/testbed/rosetta.test.ts"
dimensions: []
symbols: []
tags: [omi-imo, canonical, structure-map, medium, canonicalization]
---

# The Structure Map

The protocol is canonicalized over the algorithmic medium by mapping every structure to the places in the repository where it lives. [[SPEC-07 The Fundamental Invariants]] says *what* holds. [[SPEC-08 The Derivation Path]] says *in what order* to learn it. This note says *where* each structure is, and how far it has got.

## The Places

The author's delineation of the folders ([[META-04 Repository Frame]]) gives four kinds of place:

| Kind | Folders | What it does for a structure |
|------|---------|------------------------------|
| **Law** | `core/` (operations), `rosetta/` (declarations and definitions), `types/` (pure types, the tree proxy) | gives it one home in code |
| **Check** | `src/` (`src/testbed/`, run by `npm test`); `proofs/` (formal: Coq, Lean) | states it as a test that passes, or a proof that compiles |
| **Realization** | `breadboard/` (circuit), `space/` (projection), `repl/` (observer), `omi-files/` (other substrates) | shows it on a substrate |
| **Reading** | `wiki/` | states it in words, with a mark |

The split between `core/` and `rosetta/` is the protocol's own split: operations on the one side, RegExp declarations and string definitions on the other.

## The Rule

**DEFINITION.** A structure is **canonical over the medium** when it has all three:
1. a **statement** in this vault, marked THEOREM or DEFINITION in SPEC-07;
2. **one home** in a law place, `core/` or `rosetta/` (`types/` gives it a type, not a second home);
3. a **check**: a test in `src/testbed/` that passes, or a proof in `proofs/` that compiles.

A realization never defines a structure; it demonstrates one. A structure can be realized in many places, but it has exactly one home. Where a realization and the home disagree, the home is right and the realization is the bug.

The states a structure can be in:

| State | Has |
|-------|-----|
| **canonical** | statement, home, check |
| **checked** | statement and check, but no home: the test computes it inline |
| **stated** | a statement only |
| **realized only** | code in a realization, with no statement, home or check |
| **fails** | the claim was checked and does not hold; SPEC-07 gives the correct form |

## The Map

### The Medium (First Principles)

| Structure | SPEC-07 | Home | Check | Realizations | State |
|-----------|---------|------|-------|--------------|-------|
| Buffer and index | I-1 | `core` exchange.ts (`makeSlots`) | core.test | `space` atomics.ts (a shared buffer of 5040); `omi-files/atomic-kernel` | **canonical** |
| The exchange | I-2 | `core` exchange.ts | core.test | `repl` broadcast.ts; `space` atomics.ts | **canonical** |
| The three swaps | I-3 | `core` swap.ts | core.test (also against Node's `Buffer`) | `types` | **canonical** |
| The base36 alphabet | I-4 | `core` wordform.ts (`separation`); `rosetta` grammar.ts | core.test, rosetta.test | — | **canonical** |
| try / catch / finally | I-27 | `core` circulator.ts | core.test | `types` Try.hs | **canonical** |

### Difference and Sameness

| Structure | SPEC-07 | Home | Check | Realizations | State |
|-----------|---------|------|-------|--------------|-------|
| XOR and XNOR at a fixed width | I-5, I-6 | `core` circulator.ts (`xnor`) | rosetta.test | `breadboard` (all four builds compute XOR; XNOR as its complement) | **canonical** |
| The observer cancels in pairs | I-7 | — | — (Coq) | `proofs` | **checked** in Coq; no home |
| Exit: invisible to difference, maximal to sameness | I-8 | `core` circulator.ts | core.test | — | **canonical** |

### Closure and Period

| Structure | SPEC-07 | Home | Check | Realizations | State |
|-----------|---------|------|-------|--------------|-------|
| The closure law `∂(b) = 0000` | I-9 | `core` block.ts | core.test | — | **canonical** |
| The delta, constant carry: periods 8 and 4 | I-10 | `core` delta.ts, swap.ts | core.test | `proofs` (Coq period-8 proof) | **canonical** |
| The carry-forward fold: periods 24 and 6 | I-11 | `core` delta.ts, swap.ts | core.test | — | **canonical** |
| The nested periods 8, 240, 5040 | I-13 | — | core.test | `space` atomics.ts (5040) | **checked** |

### The Orbit of 60

| Structure | SPEC-07 | Home | Check | Realizations | State |
|-----------|---------|------|-------|--------------|-------|
| The two poles `60 ⊕ 64`, `60 ⊕ 128` | I-14 | `core` wordform.ts (`POLES`) | core.test | `types` Orbit.hs | **canonical** |
| The carry-free fold points | I-15 | — | core.test | — | **checked** |
| One wordform at four widths: 12, 60, 124, 252 | I-29 | `core` wordform.ts | core.test | — | **canonical** |
| The flip-flop: every 64-block is block 0 shifted | I-39 | `core` wordform.ts (`orbit60`) | core.test (orbit block) | — | **canonical** (the shift); the names XOR / XNOR space are **stated** |
| "Block 1 is the XNOR of block 0" | I-18 | — | core.test | — | **fails** |
| The two halves: XOR lens and XNOR tree | I-16 | — | — | — | **stated** |
| `{17, 19}` as indices | I-17 | — | — | — | **stated** |

### Generators and Counts

| Structure | SPEC-07 | Home | Check | Realizations | State |
|-----------|---------|------|-------|--------------|-------|
| The distinguished triples 7, 35, 155, 651 | I-28 | `core` triples.ts | core.test | `proofs` (Fano incidence) | **canonical** |
| The ruler `2! + 3! = 8` | I-32 | — | core.test | `types` Ruler.hs | **checked** |
| The generator `{0,2,1}{3,7,11,15}{17,19}` | I-33 | — | core.test | — | **checked** |
| The quadratic form, Δ = −704 and 0 | I-34 | — | core.test | `types` BQF.hs | **checked** |
| Point–line 16 / 64 / 4 | I-36 | — | — | — | **stated** |
| The `{2,n}:{n,2}` controller space | I-37 | — | — | — | **stated** |
| The 15 treemap algorithms and the Hamming/Polybius row | I-40 | — | — | — | **stated**: no treemap code exists anywhere in the repository yet |

### Naming and Framing (Rosetta)

| Structure | SPEC-07 | Home | Check | Realizations | State |
|-----------|---------|------|-------|--------------|-------|
| The four face cells, P / I / N / E | I-30, I-31 | `rosetta` grammar.ts | rosetta.test | — | **canonical** |
| The literal separation `PINEBOXED` | [[SPEC-36 The Literal Separation]] | `rosetta` grammar.ts | rosetta.test | — | **canonical** (as drafted) |
| The catalog coordinate, form 1 `<A?B=C>` | I-24 | `rosetta` catalog.ts | rosetta.test | `repl` broadcast.ts (the `< = > ?` gates) | **canonical** |
| The catalog heads, forms 2–7 | I-41 | — | — | — | **stated** |
| The preheader names | I-25 | — | core.test | — | **checked** |
| "The preheader is 16 characters" | I-26 | — | core.test (29) | — | **fails** |
| Proxy and Reflect | [[OPEN-01 Open Questions]] #19 | — | — | `repl` broadcast.ts; `core` index.ts (`reflect`) | **realized only** |
| The compare-exchange message syntax `EXCHANGE` | [[PROG-00 Homoiconic Syntax Tracker]] Level 4 | `rosetta` grammar.ts (matches) | rosetta.test (matches) | — | **canonical** as syntax; nothing executes it |

### Propagation

| Structure | SPEC-07 | Home | Check | Realizations | State |
|-----------|---------|------|-------|--------------|-------|
| The circulator's five states | I-19 | `core` circulator.ts | core.test | `types` Try.hs (two of the five) | **canonical** |
| Conservation of departure | I-20 | `core` circulator.ts | core.test | — | **canonical** |
| Decision ≠ delta | I-21 | `core` circulator.ts | core.test | — | **canonical** |
| The Axiom of Propagation | I-22 | — | — | — | **stated** (a thesis; it has no code form) |
| The four states of a reading | I-23 | — | — | — | **stated** |

### Radix, the Mêtron and the Prime Clusters

| Structure | SPEC-07 | Home | Check | Realizations | State |
|-----------|---------|------|-------|--------------|-------|
| The radix belongs to the literal | I-42 | `rosetta` grammar.ts (the radix prefix) | core.test | — | **canonical** |
| The mêtron and `bind` | I-43 | `core` metron.ts | core.test | — | **canonical** |
| The quadruplets and the bridge `{11, 13}` | I-44 | `core` metron.ts | core.test | — | **canonical** |
| Sextuplets on the 210 ladder | I-45 | `core` metron.ts | core.test | — | **canonical** |
| The ladder `210·rung + {5,…,19}` | I-46 | `core` metron.ts (`ladderAsWritten`) | core.test | — | **fails** |
| Floats, Poisson, black body, pulsars | I-47 | — | — | — | **stated** (analogy) |

### The Physical and Spatial Layers

| Structure | Reading | Home | Check | Realizations | State |
|-----------|---------|------|-------|--------------|-------|
| The four XOR builds 5T, 6T, 8T, 10T | [[SPEC-44 The Virtual Breadboard]] | — | `breadboard` test.mjs (passes; not part of `npm test`) | `breadboard` | **realized**, with its own check |
| The tree: 16 Blobs, one 20-bit index | (this note) | `core` tree.ts | core.test | `types/` (proxy) | **canonical** |
| The 65,536 Blob | [[SPEC-22 The Blob]] | `core` wordform.ts (`BUFFERS_PER_BLOB`) | core.test | `space` | **canonical** (the count) |
| The 360 × 65536 tetrahedron view | `space/README.md` | — | — | `space` (eight views planned) | **stated** |

## The Tree: Sixteen Blobs

**DEFINITION** (author, 2026-10-09: "16 65536 bit files … an indexing of index indices"; the bit layout is my reading, to be confirmed). The tree classification model is **sixteen files of 65,536 bits** (8,192 bytes each), one Blob per file, 2²⁰ bits in all. An address is three indices in one:

| Index | Bits | Range | Picks |
|-------|------|-------|-------|
| file | 4 | 0–15 | one of the sixteen trees: upper-half index 16 + file (I-16) |
| byte | 13 | 0–8191 | a byte in the file |
| bit | 3 | 0–7 | a bit in the byte (bit 0 is the lowest; a DECISION) |

`address(file, byte, bit) = file · 2¹⁶ + byte · 8 + bit`, and `split` inverts it. The model only indexes; the author seeds the bytes (for example with `fill`). It is in `core/src/verified/tree.ts`, checked in core.test, and so is **canonical** as an index. `types/` is its type-side proxy.

⟦Which tree algorithm each file holds, and whether file 15 (or another) is the Hamming/Polybius row, is still open: I-16, I-17 and I-40.⟧

## The Count

Of the 49 rows (2026-10-09): **26 canonical**, **7 checked**, **11 stated**, **1 realized only** (Proxy and Reflect), **1 realized with its own check** (the breadboard), **3 fail**.

## What Canonicalizes Next

**Decision** (in this order, cheapest first):
1. **Give the checked rows a home.** The ruler, the generator, the quadratic form, the fold points and the nested periods are computed inline in tests. Each needs one function in `core/` for the test to call.
2. **Check Proxy and Reflect.** `Proxy ⊕ Reflect = throw` was checked by hand (OPEN-01 #19); it needs a home in `core/` and a test.
3. **Bring the breadboard's check into `npm test`,** so one command checks everything.
4. **The catalog heads 2–7** wait on the meaning of form 7 (I-41).
5. **The 15 treemap algorithms** are the largest stated structure with no code. The author places them in `rosetta/` as its tree-algorithm test framework. Their container now exists (the tree's sixteen files); they wait on which file holds which algorithm.
6. **The stated rows that are definitions by nature** (the axiom, the four states of a reading, the analogies) stay stated. They are the reading, not the law.
