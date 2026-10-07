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

This register tracks every place where the sources disagree with each other or with themselves. On 2026-10-07 every entry was checked against the `_archive/` specifications, chat transcripts and code. Arithmetic was recomputed, code was run, and the β and collapse laws were checked in Coq.

The code these entries point at moved. The old `rosetta/src/constants.ts` lives on as `_archive/index.ts`. The old `rosetta/src/model.ts` and `rosetta/src/animation.frame.ts` live on as `_archive/model.ts` and `_archive/animation.frame.ts`.

### Status words

| Status | Meaning |
|--------|---------|
| Resolved | The evidence settles it. The answer is written below. |
| Corrected | This register itself was wrong. The source claim was right. |
| Confirmed bug | The code really does this. The fix is in [[OPEN-02 Broken Code Inventory]]. |
| Not a bug | The code does not do what the entry said. |
| Discarded | The source claim is false. It is moved to [[OPEN-04 Discarded Claims]]. |
| Unrecoverable | The archive does not contain the evidence needed. |

### Summary

| # | Entry | Status |
|---|-------|--------|
| 1 | 6T is XNOR | Resolved |
| 2 | Period 8 vs 240 | Resolved |
| 3 | 13 masks differ | Resolved |
| 4 | Centre 825 vs 827 | Resolved |
| 5 | `3!⊕3!⊕3!⊕1!` | Resolved |
| 6 | `12 = 1!` | Discarded |
| 7 | `β + β` | Resolved |
| 8 | Verilog swaps | Confirmed bug |
| 9 | `PALINDROME` | Confirmed bug |
| 10 | `delta16` export | Confirmed bug |
| 11 | `switch` fall-through | Confirmed bug |
| 12 | Division by zero | Not a bug |
| 13 | `pin` throws | Not a bug as stated |
| 14 | Buffer truthiness | Confirmed bug (impact was stated backwards) |
| 15 | `animation.frame.ts` | Confirmed bug |
| 16 | `isRight` arity | Not a bug |
| 17 | `xor` lengths | Confirmed bug (minor) |
| 18 | `2^5^8^10` | Discarded |
| 19 | `168 & 3125` | Corrected |
| 20 | `168 \| 3125` | Corrected |
| 21–36 | Arithmetic and claim slips | Discarded (see each) |
| 29 | Klein configuration | Discarded, with this register's value fixed |
| 37–39 | SRC-05 claims | Discarded |
| 40–43 | SRC-08 typos | Resolved |
| 44 | ALU XOR total | Unrecoverable (most likely 12) |
| 45 | Spec says AND reduces to XOR and β | Discarded (new) |
| 46 | The `delta` code has period 4, not 8 | Confirmed bug (new) |
| 47 | The `Node` constructor fails before its loops | Confirmed bug (new) |

## Contradictions

### 1. The 6T Circuit is XNOR, not XOR

**Source:** [[SRC-02 XOR Gate Transistor Circuits]]
**Claim:** The 6T computes XOR, but `Atom.apply()` returns 254/255 and the build text calls the 6T an inverter.

**Answer:** The 6T computes XOR. Two different points of the circuit were being read.

- The 5T's output node (BOOT0, the collector of Q4) is XNOR as a voltage. Its LED is wired to sink current into that node, so the LED lights when the node is low. That is why the 5T *looks* like XOR.
- The 6T feeds BOOT0 through 2 kΩ into the base of Q6. Q6's collector (BOOT1) is the inverse, which is XOR. The yellow LED is driven from it to ground.
- `Atom.apply` does the same two steps in code: `~xor(a, b) & 0xFF` is the XNOR node, and `^ 0x01` is the Q6 inverter. But the inverter is applied to bit 0 only, so bits 1–7 stay set. Bit 0 is exactly XOR, and the value is 254 + XOR. Fix: `xor(a, b) & 0x01`.

**Evidence:** rev1 §7.2–7.3 ("BOOT0 → 2kΩ → B(Q6)"); Gemini notebook, Stage 2 ("C(Q6) → 330Ω → Yellow LED → GND"); [[SRC-08 XOR Gate Built with Transistors]] claim 11 (the 5T LED sinks current); the self-test in [[SPEC-44 The Virtual Breadboard]] (reading the 6T at BOOT0 gives `1001`).
**Status:** Resolved.

### 2. The Period-8 vs Period-240 Conflict

**Claim:** The delta has period 8, but the protocol's time crystal has period 240.

**Answer:** They are different layers of one clock, not competing claims. 8 divides 240 and 240 divides 5040: 240 = 8 × 30 and 5040 = 240 × 21. A delta stepped once per tick returns to its start 30 times per 240-tick orbit, so it is phase-locked to the clock.

