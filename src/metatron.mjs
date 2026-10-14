const tag = (s) => /^[A-Z0-9]{1,8}$/.test(s); const hx = (s) => [...s].map(c => c.codePointAt(0).toString(16).padStart(4, "0")).join(" "); const hex8 = (s) => [...s].map(c => c.codePointAt(0).toString(16).padStart(2, "0")).join(" "); const NFD = (s) => s.normalize("NFD"); const NFC = (s) => s.normalize("NFC");
console.log("=== Metatron spellings ===");
const spellings = [
"METATRON", // plain ASCII
"METATRÓN", // acute accent on O
"METATRÖN", // diaeresis on O
"MĒTATRON", // macron on E
"MĒTĀTRON", // macron on both
"MÈTATRON", // grave on E
"MÉTATRON", // acute on E
];
for (const s of spellings) {
const nfc = NFC(s), nfd = NFD(s);
console.log(s.padEnd(12), "len:", [...s].length, "| NFC:", [...nfc].length, "| NFD:", [...nfd].length, "| tag?", tag(s));
}
console.log();

console.log("=== Byte and code point forms ===");
for (const s of ["METATRON", "METATRÓN", "MĒTATRON"]) {
console.log(s.padEnd(10), "| code points:", hx(s));
console.log("".padEnd(11), "| UTF-8 bytes:", Buffer.from(s, "utf8").toString("hex").match(/../g).join(" "));
}
console.log();

console.log("=== NFD decomposition ===");
for (const s of ["METATRÓN", "MĒTATRON"]) {
const nfd = NFD(s);
console.log(s.padEnd(10), "NFD =", JSON.stringify(nfd));
console.log("".padEnd(11), "decomposed code points:");
for (const cp of [...nfd]) {
console.log("".padEnd(13), JSON.stringify(cp), "U+" + cp.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"));
}
}
console.log();

console.log("=== Combining marks used ===");
const combining = {
"U+0301": "COMBINING ACUTE ACCENT",
"U+0308": "COMBINING DIAERESIS",
"U+0304": "COMBINING MACRON",
"U+0300": "COMBINING GRAVE ACCENT",
"U+030A": "COMBINING RING ABOVE",
"U+030C": "COMBINING CARON",
};
for (const [cp, name] of Object.entries(combining)) {
const ch = String.fromCodePoint(parseInt(cp.slice(2), 16));
console.log(cp, name.padEnd(28), JSON.stringify(ch));
}
console.log();

console.log("=== MERKABAH spellings ===");
for (const s of ["MERKABA", "MERKABAH", "MERKAVAH", "MERKAVÁ", "MERKABÁ"]) {
console.log(s.padEnd(10), "len:", [...s].length, "tag?", tag(s));
}
console.log();

console.log("=== The composing pairs: METATRON with combining marks ===");
console.log("Base letters M E T A T R O N");
console.log("If O carries an accent, NFD is: M E T A T R O + combining N");
console.log("So the last two code points are: O + combining");
console.log();
const withAcute = NFD("METATRÓN");
console.log("METATRÓN NFD =", JSON.stringify(withAcute));
console.log("Code points:");
for (const cp of [...withAcute]) {
console.log(" ", JSON.stringify(cp), "U+" + cp.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"));
}
console.log();
console.log("=== Pair the last two (O + combining) ===");
const nfdArr = [...withAcute];
const last = nfdArr.slice(-2);
console.log("Last two code points:", last.map(c => JSON.stringify(c)).join(" + "));
const o = last[0].codePointAt(0);
const comb = last[1].codePointAt(0);
console.log("O = U+" + o.toString(16).toUpperCase().padStart(4, "0"), "= 0x" + o.toString(16));
console.log("comb = U+" + comb.toString(16).toUpperCase().padStart(4, "0"), "= 0x" + comb.toString(16));
console.log("O ^ comb =", "0x" + (o ^ comb).toString(16));
console.log("O ^ comb =", o ^ comb, "(decimal)");
console.log();

console.log("=== 'I' as the root ===");
console.log("The letter I = U+0049 = 0x49");
console.log("The word 'I' is the subject. Everything after it is the object.");
console.log();
console.log("METATRON: what is after I? METATRON has no 'I'.");
console.log("MERKABAH: what is after I? MERKABAH has no 'I' either.");
console.log();
console.log("'METATRON' contains no I. 'MERKABAH' contains no I.");
console.log("So 'after the I' means: after the subject, i.e. after the speaker.");
console.log("The composition is: I [as speaker] + METATRON [as witness] + MERKABAH [as shape].");
console.log();
console.log("The speaker + the witness + the shape = the full expression.");
console.log("I : METATRON : MERKABAH = subject : predicate : object?");
console.log();
console.log("In Hebrew, the word after the Tetragrammaton is 'Metatron' (מטטרון).");
console.log("In Hebrew, 'merkabah' (מרכבה) is the chariot — the throne-chariot of Ezekiel.");
console.log("Ezekiel 1 is the merkabah vision: the four living creatures, the wheels.");
console.log("That is the shape Metatron sits on.");
console.log();

console.log("=== Metatron + Merkabah composition ===");
const M1 = "METATRO"; // truncated
const M2 = "MERKABA"; // truncated
console.log("METATRON (as 5-char):", "METAT");
console.log("MERKABAH (as 5-char):", "MERKA");
console.log("Both begin 'ME' — the shared prefix is the null pair from the run:");
console.log(" METAT ^ MERKA = 00 00 06 0a 15");
console.log();
console.log("So the two after ME are:");
console.log(" METAT = M E T A T");
console.log(" MERKA = M E R K A");
console.log("And the difference (after ME) is 06 0a 15 — three control codes.");
console.log();

console.log("=== The composition I : METATRON : MERKABAH ===");
console.log("If 'I' = 0x49 = the null, then the XOR of I with the shapes gives:");
const I = 0x49;
const metat = "METAT";
const merka = "MERKA";
console.log("I ^ M =", "0x" + (I ^ "M".charCodeAt(0)).toString(16), "= '" + String.fromCharCode(I ^ "M".charCodeAt(0)) + "'");
console.log("That is: I ^ M = the difference between the subject I and the object M.");
console.log("M = 0x4D. I = 0x49. I ^ M = 0x04. Control code EOT.");
console.log("EOT = end of transmission.");
console.log();