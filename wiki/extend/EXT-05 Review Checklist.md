---
id: EXT-05
title: "Review Checklist"
kind: extension
layer: extension
status: canonical
spec: OMI-IMO-2026
up: "[[EXT-00 How to Extend the Protocol]]"
down: []
related:
  - "[[EXT-00 How to Extend the Protocol]]"
  - "[[EXT-01 Adding a Dimension]]"
  - "[[EXT-02 Adding a Symbol]]"
  - "[[EXT-03 Adding a Substrate]]"
  - "[[EXT-04 Literate Workflow]]"
  - "[[SPEC-02 Conformance Criteria]]"
  - "[[SPEC-60 Test Vectors]]"
  - "[[SPEC-61 Implementation Status]]"
sources: []
code: []
dimensions: []
symbols: []
tags: [omi-imo, review, checklist, quality]
---

# Review Checklist

## Every Extension Must Pass

### Structure

- [ ] The note has a unique `id`
- [ ] The note has a descriptive `title`
- [ ] The note has a `kind` (spec, source, extension, open, map, meta)
- [ ] The note has a `layer` (meta, foundations, architecture, grammar, hardware, runtime, verification, extension, open, map, sources)
- [ ] The note has a `status` (draft, review, canonical, contested, deprecated)
- [ ] The note has `up` and `down` links
- [ ] The note has `related` links
- [ ] The note has `sources` links (if it is a spec)
- [ ] The note has `code` links (if it is a spec)
- [ ] The note has `dimensions` links (if relevant)
- [ ] The note has `symbols` links (if relevant)
- [ ] The note has `tags`

### Content

- [ ] The note has a clear definition
- [ ] The note has examples
- [ ] The note has cross-references
- [ ] The note preserves specifics (numbers, names, identifiers, regexes, arithmetic)
- [ ] The note marks speculation as speculation
- [ ] The note does not invent content

### Links

- [ ] All `up` links point to existing notes
- [ ] All `down` links point to existing notes
- [ ] All `related` links point to existing notes
- [ ] All `sources` links point to existing notes
- [ ] All `code` links point to existing files
- [ ] All `dimensions` links point to existing dimensions
- [ ] All `symbols` links point to existing symbols

### Code

- [ ] The code is syntactically correct
- [ ] The code compiles
- [ ] The code passes the self-test
- [ ] The code has comments linking back to the spec

### Tests

- [ ] The extension has a test vector in [[SPEC-60 Test Vectors]]
- [ ] The test vector has a clear input
- [ ] The test vector has a clear expected output
- [ ] The test vector has a clear pass condition
- [ ] The test vector passes

## The Conformance Criteria

See [[SPEC-02 Conformance Criteria]] for the full conformance criteria.

## The Implementation Status

See [[SPEC-61 Implementation Status]] for the current implementation status.

## The Change Log

See [[META-03 Change Log]] for the change log.
