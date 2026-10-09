---
id: SPEC-04
title: "First Principles"
kind: spec
layer: canonical
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-00 Canonical Statement]]"
down:
  - "[[SPEC-05 The Axiom of Propagation]]"
related:
  - "[[SPEC-01 The Three Laws]]"
  - "[[SPEC-07 The Fundamental Invariants]]"
  - "[[SPEC-08 The Derivation Path]]"
  - "[[SPEC-10 The Primitive]]"
sources:
  - "[[SRC-10 The Ontology Conversation]]"
code:
  - "core/src/verified/exchange.ts"
  - "core/src/verified/swap.ts"
dimensions: []
symbols: []
tags: [omi-imo, canonical, first-principles, minimum, prompt, buffer, exchange]
---

# First Principles: The Prompt, the Buffer, the Exchange

From [[SRC-10 The Ontology Conversation]] (lines 10925–11098). This is the room; everything else in the vault is a door into it.

## The Problem

Every language, framework and platform has its own rules. So: find the minimum that has no language, no framework, no platform, no convention. Build there, and anyone can read it the same way.

## The Minimum: Five Things

| # | Thing | What it is | In code |
|---|-------|-----------|---------|
| 1 | **Buffer** | contiguous memory; every byte is a *position*, not a value. A medium, not a container | `SharedArrayBuffer` |
| 2 | **Index** | a position in the buffer: a location, never a magnitude | a slot number |
| 3 | **Prompt** | "buffer, at this index, respond": a request, not an instruction | the call |
| 4 | **Exchange** | compare · conditionally write · return what was there | `Atomics.compareExchange`; `core/src/verified/exchange.ts` |
| 5 | **Three swaps** | three permutations, each a copy, never a mutation: `swap16` j→j⊕1, `swap32` j→j⊕3, `swap64` j→j⊕7 | `core/src/verified/swap.ts` |

Plus:
- **one alphabet**, `/A-Z0-9/`: 36 characters, base36;
- **one control structure**, `try { find } catch (fail) { }`.

## The Response

The buffer answers, not the user:
- **closed:** what was expected is there;
- **open:** it isn't, and the difference is the reading.

XOR gives the difference; XNOR gives the sameness. They are related but not interchangeable: at a fixed width, XNOR = all-ones ⊕ XOR, and the Hamming distance counts the differing bits ([[SPEC-07 The Fundamental Invariants]], I-5).

## What the Protocol Does and Does Not Do

| Does | Does not |
|------|----------|
| provide the prompt (buffer, index → response) | compute |
| provide the three swaps | interpret |
| provide try/catch for the fail search | assign meaning |
| provide the alphabet | name, judge, or own |

## The One Law

> The prompt prompts. The buffer responds. The response is the encoding. The next prompt is the decoding. And the whole thing is one loop, over a buffer, with three swaps and a try/catch.

## What the Rest Is

Everything else (the Fano plane, the tetrahedron, the treemaps, the byte-ring, the theology, the geometry, the origami, the circulator, the axiom) is **pedagogy**: "doors, not the room". The reading order through the doors is [[SPEC-08 The Derivation Path]].

## Qualifications Kept from the Conversation

The author pasted in a critique, and these points from it stand:
- **The prompt is the interface; the exchange is the operation.** They are separate.
- **try/catch is not the same in every language,** and base36 does not by itself guarantee identical interpretation everywhere. Portability comes from a precise abstract specification plus **conformance tests**. The tests in `src/testbed/` are this project's start on that.
- **The swaps need a compatible length.** They are permutations only when the buffer length is a multiple of 8.
