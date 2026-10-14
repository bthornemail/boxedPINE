const tag = (s) => /^[A-Z0-9]{1,8}$/.test(s); const hx = (s) => [...s].map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" "); const xor = (words) => { const n = Math.max(...words.map(w => w.length)); let out = ""; for (let i = 0; i < n; i++) { let x = 0; for (const w of words) x ^= (i < w.length ? w.charCodeAt(i) : 0x20); out += String.fromCharCode(x); } return out; };
console.log("=== Tag check (1-8 chars, A-Z0-9) ===");
const words = [
"REVELATION", "REVELATI", "REV", "BIBLE",
"MERKABA", "MERKABAH", "STELLATED", "STELLA", "TETRAHEDRON", "TETRA",
"OCTAHEDRON", "OCTA", "OCTONION", "OCTONIO",
"METATRON", "LOGIC", "LAMBDA", "CUBE",
"XOR", "XNOR", "ENCAPSUL", "VIRTUAL",
];
for (const w of words) {
console.log(w.padEnd(13), tag(w) ? "TAG" : "not a tag (" + w.length + ")");
}
console.log();

console.log("=== The shapes, by first-five truncation ===");
const shapeTags = (w) => w.slice(0, 5).padEnd(5, " ");
for (const w of ["MERKABA", "STELLA", "TETRA", "OCTA", "METATRON", "LOGIC", "LAMBDA", "CUBE", "OCTONION", "REVELATI", "REV"]) {
console.log(w.padEnd(10), "-> " + JSON.stringify(shapeTags(w)), "| bytes:", hx(shapeTags(w)));
}
console.log();

console.log("=== XOR of the shape tags ===");
const shapes = ["MERKA", "STELL", "TETRA", "OCTA ", "METAT", "LOGIC", "LAMBD", "CUBE "];
for (let i = 0; i < shapes.length; i++) {
for (let j = i + 1; j < shapes.length; j++) {
const a = shapes[i], b = shapes[j];
const x = [...a].map((ch, k) => String.fromCharCode(ch.charCodeAt(0) ^ b.charCodeAt(k))).join("");
const isTag = /^[A-Z0-9 ]+$/.test(x);
console.log(a.trim().padEnd(6), "^", b.trim().padEnd(6), "=", hx(x), isTag ? "(tag-shaped)" : "");
}
}
console.log();

console.log("=== MERKABA AND METATRON together ===");
const mk = "MERKA", mt = "METAT";
console.log("MERKABA ^ METATRON (5-char):", hx([...mk].map((ch, i) => String.fromCharCode(ch.charCodeAt(0) ^ mt.charCodeAt(i))).join("")));
console.log("MERKABA ^ TETRAHEDRON:", hx(xor(["MERKA", "TETRA"])));
console.log("MERKABA ^ STELLATED:", hx(xor(["MERKA", "STELL"])));
console.log();

console.log("=== The four: stellated tetrahedron and merkaba ===");
console.log("A stellated tetrahedron = a tetrahedron with a tetrahedron on each face");
console.log(" = the compound of two tetrahedra = the stella octangula");
console.log(" Its 8 vertices are the 8 corners of a cube.");
console.log("A merkaba = the same shape (two interlocking tetrahedra).");
console.log("So stellated tetrahedron = merkaba = stella octangula. Same object.");
console.log();

console.log("=== The 8 corners of the cube, split by parity ===");
const corners = [];
for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) for (let z = 0; z < 2; z++) {
corners.push([x, y, z]);
}
const even = corners.filter(c => (c[0] + c[1] + c[2]) % 2 === 0);
const odd = corners.filter(c => (c[0] + c[1] + c[2]) % 2 === 1);
console.log("even parity (tetrahedron 1):", even.map(c => c.join("")).join(" "));
console.log("odd parity (tetrahedron 2):", odd.map(c => c.join("")).join(" "));
console.log();
console.log("XOR all even vertices as 3-bit values:");
let evenXor = 0;
for (const c of even) evenXor ^= (c[0] << 2) | (c[1] << 1) | c[2];
console.log(" =", evenXor, "= 0b" + evenXor.toString(2).padStart(3, "0"));
let oddXor = 0;
for (const c of odd) oddXor ^= (c[0] << 2) | (c[1] << 1) | c[2];
console.log("XOR all odd vertices:");
console.log(" =", oddXor, "= 0b" + oddXor.toString(2).padStart(3, "0"));
console.log();
console.log("even ^ odd per corner (paired by position):");
for (let i = 0; i < 4; i++) {
const a = (even[i][0] << 2) | (even[i][1] << 1) | even[i][2];
const b = (odd[i][0] << 2) | (odd[i][1] << 1) | odd[i][2];
console.log(" " + even[i].join("") + " ^ " + odd[i].join("") + " = " + (a ^ b) + " = 0b" + (a ^ b).toString(2).padStart(3, "0"));
}
console.log();

console.log("=== The merkaba and octonion ===");
console.log("The stella octangula / merkaba has 8 vertices = the octonion's 8 dimensions.");
console.log("The octonion has 8 units: 1 (real) and e1..e7 (imaginary).");
console.log("The 7 imaginary units form the Fano plane's 7 points.");
console.log("Each Fano line is a triple e_i * e_j = e_k with {i,j,k} on a line.");
console.log();
console.log("The 8 cube corners, as octonion basis indices 0..7:");
for (const c of corners) {
const i = (c[0] << 2) | (c[1] << 1) | c[2];
console.log(" vertex " + c.join("") + " = index " + i + (i === 0 ? " (real unit 1)" : " (imaginary e" + i + ")"));
}
console.log();

console.log("=== Revelation and the merkaba ===");
console.log("Revelation 4:6-8 mentions four living creatures, each with six wings,");
console.log(" full of eyes around and within. Six wings, four creatures.");
console.log("Revelation 21 describes the New Jerusalem as a cube (length = width = height).");
console.log(" 'The city lies foursquare, its length the same as its width...");
console.log(" its length and width and height are equal.' (Rev 21:16)");
console.log("So the Bible names a cube, and the merkaba is the cube split by parity.");
console.log();

console.log("=== The lambda cube ===");
console.log("The lambda cube (Barendregt) has 8 corners, like the merkaba's cube.");
console.log("Its 3 axes: terms depending on types (->), types on terms (*), types on types (□).");
console.log("Its 8 corners = 8 systems (λ->, λ2, λP, λω, λP2, λPω, λω_, λC).");
console.log("So the lambda cube has 8 corners, one cube, exactly like the merkaba's.");
console.log();

console.log("=== The merkaba XOR the metatron cube ===");
console.log("Metatron's cube: a 2D figure with 13 circles. Its center circle,");
console.log(" and 12 surrounding circles. The 13 = 1 + 12, and the merkaba");
console.log(" in 3D is the 8 vertices of a cube = the 8 (of the 13) that");
console.log(" are the cube corners.");
console.log();
console.log("13 - 8 = 5 (the 5 remaining circles in Metatron's cube)");
console.log("8 + 5 = 13");
console.log("13 = 12 + 1 (12 around, 1 center)");
console.log();
console.log("60 / 5 = 12 (the 60th frame divides the 12 by 5)");
console.log("60 / 12 = 5 (and 5 is the icosahedron's axes, the dodecahedron's parts)");