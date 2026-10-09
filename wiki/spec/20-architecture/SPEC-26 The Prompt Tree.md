---
id: SPEC-26
title: "The Prompt Tree"
kind: spec
layer: architecture
status: review
spec: OMI-IMO-2026
up: "[[SPEC-09 The Structure Map]]"
down: []
related:
  - "[[SPEC-04 First Principles]]"
  - "[[SPEC-07 The Fundamental Invariants]]"
  - "[[SPEC-22 The Blob]]"
  - "[[SPEC-37 The Catalog Coordinate]]"
  - "[[SPEC-66 BOM Swap Table]]"
  - "[[PROG-00 Homoiconic Syntax Tracker]]"
  - "[[OPEN-01 Open Questions]]"
sources:
  - "[[SRC-10 The Ontology Conversation]]"
code:
  - "core/src/verified/tree.ts"
  - "rosetta/src/grammar/treemaps.ts"
  - "src/testbed/core.test.ts"
  - "src/testbed/rosetta.test.ts"
dimensions: []
symbols: []
tags: [omi-imo, architecture, prompt-tree, patricia-trie, bom, treemap, blob]
---

# The Prompt Tree

The author, in conversation on 2026-10-09: the tree classification model is sixteen 65,536-bit files ([[SPEC-09 The Structure Map]], "The Tree"). Its zero index is the **BOM**, renamed from "the Hamming index" because it is not yet known whether it is the prefix or the suffix of the wordform. The BOM holds the protocol logic that orders the other fifteen: the **Prompt Tree**.

## The Shape (DEFINITION, author)

The author wants the Prompt Tree to be a **PATRICIA trie**, like Ethereum's radix-16 Merkle–Patricia trie, shaped like this:

> 1 (16 of exponent: number) → 2 (8 of exception: reference) → 4 (4 of declaration: RegExp) → 8 (2 of definition: string) → 1 (16 = Binary Blob, the final child reference literal of 65,536 bits max width)

| Level | Nodes | Branching | Role | Type |
|-------|-------|-----------|------|------|
| 0, root | 1 | 16 | exponent | `number` |
| 1 | 2 | 8 | exception | reference: a `Buffer`, `Blob` or URI, or a `base36:base32:base64` coordinate; the literal reference, as the prompt function makes one |
| 2 | 4 | 4 | declaration | `RegExp` |
| 3 | 8 | 2 | definition | `string` |
| leaf | 1 | — | the Binary Blob | 65,536 bits max: a **meta proof**, a **meta type** and an **axiomatic algorithm meta mask** |

The four roles are the four parts of the read ([[SPEC-08 The Derivation Path]] Part 12: exponent, exception, declaration, definition), now as the four levels.

## What Is Proved About It (THEOREM, tested)

1. **Every level is the same 16 positions:** 1 × 16 = 2 × 8 = 4 × 4 = 8 × 2 = 16. A level reads a position (a nibble) as *node* (its high bits) and *child* (its low bits): the root reads all 4 bits as the child, the exception level 1 + 3, the declaration level 2 + 2, the definition level 3 + 1.
2. **The nodes are 1 + 2 + 4 + 8 = 15, and with the leaf, 16.**
3. **The levels are the three swaps.** `swap16` (j ⊕ 1) never leaves a definition pair, `swap32` (j ⊕ 3) never leaves a declaration quad, and `swap64` (j ⊕ 7) never leaves an exception octet. So the exception level's two nodes are the lower 8 and higher 8 indices: the two poles of 60 ([[SPEC-07 The Fundamental Invariants]] I-14). This matches [[SPEC-66 BOM Swap Table]]: "the swap is the byte order mark — the mark that says which reading of the 16 is active". The BOM's levels *are* the swap readings.
4. **A path is 16 bits, exactly an index into the leaf.** One position per level is 16⁴ = 65,536 paths, which is the leaf's width. So the tree has **one leaf Blob, not 1,024**. 16 × 8 × 4 × 2 = 1,024 would count a classic trie in which every child is a whole node; the node counts 1, 2, 4, 8 rule that reading out.

