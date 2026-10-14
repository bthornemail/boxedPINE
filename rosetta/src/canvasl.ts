// CANVASL: a Markdown document as a tree, written as CanvasL (JSON Canvas lines)
//
// The author, 2026-10-14: "a document tree or front matter is needed to mark
// up markdown"; "I have a whole project that I made a JSONL, NDJSON, JSON
// Canvas melded type for this, like in the Haskell types, it was called
// CanvasL". CanvasL (omi-files/meta-log/scheme/substrate/canvasl.scm, Light
// Garden's emit-canvasl.js) is JSON Canvas one object a line: lines starting
// "@" are directives (@version, @schema), lines starting ";" comments, every
// other line a JSON object, a node or an edge, with a "kind".
//
// The blocks follow the Haskell contract, types/src/OMI/Markdown.hs, which is
// canonical: front matter between "---" lines at the top; fenced blocks whose
// language names their kind (omi or omi-lisp, decision-table, canvas, and
// anything else evidence) and whose fence line may carry fs= gs= rs= us= scope;
// each with its evidence span, start and end (in characters, as Haskell
// Strings count them) and lines, and its checksum, the sum of its characters
// mod 256 (checksumBytesFromString). Added here, the document tree: the
// headings, each the parent of what follows it until a heading at its level or
// above; and the heading's words promoted to tags, subject to object (rosetta
// tag-type.ts). A node's id is its address: kind and span.
import { toTag } from './tag-type.ts';

export type BlockKind = 'front-matter' | 'omi-lisp' | 'decision-table' | 'canvas' | 'evidence';
export type Evidence = { startByte: number; endByte: number; startLine: number; endLine: number; checksum: number };
export type Scope = { fs?: string; gs?: string; rs?: string; us?: string };
export type DocNode =
  | { kind: 'heading'; id: string; level: number; text: string; tags: string[]; evidence: Evidence }
  | { kind: 'block'; id: string; block: BlockKind; scope: Scope; body: string; evidence: Evidence };
export type DocEdge = { kind: 'edge'; id: string; fromNode: string; toNode: string };
export type DocTree = { directives: Record<string, string>; nodes: DocNode[]; edges: DocEdge[] };

/** Haskell's checksumBytesFromString: the sum of the characters mod 256. */
export const checksumOf = (chars: string[]) => chars.reduce((s, c) => s + c.codePointAt(0)!, 0) % 256;

const kindOfFence = (info: string): BlockKind => {
  const lang = info.trim().split(/\s+/)[0] ?? '';
  return lang === 'omi' || lang === 'omi-lisp' ? 'omi-lisp' : lang === 'decision-table' ? 'decision-table' : lang === 'canvas' ? 'canvas' : 'evidence';
};
const scopeOf = (info: string): Scope => Object.fromEntries(info.trim().split(/\s+/).map((p) => /^(fs|gs|rs|us)=(.*)$/.exec(p)).filter(Boolean).map((m) => [m![1], m![2]]));

