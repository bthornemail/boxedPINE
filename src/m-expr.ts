const hx = s => [...s].map(c=>c.charCodeAt(0).toString(16).padStart(2,"0")).join(" ");
for (const w of ["MEXPR","MEXPRESS","MEXP","META","EXPR","SEXPR"]) {
  console.log(w.padEnd(9), "len:", w.length, "tag?", /^[A-Z0-9]{1,8}$/.test(w) ? "yes" : "no", "| bytes:", hx(w));
}
console.log();
console.log("MEXPR ^ SEXPR:", hx(["M","E","X","P","R"].map((c,i)=>String.fromCharCode(c.charCodeAt(0)^"SEXPR".charCodeAt(i))).join("")));
console.log("M ^ S =", "0x" + (0x4D ^ 0x53).toString(16), "= " + String.fromCharCode(0x4D ^ 0x53));