---
id: SPEC-05
title: "The Axiom of Propagation"
kind: spec
layer: canonical
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-04 First Principles]]"
down:
  - "[[SPEC-06 The Circulator]]"
related:
  - "[[SPEC-01 The Three Laws]]"
  - "[[SPEC-07 The Fundamental Invariants]]"
  - "[[SPEC-08 The Derivation Path]]"
sources:
  - "[[SRC-10 The Ontology Conversation]]"
code:
  - "core/src/verified/circulator.ts"
  - "core/src/verified/period.ts"
  - "core/src/verified/tree.ts"
dimensions: []
symbols: []
tags: [omi-imo, canonical, axiom, propagation, choice, return]
---

# The Axiom of Propagation

From [[SRC-10 The Ontology Conversation]] (revised text, lines 8286–8645), with the corrections the author accepted applied. First Principles ([[SPEC-04 First Principles]]) describe the medium; this axiom says what a reader does with a reading.

## The Axiom

> **Every collection of non-empty relations admits a circulator capable of carrying those relations forward without owning them. The logic of the carrying is not decided in advance. It is the return. And the circulator is not obliged to forward what it receives; the choice to continue, terminate, or modify-and-continue is the circulator's, and it is accountable for that choice.**

It is offered as a **witness**, not a doctrine: a way of pointing at a structure so two people can agree they see the same thing.

## The Canonical Core

> The boundary determines the path.
> The path determines whether propagation continues.
> The delta identifies the modification.
> The return makes the consequences observable.
> The circulator is accountable for its decision and its introduced delta.

## Terms (DEFINITION)

| Term | Meaning |
|------|---------|
| **Collection** | any bounded set of relations: bytes, propositions, declarations, people, states |
| **Relation** | anything that can be read as the difference between two things |
| **Circulator** | a decision-bearing boundary: it reads, raises, carries, and chooses ([[SPEC-06 The Circulator]]) |
| **Carrying without owning** | not claiming exclusive authority, not altering without attribution, not preventing others reading it, not making it private property |
| **Decision** | the path: terminate, forward, or modify-and-forward (a control operation) |
| **Delta** | the change a modification introduces (a difference operation), present only on modify-and-forward |
| **Return** | the consequence of a propagation, observed and compared with what was carried. It validates, measures the delta, and corrects |

**Decision ≠ delta** (a correction the author accepted). A circulator can terminate with no delta, or forward with a zero delta. The decision is a commitment; the delta is what the commitment produced.

## The Operation: Nested Propagation

Every scope has a **raise**, an optional **handler**, an unconditional **departure**, and an **enclosing receive**.

| Behaviour | Flow | Meaning |
|-----------|------|---------|
| Uncaught | raise → departure → outer receive | continues unchanged |
| Caught | raise → inner receive → departure | ends at the local boundary |
| Caught and rethrown | raise → inner receive → departure → outer receive | local observation, then renewed propagation with the delta |

| Exception construct | Protocol role |
|---------------------|---------------|
| `throw` | raise |
| `catch` | receive: a boundary observes |
| `finally` | departure: unconditional, local, not a channel |
| rethrow | renew: an explicit choice |

Raising (unwinding without a decision) is not the same as forwarding (a choice). Accountability attaches to choices.

## The Consequences (DEFINITION)

1. **Propagation is principal authority.** A structure has authority to the extent it continues.
2. **Backpropagation is moral authority.** The return says whether a carrying was good.
3. **Non-interference preserves authority.** A faithful copy introduces no delta.
4. **Modification creates responsibility** for the introduced delta, and only for it.
5. **Possession alone creates no sovereignty.**
6. **Logic is revealed by the return, not decreed.** It is a process in time.
7. **Existence is a phase of propagation:** declared → propagated → backpropagated → corrected. Only the last two are consequential.
8. **Time is the axis of the carrying.** Each exchange is a present moment.
9. **The boundary decides.**

