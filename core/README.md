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
| `src/broadcast.ts` | The headless proxy presenter: `launchBroadcast(declared: RegExp, defined: string)` returns `proxy()` (one step forward), `reflect()` (one step back) and `extant()`, each a compare-exchange on the iExtant | Author's core example |
| `src/model.ts` | `Node` (bind / apply / eval / pin) and `Domain` (declarations, expressions, values, variables): the Node is where iExtant meets the user, inside a Domain | Author's core example |
| `src/animation.frame.ts` | Frequency spectra, like an `OscillatorNode` in the DOM; the sexagesimal XOR loop | Author's core example |
| `src/scene.ts` | three.js scene with a tetrahedron; it belongs to `space/` (see `space/README.md`) | Author's example for `space/` |
| `src/index.ts` | The type system and the old frozen G | Example; the live grammar is `rosetta/src/grammar/` |
| `src/ffi.ts`, `src/tree-sitter.ts` | Experiments | Placeholders |
| `assets/` | Canonical statement YAML, a WebVTT track, the ASCII table, a JSON Canvas | Reference material |

## Use case scenarios

Prior work that informs this folder (see [wiki/usecases/USE-00 Use Case Scenarios.md](../wiki/usecases/USE-00%20Use%20Case%20Scenarios.md)): proving laws (now the root folder `proofs/`), the pure types (now `types/`), the Haskell reference (`omi`), the fixed-width ISA (`omi-isa`), deterministic replay (`atomic-kernel`), bare metal (`polytron`, `omi-bios`).

## Rules for this folder

1. **Only verified things go in `src/verified/`.** If it has not been checked, it belongs in the wiki's open questions, not here.
2. **Every module names its evidence** in its opening comment (a wiki note, a proof file or a transcript line range).
3. **Every module has a test** in `src/testbed/` (in the repository's `src` folder).
4. **Indices, not values.** Positions combine by XOR, walk, compare and complement, never `+` or `×` (wiki: OPEN-03 Glossary, *index*).
5. **Old code moves to `_archive/`**; it is not deleted.

`src/broadcast.ts`, `src/model.ts`, `src/animation.frame.ts` and `src/index.ts` are byte-for-byte the same as the copies in `_archive/`; these are the working copies.

The REPL is development tooling, so it lives in the repository's `src/`: `src/server.ts` (the headless REPL over HTTP) and `src/define.commands.ts` (its commands). The commands' cues are in `rosetta/src/assets/commands.vtt`.

## ⟦Placeholders⟧ for the author

- ⟦`src/ffi.ts`, `src/tree-sitter.ts`: still the direction, or retire to `_archive/`?⟧
