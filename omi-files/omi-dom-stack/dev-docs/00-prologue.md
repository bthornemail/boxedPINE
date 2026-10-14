# 00 — Prologue: what this project is

> Everything is XOR. Nothing is destroyed. 0 is the only truth.

## One sentence

**OMI-IMO is not a protocol but a handful of *pure functions* over a 16-bit
coordinate — bind, apply, eval, digest, fold, xor, resolve — in which numbers
are not magnitudes but *positions*, every operation is a swap/exchange between
two datum, and the whole stream folds to 0x0000.** Once the coordinate, the
8-bit subarray fold, and the XOR-for-indices are defined, a 2!-encapsulation-
of-3! places any shared datum (local = 2!, world = 3!) — everything else
resolves algorithmically from the boundaries and constraints (see
[09-algorithmic-core.md](09-algorithmic-core.md)).

## The same thing, three ways

- **Inside** — "Iter Mater Ordo" (way, matter, order): the *way* a stream of
  *matter* (bytes) is *ordered* by passing through XOR-only gates.
- **Outside** — "Ordo Mundus Omicron" (order, world, glyn): the same reduction
  viewed from the observer who selects which two of the 3! are active.
- **Plain** — two computers, given a shared reference point (the masks), can
  re-derive each other's state from seed + epoch without a clock, a server, or a
  password. They agree by *position*, not by *value*.

## The philosophy (the part that matters most)

The project is a deliberate attempt to move computation **from the sign-value
model toward the place-value model**:

- In the sign-value model a datum *is* a number — it carries meaning, magnitude,
  and an interpretation baked in.
- In the place-value model a datum *sits in a position*. Its glyph occupies a
  place in the frame; the interpretation is left entirely to the *user*.
- Therefore the protocol should **never mutate**: no code may change a datum.
  Every operation is a *swap or exchange* — and XOR is exactly that: a run of
  `a ^ b` then `a ^ b` leaves both original datum intact (`a ^ b ^ b == a`).

This is why the only "stateful" primitive allowed in the reference is
`Atomics.compareExchange` (the operating system's own exchange), and why the
running fold of the entire stream aspires to 0x0000 — the proof that nothing
has been added or lost along the way.

## What is NOT this

- Not a numeric encoding scheme (base-36 rumors are wrong — see how `0p`/`0n`
  work in [04-place-value-atomic.md](04-place-value-atomic.md)).
- Not a sign/magnitude or float format.
- Not a blockchain or consensus ledger (agreement is one-shot witness/observe).
- Not polytope or WASM acceleration as the core (those exist only as optional
  references; the core is pure byte-XOR).

## The walkthrough in 13 rungs

The wiki (see [06-walkthrough-and-agent-world.md](06-walkthrough-and-agent-world.md))
walks the reader through exactly 13 rungs — one per canonical mask — in four
chapters, one per face, plus prologue and epilogue. A chapter's `story[]`,
`principles[]`, `build[]`, `canvas`, `sourcemap`, `netlist`, `cues`, `probes`,
and `verification` rows are all compilable data (see `wiki/meta-compile.js`).

Read on → [01-invariants.md](01-invariants.md).