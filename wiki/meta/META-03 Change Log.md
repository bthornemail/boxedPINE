---
id: META-03
title: "Change Log"
kind: meta
layer: meta
status: canonical
spec: OMI-IMO-2026
up: "[[META-00 Vault Schema]]"
down: []
related:
  - "[[META-00 Vault Schema]]"
  - "[[META-01 Extractive Method]]"
  - "[[META-02 Evidence and Confidence]]"
  - "[[SPEC-61 Implementation Status]]"
sources: []
code: []
dimensions: []
symbols: []
tags: [omi-imo, meta, changelog, history]
---

# Change Log

## 2026-10-04

### Initial Creation

- Created the vault structure
- Extracted all 9 PDFs to text
- Launched 16 subagents to extract structured content from the transcripts
- Wrote 41 spec notes
- Wrote 16 source part notes
- Wrote 4 extension guides
- Wrote 4 open question notes
- Wrote 3 meta notes
- Created 4 canvases
- Created 5 Obsidian Bases
- Created the validation script

### Sources Extracted

| Source | Pages | Lines | Parts |
|--------|-------|-------|-------|
| DeepSeek0: Protocol Review and Bug Fixes | 322 | 23606 | 2 |
| DeepSeek1: XOR Tetrahedron Transform | 357 | 26900 | 2 |
| DeepSeek2: XOR Gate Transistor Circuits | 744 | 58922 | 2 |
| DeepSeek3: Protocol Sequence Analysis | 2218 | 125453 | 4 |
| DeepSeek4: Assembly Register Programming | 1820 | ~80000 | 2 |
| DeepSeek5: Conspiracy Check | 1071 | 55119 | 2 |
| Phases vs Attributes vs Constraints vs Configurations | 78 | 3674 | 1 |
| The OMI-IMO Complete Synthesis | 16 | 720 | 1 |
| XOR Gate Built with Transistors | 40 | 948 | 1 |

### Spec Notes Written

- SPEC-00 Canonical Statement
- SPEC-01 The Three Laws
- SPEC-02 Conformance Criteria
- SPEC-03 Notation OMI-Lisp
- SPEC-10 The Primitive
- SPEC-11 The Three Primitives
- SPEC-12 The Ruler
- SPEC-13 XOR Algebra
- SPEC-14 Knots and Binds
- SPEC-15 The Delta Transform
- SPEC-16 The Fano Invariant
- SPEC-20 The Dimensional Axis
- SPEC-21 The Inversion Law
- SPEC-22 The Blob
- SPEC-23 The Rosetta Stone
- SPEC-24 Observers
- SPEC-25 The Iff
- SPEC-30 The Symbol Table G
- SPEC-31 Declaration Syntax
- SPEC-32 Mnemonics and Axes
- SPEC-33 The Quadratic Forms
- SPEC-34 Phases Attributes Constraints Configurations
- SPEC-35 Reflections and Orbits
- SPEC-40 The 6T XOR Circuit
- SPEC-41 The 8T XOR Circuit
- SPEC-42 Circuit Sourcemap
- SPEC-43 Prime Gaps and Sextuplets
- SPEC-50 Stream Transport
- SPEC-51 JSON Canvas Interchange
- SPEC-52 The REPL and the Digest
- SPEC-53 Clocks and Periods
- SPEC-54 The Web Platform Layers
- SPEC-55 ASCII Folds
- SPEC-60 Test Vectors
- SPEC-61 Implementation Status

### Extension Guides Written

- EXT-00 How to Extend the Protocol
- EXT-01 Adding a Dimension
- EXT-02 Adding a Symbol
- EXT-03 Adding a Substrate
- EXT-04 Literate Workflow
- EXT-05 Review Checklist

### Open Question Notes Written

- OPEN-00 Contradiction Register
- OPEN-01 Open Questions
- OPEN-02 Broken Code Inventory
- OPEN-03 Glossary
- OPEN-04 Discarded Claims

### Meta Notes Written

- META-00 Vault Schema
- META-01 Extractive Method
- META-02 Evidence and Confidence
- META-03 Change Log

### Canvases Created

- MAP-00 Protocol Canvas
- MAP-01 Source Graph
- MAP-02 Dimension Stack
- MAP-03 Ruler Canvas

### Bases Created

- OMI-IMO Registry.base
- Sources.base
- Symbols and Dimensions.base
- Open Threads.base
- Status Board.base

### Tools Created

- tools/validate.mjs

## 2026-10-07

### Virtual Breadboard

- Wrote [[SPEC-44 The Virtual Breadboard]]: the 5T/6T/8T/10T XOR builds in Web Audio (signals) and canvas (geometry), generated from one description
- Added `omi-files/omi/audio/breadboard/` (`kernel.mjs`, `index.html`, `test.mjs`); `npm test` in `omi-files/omi/audio` runs the offline self-test
- Added a proposed reading to [[OPEN-00 Contradiction Register]] #1 (the 6T read before its output stage is XNOR)
- Added [[OPEN-01 Open Questions]] #16 (the 6T sourcemap gap)
- Linked SPEC-44 from the root MOC, README, SPEC-40, SPEC-41, SPEC-61 and EXT-03

### Open-Question Pass