## What Was Decided (DECISION, reversible)

| Decision | Chosen | Alternative |
|----------|--------|-------------|
| Order of the four positions in the 16-bit path | exponent is the high nibble, definition the low one: the path reads in the tree's order | the reverse |
| Where the BOM sits | **file 0, the prefix**: a byte order mark comes first, and the author calls it "the 0 index" | file 15, the suffix |
| How a leaf is read | the bit at the path is the mask bit: 1 admits that (exponent, exception, declaration, definition), 0 does not. That is how one Blob is a proof, a type and a mask at once | — |

With these, the whole tree is addressed by the 20-bit index of `tree.ts`: **file (4 bits) · exponent · exception · declaration · definition (4 bits each)**. Five nibbles, an index of index indices.

```ts
prompt(tree, BOM_FILE, promptPath(exponent, exception, declaration, definition)) // → 0 or 1
```

## The Fifteen (files 1–15)

The tree's other fifteen files hold the fifteen rectangular treemap algorithms. They are listed in `rosetta/src/grammar/treemaps.ts` with their order, aspect ratio and stability, as the Wikipedia article "Treemapping" gives them.

**Enumerate first** (author: "first lets start with logical delineation so terms, we proceed by enumerating"): files 1–15 follow the article's order, which is already grouped by order class.

| File | Algorithm | Order | Aspect ratio | Stability |
|------|-----------|-------|--------------|-----------|
| 1 | BinaryTree | partially ordered | high | stable |
| 2 | Slice And Dice | ordered | very high | stable |
| 3 | Strip | ordered | medium | medium |
| 4 | Pivot by middle | ordered | medium | medium |
| 5 | Pivot by split | ordered | medium | low |
| 6 | Pivot by size | ordered | medium | medium |
| 7 | Split | ordered | medium | medium |
| 8 | Spiral | ordered | medium | medium |
| 9 | Hilbert | ordered | medium | medium |
| 10 | Moore | ordered | medium | medium |
| 11 | Squarified | unordered | low | low |
| 12 | Mixed Treemaps | unordered | low | medium |
| 13 | Approximation | unordered | low | medium |
| 14 | Git | unordered | medium | stable |
| 15 | Local moves | unordered | medium | stable |

The classes count (THEOREM, tested) **1 : 9 : 5** by order, **1 : 1 : 10 : 3** by aspect ratio and **4 : 9 : 2** by stability. None of these is the generator's 3 : 4 : 2 (I-33).

**Then assess with the ASCII cascade** ("when using alphanumeric we will be subject to that so we must respect it"). Sorted by ASCII, the files come out as 13, 1, 14, 9, 15, 12, 10, 4, 6, 5, 2, 8, 7, 11, 3. That is a different order from the enumeration, so the ASCII cascade is a **second reading** of the fifteen, not their numbering.

## What Is Open

- ⟦**Prefix or suffix:** is the BOM file 0 or file 15? (The author does not yet know; file 0 is the decision for now.)⟧
- ⟦**I-17:** "17 is the Hamming-distance index" was confirmed earlier. With the Hamming index renamed the BOM, and the BOM at file 0 (index 16), does 17 still name the Hamming distance, or does the BOM take that role? See [[OPEN-01 Open Questions]] #21.⟧
- ⟦**The ASCII cascade rule:** which categorical rule beyond plain ASCII order assesses the fifteen? For example, the ASCII class of each name's letters, or of its index written in base36.⟧
- ⟦**The polynomial shape:** the author orders the fifteen "based on the polynomial shape of the terms in relation to the zero index". What makes a term's shape: its order class, or a degree?⟧
- ⟦**PATRICIA compression:** in a PATRICIA trie a node with one child is skipped. Here, is a level skipped when only one position is admitted?⟧
- ⟦**The layouts:** the fifteen are catalogued, not computed. No layout algorithm runs yet.⟧
