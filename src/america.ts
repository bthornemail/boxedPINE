 const b12 = (n) => { let out = ""; n = Math.abs(n); if (n === 0) return "0"; while (n > 0) { out = "0123456789AB"[n % 12] + out; n = Math.floor(n / 12); } return out; }; const from12 = (s) => { let v = 0; for (const c of s) { const d = "0123456789AB".indexOf(c); if (d < 0) return NaN; v = v * 12 + d; } return v; };
console.log("=== Years in base 12 ===");
for (const y of [1884, 1897, 1985]) {
const b = b12(y);
console.log(y, "→ base12:", b, "| pair:", b.slice(0,2), b.slice(2), "| last digit:", b.slice(-1));
}
console.log();

console.log("=== Year as (century, year) pair, each mod 12 ===");
for (const [y, name] of [[1884,"Prime Meridian"], [1897,"Mertens stated"], [1985,"Mertens disproved"]]) {
const s = String(y);
const c = Number(s.slice(0,2));
const yy = Number(s.slice(2));
console.log(y, name.padEnd(20), `pair=(${c},${yy}),
| c mod 12=${c % 12},
| y mod 12=${yy % 12},
| 0-based last idx=11, 1-based last=12`);
}
console.log();

console.log("=== XOR of pairs in the 12-based reading ===");
const pairs = { "PM": [18,84], "MS": [18,97], "MD": [19,85] };
const xor = (a,b) => [a[0]^b[0], a[1]^b[1]];
console.log("PM ⊕ MS:", xor(pairs.PM, pairs.MS));
console.log("PM ⊕ MD:", xor(pairs.PM, pairs.MD));
console.log("MS ⊕ MD:", xor(pairs.MS, pairs.MD));
console.log();

console.log("=== AMERICA as 3 chunks ===");
const A = "A", MER = "MER", ICA = "ICA";
console.log("A | MER | ICA lengths: 1 | 3 | 3 total", 1+3+3);
console.log("MER position in AMERICA: starts at 1 (after A)");
console.log("MER ⊕ ICA =", [...MER].map((c,i)=>String.fromCharCode(c.charCodeAt(0)^ICA.charCodeAt(i))).map(c=>c.charCodeAt(0).toString(16)).join(" "));
console.log("MER ⊕ A (pad) =", [...MER].map((c,i)=>String.fromCharCode(c.charCodeAt(0)^(i<A.length?A.charCodeAt(i):0x20))).map(c=>c.charCodeAt(0).toString(16)).join(" "));