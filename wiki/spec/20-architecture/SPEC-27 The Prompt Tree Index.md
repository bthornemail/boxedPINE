---
id: SPEC-27
title: "The Prompt Tree Index"
kind: spec
layer: architecture
status: review
spec: OMI-IMO-2026
up: "[[SPEC-26 The Prompt Tree]]"
down: []
related:
  - "[[SPEC-07 The Fundamental Invariants]]"
  - "[[SPEC-09 The Structure Map]]"
  - "[[SPEC-22 The Blob]]"
  - "[[SPEC-31 Declaration Syntax]]"
sources:
  - "[[SRC-10 The Ontology Conversation]]"
code:
  - "core/src/verified/tree.ts"
  - "rosetta/src/grammar/grammar.ts"
  - "src/testbed/vectors/prompt-tree.json"
dimensions: []
symbols: []
tags: [omi-imo, architecture, prompt-tree, index, derivation, declaration, pattern]
---

# The Prompt Tree Index

The author, 2026-10-09: "we are not defining anything on a protocol, not algorithms or anything; we are deriving the patterns and indexing them so they can be used repeatably and propagated forward through regex declarations."

So this note defines nothing. It does four things:
1. **derives** a pattern: shows that it is already there;
2. **labels** its positions: the names are chosen;
3. **indexes** them: gives every position an address;
4. **declares** it: writes the regex that carries it forward.

Anyone who starts from the same structure finds the same pattern and the same readings.

## 1. The Pattern (derived)

Take the 16 positions of a nibble, 0–F. Group them by their high bits:

| High bits used | Groups | Positions per group |
|----------------|--------|---------------------|
| 0 | 1 | 16 |
| 1 | 2 | 8 |
| 2 | 4 | 4 |
| 3 | 8 | 2 |

Every row still covers all 16 positions. This is the **complete binary tree on 16 leaves**: 1 + 2 + 4 + 8 = 15 groups above the 16 positions. It is not invented here; it is what a nibble already is.

**Where it already recurs in the protocol** (each is a THEOREM, tested):

| Recurrence | Row of the pattern |
|------------|--------------------|
| `swap64` (j ⊕ 7) never leaves its group of 8 | 2 × 8 |
| `swap32` (j ⊕ 3) never leaves its group of 4 | 4 × 4 |
| `swap16` (j ⊕ 1) never leaves its group of 2 | 8 × 2 |
| The two groups of 8 are the lower 8 and higher 8 indices, the two poles of 60 (I-14) | 2 × 8 |
| The four groups of 4 end at 3, 7, 11, 15: the four-block family of I-14 and the generator's `{3,7,11,15}` (I-33) | 4 × 4 |
| A byte pair, which `swap16` exchanges | 8 × 2 |

## 2. The Labels (chosen)

The author's names for the rows ([[SPEC-26 The Prompt Tree]]):

| Row | Label | What it holds |
|-----|-------|---------------|
| 1 × 16 | **exponent** | `number` |
| 2 × 8 | **exception** | a reference: `Buffer`, `Blob`, URI, or `base36:base32:base64` |
| 4 × 4 | **declaration** | `RegExp` |
| 8 × 2 | **definition** | `string` |
| the leaf | **Binary Blob** | 65,536 bits: meta proof, meta type, meta mask |

These are DEFINITIONS of names. The structure does not choose them, and nothing about the roles produces the 16, 8, 4, 2.

## 3. The Index (register)

**One position, read at each label.** Each label reads a position as group · place, so position C reads as group 1, place 4 under the exception label.

| Position | exponent | exception | declaration | definition |
|----------|----------|-----------|-------------|------------|
| 0 | 0 · 0 | 0 · 0 | 0 · 0 | 0 · 0 |
| 1 | 0 · 1 | 0 · 1 | 0 · 1 | 0 · 1 |
| 2 | 0 · 2 | 0 · 2 | 0 · 2 | 1 · 0 |
| 3 | 0 · 3 | 0 · 3 | 0 · 3 | 1 · 1 |
| 4 | 0 · 4 | 0 · 4 | 1 · 0 | 2 · 0 |
| 5 | 0 · 5 | 0 · 5 | 1 · 1 | 2 · 1 |
| 6 | 0 · 6 | 0 · 6 | 1 · 2 | 3 · 0 |
| 7 | 0 · 7 | 0 · 7 | 1 · 3 | 3 · 1 |
| 8 | 0 · 8 | 1 · 0 | 2 · 0 | 4 · 0 |
| 9 | 0 · 9 | 1 · 1 | 2 · 1 | 4 · 1 |
| A | 0 · 10 | 1 · 2 | 2 · 2 | 5 · 0 |
| B | 0 · 11 | 1 · 3 | 2 · 3 | 5 · 1 |
| C | 0 · 12 | 1 · 4 | 3 · 0 | 6 · 0 |
| D | 0 · 13 | 1 · 5 | 3 · 1 | 6 · 1 |
| E | 0 · 14 | 1 · 6 | 3 · 2 | 7 · 0 |
| F | 0 · 15 | 1 · 7 | 3 · 3 | 7 · 1 |

