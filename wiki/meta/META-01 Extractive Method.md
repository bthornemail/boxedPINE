---
id: META-01
title: "Extractive Method"
kind: meta
layer: meta
status: canonical
spec: OMI-IMO-2026
up: "[[META-00 Vault Schema]]"
down: []
related:
  - "[[META-00 Vault Schema]]"
  - "[[META-02 Evidence and Confidence]]"
  - "[[META-03 Change Log]]"
  - "[[EXT-04 Literate Workflow]]"
sources: []
code: []
dimensions: []
symbols: []
tags: [omi-imo, meta, extraction, method, pdftotext, structured]
---

# Extractive Method

## Overview

The vault is built by extracting structured content from the source PDFs. The extraction is done by subagents that read specific line ranges and write structured source part notes.

## The Process

### 1. Extract Text from PDFs

```bash
pdftotext -layout -enc UTF-8 "input.pdf" "output.txt"
```

The `-layout` flag preserves the layout. The `-enc UTF-8` flag ensures UTF-8 encoding.

### 2. Split into Parts

Each PDF is split into parts of ~15,000-30,000 lines. Each part is processed by a separate subagent.

### 3. Extract Structured Content

Each subagent reads its assigned line range and writes a source part note with:

- Summary
- Claims (with confidence and evidence)
- Definitions (verbatim)
- Numbers and invariants
- Code (verbatim)
- Open questions and contradictions
- Quotable fragments
- Cross-references
- Extraction notes

### 4. Write Source MOCs

The source part notes are distilled into source MOCs. Each MOC summarizes the source and links to its part notes.

### 5. Write Spec Notes

The source MOCs are used to write spec notes. Each spec note is a formal specification of a protocol component.

### 6. Crosslink

All notes are crosslinked via frontmatter. The frontmatter is the crosslink layer.

## The Principles

1. **Preserve specifics** — numbers, names, identifiers, regexes, arithmetic
2. **Never invent** — if the source is vague, say so
3. **Mark speculation** — distinguish rigorously between what was asserted and what was proven
4. **Link everything** — every note links to its sources and its specs
5. **Cross-reference** — every spec note links to its source notes and its code

## The Confidence Levels

| Level | Meaning |
|-------|---------|
| `stated` | The claim is directly stated in the source |
| `derived` | The claim is derived from the source by arithmetic or logic |
| `speculative` | The claim is a hypothesis or guess |
| `contradicted` | The claim is contradicted by the source or by arithmetic |

## The Sources

| Source | Pages | Lines | Parts |
|--------|-------|-------|-------|
| DeepSeek0: Protocol Review and Bug Fixes | 322 | 23606 | 2 |
| DeepSeek1: XOR Tetrahedron Transform | 357 | 26900 | 2 |
| DeepSeek2: XOR Gate Transistor Circuits | 744 | 58922 | 2 |
| DeepSeek3: Protocol Sequence Analysis | 2218 | 125453 | 4 |
| DeepSeek4: Assembly Register Programming | 1820 | ~80000 | 2 |
| DeepSeek5: Conspiracy Check | 1071 | 55119 | 2 |
| Phases vs Attributes vs Constraints vs Configurations | 78 | 3674 | 1 |
| The OMI-IMO Complete Synthesis | 16 | 720 | 1 |
| XOR Gate Built with Transistors | 40 | 948 | 1 |

## The Audio Source

There is an audio file `How_an_AI_Dismantled_the_Omi-Dom-Stack.m4a` (81 MB). This has not been transcribed. It is a source that needs transcription.

## The Image-Only Source

The PDF `The_Honest_Protocol_Audit.pdf` (15 pages) has no text layer. It is 15 pages of pure images. This has not been OCR'd. It is a source that needs OCR.
