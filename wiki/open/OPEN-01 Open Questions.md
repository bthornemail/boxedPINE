---
id: OPEN-01
title: "Open Questions"
kind: open
layer: open
status: canonical
spec: OMI-IMO-2026
up: "[[OMI-IMO]]"
down: []
related:
  - "[[OPEN-00 Contradiction Register]]"
  - "[[OPEN-02 Broken Code Inventory]]"
  - "[[OPEN-03 Glossary]]"
  - "[[OPEN-04 Discarded Claims]]"
  - "[[SPEC-00 Canonical Statement]]"
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-11 The Three Primitives]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-33 The Quadratic Forms]]"
  - "[[SPEC-34 Phases Attributes Constraints Configurations]]"
  - "[[SPEC-40 The 6T XOR Circuit]]"
  - "[[SPEC-41 The 8T XOR Circuit]]"
  - "[[SPEC-61 Implementation Status]]"
sources:
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-04 Assembly Register Programming]]"
  - "[[SRC-05 Conspiracy Check]]"
  - "[[SRC-06 Phases vs Attributes vs Constraints vs Configurations]]"
code: []
dimensions: []
symbols: []
tags: [omi-imo, open-questions, unresolved, research]
---

# Open Questions

## Restated by the Fano Fold conversation

Source: [[SRC-09 Try XOR Catch XNOR Finally]]. These are restatements, not proofs.

| Item | Status after that file |
|------|------------------------|
| Middle of bind is `{3, 7, 11, 15}` on a blackboard | stated |
| `delta16` is the 16/8 Hamming fold | stated |
| `get`/`set`/`catch` vs `bind`/`apply`/`eval`/`digest` | stated |
| `try`/`catch`/`finally` is the triangle of the fold | stated; 3-vs-7 reading left open |
| `{17, 19}` anchors | explicitly **not** resolved |
| Period 8 vs period 240 | not addressed |

## Overview

This register tracks all open questions in the protocol. Each question is a place where the sources are unclear or incomplete.

## Questions

### 1. The Period-8 vs Period-240 Relationship

**Question:** How are the delta's period-8 and the protocol's period-240 related?
**Context:** The delta function has exact period 8. The protocol's behavior is time crystals (period 240).
**Hypothesis:** The 8-period is the unit cell; the 240-period is the supercell. 240 = 8 × 30.
**Status:** Open.

### 2. The `3! XOR 3! XOR 3! XOR 1!` Expression

**Question:** What is the correct value of `3! XOR 3! XOR 3! XOR 1!`?
**Context:** The expression is assigned 19 (addition), 216 (multiplication), and 7 (true XOR).
**Hypothesis:** The true XOR value is 7. The addition and multiplication values are different operations.
**Status:** Open.

### 3. The `beta + beta` Question

**Question:** Is `beta + beta = 0` or `beta + beta = 2`?
**Context:** The Coq proof says `beta + beta = 0` (Admitted). The transcript says `beta + beta = 2` (proved).
**Hypothesis:** The Coq proof is incomplete (Admitted). The transcript's proof may be correct.
**Status:** Open.

### 4. The Verilog `swap16` and `swap64` Branches

**Question:** Are the Verilog `swap16` and `swap64` branches byte-identical?
**Context:** The extraction says they are byte-identical (suspect).
**Hypothesis:** They should be different. The byte-identical branches are a copy-paste error.
**Status:** Open.

### 5. The Missing Bibliography

**Question:** What is the bibliography for the inline markers `[1]`–`[14]`?
**Context:** The markers appear on every load-bearing claim but no bibliography is in the PDF.
**Hypothesis:** The bibliography was in a separate document that was not included.
**Status:** Open.

### 6. The `apply` Method

**Question:** What is the correct implementation of the `apply` method?
**Context:** The `apply` method in `Node` is a stub — declared but not implemented.
**Hypothesis:** The `apply` method should execute a knot as a function descriptor, producing a result.
**Status:** Open.

### 7. The `pin` Method

**Question:** What is the correct implementation of the `pin` method?
**Context:** The `pin` method always throws — the try/catch/finally structure is broken.
**Hypothesis:** The `pin` method should pin a function by name, creating a Blob and registering it.
**Status:** Open.

### 8. The `learn` Method

**Question:** What is the correct implementation of the `learn` method?
**Context:** The self-modifying kernel's `learn` method is not yet implemented.
**Hypothesis:** The `learn` method should add a new pattern to the grammar and increment the generation counter.
**Status:** Open.

### 9. The `regenerate` Function

**Question:** What is the correct implementation of the `regenerate` function?
**Context:** The kernel regeneration from description is not yet implemented.
**Hypothesis:** The `regenerate` function should rebuild the kernel from its description, replaying the history.
**Status:** Open.

### 10. The Four-Block Family and the Diagonal

**Question:** What is the exact relationship between the four-block family {3, 7, 11, 15} and the diagonal 12 = 01100?
**Context:** Bases 3 and 11 are orthogonal to the diagonal (bit 2 clear). Bases 7 and 15 interfere (bit 2 set).
**Hypothesis:** The four-block family is the set of bases with bits 0 and 1 set. The diagonal is the half-unit coupling. The orthogonal bases preserve the cross term; the interfering bases do not.
**Status:** Open.

### 11. The 5T/10T Frame and the n-Sphere

**Question:** Is the 5T/10T frame really the n-sphere of the 4-bit space?
**Context:** The orbit of 0x0005 under XOR with n = 0..15 walks through all sixteen values. Because XOR is an involution, the orbit is symmetric.
**Hypothesis:** The orbit is the discrete n-sphere of the 4-bit space at radius from 0x0005.
**Status:** Open.

### 12. The Swap16/Swap32/Swap64 Pairing

**Question:** How do the three swaps pair with the three readings (bind, apply, eval)?
**Context:** The three swaps are the three readings of the same buffer at different granularities.
**Hypothesis:** swap16 ↔ bind, swap32 ↔ apply, swap64 ↔ eval. But the pairing may be different.
**Status:** Open.

### 13. The 16xy = 12 Bridge

**Question:** What is the exact reading of `16xy = 12` at the half-unit diagonal?
**Context:** The cross term 16xy equals 12 at x = 3/2, y = 1/2.
**Hypothesis:** The half-unit diagonal is the point where the coupling is exactly 12. The diagonal 12 = 01100 has bits 2 and 3.
**Status:** Open.

### 14. The Orbital Cycle and the Pin

**Question:** How does the pin at 18 relate to the orbital cycle of base 19?
**Context:** The pin is at 18, which is between 17 and 19 — the two evaluation anchors.
**Hypothesis:** The pin is in orbit 0, the first orbit, and it's the second point in that orbit.
**Status:** Open.

### 15. The Blackboard Extraction

**Question:** What is the correct architecture for extracting the middle to a blackboard?
**Context:** The middle of bind should be the four-block family {3, 7, 11, 15}, extracted to a blackboard or automaton state.
**Hypothesis:** The blackboard holds the four-block state. The bind becomes a transition function reading and writing the blackboard.
**Status:** Open.
