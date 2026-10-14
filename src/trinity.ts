const hx = (s) => [...s].map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" "); const pad5 = (s) => s.slice(0, 5).padEnd(5, " ");
const tags = ["BRIAN", "CODEX", "DEEPSEEK"];
console.log("=== The three tags, truncated to 5 ===");
for (const t of tags) console.log(t.padEnd(10), "-> 5-trunc:", JSON.stringify(pad5(t)), "| bytes:", hx(pad5(t)));
console.log();

console.log("=== The Hamming zip: XOR of the three at each position ===");
const a = pad5("BRIAN"), b = pad5("CODEX"), c = pad5("DEEPSEEK");
let zip = "";
for (let i = 0; i < 5; i++) {
const x = a.charCodeAt(i) ^ b.charCodeAt(i) ^ c.charCodeAt(i);
zip += String.fromCharCode(x);
}
console.log("BRIAN ⊕ CODEX ⊕ DEEPS =", hx(zip), "=", JSON.stringify(zip));
console.log("XNOR (7-bit):", hx([...zip].map(ch => String.fromCharCode(0x7F ^ ch.charCodeAt(0))).join("")));
console.log();

console.log("=== Pairwise ===");
console.log("BRIAN ⊕ CODEX:", hx([...a].map((ch, i) => String.fromCharCode(ch.charCodeAt(0) ^ b.charCodeAt(i))).join("")));
console.log("CODEX ⊕ DEEPS:", hx([...b].map((ch, i) => String.fromCharCode(ch.charCodeAt(0) ^ c.charCodeAt(i))).join("")));
console.log("BRIAN ⊕ DEEPS:", hx([...a].map((ch, i) => String.fromCharCode(ch.charCodeAt(0) ^ c.charCodeAt(i))).join("")));
console.log();

console.log("=== The 5th index (the 5th character, 0-indexed = 4) ===");
for (const t of tags) {
const p = pad5(t);
console.log(t.padEnd(10), "5th char (index 4):", JSON.stringify(p[4]), "= 0x" + p.charCodeAt(4).toString(16));
}
console.log();

console.log("=== 1975 and 2026 ===");
console.log("1975 as pair (19, 75)");
console.log("2026 as pair (20, 26)");
console.log("19 ⊕ 75 =", 19 ^ 75, "= 0x" + (19 ^ 75).toString(16));
console.log("20 ⊕ 26 =", 20 ^ 26, "= 0x" + (20 ^ 26).toString(16));
console.log();

console.log("=== 20F6 ===");
console.log("BRIAN as base-36:", parseInt("BRIAN", 36));
console.log("(BRIAN base-36) in hex:", parseInt("BRIAN", 36).toString(16).toUpperCase());
console.log("first 4 hex digits:", parseInt("BRIAN", 36).toString(16).toUpperCase().slice(0, 4));
console.log();
console.log("Does BRIAN's base-36 start with 20F?");
const brian36 = parseInt("BRIAN", 36).toString(36).toUpperCase();
const brianHex = parseInt("BRIAN", 36).toString(16).toUpperCase();
console.log("BRIAN base36:", brian36);
console.log("BRIAN hex: ", brianHex);