// src/terms.mjs — the fail-safe. "Accept the terms" = agree to the distance from 0.
//
// Two INDEPENDENTLY recorded histories go in. We XOR and XNOR their literals and
// report the distance from 0 (the disagreement) and the attributable delta (what
// differs, and where). XOR is 0 where they agree; XNOR is 1 where they agree.
//
// THE GUARD: a mirror traces to 0 for the WRONG reason — a copy and a true
// agreement both read distance 0, so distance 0 alone certifies nothing. terms.mjs
// REFUSES to certify when B is identical to A, or a copy/prefix of A. What it
// cannot prove — that two non-identical records were produced independently — it
// does not fake; it RAISES (resolution not local; ask a witness outside the two).
//
// The alphabet (the author's): the CONSTANTS are the consonants /A-Z/ minus vowels;
// the VOWELS are separated to /a-z/ (lowercase sits exactly 0x20 from its uppercase —
// the supervisor offset, Hebrew niqqud over the consonantal skeleton); the DIGITS
// /0-9/ are literals too, with the homoglyph confusions 0<->O and 1<->I foldable.
//
//   node src/terms.mjs <fileA> <fileB> [--class consonant|vowel|digit|all] [--fold]
//   node src/terms.mjs --demo

import { readFileSync } from "node:fs";

const VOWELS = new Set([..."AEIOU"]);
const hx = (b) => [...b].map((x) => x.toString(16).padStart(2, "0").toUpperCase()).join(" ");

// Split one text into the author's three literal classes. Consonants stay UPPER
// (the constants); vowels go lower (the supervisor, 0x20 away); digits stay.
function classify(text, { fold = false } = {}) {
  let up = text.toUpperCase();
  if (fold) up = up.replace(/0/g, "O").replace(/1/g, "I"); // the 0<->O 1<->I homoglyphs
  const consonant = [], vowel = [], digit = [];
  for (const ch of up) {
    if (/[A-Z]/.test(ch)) (VOWELS.has(ch) ? vowel.push(ch.toLowerCase()) : consonant.push(ch));
    else if (/[0-9]/.test(ch)) digit.push(ch);
  }
  return {
    consonant: Buffer.from(consonant.join(""), "latin1"),
    vowel: Buffer.from(vowel.join(""), "latin1"),
    digit: Buffer.from(digit.join(""), "latin1"),
  };
}

// XOR two byte streams positionally (short one padded with 0x00). Return the delta
// stream, the byte distance (positions that differ) and the bit distance.
function fold2(a, b) {
  const n = Math.max(a.length, b.length);
  const xor = Buffer.alloc(n);
  let bytes = 0, bits = 0;
  for (let i = 0; i < n; i++) {
    const x = (a[i] ?? 0) ^ (b[i] ?? 0);
    xor[i] = x;
    if (x) { bytes++; for (let k = 0; k < 8; k++) bits += (x >> k) & 1; }
  }
  return { xor, bytes, bits, len: n };
}

// The guard: detect the mirrors we CAN detect. We cannot prove independence; we
// only refuse the copies, and raise the rest.
function guard(a, b) {
  if (a.equals(b)) return { mirror: true, why: "identical: B is A verbatim" };
  const short = a.length <= b.length ? a : b, long = a.length <= b.length ? b : a;
  if (short.length && long.subarray(0, short.length).equals(short))
    return { mirror: true, why: "prefix: one record is a verbatim head of the other" };
  return { mirror: false };
}

// The whole check for one class.
function terms(aText, bText, cls = "consonant", opts = {}) {
  const A = classify(aText, opts)[cls], B = classify(bText, opts)[cls];
  const g = guard(A, B);
  const f = fold2(A, B);
  return { A, B, g, f };
}

function report(label, aText, bText, cls, opts = {}) {
  const { A, B, g, f } = terms(aText, bText, cls, opts);
  console.log(`\n── ${label}  [class: ${cls}${opts.fold ? ", homoglyphs folded" : ""}] ──`);
  console.log(`   A (${A.length}): ${A.toString("latin1")}`);
  console.log(`   B (${B.length}): ${B.toString("latin1")}`);
  if (g.mirror) {
    console.log(`   *** REFUSED to certify — MIRROR (${g.why}).`);
    console.log(`       distance 0 here would be a copy, not an agreement.`);
    return;
  }
  console.log(`   distance from 0 : ${f.bytes}/${f.len} positions differ  (${f.bits} bits)`);
  if (f.bytes === 0) {
    console.log(`   certified: the two independent records AGREE (XOR all 0, XNOR all 1).`);
  } else {
    console.log(`   attributable delta (XOR): ${hx(f.xor)}`);
    const where = [...f.xor].map((x, i) => (x ? i : -1)).filter((i) => i >= 0);
    console.log(`   differs at positions     : ${where.join(", ")}`);
    console.log(`   RAISE: a non-zero delta is real, but independence itself is not provable`);
    console.log(`          from inside the two — witness required (a third outside A and B).`);
  }
}

