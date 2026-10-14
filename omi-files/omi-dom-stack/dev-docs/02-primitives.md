# 02 — The primitives: bind/apply/eval/digest and BIND/PORT/FOLD/UNFOLD

There are exactly four pure functions in the protocol, and exactly one
"imperative" primitive (the exchange). Nothing mutates; everything else is a
swap.

## The four pure phases — meaning & transistor form

| # | Phase  | Transistor XOR | Represents          |
|---|--------|----------------|---------------------|
| 1 | **bind**    | 5T  | mating a key to a value; the pair is now one |
| 2 | **apply**   | 6T  | exchanging the running state through a mask  |
| 3 | **eval**    | 8T  | checking whether a binding holds             |
| 4 | **digest**  | 10T | folding the whole stream to one word         |

These are formalized in `ascii-table.js`'s six-core test suite:
1. bind symmetry
2. apply compareExchange semantics
3. eval extraction
4. digest F-mean + XOR fold
5. iff (XOR ⊕ 1)
6. XOR ruler identity/involution

## The four field-ops — the "ports" language

`omics` from `omi.js`/`omi-ii`/shared, a state machine over three fields
(INTEGER, IP_ADDRESS, CIDR):

| Op     | Transition                  | Inverse |
|--------|-----------------------------|---------|
| BIND   | state = integer ^ mask[cidr]      | unfold |
| PORT   | state = state ^ ipAddress         | port   |
| FOLD   | state = state ^ mask[cidr]        | unfold |
| UNFOLD | state = state ^ mask[cidr]  (same as FOLD; XOR is its own inverse) | — |

They run over a pipe of steps and produce a trace of states (`executePipe`),
used for the port resolver and the reverse proxy (`/proxy/{port}?cidr&ip`).

## The one imperative primitive

```js
Atomics.compareExchange(sharedBuffer, index, expected, replacement)
```

Atomic compare-and-exchange is the *only* operation allowed to touch shared
memory. It is literally a swap: it exchanges, atomically, and returns the old
word. Everything else must be pure functions.

**Caution (open thread):** a pasted "canonical" snippet put `compareExchange`
on `metricSharedBuffer` but returned a `wordView` over a *different* local
buffer — the primitive was dead. The reference must compare-exchange the SAME
buffer it reports. See [07-open-threads.md](07-open-threads.md).

## The delta rolling law

```js
applyDeltaLaw(y, const = 0x1D1D) = rotl16(y,1) ^ rotl16(y,3) ^ rotr16(y,2) ^ const
```

This is the epoch stepper: `a ^ b` then `a ^ b` → nothing lost, delta rolls
forward with period 8 under repeated application (verified). It is what makes
`/events` rungs reproducible from (seed, epoch).

## The pipeline

`pattern-pipeline.js` is the main entry: a `q`/`text` goes in, tokens →
rungs → 13 masks → final fold. If the pipeline is honest the JSON reports
`ok:true` and the fold behaves.

## Where the "one closure/combinator" phrase comes from

`bind`, `apply`, `eval` are pure; the only *closure* the system needs is one
combinator — `compareExchange` — to run a REPL over a singly-linked list styled
after LISP, where **bind replaces cons** (`bind key value` with key ^ value = 0
is the symmetric pair). Every pair is a symmetric 2-tuple; XOR of the two
halves of the pair is 0 by construction.

Read on → [03-reduction.md](03-reduction.md).