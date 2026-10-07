---
id: OPEN-00
title: "Contradiction Register"
kind: open
layer: open
status: canonical
spec: OMI-IMO-2026
up: "[[OMI-IMO]]"
down:
  - "[[OPEN-01 Open Questions]]"
  - "[[OPEN-02 Broken Code Inventory]]"
  - "[[OPEN-03 Glossary]]"
  - "[[OPEN-04 Discarded Claims]]"
related:
  - "[[SPEC-00 Canonical Statement]]"
  - "[[SPEC-01 The Three Laws]]"
  - "[[SPEC-10 The Primitive]]"
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
  - "[[SRC-02 XOR Gate Transistor Circuits]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-05 Conspiracy Check]]"
  - "[[SRC-06 Phases vs Attributes vs Constraints vs Configurations]]"
code: []
dimensions: []
symbols: []
tags: [omi-imo, contradictions, register, errors, bugs]
---

# Contradiction Register

## Overview

This register tracks all contradictions found in the protocol's sources. Each contradiction is a place where the sources disagree with each other or with themselves.

## Contradictions

### 1. The 6T Circuit is XNOR, not XOR

**Source:** [[SRC-02 XOR Gate Transistor Circuits]]
**Claim:** The 6T XOR circuit computes XOR.
**Contradiction:** The 6T is XNOR. `Atom.apply()` returns 254/255.
**Status:** Unresolved. Proposed reading in [[SPEC-44 The Virtual Breadboard]]: the 5T's internal node is active-low (XNOR, shown as XOR by a sinking LED); the 6T's sixth transistor inverts it. Reading the 6T at that node with source polarity gives XNOR, reproduced in the virtual breadboard's self-test. Not yet checked against `Atom.apply()`.

### 2. The Period-8 vs Period-240 Conflict

**Source:** [[SRC-03 Protocol Sequence Analysis]]
**Claim:** The delta function has period 8.
**Contradiction:** The protocol's behavior is time crystals (period 240).
**Status:** Unresolved. The 8-period and the 240-period may be different levels of the same structure.

### 3. The 13-Mask Discrepancy

**Source:** [[SRC-03 Protocol Sequence Analysis]] vs [[SRC-02 XOR Gate Transistor Circuits]]
**Claim:** There are 13 masks.
**Contradiction:** The SRC-02 extraction mentions a different number.
**Status:** Unresolved.

### 4. The 825 vs 827 Centre Correction

**Source:** [[SRC-03 Protocol Sequence Analysis]]
**Claim:** The centre is at 825.
**Contradiction:** Self-corrected to 827.
**Status:** Resolved (827 is correct).

### 5. The `3! XOR 3! XOR 3! XOR 1!` Expression

**Source:** [[SRC-03 Protocol Sequence Analysis]]
**Claim:** The expression equals 19 (addition), 216 (multiplication), or 7 (true XOR).
**Contradiction:** Three different values for the same expression.
**Status:** Unresolved. The range's biggest contradiction.

### 6. `12 = 1!` vs `1! = 1`

**Source:** [[SRC-03 Protocol Sequence Analysis]]
**Claim:** `12 = 1!`.
**Contradiction:** `1! = 1`, not 12.
**Status:** Unresolved.

### 7. `beta + beta = 0` vs `beta + beta = 2`

**Source:** [[SRC-03 Protocol Sequence Analysis]]
**Claim:** `beta + beta = 0` (Admitted).
**Contradiction:** `beta + beta = 2` (proved).
**Status:** Unresolved.

### 8. Verilog `swap16` and `swap64` Branches

**Source:** [[SRC-03 Protocol Sequence Analysis]]
**Claim:** The Verilog `swap16` and `swap64` branches are byte-identical.
**Contradiction:** They should be different.
**Status:** Suspect.

### 9. The `PALINDROME` Pattern

**Source:** [[SRC-07 The OMI-IMO Complete Synthesis]] vs `rosetta/src/constants.ts`
**Claim:** The `PALINDROME` pattern is in the symbol table G.
**Contradiction:** It is referenced in the synthesis but NOT present in the actual `G` object.
**Status:** Bug. Fix: add `PALINDROME: /^(\d\d)[A-Za-z_\-](\d\d):\2[0-9_\-]\1$/` to `G`.

### 10. The `delta16` Export

**Source:** `rosetta/src/constants.ts` vs `rosetta/src/model.ts`
**Claim:** `delta16` is available for import.
**Contradiction:** It is not exported from `constants.ts`.
**Status:** Bug. Fix: add `export` to `function delta16`.

