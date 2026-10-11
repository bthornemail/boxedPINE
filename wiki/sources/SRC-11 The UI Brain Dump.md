---
id: SRC-11
title: "The UI Brain Dump"
kind: source
layer: sources
status: draft
spec: OMI-IMO-2026
up: "[[SRC-99 Source Index]]"
down: []
related:
  - "[[SPEC-44 The Virtual Breadboard]]"
  - "[[SPEC-07 The Fundamental Invariants]]"
  - "[[SPEC-27 The Prompt Tree Index]]"
  - "[[OPEN-01 Open Questions]]"
sources: []
code:
  - "space/xr.html"
  - "space/src/breadboard.geometry.ts"
  - "core/src/verified/loopback.ts"
  - "rosetta/src/walkthrough.ts"
dimensions: []
symbols: []
tags: [omi-imo, source, archive, user-interface, panner, vtt, dom-geometry, busybox, cidr]
---

# The UI Brain Dump

**Files:** `_archive/_inbox/The OMI-IMO Protocol -- A Paradigm Shift in Distributed Coordination.md` and `_archive/_inbox/The BusyBox + DOM Unified Proposal.md` (copies also in `omi-dom-stack/user-docs/`). Shared by the author on 2026-10-11 as "a brain dump on a user interface".

**What they are:** a set of drafts written with another AI. The first holds a paradigm paper, a spec of three primitives (bind, apply, eval), an interpolation layer, the PannerNode as a 0D observer readout, the observer as circulator, the "infinite canvas kaleidoscope", an executive summary, and an implementation guide. The second proposes a portable RPC space: BusyBox, regex scopes over ASCII rows, a Blob in tetrahedron form, FIFO, and program as port over CIDR, NAT64 and localhost.

**How to read them now:** they predate the author's later corrections. In particular, the protocol does not define conformance levels or MUST rules ([[SPEC-27 The Prompt Tree Index]]), it names no regex symbols (I-64), and it has one axiom, propagation (I-63). The drafts are a source of UI ideas, not of protocol law.

## What Is Already Built

| In the drafts | In the repository |
|---------------|-------------------|
| CIDR virtual ports, NAT64, localhost, subnet delineation | `core/src/verified/loopback.ts` and ports as paths (I-69 to I-73, I-75) |
| WebVTT cues as the timeline and control channel | `rosetta/src/assets/walkthrough.vtt`, played in `space/xr.html` |
| DOM geometry and canvases as surfaces; the same scene on several | `space/src/breadboard.geometry.ts`: the geometry as data, drawn by three.js or written as A-Frame |
| Picture-in-picture surfaces | `space/xr.html`: video PiP of the 3D view, Document PiP of the 2D panel |
| The Blob in tetrahedron form: 4 vertices, 6 edges, 4 faces | `core/src/verified/block.ts`, the closure law (I-9) |
| Convergence to a fixed attractor | the Fano constants converge in two steps (I-66); the closure law reads 0000 |

## Claims Checked

| Claim | Mark | Why |
|-------|------|-----|
| A knot `bind(a, b)` with `knot[a] = b` and `knot[b] = a`, symmetric | **THEOREM** as XOR | k = a ⊕ b gives k ⊕ a = b and k ⊕ b = a, and a ⊕ b = b ⊕ a. This is the digest's bind (`exchange.ts`); tested |
| ASCII 0x00–0x7F splits into eight rows of 16 by the high nibble | **THEOREM** | row = byte ≫ 4; tested. Which dimension each row names (−4D … 3D) is a DEFINITION, and it differs from the vault's dimension ladder ([[SPEC-20 The Dimensional Axis]]) |
| "The monad, functor and comonad laws hold" for bind, apply, eval | **FAILS** as stated | `bind : (item, item) → knot` is not a monad's bind, whose type is `m a → (a → m b) → m b`. The laws are asserted, not shown |
| "The three primitives are Turing-complete" | **FAILS** as stated | asserted with no construction |
| "No hash collisions" because identity is structural | **FAILS** here | the MAC fold sends many MACs to one loopback address (I-69): structure can collide |
| "Sub-cycle XOR ≈ 0.1 ns, below one CPU cycle" | **FAILS** as stated | a CPU's XOR instruction takes at least one cycle; several can run in one cycle (throughput), and a single gate switches in picoseconds. "Sub-cycle" holds for gates or throughput, not for one instruction |
| The PannerNode's position is readable and writable "from any thread, worker or worklet", and Web Audio is "thread-safe" | **FAILS** as stated | an AudioContext and its nodes live on the main thread; workers cannot reach them, and an AudioWorklet sees only the audio that flows into it |
| The PannerNode reports the observer's 0D position as three numbers | DEFINITION | a fair UI choice: `positionX/Y/Z` are three AudioParams |
| Six orthogonal observers per precision, 24 across 8 to 64 bits; the −3D…10D and −5D…12D spectra | DEFINITION | the author's labels; nothing derives them |
| stdin, stdout, stderr as "the interface 3!" beside BL, BO, BPE | DEFINITION (analogy) | three things in each, so 3! orderings of each |
| The generalized mean M_p and interpolation t ∈ [0, 1] | value arithmetic | allowed only behind a VALUE DOOR (I-74); a UI may interpolate, the core may not |
| MUST / MUST NOT conformance levels | superseded | the author: "we are not defining anything … not algorithms" |

## Usable Next, for the Interface

- A **PannerNode** placed at the Breadboard Space's lit point, so the reading is heard in space as well as seen (the breadboard already computes XOR in Web Audio).
- **Mnemonics as cube faces** (FRONT +Z, BACK −Z, LEFT −X, RIGHT +X, UP +Y, DOWN −Y), drawn from the geometry data.
- A **trace log** of readings, append-only, which the walkthrough track and presence probes could both write to.

⟦Author to say which of these the interface should take next.⟧
