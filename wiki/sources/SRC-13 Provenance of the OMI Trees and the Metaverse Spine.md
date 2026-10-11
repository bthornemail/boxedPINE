---
id: SRC-13
title: "Provenance of the OMI Trees and the Metaverse Spine"
kind: source
layer: sources
status: draft
spec: OMI-IMO-2026
up: "[[SRC-99 Source Index]]"
down: []
related:
  - "[[SRC-12 The Continuation Brain Dump]]"
  - "[[SPEC-07 The Fundamental Invariants]]"
sources: []
code: []
dimensions: []
symbols: []
tags: [omi-imo, source, provenance, lineage, restore, closure]
---

# Provenance of the OMI Trees and the Metaverse Spine

Recorded 2026-10-11, from the author's statements and from git history read that day. It says where things came from; it defines nothing.

## The Author's Timeline

- Coining the name "omi" was when the author began learning hexadecimal, the beginning of understanding binary.
- On 2026-10-11, on learning what XNOR is, the author said they now understand logic operations.

## The Trees

| Place | What it is | Source |
|-------|------------|--------|
| `/home/main/omi` | the source folder of `~/omi--mush` | the author |
| `~/omi--mush` | the omi projects isolated from the rest: 20 top-level folders (axiomatic-sovereignty, omi-agent, omi-axioms, omi-canon, omi-canvas, omi-cron, omi-docs, omi---imo, omi-isa, omi-lab, omi-lisp, omi-metatron, omi-port, omi-portal, omi-tetragrammatron, omi-types, omi-vault, omnicron, o---o, tree-sitter), 1,908 folders and 8,215 files | `~/omi--mush/tree.txt` |
| `~/devops` | the earlier metaverse build spine: the applications and gates run by `scripts/closure-spine-smoke.sh` | the author; `WORKSPACE DOCTRINE - Deterministic Cyber-Physical Metaverse.md` there |
| boxedPINE | this vault and its code | — |

`omi-axioms` and `omi-types` in `~/omi--mush` are what became boxedPINE's `proofs/` and `types/`. `axiomatic-sovereignty/1-logic-proofs/coq/04-execution/Delta16HasExactPeriodEight.v` there is the period-8 proof that the ESP32 reading matched (SPEC-07 I-101).

## `omi-system.omilisp`

The file `omnicron/declarations/omi-system.omilisp` is the whole protocol compiled into a variant of OMI-Lisp: a self-map with identity, address, a causal ladder, byte strata, laws, and Phase 84–115 blocks.

- **Not the author's.** The author's own Lisp is for declarations only: cons and dot notation.
- **First added 2026-05-09** in commit `a456cd6`, "Phase 95 … transmutator", in the May tree (`~/Downloads/omi`). The commit message says "Codex proved that…", so it was written with Codex while round-tripping OMI-Lisp through S-P-O-M, Prolog-like facts, RDF-like triples and JSON.
- **Committed into omnicron 2026-07-08** (`824d9c4`) with the note "i donkw wher ioujnd hisssss".
- **Copies:** eight byte-identical copies (sha256 `2c40aca6e0…`, 778 lines) in `~/omi`, `~/omi--mush`, `~/omi--mush (2)`, `omi-files/` here and Downloads; one earlier 797-line version (May 15) in `~/Downloads/omi/declarations/`.
- **Used as input only.** The omnicron workbench parses it (`tests/workbench_omi_self_declaration_test.js` and about 30 other workbench tests); nothing in omnicron writes it.

## The Spine, Restored

A backup had split `~/devops`: the newest scripts stayed there, and the projects were scattered, many as empty folders. On 2026-10-11 it was reassembled, with nothing deleted. Every step is in `~/devops/RESTORE-LOG-2026-10-11.md`.

| Source | What came from it |
|--------|-------------------|
| WD SSD `devops/` (newest, files to May 27) | metaverse-kit, metaverse-build, port-matroid, light-garden, port-lattice, geometry-spine, metaverse, monad-functor-perceptron, psync, psync-core, atomic-kernel, polyform-core, as git checkouts with their unpushed work |
| Seagate `devops/` (May 23) | axiomatic, boundary-interior-combinatorial-framework, tetragrammatron-os, Shape Signature, ulp-core-invariant, PhaseDSL, genesis-frame, integration-bridge, audit-artifacts |
| GitHub `commit-all-030526` snapshot branches | waveform-core and mind-git as checkouts; single files for automaton (`50d4395`) and hyperbolic-geometric-neural-network (`cc2b003`), each written only after its git blob hash matched the commit |

Also needed: a `cabal.project.local` so ulp-core-invariant builds on GHC 9.10; a small `openFd` change in port-matroid for unix 2.8; executable flags restored on about 2,400 scripts that the backup drives' file systems had dropped; an empty cabal registration moved aside; Node packages installed without changing any tracked file.

**Result.** `closure-spine-smoke.sh` passed in full, locally, at 2026-10-11 18:47 UTC: final digest `sha256:ef47d9e0…`. A rerun with nothing changed was a cache-hit in 11 seconds. The digest differs from the last recorded build (2026-03-22, `815aea0f…`) because the inputs digest includes each repo's commit, the tool versions and the compiler. The faithful part is that every golden replay matched its locked hash.

**Not checked.** The three server steps were switched off: the servers they reach are wiped and no longer accessible (the author). `port-matroidd` does not compile as committed (`8bd8f03`); the closure does not use it.
