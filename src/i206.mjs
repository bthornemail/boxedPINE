const tag = (s) => /^[A-Z0-9]{1,8}$/.test(s); const tag5 = (s) => s.slice(0, 5); const hx = (s) => [...s].map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" "); const xor = (words) => { const n = Math.max(...words.map(w => w.length)); let out = ""; for (let i = 0; i < n; i++) { let x = 0; for (const w of words) x ^= (i < w.length ? w.charCodeAt(i) : 0x20); out += String.fromCharCode(x); } return out; };
console.log("=== Tag check for the I-206 candidates ===");
const candidates = [
"BRIAN", "JAMES", "THORNE", "BRIANJAM", "THORN",
"INGLEWOO", "INGLEWOOD", "CALIFORN", "CALIFORNIA", "CALIF",
"AMERICA", "AMERIC", "USA",
"42", "1984", "0729", "19840729",
"I206", "I-206",
"MODULUS", "MODULO", "THREE", "THREE",
];
for (const c of candidates) {
console.log(c.padEnd(12), tag(c) ? "TAG" : "not a tag (" + c.length + ")", "| 5-trunc:", JSON.stringify(tag5(c)));
}
console.log();

console.log("=== Byte forms of the name ===");
for (const w of ["BRIAN", "JAMES", "THORNE"]) {
console.log(w.padEnd(8), hx(w));
}
console.log();

console.log("=== XOR of the name parts ===");
console.log("BRIAN ^ JAMES:", hx(xor(["BRIAN", "JAMES"])));
console.log("JAMES ^ THORNE:", hx(xor(["JAMES", "THORNE"])));
console.log("BRIAN ^ THORNE:", hx(xor(["BRIAN", "THORNE"])));
console.log("BRIAN ^ JAMES ^ THORNE:", hx(xor(["BRIAN", "JAMES", "THORNE"])));
console.log();

console.log("=== The birth date as index pairs ===");
const date = "19840729";
console.log("1984 07 29 =", date);
console.log("as pairs: (19,84) (07,29)");
console.log("19 ^ 84 =", 19 ^ 84, "= 0x" + (19 ^ 84).toString(16));
console.log("07 ^ 29 =", 7 ^ 29, "= 0x" + (7 ^ 29).toString(16));
console.log("(19^84) ^ (07^29) =", (19 ^ 84) ^ (7 ^ 29));
console.log();
console.log("1984 mod 3 =", 1984 % 3);
console.log("07 mod 3 =", 7 % 3);
console.log("29 mod 3 =", 29 % 3);
console.log("2026 mod 3 =", 2026 % 3);
console.log("2026 - 1984 =", 2026 - 1984, "= age in 2026 if birthday passed");
console.log("42 mod 3 =", 42 % 3);
console.log();

console.log("=== The name as an anagram set ===");
const letters = (s) => [...s].sort().join("");
console.log("BRIAN sorted:", letters("BRIAN"));
console.log("JAMES sorted:", letters("JAMES"));
console.log("THORNE sorted:", letters("THORNE"));
console.log();
console.log("BRIAN as 5-char tag:", tag5("BRIAN"));
console.log("JAMES as 5-char tag:", tag5("JAMES"));
console.log("THORNE as 5-char tag:", tag5("THORNE"));
console.log();

console.log("=== INGLEWOOD / CALIFORNIA ===");
console.log("INGLEWOOD len:", "INGLEWOOD".length, "-> 5-trunc:", tag5("INGLEWOOD"));
console.log("CALIFORNIA len:", "CALIFORNIA".length, "-> 5-trunc:", tag5("CALIFORNIA"));
console.log("INGLE ^ CALIF:", hx(xor(["INGLE", "CALIF"])));
console.log();

console.log("=== I206 / I-206 as tags ===");
console.log("I206:", tag("I206") ? "TAG" : "no");
console.log("I-206:", tag("I-206") ? "TAG" : "no (hyphen)");
console.log("I206 as base36:", parseInt("I206", 36));
console.log("206 in base 36:", (206).toString(36).toUpperCase());
console.log();

console.log("=== The mod-3 loop ===");
console.log("Every number mod 3 gives 0, 1, or 2.");
console.log("1984 -> ", 1984 % 3);
console.log("2026 -> ", 2026 % 3);
console.log("42 -> ", 42 % 3);
console.log("If the year is a mod-3 residue, 2026 - 1984 = 42, and 42 mod 3 = 0.");
console.log("So the year difference is a multiple of 3, and so is the age.");
console.log();

console.log("=== Does 42 show up in the earlier work? ===");
console.log("60 ^ 22 = ", 60 ^ 22, " <- the reset frame");
console.log("42 in binary:", (42).toString(2));
console.log("42 = 2 * 21 = 2 * (3 * 7)");
console.log("42 = 6 * 7 (the Adams number)");
console.log("The 42 appears in the exchange reset (frame 42).");