**Positions composed into an address.** One position per label, after the file, gives five hex digits:

```
file · exponent · exception · declaration · definition      e.g.  0 · 3 · C · 0 · 0
```

The last four digits are a 16-bit index into the file's 65,536 bits, so every bit of the tree has exactly one address and every address names exactly one bit (THEOREM, tested).

**How the two readings fit.** Reading the index *across* the labels (one position each) gives the address: 16⁴ = 65,536 addresses per file. Reading *down* one position through the four labels (one row of the table above) is the descent through the binary tree. The address is how positions compose; the descent is how each position reads. ⟦This is how the vault reconciles the two readings (SPEC-26, I-51). The author has not said which reading the shape means.⟧

**Chosen orders** (labels, not consequences): the exponent is the first digit and the definition the last; inside a byte, bit 0 is the lowest. Where the BOM sits depends on the direction (§5).

## 4. The Declaration (carried forward)

The pattern is carried by one regex declaration in `rosetta/src/grammar/grammar.ts`:

```
PROMPT_PATH   /^0x(?<file>[0-9A-F])(?<exponent>[0-9A-F])(?<exception>[0-9A-F])(?<declaration>[0-9A-F])(?<definition>[0-9A-F])$/
```

- The radix prefix is lowercase and the index digits uppercase, as in `PINEBOXED` (lowercase value radix, uppercase index axis).
- Each named group is a label. Anyone who reads the declaration reads the pattern, with no code.
- `PROMPT_PATH` is only the handle the rosetta store files it under. The protocol names no regex (I-64): what propagates is the bare expression, in whatever regex variant two people share.
- `0x03C00` reads: file 0 (the BOM), exponent 3, exception C, declaration 0, definition 0.

To propagate the pattern, re-declare it: copy the regex, or write a narrower one inside it. For example, `/^0x0/` keeps only the BOM's addresses.

## 5. The Direction (derived)

The tree can be read in two directions. Reading the 16 positions the other way is

```
position ⊕ 15  =  15 − position  =  XNOR(position, 0) at 4 bits
```

**THEOREM** (tested): this reverses the order of the positions, undoes itself, and is the complement: the XOR/XNOR duality at one nibble. It is the fourth member of a family already in the pattern:

| Flip | Stays within | Row |
|------|--------------|-----|
| j ⊕ 1 (`swap16`) | a pair | 8 × 2, definition |
| j ⊕ 3 (`swap32`) | a quad | 4 × 4, declaration |
| j ⊕ 7 (`swap64`) | an octet | 2 × 8, exception |
| **j ⊕ 15** (the direction) | **the whole 16** | **1 × 16, exponent: the root** |

It never stays inside an octet, so the direction acts only at the root.

**The BOM is registered in both directions:** file 0 in the prefix reading, file 15 in the suffix reading, the same file seen from either end (`BOM_FILE`, `BOM_SUFFIX_FILE`). The tree does not change. Which direction a reader uses is the reader's choice, made at the root. This is what [[SPEC-05 The Axiom of Propagation]] says of every choice: it is located at a boundary, not decreed by the structure. The declaration `PROMPT_PATH` names positions in the prefix reading; a suffix reader reads `0x0…` as `0xF…`.

**What the direction does not do: FAILS.** It was proposed that "prefix or suffix" and "ASCII order or enumeration" are one choice. They are not. The ASCII order of the fifteen (13, 1, 14, 9, …) is not the enumeration reversed. Going from one to the other moves the files in two cycles, of 10 and 5, and no reversal can do that. So the direction and the cascade are **two independent choices**.

## 6. The Readings (evidence)

`src/testbed/vectors/prompt-tree.json` lists readings of the pattern at chosen positions: all 64 (label, position) readings, seven composed addresses, and twelve bits read from a tree seeded by a stated rule (every byte of file *f* is `0x3C` if *f* = 0, else *f*). They are evidence that the pattern reads the same each time. `npm test` re-derives them from `core/src/verified/tree.ts` and from the `PROMPT_PATH` declaration.

## 7. Still Being Labelled

- ⟦Which reading of the shape is meant: across, down, or both as above.⟧
- ⟦The ASCII cascade rule and the "polynomial shape" by which the fifteen are ordered ([[SPEC-26 The Prompt Tree]]).⟧
- ⟦PATRICIA compression: whether a label is skipped when only one position is admitted.⟧
