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

### The Literal Separation

- Wrote [[SPEC-36 The Literal Separation]] from the author's later chat: `/PINE/`, `/boxed/`, `/eE/`, the base form and the Omicron constraint; added `PINEBOXED` to the grammar with tests (29 passing)
- Noted that the chat inverts XNOR (it is 1 when equal), and answered its last question from the breadboard: the XNOR is read at the 5T node (BOOT0)

- Rewrote [[SPEC-36 The Literal Separation]] around the author's stated concept (literals like BigInt `0n`; `e`/`E`; datum radices; `[d\.]`) and the author's own draft regex; offered a revision that admits `0P`/`0I`/`0N`

- SPEC-36: the `0n` reduction from the Uniform Bitboard (place-value nibbles, handles), base36 from the block bits, the gauge diagonals, and the animation-frame forms; 33 tests passing

- Added [[SPEC-37 The Catalog Coordinate]] (`<base32?base36=base64>`), `rosetta/src/grammar/catalog.ts` and the `CATALOG` rule; logged the `rfc.ts` base36 decode bug; 35 tests passing

## 2026-10-08

- Made `core/src/index.ts` compile (0 errors under `core/tsconfig.json`, which was itself repaired: a missing `extends` was removed, and `include` now points at `src/`). Each change is marked in the file as a DECISION or FIX; the cascade rewrite is proven identical to the old `switch`
- Added the closure law with real tests: [[SPEC-67 The Block and Its Closure]], `core/src/verified/block.ts`
- Decided: CENTER accepts signs; RIGHT = I, CENTER = N, LEFT = P ([[SPEC-36 The Literal Separation]])
- Followed the author's reorganisation: the REPL is in `repl/`, `model.ts` and `animation.frame.ts` are in `_archive/`; the sync test reads `repl/src/define.commands.ts`
- Logged [[OPEN-02 Broken Code Inventory]] #26: `new Node()` does not finish (16⁶ iterations)

## 2026-10-09

