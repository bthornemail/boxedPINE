// bind-literals.mjs — bind the projects by their frontmatter, not their code.
// Most omi-files docs are front-matter loaded and S-P-O shaped: subject = `id`,
// predicate = a field (enables/related/prerequisites/parent/tags/type/status),
// object = its value(s). This extracts every such triple into one literal record
// (public/bindings.ndjson). A literal always binds — no import, no build, so the
// broken code stays at the gate while the graph still converges. Resolved edges
// point at a known subject; dangling edges point at nothing (the finding).
//   node scripts/bind-literals.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const roots = "omi-files wiki";
const files = execSync(`grep -rl --include=*.md -m1 "^---" ${roots} 2>/dev/null`).toString().trim().split("\n").filter(Boolean);
const LINK = ["enables", "related", "prerequisites", "requires", "depends", "parent", "children"];
const ATTR = ["type", "level", "status", "tags", "keywords"];

const triples = [], subjects = new Set();
for (const f of files) {
  let text; try { text = readFileSync(f, "utf8"); } catch { continue; }
  const m = /^---\n([\s\S]*?)\n---/.exec(text); if (!m) continue;
  const fm = m[1];
  const idm = /^id:\s*["']?([^"'\n]+)/m.exec(fm); if (!idm) continue;
  const s = idm[1].trim(); subjects.add(s);
  for (const p of [...LINK, ...ATTR]) {
    const mm = new RegExp("^" + p + ":\\s*(.+)$", "m").exec(fm); if (!mm) continue;
    const raw = mm[1].trim();
    const objs = raw.startsWith("[") ? raw.replace(/[[\]]/g, "").split(",").map((x) => x.trim()).filter(Boolean)
                                     : [raw.replace(/^["']|["']$/g, "")];
    for (const o of objs) triples.push({ s, p, o, kind: LINK.includes(p) ? "link" : "attr", file: f });
  }
}

// resolve link edges against known subjects
let resolved = 0, dangling = 0; const dangle = [];
for (const t of triples) if (t.kind === "link") { if (subjects.has(t.o)) { t.resolved = true; resolved++; } else { t.resolved = false; dangling++; dangle.push(t); } }

writeFileSync(new URL("../public/bindings.ndjson", import.meta.url),
  triples.map((t) => JSON.stringify(t)).join("\n") + "\n");

console.log(`bind-literals: ${subjects.size} subjects, ${triples.length} triples → public/bindings.ndjson`);
console.log(`  link edges: ${resolved} resolved, ${dangling} dangling (point at an id no doc declares)`);
const byp = {}; for (const t of triples) byp[t.p] = (byp[t.p] || 0) + 1;
console.log(`  predicates: ${JSON.stringify(byp)}`);
if (dangle.length) {
  console.log(`  sample dangling edges (the finding — references that don't bind yet):`);
  for (const t of dangle.slice(0, 8)) console.log(`    ${t.s} --${t.p}--> ${t.o}`);
}
