---
id: PROG-00
title: "Homoiconic Syntax Tracker"
kind: progress
layer: progress
status: review
spec: OMI-IMO-2026
up: "[[OMI-IMO]]"
down: []
related:
  - "[[SPEC-14 Knots and Binds]]"
  - "[[SPEC-30 The Symbol Table G]]"
  - "[[SPEC-31 Declaration Syntax]]"
  - "[[SPEC-03 Notation OMI-Lisp]]"
  - "[[SPEC-44 The Virtual Breadboard]]"
  - "[[SPEC-61 Implementation Status]]"
  - "[[OPEN-00 Contradiction Register]]"
  - "[[OPEN-01 Open Questions]]"
  - "[[OPEN-02 Broken Code Inventory]]"
  - "[[OPEN-03 Glossary]]"
sources:
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-04 Assembly Register Programming]]"
  - "[[SRC-09 Try XOR Catch XNOR Finally]]"
code:
  - "_archive/index.ts"
  - "_archive/model.ts"
  - "omi-files/omi-canvas/src/OMI/Handler.hs"
  - "omi-files/omi-canvas/src/OMI/Delta.hs"
  - "space/breadboard/kernel.mjs"
  - "core/src/verified/index.ts"
  - "rosetta/src/grammar/grammar.ts"
  - "rosetta/src/grammar/kernel.ts"
  - "src/testbed/core.test.ts"
  - "src/testbed/rosetta.test.ts"
dimensions: []
symbols: [EXCHANGE, LITERAL, STRUCT, PALINDROME, AXIS, MNEMONIC]
goal: "Homoiconic syntax: one regex grammar that reads a wordform as data or as program, with no conversion"
current_level: 0
updated: 2026-10-07
tags: [omi-imo, progress, homoiconic, syntax, grammar, tracker]
---

# Homoiconic Syntax Tracker

## The Goal

The protocol is meant to be **homoiconic**: a program and a piece of data are the same kind of thing. Both are wordforms (strings like `0p3x40n`), and both are checked by the same regex grammar. Nothing converts one into the other. Your DeepSeek0 conversation states it as one rule (raw lines 14660–14680):

```text
homoiconic(P) :- position(P),
                 regex_constraint(P, R),
                 reading(P, data) ∨ reading(P, program).
```

"There is no parser, no interpreter, no compiler. There is only reading." ([[SRC-00 Protocol Review and Bug Fixes]] claim 78.)

The code is organised as described in [[META-04 Repository Frame]]: verified findings in `core/`, the grammar in `rosetta/`, views in `space/`, tests in `src/testbed/` (`npm test`, 23 checks passing).

This note tracks how close the code is to that, level by level, and logs each discovery along the way. Every status below has evidence you can re-check.

## How to Read the Status

| Status | Meaning |
|--------|---------|
| ✅ Working | Runs, and was checked by running it |
| 🟡 Partial | Specified, some parts verified or implemented, gaps listed |
| ⬜ Not reached | Described, not yet built |

**Reached so far: Level 0.** Levels 1–4 are partial. Level 5 has two small working demonstrations but is not reached.

## The Ladder

The six levels come from DeepSeek0 (raw lines 14680–14725), "the complete grammar". Each one builds on the one before.

### Level 0 — The Primitive ✅ Working

**What it is:** `compareExchange` and the difference it returns. Every operation reduces to this.

**Evidence:**
- The Fano Fold kernel ([[SRC-09 Try XOR Catch XNOR Finally]]) was run on 2026-10-07. Its checks "a matched exchange writes", "a missed exchange returns the actual" and "the difference is the XOR" all pass.
- `atomicDelta` (DeepSeek3, lines 42400–44719): `bind ⊕ apply ⊕ eval` is 0 when the exchange happens and `expected ⊕ replacement` when it misses. Verified with a real `SharedArrayBuffer`.
- The virtual breadboard computes all four XOR builds inside an audio graph ([[SPEC-44 The Virtual Breadboard]]; `npm test` passes).

**Code:** `core/src/verified/exchange.ts`, tested in `src/testbed/core.test.ts`.

**Gaps:** none at this level.

### Level 1 — The Reference Space 🟡 Partial

**What it is:** the alphabet of positions:

| Pattern | Meaning |
|---------|---------|
| `/0[boxd]/` | the four radices |
| `/0[pin]/` | the three literals |
| `/0[pine]/ = /0[boxed]/` | the self-description |
| `/0[pie]/` | the distribution |
| `/0[box]/` | the frame |

