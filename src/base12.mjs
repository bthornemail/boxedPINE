const b12 = (n) => { let out = ""; n = Math.abs(n); if (n === 0) return "0"; while (n > 0) { out = "0123456789AB"[n % 12] + out; n = Math.floor(n / 12); } return out; }; const from12 = (s) => { let v = 0; for (const c of s) { const d = "0123456789AB".indexOf(c); if (d < 0) return NaN; v = v * 12 + d; } return v; }; const hx = (s) => [...s].map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" ");
console.log("=== Years in base 12 ===");
for (const y of [1884, 1897, 1985]) {
const b = b12(y);
console.log(y, "-> base12:", b, "| pair:", b.slice(0, 2) + " " + b.slice(2), "| last digit:", b.slice(-1));
}
console.log();

console.log("=== Year as (century, year) pair, each mod 12 ===");
for (const [y, name] of [[1884, "Prime Meridian"], [1897, "Mertens stated"], [1985, "Mertens disproved"]]) {
const s = String(y);
const c = Number(s.slice(0, 2));
const yy = Number(s.slice(2));
console.log(y, name.padEnd(18), "pair=(" + c + "," + yy + ")",
"| c mod 12=" + (c % 12),
"| y mod 12=" + (yy % 12),
"| 0-based last=11, 1-based last=12");
}
console.log();

console.log("=== XOR of pairs ===");
const P = { PM: [18, 84], MS: [18, 97], MD: [19, 85] };
const xor2 = (a, b) => [a[0] ^ b[0], a[1] ^ b[1]];
console.log("PM ^ MS:", xor2(P.PM, P.MS));
console.log("PM ^ MD:", xor2(P.PM, P.MD));
console.log("MS ^ MD:", xor2(P.MS, P.MD));
console.log();

console.log("=== Three pairs (Kernighan abc) ===");
const a = "hell", b = "o, w", c = "orld";
console.log("a =", JSON.stringify(a), "| bytes:", hx(a));
console.log("b =", JSON.stringify(b), "| bytes:", hx(b));
console.log("c =", JSON.stringify(c), "| bytes:", hx(c));
console.log("a+b+c =", JSON.stringify(a + b + c), "| length:", (a + b + c).length);
console.log();

console.log("=== Pair XORs of the three chunks ===");
console.log("a ^ b (4 chars):", hx([...a].map((ch, i) => String.fromCharCode(ch.charCodeAt(0) ^ b.charCodeAt(i))).join("")));
console.log("b ^ c (4 chars):", hx([...b].map((ch, i) => String.fromCharCode(ch.charCodeAt(0) ^ c.charCodeAt(i))).join("")));
console.log("a ^ c (4 chars):", hx([...a].map((ch, i) => String.fromCharCode(ch.charCodeAt(0) ^ c.charCodeAt(i))).join("")));
console.log();

console.log("=== Three pairs XOR all together ===");
const x3 = [...a].map((ch, i) => String.fromCharCode(
ch.charCodeAt(0) ^ b.charCodeAt(i) ^ c.charCodeAt(i)
)).join("");
console.log("a ^ b ^ c:", hx(x3), "->", JSON.stringify(x3));
console.log("XNOR (0x7F):", hx([...x3].map(ch => String.fromCharCode(0x7F ^ ch.charCodeAt(0))).join("")));
console.log();

console.log("=== The n (B) vs \n (C) ===");
console.log(" = 0x2A | * ^ 0x40 =", "0x" + (0x2A ^ 0x40).toString(16), "->", JSON.stringify(String.fromCharCode(0x2A ^ 0x40)));
console.log("\ = 0x5C | \ ^ 0x40 =", "0x" + (0x5C ^ 0x40).toString(16), "->", JSON.stringify(String.fromCharCode(0x5C ^ 0x40)));
console.log("n in B = \n in C = 0x0A (LF)");
console.log(" ^ \ =", "0x" + (0x2A ^ 0x5C).toString(16), "->", JSON.stringify(String.fromCharCode(0x2A ^ 0x5C)));
console.log();

console.log("=== 12 as two-cube measurement ===");
console.log("2^3 + 2^2 =", (23) + (22), " (cube + square)");
console.log("3^2 + 3^1 =", (32) + (31), " (square + cube root relation)");
console.log("2^3 + 2^2 + 2^1 + 2^0 =", (23)+(22)+(21)+(20), "(tetrahedral sum, not 12)");
console.log("3 * 2^2 =", 3 * (2**2), " (3 squares)");
console.log("4 * 3 =", 4 * 3);
console.log("2 * 2 * 3 =", 2 * 2 * 3);
console.log();

console.log("=== 60th frame and 12 ===");
console.log("60 / 12 =", 60 / 12);
console.log("60 mod 12 =", 60 % 12);
console.log("60 ^ 60 =", 60 ^ 60, "(frame 60 hits byte 0)");
console.log("60 ^ 12 =", 60 ^ 12, "= 0x" + (60 ^ 12).toString(16));
console.log("60 ^ 48 =", 60 ^ 48, "= 0x" + (60 ^ 48).toString(16));
console.log();

console.log("=== 11th vs 12th index ===");
console.log("0-based: indices 0..11, last is 11");
console.log("1-based: indices 1..12, last is 12");
console.log("11 in 1-based = 10 in 0-based");
console.log("12 in 1-based = 11 in 0-based <- the same terminal slot");
console.log("13 in 1-based = 12 in 0-based <- the *n, one past");