- Checked every entry in OPEN-00 to OPEN-04 against `_archive/` (rev1 spec, Fano Fold conversation, Gemini notebook, code) and the raw transcripts
- Ran the archived code, recomputed the arithmetic, simulated the corrected Verilog swap engine in Icarus Verilog, and checked the β and collapse laws in Coq
- Resolved the 6T contradiction (BOOT0 is XNOR, BOOT1 is XOR; `Atom.apply` inverts only bit 0)
- Reinstated `168 & 3125 = 32` and `168 | 3125 = 3261` (both true); fixed the Klein configuration to 60 points and 60 planes
- Found new defects: the `Node` constructor throws at `swap32`, the kernel `HEX` regex, and rev1's "all gates reduce to XOR and β"
- Reclassified the byte-rotating `delta` (period 4) as the intended block reading, per the author; it is distinct from the bit-level `delta16` (period 8)
- Fixed `rotr2` in `omi-files/omi/OMI/Delta.hs` (it was `rotl 6`); verified against the spec delta on all 65,536 words
- Recorded the author's supersession of the rotation delta by the swap permutations (XOR/XNOR on the index, period 4)
- Checked DeepSeek3 lines 42400–44719, the author's switch from rotations to swaps: swap delta is self-inverse, `fullCycle` hits zero at step 3, the 155 triples are XOR lines of 5-bit indices
- Left open: the 6T sourcemap gap (needs the Rosetta YAML), the role of `{17, 19}`, and whether `regenerate` restores state

### Homoiconic Syntax Tracker

- Added `progress/` and [[PROG-00 Homoiconic Syntax Tracker]]: the six-level grammar ladder from DeepSeek0, with the evidence-based status of each level, next milestones and a dated discovery log
- Added the `progress` kind to the schema and `tools/validate.mjs`

### Repository Frame

- Filled the existing folders: verified findings in `core/src/verified/`, grammar and kernel in `rosetta/src/grammar/`, eight views inscribed in `space/README.md`, tests in `src/testbed/` (`npm test`, 23 passing); a README in each folder
- Added [[META-04 Repository Frame]]
- Found that position rules and Level 3 symbols must stay separate (`INCLUDE` admits every word)
- Found `rosetta/src/assets/omi_rosetta_stone.yaml`; it confirms the 6T column gap without a reason

### Use Case Scenarios

- Added `usecases/` and [[USE-00 Use Case Scenarios]]: the twelve `omi-files` projects as scenarios, each mapped to ladder levels and frame folders, with checked vs not-run state
- Added the `usecase` kind to the schema and `tools/validate.mjs`

### Merge of `omi` into `omi-canvas`

- Ported `omi`'s delta, handler and XOR helpers onto the canvas nibble-pair types as `OMI.Bits`, `OMI.Delta` and `OMI.Handler` (`omi-canvas` commit `1559dc1`); tests pass and match values recorded from `omi`
- Moved `omi`'s superseded Haskell to `_archive/omi-haskell/`, the breadboard to `space/breadboard/`, and dropped its spec copy (identical to `_archive/`)
- Updated paths in SPEC-44, SPEC-61, OPEN-02, PROG-00, USE-00, META-04 and the `space` README

### Fork: `omi-types`

- Forked `omi-canvas` as `omi-files/omi-types` (history kept; `upstream` = the `omi-canvas` remote) and added the types of *The OMI Protocol in Pure Haskell - Corrected*: `Ruler`, `Block`, `QuadraticForm`, the full `Position`, `Deviation`, `Operation`, the BIOS types, the torus types, `Protocol`, and the umbrella `OMI.Types` (commit `13d90bb`; tests pass)
- Found that the document's BIOS paths always close, because they start from the zero relation and `delta(0, 0) = 0`
- Added [[USE-00 Use Case Scenarios]] scenario 4a

### Author's Decisions: BIOS and Positions

- BIOS paths start from the given relation; a badly framed relation is caught with the structure computed from 0 and can be repaired and tried again (`omi-types` `OMI.Try`, commit `64745a8`)
- `PLiteral` / `PStruct` are coordinate nibbles; sixteen make the first 8 byte indices

### The Two Poles

- Resolved [[OPEN-01 Open Questions]] #18 with the author's correction: 60 ⊕ 64 for the lower 8 indices and 60 ⊕ 128 for the higher 8. The 16 × 16 byte-table reading ties together the four-block family (#10), the diagonal and offset 12 (#13) and the root relation `{c − r, c + r}`. Added to `core/src/verified/wordform.ts` with tests (26 passing)

### Proxy, Reflect and the Headless Presenter

- Named the Fano points: Reflect = try ⊕ finally, Proxy = catch ⊕ finally ([[OPEN-01 Open Questions]] #19)
- Recorded the author's roles for `core/src` (headless proxy presenter) and the `space/` target (three.js breadboard in a 360 × 65536 tetrahedron)
- Moved the development REPL (`server.ts`, `define.commands.ts`) to `src/`; added `rosetta/src/assets/commands.vtt` with a sync test (27 tests passing)

## Pending

- Transcribe the audio file `How_an_AI_Dismantled_the_Omi-Dom-Stack.m4a`
- OCR the image-only PDF `The_Honest_Protocol_Audit.pdf`
- Write the source MOCs (SRC-00 through SRC-08)
- Write the source index (SRC-99)
- Write the README
- Run the validation script
- Fix the known bugs
- Implement the missing methods
- Run the self-test