| Layer | Period | Where it comes from |
|-------|--------|---------------------|
| Unit cell | 8 | the delta law on 16-bit words |
| Time crystal | 240 | 60 positions × 4 orientations = 15 × 16 |
| Supercell | 5040 | 7 Fano × 3 roles × 240 = 7! |

Precision on "period 8": over all 65,536 16-bit states every orbit length divides 8. With carry `c = 0` there are orbits of 1, 2 and 4, so 8 is the period of the map, not of every state. This was recomputed for this register and agrees with rev1 §5.2.
**Evidence:** rev1 §14.2 (Period Hierarchy); rev1 §5.2; "The 60-in-64 Clock" (`7-part × 720 + 3-part × 240 + position`).
**Status:** Resolved.

### 3. The 13-Mask Discrepancy

**Claim:** There are 13 canonical masks whose XOR is `0x00`. [[SRC-03 Protocol Sequence Analysis]] and [[SRC-02 XOR Gate Transistor Circuits]] print different lists.

**Answer:** The SRC-02 list is canonical:

```
0x00, 0x07, 0xFF, 0x78, 0x87, 0x20, 0x80, 0xAA, 0x55, 0x27, 0xD8, 0xA0, 0x07
```

It XORs to `0x00`, the property the masks are defined by. It appears unchanged in DeepSeek0 and three times in DeepSeek2. It is built from complement pairs (`0x00/0xFF`, `0x78/0x87`, `0xAA/0x55`, `0x27/0xD8`, `0x5F/0xA0` via `0x20^0x80^0xFF`) plus the repeated `0x07`. The SRC-03 list (`…0x27, 0x27, 0x5F, 0x7F, 0x00`) appears once and XORs to `0x7F`, so it fails its own closure law.
**Status:** Resolved. The SRC-03 list is moved to [[OPEN-04 Discarded Claims]].

### 4. The 825 vs 827 Centre Correction

**Answer:** 827, as the transcript corrected itself.
**Status:** Resolved.

### 5. The `3! XOR 3! XOR 3! XOR 1!` Expression

**Claim:** The same expression is given as 19, 216 and 7.

**Answer:** Each number is a different operator applied to 6, 6, 6, 1:

| Operator | Value |
|----------|-------|
| XOR `⊕` | 7 |
| sum `+` | 19 |
| product `×` | 216 |

Written with `⊕`, the expression is 7 (`6⊕6 = 0`, then `6⊕1 = 7`), checked in Coq (`collapse`). The "19" in the transcript is the sum written with the wrong symbol. The companion claim `3!⊕3!⊕3!⊕3! = 1296` is the product 6⁴. With XOR it is 0.
**Status:** Resolved.

### 6. `12 = 1!` vs `1! = 1`

**Answer:** Discarded. The transcript calls 12 "the 1! from the 3! ⊕ 3! ⊕ 3! ⊕ 1!", but the 1! in that expression is 1. 12 has its own exact meanings elsewhere, and neither is 1!: `16xy = 12` at xy = 3/4, and `12 = 0b01100` is the diagonal (rev1 §4.5).
**Status:** Discarded.

### 7. `beta + beta = 0` vs `beta + beta = 2`

**Answer:** The protocol's law is `β ⊕ β = 0`, XOR not addition. The transcript's Coq wrote `beta + beta = 0` over natural numbers, which is false (1 + 1 = 2), so it could only be `Admitted`. The later `beta + beta = 2. Proof. reflexivity. Qed.` is the true statement about `+`, but not the intended law. Checked in Coq on 2026-10-07: `N.lxor beta beta = 0` and the four-flip cancellation of rev1 §6.2 both prove by `reflexivity`.
**Status:** Resolved.

### 8. Verilog `swap16` and `swap64` Branches

**Answer:** It is a copy-paste bug, and `swap32` is also wrong. In `omi_swap_engine` (DeepSeek3 p. 879) the `2'b00` and `2'b10` bodies both reverse all 8 bytes. The `2'b01` body concatenates 88 bits into a 64-bit register. The correct bodies match Node's `Buffer.swap16/32/64`, which [[SRC-04 Assembly Register Programming]] says the swaps are; see [[OPEN-02 Broken Code Inventory]] #18.
**Status:** Confirmed bug.

### 9. The `PALINDROME` Pattern

