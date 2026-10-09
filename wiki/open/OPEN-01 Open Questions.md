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

## Overview

This register tracks the places where the sources are unclear or incomplete. On 2026-10-07 each question was answered from the `_archive/` specifications, transcripts and code, or marked as needing evidence the archive does not have. Contradictions live in [[OPEN-00 Contradiction Register]]; code defects live in [[OPEN-02 Broken Code Inventory]].

| # | Question | Status |
|---|----------|--------|
| 1 | Period 8 vs 240 | Resolved |
| 2 | `3!⊕3!⊕3!⊕1!` | Resolved |
| 3 | `β + β` | Resolved |
| 4 | Verilog swaps | Resolved (bug) |
| 5 | Missing bibliography | Unrecoverable |
| 6 | `apply` | Answered; not implemented |
| 7 | `pin` | Answered; not implemented |
| 8 | `learn` | Resolved; working code exists |
| 9 | `regenerate` | Resolved; working code exists |
| 10 | Four-block family and the diagonal | Resolved |
| 11 | 5T/10T frame and the n-sphere | Resolved |
| 12 | Swap ↔ reading pairing | Decided by convention |
| 13 | `16xy = 12` | Resolved |
| 14 | The pin at 18 | Resolved |
| 15 | The blackboard | Resolved |
| 16 | 6T sourcemap gap | Needs the Rosetta YAML |
| 17 | iExtant letter assignments | Resolved |
| 18 | The −60 to 64 quasi-generator | Resolved: two poles, 60 ⊕ 64 and 60 ⊕ 128 |
| 19 | try/catch/finally: triangle or seven points | Resolved: the triangle spans the seven; Reflect and Proxy named |

## Questions

### 1. The Period-8 vs Period-240 Relationship

**Answer:** 8 is the unit cell, 240 the time crystal, and 5040 the supercell. Each divides the next (240 = 8 × 30, 5040 = 240 × 21), so the delta returns to its start 30 times per clock orbit. The hypothesis was right, and rev1 §14.2 states it as a table. Details: [[OPEN-00 Contradiction Register]] #2.
**Status:** Resolved.

### 2. The `3! XOR 3! XOR 3! XOR 1!` Expression

**Answer:** 7 under XOR. 19 is the sum and 216 the product. Checked in Coq. See [[OPEN-00 Contradiction Register]] #5.
**Status:** Resolved.

### 3. The `beta + beta` Question

**Answer:** `β ⊕ β = 0`. The Coq `+` versions were about natural-number addition. See [[OPEN-00 Contradiction Register]] #7.
**Status:** Resolved.

### 4. The Verilog `swap16` and `swap64` Branches

**Answer:** Yes, they are byte-identical, and that is a copy-paste error. `swap32` is also mis-sized. The corrected module is in [[OPEN-02 Broken Code Inventory]] #18.
**Status:** Resolved (as a bug).

### 5. The Missing Bibliography

**Answer:** The `[1]`–`[14]` markers belong to [[SRC-06 Phases vs Attributes vs Constraints vs Configurations]], a Google *AI Overview*, not to the Synthesis. They are the overview's clickable source chips. Printing to PDF kept the numbers and dropped the links, so there was never a bibliography document. Where the chips can be matched to results on the page, they do not support the claims ([[OPEN-04 Discarded Claims]] #25). Treat every claim that leans on `[n]` as uncited.
**Status:** Unrecoverable; closed.

### 6. The `apply` Method

**Answer:** No source in the archive implements `apply`. The archived `model.ts` returns nothing, and the corrected Haskell gives `apply` the same body as `bind`. But the sources agree on what it should do:

- rev1 §5.5: `apply` is slot 13, "invoke the relation".
- Haskell (corrected): "Same shape as bind, but the correction is set."
- Hardware: `apply` is the 6T, the stage that makes the relation drive onward (see [[OPEN-00 Contradiction Register]] #1).

So `apply(p1, p2)` = `bind(p1, p2)` with the correction half of the ruler filled in, followed by one `delta16` step. The correction is bytes 8–15 (rev1 §5.3).
**Status:** Answered (design); implementation pending ([[OPEN-02 Broken Code Inventory]] #10).

### 7. The `pin` Method

**Answer:** No source specifies `pin` beyond `_archive/model.ts`. Read from that code, its intent is to wrap a function's source in a `Blob`, make an object URL for it, and register it under a name pattern (`new RegExp(name)`). That would make the function loadable by name. The code builds the URL twice but never returns or yields it. A working `pin` must return that URL. [[OPEN-00 Contradiction Register]] #13 records what the current code really does.
**Status:** Answered (intent from code); implementation pending.

### 8. The `learn` Method

**Answer:** A working `learn` exists in the Fano Fold conversation ([[SRC-09 Try XOR Catch XNOR Finally]], "The complete file"). The handler exposes `learn(name, source)`, which adds `new RegExp(source)` to a mutable `Map` grammar. The kernel then increments its `generation` and records the change in `history`. Extracted and run on 2026-10-07, its self-test passed 19 of 20 checks. The one failure is a grammar bug, not a `learn` bug: `HEX: /^0x(\d+)$/` rejects `0xFF` ([[OPEN-02 Broken Code Inventory]] #21).

Two cautions. First, `makeKernel()` with no argument shares the module-level `GRAMMAR`, so learning in one kernel changes every kernel. Second, rev1 §9.5's version (`kernel.state.learn`) only works with that handler: a plain Proxy rejects `learn` as an inadmissible position.

The same idea also runs at small scale in [[SPEC-44 The Virtual Breadboard]], where `learn` turns a truth table into a gate.
**Status:** Resolved; the code needs to move into the repo.

### 9. The `regenerate` Function

**Answer:** Same source as #8. `regenerate(description)` builds a fresh kernel and replays every `learned` entry from `description.history`. In the run it reproduced the generation count and the learned grammar. It does **not** replay `step` entries, so positions written before regeneration are lost (checked: a regenerated kernel read `5p` as `undefined`). An earlier draft in the same conversation did replay steps. Decide whether a description means grammar only, or grammar plus state.
**Status:** Resolved for grammar; restoring state is a design choice still open.

### 10. The Four-Block Family and the Diagonal

**Answer:** The four-block family is 3 XORed with every combination of the diagonal's bits:

```
{3, 7, 11, 15} = 3 ⊕ {0, 4, 8, 12}        (12 = 0b1100, the diagonal)
b & 12 = 0, 4, 8, 12                       (the block index k, times 4)
```

The block orders in [[OMI-IMO]] follow from the decomposition `c ⊕ n = 4·((c≫2) ⊕ (n≫2)) + ((c&3) ⊕ (n&3))`, which `_archive/check.py` checks exhaustively. The high two bits (the diagonal) choose which block comes when. The low two bits, always `11`, make every block run descending.

The same family is the row coordinate of 60's four readings, `60 ⊕ {0, 64, 128, 192}` (#18).

So "orthogonal vs interfering" is a statement about one bit at a time. Only 3 shares no bit with 12. 7 shares bit 2, 11 shares bit 3, and 15 contains the whole diagonal.
**Status:** Resolved.

### 11. The 5T/10T Frame and the n-Sphere

**Answer:** Yes, in the Hamming (bit-difference) metric, with one correction. The orbit of 5 is not *one* sphere but all of them. `5 ⊕ n` is at distance `popcount(n)` from 5, so the 16 values split into spheres of radius 0–4 with sizes 1, 4, 6, 4, 1. The radius-4 sphere is the single point `10 = 0b1010`, the exact opposite of `5 = 0b0101`. So the 5T and 10T are antipodes on the 4-cube, which is why rev1 §7.7 calls them the two *endpoints*.
**Status:** Resolved.

### 12. The Swap16/Swap32/Swap64 Pairing

**Answer:** The source offers two pairings and does not choose. Neither follows from the math; any one-to-one assignment works. This vault adopts the first as a **convention**:

| Swap | Reading | Why this order |
|------|---------|----------------|
| `swap16` | bind | smallest slice ↔ first reading ↔ 5T ↔ slot 12 |
| `swap32` | apply | middle slice ↔ 6T ↔ slot 13 |
| `swap64` | eval | largest slice ↔ 8T ↔ slot 14 |

It is the order the Fano Fold conversation states first, and it keeps every other ordering in the protocol monotone. Change it here if you intend the reverse.
**Status:** Decided by convention.

### 13. The `16xy = 12` Bridge

**Answer (author, 2026-10-07):** 12 is an **offset**, not a quantity. Start at `60 ^ 64` and you get an offset. The instruction reads: *read index 60; if 60 is the expected value, exchange it with the iExtant Exponent number or the Exception buffer of the 64-byte buffer*. Every one of these numbers describes the same wordform of the 65,536-bit Blob, which is what makes the Blob transportable.

As code, that instruction is `compareExchange(buffer64, 60, 60, Exponent | Exception)`. Exponent and Exception are the two halves that trade roles each cycle (rev1 §13.3; "The Full 60 and the Blocking").

**Verified wordform:** 12, 60, 124 and 252 all have every bit set except the lowest two. They are the same index read at different widths:

| Width | Index | Bits | Position |
|-------|-------|------|----------|
| 4 bits (16 slots) | 12 = `0x0C` | `1100` | start of the last 4-slot block of 16: the tick offset in the 16-byte receipt (rev1 §14.3) |
| 6 bits (64 slots) | 60 = `0x3C` | `111100` | start of the last 4-slot block of 64: the "60 of 64" |
| 7 bits (128 slots) | 124 = `60 ^ 64` | `1111100` | the same block, offset into the upper half (rev1 §3.4) |
| 8 bits (256 slots) | 252 = `60 ^ 192` | `11111100` | the same block in the top quarter |

So the 12 of the receipt offset and the diagonal `0b01100` is the 4-bit instance of 60. It is also 60's column in the 16 × 16 byte table, and the XOR of the rows of the two poles, `row(60 ⊕ 64) ⊕ row(60 ⊕ 128) = 7 ⊕ 11 = 12` (#18). The Blob is 65,536 bits = 8,192 bytes = exactly 128 buffers of 64 bytes, so each instance is an address inside the same Blob.

**About `16xy = 12`:** with x and y as indices (whole positions), no pair gives `xy = 3/4`. The `(3/2, 1/2)` point in rev1 §4.5 is a value read. The cross term is not where 12 comes from; the wordform above is.
**Status:** Resolved (author's reading, wordform verified).

### 14. The Orbital Cycle and the Pin

**Answer:** The hypothesis is right. The orbit of 19 is `19 ⊕ n`. Its first block is `{19, 18, 17, 16}` (n = 0..3). 18 = 19 ⊕ 1 is the second point, 17 = 19 ⊕ 2 is the third, and `17 ⊕ 18 = 3`. The pin sits one XOR step from 19 and two from 17.

**`{17, 19}` (author, 2026-10-09, [[SRC-10 The Ontology Conversation]] lines 5537–5628, "Yes exactly"):** they are the anchor pair of the upper-half (`60 ⊕ 128`) reading. **17** is the Hamming-distance index and **19** the tree-algorithm index: "17 is the distance, 19 is the walk." The lower half's matching entry points are `{0, 2, 1}`, three of them against two; with the four-block family in between, that is the generator's 3 : 4 : 2.
**Status:** Resolved.

### 15. The Blackboard Extraction

**Answer:** rev1 Part XIII gives the architecture. The 16-byte ruler is three cubes:

- Cube 0 is the bottom 8 bytes.
- Cube 1 is the top 8 bytes.
- Cube 2 sits between them. It is the blackboard and holds `{3, 7, 11, 15}`.

Each cycle, Cubes 0 and 1 trade roles (Exponent ↔ Exception, the `delta16` half-swap). Cube 2 does not change. The hypothesis is right: `bind` becomes a transition function that reads the blackboard, and the blackboard is the state that survives the fold.
**Status:** Resolved (architecture); not yet in code.

### 16. The 6T Sourcemap Gap

**Question:** Why does the 6T sourcemap skip breadboard column 16?
**Context:** [[SPEC-40 The 6T XOR Circuit]] places Q1–Q6 at columns 1, 6, 11, 21, 26, 31; the generator in [[SPEC-44 The Virtual Breadboard]] gives 1, 6, 11, 16, 21, 26.
**What the archive adds:** rev1 numbers transistors across the whole pipeline: 5T Q1–Q5, 6T adds Q6, 8T Q7–Q14, 10T Q15–Q24. That means the 6T is the 5T plus one transistor on the same board. The coupling resistor (BOOT0 → 2 kΩ → Q6) has to sit somewhere, which may be what the gap is for. The Rosetta YAML that holds the coordinates is not in this repo.
**Update (2026-10-07):** the YAML is now in the repo at `rosetta/src/assets/omi_rosetta_stone.yaml`. It confirms the columns 1, 6, 11, 21, 26, 31 but gives no reason. Its canvas positions for Q1–Q6 have no gap, so the gap is on the physical board only.
**Status:** Open; only the author knows why the board skips column 16.

### 17. The iExtant Letter Assignments

**Source:** [[SRC-09 Try XOR Catch XNOR Finally]] (archive lines ~5586–5620): Point `/pinEboxed/`, Circle `/boxd/`, Simplex `/pin/`, iExtant `/eE/`. Circle and Simplex both extend Point and implement iExtant.
**Answer:** the three smaller sets split the large one exactly: `pin` + `boxd` + `eE` is precisely the letters of `pinEboxed`, with none shared and none missing (checked). `_archive/model.ts` already lists these nine letters as `Domain.Values` (p, i, n, E, b, o, x, e, d). So Point = Simplex (the literals) ∪ Circle (the radices) ∪ iExtant (the markers).
**Status:** Resolved.

### 18. The −60 to 64 Quasi-Generator

**Question:** iExtant is "the c−r, c+r quasi-generator from −60 to 64". What is it?
**Answer (author, 2026-10-07):** the −60 was anecdotal, illustrating the motion. The actual readings are **60 ⊕ 64 for the lower 8 indices** and **60 ⊕ 128 for the higher 8 indices**. `{c − r, c + r}` is not a range. It is the root relation: two poles, the first 0-sphere (`_archive/_deprecated/clock.md`: "c − r = one pole, c + r = the other pole … binary 0 / 1, Lisp (car . cdr), OMI declaration / definition").

**Verified reading:** a byte is a coordinate in a 16 × 16 table: row = high nibble, column = low nibble. The 16 rows are the "16 indices (0–7 local … 8–15 shared)" of [[SRC-01 XOR Tetrahedron Transform]].

| Reading | Byte | Row | Column |
|---------|------|-----|--------|
| 60 | `0x3C` | 3 | 12 |
| 60 ⊕ 64: the lower-8 pole | `0x7C` | 7 (last of the lower 8) | 12 |
| 60 ⊕ 128: the higher-8 pole | `0xBC` | 11 (in the higher 8) | 12 |
| 60 ⊕ 192 | `0xFC` | 15 | 12 |

- The motion is purely in the row. The column never moves, and it is the diagonal 12.
- The four rows 3, 7, 11, 15 are exactly the four-block family `3 ⊕ {0, 4, 8, 12}` (#10).
- The two poles' rows XOR to the diagonal: `7 ⊕ 11 = 12`. This is the offset of #13.
- All four readings XOR to 0: they close.
- As plain numbers the poles are `124 = 156 − 32` and `188 = 156 + 32`. In index terms they are 60 with one high bit toggled each, and they differ by `64 ⊕ 128 = 192`.

Code and tests: `core/src/verified/wordform.ts` (`coordinate`, `POLES`, `quadrantReadings`), `src/testbed/core.test.ts`.
**Status:** Resolved.

### 19. try / catch / finally: Triangle or Seven Points?

**Source:** [[SRC-09 Try XOR Catch XNOR Finally]] (archive lines ~5714–5850).
**Answer:** both. The triangle generates the plane. Take try, catch and finally as three independent indices (001, 010, 100). Their XOR combinations are exactly 7 points, and the lines `{a, b, a ⊕ b}` are exactly the 7 Fano lines (checked):

| Point | Index | Reading |
|-------|-------|---------|
| try | 001 | the attempt |
| catch | 010 | the trap |
| finally | 100 | the witness |
| try ⊕ catch | 011 | the throw ("fires in the try, is caught by the catch") |
| try ⊕ finally | 101 | **Reflect**: the operation, witnessed |
| catch ⊕ finally | 110 | **Proxy**: the trap, witnessed |
| try ⊕ catch ⊕ finally | 111 | the full path |

The transcript's own candidate ("try, catch, finally / three exits / the full path") is this structure.

**The two names (author, 2026-10-07):** they are the Proxy and the Reflect of `core/src/broadcast.ts`, where iExtant meets the user. There RegExp declarations and string definitions are crosslinked with the iExtant's Exponent and Exception. In `core/src/model.ts` terms this is the `Node`, inside a `Domain`. `launchBroadcast(declared: RegExp, defined: string)` returns `proxy()` and `reflect()`, one step forward and one step back. They are the two poles `{c + r, c − r}` with r = 1, each a compare-exchange on the iExtant.

Which is which follows the protocol's roles (Regex constrains, Proxy traps, Reflect performs): try ⊕ finally is the operation witnessed, so Reflect; catch ⊕ finally is the trap witnessed, so Proxy. On the Fano lines this gives **Proxy ⊕ Reflect = throw**: a step forward and a step back differ by exactly the throw (checked). Swap the two if the author intends the reverse.
**Status:** Resolved.

### 20. Three Readings of `{17, 19}` and the Triangulation of 23

The ontology conversation ([[SRC-10 The Ontology Conversation]]) reads `{17, 19}` three ways:

| Reading | What it is | Mark |
|---------|-----------|------|
| **Index** | 17 is the Hamming-distance index and 19 the tree-algorithm index of the upper half (#14, author: "Yes exactly") | DEFINITION ([[SPEC-07 The Fundamental Invariants]] I-17) |
| **Decimal prime** | twin primes; in the first sextuplet `{5, 7, 11, 13, 17, 19}` they are the complement of the quadruplet `{5, 7, 11, 13}`, and the two quadruplets share the bridge `{11, 13}` | THEOREM (I-44) |
| **Hexadecimal** | `0x17`, `0x19` are 23 and 25, the mêtron's last two coordinates. 23 ends the sextuplet `{7, …, 23}`; 25 = 5² is the first gap-2 step that is not prime | THEOREM (values) + DEFINITION (in the mêtron, I-43) |

**Decision:** the three readings stand side by side. The hexadecimal one does not overturn #14, because I-42 says the radix belongs to the literal: `17` and `0x17` are different literals, so they can mean different things without contradiction. Hexadecimal is always marked with `0x`.

**Still open:** the author says 23 "has a point line read to triangulate", with "the 5 7 11 13", and that "everything is in docs". The conversation ends before the doc is named. The likely source is the tetrahedral-encoding paper ("On the Tetrahedral Encoding of Prime Constellations"), which is not in the vault.

**Also open:** the rosetta `CATALOG` rule accepts only the first of the seven catalog heads (I-41).

**Status:** Open.

### 21. The BOM: Prefix or Suffix, and the Hamming Index

The author renamed the upper half's zero index (the "Hamming" or "Polybius" row) the **BOM**, because "i dont know if the hamming resolves to the prefix or suffix of the wordform". The BOM holds the **Prompt Tree** ([[SPEC-26 The Prompt Tree]]).

**Decision:** the BOM is **file 0** (index 16), the prefix: a byte order mark comes first, and the author calls it "the 0 index". The suffix reading would make it file 15 (index 31). `BOM_FILE` in `core/src/verified/tree.ts` is the one place to change.

**Tension with #14:** #14 confirmed **17** as the Hamming-distance index. With the BOM at 16, either 17 still names the Hamming distance *inside* the BOM's reading, or the BOM takes that role and #14 is superseded. Not decided.

**Also open** (listed in SPEC-26): the ASCII cascade rule, the "polynomial shape" of the terms, PATRICIA compression, and computing the fifteen layouts.

**Status:** Open.
