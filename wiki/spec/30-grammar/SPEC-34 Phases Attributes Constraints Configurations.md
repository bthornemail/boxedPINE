---
id: SPEC-34
title: "Phases, Attributes, Constraints, Configurations"
kind: spec
layer: grammar
status: draft
spec: OMI-IMO-2026
up: "[[SPEC-30 The Symbol Table G]]"
down: []
related:
  - "[[SPEC-30 The Symbol Table G]]"
  - "[[SPEC-31 Declaration Syntax]]"
  - "[[SPEC-32 Mnemonics and Axes]]"
  - "[[SPEC-33 The Quadratic Forms]]"
  - "[[SPEC-35 Reflections and Orbits]]"
  - "[[SPEC-25 The Iff]]"
sources:
  - "[[SRC-06 Phases vs Attributes vs Constraints vs Configurations]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
code: []
dimensions: []
symbols: []
tags: [omi-imo, phases, attributes, constraints, configurations, knots, encoding, draft]
---

# Phases, Attributes, Constraints, Configurations

> **Status: draft.** This four-way taxonomy is a hypothesis needing independent justification. The source is a Google AI Mode conversation, not organic search results. The AI never flagged an error across ~10 turns while the arithmetic was wrong repeatedly. See [[SRC-06 Phases vs Attributes vs Constraints vs Configurations]] for the full extraction and the seven contradictions found.

## The Four Terms

The question is how to describe asymmetric encoding for knots. The four candidate terms:

| Term | Question it answers |
|------|---------------------|
| **Phase** | What state is the system in? |
| **Attribute** | What property does the system have? |
| **Constraint** | What limit does the system obey? |
| **Configuration** | What arrangement is the system in? |

## The Distinction

### Phase

A phase is a temporal or modal state. It is dynamic — it changes over time or across modes. In the protocol, the phase is the inference state: ⚡ Active or 🟢 Passive.

```
Phase = the dynamic state (Active / Passive)
```

### Attribute

An attribute is a static property. It is a characteristic that the system has. In the protocol, the attribute is the structural definition: the component, the hardware substrate, the structural interface.

```
Attribute = the static property (component, substrate, interface)
```

### Constraint

A constraint is a limit or boundary. It is a condition that the system must obey. In the protocol, the constraint is the regex pattern, the admissibility condition, the boundary.

```
Constraint = the limit (regex, admissibility, boundary)
```

### Configuration

A configuration is an arrangement. It is a specific setting of the system's parameters. In the protocol, the configuration is the CONFIGURATION type: the 4-tuple of declarations, definitions, expressions, templates.

```
Configuration = the arrangement (declarations, definitions, expressions, templates)
```

## The Relationship

```
Phase         — dynamic (changes)
Attribute     — static (fixed)
Constraint    — limiting (bounds)
Configuration — arranged (set)
```

The four terms are orthogonal. A system has phases, attributes, constraints, and configurations. They are four different ways of describing the same system.

## The Knot Connection

For describing asymmetric encoding for knots:

- The **phase** is the knot's state (tied or untied)
- The **attribute** is the knot's property (crossing number, chirality)
- The **constraint** is the knot's limit (Reidemeister moves)
- The **configuration** is the knot's arrangement (specific embedding)

## The Protocol Connection

In the protocol:

- The **phase** is the inference state (Active / Passive / Neutral)
- The **attribute** is the structural definition (component, substrate, interface)
- The **constraint** is the regex pattern (G, the symbol table)
- The **configuration** is the CONFIGURATION type (the 4-tuple)

## The Contradictions

From the extraction of SRC-06, seven contradictions were found in the source:

1. `2^5^8^10 = 0` (actual 5)
2. `168 & 3125 = 32` (actual 0)
3. `168 | 3125 = 3261` (actual 3177)
4. `95 ⊕ 59 = 1911756` (actual 100)
5. `(n−1)²+(n+1)² = n²` (false for all n)
6. The 7-element literal group listing `0d` twice
7. The IEEE citation mismatch

These are recorded in [[OPEN-00 Contradiction Register]].

## The Open Question

The largest unresolvable gap: inline markers `[1]`–`[14]` appear on every load-bearing claim (Δ = −7Θ4, prime sextuplet, Fano plane, Time Crystal) but no bibliography is in the PDF. This is recorded in [[OPEN-01 Open Questions]].
