---
id: SPEC-02
title: "Conformance Criteria"
kind: spec
layer: meta
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-00 Canonical Statement]]"
down: []
related:
  - "[[SPEC-00 Canonical Statement]]"
  - "[[SPEC-01 The Three Laws]]"
  - "[[SPEC-03 Notation OMI-Lisp]]"
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-11 The Three Primitives]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-60 Test Vectors]]"
  - "[[SPEC-61 Implementation Status]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
code: []
dimensions: []
symbols: []
tags: [omi-imo, conformance, criteria, requirements]
---

# Conformance Criteria

## The Five Conformance Tests

A conforming implementation MUST:

1. Provide `bind`, `apply`, and `eval` with the correct signatures
2. Preserve bind symmetry
3. Preserve the two readings of eval
4. Adhere to the operational laws
5. Keep substrates orthogonal

## The Four Prohibitions

A conforming implementation MUST NOT:

1. Introduce new operations at the protocol layer
2. Override the primitives' laws
3. Allow substrate extensions to alter the primitives' behavior
4. Mutate trace log entries

## The Test Vectors

See [[SPEC-60 Test Vectors]] for the conformance test vectors.

## The Implementation Status

See [[SPEC-61 Implementation Status]] for the current implementation status.
