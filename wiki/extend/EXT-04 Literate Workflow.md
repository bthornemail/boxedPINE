---
id: EXT-04
title: "Literate Workflow"
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
  - "[[EXT-05 Review Checklist]]"
  - "[[META-01 Extractive Method]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
code: []
dimensions: []
symbols: []
tags: [omi-imo, literate, workflow, extract, distill, specify, implement, verify]
---

# Literate Workflow

## The Workflow

The literate workflow is the process of extending the protocol. It has five stages:

```
Extract → Distill → Specify → Implement → Verify
```

## Stage 1: Extract

Read the source material. Extract the claims, definitions, and code.

**Input:** A transcript, a PDF, a code file.
**Output:** A source note in `sources/parts/`.

The source note has:

- Summary
- Claims (with confidence and evidence)
- Definitions (verbatim)
- Numbers and invariants
- Code (verbatim)
- Open questions and contradictions
- Quotable fragments
- Cross-references
- Extraction notes

## Stage 2: Distill

Distill the source notes into a source MOC.

**Input:** One or more source part notes.
**Output:** A source MOC in `sources/`.

The source MOC has:

- Summary of the source
- Links to the part notes
- Key claims
- Key definitions
- Key numbers
- Key code
- Open questions
- Cross-references

## Stage 3: Specify

Write a spec note.

**Input:** One or more source MOCs.
**Output:** A spec note in `spec/`.

The spec note has:

- Frontmatter (id, title, kind, layer, status, spec, up, down, related, sources, code, dimensions, symbols, tags)
- Definition
- The specification
- Examples
- Cross-references

## Stage 4: Implement

Write the code.

**Input:** A spec note.
**Output:** A code file.

The code has:

- The implementation
- Comments linking back to the spec
- Tests

## Stage 5: Verify

Run the tests.

**Input:** A code file.
**Output:** A test result.

The test result has:

- Pass/fail for each test vector
- A link to the spec note
- A link to the implementation status

## The Principles

1. **Preserve specifics** — numbers, names, identifiers, regexes, arithmetic
2. **Never invent** — if the source is vague, say so
3. **Mark speculation** — distinguish rigorously between what was asserted and what was proven
4. **Link everything** — every note links to its sources and its specs
5. **Cross-reference** — every spec note links to its source notes and its code

## The Tools

| Tool | Purpose |
|------|---------|
| `pdftotext` | Extract text from PDFs |
| `sed` | Read specific line ranges |
| `grep` | Search for patterns |
| `write` | Write files |
| `edit` | Edit files |
| `task` | Launch subagents for extraction |

## The Vault Structure

```
wiki/
├── OMI-IMO.md                    — root MOC
├── README.md                     — vault guide
├── meta/                         — vault schema, method, evidence, changelog
├── sources/
│   ├── raw/                      — extracted text from PDFs
│   ├── parts/                    — source part notes
│   └── SRC-*.md                  — source MOCs
├── spec/
│   ├── 00-canonical/             — canonical statement, laws, conformance, notation
│   ├── 10-foundations/           — primitive, ruler, XOR, knots, delta, Fano
│   ├── 20-architecture/          — dimensions, inversion, Blob, Rosetta, observers, iff
│   ├── 30-grammar/               — symbols, declarations, mnemonics, forms, phases, orbits
│   ├── 40-hardware/              — 6T, 8T, sourcemap, primes
│   ├── 50-runtime/               — stream, canvas, REPL, clocks, web, ASCII
│   └── 60-verification/          — test vectors, implementation status
├── extend/                       — extension guides
├── open/                         — contradictions, questions, glossary, discarded
├── maps/                         — canvases
├── bases/                        — Obsidian Bases
└── tools/                        — validation scripts
```
