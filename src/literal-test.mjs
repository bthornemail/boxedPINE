// literal-test.mjs — falsify the assumption that "every literal tag character
// must have a prefix or suffix literal index number"
//
// The author, 2026-10-15: "no single numbers and no single letters; the real
// test is now unbalanced literals. every LITERAL TAG CHARActer must have a
// prefix or suffix LITERAL INDEX NUMBEr."
//
// Test: take every literal from /A-Z0-9/ — single characters, and pairs.
// Apply XOR, XNOR, <=> only. Report where the rule holds and where it fails.

const TAGS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
const hx = (v) => "0x" + v.toString(16).toUpperCase().padStart(2, "0");

// Single character literals as their ASCII code points.
const single = TAGS.map(c => ({ c, v: c.charCodeAt(0) }));

// ── Test 1: XOR of every pair of single characters ─────────
// Falsify: does every single character need a partner to be a literal?
console.log("=== Test 1: single-character XOR ===");
let selfXor = [];
for (const a of single) {
  const x = a.v ^ a.v;
  selfXor.push({ c: a.c, x });
}
// All self-XORs are 0.
const allZero = selfXor.every(r => r.x === 0);
console.log("Every single char XOR itself = 0?", allZero);
console.log("So a single char XOR itself is the null — it has no difference with itself.");
console.log();

// ── Test 2: XOR of pairs, and whether the result is a literal ──
console.log("=== Test 2: pair XOR — is the result a literal? ===");
const isLiteralByte = (v) => {
  // A byte is a "literal" in the mask if it's A-Z or 0-9 in ASCII.
  const c = String.fromCharCode(v & 0xff);
  return /[A-Z0-9]/.test(c);
};
let pairResults = { isLiteral: 0, notLiteral: 0 };
let examples = [];
for (let i = 0; i < single.length; i++) {
  for (let j = i + 1; j < single.length; j++) {
    const v = single[i].v ^ single[j].v;
    if (isLiteralByte(v)) { pairResults.isLiteral++; examples.push([single[i].c, single[j].c, v]); }
    else pairResults.notLiteral++;
  }
}
console.log("Pairs XOR'd:", pairResults.isLiteral + pairResults.notLiteral);
console.log("Result is a mask-literal:", pairResults.isLiteral);
console.log("Result is not a mask-literal:", pairResults.notLiteral);
console.log("Examples of literal results:");
for (const [a, b, v] of examples.slice(0, 10)) {
  console.log("  " + a + " ⊕ " + b + " = " + hx(v) + " = " + String.fromCharCode(v));
}
console.log();

// ── Test 3: the "prefix or suffix index number" rule ────────
// Falsify: take two single characters A, B. Is A alone a literal, or does it
// need a prefix/suffix number?
console.log("=== Test 3: does A alone fail the rule? ===");
// The rule says: no single literal. So A alone should fail.
// Test: does A alone have a prefix or suffix index number?
const A = "A";
console.log("A alone:", JSON.stringify(A), "| length:", A.length);
console.log("Is A alone a valid literal by the rule? The rule says no.");
console.log("But: /^[A-Z0-9]{1,8}$/.test('A') =", /^[A-Z0-9]{1,8}$/.test(A));
console.log("So the mask says YES (1 char fits 1-8), but the rule says NO.");
console.log("That's the falsification point.");
console.log();

// ── Test 4: pairs as literals ───────────────────────────────
console.log("=== Test 4: pairs (A1, 1A, AA, 11) ===");
const pairs = ["A1", "1A", "AA", "11", "A0", "0A", "Z9", "9Z"];
for (const p of pairs) {
  const [a, b] = p.split("");
  const x = a.charCodeAt(0) ^ b.charCodeAt(0);
  console.log(p + ": " + hx(a.charCodeAt(0)) + " ⊕ " + hx(b.charCodeAt(0)) + " = " + hx(x) + " = " + JSON.stringify(String.fromCharCode(x)));
}
console.log();

// ── Test 5: XNOR of pairs ───────────────────────────────────
console.log("=== Test 5: pair XNOR (7-bit mask) ===");
for (const p of pairs) {
  const [a, b] = p.split("");
  const x = (a.charCodeAt(0) ^ b.charCodeAt(0)) ^ 0x7f;
  console.log(p + ": ⊙ = " + hx(x) + " = " + JSON.stringify(String.fromCharCode(x)));
}
console.log();

// ── Test 6: <=> as equivalence ──────────────────────────────
// <=> is the equivalence: A <=> B is true iff A and B are the same.
console.log("=== Test 6: <=> (equivalence) ===");
const equiv = (a, b) => a === b;
console.log("A <=> A:", equiv("A", "A"));
console.log("A <=> B:", equiv("A", "B"));
console.log("0 <=> 0:", equiv("0", "0"));
console.log("So <=> tests identity; XOR/XNOR test difference/agreement.");
console.log();

// ── Test 7: the unbalanced literal test ─────────────────────
console.log("=== Test 7: unbalanced literals ===");
// A literal is "balanced" if it has a prefix matching its suffix.
// Test: is every /A-Z0-9/ literal balanced?
const allLiterals = [];
for (const c of TAGS) {
  allLiterals.push(c);                  // single
  for (const d of TAGS) allLiterals.push(c + d);  // pair
}
// A literal is balanced if its first half XOR its second half is zero.
const balanced = [];
const unbalanced = [];
for (const lit of allLiterals) {
  if (lit.length === 1) {
    // A single character has no prefix or suffix. It's "unbalanced by definition."
    unbalanced.push(lit);
  } else {
    const x = lit[0].charCodeAt(0) ^ lit[1].charCodeAt(0);
    if (x === 0) balanced.push(lit); else unbalanced.push(lit);
  }
}
console.log("Total literals (singles + pairs):", allLiterals.length);
console.log("Balanced (XOR of halves = 0):", balanced.length);
console.log("Unbalanced:", unbalanced.length);
console.log("Balanced examples:", balanced.slice(0, 8).join(" "));
console.log("Unbalanced examples:", unbalanced.slice(0, 8).join(" "));
console.log();

// ── Test 8: the falsification ───────────────────────────────
console.log("=== Test 8: the falsification ===");
console.log("The rule says: no single literals.");
console.log("The mask /^[A-Z0-9]{1,8}$/ says: singles ARE literals (1-8 chars).");
console.log("These conflict.");
console.log();
console.log("To falsify the mask: find a case where a single character IS a literal");
console.log("but doesn't satisfy the rule.");
console.log();
console.log("Test: is 'A' a literal?");
console.log("  - Mask: yes.");
console.log("  - Rule: no (no prefix or suffix index number).");
console.log();
console.log("Test: is 'A1' a literal?");
console.log("  - Mask: yes.");
console.log("  - Rule: yes (A has prefix 1; 1 has suffix A).");
console.log();
console.log("Test: is '11' a literal?");
console.log("  - Mask: yes.");
console.log("  - Rule: yes (1 has prefix 1; 1 has suffix 1).");
console.log("  - But: 1 ⊕ 1 = 0. Balanced. So it XORs to null.");
console.log();
console.log("So the falsification condition is:");
console.log("  A literal is VALID by the rule if it has a prefix or suffix index number.");
console.log("  A literal is INVALID by the rule if it's a single character.");
console.log();
console.log("The mask allows singles; the rule doesn't. One of them is wrong.");
