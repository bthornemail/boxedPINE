const tag = (s) => /^[A-Z0-9]{1,8}$/.test(s); const tag5 = (s) => s.slice(0, 5); const hx = (s) => [...s].map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" "); const xor = (words) => { const n = Math.max(...words.map(w => w.length)); let out = ""; for (let i = 0; i < n; i++) { let x = 0; for (const w of words) x ^= (i < w.length ? w.charCodeAt(i) : 0x20); out += String.fromCharCode(x); } return out; };
console.log("=== PIXEL and PIXELS as tags ===");
for (const w of ["PIXEL", "PIXELS", "PIX", "PX", "PIXL", "PIXES", "PXLS"]) {
console.log(w.padEnd(8), tag(w) ? "TAG" : "no (" + w.length + ")", "| 5-trunc:", JSON.stringify(tag5(w)));
}
console.log();

console.log("=== Byte forms ===");
for (const w of ["PIXEL", "PIXELS", "PIX", "TERM", "TERMS", "PIXEL S"]) {
console.log(w.padEnd(10), hx(w));
}
console.log();

console.log("=== PIXEL vs TERM ===");
console.log("PIXEL ^ TERM :", hx(xor(["PIXEL", "TERM "])));
console.log("PIXELS ^ TERMS:", hx(xor(["PIXELS", "TERMS"])));
console.log("PIXEL ^ PIXELS:", hx(xor(["PIXEL ", "PIXELS"])));
console.log("TERM ^ TERMS :", hx(xor(["TERM ", "TERMS"])));
console.log();

console.log("=== The plural S is the difference ===");
console.log("PIXEL ^ PIXELS: the trailing S");
console.log("TERM ^ TERMS : the trailing S");
console.log("Both differ by exactly 'S' at the end (S vs space)");
console.log("'S' = 0x53, space = 0x20, XOR = 0x73 = lowercase s");
console.log();
console.log("So 'PIXEL' and 'PIXELS' differ by the plural S,");
console.log("and 'TERM' and 'TERMS' differ by the same S.");
console.log();

console.log("=== PIXELS as the word for the tag set ===");
console.log("The author's correction: it's not TERMS (of agreement), it's PIXELS.");
console.log("Because every word is a pixel (from I-201).");
console.log("So what two parties share is not the TERMS, but the PIXELS.");
console.log();

console.log("=== XOR all three (PIXEL, TERM, S) ===");
console.log("PIXEL ^ TERM ^ S (padded to 5):", hx(xor(["PIXEL", "TERM ", "S "])));
console.log();

console.log("=== PIXELS vs AMERICA ===");
console.log("PIXELS ^ AMERICA:", hx(xor(["PIXELS", "AMERICA"])));
console.log();

console.log("=== Is PIXELS in the 0..63 range? ===");
console.log("PIXELS as base-36:", parseInt("PIXELS", 36));
console.log("PIXELS as base-36 mod 64:", parseInt("PIXELS", 36) % 64);
console.log("PIXELS as base-36 mod 3:", parseInt("PIXELS", 36) % 3);
console.log();

console.log("=== TERMS as base-36 ===");
console.log("TERMS as base-36:", parseInt("TERMS", 36));
console.log("TERMS mod 3:", parseInt("TERMS", 36) % 3);
console.log();

console.log("=== The strict sense with PIXELS ===");
console.log("If it's PIXELS not TERMS, then:");
console.log(" - What two parties share is a set of PIXELS, not a set of TERMS.");
console.log(" - A pixel is a (value, position) pair: the tag is the value, the index is the position.");
console.log(" - Matching pixels = matching (value, position) pairs = same universe, same path.");
console.log(" - 'use strict' means: every pixel must be declared; an undeclared pixel throws.");