/** A Markdown document as a tree: front matter, headings, fenced blocks, each with its evidence span. */
export function markdownTree(text: string): DocTree {
  const chars = [...text]; // characters, as Haskell counts them
  const lines: { start: number; end: number; text: string }[] = [];
  for (let i = 0, start = 0; i <= chars.length; i++) {
    if (i === chars.length || chars[i] === '\n') { lines.push({ start, end: i, text: chars.slice(start, i).join('') }); start = i + 1; }
  }
  const span = (startByte: number, endByte: number, startLine: number, endLine: number): Evidence => ({ startByte, endByte, startLine, endLine, checksum: checksumOf(chars.slice(startByte, endByte)) });
  const tree: DocTree = { directives: { version: '1.0', schema: 'jsoncanvas-1.0+canvasl-min' }, nodes: [], edges: [] };
  const parents: { level: number; id: string }[] = [];
  const attach = (id: string, level: number) => {
    while (parents.length && parents.at(-1)!.level >= level) parents.pop();
    const parent = parents.at(-1);
    if (parent) tree.edges.push({ kind: 'edge', id: `${parent.id}>${id}`, fromNode: parent.id, toNode: id });
  };
  let i = 0;
  // front matter: "---" on the first line, up to the next "---"
  if (lines[0]?.text === '---') {
    const close = lines.findIndex((l, k) => k > 0 && l.text === '---');
    if (close > 0) {
      const body = lines.slice(1, close);
      const startByte = body[0]?.start ?? lines[1]!.start, endByte = body.length ? body.at(-1)!.end : startByte;
      const id = `front-matter@${startByte}-${endByte}`;
      tree.nodes.push({ kind: 'block', id, block: 'front-matter', scope: {}, body: chars.slice(startByte, endByte).join(''), evidence: span(startByte, endByte, 2, close) });
      for (const l of body) { const m = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(l.text); if (m) tree.directives[m[1]!] = m[2]!.replace(/^["']|["']$/g, ''); }
      i = close + 1;
    }
  }
  for (; i < lines.length; i++) {
    const l = lines[i]!;
    const fence = /^```(.*)$/.exec(l.text);
    if (fence) {
      const close = lines.findIndex((x, k) => k > i && x.text.startsWith('```'));
      const last = close > 0 ? close : lines.length;
      const body = lines.slice(i + 1, last);
      const startByte = body[0]?.start ?? l.end + 1, endByte = body.length ? body.at(-1)!.end : startByte;
      const block = kindOfFence(fence[1]!), id = `${block}@${startByte}-${endByte}`;
      tree.nodes.push({ kind: 'block', id, block, scope: scopeOf(fence[1]!), body: chars.slice(startByte, endByte).join(''), evidence: span(startByte, endByte, i + 2, last) });
      attach(id, 7);
      i = last;
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(l.text);
    if (h) {
      const level = h[1]!.length, title = h[2]!.trim(), id = `h${level}@${l.start}-${l.end}`;
      const tags = [...new Set(title.split(/[^A-Za-z0-9]+/).map((w) => toTag(w)).filter((t): t is NonNullable<typeof t> => !!t))];
      tree.nodes.push({ kind: 'heading', id, level, text: title, tags, evidence: span(l.start, l.end, i + 1, i + 1) });
      attach(id, level);
      parents.push({ level, id });
    }
  }
  return tree;
}

/** Verify a node's evidence against the text, as Haskell's verifyEvidence: the span's checksum. */
export const verifyEvidence = (text: string, e: Evidence) => checksumOf([...text].slice(e.startByte, e.endByte)) === e.checksum;

/** Write a tree as CanvasL: directives, then one JSON object a line, laid out by depth and order. */
export function toCanvasL(tree: DocTree): string {
  const depth = new Map<string, number>();
  for (const n of tree.nodes) depth.set(n.id, 0);
  for (const e of tree.edges) depth.set(e.toNode, (depth.get(e.fromNode) ?? 0) + 1);
  const out = Object.entries(tree.directives).map(([k, v]) => `@${k}: ${JSON.stringify(v)}`);
  tree.nodes.forEach((n, row) => {
    const text = n.kind === 'heading' ? `${'#'.repeat(n.level)} ${n.text}${n.tags.length ? `\n\n${n.tags.join(' ')}` : ''}` : `\`${n.block}\`\n\n${n.body.slice(0, 400)}`;
    out.push(JSON.stringify({ ...n, type: 'text', x: depth.get(n.id)! * 360, y: row * 220, width: 320, height: 180, text }));
  });
  for (const e of tree.edges) out.push(JSON.stringify(e));
  return out.join('\n') + '\n';
}

/** Read CanvasL back: directives, nodes and edges (comment lines skipped). */
export function parseCanvasL(src: string): { directives: Record<string, string>; items: Record<string, unknown>[] } {
  const directives: Record<string, string> = {}, items: Record<string, unknown>[] = [];
  for (const line of src.split('\n')) {
    if (!line.trim() || line.startsWith(';')) continue;
    const d = /^@([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (d) { directives[d[1]!] = JSON.parse(d[2]!); continue; }
    items.push(JSON.parse(line));
  }
  return { directives, items };
}

/** The JSON Canvas a CanvasL file projects to (Obsidian's .canvas). */
export function toJsonCanvas(src: string) {
  const { items } = parseCanvasL(src);
  return {
    nodes: items.filter((x) => x.kind !== 'edge').map((x) => ({ id: x.id, type: 'text', x: x.x, y: x.y, width: x.width, height: x.height, text: x.text })),
    edges: items.filter((x) => x.kind === 'edge').map((x) => ({ id: x.id, fromNode: x.fromNode, toNode: x.toNode })),
  };
}