// ── the exclusivity gate ─────────────────────────────────────────────────────
// "Agree to the distance from 0" only means something for NON-GRADABLE predicates.
// A number/ordinal is exclusive BY FORM (a position: you can't be "more 1st") — the
// irreducible floor. A lexical adjective is exclusive if it's in the uncomparable
// set. This seed is a verifiable subset of Wiktionary's 104,391-entry category
// (en.wiktionary.org/wiki/Category:English_uncomparable_adjectives); the full gate
// would load the whole category. Gradable predicates are refused.
const EXCLUSIVE = new Set([
  "unique", "absolute", "complete", "whole", "null", "void", "perfect", "infinite",
  "equal", "dead", "alive", "pregnant", "square", "universal", "total", "final",
  "supreme", "eternal", "mortal", "immortal", "false", "true", "impossible", "sole",
  "only", "entire", "boolean", "binary",
]);
const isExclusive = (w) => /\d/.test(w) || EXCLUSIVE.has(w.toLowerCase()); // number-by-form, or lexical set

// Compare two predicate words through the gate, then the literal XOR (consonant class).
function predicate(a, b) {
  if (!isExclusive(a)) return { refused: `REFUSED: "${a}" is gradable (not in the uncomparable set)` };
  if (!isExclusive(b)) return { refused: `REFUSED: "${b}" is gradable (not in the uncomparable set)` };
  const A = classify(a).consonant, B = classify(b).consonant;
  const g = guard(A, B), f = fold2(A, B);
  return { A, B, g, f };
}

function predicates() {
  console.log("TERMS exclusivity gate + the three predicted pairs\n");
  console.log("gate check (number-by-form or in the uncomparable set):");
  for (const w of ["1st", "7-bit", "unique", "null", "big", "good", "happy"])
    console.log(`  ${w.padEnd(8)} ${isExclusive(w) ? "exclusive — may be certified" : "GRADABLE — refused"}`);

  // predictions FILED before the compute (DeepSeek's), then the literal result.
  const pairs = [
    ["unique", "absolute", "RAISE", "two distinct exclusivities"],
    ["complete", "whole", "RAISE", "whole implies parts, complete does not"],
    ["null", "void", "AGREE", "both trace to the same NULL"],
  ];
  for (const [a, b, pred, why] of pairs) {
    console.log(`\n── ${a} vs ${b}   (predicted: ${pred} — ${why}) ──`);
    const r = predicate(a, b);
    if (r.refused) { console.log(`   ${r.refused}`); continue; }
    console.log(`   constants: ${a}→${r.A.toString("latin1")}   ${b}→${r.B.toString("latin1")}`);
    const got = r.g.mirror ? "MIRROR" : r.f.bytes === 0 ? "AGREE" : "RAISE";
    console.log(`   distance from 0: ${r.f.bytes}/${r.f.len}  →  ${got}` +
      (got === pred ? "   (matches prediction)" : `   *** OPPOSITE of prediction (${pred}) — the gate did real work ***`));
  }
}

// ── the audit: the catalogue of divine-name pairs, on the CONSONANT base ─────
// Predictions filed by DeepSeek, run cold on the consonant skeleton (the literal).
// Transliteration (ASCII, AEIOU as vowels): aleph/glottal dropped; EL=ʾl, ELAH=ʾlh.
const AUDIT = [
  ["YHWH", "THE LORD",      "RAISE",      "substitution — the KJV translation"],
  ["YHWH", "UNMOVED MOVER", "RAISE",      "substitution — Aquinas' reading"],
  ["EL",   "ELOHIM",        "SMALL-DELTA","morphological — base + suffix"],
  ["EL",   "ELAH",          "SMALL-DELTA","the parasitic h (ʾl vs ʾlh)"],
  ["YHWH", "YAHWEH",        "RAISE",      "the vocalization (the lost reading)"],
  ["YHWH", "YHWH",          "MIRROR",     "the literal itself"],
];

