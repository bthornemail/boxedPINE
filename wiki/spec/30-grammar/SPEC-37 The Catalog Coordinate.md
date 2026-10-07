---
id: SPEC-37
title: "The Catalog Coordinate"
kind: spec
layer: grammar
status: draft
spec: OMI-IMO-2026
up: "[[SPEC-30 The Symbol Table G]]"
down: []
related:
  - "[[SPEC-36 The Literal Separation]]"
  - "[[SPEC-31 Declaration Syntax]]"
  - "[[OPEN-02 Broken Code Inventory]]"
  - "[[PROG-00 Homoiconic Syntax Tracker]]"
sources: []
code:
  - "rosetta/src/rfc.ts"
  - "rosetta/src/grammar/catalog.ts"
  - "core/src/broadcast.ts"
  - "src/testbed/rosetta.test.ts"
dimensions: []
symbols: [CATALOG]
tags: [omi-imo, grammar, catalog, base32, base36, base64, coordinate]
---

# The Catalog Coordinate

**Author (2026-10-07):** "purely historical but I think it's valid: we can use the `<base32?base36=base64>` form as a cataloging coordinate that's regex compatible" (`rosetta/src/rfc.ts`).

## The Form

```
<base32?base36=base64>

base32   the name      RFC 4648 alphabet A–Z 2–7, '=' padding
base36   the meter     a number, 0–9 a–z
base64   the name      again
```

In `rfc.ts` the base32 and base64 parts both encode the same `base` string, and base36 encodes the `meter`. `core/src/broadcast.ts` already uses the frame: `protocolAssignmentPattern = /<[\w\?]*=[\w\?]*>/g`, printing `<token = message>`.

Example: `<KJDEGLKPJVES2SKJ?0=UkZDLU9NSS1JSQ==>` is the name `RFC-OMI-II` with meter 0.

## Why It Works (verified)

- **The delimiters are block 0.** `<` `=` `>` `?` are codes 60, 61, 62, 63: block 0 of the orbit of 60. The coordinate is framed by 60's own block.
- **It is regex-compatible and unambiguous, even with padding.** Base36 never contains `=`, so the first `=` after `?` is always the separator. Base32 padding sits before the `?`, and base64 padding after the separator.

  ```
  /^<([A-Z2-7]+=*)\?([0-9a-z]+)=([A-Za-z0-9+/]+=*)>$/
  ```

  It is in the grammar as `CATALOG`.
- **It checks itself.** The name is encoded twice, so a coordinate is consistent only if base32 and base64 decode to the same name. A forged coordinate (base32 says `RFC-OMI-II`, base64 says `omi`) is caught.

Code: `rosetta/src/grammar/catalog.ts` (`catalog`, `readCatalog`). Tests: `src/testbed/rosetta.test.ts`.

## Relation to the Literal Separation

Base36 is the alphabet that the block bits cut out ([[SPEC-36 The Literal Separation]], *Why Base36*). Here it carries the meter, the one numeric part, between the two encodings of the name.

## Found in `rfc.ts`

`base36Decode()` returns `meter.toString(36)`, the same as `base36Encode()`. Decoding should be `parseInt(text, 36)`; for example, decoding `"1o"` gives back 60 ([[OPEN-02 Broken Code Inventory]] #25). `catalog.ts` uses the correct decode.

## Open

- ⟦What is the meter in a catalog entry: the block, an index into the Blob, a 240-clock tick?⟧
- ⟦Should base32 and base64 encode the same name, or, as "base32 ? base36 = base64" might read, should one side be derived from the other?⟧
