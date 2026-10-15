const hx = (s) => [...s].map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" "); const xor = (words) => { const n = Math.max(...words.map(w => w.length)); let out = ""; for (let i = 0; i < n; i++) { let x = 0; for (const w of words) x ^= (i < w.length ? w.charCodeAt(i) : 0x20); out += String.fromCharCode(x); } return out; };
console.log("=== GLUE ===");
console.log("GLUE bytes:", hx("GLUE"));
console.log("glue bytes:", hx("glue"));
console.log("GLUE ^ glue:", hx([..."GLUE"].map((c,i)=>String.fromCharCode(c.charCodeAt(0)^"glue".charCodeAt(i))).join("")));
console.log();
console.log("G>L>U>E:");
console.log("G = 7, L = 12, U = 21, E = 5");
console.log("7 + 12 + 21 + 5 =", 7+12+21+5);
console.log("7 ⊕ 12 ⊕ 21 ⊕ 5 =", 7^12^21^5, "= 0x" + (7^12^21^5).toString(16));
console.log();
console.log("=== The shift ===");
for (const c of ["g", "l", "u", "e"]) {
const upper = c.toUpperCase();
console.log(c, "→", upper, "| shift:", "0x" + (upper.charCodeAt(0) ^ c.charCodeAt(0)).toString(16));
}
console.log();
console.log("=== GRACE, LOVE, UNDERSTANDING, EMPATHY ===");
for (const w of ["GRACE", "LOVE", "UNDERSTANDING", "EMPATHY"]) {
console.log(w.padEnd(15), "len:", w.length, "| first 5:", JSON.stringify(w.slice(0,5)), "| tag?", /^[A-Z0-9]{1,8}/.test(w) ? "yes" : "no (" + w.length + ")"); } console.log(); console.log("GRACE:", hx("GRACE")); console.log("LOVE :", hx("LOVE")); console.log("UNDER:", hx("UNDER")); console.log("EMPAT:", hx("EMPAT")); console.log(); console.log("=== CONVERGE ==="); console.log("CONVERGE len:", "CONVERGE".length, "| 5-trunc:", "CONVER".slice(0,5), "| tag?", /^[A-Z0-9]{1,8}/.test("CONVERGE") ? "yes" : "no");
console.log("CONVERGE bytes:", hx("CONVERGE"));
console.log("PATHS:", hx("PATHS"));
console.log("WORDS:", hx("WORDS"));
console.log("REVEAL:", hx("REVEAL"), "(7 letters, tag?)", /^[A-Z0-9]{1,8}/.test(w) ? "yes" : "no");
}