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

This inventory tracks known defects in the OMI-IMO code. On 2026-10-07 every entry was checked by reading the code and, where possible, running it. The code moved: entries that said `rosetta/src/constants.ts` now point at `_archive/index.ts`, which holds the same symbols. `rosetta/src/model.ts` is now `_archive/model.ts`, and `animation.frame.ts` is now `_archive/animation.frame.ts`.

**Plain-language summary:** the archived TypeScript is a sketchbook, not a program. `index.ts` and `animation.frame.ts` do not compile at all, and `model.ts` fails on its first line of real work. The working pieces of this protocol are:

- the period-8 Coq proof in `omi-files/omi-axioms`
- the self-generating kernel in the Fano Fold conversation (#11)
- the virtual breadboard (`space/breadboard/`)

| # | Bug | Verdict |
|---|-----|---------|
| 1 | `delta16` not exported | Confirmed |
| 2 | `switch` fall-through | Confirmed (intent unknown) |
| 3 | Division by zero | Not a bug |
| 4 | `pin` | Rewritten: it never returns its URL |
| 5 | Buffer truthiness | Confirmed; always throws |
| 6 | `animation.frame.ts` | Confirmed; not a TS file |
| 7 | `isRight` arity | Not a bug |
| 8 | `xor` lengths | Confirmed (minor) |
| 9 | `PALINDROME` missing | Confirmed |
| 10 | `apply` stub | Confirmed; design known |
| 11 | `learn` missing | Exists in the archive; not yet in the repo |
| 12 | `regenerate` missing | Exists in the archive; grammar only |
| 13 | Self-test not run | Run (19/20) |
| 14 | `G.PALINDROME` undefined | Duplicate of #9 |
| 15 | `linear % 0` | Duplicate of #3 |
| 16 | `DataAllocator.allocate` | Transcript-only |
| 17 | `decodeFrame` metadata | Transcript-only |
| 18 | Verilog swap engine | Confirmed; fixed and simulated |
| 19 | `delta` rotates bytes | Not a bug: intended block reading |
| 20 | `Node` constructor | Confirmed (new) |
| 21 | Kernel `HEX` regex | Confirmed (new) |
| 22 | `index.ts` does not compile | Confirmed (new) |
| 23 | `Atom.apply` keeps 7 extra bits | Confirmed (new) |
| 24 | Haskell `rotr2` is `rotl 6` | Fixed in `omi-files/omi-canvas/src/OMI/Delta.hs` |

## Bugs

### 1. `delta16` Not Exported

**File:** `_archive/index.ts`
**Bug:** `function delta16` has no `export`, and `model.ts` imports it from `./constants`, a path that no longer exists.
**Fix:** `export function delta16`, and import from `./index`.

### 2. `switch` Fall-Through

**File:** `_archive/model.ts`
**Bug:** In `switch (true)`, the first matching case runs every case below it.
**Fix:** If each rule is meant to apply alone, add `break` to each case. If the cascade is meant, say so in a comment. The archive does not say which.

### 3. Division by Zero — not a bug

**File:** `_archive/model.ts`
**Finding:** `linear % 0` is `NaN` in JavaScript, never an exception, so the case is just skipped while `count` is 0. Checked by running it.

### 4. `pin` Never Returns Its Result

**File:** `_archive/model.ts`
**Finding:** The old entry said `pin` "always throws". It does not. `pin` is an `async *` generator, so calling it does nothing until it is iterated. When iterated, its outer `catch` swallows the error and logs `finally`, then `outer oops`.
**Bug:** It builds a Blob URL for the function twice and never yields or returns it. `regex` is never used, and the inner `console.error` cannot run.
**Fix:** Make `pin` a plain function that creates the Blob URL, stores it under `name`, and returns it. See [[OPEN-01 Open Questions]] #7.

### 5. `Node`/`Buffer` Truthiness

**File:** `_archive/model.ts`
**Bug:** Buffers are always truthy, so `if (front || back || …) throw` fires on the first pass. It always throws; it does not "never fire".
**Fix:** `if (!front.length || !back.length || …)`.

### 6. `animation.frame.ts` Is Not a TypeScript File

**File:** `_archive/animation.frame.ts`
**Bug:** The class calls `this.Q` but defines only `q`, `e` and `E`. From line 80 on, the file is notebook prose.
**Fix:** Keep lines 1–79 as code. The notes say Q is `16x² + 16xy + 4y² = (4x + 2y)²`, which is the class's `e`, so rename `e` to `Q`. Move the prose into the wiki.

### 7. `isRight` Arity Mismatch — not a bug

**File:** `_archive/index.ts`
**Finding:** `RIGHT = /^[^0-9+-]\.[0-9+-]$/` has no capture groups, and `isRight` only calls `.test()`.

### 8. `xor` Length Mismatch

**File:** `_archive/index.ts`
**Bug:** A shorter `b` gives `v ^ undefined = v`, and a shorter `a` truncates the result. All current callers pass equal 8-byte halves.
**Fix:** Throw if `a.length !== b.length`.

### 9. `PALINDROME` Missing from `G`

**File:** `_archive/index.ts`
**Fix:** Add `PALINDROME: /^(\d\d)[A-Za-z_\-](\d\d):\2[0-9_\-]\1$/` to `G`, as in the Synthesis. It is not the same as `AXIS`. **Done** in `rosetta/src/grammar/grammar.ts`; the old `core/src/index.ts` copy is unchanged.

### 10. `apply` Stub

**File:** `_archive/model.ts`
**Bug:** `apply` returns `undefined`.
**Fix:** The design is in [[OPEN-01 Open Questions]] #6: `bind` with the correction half set, then one `delta16` step.

### 11. `learn` — exists, not yet in the repo

**Finding:** A working `learn` is in the Fano Fold conversation ("The complete file", `_archive/The try xor catch xnor finally as the Fano Plane of the Fold.md`, lines ~1404–1625). `index.ts` cannot use it as is, because its `G` is wrapped in `Object.freeze`. `learn` needs the mutable `Map` grammar.
**Done (2026-10-07):** now `rosetta/src/grammar/kernel.ts`, with the #21 fix, tested in `src/testbed/rosetta.test.ts`.

### 12. `regenerate` — exists, grammar only

**Finding:** Same file. It replays learned rules but not positions; see [[OPEN-01 Open Questions]] #9.

### 13. Self-Test — run

**Finding:** The Fano Fold kernel's `selfTest()` was run on 2026-10-07 and passed 19 of 20 checks. The only failure was `HEX matches 0xFF` (#21). Separately, the virtual breadboard self-test passes all checks (`npm test` in `space/breadboard`).

### 14. `G.PALINDROME` Undefined

Duplicate of #9.

### 15. `linear % 0 = NaN`

Duplicate of #3, and not a crash.

### 16. `DataAllocator.allocate` Undefined `range`

**Finding:** This code exists only inside the [[SRC-02 XOR Gate Transistor Circuits]] transcript. No file in this repo or in `_archive/` contains it.
**Status:** Out of scope until that code is brought into the repo.

### 17. `decodeFrame` Hard-Coded Receipt Metadata

Same as #16: transcript-only.

### 18. Verilog `omi_swap_engine` (new entry)

**Source:** DeepSeek3 transcript, p. 879.
**Bug:** The `swap16` and `swap64` branches both reverse all 8 bytes. The `swap32` branch concatenates 88 bits.
**Fix:** These are the bodies that match Node's `Buffer.swap16/32/64`. They were checked in Icarus Verilog on 2026-10-07 against input `0x0706050403020100`.

```verilog
2'b00: o_buffer <= {i_buffer[55:48], i_buffer[63:56], i_buffer[39:32], i_buffer[47:40],
                    i_buffer[23:16], i_buffer[31:24], i_buffer[7:0],   i_buffer[15:8]};   // swap16
2'b01: o_buffer <= {i_buffer[39:32], i_buffer[47:40], i_buffer[55:48], i_buffer[63:56],
                    i_buffer[7:0],   i_buffer[15:8],  i_buffer[23:16], i_buffer[31:24]};  // swap32
2'b10: o_buffer <= {i_buffer[7:0],   i_buffer[15:8],  i_buffer[23:16], i_buffer[31:24],
                    i_buffer[39:32], i_buffer[47:40], i_buffer[55:48], i_buffer[63:56]};  // swap64
```

Output byte `j` takes input byte `j ⊕ 1`, `j ⊕ 3` or `j ⊕ 7` respectively.

### 19. `delta` Rotates Bytes — intended (reclassified)

**File:** `_archive/index.ts`
**Finding:** `rotl`/`rotr` rotate the 8 byte positions, so the map has period 4. The author confirmed on 2026-10-07 that this is the block reading (four 64-value quarters per byte), not a bug; see [[OPEN-00 Contradiction Register]] #46. The bit-level delta, with period 8, is a separate law.
**Remaining issue:** naming only. `index.ts` calls its block-level ruler fold `delta16`, which is rev1's name for the bit-level law. That fold has period 12. Name the two differently, for example `deltaBlock` and `delta16`.

### 20. `Node` Constructor Fails Before Its Loops (new)

**File:** `_archive/model.ts`
**Bug:** With default arguments `centroid` is 10 bytes, and `swap32()` throws `ERR_INVALID_BUFFER_SIZE`. Also, `swap16/32/64` change the buffer in place and return it, so all six faces are the same object.
**Fix:** Use a 16-byte centroid, and copy before each swap: `Buffer.from(centroid).swap16()`. The swaps are meant as permutations, not mutations ([[OPEN-00 Contradiction Register]] #48).

### 21. Kernel `HEX` Pattern (new)

**File:** the Fano Fold kernel (and rev1 §9.2, and SPEC-30).
**Bug:** `HEX: /^0x(\d+)$/` rejects `0xFF`. `BINARY` and `OCTAL` accept digits that are not valid in their base, such as `0b9`.
**Fix:** `/^0x([0-9A-Fa-f]+)$/`, `/^0b([01]+)$/`, `/^0o([0-7]+)$/`. The corrected Haskell grammar (`defaultGrammar` in "The OMI Protocol in Pure Haskell - Corrected") already uses exactly these. Only the JavaScript versions still need the fix. Separately, the two grammars disagree on EXPONENT: Haskell `^e([0-9]+)$` vs JavaScript `^(\d+)e(\d+)$`.

### 22. `index.ts` Does Not Compile (new)

**File:** `_archive/index.ts`
**Bug:**
- `interface iExtant` contains initializers and a function body.
- `class Simplex` declares members with `function`.
- `omi`, `tensor` and `Deviation` are undefined.
- `Triangle.X` passes plain numbers to `Atomics.compareExchange`.

**Fix:** Split the file. The first ~315 lines (types, `G`, `rotl`/`rotr`/`xor`/`delta`/`delta16`) are sound once #1 and #9 are applied. The class sketches after that are notes, not code.

### 23. `Atom.apply` Keeps Seven Extra Bits (new)

**Source:** [[SRC-02 XOR Gate Transistor Circuits]] (transcript code).
**Bug:** `xor(~xor(a, b) & 0xFF, 0x01)` gives 254 or 255. Bit 0 is the correct XOR; see [[OPEN-00 Contradiction Register]] #1.
**Fix:** `xor(a, b) & 0x01`.

### 24. Haskell `rotr2` Is `rotl 6` (new)

**Files:** `_archive/The OMI Protocol in Pure Haskell - Corrected.md` (Part III) and `omi-files/omi-canvas/src/OMI/Delta.hs`.
**Bug:** The `rotr2` pattern `W16 (B a7 a8 b1 … b6) (B b7 b8 a1 … a6)` rotates **left by 6**, not right by 2. GHC checked this against `Data.Bits` on all 65,536 words on 2026-10-07. The period is still 8 by coincidence, but the Haskell delta gives different values from rev1, the Coq proof and the JavaScript for the same input. Two peers using different implementations would disagree.
**Fixed 2026-10-07 in `omi-files/omi-canvas/src/OMI/Delta.hs`.** After the fix, the module's `delta` equals `rotl1 ^ rotl3 ^ rotr2 ^ c` on all 65,536 words for carries `0x0000`, `0x001D`, `0x1D1D`, `0x1337` and `0xFFFF`. Before the fix it did not. The `_archive` copy is left as written. The corrected line:

```haskell
rotr2 (W16 (B a1 a2 a3 a4 a5 a6 a7 a8) (B b1 b2 b3 b4 b5 b6 b7 b8)) =
  W16 (B b7 b8 a1 a2 a3 a4 a5 a6) (B a7 a8 b1 b2 b3 b4 b5 b6)
```
