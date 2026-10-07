---
id: META-00
title: "Vault Schema"
kind: meta
layer: meta
status: canonical
spec: OMI-IMO-2026
up: "[[OMI-IMO]]"
down:
  - "[[META-01 Extractive Method]]"
  - "[[META-02 Evidence and Confidence]]"
  - "[[META-03 Change Log]]"
related:
  - "[[OMI-IMO]]"
  - "[[EXT-04 Literate Workflow]]"
  - "[[EXT-05 Review Checklist]]"
sources: []
code: []
dimensions: []
symbols: []
tags: [omi-imo, meta, schema, frontmatter, structure]
---

# Vault Schema

## Overview

This vault is a second-brain wiki for the OMI-IMO protocol. It is designed for literate programming: the specification, the source material, and the code are all crosslinked.

## The Frontmatter Contract

Every note in the vault has YAML frontmatter. The frontmatter is the crosslink layer.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | A stable unique identifier (e.g., `SPEC-12`, `SRC-03a`, `EXT-01`) |
| `title` | string | A human-readable title |
| `kind` | string | One of: `root-index`, `source`, `source-part`, `spec`, `extension`, `open`, `progress`, `map`, `meta` |
| `layer` | string | One of: `root`, `sources`, `meta`, `foundations`, `architecture`, `grammar`, `hardware`, `runtime`, `verification`, `extension`, `open`, `progress`, `map` |
| `status` | string | One of: `draft`, `review`, `canonical`, `contested`, `deprecated` |
| `spec` | string | The protocol version (e.g., `OMI-IMO-2026`) |
| `up` | list | Parent notes in the hierarchy |
| `down` | list | Child notes in the hierarchy |
| `related` | list | Related notes |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `sources` | list | Source notes this note is derived from |
| `code` | list | Code files this note describes |
| `dimensions` | list | D-axis dimensions this note relates to |
| `symbols` | list | G symbols this note relates to |
| `tags` | list | Tags for search and filtering |
| `part` | number | The part number (for source parts) |
| `parts` | number | The total number of parts |
| `parent` | string | The parent note (for source parts) |
| `extracted` | string | The extraction date |
| `extraction` | string | The extraction method |
| `lines` | string | The line range in the source |
| `goal` | string | The goal a progress tracker measures against |
| `current_level` | number | The highest level a progress tracker marks ✅ Working |
| `updated` | string | The date a progress tracker was last updated |

## The Folder Structure

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
│   ├── 40-hardware/              — 6T, 8T, sourcemap, primes, virtual breadboard
│   ├── 50-runtime/               — stream, canvas, REPL, clocks, web, ASCII
│   └── 60-verification/          — test vectors, implementation status
├── extend/                       — extension guides
├── open/                         — contradictions, questions, glossary, discarded
├── progress/                     — trackers of progress toward a goal
├── maps/                         — canvases
├── bases/                        — Obsidian Bases
└── tools/                        — validation scripts
```

## The Note Types

### Root Index

The root MOC. `OMI-IMO.md`. Links to everything.

### Source MOC

A source note in `sources/`. Links to its part notes. Summarizes the source.

### Source Part

A source part note in `sources/parts/`. A structured extraction of a portion of a source.

### Spec

A spec note in `spec/`. A formal specification of a protocol component.

### Extension

An extension guide in `extend/`. A guide for extending the protocol.

### Open

An open question, contradiction, or glossary in `open/`.

### Progress

A tracker in `progress/`. Measures the state of the code against a goal, level by level, with a dated discovery log.

### Map

A canvas in `maps/`. A visual map of the protocol.

### Meta

A meta note in `meta/`. Documentation about the vault itself.

## The Crosslink Layer

The frontmatter is the crosslink layer. Every note links to its parents, children, related notes, sources, code, dimensions, and symbols.

The links are Obsidian wikilinks: `[[Note Name]]`. They are resolved by Obsidian's link resolver. Canvas files use the `.canvas` extension: `[[MAP-00 Protocol Canvas.canvas]]`.

## The Bases

The vault has Obsidian Bases in `bases/`. Each base is a database-like view of the notes.

| Base | Description |
|------|-------------|
| `OMI-IMO Registry.base` | The main registry of all notes |
| `Sources.base` | The source notes |
| `Symbols and Dimensions.base` | The symbols and dimensions |
| `Open Threads.base` | The open questions and contradictions |
| `Status Board.base` | The implementation status |

## The Canvases

The vault has Obsidian Canvases in `maps/`. Each canvas is a visual map of a portion of the protocol.

| Canvas | Description |
|--------|-------------|
| `MAP-00 Protocol Canvas.canvas` | The overall protocol map |
| `MAP-01 Source Graph.canvas` | The source graph |
| `MAP-02 Dimension Stack.canvas` | The dimensional ladder |
| `MAP-03 Ruler Canvas.canvas` | The ruler and its slots |
