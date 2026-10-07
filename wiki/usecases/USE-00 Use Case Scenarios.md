---
id: USE-00
title: "Use Case Scenarios"
kind: usecase
layer: usecase
status: draft
spec: OMI-IMO-2026
up: "[[OMI-IMO]]"
down: []
related:
  - "[[META-04 Repository Frame]]"
  - "[[PROG-00 Homoiconic Syntax Tracker]]"
  - "[[SPEC-44 The Virtual Breadboard]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-50 Stream Transport]]"
  - "[[SPEC-52 The REPL and the Digest]]"
sources: []
code:
  - "omi-files/"
dimensions: []
symbols: []
tags: [omi-imo, usecase, scenarios, omi-files, demonstration]
---

# Use Case Scenarios

The projects in `omi-files/` are earlier renditions of the same protocol, each built while learning a different layer. Here each one is a **use case scenario**: a concrete situation the protocol has to handle, with a rendition that already explores it.

For a builder, each scenario says what the demonstration must make possible and where existing work can be mined. The framework itself lives in `core/`, `rosetta/`, `space/` and `src/` ([[META-04 Repository Frame]]). These projects are reference and proof, not the framework.

**What "State" means:** *checked* = run or compiled during this vault's work; *not run* = read from its README only.

## The Scenarios at a Glance

| Scenario | Project | Ladder levels | Frame folder it informs | State |
|----------|---------|---------------|-------------------------|-------|
| Prove a law | `omi-axioms` | 0–1 | `core/` | checked (period-8 proof compiles) |
| Run the reference in Haskell | `omi-canvas` (merged from `omi`) | 0–3 | `core/`, `rosetta/` | checked (`cabal test all` passes) |
| Hear and see the gates | `space/breadboard` (moved from `omi`) | 0, 5 | `space/` | checked (`npm test`) |
| Reduce a declaration to a canvas | `omi-canvas` | 2–4 | `rosetta/`, `space/` | not run |
| Declare in OMI-Lisp | `omi-lisp` | 2–5 | `rosetta/` | not run |
| Segment before parsing | `omnicron` | 1–3 | `rosetta/` | not run |
| Execute on a fixed-width ISA | `omi-isa` | 0, 4 | `core/` | not run |
| Replay deterministically | `atomic-kernel` | 0, 4 | `core/`, `src/` | not run |
| Witness across four authorities | `omi-tetragrammatron` | 3–5 | `rosetta/`, `space/` | not run |
| Address and conform | `tetragrammatron` | 1, 4 | `src/` | not run |
| Boot on bare metal | `polytron`, `omi-bios` | 0, 4 | `core/` | not run |
| Compose with sound | `omi-music` | 5 | `space/` | empty workspace |

## The Scenarios

### 1. Prove a law — `omi-axioms`

