---
id: SPEC-27
title: "The Prompt Tree Algorithm"
kind: spec
layer: architecture
status: review
spec: OMI-IMO-2026
up: "[[SPEC-26 The Prompt Tree]]"
down: []
related:
  - "[[SPEC-02 Conformance Criteria]]"
  - "[[SPEC-07 The Fundamental Invariants]]"
  - "[[SPEC-09 The Structure Map]]"
  - "[[SPEC-22 The Blob]]"
sources:
  - "[[SRC-10 The Ontology Conversation]]"
code:
  - "core/src/verified/tree.ts"
  - "src/testbed/vectors/prompt-tree.json"
  - "src/testbed/core.test.ts"
dimensions: []
symbols: []
tags: [omi-imo, architecture, prompt-tree, algorithm, conformance, portable]
---

# The Prompt Tree Algorithm

**Version 0.1.0.** A formal statement of the Prompt Tree for someone implementing it in any language. [[SPEC-26 The Prompt Tree]] explains where it comes from; this note says exactly what an implementation must do. The reference implementation is `core/src/verified/tree.ts`.

The words **MUST**, **MUST NOT** and **MAY** are used as in RFC 2119.

## 1. Overview

A Prompt Tree is sixteen bit-arrays ("files") of 65,536 bits each. A reader asks a question by giving a **file** and four **positions**, one for each of four roles: exponent, exception, declaration and definition. The answer is one bit, read from the file. The four positions together form a 16-bit **path**, and the path is the bit's index in the file.

File 0 is the **BOM**; it holds the Prompt Tree's own mask. Files 1–15 hold the fifteen treemap algorithms' masks (SPEC-26).

## 2. Definitions

| Term | Definition |
|------|------------|
| **nibble** | an integer in 0–15 |
| **level** | an integer in 0–3. Level 0 is the exponent, 1 the exception, 2 the declaration, 3 the definition |
| **position** | a nibble, read at some level |
| **path** | an integer in 0–65,535 |
| **file** | an array of 8,192 bytes, read as 65,536 bits |
| **tree** | an ordered list of exactly 16 files |
| **address** | an integer in 0–1,048,575 (2²⁰ − 1) |

All integers are non-negative. No operation uses carries between fields; every combination is by shift and bitwise OR on disjoint bits.

## 3. Constants

| Name | Value |
|------|-------|
| `FILES` | 16 |
| `BITS_PER_FILE` | 65,536 |
| `BYTES_PER_FILE` | 8,192 |
| `BOM_FILE` | 0 |
| Level table | level 0: 1 node × 16; level 1: 2 nodes × 8; level 2: 4 nodes × 4; level 3: 8 nodes × 2 |

## 4. Operations

An implementation **MUST** provide these six operations with exactly these results. Every operation **MUST** reject an argument outside its range with an error, and **MUST NOT** clamp or wrap it.

**4.1 `levelReading(level, position) → (node, child)`.** Let `c = 4 − level`. Then `node = position >> c` and `child = position & (2^c − 1)`.

**4.2 `promptPath(exponent, exception, declaration, definition) → path`.** Each argument is a nibble. `path = exponent << 12 | exception << 8 | declaration << 4 | definition`.

**4.3 `promptLevels(path) → (exponent, exception, declaration, definition)`.** The inverse of 4.2: `(path >> 12, (path >> 8) & 15, (path >> 4) & 15, path & 15)`.

**4.4 `address(file, byte, bit) → address`.** `file` is a nibble, `byte` is in 0–8,191 and `bit` in 0–7. `address = file << 16 | byte << 3 | bit`. For a path, `byte = path >> 3` and `bit = path & 7`, so `address = file << 16 | path`.

**4.5 `split(address) → (file, byte, bit)`.** The inverse of 4.4: `(address >> 16, (address >> 3) & 8191, address & 7)`.

**4.6 `prompt(tree, file, path) → 0 | 1`.** `(tree[file][path >> 3] >> (path & 7)) & 1`. Bit 0 is the **least significant** bit of its byte.

An implementation **MAY** provide more (for example, a tree constructor that fills each file with one byte), but it **MUST NOT** change these six.

## 5. Guarantees

Each guarantee is proved below and checked by the reference tests.

