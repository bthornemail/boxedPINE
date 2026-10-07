---
id: META-02
title: "Evidence and Confidence"
kind: meta
layer: meta
status: canonical
spec: OMI-IMO-2026
up: "[[META-00 Vault Schema]]"
down: []
related:
  - "[[META-00 Vault Schema]]"
  - "[[META-01 Extractive Method]]"
  - "[[META-03 Change Log]]"
  - "[[OPEN-00 Contradiction Register]]"
  - "[[OPEN-04 Discarded Claims]]"
sources: []
code: []
dimensions: []
symbols: []
tags: [omi-imo, meta, evidence, confidence, verification]
---

# Evidence and Confidence

## Overview

This vault distinguishes rigorously between what was asserted and what was proven. Every claim has a confidence level and evidence.

## The Confidence Levels

| Level | Meaning | Example |
|-------|---------|---------|
| `stated` | The claim is directly stated in the source | "The ruler has eight slots" |
| `derived` | The claim is derived from the source by arithmetic or logic | "2! + 3! = 8" |
| `speculative` | The claim is a hypothesis or guess | "The 5T/10T frame is the n-sphere" |
| `contradicted` | The claim is contradicted by the source or by arithmetic | "The 6T circuit computes XOR" (it's XNOR) |

## The Evidence

Every claim has evidence. The evidence is a short verbatim fragment from the source (max ~25 words).

## The Verification

The verification is the process of checking the claims against the sources and against arithmetic.

### Arithmetic Verification

Arithmetic claims are verified by recomputing them. For example:

```
Claim: 12² + 16² = 20²
Check: 144 + 256 = 400 = 20² ✓
```

### Source Verification

Source claims are verified by checking them against the source. For example:

```
Claim: The ruler has eight slots.
Source: "The ruler is 2! + 3! = 8 slots long."
```

### Code Verification

Code claims are verified by running the code. For example:

```
Claim: The delta function has period 8.
Code: delta^8(state, C) = state
```

## The Contradictions

Contradictions are tracked in [[OPEN-00 Contradiction Register]]. Each contradiction is a place where the sources disagree with each other or with themselves.

## The Discarded Claims

Discarded claims are tracked in [[OPEN-04 Discarded Claims]]. Each discarded claim is a claim that has been contradicted by the sources or by arithmetic verification.

## The Open Questions

Open questions are tracked in [[OPEN-01 Open Questions]]. Each open question is a place where the sources are unclear or incomplete.

## The Provenance Caveat

The Google Search PDF (SRC-06) is not what its filename suggests. Only 3 of 78 pages are organic search results. The remaining ~75 pages are a single Google AI Mode conversation. The AI never flagged an error across ~10 turns while the arithmetic was wrong repeatedly. The protocol content is uniformly speculative.

## The Agreement-Echo Structure

The AI Mode conversation has an agreement-echo structure: the AI agrees with the user's claims without verifying them. This means that the claims in SRC-06 are not independently verified. They are the user's claims echoed by the AI.

## The Implication

The implication is that the four-way taxonomy (phases, attributes, constraints, configurations) in SRC-06 is a hypothesis needing independent justification. It is not a established result.
