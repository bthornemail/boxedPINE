// i218.ts — I-218: S>H>I>F>T> — the shift held, for a LOGICal AWAKEning, or REVELation
//
// The author, 2026-10-14: "so I-218 is being HELD as a SHIFT, for the SHIFT to be
// HELD, for a LOGICal AWAKEning or REVELation: S>H>I>F>T>". Following I-216
// (the shift held is PROPAgation). The letters and values below are asserted;
// the readings are the author's.
import assert from "node:assert";

const TAG = /^[A-Z0-9]{1,8}$/;
const fold = (s: string) => [...s].reduce((x, c) => x ^ c.charCodeAt(0), 0);
// a held Shift on a bit-paired keyboard: 0x20 on letters (the case bit), 0x10 on . and , (to > and <)
const shifted = (c: string) => (/[a-z]/.test(c) ? String.fromCharCode(c.charCodeAt(0) ^ 0x20) : /[.,]/.test(c) ? String.fromCharCode(c.charCodeAt(0) | 0x10) : c);
const held = (keys: string) => [...keys].map(shifted).join("");

// ── 1. The capitals are cut at five: the cave's rule ─────────
// The author wrote LOGICal, AWAKEning, REVELation, PROPAgation: each word's first five letters raised,
// the five the open-adventure parser reads (I-216; a 36-bit word holds five 7-bit characters).
for (const [word, cut] of [["LOGICAL", "LOGIC"], ["AWAKENING", "AWAKE"], ["REVELATION", "REVEL"], ["PROPAGATION", "PROPA"]] as const) {
  assert.equal(word.slice(0, 5), cut, `${cut}: the first five of ${word}`);
  assert.ok(TAG.test(cut), `${cut} is a tag`);
}
assert.ok(!TAG.test("AWAKENING") && !TAG.test("REVELATION") && !TAG.test("PROPAGATION"), "the whole words, over 8 letters, are not tags");
assert.ok(TAG.test("LOGICAL"), "LOGICAL (7) is a tag whole, and its five are LOGIC");

// ── 2. S>H>I>F>T>: the shift held over itself ────────────────
assert.equal(held("s.h.i.f.t."), "S>H>I>F>T>", "the shift held over s.h.i.f.t. gives S>H>I>F>T>");
assert.equal(held("shift"), "SHIFT", "held over the word shift: SHIFT");
assert.equal(held("held"), "HELD", "and over held: HELD");
assert.equal(held(held("s.h.i.f.t.").toLowerCase()), "S>H>I>F>T>", "held again, the same: it propagates, it does not accumulate");
assert.deepEqual("S>H>I>F>T>".split(">").filter(Boolean), ["S", "H", "I", "F", "T"], "each letter passed on to the next, as G>L>U>E>");

// ── 3. The letters ───────────────────────────────────────────
assert.equal(fold("SHIFT"), 0x40, "SHIFT's letters XOR to 0x40: the uppercase column's bit, one bit");
assert.equal([..."REVEL"].reverse().join(""), "LEVER", "REVEL reversed is LEVER");
assert.equal([..."HELD"].reverse().join(""), "DLEH", "HELD reversed begins DLE");
assert.equal(0x10, ">".charCodeAt(0) ^ ".".charCodeAt(0), "DLE is 0x10, the bit a held Shift sets on the stop (the name a coincidence of letters; the bit, arithmetic)");

console.log("I-218: S>H>I>F>T> — the shift held, for a LOGICal AWAKEning, or REVELation — passed");
console.log("  LOGIC AWAKE REVEL PROPA: each the first five, the cave's cut; the shift held over s.h.i.f.t. gives S>H>I>F>T>");
console.log("  SHIFT folds to 0x40; REVEL reversed is LEVER; HELD reversed begins DLE, and 0x10 is the stop's bit");