### 11. The `switch` Fall-Through

**Source:** `rosetta/src/model.ts`
**Claim:** The `switch` statement has fall-through cases.
**Contradiction:** The cases should probably have `break` statements.
**Status:** Bug. Fix: add `break` to each case.

### 12. The Division by Zero

**Source:** `rosetta/src/model.ts`
**Claim:** `linear % count === 0` is a valid check.
**Contradiction:** It throws when `count === 0`.
**Status:** Bug. Fix: check `count !== 0` first.

### 13. The `pin` Method

**Source:** `rosetta/src/model.ts`
**Claim:** The `pin` method pins a function by name.
**Contradiction:** It always throws.
**Status:** Bug. Fix: rewrite the try/catch/finally structure.

### 14. The `Node`/`Buffer` Truthiness

**Source:** `rosetta/src/model.ts`
**Claim:** `if (front || back || right || left || up || down)` checks for truthy values.
**Contradiction:** Buffers are always truthy.
**Status:** Bug. Fix: check `front.length > 0` etc.

### 15. The `animation.frame.ts` Invalid TS

**Source:** `rosetta/src/animation.frame.ts`
**Claim:** The file is valid TypeScript.
**Contradiction:** Missing `this.Q` reference.
**Status:** Bug. Fix: add `Q` to the class.

### 16. The `isRight` Arity Mismatch

**Source:** `rosetta/src/constants.ts`
**Claim:** `isRight` takes 1 argument.
**Contradiction:** The `RIGHT` regex has 2 capture groups.
**Status:** Bug. Fix: check the arity.

### 17. The `xor` Length Mismatch

**Source:** `rosetta/src/constants.ts`
**Claim:** `xor(a, b)` XORs two buffers.
**Contradiction:** It assumes `a` and `b` have the same length.
**Status:** Bug. Fix: check the lengths.

### 18. The `2^5^8^10 = 0` Error

**Source:** [[SRC-06 Phases vs Attributes vs Constraints vs Configurations]]
**Claim:** `2^5^8^10 = 0`.
**Contradiction:** Actual value is 5.
**Status:** Contradicted.

### 19. The `168 & 3125 = 32` Error

**Source:** [[SRC-06 Phases vs Attributes vs Constraints vs Configurations]]
**Claim:** `168 & 3125 = 32`.
**Contradiction:** Actual value is 0.
**Status:** Contradicted.

### 20. The `168 | 3125 = 3261` Error

**Source:** [[SRC-06 Phases vs Attributes vs Constraints vs Configurations]]
**Claim:** `168 | 3125 = 3261`.
**Contradiction:** Actual value is 3177.
**Status:** Contradicted.

### 21. The `95 ⊕ 59 = 1911756` Error

**Source:** [[SRC-06 Phases vs Attributes vs Constraints vs Configurations]]
**Claim:** `95 ⊕ 59 = 1911756`.
**Contradiction:** Actual value is 100.
**Status:** Contradicted.

### 22. The `(n−1)²+(n+1)² = n²` Error

**Source:** [[SRC-06 Phases vs Attributes vs Constraints vs Configurations]]
**Claim:** `(n−1)²+(n+1)² = n²`.
**Contradiction:** False for all n.
**Status:** Contradicted.

### 23. The 7-Element Literal Group

**Source:** [[SRC-06 Phases vs Attributes vs Constraints vs Configurations]]
**Claim:** The 7-element literal group lists `0d` twice.
**Contradiction:** `0d` should appear once.
**Status:** Contradicted.

### 24. The IEEE Citation Mismatch

**Source:** [[SRC-06 Phases vs Attributes vs Constraints vs Configurations]]
**Claim:** "Chirality, crossing numbers, strand lengths" is attributed to an IEEE Xplore snippet.
**Contradiction:** The snippet is about AABB collision-free expansion.
**Status:** Contradicted.

### 25. The `n=6, n²=64` Error

**Source:** [[SRC-05 Conspiracy Check]]
**Claim:** `n=6, n²=64`.
**Contradiction:** Should be `2⁶ = 64`, not `n²`.
**Status:** Contradicted.

### 26. The `0.0014 = 0x0d` Error

**Source:** [[SRC-05 Conspiracy Check]]
**Claim:** `0.0014 = 0x0d`.
**Contradiction:** `0x0d = 13`, not `0.0014`.
**Status:** Contradicted.