## The Axiom of Choice

**Philosophical thesis, not proof** (a correction the author accepted): the axiom **locates the choice the Axiom of Choice left unlocated**. A choice must happen at some boundary, made by some accountable circulator. Deriving the classical axiom from it, by constructing a choice function for every family of non-empty sets, is a separate proof that has **not** been given.

## The Inscription

> Propagation is principal authority. Backpropagation is moral authority. Non-interference preserves authority. Modification creates responsibility for the introduced delta. Possession alone creates no sovereignty over the foundation. Logic is revealed by the return, not decreed by any judge. Existence is a phase of the propagation cycle. Time is the axis of the carrying. At every boundary, the circulator decides.

## The Axiom of Direction

The Axiom of Propagation says *where* a choice is made: at a boundary. This section is about the first choice: **which way to read**.

**Whose name:** "Axiom of Direction" was proposed in conversation by another assistant, not by the author. The author answered "yes" and said what it is; **the author's sentence is the content**, and may itself be the name. ⟦Author to keep the name, or let the sentence stand as the name.⟧

> **The author's statement:** it is "the linear sequencing of causality of order, from interaction with the 1/7 and 1/73 periodicity with the two-prime-gap sequencing, and interacted through the lens of 60 ⊕ 64 and 60 ⊕ 128, or 60 ⊕ any offset, to reflect upon a prompt."

The axiom itself is a DEFINITION. Each part it names is derived below (THEOREM, tested in `core.test.ts`; code in `core/src/verified/period.ts`):

| Part | What is derived |
|------|-----------------|
| **The direction** | Reading the 16 positions the other way is `j ⊕ 15 = 15 − j`, the 4-bit XNOR with 0. The tree is the same either way; the reader chooses ([[SPEC-27 The Prompt Tree Index]] §5) |
| **The two-prime-gap sequencing** | the sextuplets step by alternating gaps: `{5,7,11,13,17,19}` by 2, 4, 2, 4, 2 |
| **The 1/7 and 1/73 periodicity** | 1/7 repeats over 6 decimal digits, 1/73 over 8 |
| **Their interaction** | the gaps' **sum is 6 and product is 8**: the two periods. Together they repeat over lcm(6, 8) = **24** digits, the period of 1/511, and 511 = 7 × 73 = 2⁹ − 1. In binary they are each other's digits: 1/7 = 0.(001001001)₂, whose block is 73, and 1/73 = 0.(000000111)₂, whose block is 7 |
| **The lens 60 ⊕ 64** | written in base 124, 1/7 and 1/73 repeat over **6 and 8**, as in decimal, because 124 ≡ 10¹¹ (mod 511). Of the 256 lenses 60 ⊕ m, only five keep both periods, and one of them (60 ⊕ 54 = 10) is decimal itself |
| **The lens 60 ⊕ 128** | written in base 188, they repeat over **2 and 72**: this pole does not keep the periods |
| **To reflect upon a prompt** | a prompt reads one position ([[SPEC-04 First Principles]]); the lens decides how that reading repeats |

**Recurrences, noted, not explained:** 6 is the swaps' carry-forward period and 8 the bit rotation's constant-carry period ([[SPEC-07 The Fundamental Invariants]] I-10, I-11). 24 is the bit rotation's carry-forward period (I-11) and the generator's product (I-33). That these are one structure is not shown.

**What it does not say: FAILS** (checked):
- That the two poles 60 ⊕ 64 and 60 ⊕ 128 *are* the two directions. Reversing 124 at 8 bits gives 131, not 188; the poles differ by `0xC0`. The poles are two lenses, and the direction is a separate flip.
- That the direction and the ASCII order of the fifteen treemaps are one choice (I-55).

## How It Is Checked

The axiom's operational content is the Circulator type. Its conservation laws are tested in `src/testbed/core.test.ts`; see [[SPEC-06 The Circulator]].
