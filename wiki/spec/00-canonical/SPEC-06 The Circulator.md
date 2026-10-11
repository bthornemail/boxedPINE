---
id: SPEC-06
title: "The Circulator"
kind: spec
layer: canonical
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-05 The Axiom of Propagation]]"
down: []
related:
  - "[[SPEC-04 First Principles]]"
  - "[[SPEC-07 The Fundamental Invariants]]"
  - "[[SPEC-24 Observers]]"
  - "[[OPEN-01 Open Questions]]"
sources:
  - "[[SRC-10 The Ontology Conversation]]"
code:
  - "core/src/verified/circulator.ts"
  - "src/testbed/core.test.ts"
  - "types/src/OMI/Try.hs"
dimensions: []
symbols: []
tags: [omi-imo, canonical, circulator, boundary, decision, delta, exit]
---

# The Circulator

From [[SRC-10 The Ontology Conversation]] (lines 8646–9048): the type the Axiom of Propagation is about. A circulator is not a being; it is the smallest structure a being needs in order to take part in propagation: a **decision-bearing boundary**.

## The Type

```
Circulator<Relation> := {
  decide  : Relation → Decision
  handler : Raised → Decision          (optional)
  depart  : () → void                  (mandatory)
}
Decision := terminate | forward | modify-and-forward{ delta } | exit
```

Implemented in `core/src/verified/circulator.ts` (`circulate`). Relations there are indices, and a delta applies by XOR.

## The Five States

A circulator receiving a relation ends in exactly one of these:

| State | How | Meaning | A choice? |
|-------|-----|---------|-----------|
| **raise** | `decide` failed and no handler took it | not resolvable here; unwinds outward | no |
| **terminate** | decided `terminate` | local resolution; nothing forwarded | yes |
| **forward** | decided `forward` | carried on, zero delta | yes |
| **modify-and-forward** | decided `modify-and-forward{delta}` | carried on, with an attributable delta | yes |
| **exit** (author's fifth state) | decided `exit` | steps out: neither resolved, forwarded nor raised; the relation is left where it is | "a choice that isn't a choice" |

A **handler** turns a raise into a decision. Without one, a raise is only a raise.

## Accountability

The circulator is accountable for **its decision** (the path) and **its delta** (the modification), and for nothing else. Not the relation it received, not a raise, not the departure, not returns not yet observed. Exit is accountable only for having exited.

## The Four Conservation Laws

| Law | Statement | Tested |
|-----|-----------|--------|
| **Relation** | a received relation is forwarded (unchanged or modified) or terminated; never silently lost | forward carries it unchanged; modify-and-forward carries `relation ⊕ delta` |
| **Decision** | exactly one decision per relation; a raise is the absence of one | each run ends in exactly one state |
| **Accountability** | every decision and delta belongs to one circulator | the delta is recoverable: `carried ⊕ received = delta` |
| **Departure** | every scope departs exactly once | the departure counter is 1 in all five states |

The tests are in `src/testbed/core.test.ts`.

## Exit: the Ghost

The author: an exit "will continue to raise on a tree that fell in the woods with no sound, so it's the propagation of hallucinations or ghost … accounted for in the XOR but no longer in the XNOR".

**THEOREM** (tested): an absent reading contributes nothing to the difference reading, `x ⊕ 0 = x`. To the sameness reading at a fixed width, though, it contributes the full complement: `XNOR(x, 0) = ~x`, for example `XNOR(0x3C, 0) = 0xC3` at 8 bits. So the exit is invisible to difference and maximal to sameness: the two readings disagree most about it. The conversation's table wrote the XOR side as "0"; precisely, it is the *contribution* that is 0, and the reading itself stays `x`.

## Relation to `types`

`OMI.Try` in `types` is a smaller circulator. Its `Attempt` is either `Tried` (forward) or `Caught` (a raise turned into a value, carrying its repair), and `finally` is its departure. It does not yet have terminate, modify-and-forward or exit.

## Over HTTP: the Departure Is 218

The author, 2026-10-11: "the finally of the try..catch..finally is the 218 http code", and the codes "power the autonomous agents lifecycle and are the indices for agent driven content negotiation". The Fano port server (`repl/src/ports.ts`) answers each request as a circulator:

| State | HTTP | In the server |
|-------|------|---------------|
| arrival, no frame yet | **300 Multiple Choices** | agent-driven negotiation: all 16 ports and the 2 Hasse diagrams, as a `text/uri-list` and `Link` headers; the agent chooses |
| a frame declared (POST) | **303 See Other** | `Location: /port/i`, the port the frame converges to |
| forward | **200** | a decided request: the port's drawing (with `ETag: "i"`), the trace |
| moved for a reading | **307 Temporary Redirect** | `/dual/i` → `/port/(i ⊕ 15)`, the dual constant (SPEC-07 I-67) |
| moved for good | **308 Permanent Redirect** | a port past 15 → its nibble, `/port/(n & 15)` |
| already held | **304 Not Modified** | `If-None-Match` names the same constant: the deviation is 0, nothing is resent |
| raise, taken by the handler | **400** | a frame that does not parse is caught |
| exit, then the departure | **218 This is fine** | nothing was decided; `finally` always runs and lets the request pass, its path as the body |

218 is **not a standard code**: it is informal, and its attribution to Apache is unsourced and circular. It is still safe, because an HTTP client must treat an unrecognised status as the first code of its class, so every client reads 218 as a 2xx success (`fetch` reports `ok`). ⟦Candidates, not built: 203 for modify-and-forward (a transforming proxy's modified response) and 204 for terminate (resolved, nothing returned).⟧

## The Inscription

> A circulator is a decision-bearing boundary. Its states are raise, terminate, forward, modify-and-forward, and exit. Its decision is the path. Its delta is the modification. Its departure is unconditional. Its accountability is for the decision and the delta, and for nothing else. Its returns are the consequences it observes.
