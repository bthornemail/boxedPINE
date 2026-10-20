const hx = (s) => [...s].map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" "); const pad = (s, n) => s.padEnd(n, " "); const xor = (a, b) => { const n = Math.max(a.length, b.length); const A = pad(a, n), B = pad(b, n); return [...A].map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ B.charCodeAt(i))).join(""); }; const xnor = (a, b, mask = 0x7f) => [...xor(a, b)].map(c => String.fromCharCode(mask ^ c.charCodeAt(0))).join("");
// The four terms
const T = "TERMS", S = "STREAM", t = "TERM", s = "STREAM";
console.log("=== The four terms ===");
for (const w of ["TERMS", "STREAM", "TERM", "STREAM"]) {
console.log(w.padEnd(7), "len:", w.length, "| tag?", /^[A-Z0-9]{1,8}$/.test(w), "| bytes:", hx(w));
}
console.log();

// TERMS vs STREAM
console.log("TERMS ^ STREAM =", hx(xor(T, S)));
console.log("TERMS ⊙ STREAM =", hx(xnor(T, S)));
console.log();

// TERM vs STREAM
console.log("TERM ^ STREAM =", hx(xor(t, s)));
console.log("TERM ⊙ STREAM =", hx(xnor(t, s)));
console.log();

// TERMS vs TERM (plural vs singular)
console.log("TERMS ^ TERM =", hx(xor(T, t)));
console.log("STREAM ^ STREAM =", hx(xor(s, s)), "(trivially 0)");
console.log();

// The four readings
console.log("=== The four readings ===");
console.log("TERMS has/is STREAM :", xor(T, S));
console.log("STREAM has/is TERMS :", xor(S, T));
console.log("TERM has/is STREAM :", xor(t, s));
console.log("STREAM has/is TERM :", xor(s, t));
console.log();

// XOR the two directions
console.log("=== XOR the two directions ===");
console.log("(TERMS→STREAM) ⊕ (STREAM→TERMS) =", hx(xor(xor(T, S), xor(S, T))), "(trivially 0)");
console.log();
console.log("=== XOR vs XNOR ===");
console.log("TERMS ⊕ STREAM =", hx(xor(T, S)));
console.log("TERMS ⊙ STREAM =", hx(xnor(T, S)));
console.log("XOR ^ XNOR =", hx(xor(xor(T, S), xnor(T, S))), "(all 1s, the complement)");
console.log();

// A1Z26
const az = (s) => [...s].reduce((x, c) => x + (c.charCodeAt(0) - 64), 0);
const azx = (s) => [...s].reduce((x, c) => x ^ (c.charCodeAt(0) - 64), 0);
console.log("=== A1Z26 ===");
for (const w of ["TERMS", "STREAM", "TERM"]) {
console.log(w.padEnd(7), "sum:", az(w), "xor:", azx(w));
}
console.log();
console.log("TERMS sum ^ STREAM sum =", az("TERMS") ^ az("STREAM"));
console.log("TERMS xor ^ STREAM xor =", azx("TERMS") ^ azx("STREAM"));