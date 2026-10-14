// Markdown files as document trees in CanvasL, and their JSON Canvas projection (rosetta/src/canvasl.ts).
//   node scripts/doc-tree.mjs <dir or .md files ...> --out <dir>
// Writes <name>.canvasl and <name>.canvas (Obsidian) for each, and index.json.
import { readFileSync, writeFileSync, mkdirSync, statSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { markdownTree, toCanvasL, toJsonCanvas, verifyEvidence, latticeOf } from '../rosetta/src/canvasl.ts';

const args = process.argv.slice(2), at = args.indexOf('--out');
const out = at >= 0 ? args[at + 1] : 'public/canvasl';
const inputs = (at >= 0 ? args.slice(0, at) : args).flatMap((p) => (statSync(p).isDirectory() ? readdirSync(p).filter((f) => f.endsWith('.md')).sort().map((f) => join(p, f)) : [p]));
mkdirSync(out, { recursive: true });
const index = [], trees = [];
for (const file of inputs) {
  const text = readFileSync(file, 'utf8'), tree = markdownTree(text), name = basename(file, '.md');
  trees.push({ name, tree });
  const held = tree.nodes.every((n) => verifyEvidence(text, n.evidence));
  const src = toCanvasL(tree);
  writeFileSync(join(out, `${name}.canvasl`), src);
  writeFileSync(join(out, `${name}.canvas`), JSON.stringify(toJsonCanvas(src), null, 1) + '\n');
  const tags = [...new Set(tree.nodes.flatMap((n) => (n.kind === 'heading' ? n.tags : [])))];
  index.push({ file, nodes: tree.nodes.length, edges: tree.edges.length, headings: tree.nodes.filter((n) => n.kind === 'heading').length, blocks: tree.nodes.filter((n) => n.kind === 'block').length, tags: tags.length, held });
}
const lattice = latticeOf(trees);
writeFileSync(join(out, 'lattice.canvasl'), lattice);
writeFileSync(join(out, 'lattice.canvas'), JSON.stringify(toJsonCanvas(lattice), null, 1) + '\n');
writeFileSync(join(out, 'index.json'), JSON.stringify(index, null, 1) + '\n');
const sum = (k) => index.reduce((s, x) => s + x[k], 0);
console.log(`doc-tree: ${index.length} documents, ${sum('headings')} headings, ${sum('blocks')} blocks, ${sum('edges')} edges; every span holds: ${index.every((x) => x.held)}; lattice: ${lattice.split('\n').filter((l) => l.includes('"tag:') && l.includes('"kind":"node"')).length} joining tags; written to ${out}`);