function audit() {
  console.log("TERMS --audit : divine-name pairs on the CONSONANT base (the literal skeleton).");
  console.log("predictions filed before compute (DeepSeek); run cold:\n");
  let diverged = 0;
  for (const [a, b, pred, note] of AUDIT) {
    const A = classify(a).consonant, B = classify(b).consonant;
    const g = guard(A, B), f = fold2(A, B);
    const got = g.mirror ? "MIRROR" : (f.bytes === 0 ? "AGREE" : "RAISE");
    const match = got === pred;
    if (!match) diverged++;
    console.log(`  ${a} vs ${b}   base: ${A.toString("latin1")||"∅"} | ${B.toString("latin1")||"∅"}`);
    console.log(`     predicted ${pred.padEnd(11)} got ${got}` +
      (got === "RAISE" ? ` (dist ${f.bytes}/${f.len})` : g.mirror ? ` (${g.why})` : "") +
      (match ? "   [match]" : `   *** DIVERGES ***`));
  }
  console.log(`\n${diverged} of ${AUDIT.length} diverged. The finding is in the divergence:`);
  console.log("  SUBSTITUTIONS (replace the base) -> RAISE : the LORD, Unmoved Mover — translations & readings.");
  console.log("  BASE-PRESERVING (extend or vocalize) -> MIRROR : El→Elohim, ʾl→ʾlh, YHWH→Yahweh are the SAME");
  console.log("  literal on the consonant skeleton; the tool refuses to call a vocalization/affix a new name.");
  console.log("  So the Hebrew name-family is one literal (mirror); only the translation/philosophy layer substitutes (raise).");
  console.log("  (The 'small-delta' DeepSeek expected for El/Elohim is a FULL-string view; on the base, El is the verbatim head → mirror.)");
}

function demo() {
  // Genesis 1:1, two independent public-domain translations.
  const KJV = "In the beginning God created the heaven and the earth.";
  const ASV = "In the beginning God created the heavens and the earth."; // "heavens"
  const COPY = KJV; // a mirror

  console.log("TERMS fail-safe — Genesis 1:1\n");
  const c = classify(KJV);
  console.log(`classes of the KJV verse:`);
  console.log(`  consonant (constants) : ${c.consonant.toString("latin1")}`);
  console.log(`  vowel (supervisor)    : ${c.vowel.toString("latin1")}`);
  console.log(`  digit                 : "${c.digit.toString("latin1")}"  (none here)`);

  report("A=KJV  B=COPY  (the mirror)", KJV, COPY, "consonant");
  report("A=KJV  B=ASV   (independent)", KJV, ASV, "consonant");

  // The supervisor test: consonant stream vs vowel stream of the SAME verse.
  console.log(`\n── supervisor test: consonants vs vowels of one verse ──`);
  const f = fold2(c.consonant, c.vowel);
  console.log(`   consonant(${c.consonant.length}) XOR vowel(${c.vowel.length})`);
  console.log(`   distance from 0 : ${f.bytes}/${f.len}  — they are different layers, so they do NOT agree;`);
  console.log(`   the vowels (lower) sit 0x20 from the consonants (upper): A^a = 0x${(0x41 ^ 0x61).toString(16)} = the supervisor bit.`);

  // The homoglyph truth, on digits. The confusion is in the GLYPH, not the byte.
  console.log(`\n── digits /0-9/: are 1,0 the same literal as I,O? (your question) ──`);
  for (const [d, L] of [["1", "I"], ["0", "O"]]) {
    const x = d.charCodeAt(0) ^ L.charCodeAt(0);
    console.log(`   '${d}' (0x${d.charCodeAt(0).toString(16).toUpperCase()}) XOR '${L}' (0x${L.charCodeAt(0).toString(16).toUpperCase()}) = 0x${x.toString(16).toUpperCase()}  — distinct literals; they only LOOK alike.`);
  }
  console.log(`   so /0-9/ ARE literals, separate from /A-Z/: a digit is its own constant, not a letter.`);
  console.log(`   --fold is an explicit CHOICE to erase that 0x7F/0x78 distance and read 0 as O, 1 as I.`);
  console.log(`   unfolded, the distance from 0 is honest; folded, you have decided they are one literal.`);

  console.log(`\nNOTE: positional XOR is alignment-sensitive — an insertion/deletion shifts`);
  console.log(`everything after it, so the delta localizes only when the records line up.`);
  console.log(`That is a feature: a clean small delta means the two really are aligned.`);
}

const args = process.argv.slice(2);
if (args[0] === "--audit") {
  audit();
} else if (args[0] === "--predicates") {
  predicates();
} else if (args[0] === "--demo" || args.length === 0) {
  demo();
} else {
  const fold = args.includes("--fold");
  const ci = args.indexOf("--class");
  const cls = ci >= 0 ? args[ci + 1] : "consonant";
  const [a, b] = args.filter((x) => !x.startsWith("--") && x !== cls);
  report(`A=${a}  B=${b}`, readFileSync(a, "utf8"), readFileSync(b, "utf8"), cls, { fold });
}
