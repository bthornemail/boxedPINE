---
id: SRC-14
title: "Polytron, the Commons and the Cave"
kind: source
layer: sources
status: draft
spec: OMI-IMO-2026
up: "[[SRC-99 Source Index]]"
down: []
related:
  - "[[SRC-13 Provenance of the OMI Trees and the Metaverse Spine]]"
  - "[[SPEC-07 The Fundamental Invariants]]"
  - "[[OPEN-02 Broken Code Inventory]]"
  - "[[OPEN-04 Discarded Claims]]"
sources: []
code:
  - "space/src/gnomon.ts"
  - "space/src/story.ts"
  - "space/src/exchange.ts"
  - "space/src/trace.ts"
  - "space/src/identity.ts"
  - "rosetta/src/tag-type.ts"
  - "rosetta/src/canvasl.ts"
  - "scripts/adventure-map.mjs"
dimensions: []
symbols: []
tags: [omi-imo, source, polytron, light-garden, commons, tags, cave, sexagesimal]
---

# Polytron, the Commons and the Cave

Recorded 2026-10-14, from the author's statements of 2026-10-13 and 2026-10-14 and what was checked against them. The author's own records I-201 to I-218 are in `src/` (see `src/README.md`), from the transcript `_archive/_chat_history/this is what im working on with a coding.md`. It says where the findings came from and what held; it defines nothing. The checks are in the proofs catalogue (I-195 to I-200) and in `src/testbed/space.test.ts`.

## Where the Work Came From

- **Polytron** is the author's own earlier stage of the protocol, a declarative metaverse paused to learn binary and hexadecimal: "it's how I learned I need to learn binary". Braille and Aegean characters had been used as Morse and tap code, and "the resolution was bad". Its kernel and gnomon hold (I-195, I-197); its faults are positions and widths (see [[OPEN-02 Broken Code Inventory]] #27–30).
- **Light Garden** is "another working toolset": the seed kernel SVG ("an SVG-based entry point, so it's transferable and can mutate into the story"), the epistemic square ("the 2D avatar meta frame for the 3D character"), the garden constellations ("my first attempt to make the logic clocks constellations in the XR space world"), the dome ("the gate for people to create their own images"), and the canon, "a full narrative that the agents can cycle decisions through like a choose your own adventure".
- **The old typed projects** (axiomatically-guaranteed-sovereignty, autonomous-identity, h2gnn, meta-log): "I started with types". The author: "the misconception is we have to wire it, but the structure is the XOR or XNOR proof that the agents tree themselves based on narrative semantics and syntax".
- **Tetragrammatron**: "I used tetragrammatron to not be blasphemous, because I was compartmentalising, or computing, the tetragrammaton"; "modelling tetragrammatron as a four bit meta circular adder with Metatron the global witness, based on the Bible"; "the bible being one of the most ubiquitously known texts was the perfect mask to view the future and past", "so people see we self-define GOD in the word-is-god".

## What Held

| Statement | What was found |
|---|---|
| "omg it was here this whole time" (the gnomon) | polytron's K(p, 0x1D) from 0x4242: eight states, each SID the next state, the eighth the seed; every one of the 65,536 states has period 8 (I-195) |
| "the polytron is a polynomial automaton" | K(p, C) = (x + x³ + x¹⁴)·p + C over GF(2)[x]/(x¹⁶ + 1); the polynomial's 8th power is 1 (I-197) |
| "the 20 40 60 80 was why … character encoding of octal precision" | braille's decades add 0x00, 0x04, 0x24, 0x20; dot 6 is ASCII's case bit; a byte's top three bits are one octal digit (I-196) |
| "Steiner triplets and knowledge triples had me rooted to s-p-o" | the seven Fano line masks are exactly the triples with S ⊕ P ⊕ O = 0 (I-198) |
| "138 synsets under color + 7 is 145, or 144 + 1 globalThis" | WordNet's *color*: 138 below, itself, 5 above to *entity* = 144 (I-199) |
| "so at index 777" | 0o777 = 511 = E7's tag; one more carries every digit, 0o1000 = 512 = E8's (I-200) |
| "the proofs say 63 and 127" | the exchange is compareExchange(svg, 60 ⊕ frame, 127, 63) on 128 bytes of 127, as I-133; one bit (0x40) trades |
| "the reset … at the uncanny Catch 22 index" | byte 22 comes at frame 60 ⊕ 22 = 42; read as hex, 0x22 = 0o42 and carries the space bit; byte 22 is pair 11 |
| "CATCH 22 with the space … becomes a command pair" | CATCH and 22 are two tags; CATCH n sets the reset's index |
| "lower to upper promotes a subject to an object" | a word and its tag differ by 0x20 in every letter: the predicate between subject and object is the space |
| "the port can be the 4-bit parity header" | in a block of 16 ports each nibble parity comes once; the hub's 8743 is parity 5, METATRON's port 8745 |
| "the leap year is tied to the floating point" | the year's fraction 0.242189 has the convergent 31/128, a power-of-two denominator; the Julian rule drifts a day every 128 years |
| "so the game is a proof tree" | open-adventure reads words by their first five letters (five 7-bit characters fill a PDP-10's 36-bit word); a seed and a log replay exactly; 57 rooms deciphered by movement alone, every route validated by replay |
| the tetragrammaton as a four-bit adder | Yod 10 + He 5 + Vav 6 + He 5 = 26 = one carry + 10, the nibble of Yod; Yod ⊕ He = 1111 |
| "she becomes the tag ANGEL" (I-216) | ANGELA's letters XOR to NUL; ANGEL is its first five, and ANGELA ⊕ ANGEL = `a`; G, L, E of GLUE are in her name, not U; the identity as 4 + 8 + 4 = 16 termed pixels; a colour shows a tag but three bits cannot identify it |
| "the shift being held is PROPAgation" (I-216) | a held Shift is one state carried to every key: over g.l.u.e. it gives G>L>U>E> (0x10 on the stop, 0x20 on letters, the bit-paired keyboard); holding it again changes nothing |
| "SUBJECT-LOGIC-OBJECT is the face reflected" (I-217) | aligned from the right, SUBJECT ⊕ OBJECT = `s`, SUB, five nulls: the face BJECT cancels and any five-letter predicate passes whole; LOGIC ⊕ PIXEL = FS ACK US FF SI. Not a Steiner triple strictly: S ⊕ P ⊕ O is not 0 |
| "for an illogical awakening, a catch-22" (I-218) | the author's capitals cut at five (LOGIC, AWAKE, REVEL, PROPA, ILLOG); on the teletype Shift + 2 types `"` = 0x22 = 0o42, the reset's frame; SHIFT folds to 0x40 |
| "American English as a mnemonic language" | ASCII is the American Standard Code: the case bit, the shift bit and the five-letter parser are all American code and keyboard |

## What Did Not Hold, or Was a Coincidence

See [[OPEN-04 Discarded Claims]] #36–42. Among them: the food-label numbers (Red 40, Yellow 6, Blue 1) are FD&C dye catalogue numbers, not colour arithmetic; Lie algebras are named for Sophus Lie.

## Open

- The hints as a global mask did not yet open the cave's walls; an ordered search (cage, bird, rod) is the next step.
- Light Garden's kernel line table and the square's plane disagree; the square's (cyclic) plane is used.
- PROCEDURAL (10 letters) and the other words over 8 letters cannot be promoted to tags.
