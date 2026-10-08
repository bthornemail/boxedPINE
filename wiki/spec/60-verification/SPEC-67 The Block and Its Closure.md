---
id: SPEC-67
title: "The Block and Its Closure"
kind: spec
layer: verification
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-60 Test Vectors]]"
down: []
related:
  - "[[SPEC-01 The Three Laws]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-61 Implementation Status]]"
  - "[[PROG-00 Homoiconic Syntax Tracker]]"
sources: []
code:
  - "core/src/verified/block.ts"
  - "src/testbed/core.test.ts"
dimensions: []
symbols: []
tags: [omi-imo, verification, block, tetrahedron, closure, theorem]
---

# The Block and Its Closure

The protocol's one acceptance law, tested with real input: inputs that should close do, and inputs that should not, don't.

## DEFINITION (rev1 Part II)

The block is a tetrahedron. Its vertices are the radix readings `0x`, `0b`, `0o`, `0d` (numbered 0 to 3), with six edges, four faces, and the centroid `0p 0i 0n`. Its state is a 6-bit word `b ∈ F₂⁶`, in edge order `(e₀₁, e₀₂, e₀₃, e₁₂, e₁₃, e₂₃)`.

| Reading | What it counts | Closed when |
|---------|----------------|-------------|
| `∂_V(b)` | for each vertex, the parity of its selected edges | `0000` |
| `∂_F(b)` | for each face, the parity of its selected edges | `0000` |

The face words of rev1 §2.4 are `f₀ = 000111`, `f₁ = 011001`, `f₂ = 101010`, `f₃ = 110100`.

## THEOREM (verified by enumerating all 64 states, 2026-10-08)

| | Count | The states |
|---|---|---|
| Vertex-closed | 8 | `000000`; the 4 faces; the 3 four-cycles `011110`, `101101`, `110011` |
| Face-closed | 8 | `000000`; the same 3 four-cycles; the 4 vertex-stars `111000`, `100110`, `010101`, `001011` |
| Closed both ways | 4 | `000000` and the 3 four-cycles |

**Closure fails when it should:**
- One edge (`100000`, e₀₁ alone) reads `∂_V = 1100`: it is open at its two ends.
- Two opposite edges (`100001`) read `1111`: open everywhere.

**Closure succeeds when it should:** every face and every four-cycle is vertex-closed.

Code: `core/src/verified/block.ts`. Tests: `src/testbed/core.test.ts`, three tests named for these facts.

## Reading It

Vertex-closed states are the cycles of the tetrahedron's edge graph. A face is the smallest cycle, a triangle; a four-cycle uses all four vertices. Face-closed states are the complementary structure: a vertex-star touches each of its three faces twice. The four-cycles are the only non-zero states closed under both readings.
