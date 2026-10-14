# Index

Field notes on the OMI-IMO project, written from the adjunct's point of view.
Read in order. Each file is short and self-contained.

## How to read this folder

This folder is scratch — it is *not* served, *not* canonical, and `AGENTS.md` in
the repo root is the authoritative operating manual. These docs are the adjunct's
attempt to say, plainly, what the protocol is and how the pieces fit.
Rearrange/delete freely.

## Contents

| File | What it is |
|------|------------|
| [Index.md](Index.md) | This map. |
| [Glossary.md](Glossary.md) | One-line definitions of every term used in these notes. |
| [00-prologue.md](00-prologue.md) | The one-sentence thesis, the framing, and what "OMO/IMO" means. |
| [01-invariants.md](01-invariants.md) | The 13 canonical masks, parity extraction, the four C0 scope separators, the 0x0000 fold. |
| [02-primitives.md](02-primitives.md) | bind / apply / eval / digest, BIND/PORT/FOLD/UNFOLD, the single Atomics compareExchange. |
| [03-reduction.md](03-reduction.md) | The reduction: XOR truth, 5T/6T/8T/10T realizations, the BQF, cyclic numbers, the delta rolling law, 3! = 6. |
| [04-place-value-atomic.md](04-place-value-atomic.md) | Positional vs sign-value computing; the `0p`/`0n` atoms; the 72-seat alphabet (20+52). |
| [05-layout.md](05-layout.md) | The physical layout: shared/, server/, client/, test/, hardware/, wiki/, docs/ and what each holds. |
| [06-walkthrough-and-agent-world.md](06-walkthrough-and-agent-world.md) | The data-driven wiki (4 faces + prologue/epilogue) and the /agent/world live lattice. |
| [07-open-threads.md](07-open-threads.md) | Things observed but deliberately left unfixed — the honest residual list. |
| [08-ascii-hamming.md](08-ascii-hamming.md) | "ASCII was made to do this" — the Hamming-distance reading of the table; the Fano pinch point. |
| [09-algorithmic-core.md](09-algorithmic-core.md) | The reduction: one pure-function module (`shared/algorithmic-core.js`) — coordinate, fold, XOR-for-indices, 2!-encapsulation-of-3!, and resolve. |
| [10-bqf-foundation.md](10-bqf-foundation.md) | **Ground truth.** `Q(x,y) = 60x² + 16xy + 4y²` — high shell, chiral bridge, local seed; the delta law and the ChiralPhase. Transcribed from the Coq in `/home/main/omi/omi-axioms`. |
| [11-path-protocol.md](11-path-protocol.md) | `shared/path-protocol.js` — **the two tiers: value disagreements are readings, malformed references refuse.** `CoordinateError` with a structured coordinate, imported from `space.js` so there is one exception type in the protocol. No `null`, no magic `-1`. |
| [12-space-binding.md](12-space-binding.md) | `shared/space.js` — the address space, one file, 20 slots, three sections, equation in the middle: binding `0,2,1`, application `3,5,7,9` vs `4,6,8`, evaluation `17,19` with `/pin/`=18 between them. **Two tiers:** improper structure throws a `CoordinateError` carrying a structured coordinate; well-formed data that merely differs is measured, never refused. |
| [13-two-peers-no-server.md](13-two-peers-no-server.md) | `shared/peers.js` + `shared/declare.js` + `/portal` — **three peers, no server, no clock, no merge function.** With two you learn the magnitude; with three, the fold *is* the outlier's value, so one XOR names the dissenter — no vote, no quorum. Refuses when there is no majority. Explicitly *not* a vector clock. |

## The four faces (the load-bearing table)

| Face | Mask | Name | Role | Transistor XOR |
|------|------|------|------|----------------|
| BOOT0 | 0x1C | File Separator | bind | 5T |
| BOOT1 | 0x1D | Group Separator | apply | 6T |
| SECURE | 0x1E | Record Separator | eval | 8T |
| USER | 0x1F | Unit Separator | digest | 10T |

The four masks XOR to 0x0000. That is the closure the whole thing hangs on.