| # | Guarantee | Why |
|---|-----------|-----|
| G1 | Every level has 16 positions: nodes × branching = 16 | 1 × 16 = 2 × 8 = 4 × 4 = 8 × 2 |
| G2 | The four levels are depths 0–3 of the **complete binary tree on 16 leaves**: the node `n` at level `k` covers exactly the positions `n · 16/2ᵏ` to `(n + 1) · 16/2ᵏ − 1`. There are 1 + 2 + 4 + 8 = 15 nodes | the high `k` bits of a 4-bit number select an aligned block of `2^(4−k)` |
| G3 | XOR by `2^m − 1` (m = 1, 2, 3) keeps a position inside its node at level `4 − m`. So `swap16` (j ⊕ 1) acts within a definition pair, `swap32` (j ⊕ 3) within a declaration quad, `swap64` (j ⊕ 7) within an exception octet | XOR by a mask below `2^m` leaves every bit from `m` up unchanged |
| G4 | `promptPath` is a bijection from the 16⁴ = 65,536 tuples of four nibbles onto the paths 0–65,535, and `promptLevels` is its inverse | the four fields occupy disjoint 4-bit slots that cover 16 bits |
| G5 | `address` is a bijection from (file, path) onto 0–1,048,575, and the bits it names are exactly the 2²⁰ bits of the tree | the same argument with a 4-bit and a 16-bit field |
| G6 | Every bit of every file is read by exactly one (file, path), and so by exactly one (file, exponent, exception, declaration, definition) | G4 and G5 |

## 6. Conformance

An implementation conforms when it passes every vector in `src/testbed/vectors/prompt-tree.json`:

| Group | What it checks |
|-------|----------------|
| `constants` | the four constants of §3 |
| `levelReading` | all 64 (level, position) pairs |
| `paths` | seven paths, both directions |
| `reads` | twelve reads from a tree seeded by the rule in `seed` (every byte of file *f* is `0x3C` if *f* = 0, else *f*), each with its address and `split` |
| `errors` | five out-of-range calls (`levelReading`, `promptPath`, `promptLevels`, `address`), each of which must raise an error |

The file is plain JSON, so any language can load it.

## 7. Decisions

These are choices, not consequences. Each one is stated so that an implementation can follow it, and a later version could change it.

| Decision | Chosen | Alternative |
|----------|--------|-------------|
| **D1: what a path is** | four independent positions, one per level, so 16⁴ = 65,536 paths: exactly one per bit of a file | the **single-descent** reading: one nibble descends through all four levels (G2), giving 16 outcomes per file |
| **D2: nibble order** | exponent high, definition low: the path reads in level order | definition high |
| **D3: bit order in a byte** | bit 0 is least significant | most significant first |
| **D4: where the BOM sits** | file 0, the prefix | file 15, the suffix |
| **D5: what a bit means** | 1 admits the path; 0 does not. So a file is a mask over all 65,536 (exponent, exception, declaration, definition) combinations | — |

D1 is the most consequential. The author's shape ("1 (16) → 2 (8) → 4 (4) → 8 (2) → 1 (16 = Binary Blob)") fits both readings. D1 was chosen because only it makes the number of paths equal the width of the Blob.

## 8. What Is Defined and What Is Not

| | Status |
|---|--------|
| The shape 16, 8, 4, 2 and the roles exponent, exception, declaration, definition | DEFINITION (author). Nothing derives the branching from the roles |
| G1–G6 | THEOREM |
| D1–D5 | DECISION |
| What fills a file (the treemap masks; the BOM's mask) | not specified. The author seeds the files |
| PATRICIA path compression (skipping a level with one admitted position) | not specified; open |
| Hashing (as in a Merkle–Patricia trie) | none. Nothing is hashed |

## 9. Prior Art and What Is Particular

- The level structure is the **complete binary tree on 16 leaves** (G2). It is a standard structure; nothing about the shape alone is new.
- The name and the radix-16 framing come from the **Merkle–Patricia trie** (as used by Ethereum). Unlike it, the Prompt Tree has a fixed depth, and no hashing or path compression (§8).
- That XOR by `2^m − 1` stays within an aligned block (G3) is a general property of XOR.

What is particular to this protocol:
- each level carries a **role** from the protocol's read (exponent, exception, declaration, definition);
- a question is **one position per role**, and the four positions are the bit's index (D1);
- a file is a **mask** (D5), one per tree algorithm, with the BOM's first;
- the protocol's three swaps are exactly the within-node permutations of the three lower levels (G3).

## 10. Open

- ⟦D1: the author to confirm four independent positions, or the single descent.⟧
- ⟦D4: prefix or suffix ([[OPEN-01 Open Questions]] #21).⟧
- ⟦PATRICIA compression, the ASCII cascade rule and the "polynomial shape" ([[SPEC-26 The Prompt Tree]]).⟧
