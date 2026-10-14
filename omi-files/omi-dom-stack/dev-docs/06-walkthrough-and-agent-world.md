# 06 — The walkthrough wiki and /agent/world

## The wiki: data-driven, compilable, single source of truth

`wiki/chapters/*.json` are the chapter sources. Chapters form a contiguous
sequence: **prologue → 4 circuit chapters (one per face) → epilogue**.

| Chapter | Face  | Mask | Name fixture | Transistors |
|---------|-------|------|--------------|-------------|
| prologue | —   | —    | the boot      | —           |
| cn-01-bind    | BOOT0  (0x1C) | bind    | 5T  |
| cn-02-apply   | BOOT1  (0x1D) | apply   | 6T  |
| cn-03-eval    | SECURE (0x1E) | eval    | 8T  |
| cn-04-digest  | USER   (0x1F) | digest  | 10T |
| epilogue | —   | —    | the fold      | —           |

The wiki compiler (`node wiki/meta-compile.js`) validates — and exits 1 if
invalid:
- canvas edge references ↔ sourcemap ids
- probe ids and cue timings
- build-step placements
- XOR/XNOR verification rows
- contiguous chapter order
- completeness of the four faces
- centroid gate: `BOOT0 ^ BOOT1 ^ SECURE ^ USER === 0x0000`

Emitter flags: `--write` (content-stable sha256 digest),
`--list`. Output JSON goes to `out/omi-imo-wiki-bundle.json`, embedded in
`/api/bundle` under `wiki` and served at `/wiki` (player: `wiki.html` +
`wiki.js`).

Chapter shape:
```
{id, n, name, role, face, led, mask, circuit, story[], principles[], build[],
 canvas{nodes[],edges[]}, sourcemap[], netlist[], cues[], probes{}, verification[]}
```

## /agent/world — the live lattice

`agent/world.html` + `agent/world.js` (served at `/agent/world`, also in
`/api/bundle`):

- Four **agent rods** on the same Steiner-triple cone lattice as `/universe`:
  - BOOT0  bind   5T  #5c8cff
  - BOOT1  apply  6T  #ffd166
  - SECURE eval   8T  #9fd356
  - USER   digest 10T #ff5c8a
- **Epoch-driven, no internal clock**: it subscribes to `/events` (SSE) for
  substrate ticks and only repaints on rAF; a rod is a "port" the outside
  observer can probe.
- Clicking a rod issues one POST to `/api/cues`; the lottery decides
  allocatable / delta; the world grows by one delta.
- The fold stays 0x0000 (z = x ^ y per Steiner edge) — visual proof the
  pipeline is closed.
- HUD: epoch, day, vertices, fold hex, observer.
- `window.OMIWorld` exposed for driving from the console.

The /api/cues POST path returns `{cue id, epoch, lottery}`; with point 6 of a
given Fano line unwired it correctly reports `allocatable: false` — honest
Fano behavior rather than a forced win.

## What a chapter's number means

They are numbered by *creation order* of the underlying "Untitled N.md" notes,
not by content order. (Known duplicate content pairs found in the archive:
15=17, 41=42, 44=45, 46=47, 49=50, 51=52-v1 — the notes are the user's scratch,
the wiki JSON is the canonical source.)

Read on → [07-open-threads.md](07-open-threads.md).