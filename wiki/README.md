---
id: README
title: "OMI-IMO Protocol Vault"
kind: meta
layer: meta
status: canonical
spec: OMI-IMO-2026
up: "[[OMI-IMO]]"
down: []
related:
  - "[[OMI-IMO]]"
  - "[[META-00 Vault Schema]]"
  - "[[META-01 Extractive Method]]"
  - "[[META-02 Evidence and Confidence]]"
  - "[[META-03 Change Log]]"
  - "[[META-04 Repository Frame]]"
  - "[[SRC-99 Source Index]]"
  - "[[SPEC-00 Canonical Statement]]"
  - "[[SPEC-01 The Three Laws]]"
  - "[[SPEC-02 Conformance Criteria]]"
  - "[[SPEC-03 Notation OMI-Lisp]]"
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-11 The Three Primitives]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-14 Knots and Binds]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-20 The Dimensional Axis]]"
  - "[[SPEC-21 The Inversion Law]]"
  - "[[SPEC-22 The Blob]]"
  - "[[SPEC-23 The Rosetta Stone]]"
  - "[[SPEC-24 Observers]]"
  - "[[SPEC-25 The Iff]]"
  - "[[SPEC-30 The Symbol Table G]]"
  - "[[SPEC-31 Declaration Syntax]]"
  - "[[SPEC-32 Mnemonics and Axes]]"
  - "[[SPEC-33 The Quadratic Forms]]"
  - "[[SPEC-34 Phases Attributes Constraints Configurations]]"
  - "[[SPEC-35 Reflections and Orbits]]"
  - "[[SPEC-36 The Literal Separation]]"
  - "[[SPEC-40 The 6T XOR Circuit]]"
  - "[[SPEC-41 The 8T XOR Circuit]]"
  - "[[SPEC-42 Circuit Sourcemap]]"
  - "[[SPEC-43 Prime Gaps and Sextuplets]]"
  - "[[SPEC-44 The Virtual Breadboard]]"
  - "[[SPEC-50 Stream Transport]]"
  - "[[SPEC-51 JSON Canvas Interchange]]"
  - "[[SPEC-52 The REPL and the Digest]]"
  - "[[SPEC-53 Clocks and Periods]]"
  - "[[SPEC-54 The Web Platform Layers]]"
  - "[[SPEC-55 ASCII Folds]]"
  - "[[SPEC-60 Test Vectors]]"
  - "[[SPEC-61 Implementation Status]]"
  - "[[EXT-00 How to Extend the Protocol]]"
  - "[[EXT-01 Adding a Dimension]]"
  - "[[EXT-02 Adding a Symbol]]"
  - "[[EXT-03 Adding a Substrate]]"
  - "[[EXT-04 Literate Workflow]]"
  - "[[EXT-05 Review Checklist]]"
  - "[[OPEN-00 Contradiction Register]]"
  - "[[OPEN-01 Open Questions]]"
  - "[[OPEN-02 Broken Code Inventory]]"
  - "[[OPEN-03 Glossary]]"
  - "[[OPEN-04 Discarded Claims]]"
  - "[[PROG-00 Homoiconic Syntax Tracker]]"
  - "[[USE-00 Use Case Scenarios]]"
  - "[[MAP-00 Protocol Canvas.canvas]]"
  - "[[MAP-01 Source Graph.canvas]]"
  - "[[MAP-02 Dimension Stack.canvas]]"
  - "[[MAP-03 Ruler Canvas.canvas]]"
tags: [omi-imo, index, readme, vault]
---

# OMI-IMO Protocol Vault

A second-brain wiki for the OMI-IMO protocol. Designed for literate programming: the specification, the source material, and the code are all crosslinked.

## Quick Start

1. **Start at the root:** [[OMI-IMO]]
2. **Read the canonical statement:** [[SPEC-00 Canonical Statement]]
3. **Understand the three laws:** [[SPEC-01 The Three Laws]]
4. **Explore the foundations:** [[SPEC-10 The Primitive]], [[SPEC-12 The Ruler]], [[SPEC-13 XOR Algebra]]
5. **See the architecture:** [[SPEC-20 The Dimensional Axis]], [[SPEC-23 The Rosetta Stone]]
6. **Learn the grammar:** [[SPEC-30 The Symbol Table G]], [[SPEC-31 Declaration Syntax]]
7. **Check the hardware:** [[SPEC-40 The 6T XOR Circuit]], [[SPEC-41 The 8T XOR Circuit]], then run them in [[SPEC-44 The Virtual Breadboard]]
8. **Understand the runtime:** [[SPEC-50 Stream Transport]], [[SPEC-52 The REPL and the Digest]]
9. **Verify:** [[SPEC-60 Test Vectors]], [[SPEC-61 Implementation Status]]
10. **Extend:** [[EXT-00 How to Extend the Protocol]]
11. **Track progress:** [[PROG-00 Homoiconic Syntax Tracker]]

## The Protocol in One Sentence

The OMI-IMO protocol is an Atomic Compare-and-Exchange Lisp. Its primitive is `Atomics.compareExchange`. Its base is the iff. Its structure is the 2! and 3! orthogonal groups. Its space is the 2¹⁶ Blob. Its observers are circulators reflecting swaps. Its behavior is time crystals (period 240). Its resolution is O(1). Its closure is reachability.

## The Vault Structure

