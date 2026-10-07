---
id: OPEN-04
title: "Discarded Claims"
kind: open
layer: open
status: canonical
spec: OMI-IMO-2026
up: "[[OMI-IMO]]"
down: []
related:
  - "[[OPEN-00 Contradiction Register]]"
  - "[[OPEN-01 Open Questions]]"
  - "[[OPEN-02 Broken Code Inventory]]"
  - "[[OPEN-03 Glossary]]"
  - "[[SPEC-00 Canonical Statement]]"
  - "[[SPEC-34 Phases Attributes Constraints Configurations]]"
sources:
  - "[[SRC-05 Conspiracy Check]]"
  - "[[SRC-06 Phases vs Attributes vs Constraints vs Configurations]]"
code: []
dimensions: []
symbols: []
tags: [omi-imo, discarded, claims, rejected, debunked]
---

# Discarded Claims

## Overview

This register tracks all claims that have been discarded because they are contradicted by the sources or by arithmetic verification.

## Discarded Claims

### 1. `2^5^8^10 = 0`

**Source:** SRC-06
**Claim:** `2^5^8^10 = 0`
**Reality:** Actual value is 5.
**Status:** Discarded.

### 2. `168 & 3125 = 32`

**Source:** SRC-06
**Claim:** `168 & 3125 = 32`
**Reality:** Actual value is 0.
**Status:** Discarded.

### 3. `168 | 3125 = 3261`

**Source:** SRC-06
**Claim:** `168 | 3125 = 3261`
**Reality:** Actual value is 3177.
**Status:** Discarded.

### 4. `95 ⊕ 59 = 1911756`

**Source:** SRC-06
**Claim:** `95 ⊕ 59 = 1911756`
**Reality:** Actual value is 100.
**Status:** Discarded.

### 5. `(n−1)²+(n+1)² = n²`

**Source:** SRC-06
**Claim:** `(n−1)²+(n+1)² = n²`
**Reality:** False for all n.
**Status:** Discarded.

### 6. `n=6, n²=64`

**Source:** SRC-05
**Claim:** `n=6, n²=64`
**Reality:** Should be `2⁶ = 64`, not `n²`.
**Status:** Discarded.

### 7. `0.0014 = 0x0d`

**Source:** SRC-05
**Claim:** `0.0014 = 0x0d`
**Reality:** `0x0d = 13`, not `0.0014`.
**Status:** Discarded.

### 8. `0/0=1` / `0%0=1`

**Source:** SRC-05
**Claim:** `0/0=1` and `0%0=1`
**Reality:** `0/0` is NaN, `0%0` is NaN.
**Status:** Discarded.

### 9. `73^43=114`

**Source:** SRC-05
**Claim:** `73^43=114`
**Reality:** Actual value is 98.
**Status:** Discarded.

### 10. The Klein Configuration "16 vertices"

**Source:** SRC-05
**Claim:** The Klein configuration has 16 vertices.
**Reality:** Actual is 21.
**Status:** Discarded.

### 11. The Missing "z"

**Source:** SRC-05
**Claim:** The alphabet includes "z".
**Reality:** The "z" is missing.
**Status:** Discarded.

### 12. The `HTML 1.1` Control Plane

**Source:** SRC-05
**Claim:** There is an `HTML 1.1` control plane.
**Reality:** HTML 1.1 does not exist.
**Status:** Discarded.

### 13. The `0xBA` Bash History

**Source:** SRC-05
**Claim:** `0xBA` is a bash history entry.
**Reality:** It is not.
**Status:** Discarded.

### 14. The `0x19` Conflation

**Source:** SRC-05
**Claim:** `0x19` is conflated with ASCII 19.
**Reality:** `0x19 = 25`, not 19.
**Status:** Discarded.

### 15. The `240` as LCM(1..6)

**Source:** SRC-05
**Claim:** `240` is LCM(1..6).
**Reality:** LCM(1..6) = 60.
**Status:** Discarded.

### 16. The "Prime Ladder" Including 9

**Source:** SRC-05
**Claim:** The prime ladder includes 9.
**Reality:** 9 is not prime.
**Status:** Discarded.

### 17. The `AND = a^(a^b)^b` Error

**Source:** SRC-05
**Claim:** `AND = a^(a^b)^b`.
**Reality:** `a^(a^b)^b = 0`.
**Status:** Discarded.

### 18. The LISP `bind=cons` Contradiction

**Source:** SRC-05
**Claim:** LISP `bind=cons`.
**Reality:** Contradicts the claimed REPL output.
**Status:** Discarded.

### 19. The Octtrie 7-bit Aliasing

**Source:** SRC-05
**Claim:** The Octtrie is alias-free at 16-bit.
**Reality:** It has 7-bit aliasing.
**Status:** Discarded.

### 20. The `rotl` "3C Magic Word"

**Source:** SRC-05
**Claim:** `rotl` "3C magic word" opens any Apache server.
**Reality:** Unsupported security claim.
**Status:** Discarded.

### 21. The NAND Section Caption

**Source:** SRC-08
**Claim:** The NAND section's caption says the connections make "the NOR gate".
**Reality:** It should say "the NAND gate".
**Status:** Discarded.

### 22. The Gate 4 Cost Objection

**Source:** SRC-08
**Claim:** Gate 4's cost objection says "not the simplest NOR gate".
**Reality:** It should say "not the simplest XOR gate".
**Status:** Discarded.

### 23. The `2N222` Typo

**Source:** SRC-08
**Claim:** The transistor is `2N222`.
**Reality:** Should be `2N2222`.
**Status:** Discarded.

### 24. The "Tri-site Buffers" Typo

**Source:** SRC-08
**Claim:** The text mentions "tri-site buffers".
**Reality:** Unclear what this means.
**Status:** Discarded.

### 25. The AI Overview's Citations

**Source:** SRC-06
**Claim:** The AI Overview's citations support its claims.
**Reality:** "Chirality, crossing numbers, strand lengths" is attributed to an IEEE Xplore snippet about AABB collision-free expansion. Two of the four citation chips point at results that never appear at all.
**Status:** Discarded.
