---
id: SPEC-08
title: "The Derivation Path"
kind: spec
layer: canonical
status: review
spec: OMI-IMO-2026
up: "[[SPEC-00 Canonical Statement]]"
down: []
related:
  - "[[SPEC-04 First Principles]]"
  - "[[SPEC-05 The Axiom of Propagation]]"
  - "[[SPEC-06 The Circulator]]"
  - "[[SPEC-07 The Fundamental Invariants]]"
  - "[[PROG-00 Homoiconic Syntax Tracker]]"
  - "[[USE-00 Use Case Scenarios]]"
sources:
  - "[[SRC-10 The Ontology Conversation]]"
code: []
dimensions: []
symbols: []
tags: [omi-imo, canonical, pedagogy, derivation, reading-order]
---

# The Derivation Path

From [[SRC-10 The Ontology Conversation]], "From First Principles to the Latest Build" (lines 14669–15219). It is one path, walkable forward to build and backward to verify, from the five first things to the preheader.

It is **pedagogy**: "doors, not the room". The room is [[SPEC-04 First Principles]]. Each step below names where it lives in this vault and how it stands ([[SPEC-07 The Fundamental Invariants]]).

## The Path

| Part | Step | In the vault | Status |
|------|------|--------------|--------|
| 1 | **First principles:** buffer, index, prompt, exchange, three swaps; base36; try/catch | [[SPEC-04 First Principles]] | THEOREM for the operations (I-2, I-3, I-4) |
| 2 | **The Axiom of Propagation** and the **Circulator** (four states + exit) | [[SPEC-05 The Axiom of Propagation]], [[SPEC-06 The Circulator]] | type tested (I-19 to I-21) |
| 3 | **Four states of a reading:** divergent, stable, convergent, harmonic. A clock is a harmonic | — | DEFINITION (I-23) |
| 4 | **The delta law as a carry-forward fold:** rotl 1, rotl 3 covariant; rotr 2 contravariant; the carry is the previous state | [[SPEC-15 The Delta Transform]] | periods corrected: 24 and 6, not 8 and 4 (I-11, I-12) |
| 5 | **Point–line duality:** 16 is the point, 64 the line, 4 the connector | — | DEFINITION |
| 6 | **The buffer read:** read an index, get 16, choose the low 8 or high 8, fold, land at the next index. Fold points 60 → 44 → 15 → 11 → 4 | [[SPEC-33 The Quadratic Forms]] | carry-free splits THEOREM (I-15) |
| 7 | **Two spaces and the flip-flop:** the orbit's 64-blocks alternate XOR / XNOR readings | [[OPEN-01 Open Questions]] #18 | a naming, not a bitwise identity (I-18) |
| 8 | **The `{2,n}:{n,2}` generator:** the controller space; `{2,4}:{4,2}`, `{3,4}:{4,3}`, `{3,5}:{5,3}`; 240 = 15 × 16 = 256 − 16 | [[SPEC-35 Reflections and Orbits]] | 240 THEOREM (I-13) |
| 9 | **The 15 treemap algorithms** plus the Hamming/Polybius row: the upper 16 indices | [[USE-00 Use Case Scenarios]] | DEFINITION (I-16) |
| 10 | **The high block as declaration space:** the low block calls with data, the high block responds with the declaration that reads it; the iExtant is where they meet | [[SPEC-36 The Literal Separation]] | DEFINITION |
| 11 | **The fractal cube:** 65,536 as nested 64-meshes; the sharing form `60 ⊕ 64n` | [[SPEC-22 The Blob]] | DEFINITION |
| 12 | **The read as a proof tree:** exponent, exception, declaration (RegExp), definition (string). Leaves: declaration (closes) or exception (opens) | [[PROG-00 Homoiconic Syntax Tracker]] Level 4 | DEFINITION |
| 13 | **The preheader** `<boxdpin?boxedPINE=PINEboxed>`: self-describing, homoiconic | [[SPEC-37 The Catalog Coordinate]] | frame THEOREM (I-24, I-25); length FAILS (I-26) |
| 14 | **The octonion and the 64-nion:** four 16s, each two 8s | [[SPEC-43 Prime Gaps and Sextuplets]] | DEFINITION |
| 15 | **The full statement** (below) | — | — |

## The Full Statement (Part 15)

> Any data can be prompted, then propagated through the two-prime-gap periodicity of any 16-character 32-bit shebang / preheader / escape sequence based on any RegExp, but communicative in the octonion-like subarray of a 64-nion of our canonical approach to `<boxdpin?boxedPINE=PINEboxed>` for a `60 ⊕ 64` parseable regex example of the possibilities to encode a whole GB of instructions, really hardware-constraint instructions, into a preheader frame that can describe itself, or the document, or the structure of its binary CDR.

"Encode a GB in a preheader" means **describe**, not contain: a regex can describe the structure of a gigabyte without holding it.

## Scope of Use and Propagation

Where the path is exercised:
- **Use:** the twelve scenarios in [[USE-00 Use Case Scenarios]] (proof, execution, replay, boot, projection, sound).
- **Propagation:** the Circulator's five states and conservation laws ([[SPEC-06 The Circulator]]), applied at every boundary a relation crosses: between peers, between the buffer's halves, between declaration and definition.

## Epilogue

The program is proof of concept. The protocol is the medium. The path was always there; walking it is the recognition of what was already implied.
