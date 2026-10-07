# rosetta — the regexes and declarations

This folder is the **grammar**: the named patterns that say which strings are valid positions and what kind of thing each one is. In a homoiconic protocol the same grammar checks data and programs, so this is the part that turns into "syntax".

Status, level by level: [wiki/progress/PROG-00 Homoiconic Syntax Tracker.md](../wiki/progress/PROG-00%20Homoiconic%20Syntax%20Tracker.md) (Levels 1–5).

## What is here

| Path | What it is | State |
|------|------------|-------|
| `src/grammar/grammar.ts` | One table of every pattern: the reference space (Level 1), the wordforms (Level 2) and all 29 symbols of G (Level 3), each with its source | ✅ tested |
| `src/grammar/kernel.ts` | The self-generating kernel: a Proxy that admits or refuses every read and write by the grammar; `learn`, `describe`, `regenerate`. Ported from the Fano Fold conversation | ✅ tested (Level 4 stub) |
| `src/assets/commands.vtt` | The REPL commands (`src/define.commands.ts`) as WebVTT cues, one per command, for a TextTrack; a test keeps the two in step | ✅ tested |
| `src/assets/omi_rosetta_stone.yaml` | The Rosetta Stone: circuits, canvases and sourcemaps (the 5T/6T/8T/10T breadboards) | Reference |
| `src/assets/rosetta_stone.json`, `src/assets/codex.yaml` | The codex | Reference |
| `src/rfc/`, `src/omi-ii.ts`, `src/omicron.ts`, `src/bin.ts`, `src/mcp.ts`, `src/rosetta.ts` | Earlier code: the RFC app, type sketches, the SSE server, the stream bus | Placeholders |
| `index.html`, `canvas.html`, `examples.html` | Earlier pages | Placeholders |

## Use case scenarios

Prior work that informs this folder (see [wiki/usecases/USE-00 Use Case Scenarios.md](../wiki/usecases/USE-00%20Use%20Case%20Scenarios.md)): OMI-Lisp declarations (`omi-lisp`), boundary-first segmentation (`omnicron`), the declaration-to-canvas pipeline (`omi-canvas`), the Omi-Ring witness (`omi-tetragrammatron`).

## How the grammar is split

- **Position rules** (Levels 1–2: `RADIX`, `LITERAL`, `HEX`, `EXCHANGE`, …) decide which strings are valid *positions*. The kernel uses these.
- **Symbols** (Level 3: `INCLUDE`, `FRONT`, `DEFLECT`, `PALINDROME`, …) classify *characters and tokens*.

They must stay apart. `INCLUDE` (`/^[A-Za-z0-9_]+$/`) admits every alphanumeric word, so checking positions against it would admit almost anything. A test shows this.

## ⟦Placeholders⟧ for the author

- ⟦`EXPONENT`: is it `3e5` (JavaScript) or `e5` (the corrected Haskell)?⟧
- ⟦`CLOSURE`: the transcript's pattern does not parse as one set. Is `/^[{}\[\]<>'",]$/` what you meant?⟧
- ⟦Do you agree with the position-rules / symbols split above?⟧
- ⟦**Level 4:** what does each part of an `EXCHANGE` wordform mean? In `0p3x40n`: `p` …, `3` …, `x` …, `4` …, `n` … How do you write "read index 60; if 60 is expected, exchange it with the Exponent or Exception" as one wordform?⟧
- ⟦`regenerate`: should a description restore stored values too, or only the grammar?⟧
