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

| Folder | Job | Holds now |
|--------|-----|-----------|
| `core/` | Core findings: only what is computed, run or proved | `core/src/verified/` (exchange, swaps, delta, wordform, triples) |
| `rosetta/` | The regexes and declarations: the grammar | `rosetta/src/grammar/` (the full grammar and the self-generating kernel) |
| `space/` | Spatial rendering: the visual and interactive environment | Eight views inscribed in `space/README.md`; the breadboard (`space/breadboard/`) is built |
| `src/` | The test bed: the Vite app entry and the checks | `src/testbed/` (`npm test`) |
| `wiki/` | The natural-language presentation and knowledge bank | This vault |
| `_archive/` | Retired code and earlier specifications | Old code moves here; nothing is deleted |
| `omi-files/` | Earlier renditions of the same protocol, used as **use case scenarios** | Projects catalogued in [[USE-00 Use Case Scenarios]] (`omi` was merged into `omi-canvas` and `space/breadboard`; `omi-canvas` was forked as `omi-types`) |

## How Work Flows

1. A finding is discussed and checked here in the wiki: [[OPEN-00 Contradiction Register]], [[OPEN-01 Open Questions]].
2. Once verified, it becomes a module in `core/` or `rosetta/` that names its evidence.
3. A test in `src/testbed/` states the fact in its name.
4. A view in `space/` draws it.
5. The step is logged in [[PROG-00 Homoiconic Syntax Tracker]].

## Placeholders

`⟦PLACEHOLDER⟧` in code and READMEs marks a decision only the author can make. Search the repository for `⟦` to list them all.