- Brought in the author's ontology conversation as [[SRC-10 The Ontology Conversation]] and five canonical notes: [[SPEC-04 First Principles]], [[SPEC-05 The Axiom of Propagation]], [[SPEC-06 The Circulator]], [[SPEC-07 The Fundamental Invariants]], [[SPEC-08 The Derivation Path]]
- Implemented the Circulator (`core/src/verified/circulator.ts`) with tests for its conservation laws; 46 tests passing
- Verified the conversation's checkable claims: two do not hold as stated (the carry-forward fold's period; the preheader's length), one is a naming rather than an identity ("XNOR space")
- Resolved `{17, 19}` ([[OPEN-01 Open Questions]] #14)
- Covered the conversation's last stretch: [[SPEC-07 The Fundamental Invariants]] I-28 to I-47, `core/src/verified/metron.ts`, SPEC-08 parts 16–20, [[OPEN-01 Open Questions]] #20
- Rewrote the folder table of [[META-04 Repository Frame]] to the author's delineation; `breadboard/` is its own root folder and `repl/` is listed
- Added [[SPEC-09 The Structure Map]]: every structure mapped to its home, its check and its realizations, with the rule for when a structure is canonical over the medium; 51 tests passing
- Moved `omi-files/omi-axioms` to the root folder `proofs/` and `omi-files/omi-types` to `types/` (both keep their own repositories and GitHub names); `cabal test all` passes from `types/`
- Added the tree model, sixteen Blobs addressed by one 20-bit index (`core/src/verified/tree.ts`, [[SPEC-09 The Structure Map]]); 53 tests passing
- Added [[SPEC-26 The Prompt Tree]]: the BOM at file 0 holds the Prompt Tree (exponent → exception → declaration → definition → the leaf Blob); its levels are the three swaps, and its 16-bit path indexes the leaf exactly. The fifteen treemaps are catalogued in `rosetta/src/grammar/treemaps.ts`. SPEC-07 I-48 to I-53; [[OPEN-01 Open Questions]] #21; 58 tests passing
- Added SPEC-27 as "The Prompt Tree Algorithm", a formal statement for implementers in any language, with JSON vectors (`src/testbed/vectors/prompt-tree.json`). Recorded that the level shape is the complete binary tree on 16 leaves (standard), and that "a path is four independent positions" is a decision with a stated alternative; 59 tests passing
- Recast SPEC-27 as [[SPEC-27 The Prompt Tree Index]] on the author's correction ("we are not defining anything … we are deriving the patterns and indexing them so they can be used repeatably and propagated forward through regex declarations"): derived pattern, chosen labels, index register, and the `PROMPT_PATH` regex declaration that carries it forward; no MUST language. 60 tests passing
- Registered the tree's two directions: the flip is `j ⊕ 15`, the 4-bit XNOR with 0, the fourth of the swap family and the only one acting at the root; the BOM is file 0 as a prefix and file 15 as a suffix ([[SPEC-27 The Prompt Tree Index]] §5, I-54, OPEN-01 #21). Checked and rejected that the direction and the ASCII cascade are one choice (I-55). 62 tests passing
- Inscribed the author's **Axiom of Direction** in [[SPEC-05 The Axiom of Propagation]] and derived its parts (`core/src/verified/period.ts`): the prime gaps 2 and 4 sum to 6 and multiply to 8, the periods of 1/7 and 1/73; 1/511 repeats over 24; the lens 60 ⊕ 64 = 124 keeps both periods (124 ≡ 10¹¹ mod 511), one of only five lenses, while 60 ⊕ 128 does not. SPEC-07 I-56 to I-59; 65 tests passing
- Inscribed the author's **only input** ([[SPEC-04 First Principles]]): a declaration regex and a seed, nothing else; added the resolver `rosetta/src/grammar/resolve.ts`. "A polynomial is a regex expression" checked: exact for bounded regexes (I-61). The fifteen treemaps' enumeration and ASCII cascade both derive from one binding (I-62). Corrected SPEC-05: "Axiom of Direction" was proposed in conversation, not named by the author. 69 tests passing
- The author declined the name "Axiom of Direction": the Axiom of Propagation is the only axiom, and propagation the protocol's only purpose (I-63). SPEC-05's section is now "The Linear Sequencing of Causality", in the author's words. Inscribed "regex as it is" (I-64): the protocol names no regex symbols or words, and any shared regex variant serves; the earlier "portability comes from conformance tests" in SPEC-04 is superseded

## 2026-10-11

- Made the Fano icon files "convergent in any Buffer and autonomous on any FPGA" (author): `core/src/verified/fano.ts` holds the 16 constants (exactly the XOR-closed 7-bit masks), a two-step convergence of any byte, the duality at index i ⊕ 15, and a whole-number reader; the 18 drawings are in `space/src/assets/fano/`. [[SPEC-16 The Fano Invariant]] "The Sixteen Constants"; SPEC-07 I-65 to I-68; 72 tests passing
- Stage 1 of the author's XR / text-track / QEMU plan: a MAC folds to a 127/8 loopback address (`core/src/verified/loopback.ts`), index 0 served by CUPS IPP at 127.0.0.1:631, carried over NAT64 in 64:ff9b:1::/48; the wiki walkthrough as a WebVTT track citing its Coq proofs (`rosetta/src/walkthrough.ts`, `rosetta/src/assets/walkthrough.vtt`). SPEC-07 I-69 to I-71; 76 tests passing
- Presence (author: "mqtt subscriptions and publication to see if anyone is already broadcasting; udp also"; "we only get back deviation"): `repl/src/presence.ts`, a UDP bind as compare-exchange and an MQTT probe that returns only the deviation of heard indices; tested on a private mosquitto, checked once live on test.mosquitto.org (IPv4; this machine has no IPv6 route) and cleared. SPEC-07 I-72; 78 tests passing
- Reverse names (RFC 2317 classless delegation, `ip6.arpa`) for loopback and NAT64 addresses; the RFC's blocks are levels of the last octet's high nibble (SPEC-07 I-73, SPEC-27 §1). Stage 3 recorded as [[OPEN-01 Open Questions]] #22, with eBPF and the QEMU GED event bus. 81 tests passing
- Index integrity (author: "every number is an index"): sizes rewritten as shifts and masks, value arithmetic fenced in three VALUE DOORS (metron, period, the fano reader), and a test that fails on × ÷ % in `core/src/verified/` outside a door. SPEC-07 I-74; 82 tests passing
- Ports as Prompt Tree paths with CIDR in nibbles (the prefix as a location), two numbers dialling the lens from a point, three numbers as a Fano transform matrix (exactly 168 symmetries), and casing styles as literals of one word sequence ([[SPEC-27 The Prompt Tree Index]] §8, SPEC-07 I-75 to I-78). An earlier first-letter dial reading was corrected by the author and removed. 86 tests passing
- Stage 2: the Breadboard Space (`space/xr.html`): the four builds in 3D with WebXR, the Fano reading in 2D, the walkthrough track, picture-in-picture for both; the geometry as renderer-free data (`space/src/breadboard.geometry.ts`, A-Frame writer); XOR's truth table is the circle line 3-5-6. Two pages now build (`vite.config.ts`). 89 tests passing
- Took in the author's UI brain dump as [[SRC-11 The UI Brain Dump]]: what is already built, each claim marked (the knot is XOR, THEOREM; monad laws, Turing-completeness, "no collisions", sub-cycle XOR and thread-safe PannerNode FAIL as stated; conformance levels superseded), and three UI pieces to take next. 91 tests passing
- Ran every `omi-files` project's own tests (2026-10-11): omi-canvas, omi-lisp, omnicron, tetragrammatron (167/167) and polytron (`verify`) pass; atomic-kernel passes 47/47 and its v1 suite runs without end by design; omi-isa passes outside the tree but not in place (the root `"type": "module"`); omi-tetragrammatron's portal needs its `npm install`. No project repo was changed. [[USE-00 Use Case Scenarios]]; SPEC-07 I-79 (the sequence is the kernel's tick, not UTC)
- SPEC-07 I-80 (author): swap32 is the boolean of index 11 observed through 9 ⊕ 10 (9 ⊕ 10 = 3; 11 ⊕ 3 = 8, one bit; swap32 reverses the quad 8–11); tested. 92 tests passing
- `types/` and `proofs/` now track the code: `OMI.Fano` (Haskell gates) and `proofs/tracking/BoxedPineInvariants.v` (Coq, 7 theorems by computation, outside the 70-module registry). The proof Blob (I-81): one 65,536-bit index in `proofs/blob/` as a file, the literals 0x/0b/0o/0d, base32 and a base32 tagged template literal; every form XORs to 0n and 0u, checked in Node and Java. [[OPEN-01 Open Questions]] #23 records the meta-mask catalogue. 94 tests passing
- Frames of reference and ports (SPEC-07 I-82 to I-85): the media frame derived from the Media Queries 5 draft (24 features, 35 bits); the kernel tick is the same in every time zone while wall-clock offsets differ; raw pool contamination is 0 in Node and total in a native pool; the trace as a 16-cue WebVTT cache; a loopback server binding each request's media frame to one of the 16 Fano drawings (plus the 2 Hasse diagrams), whose reading returns the constant. The Breadboard Space shows the browser's own frame. 99 tests passing
- The departure is HTTP 218 (author): the port server is a try/catch/finally circulator, 200 / 400 / 218 This is fine ([[SPEC-06 The Circulator]], SPEC-07 I-86). 99 tests passing
- Status codes as an agent's lifecycle (author): the port server offers every port (300, agent-driven negotiation), sends a declared frame to its port (303), serves it (200), answers 304 when the agent already holds the constant, catches a raise (400), departs with 218. SPEC-07 I-87. 99 tests passing
- Pure bit-shift meta-cycles (`core/src/verified/cycle.ts`): a one-hot ring of 16 and the swap32 crystal, 32 ticks, the same from animation frames and the kernel; the Breadboard Space ticks it by animation frames. 307 and 308 move agents in the port server. The author's bell explained: 60 ⊕ 59 = 7 (BEL); the proof Blob holds 32, so `proofs/blob/README.md` says to use `xxd`. SPEC-07 I-88, I-89. 101 tests passing
- The colour gate (author: the colour spectrum instead of the bell, for gating kernel space): ANSI colours 30 + n are the Fano points, complements XOR to white; `repl/src/ansi.ts` draws indices in colour and never lets a control byte through. SPEC-07 I-90. 103 tests passing
- The base atoms in 60 ⊕ 0…63 (I-91) and every prefix as a colour code (I-92, `rosetta/src/colour.code.ts`): 0x black, 0b green, 0o white, 0d blue; ESC[ folds to black. 105 tests passing
- Meta-generation and meta-compilation (SPEC-07 I-93): each constant generated into SVG, CSS on its ETag, a WebVTT cue and PannerNode corners, and compiled back; `space/meta.html` runs it across canvas, video, text track, panner, CSS and IntersectionObserver, checked headless. 106 tests passing
- A sandboxed eMMC over NBD in a QEMU virt machine, all user space (SPEC-07 I-94; SD standing in for eMMC on QEMU 8.2); 206 Partial Content as the address of an index, with 416 outside the Blob (I-95). 107 tests passing
- Status codes on the try/catch/finally plane (author): by their low three bits the 2xx codes are try, catch, throw, finally, Reflect, Proxy (206), full path, and 218 indexes the catch; the port server stamps every response with `Omi-Atom`. SPEC-07 I-96; OPEN-01 #19. 108 tests passing
- The status codes as a ubiquitous catalogue (SPEC-07 I-97, `rosetta/src/http.catalog.ts`), seeded from Node's own list; HTTP/1.1 as the index 11. 109 tests passing
- WordNet geometry (author): `omi-files/polytron/polyform/wordnet-to-geometry.c` fixed (eight bugs, committed in polytron) and run over all of WordNet: each synset is a nibble, part-of-speech base plus hypernym depth; "propagation" is the 24-cell. SPEC-07 I-98
- Took in the continuation brain dump as [[SRC-12 The Continuation Brain Dump]]. SPEC-07 I-99: 1.1.1.1, 8.8.8.8 and 9.9.9.9 are an XOR line, and `repl/src/ping.ts` measures one. From the TOSHIBA Quad9 answers TCP 53, 853 and ICMP but not 443, on both wifi interfaces, while the phone reached it, so a wall is a reading of the frame and the port. I-100: 404.N expects 404 ⊕ N (the 60 cancels), all within 384–415. [[OPEN-01 Open Questions]] #24 (propagation made falsifiable by cross-frame checks) and #25 (the 300 block; the parabolic reading failed as tried). 111 tests passing
- An ESP32 (ELEGOO ESP-WROOM-32, Xtensa LX6) as a second architecture: the probe firmware `breadboard/esp32` (ESP-IDF 6.0.1, no Wi-Fi) and the host reader `repl/src/serial.ts`; orbit, period, constants, convergence, Blob fold and meta-cycle deviate by 0 from x86_64; the board's own tick is 11.48 ms per 65,536 steps. The board's factory flash is kept, git-ignored, in `breadboard/esp32/backup/`. SPEC-07 I-101. 113 tests passing
- The ESP32 as the parity organ (author): `breadboard/esp32` now only checks the 3-bit parity of 60 ⊕ 0…128 (each octet reads 0x69, the Thue–Morse byte complemented by the flip 4), registers only, reporting any deviation; the host reads it through `repl/src/serial.ts`. SPEC-07 I-102. 114 tests passing
- The organ's two modes (author): it reflects its parity state every 256 cycles, and answers request lines by content negotiation (300, 200, 304, 307 to the dual, 206, 416, 400), always departing with 218; `rosetta/src/organ.ts` makes the same answers in any frame. The Breadboard Space connects to it over Web Serial and, under hand tracking, places it at the left wrist's XRJointSpace. Reading glitch fixed on the host: duplicated USB packets just after the port opens. SPEC-07 I-103. 116 tests passing
- The organ's reflect rule (author: "if modulus % 4 = 0 when the modulus 2 is 0, or when the modulus of 2 and the modulus of 4 are not 0"): it reflects on tick n unless n & 3 = 2, and the live board's gaps were exactly those ticks. SPEC-07 I-103. 118 tests passing
- SPEC-07 I-104 (author, from a podcast on the protocol): the regular 210 ladder starts at residue 97, index 21 of the 48 units mod 210, just after index 20; the ladder as written holds only at rung 0; {5, 11, 17, 23, 29} is the only sexy-prime quintuplet, because it contains 5
- [[SRC-13 Provenance of the OMI Trees and the Metaverse Spine]]: the omi trees' lineage, the origin of omi-system.omilisp (Codex, commit a456cd6, 2026-05-09), and the ~/devops spine restored to a full local closure pass (final digest ef47d9e0…)
- SPEC-07 I-105: four XOR gates make the 7 non-zero XOR combinations of three inputs, but XOR gates alone reach only the 16 affine functions; the four breadboard builds light on XOR yet are made of NAND or NOR, and their nodes together reach all 16 two-input gates
- SPEC-07 I-106: the organ firmware answers single gates and whole builds; a proxy (`repl/src/gates.ts`) spreads gate networks over boards and mock nodes. On two live ESP32 boards: XOR gates reach 8 of 16 two-input functions, the builds' inside gates 16 of 16, and the 4-XOR network the 7 combinations. 124 tests (5 skipped without hardware)
- SPEC-07 I-107 (author): the zipper fold. Every organ answer carries `fold <bits> <place> <length>` over its bytes zipped into pairs: bits XORs the pairs (movement), place zips them through K (position). On three boards, 2,400 requests: 12 damaged answers caught and re-asked, none accepted wrong. Two live tests fixed (a backtracking stop pattern; the fold over the board's timing lines). The Web MIDI bridge passes live. 125 of 125 tests live on three boards
- SPEC-07 I-181 (author, 2026-10-12): "the system is the entropy, or the analog on the electrical reading"; "1 is not 1 and 0 is not 0 there". The organ answers `GET /analog/<c>` with 64 raw ADC readings; `rosetta/src/analog.ts` reads them as logic, values and spectrum. Firmware builds; not yet measured (no board connected). Proofs catalogue: I-178 (the frame held by position, all change outside it) and I-180 (x86's virtual 4 GB, its tables 8 MB, under a 64 MB cap), 70 records
- SPEC-07 I-190 (author, 2026-10-13): the proof tree on the eMMC. The catalogue's 78 checks written after the I-94 image's Blob, indexed by SHA-256 under a root hash; the scrub names damaged records, restore writes them back over NBD, a QMP reset is the signal at n, and at n + 1 the root returns and every record replays. The GED measured on microvm: read-to-clear, survives a reset, power-down only on this QEMU. Proofs catalogue to I-189 (78 records) and the svg tier (the Fano icons, their Hasse diagrams, the margin codes)

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
