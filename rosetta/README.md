# rosetta — the regexes and declarations

This folder is the **grammar**: the named patterns that say which strings are valid positions and what kind of thing each one is. In a homoiconic protocol the same grammar checks data and programs, so this is the part that turns into "syntax".

Status, level by level: [wiki/progress/PROG-00 Homoiconic Syntax Tracker.md](../wiki/progress/PROG-00%20Homoiconic%20Syntax%20Tracker.md) (Levels 1–5).

## What is here

| Path | What it is | State |
|------|------------|-------|
| `src/grammar/grammar.ts` | One table of every pattern: the reference space (Level 1), the wordforms (Level 2) and all 29 symbols of G (Level 3), each with its source | ✅ tested |
| `src/grammar/kernel.ts` | The self-generating kernel: a Proxy that admits or refuses every read and write by the grammar; `learn`, `describe`, `regenerate`. Ported from the Fano Fold conversation | ✅ tested (Level 4 stub) |
| `src/assets/commands.vtt` | The REPL commands (`repl/src/define.commands.ts`) as WebVTT cues, one per command, for a TextTrack; a test keeps the two in step | ✅ tested |
| `src/assets/omi_rosetta_stone.yaml` | The Rosetta Stone: circuits, canvases and sourcemaps (the 5T/6T/8T/10T breadboards) | Reference |
| `src/assets/rosetta_stone.json`, `src/assets/codex.yaml` | The codex | Reference |
| `src/agent.ts` | The agent channel's messages, the 16-index, tag routing (`tagRoute`) and the port as the 4-bit parity (`portFor`) | ✅ tested |
| `src/tag-type.ts` | The tag functor: lower to upper promotes a subject to an object, upper to lower deprecates; at type level `ToTag<S>`, `Deprecate<S>` | ✅ tested (tsc checks the types) |
| `src/canvasl.ts` | Markdown as a CanvasL document tree (after `types` OMI.Markdown), and a folder's lattice of shared tags | ✅ tested |
| `src/trace.vtt.ts` | A trace as a text track with a cache limit: one WebVTT cue per tick, the last 16 kept; `propagate` appends, `backpropagate` reads the readings back (SPEC-07 I-84); served by the port server at `/trace.vtt` | ✅ tested |
| `src/walkthrough.ts`, `src/assets/walkthrough.vtt` | SPEC-08's derivation path as a text track, one cue per step with its note, status and Coq proof; regenerate with `node rosetta/src/walkthrough.ts` | ✅ tested (the track is up to date) |
| `src/meta.generate.ts` | One Fano constant (0–15) generated into every medium (SVG, CSS by ETag, a WebVTT cue, PannerNode positions) and compiled back to the index | ✅ tested |
| `src/media.frame.ts` | A device's media frame as one index: the keyword features of Media Queries Level 5 packed into bits; a frame's Fano port | ✅ tested |
| `src/proof.blob.ts` | The 65,536-bit proof Blob, written in every radix and carrier, XOR to 0 as proof of equivalence | ✅ tested |
| `src/colour.code.ts` | Every prefix as a colour code: a byte's low three bits, a sequence's XOR-fold | ✅ tested |
| `src/http.catalog.ts`, `src/assets/http-status.json` | The HTTP/1.1 status codes as a catalogue for indexing requests, with 218 added | ✅ tested |
| `src/organ.ts`, `src/midi.ts`, `src/analog.ts` | The ESP32 parity organ's lines as declarations, as MIDI, and its analog readings (breadboard/esp32) | ✅ tested (repl) |
| `src/assets/track.vtt` | A sample WebVTT track with voices, used by `space/examples.html` | Reference |
| `src/rfc/`, `src/rfc.ts`, `src/omi-ii.ts`, `src/omicron.ts`, `src/bin.ts`, `src/mcp.ts`, `src/rosetta.ts` | Earlier code: the RFC app, type sketches, the SSE server, the stream bus | Placeholders |
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