**Verified:**
- The seven literal symbols are 3 literals + 4 radices, `{0p, 0i, 0n} + {0b, 0o, 0x, 0d}`. A printed list duplicated `0d` for `0i` ([[OPEN-00 Contradiction Register]] #23).
- Every quantity is an index, never a magnitude: the index rule (`_archive/The Supreme Notion Indices, Not Value.md`).
- One wordform spans widths. 12, 60, 124 and 252 are "all bits set except the lowest two" at 4, 6, 7 and 8 bits ([[OPEN-01 Open Questions]] #13).
- The Blob is 65,536 bits = 128 buffers of 64 bytes, so every index is an address in one transportable object.

**Gaps:** the literal and radix types exist in `_archive/index.ts`, but that file does not compile ([[OPEN-02 Broken Code Inventory]] #22).

### Level 2 — The Wordform 🟡 Partial

**What it is:** positions with content:

| Pattern | Meaning |
|---------|---------|
| `/0[boxd]\d+[pin]/` | a framed position with content |
| `/0[pine]\d[boxed]/` | an endpoint with content |
| `/0[box]\d\.\d[pin]/` | a framed value with a decimal |

The running grammars use `LITERAL`, `STRUCT` and `EXCHANGE`.

**Verified:**
- The corrected Haskell grammar has correct radix patterns (`0x[0-9A-Fa-f]+`, `0b[01]+`, `0o[0-7]+`).
- `EXCHANGE` matches instruction wordforms: `0p3x40n` and `0n7b60p` match, `0p3x4` does not.

**Gaps:**
- The JavaScript grammars reject `0xFF`; their `HEX` pattern uses `\d` ([[OPEN-02 Broken Code Inventory]] #21).
- Haskell and JavaScript disagree on `EXPONENT`: `e5` vs `3e5`.
- There is no single grammar file that both languages read.

### Level 3 — The Regex Constraints 🟡 Partial

**What it is:** the symbol table G, the named constraints that decide which positions are admissible.

**State of G** (29 symbols listed in DeepSeek0):

| Group | Symbols | In `_archive/index.ts` G? |
|-------|---------|---------------------------|
| Sets | `INCLUDE`, `EXCLUDE`, `ESCAPE`, `CLOSURE` | No (transcript only) |
| Brackets | `ROUND`, `CURLY`, `SQUARE`, `ANGLE` (open/close), `QUOTE_MARK`, `STRING_MARK` | No (transcript only) |
| Faces | `FRONT`, `BACK`, `INSIDE`, `OUTSIDE`, `UP`, `DOWN`, `LEFT`, `RIGHT`, `CENTER` | Yes |
| Palindromes | `DEFLECT`, `REFLECT`, `INFLECT` | Yes |
| Higher forms | `AXIS`, `MNEMONIC` | Yes |
| Higher forms | `PALINDROME` | **No**: missing ([[OPEN-02 Broken Code Inventory]] #9) |

**Verified:**
- In the DeepSeek0 listing, `LEFT` and `RIGHT` are byte-identical, and so are `DEFLECT` and `REFLECT`. `index.ts` already fixes both pairs (`LEFT`/`RIGHT` are mirror images; `REFLECT` uses `[".]`).

**Code (2026-10-07):** all 29 symbols are now in `rosetta/src/grammar/grammar.ts`, in a mutable grammar that can learn. `CLOSURE` uses the likely intended pattern, marked as a placeholder.

**Discovered:** the symbols must not be used to check positions. `INCLUDE` (`/^[A-Za-z0-9_]+$/`) admits every alphanumeric word, so a position check that includes it refuses almost nothing. The kernel therefore checks positions against Levels 1–2 only (`POSITION_RULES`), and the symbols classify characters and tokens.

**Gaps:**
- The author to confirm the position-rules / symbols split and the `CLOSURE` pattern.
- `core/src/index.ts` still has the old frozen G; it is an `_archive` copy.

### Level 4 — The Datum and the Program 🟡 Partial

**What it is:** data and programs are both positions, both constrained by the regexes, both read by the same operation.

**Working:** the **data** side. The Fano kernel's Proxy handler admits or refuses every read and write by the grammar. Its checks "an admissible write succeeds" and "an inadmissible write throws" pass.

**Missing:** the **program** side. The grammar already contains an instruction wordform: `EXCHANGE`, `/^0([pn])(\d)([boxd])(\d)0([np])$/`, which `index.ts` calls "the canonical implementation of `Atomics.compareExchange` as message syntax". But nothing yet *executes* a matched `EXCHANGE` wordform. `apply` is a stub and `pin` never returns its URL ([[OPEN-01 Open Questions]] #6–7).

**Your instruction, as the target** ([[OPEN-01 Open Questions]] #13): *read index 60; if 60 is expected, exchange it with the iExtant Exponent or Exception of the 64-byte buffer*. When that sentence can be written as one wordform, and the same reader both checks it and runs it, Level 4 is reached.

### Level 5 — Homoiconicity ⬜ Not reached

**What it is:** the regex on a datum is the regex on a program. The constraint is the same, the shape is the same, and there is no boundary.

**Small working demonstrations:**
- **Grammar from data.** The Fano kernel's `learn(name, source)` takes a *string* (data) and makes it a *constraint* (program). The next access obeys it. `regenerate` rebuilds the kernel from its own description (run 2026-10-07; restores rules, not positions).
- **Circuit from data.** The virtual breadboard turns a JSON description (data) into gates, an audio graph, a canvas and a self-test (program). `learn` turns a truth table into a gate ([[SPEC-44 The Virtual Breadboard]]).

**Missing:** the grammar itself stored as positions in the Blob, so the grammar can be read, checked and rewritten by the same operation it defines.

## Next Milestones

| # | Milestone | Unlocks | Status |
|---|-----------|---------|--------|
| 1 | Move the Fano kernel into the repo as a module, with the radix fixes | Levels 0–3 runnable from one file | ✅ `rosetta/src/grammar/kernel.ts` |
| 2 | One grammar file (JSON of pattern sources) read by JavaScript and Haskell; settle `EXPONENT` | Level 2 | ⬜ |
| 3 | Add the 15 missing symbols to G, including `PALINDROME` | Level 3 | ✅ `rosetta/src/grammar/grammar.ts` (`CLOSURE` to confirm) |
| 4 | An `EXCHANGE` wordform that the reader executes as `compareExchange` (prior work to mine: [[USE-00 Use Case Scenarios]], Level 4 row) | Level 4 | ⬜ |
| 5 | Encode the "read 60, exchange with Exponent/Exception" instruction as one wordform | Level 4 | ⬜ |
| 6 | Store the grammar as wordforms inside the Blob, and `learn` by writing to it | Level 5 | ⬜ |

## Discovery Log

Newest first. **Evidence** says how each item is known:

- *verified*: computed or run
- *author*: your statement
- *transcript*: stated in a source, not yet checked

| Date | Discovery | Level | Evidence | Where |
|------|-----------|-------|----------|-------|
| 2026-10-08 | The closure law `∂(b) = 0000` tested with non-zero input: 8 vertex-closed states (zero, 4 faces, 3 four-cycles), 8 face-closed, 4 both; one edge is open at both ends | 0 | verified (test) | [[SPEC-67 The Block and Its Closure]] |
| 2026-10-08 | `core/src/index.ts` compiles under the project's strict config and runs | 0–3 | verified | [[OPEN-02 Broken Code Inventory]] |
| 2026-10-07 | Faces, reflections and `/PIN/` are readings at different widths, not one match: faces are a 2-bit grid on the dot (the 4th cell is plain dot notation), reflections use the dot as frame, and no string matches both (2.4M checked) | 3 | verified | [[SPEC-36 The Literal Separation]] |
| 2026-10-07 | The catalog coordinate `<base32?base36=base64>` is regex-compatible and self-checking, and its delimiters `< = > ?` are block 0 of the orbit of 60 | 2, 3 | author + verified (test) | [[SPEC-37 The Catalog Coordinate]] |
| 2026-10-07 | A literal reduces to `0n` as place-value nibbles in one fixed-width long word (the 128-bit OMI address), and an addressable coordinate is a typed handle; base36 is cut out by bits 128 / 64 / 32 (the `60 ⊕ 128`, `60 ⊕ 64` and case toggles) | 1, 2, 4 | author + verified (test) | [[SPEC-36 The Literal Separation]] |
| 2026-10-07 | The literal separation: index literals `0P`/`0I`/`0N` like BigInt `0n`, `e` exponent / `E` exception buffer (16 booleans), datum `0b`/`0o`/`0x`/`0d`/`0.`; draft regex in the grammar as `PINEBOXED`. It does not yet admit the bare `0P`/`0I`/`0N`; `e ⊕ E = 0x20` | 1, 2 | author + verified (test) | [[SPEC-36 The Literal Separation]] |
| 2026-10-07 | The two remaining Fano points are Reflect (try ⊕ finally) and Proxy (catch ⊕ finally), where iExtant meets the user's declarations; Proxy ⊕ Reflect = throw | 4 | author + verified | [[OPEN-01 Open Questions]] #19 |
| 2026-10-07 | The REPL commands exist as WebVTT cues (`rosetta/src/assets/commands.vtt`), kept in step with `src/define.commands.ts` by a test: one command list, readable as data or as program | 4, 5 | verified (test) | [[META-04 Repository Frame]] |
| 2026-10-07 | `{c − r, c + r}` are two poles: 60 ⊕ 64 (lower 8 indices, row 7) and 60 ⊕ 128 (higher 8, row 11), both at column 12; the rows of 60's four readings are the four-block family, and the poles' rows XOR to the diagonal 12 | 1 | author + verified (test) | [[OPEN-01 Open Questions]] #18 |
| 2026-10-07 | try / catch / finally is a coproduct: a tried value or a caught deviation carrying the structured coordinate, whose difference is the repair for another try; chains stop at the first catch | 0, 4 | author + verified (test) | [[USE-00 Use Case Scenarios]] 4a |
| 2026-10-07 | `PLiteral` / `PStruct` fields are coordinate nibbles (indices 0..15); sixteen make the first 8 byte indices of the buffer | 1, 2 | author + verified (test) | [[USE-00 Use Case Scenarios]] 4a |
| 2026-10-07 | Principle: as Haskell collapses chains of types, indices collapse non-orthogonal logic | all | author | [[OPEN-03 Glossary]] |
| 2026-10-07 | Position rules (Levels 1–2) and symbols (Level 3) must be separate: `INCLUDE` admits every alphanumeric word | 3 | verified (test) | `rosetta/README.md` |
| 2026-10-07 | Verified findings moved into `core/src/verified/`, grammar and kernel into `rosetta/src/grammar/`; 23 tests pass | 0–5 | verified | [[META-04 Repository Frame]] |
| 2026-10-07 | The 7 / 35 / 155 / 651 "distinguished triples" are the XOR triples `{a, b, a⊕b}` of non-zero 3- to 6-bit indices; all 155 in `animation.frame.ts` pass | 1 | verified | [[OPEN-03 Glossary]] |
| 2026-10-07 | Swap delta `L = swap16⊕swap32⊕swap64` is its own inverse; the 240-step `fullCycle` reaches `0x0000` at step 3 | 0 | verified | [[OPEN-00 Contradiction Register]] #48 |
| 2026-10-07 | `atomicDelta` digest is 0 iff the exchange happens | 0 | verified | this note, Level 0 |
| 2026-10-07 | The rotations were replaced by `swap16/32/64` as permutations, not mutations; on 8 bytes they are the index maps `j⊕1`, `j⊕3`, `j⊕7` (XOR, XOR, XNOR) | 1 | author + verified | [[OPEN-00 Contradiction Register]] #48 |
| 2026-10-07 | All 6 orderings of the three swaps give one permutation (`j⊕5`): an exact "3! → 1!" | 1 | verified | [[OPEN-00 Contradiction Register]] #48 |
| 2026-10-07 | 12 is an offset: 60's wordform at 4 bits; `compareExchange(buffer64, 60, 60, Exponent \| Exception)` | 1, 4 | author + verified | [[OPEN-01 Open Questions]] #13 |
| 2026-10-07 | The byte-level delta (period 4) is the block reading, not a bug | 1 | author + verified | [[OPEN-00 Contradiction Register]] #46 |
| 2026-10-07 | Indices, not values: only XOR, walk, compare and complement act on positions | 1 | author | [[OPEN-03 Glossary]] |
| 2026-10-07 | `EXCHANGE` already matches instruction wordforms (`0p3x40n`), but nothing executes them | 4 | verified | Level 4 above |
| 2026-10-07 | The Fano kernel's `learn`/`regenerate` work (19 of 20 self-test checks; the failure is `HEX`) | 3, 5 | verified | [[OPEN-01 Open Questions]] #8–9 |
| 2026-10-07 | Gates beyond XOR (AND, OR, NAND, NOR) need a product term; "everything reduces to XOR and β" is false for them | 0 | verified | [[OPEN-00 Contradiction Register]] #45 |
| 2026-10-07 | The virtual breadboard: a description regenerates gates, audio graph, canvas and self-test | 5 | verified | [[SPEC-44 The Virtual Breadboard]] |

## Updating This Tracker

When something changes:

1. Add a row to the top of the **Discovery Log**: date, one-line discovery, level, evidence type, link.
2. If a level's status changes, update its heading mark and its **Gaps**, and set `current_level` and `updated` in the frontmatter. `current_level` is the highest level that is ✅ Working.
3. Tick the milestone if one is done.
4. Add a line to [[META-03 Change Log]].
