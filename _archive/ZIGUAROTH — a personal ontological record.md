# ZIGUAROTH — a personal ontological record

**Brian James Thorne, 2026-10-15.**

A personal, ontological record — about the author's own name and digital avatar,
not about the distributed-logic project. It is kept **separate from the I-records
and the protocol vault on purpose**: those are findings about the computation;
this is about a person. The arithmetic below is verified and anyone can rerun it;
the readings are the author's own, held as his, and named as readings — the same
discipline the project keeps (the arithmetic is the anchor; the meaning is Brian's).

---

## The verified arithmetic (rerunnable)

ASCII, 0-based slots, bitwise XOR:

- `MER ⊕ NER = 03 00 00`; overlaid on `AMERICA` → `42 4D 45 52 49 43 41` = **BMERICA** (the leading A→B by the 0x03 M/N delta).
- `YES ⊕ NO = 17 0A 53` = ETB, LF, `S`.
- `MER ⊕ NER ⊕ AMERICA ⊕ YES ⊕ NO = 55 47 16 52 49 43 41` = **U G \x16 R I C A** — landing on **0x55** and **0x16 (22)**, the frame constants of I-225 (the project record "22 55 — the 2 and 5 of the base").
- `THOTH ⊕ THOR ⊕ THORNE = 54 48 4F 54 06 45` = **T H O T \x06 E** — "THOT", then ACK (0x06), then E. (T, H, O are invariant across the three; slot 3 keeps T; slot 4 is ACK; slot 5 is E from THORNE's `-NE`.)
- `ZIGUA ⊕ ROTH = 08 06 13 1D 41` = **\x08 \x06 \x13 \x1D A**. Byte order is `08 06 13 1D` (slot 3 = 0x13/19, slot 4 = 0x1D/29), with a trailing 0x41 = A.
- Hamming distance over 5-letter tags (40 bits) to the avatar prefix `ZIGUA`: `JAMES` **7/40**, `THORN` **12/40**, `BRIAN` **15/40**.
- `ROTH` is a character permutation of `THOR` (inside `THORNE`).

### Two corrections to an earlier pass
- `ZIGUA ⊕ ROTH` is `08 06 13 1D` (+41), **not** `08 06 1D 13`: the last two bytes had been swapped, so the "delta-law cycle (0x1D)" and "start-marker (0x13)" labels sat on the wrong slots.
- `THOTH ⊕ THOR ⊕ THORNE` is `THOT\x06E` (six slots), **not** just `THOT\x06`: the earlier pass truncated at five slots and dropped THORNE's final E.

---

## The readings (Brian's own)

Held as the author's interpretation, not asserted as fact:

- **The avatar is the scribe-form of the name.** `ZIGUAROTH` = `ZIGUA` + `ROTH`; `ROTH` is `THOR` permuted; the `-OTH` is the scribe suffix (Thoth, the recorder of the weighing of the heart), the older root that H. P. Lovecraft borrowed and inverted into eldritch horror (Yog-Sothoth, Nyarlathotep). Brian reached for the scribe's share of the suffix as a child, not the horror's.
- **`THORNE` = TH-OR-NE = "the last of thought"** — the thought-digraph TH, the agent/branch OR, the negation -NE: thought carried to its boundary. The fold `THOT\x06E` is read as "thought, acknowledged" — the last thought is the written one.
- **`BRIAN` ~ BRAIN, `THORNE` ~ THRONE**: a made mind on a seat at the edge of thought; `JAMES` (Jacob) the hand that holds and wrestles. The full name read as a structural address — a sigil.
- **The name is an address, and an address is an identity** (the project's own doctrine). "Casting spells" as a child was reading one's own structural name and finding it real.
- **The Job / Lovecraft fork.** Both faced the same vast, indifferent structure. Lovecraft turned the glimpse into fear and propagated monsters — tags that never close. The scribe faces the structure and writes it down — tags that close to zero (the trace, the ACK, the finally-block). Brian is on the Job/scribe side: facing and recording, not fleeing into fear.
- **Walk vs. wonder.** Two who share the `-OTH` can *walk* (the tags close, they meet, the trace resolves) or *wonder* (the tags leave a residue, they drift). The author built walkable tags.

---

## The honest note

The arithmetic is the anchor; the readings are Brian's, and they are coherent.
This is a personal ontological record — about who the author is and the name he
carries — kept apart from the distributed-logic project by intention. It makes no
protocol claim. If a reading here is ever to become a project finding, it would
have to be filed as a falsifiable prediction and tested, like any I-record; until
then it stays here, as a person's record of his own name, honestly read.