**Answer:** It was dropped from `G`. The Synthesis lists `PALINDROME: /^(\d\d)[A-Za-z_\-](\d\d):\2[0-9_\-]\1$/` next to `AXIS`, and `_archive/index.ts` has `AXIS` but not `PALINDROME`. They are different patterns: PALINDROME also allows `-` in the middle and `_` instead of `+` on the right.
**Status:** Confirmed bug ([[OPEN-02 Broken Code Inventory]] #9).

### 10. The `delta16` Export

**Answer:** True: `function delta16` in `_archive/index.ts` has no `export`. Also, `model.ts` imports from `./constants`, a file that no longer exists; the code is in `./index`.
**Status:** Confirmed bug.

### 11. The `switch` Fall-Through

**Answer:** True. In `switch (true)`, the first matching case runs every case below it, so a right-rotation also negates the left slot, the linear slot and the diagonal. Nothing in the archive says whether this cascade was intended.
**Status:** Confirmed bug (intent unknown).

### 12. The Division by Zero

**Answer:** The entry is wrong. JavaScript `x % 0` is `NaN`, not an exception, so `linear % count === 0` is just `false` while `count` is 0. Checked by running it.
**Status:** Not a bug.

### 13. The `pin` Method

**Answer:** The entry is wrong about the symptom. `pin` is an `async *` generator, so calling `pin()` runs nothing. Only iterating it runs the body, and then the outer `catch` swallows the error: it logs `finally` and `outer oops` and finishes with no value. The `console.error("inner", …)` line can never run. The real problem is that `pin` never yields or returns the Blob URL it builds.
**Status:** Not a bug as stated; rewritten as [[OPEN-02 Broken Code Inventory]] #4.

### 14. The `Node`/`Buffer` Truthiness

**Answer:** True, but the impact was stated backwards. A Buffer is always truthy, even when empty, so `if (front || …) throw` fires on every pass. The check always throws; it does not "never fire". In practice the constructor fails even earlier (#47).
**Status:** Confirmed bug.

### 15. The `animation.frame.ts` Invalid TS

**Answer:** True, and more than `this.Q` is wrong. The class defines `q`, `e` and `E` but calls `this.Q`. From line 80 on the file is notebook prose (the Polybius split, the Fano tickets, quadratic forms) rather than TypeScript. The prose says Q is the affine form `16x² + 16xy + 4y² = (4x + 2y)²`, which is the class's `e`.
**Status:** Confirmed bug.

### 16. The `isRight` Arity Mismatch

**Answer:** The entry is wrong. `RIGHT = /^[^0-9+-]\.[0-9+-]$/` has no capture groups, and `isRight` only calls `.test()`. The "byte-identical LEFT and RIGHT" defect flagged in [[SRC-01 XOR Tetrahedron Transform]] is also absent: `LEFT` and `RIGHT` are mirror images.
**Status:** Not a bug.

### 17. The `xor` Length Mismatch

**Answer:** True. If `b` is shorter, `v ^ undefined` silently gives `v`. If `a` is shorter, the result is truncated. Every current caller passes 8-byte halves, so nothing breaks today.
**Status:** Confirmed bug (minor).

### 18. The `2^5^8^10 = 0` Error

**Answer:** It is 5. **Status:** Discarded.

### 19. The `168 & 3125` Value

**Answer:** The source was right and this register was wrong. 168 = `0b000010101000` and 3125 = `0b110000110101` share exactly bit 5, so `168 & 3125 = 32`.
**Status:** Corrected.

### 20. The `168 | 3125` Value

**Answer:** The source was right and this register was wrong: `168 | 3125 = 3261` (3125 + 128 + 8).
**Status:** Corrected.

### 21. `95 ⊕ 59 = 1911756`

**Answer:** `95 ⊕ 59 = 100`. 1911756 is not the XOR, sum (154) or product (5605). **Status:** Discarded.

### 22. `(n−1)² + (n+1)² = n²`

**Answer:** The left side is `2n² + 2`, which never equals `n²` for real n. **Status:** Discarded.

### 23. The 7-Element Literal Group

**Answer:** The duplicated `0d` is a misprint of `0i`. The seven are the 3 literal kinds plus the 4 radices: `{0p, 0i, 0n}` + `{0b, 0o, 0x, 0d}`. This matches the `LITERAL` grammar `\d+[boxd]\d+[pin]` and the types `POINT/INDEX/NUMBER` + `BINARY/OCTAL/HEX/DECIMAL` in `_archive/index.ts`.
**Status:** Resolved.

### 24. The IEEE Citation Mismatch

**Status:** Discarded (the cited snippet is about AABB expansion).

### 25. `n=6, n²=64`

**Answer:** `2⁶ = 64`; `6² = 36`. **Status:** Discarded.

### 26. `0.0014 = 0x0d`

**Answer:** `0x0d = 13`. **Status:** Discarded.

### 27. `0/0 = 1`, `0%0 = 1`

**Answer:** Both are `NaN` in JavaScript. (In Coq's `nat` both are 0, never 1.) **Status:** Discarded.

### 28. `73^43 = 114`

**Answer:** `73 ⊕ 43 = 98`. **Status:** Discarded.

### 29. The Klein Configuration

**Answer:** The Klein configuration has **60 points and 60 planes**, each on 15 of the other (60₁₅). The source's "16 vertices" is wrong. 16₆ is the Kummer configuration, a different object. This register's earlier "21" was also wrong. The transcripts' own kernel `76 = 60 + 12 + 4` already uses 60 Klein points.
**Status:** Discarded; this register's value is fixed.

### 30. The Missing `"z"`

**Answer:** No code path emits `"z"`; the transcript itself concluded it was a typo. **Status:** Discarded.

### 31. The `HTML 1.1` Control Plane

**Answer:** HTML 1.1 does not exist. The protocol's wire carrier is HTTP/1.1 ([[SPEC-54 The Web Platform Layers]]), which is almost certainly what was meant. **Status:** Discarded.

### 32. The `0xBA` Bash History

**Status:** Discarded.

### 33. The `0x19` Conflation

**Answer:** `0x19 = 25` (ASCII EM, a control code). **Status:** Discarded.

### 34. `240` as LCM(1..6)

**Answer:** LCM(1..6) = 60, and 240 = 60 × 4. **Status:** Discarded.

### 35. The "Prime Ladder" Including 9

**Status:** Discarded.

### 36. `AND = a^(a^b)^b`

**Answer:** `a ⊕ (a ⊕ b) ⊕ b = 0` for every input. See #45: the same formula is in the rev1 spec. **Status:** Discarded.

### 37. LISP `bind = cons`

**Status:** Discarded.

### 38. The Octtrie 7-bit Aliasing

**Status:** Discarded.

### 39. The `rotl` "3C Magic Word"

**Status:** Discarded.

### 40. The NAND Section Caption

**Answer:** The caption should say the NAND gates are connected "to make the **XOR** gate". That is the section's subject, and [[SPEC-44 The Virtual Breadboard]] verifies the 4-NAND XOR. The earlier correction "NAND gate" was wrong.
**Status:** Resolved.

### 41. The Gate 4 Cost Objection

**Answer:** "not the simplest **XOR** gate". **Status:** Resolved.

### 42. The `2N222` Typo

**Answer:** `2N2222`. **Status:** Resolved.

### 43. "Tri-site Buffers"

**Answer:** "Tri-**state** buffers", the standard bus driver with high / low / disconnected outputs. That fits the sentence: registers connect to the data bus through buffers. **Status:** Resolved.

### 44. The ALU XOR Total

**Answer:** The archive cannot settle this, because the schematics are images. A standard full adder uses 2 XORs, which gives 4 × 2 + 4 subtract = **12**. Read literally, "in two of the full adders" gives 2 + 4 = 6. 12 is the most likely.
**Status:** Unrecoverable from text.

### 45. "All Gates Reduce to XOR and β" (new)

**Source:** rev1 §6.1–6.2.
**Claim:** `AND = a ⊕ (a ⊕ b) ⊕ b`, and so OR, NAND and NOR also reduce to XOR and β.
**Answer:** False. That AND formula is always 0 (#36). XOR with constants can only build gates whose output flips evenly with the inputs: BUF, NOT, XOR and XNOR. AND, OR, NAND and NOR need a product term, written `a·b` or `a ∧ b`. The virtual breadboard shows this term directly: every one of those gates has a non-zero `cxy` coefficient ([[SPEC-44 The Virtual Breadboard]]). The β-cancellation in §6.2 still holds for the XOR/XNOR/NOT family.
**Status:** Discarded (the spec needs the product term).

### 46. The `delta` Code Has Period 4 (new)

**Source:** `_archive/index.ts` vs rev1 §5.2.
**Answer:** `delta` rotates the 8 *bytes* of the state, not the 16 bits of each word. On 8 positions the map returns after 4 steps, not 8. rev1 §5.2 already warns that the state "has to be processed as 16-bit words". The code does not do that.
**Status:** Confirmed bug ([[OPEN-02 Broken Code Inventory]] #19).

### 47. The `Node` Constructor Never Reaches Its Loops (new)

**Source:** `_archive/model.ts`.
**Answer:** With default arguments, `Buffer.concat([2 bytes, 8 bytes])` is 10 bytes, and `centroid.swap32()` throws `ERR_INVALID_BUFFER_SIZE`. Even with a valid size, `swap16/32/64` reverse the buffer in place and return the *same* buffer, so `front`, `back`, `up`, `down`, `left` and `right` are one aliased object, not six faces.
**Status:** Confirmed bug ([[OPEN-02 Broken Code Inventory]] #20).
