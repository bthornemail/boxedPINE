---
id: META-04
title: "Repository Frame"
kind: meta
layer: meta
status: canonical
spec: OMI-IMO-2026
up: "[[META-00 Vault Schema]]"
down: []
related:
  - "[[PROG-00 Homoiconic Syntax Tracker]]"
  - "[[EXT-04 Literate Workflow]]"
  - "[[SPEC-61 Implementation Status]]"
  - "[[USE-00 Use Case Scenarios]]"
sources: []
code:
  - "core/README.md"
  - "rosetta/README.md"
  - "space/README.md"
  - "src/README.md"
dimensions: []
symbols: []
tags: [omi-imo, meta, repository, frame, folders, demonstration]
---

# Repository Frame

The repository is a demonstration project. The author describes the intent; builders write the code. Each top-level folder has one job, and each has a README that inscribes it for a builder.

The roles below are the author's own delineation (2026-10-09). Each folder is one kind of place in the structure map ([[SPEC-09 The Structure Map]]).

| Folder | Job (author) | Kind of place | Holds now |
|--------|--------------|---------------|-----------|
| `core/` | The core store of the bitwise and logical operations that compose the protocol. Basically a library | **law**: operations | `core/src/verified/` (exchange, swap, delta, wordform, triples, block, circulator, metron); `core/src/index.ts` (the author's sketch) |
| `rosetta/` | The canonical knowledge store for bootstrapping regex constraint declarations, string definitions, and the 15 tree algorithms test framework, toward a decentralized second brain. The testing ground for natural-language integration: lazy and greedy evaluation, combinators, closures, bind and cons as the dual interface to the Hamming point-difference selector of XNOR and XOR, over the 15 meta-tree algorithmic regex and string-literal interpolation of Blobs in 65,536-bit nodes | **law**: declarations and definitions | `rosetta/src/grammar/` (grammar, kernel, catalog); `rfc.ts`, `bin.ts`, `mcp.ts`; `assets/` (cues, the rosetta stone) |
| `types/` | A host for pure types that are computable: Haskell now, open to any computable type interface. The **tree proxy** of the tree classification model. Its own repository (`omi-types`), moved out of `omi-files/` on 2026-10-09 | **law**: types | the `OMI.*` modules (Ruler, Orbit, BQF, Torus, BIOS, Try, …); `cabal test all` passes |
| `proofs/` | A host of proofs computable in Coq, Lean or any other theorem prover: the algorithmic expression. Its own repository (`omi-axioms`), moved out of `omi-files/` on 2026-10-09 | **check**: formal | about 108 Coq modules in `coq/00-foundations` … `coq/04-execution`; `make` builds them |
| `breadboard/` | A virtual breadboard demonstrating the physical XOR circuitry | **realization**: circuit | the 5T, 6T, 8T, 10T builds, computed in Web Audio (`kernel.mjs`, `xor.mjs`, `test.mjs`) |
| `space/` | A projective space (three.js, canvas, media elements, CSSOM geometry): a beacon and intersection observer, like a document picture-in-picture overlay, for background-worker variants that translate between prompts and causes | **realization**: projection | `space/src/` (scene, controller, board, `atomics.ts`) |
| `repl/` | The REPL the author built to learn while building: an outside observer and command trap for bootstrapping the paradigm | **realization**: observer | `repl/src/` (`server.ts`, `define.commands.ts`, `broadcast.ts`) |
| `omi-files/` | Use-case examples demonstrating the protocol over unique, discrete substrates | **realization**: substrate | Projects catalogued in [[USE-00 Use Case Scenarios]] |
| `src/` | The project bootstrap root, so the rest stays modular and portable, and fact stays apart from fiction and development from production | **check** | `src/main.ts`; `src/testbed/` (`npm test`) |
| `wiki/` | A pedagogical, ontological wiki: a walkthrough of the build to production, as a second brain | **reading** | This vault |
| `_archive/` | Retired code and earlier specifications | — | Old code moves here; nothing is deleted |

## How Work Flows

1. A finding is discussed and checked here in the wiki: [[OPEN-00 Contradiction Register]], [[OPEN-01 Open Questions]].
2. Once verified, it becomes a module in `core/` or `rosetta/` that names its evidence.
3. A test in `src/testbed/` states the fact in its name. It is now canonical ([[SPEC-09 The Structure Map]]).
4. A realization shows it on a substrate: `breadboard/` as a circuit, `space/` as a projection, `repl/` to an observer, `omi-files/` on another substrate.
5. The step is logged in [[PROG-00 Homoiconic Syntax Tracker]].

## Placeholders

`⟦PLACEHOLDER⟧` in code and READMEs marks a decision only the author can make. Search the repository for `⟦` to list them all.