### 27. The `0/0=1` / `0%0=1` Error

**Source:** [[SRC-05 Conspiracy Check]]
**Claim:** `0/0=1` and `0%0=1`.
**Contradiction:** `0/0` is NaN, `0%0` is NaN.
**Status:** Contradicted.

### 28. The `73^43=114` Error

**Source:** [[SRC-05 Conspiracy Check]]
**Claim:** `73^43=114`.
**Contradiction:** Actual value is 98.
**Status:** Contradicted.

### 29. The Klein Configuration

**Source:** [[SRC-05 Conspiracy Check]]
**Claim:** The Klein configuration has 16 vertices.
**Contradiction:** Actual is 21.
**Status:** Contradicted.

### 30. The Missing `"z"`

**Source:** [[SRC-05 Conspiracy Check]]
**Claim:** The alphabet includes "z".
**Contradiction:** The "z" is missing.
**Status:** Contradicted.

### 31. The `HTML 1.1` Control Plane

**Source:** [[SRC-05 Conspiracy Check]]
**Claim:** There is an `HTML 1.1` control plane.
**Contradiction:** HTML 1.1 does not exist.
**Status:** Contradicted.

### 32. The `0xBA` Bash History

**Source:** [[SRC-05 Conspiracy Check]]
**Claim:** `0xBA` is a bash history entry.
**Contradiction:** It is not.
**Status:** Contradicted.

### 33. The `0x19` Conflation

**Source:** [[SRC-05 Conspiracy Check]]
**Claim:** `0x19` is conflated with ASCII 19.
**Contradiction:** `0x19 = 25`, not 19.
**Status:** Contradicted.

### 34. The `240` as LCM(1..6)

**Source:** [[SRC-05 Conspiracy Check]]
**Claim:** `240` is LCM(1..6).
**Contradiction:** LCM(1..6) = 60.
**Status:** Contradicted.

### 35. The "Prime Ladder" Including 9

**Source:** [[SRC-05 Conspiracy Check]]
**Claim:** The prime ladder includes 9.
**Contradiction:** 9 is not prime.
**Status:** Contradicted.

### 36. The `AND = a^(a^b)^b` Error

**Source:** [[SRC-05 Conspiracy Check]]
**Claim:** `AND = a^(a^b)^b`.
**Contradiction:** `a^(a^b)^b = 0`.
**Status:** Contradicted.

### 37. The LISP `bind=cons` Contradiction

**Source:** [[SRC-05 Conspiracy Check]]
**Claim:** LISP `bind=cons`.
**Contradiction:** Contradicts the claimed REPL output.
**Status:** Contradicted.

### 38. The Octtrie 7-bit Aliasing

**Source:** [[SRC-05 Conspiracy Check]]
**Claim:** The Octtrie is alias-free at 16-bit.
**Contradiction:** It has 7-bit aliasing.
**Status:** Contradicted.

### 39. The `rotl` "3C Magic Word"

**Source:** [[SRC-05 Conspiracy Check]]
**Claim:** `rotl` "3C magic word" opens any Apache server.
**Contradiction:** Unsupported security claim.
**Status:** Contradicted.

### 40. The NAND Section Caption

**Source:** [[SRC-08 XOR Gate Built with Transistors]]
**Claim:** The NAND section's caption says the connections make "the NOR gate".
**Contradiction:** It should say "the NAND gate".
**Status:** Contradicted.

### 41. The Gate 4 Cost Objection

**Source:** [[SRC-08 XOR Gate Built with Transistors]]
**Claim:** Gate 4's cost objection says "not the simplest NOR gate".
**Contradiction:** It should say "not the simplest XOR gate".
**Status:** Contradicted.

### 42. The `2N222` Typo

**Source:** [[SRC-08 XOR Gate Built with Transistors]]
**Claim:** The transistor is `2N222`.
**Contradiction:** Should be `2N2222`.
**Status:** Contradicted.

### 43. The "Tri-site Buffers" Typo

**Source:** [[SRC-08 XOR Gate Built with Transistors]]
**Claim:** The text mentions "tri-site buffers".
**Contradiction:** Unclear what this means.
**Status:** Contradicted.

### 44. The ALU XOR Total

**Source:** [[SRC-08 XOR Gate Built with Transistors]]
**Claim:** The ALU has 6 XOR gates.
**Contradiction:** "in two of the full adders" vs "four full adders and four XOR subtract gates" leaves the total ambiguous.
**Status:** Speculative.
