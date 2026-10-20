const hx = (s) => [...s].map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" "); const pad = (s, n) => s.padEnd(n, " "); const xor = (a, b) => { const n = Math.max(a.length, b.length); const A = pad(a, n), B = pad(b, n); return [...A].map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ B.charCodeAt(i))).join(""); }; const xnor = (a, b, mask = 0x7f) => [...xor(a, b)].map(c => String.fromCharCode(mask ^ c.charCodeAt(0))).join("");
const G = "GOD IS WORD";
const W = "WORD IS GOD";
console.log("GOD IS WORD:", hx(G), "| len:", G.length);
console.log("WORD IS GOD:", hx(W), "| len:", W.length);
console.log();
console.log("GOD IS WORD ⊕ WORD IS GOD =", hx(xor(G, W)));
console.log("GOD IS WORD ⊙ WORD IS GOD =", hx(xnor(G, W)));
console.log();
console.log("as chars (XOR): ", JSON.stringify(xor(G, W)));
console.log("as chars (XNOR 7-bit):", JSON.stringify(xnor(G, W)));
console.log();
console.log("=== The triple, checked ===");
// GOD, IS, WORD as tags.
const g = "GOD", is_ = "IS", w = "WORD";
console.log("GOD ^ IS ^ WORD (pad to 4):", hx(xor("GOD ", xor("IS ", "WORD"))));
console.log("GOD ^ IS :", hx(xor("GOD ", "IS ")));
console.log("IS ^ WORD:", hx(xor("IS ", "WORD")));
console.log("GOD ^ WORD:", hx(xor("GOD ", "WORD")));
console.log();
console.log("=== The two sentences, word by word ===");
const gWords = G.split(" ");
const wWords = W.split(" ");
for (let i = 0; i < gWords.length; i++) {
console.log(gWords[i].padEnd(6), "^", wWords[i].padEnd(6), "=", hx(xor(gWords[i], wWords[i])));
}
console.log();
console.log("=== The shared letters ===");
console.log("GOD IS WORD and WORD IS GOD share: the letters G O D I S W R");
console.log("GOD has G O D");
console.log("IS has I S");
console.log("WORD has W O R D");
console.log();
console.log("=== XOR the triple as a Steiner line ===");
// Use A1Z26 values.
const az = (s) => [...s].reduce((x, c) => x ^ (c.charCodeAt(0) - 64), 0);
console.log("GOD A1Z26 XOR:", az("GOD"), "= 0x" + az("GOD").toString(16));
console.log("IS A1Z26 XOR:", az("IS"), "= 0x" + az("IS").toString(16));
console.log("WORD A1Z26 XOR:", az("WORD"), "= 0x" + az("WORD").toString(16));
console.log("GOD ^ IS ^ WORD (A1Z26):", az("GOD") ^ az("IS") ^ az("WORD"));
console.log();
console.log("=== Does the triple close? ===");
console.log("For a Steiner line {a,b,c} with a^b^c = 0, we need the XOR to be 0.");
console.log("The byte-wise XOR of the full sentences gave:", hx(xor(G, W)));