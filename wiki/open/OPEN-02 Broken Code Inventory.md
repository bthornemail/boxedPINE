---
id: OPEN-02
title: "Broken Code Inventory"
kind: open
layer: open
status: canonical
spec: OMI-IMO-2026
up: "[[OMI-IMO]]"
down: []
related:
  - "[[OPEN-00 Contradiction Register]]"
  - "[[OPEN-01 Open Questions]]"
  - "[[OPEN-03 Glossary]]"
  - "[[OPEN-04 Discarded Claims]]"
  - "[[SPEC-61 Implementation Status]]"
sources:
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-04 Assembly Register Programming]]"
  - "[[SRC-05 Conspiracy Check]]"
code:
  - "rosetta/src/model.ts"
  - "rosetta/src/constants.ts"
  - "rosetta/src/animation.frame.ts"
  - "rosetta/src/index.ts"
dimensions: []
symbols: []
tags: [omi-imo, bugs, broken, code, inventory]
---

# Broken Code Inventory

## Overview

This inventory tracks all known bugs in the OMI-IMO implementation. Each bug is a place where the code does not match the specification.

## Bugs

### 1. `delta16` Not Exported

**File:** `rosetta/src/constants.ts`
**Bug:** `delta16` is not exported.
**Impact:** `model.ts` cannot import it.
**Fix:** Add `export` to `function delta16`.

### 2. `switch` Fall-Through

**File:** `rosetta/src/model.ts`
**Bug:** The `switch` statement has fall-through cases without `break`.
**Impact:** The cases execute in unexpected order.
**Fix:** Add `break` to each case.

### 3. Division by Zero

**File:** `rosetta/src/model.ts`
**Bug:** `linear % count === 0` throws when `count === 0`.
**Impact:** The Node constructor crashes on the first iteration.
**Fix:** Check `count !== 0` first.

### 4. `pin` Always Throws

**File:** `rosetta/src/model.ts`
**Bug:** The `pin` method always throws — the try/catch/finally structure is broken.
**Impact:** The `pin` method is unusable.
**Fix:** Rewrite the try/catch/finally structure.

### 5. `Node`/`Buffer` Truthiness

**File:** `rosetta/src/model.ts`
**Bug:** `if (front || back || right || left || up || down)` is always truthy.
**Impact:** The error check never fires.
**Fix:** Check `front.length > 0` etc.

### 6. `animation.frame.ts` Invalid TS

**File:** `rosetta/src/animation.frame.ts`
**Bug:** Missing `this.Q` reference.
**Impact:** The file does not compile.
**Fix:** Add `Q` to the class.

### 7. `isRight` Arity Mismatch

**File:** `rosetta/src/constants.ts`
**Bug:** `isRight` takes 1 arg but `RIGHT` regex has 2 capture groups.
**Impact:** The function may not work as expected.
**Fix:** Check the arity.

### 8. `xor` Length Mismatch

**File:** `rosetta/src/constants.ts`
**Bug:** `xor(a, b)` assumes `a` and `b` have the same length.
**Impact:** The function may produce unexpected results.
**Fix:** Check the lengths.

### 9. `PALINDROME` Missing

**File:** `rosetta/src/constants.ts`
**Bug:** `PALINDROME` is referenced in the synthesis but not in the actual `G` object.
**Impact:** The pattern is unavailable.
**Fix:** Add `PALINDROME: /^(\d\d)[A-Za-z_\-](\d\d):\2[0-9_\-]\1$/` to `G`.

### 10. `apply` Stub

**File:** `rosetta/src/model.ts`
**Bug:** The `apply` method is a stub — declared but not implemented.
**Impact:** The `apply` primitive is missing.
**Fix:** Implement the `apply` method.

### 11. `learn` Missing

**File:** Not yet implemented.
**Bug:** The self-modifying kernel's `learn` method is not yet implemented.
**Impact:** The kernel cannot extend its own grammar.
**Fix:** Implement the `learn` method.

### 12. `regenerate` Missing

**File:** Not yet implemented.
**Bug:** The kernel regeneration from description is not yet implemented.
**Impact:** The kernel cannot regenerate itself.
**Fix:** Implement the `regenerate` function.

### 13. Self-Test Not Run

**File:** Not yet implemented.
**Bug:** The self-test is not yet run.
**Impact:** The implementation is not verified.
**Fix:** Run the self-test.

### 14. `G.PALINDROME` Undefined

**File:** `rosetta/src/constants.ts`
**Bug:** `G.PALINDROME` is undefined.
**Impact:** Code that references it will crash.
**Fix:** Add `PALINDROME` to the `G` object.

### 15. `linear % 0 = NaN`

**File:** `rosetta/src/model.ts`
**Bug:** `linear % 0` is NaN.
**Impact:** The check `linear % count === 0` fails when `count === 0`.
**Fix:** Check `count !== 0` first.

### 16. `DataAllocator.allocate` Undefined `range`

**File:** Referenced in SRC-02.
**Bug:** `DataAllocator.allocate` references an undefined `range`.
**Impact:** The code crashes.
**Fix:** Define `range` or remove the reference.

### 17. `decodeFrame` Hard-Coded Receipt Metadata

**File:** Referenced in SRC-02.
**Bug:** `decodeFrame` has hard-coded receipt metadata.
**Impact:** The code is not general.
**Fix:** Parameterize the metadata.