```
wiki/
├── OMI-IMO.md                    — root MOC
├── README.md                     — this file
├── meta/                         — vault schema, method, evidence, changelog
├── sources/
│   ├── raw/                      — extracted text from PDFs
│   ├── parts/                    — source part notes
│   └── SRC-*.md                  — source MOCs
├── spec/
│   ├── 00-canonical/             — canonical statement, laws, conformance, notation
│   ├── 10-foundations/           — primitive, ruler, XOR, knots, delta, Fano
│   ├── 20-architecture/          — dimensions, inversion, Blob, Rosetta, observers, iff
│   ├── 30-grammar/               — symbols, declarations, mnemonics, forms, phases, orbits
│   ├── 40-hardware/              — 6T, 8T, sourcemap, primes, virtual breadboard
│   ├── 50-runtime/               — stream, canvas, REPL, clocks, web, ASCII
│   └── 60-verification/          — test vectors, implementation status
├── extend/                       — extension guides
├── open/                         — contradictions, questions, glossary, discarded
├── progress/                     — trackers of progress toward a goal
├── usecases/                     — use case scenarios (the omi-files renditions)
├── maps/                         — canvases
├── bases/                        — Obsidian Bases
└── tools/                        — validation scripts
```

## The Sources

| Source | Title | Status |
|--------|-------|--------|
| [[SRC-00 Protocol Review and Bug Fixes]] | DeepSeek0: Protocol Review and Bug Fixes | Extracted |
| [[SRC-01 XOR Tetrahedron Transform]] | DeepSeek1: XOR Tetrahedron Transform | Extracted |
| [[SRC-02 XOR Gate Transistor Circuits]] | DeepSeek2: XOR Gate Transistor Circuits | Extracted |
| [[SRC-03 Protocol Sequence Analysis]] | DeepSeek3: Protocol Sequence Analysis | Extracted |
| [[SRC-04 Assembly Register Programming]] | DeepSeek4: Assembly Register Programming | Extracted |
| [[SRC-05 Conspiracy Check]] | DeepSeek5: Conspiracy Check | Extracted |
| [[SRC-06 Phases vs Attributes vs Constraints vs Configurations]] | Google Search: Phases vs Attributes | Extracted |
| [[SRC-07 The OMI-IMO Complete Synthesis]] | The OMI-IMO Complete Synthesis | Read directly |
| [[SRC-08 XOR Gate Built with Transistors]] | XOR Gate Built with Transistors | Extracted |

## The Spec Notes

| Layer | Notes |
|-------|-------|
| Canonical | [[SPEC-00 Canonical Statement]], [[SPEC-01 The Three Laws]], [[SPEC-02 Conformance Criteria]], [[SPEC-03 Notation OMI-Lisp]] |
| Foundations | [[SPEC-10 The Primitive]], [[SPEC-11 The Three Primitives]], [[SPEC-12 The Ruler]], [[SPEC-13 XOR Algebra]], [[SPEC-14 Knots and Binds]], [[SPEC-15 The Delta Transform]], [[SPEC-16 The Fano Invariant]] |
| Architecture | [[SPEC-20 The Dimensional Axis]], [[SPEC-21 The Inversion Law]], [[SPEC-22 The Blob]], [[SPEC-23 The Rosetta Stone]], [[SPEC-24 Observers]], [[SPEC-25 The Iff]] |
| Grammar | [[SPEC-30 The Symbol Table G]], [[SPEC-31 Declaration Syntax]], [[SPEC-32 Mnemonics and Axes]], [[SPEC-33 The Quadratic Forms]], [[SPEC-34 Phases Attributes Constraints Configurations]], [[SPEC-35 Reflections and Orbits]], [[SPEC-36 The Literal Separation]] |
| Hardware | [[SPEC-40 The 6T XOR Circuit]], [[SPEC-41 The 8T XOR Circuit]], [[SPEC-42 Circuit Sourcemap]], [[SPEC-43 Prime Gaps and Sextuplets]], [[SPEC-44 The Virtual Breadboard]] |
| Runtime | [[SPEC-50 Stream Transport]], [[SPEC-51 JSON Canvas Interchange]], [[SPEC-52 The REPL and the Digest]], [[SPEC-53 Clocks and Periods]], [[SPEC-54 The Web Platform Layers]], [[SPEC-55 ASCII Folds]] |
| Verification | [[SPEC-60 Test Vectors]], [[SPEC-61 Implementation Status]] |

## The Extension Guides

- [[EXT-00 How to Extend the Protocol]]
- [[EXT-01 Adding a Dimension]]
- [[EXT-02 Adding a Symbol]]
- [[EXT-03 Adding a Substrate]]
- [[EXT-04 Literate Workflow]]
- [[EXT-05 Review Checklist]]

## The Open Questions

- [[OPEN-00 Contradiction Register]]
- [[OPEN-01 Open Questions]]
- [[OPEN-02 Broken Code Inventory]]
- [[OPEN-03 Glossary]]
- [[OPEN-04 Discarded Claims]]

## The Progress Trackers

- [[PROG-00 Homoiconic Syntax Tracker]] — how close the code is to one grammar that reads data and programs alike

## The Use Case Scenarios

- [[USE-00 Use Case Scenarios]] — the twelve `omi-files` projects as concrete situations the protocol must handle

## The Maps

- [[MAP-00 Protocol Canvas]]
- [[MAP-01 Source Graph]]
- [[MAP-02 Dimension Stack]]
- [[MAP-03 Ruler Canvas]]

## The Bases

- `bases/OMI-IMO Registry.base`
- `bases/Sources.base`
- `bases/Symbols and Dimensions.base`
- `bases/Open Threads.base`
- `bases/Status Board.base`

## The Meta

- [[META-00 Vault Schema]]
- [[META-01 Extractive Method]]
- [[META-02 Evidence and Confidence]]
- [[META-03 Change Log]]
- [[META-04 Repository Frame]] — what each repository folder is for
