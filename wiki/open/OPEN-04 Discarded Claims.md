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

This register tracks claims that have been discarded because they are false by arithmetic, by code, or by the sources themselves. Every entry was re-checked on 2026-10-07.

Two earlier entries were wrong to be here: `168 & 3125 = 32` and `168 | 3125 = 3261` are both true. They are now listed under *Reinstated*.

## Reinstated (true after all)

| Claim | Check |
|-------|-------|
| `168 & 3125 = 32` | 168 = `0b000010101000`, 3125 = `0b110000110101`; the only shared bit is 32. |
| `168 \| 3125 = 3261` | 3125 + 128 + 8 = 3261. |

## Discarded Claims

| # | Source | Claim | Reality |
|---|--------|-------|---------|
| 1 | SRC-06 | `2^5^8^10 = 0` | `2⊕5⊕8⊕10 = 5` |
| 4 | SRC-06 | `95 ⊕ 59 = 1911756` | `95 ⊕ 59 = 100` |
| 5 | SRC-06 | `(n−1)² + (n+1)² = n²` | The left side is `2n² + 2`; never equal for real n |
| 6 | SRC-05 | `n = 6, n² = 64` | `2⁶ = 64`; `6² = 36` |
| 7 | SRC-05 | `0.0014 = 0x0d` | `0x0d = 13` |
| 8 | SRC-05 | `0/0 = 1`, `0%0 = 1` | `NaN` in JavaScript (0 in Coq `nat`) |
| 9 | SRC-05 | `73^43 = 114` | `73 ⊕ 43 = 98` |
| 10 | SRC-05 | Klein configuration has 16 vertices | 60 points and 60 planes (60₁₅). 16₆ is the Kummer configuration. The previously recorded "21" was also wrong. |
| 11 | SRC-05 | Code emits `"z"` | No code path does |
| 12 | SRC-05 | `HTML 1.1` control plane | No such spec; probably meant HTTP/1.1 |
| 13 | SRC-05 | `0xBA` is bash history | Unsupported |
| 14 | SRC-05 | `0x19` read as 19 | `0x19 = 25` |
| 15 | SRC-05 | `240 = LCM(1..6)` | LCM(1..6) = 60; 240 = 60 × 4 |
| 16 | SRC-05 | Prime ladder includes 9 | 9 = 3² |
| 17 | SRC-05, rev1 §6.1 | `AND = a^(a^b)^b` | Always 0. AND needs a product term (see #29) |
| 18 | SRC-05 | LISP `bind = cons` | Contradicts the claimed REPL output |
| 19 | SRC-05 | Octtrie is alias-free at 16 bits | 7-bit aliasing |
| 20 | SRC-05 | `rotl` "3C magic word" opens any Apache server | Unsupported security claim |
| 25 | SRC-06 | The AI Overview's citations support its claims | The chips point at unrelated or absent results; the `[1]`–`[14]` links were lost in printing |

### Corrected readings (typos, not claims)

These were filed as discarded but are just misprints with a clear intended reading:

| # | Source | As printed | Intended |
|---|--------|-----------|----------|
| 21 | SRC-08 | NAND gates connected "to make the NOR gate" | "…the **XOR** gate" (the earlier correction to "NAND" was wrong) |
| 22 | SRC-08 | "not the simplest NOR gate" | "…XOR gate" |
| 23 | SRC-08 | `2N222` | `2N2222` |
| 24 | SRC-08 | "tri-site buffers" | tri-**state** buffers |
| 26 | SRC-06 | `[0p, 0n, 0d, 0b, 0o, 0x, 0d]` | `[0p, 0i, 0n, 0b, 0o, 0x, 0d]`: 3 literals + 4 radices |

### Added 2026-10-07

| # | Source | Claim | Reality |
|---|--------|-------|---------|
| 27 | SRC-03 | 13 masks `0x00,0xFF,0x78,0x87,0x20,0x80,0xAA,0x55,0x27,0x27,0x5F,0x7F,0x00` | XOR to `0x7F`, failing the closure law. The canonical list is SRC-02's ([[OPEN-00 Contradiction Register]] #3) |
| 28 | SRC-03 | `12 = imaginary unit = 1!` | `1! = 1`; 12 is 60's wordform at 4 bits, the last-block offset `0x0C` ([[OPEN-01 Open Questions]] #13) |
| 29 | rev1 §6.1 | "All gates reduce to XOR and β" | Only BUF, NOT, XOR and XNOR do. AND, OR, NAND and NOR need a product term ([[SPEC-44 The Virtual Breadboard]]) |
| 30 | SRC-03 | `3! ⊕ 3! ⊕ 3! ⊕ 1! = 19`, `3!⊕3!⊕3!⊕3! = 1296` | Under XOR: 7 and 0. 19 is the sum; 1296 = 6⁴ |
| 31 | SRC-03 | Coq `beta + beta = 0` (`Admitted`) | False over `nat`. The law is `N.lxor beta beta = 0`, proved by `reflexivity` |
| 32 | SRC-02 | The 6T computes XNOR | It computes XOR; BOOT0 (the 5T node) is the XNOR ([[OPEN-00 Contradiction Register]] #1) |
| 33 | SRC-03 (lines 42400–44719) | The three swaps generate the permutation group of order 6 | They commute; the group has order 8. All 6 orderings give the same permutation |
| 34 | SRC-03 (same) | The 20 `{β,β,β}` triples are "the free hexomino count minus the Fano lines" | 35 − 7 = 28 |
| 35 | SRC-03 (same) | The 35 sedenion triples *are* the 35 free hexominoes; the 60 `{α,β,γ}` triples *are* the Klein configuration | Equal counts only. The triples are XOR lines of indices (see [[OPEN-03 Glossary]], *distinguished triples*) |
