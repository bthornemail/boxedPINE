const hx = (s) => [...s].map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" ");
const xor = (a, b) => {
  const n = Math.max(a.length, b.length);
  const A = a.padEnd(n, " "), B = b.padEnd(n, " ");
  return [...A].map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ B.charCodeAt(i))).join("");
};
const words = ["THEOS", "LOGOS", "PATHOS", "NOMOS", "ETHOS"];
console.log("=== The OS family ===");
for (const w of words) {
  console.log(w.padEnd(7), "len:", w.length, "| tag?", /^[A-Z0-9]{1,8}$/.test(w) ? "yes" : "no", "| bytes:", hx(w));
}
console.log();
console.log("=== Pairwise XOR ===");
for (let i = 0; i < words.length; i++) {
  for (let j = i + 1; j < words.length; j++) {
    const a = words[i], b = words[j];
    console.log(a.padEnd(7), "⊕", b.padEnd(7), "=", hx(xor(a, b)));
  }
}
console.log();
console.log("=== The shared OS ===");
for (const w of words) console.log(w.padEnd(7), "last 2:", w.slice(-2));
// Confirm the last-two nulls.
console.log();
console.log("=== A1Z26 sums and XOR ===");
const az = (w) => [...w].reduce((s, c) => s + (c.charCodeAt(0) - 64), 0);
const azx = (w) => [...w].reduce((s, c) => s ^ (c.charCodeAt(0) - 64), 0);
for (const w of words) {
  console.log(w.padEnd(7), "sum:", az(w), "xor:", azx(w));
}