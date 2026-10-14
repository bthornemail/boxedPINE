// Tags for every folder and file under a directory (omi-files by default), as a CanvasL tree.
//
// The author, 2026-10-14: "add tags to all the omi-files folders and files, and to the build script in
// the metaverse build, to forever propagate the tagging mnemonics". The projects' files are not touched:
// the tags are derived from the names and written to one index, which the metaverse build regenerates.
// For each path:
//   tags     the words of its name (split at anything not a letter or digit, and where lower case turns
//            upper), each promoted lower to upper (rosetta tag-type.ts); a word over 8 letters cannot be
//            a tag and is left out;
//   address  its place among its siblings in name order, in base 36, folder by folder from the root
//            (omi-files/7/A/3): an index for every path, whether or not its name gives a tag. Adding a
//            file moves its later siblings' addresses: the index is re-derived, not kept.
// Written as CanvasL: a node per path, v:child edges down the tree (meta-log-db reads v: as vertical
// facts); and the universal tags, those two or more top-level projects share.
//   node scripts/tag-tree.mjs [dir] [--out file.canvasl]
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { toTag } from '../rosetta/src/tag-type.ts';

const SKIP = new Set(['node_modules', '.git', 'dist', 'dist-production', 'coverage', 'build', '.cache']);

/** The tags of a name: its words promoted, those that can be tags, each once. */
export function tagsOf(name) {
  const words = name.replace(/([a-z])([A-Z])/g, '$1 $2').split(/[^A-Za-z0-9]+/).filter(Boolean);
  return [...new Set(words.map((w) => toTag(w)).filter(Boolean))];
}

/** Every path under dir, with its tags and its address. */
export function tagTree(dir) {
  const nodes = [], edges = [];
  const walk = (path, address, parent) => {
    let entries;
    try { entries = readdirSync(path, { withFileTypes: true }); } catch { return; }
    entries.filter((e) => !SKIP.has(e.name) && !e.isSymbolicLink()).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)).forEach((e, i) => {
      const id = `${address}/${i.toString(36).toUpperCase()}`, child = join(path, e.name);
      nodes.push({ kind: 'node', id, type: e.isDirectory() ? 'group' : 'file', path: child, tags: tagsOf(e.name) });
      edges.push({ kind: 'edge', id: `${parent}>${id}`, type: 'v:child', fromNode: parent, toNode: id });
      if (e.isDirectory()) walk(child, id, id);
    });
  };
  const root = basename(dir);
  nodes.push({ kind: 'node', id: root, type: 'group', path: dir, tags: tagsOf(root) });
  walk(dir, root, root);
  // the universal tags: those two or more top-level projects share
  const byProject = new Map();
  for (const n of nodes) {
    const project = n.id.split('/')[1];
    if (!project) continue;
    for (const t of n.tags) { if (!byProject.has(t)) byProject.set(t, new Set()); byProject.get(t).add(project); }
  }
  const universal = [...byProject].filter(([, p]) => p.size >= 2).sort((a, b) => b[1].size - a[1].size || (a[0] < b[0] ? -1 : 1)).map(([t, p]) => ({ tag: t, projects: p.size }));
  return { nodes, edges, universal };
}

/** The tree as CanvasL text. */
export function tagTreeCanvasL(dir) {
  const { nodes, edges, universal } = tagTree(dir);
  const lines = ['@version: "1.0"', '@schema: "jsoncanvas-1.0+canvasl-min"', `@root: ${JSON.stringify(basename(dir))}`, `@universal: ${JSON.stringify(universal.slice(0, 64).map((u) => u.tag).join(' '))}`];
  for (const n of nodes) lines.push(JSON.stringify(n));
  for (const e of edges) lines.push(JSON.stringify(e));
  return { text: lines.join('\n') + '\n', nodes: nodes.length, universal };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2), at = args.indexOf('--out');
  const dir = args.find((a, i) => !a.startsWith('--') && i !== at + 1) ?? 'omi-files';
  const out = at >= 0 ? args[at + 1] : `public/tags/${basename(dir)}.canvasl`;
  const { text, nodes, universal } = tagTreeCanvasL(dir);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, text);
  console.log(`tag-tree: ${nodes} paths under ${dir}; ${universal.length} universal tags (top: ${universal.slice(0, 12).map((u) => `${u.tag}(${u.projects})`).join(' ')}); written to ${out}`);
}