**Scenario:** someone doubts a claim, for example "the delta returns after 8 steps". They open the proof and have a machine check it.
**Provides:** categorized Coq proofs (`coq/00-foundations` … `coq/04-execution`) and a proof book (`coq-docs/OMI-DETERMINISTIC-COMPUTATION-PROOF-BOOK.md`). Its README draws the line: it "proves bounded invariants"; it does not render or execute.
**Checked:** `Delta16HasExactPeriodEight.v` compiles with no `Admitted` ([[OPEN-00 Contradiction Register]] #2).
**Feeds:** every module in `core/src/verified/` should name a proof here when one exists.
⟦Which other proofs should a visitor be able to open from the demonstration?⟧

### 2. Run the reference in Haskell — `omi-canvas` (merged from `omi`)

**Scenario:** check that a second language computes the same thing as the JavaScript.
**History:** the former `omi` project had its own `Byte` type (eight bits). On 2026-10-07 it was merged into `omi-canvas` so both use one set of types, the nibble-pair `Byte`:
- `OMI.Bits`: XOR on every word size, and the three delta rotations.
- `OMI.Delta`: `delta`, `delta8`, `advanceRelation`.
- `OMI.Handler`: bind / apply / eval / digest over `Word16` positions.

`omi`'s `Kernel`, `Relation` and `Pipeline` were superseded by canvas's own. They are kept in `_archive/omi-haskell/`.
**Checked:** `cabal build all`, `cabal test all` and `ghc -fno-code` pass. The tests show `delta` matches the spec on all 65,536 words for five carries, and the handler reproduces the slot values recorded from `omi` before the merge. Putting back the old `rotr2` makes the suite fail. `omi-canvas` commit `1559dc1`.
**Feeds:** `core/src/verified/delta.ts`, and `rosetta/src/grammar/grammar.ts`, where the grammars still disagree on `EXPONENT`.

### 3. Hear and see the gates — `space/breadboard`

**Scenario:** a visitor flips inputs A and B and watches and hears four transistor XOR builds agree.
**Provides:** the virtual breadboard: canvas for geometry, Web Audio for the signals, a description that regenerates everything ([[SPEC-44 The Virtual Breadboard]]).
**Checked:** its offline self-test passes for all four builds (`cd space/breadboard && npm test`).
**Feeds:** `space/` view 8. It is the only finished visual so far. It moved from `omi-files/omi/audio` to `space/breadboard` on 2026-10-07, since it is spatial rendering.

### 4. Reduce a declaration to a canvas — `omi-canvas`

**Scenario:** a declaration goes in, passes through the canonical pipeline, and comes out as relations drawn on a canvas.
**Provides:** a Haskell type engine for the ten-stage pipeline: Declaration → Citation → Gauge → WittgensteinOperator → TruthGate → DecisionTable → KarnaughMap → Combinator → Delta → Blackboard → ProjectionFace → Attestation. Same as rev1 Part VIII. Its README: "Canvas is a projection layer", never the authority.
**Feeds:** the bridge between `rosetta/` (the declaration) and `space/` (the projection).
⟦Is this pipeline the intended reading order for Level 4, a wordform read as a program?⟧

### 5. Declare in OMI-Lisp — `omi-lisp`

**Scenario:** write the protocol as Lisp forms: the "executable notation" of the canonical laws.
**Provides:** a C rebuild root (`src/omi_lisp.c`, `omi_parse.c`, `omi_candidate.c`, an adapter contract) and docs (`SPEC.md`, `LOWERING.md`, `ADAPTER_BOUNDARY.md`). Its own manifest marks it as a rebuild root, with the old tree under `_archive/`.
**Feeds:** `rosetta/`. This is the most direct prior attempt at the homoiconic syntax.
⟦Is OMI-Lisp the surface syntax the visitor types into the REPL?⟧

### 6. Segment before parsing — `omnicron`

**Scenario:** raw bytes arrive. Before anything is parsed, they are split at admissible boundaries.
**Provides:** a "boundary-first, not parser-first" doctrine: canonical bytes → admissible segmentation → declared structure → gauge law → propagation → projection → receipts → presentation.
**Feeds:** `rosetta/`. It matches the split found in the grammar: position rules decide what is admissible; symbols classify tokens ([[PROG-00 Homoiconic Syntax Tracker]], Level 3).

### 7. Execute on a fixed-width ISA — `omi-isa`

**Scenario:** run the protocol as instructions on a small virtual machine, and send them between devices.
**Provides:** a C runtime: 16-bit register VM → 512-bit envelopes → 32-slot dispatch → gauge lambda engine → LoRa RF → Web Serial + WASM → mesh networking. Its guiding question: "What structure can be removed while the same canonical replay still results?"
**Feeds:** Level 4, what running an `EXCHANGE` wordform should do at machine level.

### 8. Replay deterministically — `atomic-kernel`

**Scenario:** two parties run the same steps and must get byte-identical results, checked across languages.
**Provides:** "Bits → canonical algorithms → deterministic clock → canonical artifact → dual identity → platform adapters", with conformance checks and golden outputs (`golden/`, `tests/`).
**Feeds:** `src/testbed/`. Its golden artifacts are a model for acceptance tests.

### 9. Witness across four authorities — `omi-tetragrammatron`

**Scenario:** one state is cited, validated, projected and carried by four separate authorities, joined by a single witness, the Omi-Ring.
**Provides:** OMI (citation: addresses, CONS/CAR/CDR, 16 opcodes, nibble CPU), Tetragrammatron (validation: DeltaC, Polybius, Diagonal Law, the 5040 ring), Metatron (projection), IMO (carrier).
**Feeds:** `space/`, as the shape of a multi-view demonstration, and `rosetta/` (the Omi-Ring is a "palindromic notation witness", compare `PALINDROME`).

### 10. Address and conform — `tetragrammatron`

**Scenario:** a new implementation proves it agrees with the baseline before it is trusted.
**Provides:** a semantic baseline with a conformance kit (`docs/conformance-kit.md`) and a minimal verifier. Doctrine: "Identity is canonical. Authority is delegated. Credentials are adapters. Descriptors are discoverable. Presentation is projection."
**Feeds:** `src/testbed/`, how outside implementations would be checked against this one.

### 11. Boot on bare metal — `polytron` and `omi-bios`

**Scenario:** the protocol runs with no operating system: from power-on to an image on screen.
**Provides:**
- `polytron`: a bare-metal RISC-V kernel for QEMU that exports its state as serial text and pixel images, with "lisp expression → pixel buffer" planned.
- `omi-bios`: a 4 MiB (4,194,304-byte) raw image, `bios.img`. There is also a second copy named `.\bios.img`, a Windows path accident.

**Feeds:** the far end of the ladder: the Blob as a bootable, transportable object.
⟦What does `bios.img` contain, and how was it built?⟧

### 12. Compose with sound — `omi-music`

**Scenario:** hear the protocol's structure as music.
**Provides:** an OpenMusic workspace (`preferences.lisp`) with empty `elements`, `globals`, `in-files` and `out-files` folders.
**Feeds:** `space/`, alongside the breadboard's tones.
⟦What should be composed first: the orbit of 60, the 240-clock, the swaps?⟧

## How the Scenarios Map onto the Ladder

| Level | Scenarios |
|-------|-----------|
| 0 — the primitive | 1, 2, 3, 7, 8, 11 |
| 1 — the reference space | 1, 6, 10 |
| 2 — the wordform | 4, 5, 6 |
| 3 — the regex constraints | 4, 6, 9 |
| 4 — datum and program | 4, 5, 7, 8, 10, 11 |
| 5 — homoiconicity | 3, 5, 9, 12 |

Level 4 has the most prior work: six renditions each run *something* as a program. Mining them is the fastest route to the missing `EXCHANGE` reader ([[PROG-00 Homoiconic Syntax Tracker]], milestone 4).

## Adding a Scenario

When a new rendition is added to `omi-files/`:

1. Add a row to *The Scenarios at a Glance*.
2. Add a section with **Scenario**, **Provides**, **Checked** (only if actually run), **Feeds**, and a ⟦placeholder⟧ for anything only the author knows.
3. Add it to the ladder map.
