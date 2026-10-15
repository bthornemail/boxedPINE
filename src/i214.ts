const hx = (s) => [...s].map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" ");
console.log("THEOS:", hx("THEOS"), "| len:", "THEOS".length);
console.log("LOGOS:", hx("LOGOS"), "| len:", "LOGOS".length);
console.log("THEOS ^ LOGOS:", hx(["T","H","E","O","S"].map((c,i)=>String.fromCharCode(c.charCodeAt(0)^"LOGOS".charCodeAt(i))).join("")));
console.log("as chars:");
const x = ["T","H","E","O","S"].map((c,i)=>String.fromCharCode(c.charCodeAt(0)^"LOGOS".charCodeAt(i))).join("");
console.log("  ", JSON.stringify(x));
// THEOS with and without the article mark.
console.log();
console.log("ho theos: the article is the mark; the presence/absence shifts the point.");
console.log("THEOS (no article) vs HO THEOS (article)");
console.log("HO THEOS len:", "HOTHEOS".length, "| tag?", /^[A-Z0-9]{1,8}$/.test("HOTHEOS"));
console.log("the XOR of THEOS with itself is trivially 0.");
console.log();
console.log("=== The year pairs ===");
const years = [1808,1822,1829,1863,1864,1867,1879,1885,1911,1924,1935,1955,1956,1958,1962,1966,1970,1975,1978,1985,1993,1998,2017];
const pairs = years.map(y => [Math.floor(y/100), y%100]);
console.log("count:", years.length);
console.log("as pairs:", pairs.map(p=>"("+p[0]+","+p[1]+")").join(" "));
const byPair = {};
for (const [a,b] of pairs) { const k = a+","+b; byPair[k] = (byPair[k]||0)+1; }
console.log();
console.log("pairs with more than one event:");
for (const [k,v] of Object.entries(byPair)) if (v > 1) console.log("  (" + k + "): " + v);
console.log();
console.log("all unique?", Object.keys(byPair).length === years.length);