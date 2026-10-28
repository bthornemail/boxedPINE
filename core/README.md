# core — the core findings

This folder holds what is **known to be true** about the protocol: the parts that have been computed, run or proved. Everything else builds on it.

Status of the whole project, level by level: [wiki/progress/PROG-00 Homoiconic Syntax Tracker.md](../wiki/progress/PROG-00%20Homoiconic%20Syntax%20Tracker.md).

## What is here

| Path | What it is | State |
|------|------------|-------|
| `src/verified/` | The verified findings as small modules. Each file says what it shows and where the evidence is in the wiki. | ✅ tested (`npm test`) |
| `src/verified/exchange.ts` | Level 0: `compareExchange` and the difference it reports; the bind/apply/eval digest | ✅ |
| `src/verified/swap.ts` | The swaps as permutations, not mutations: byte `j` → `j ⊕ 1`, `j ⊕ 3`, `j ⊕ 7`; the swap delta | ✅ |
| `src/verified/delta.ts` | The earlier bit-level delta (period 8, proved in Coq) | ✅ |
| `src/verified/wordform.ts` | One wordform at many widths: 12, 60, 124, 252; the orbit of 60; the Blob as 128 × 64 bytes | ✅ |
| `src/verified/triples.ts` | The 7 / 35 / 155 / 651 distinguished triples as XOR triples | ✅ |
| `src/verified/block.ts` | The closure law `∂(b) = 0000` on the tetrahedron: 8 vertex-closed, 8 face-closed, 4 both | ✅ |
| `src/verified/circulator.ts` | The circulator: five states, departure exactly once, decision ≠ delta; `xnor` at a fixed width | ✅ |
| `src/verified/metron.ts` | The mêtron and `bind`; the prime quadruplets, sextuplets and the 210 ladder | ✅ |
| `src/verified/tree.ts` | The tree: sixteen 65,536-bit files addressed by one 20-bit index (file · byte · bit) | ✅ |
| `src/verified/period.ts` | The periods of 1/7 and 1/73 (6, 8), the two prime gaps (sum 6, product 8), and the lens 60 ⊕ 64 that keeps both periods | ✅ |
| `src/verified/fano.ts` | The sixteen Fano constants: the XOR-closed 7-bit masks, two-step convergence of any byte, duality at index i ⊕ 15, and a whole-number reader for the Fano files | ✅ |
| `src/verified/loopback.ts` | A MAC folded to a 127/8 loopback address; index 0 served by CUPS IPP at 127.0.0.1:631; NAT64 in 64:ff9b:1::/48 | ✅ |
| `src/verified/cycle.ts` | Pure bit-shift meta-cycles: a one-hot ring of 16 inside the swap32 crystal (60 ↔ 63), 32 ticks of shifts and XOR; the tick source differs, the cycle does not (SPEC-07 I-88) | ✅ |
| `src/verified/index.ts` | The verified findings in one place: every module above, re-exported | ✅ |
| `src/index.ts` | The type system and the old frozen G | Example; the live grammar is `rosetta/src/grammar/` |
| `src/prompt.treemap.ts`, `src/comments.json` | The author's treemap prompt, and the orbit blocks as comment lines | Author's |

## Use case scenarios

Prior work that informs this folder (see [wiki/usecases/USE-00 Use Case Scenarios.md](../wiki/usecases/USE-00%20Use%20Case%20Scenarios.md)): proving laws (now the root folder `proofs/`), the pure types (now `types/`), the Haskell reference (`omi`), the fixed-width ISA (`omi-isa`), deterministic replay (`atomic-kernel`), bare metal (`polytron`, `omi-bios`).

## Rules for this folder

1. **Only verified things go in `src/verified/`.** If it has not been checked, it belongs in the wiki's open questions, not here.
2. **Every module names its evidence** in its opening comment (a wiki note, a proof file or a transcript line range).
3. **Every module has a test** in `src/testbed/` (in the repository's `src` folder).
4. **Indices, not values.** Positions combine by XOR, walk, compare and complement, never `+` or `×` (wiki: OPEN-03 Glossary, *index*).
5. **Old code moves to `_archive/`**; it is not deleted.

Moved out of this folder: `broadcast.ts` to `repl/src/`, `scene.ts` to `space/src/`, and the assets (a WebVTT track, the canonical statement YAML, a JSON Canvas) to `rosetta/src/assets/`. `model.ts`, `animation.frame.ts`, `ffi.ts` and `tree-sitter.ts` went to the sibling `boxed/_archive/` (`ffi.ts` and `tree-sitter.ts` under `_deprecated/`), as rule 5 says.

The REPL is development tooling, so it lives in `repl/src/`: `server.ts` (the headless REPL over HTTP) and `define.commands.ts` (its commands). The commands' cues are in `rosetta/src/assets/commands.vtt`.

## ⟦Placeholders⟧ for the author

- ⟦`src/ffi.ts`, `src/tree-sitter.ts`: still the direction, or retire to `_archive/`?⟧
