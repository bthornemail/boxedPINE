// THE FIFTEEN TREEMAP ALGORITHMS
//
// The tree's files 1–15 (core/src/verified/tree.ts); file 0 is the BOM, which
// holds the Prompt Tree (wiki: SPEC-26). Order, aspect ratio and stability are
// from the "Treemapping" article on Wikipedia, as the author pasted it on
// 2026-10-09.
//
// DECISION: enumerate first. Files 1–15 follow the article's order, which is
// already grouped by order class: partially ordered, ordered, unordered.
// The ASCII categorical cascade is a second reading (asciiCascade below).

export type Order = 'partially ordered' | 'ordered' | 'unordered';
export type Aspect = 'very high' | 'high' | 'medium' | 'low';
export type Stability = 'stable' | 'medium' | 'low';
export type Treemap = { file: number; name: string; order: Order; aspect: Aspect; stability: Stability };

const row = (file: number, name: string, order: Order, aspect: Aspect, stability: Stability): Treemap =>
  ({ file, name, order, aspect, stability });

export const TREEMAPS: readonly Treemap[] = Object.freeze([
  row(1, 'BinaryTree', 'partially ordered', 'high', 'stable'),
  row(2, 'Slice And Dice', 'ordered', 'very high', 'stable'),
  row(3, 'Strip', 'ordered', 'medium', 'medium'),
  row(4, 'Pivot by middle', 'ordered', 'medium', 'medium'),
  row(5, 'Pivot by split', 'ordered', 'medium', 'low'),
  row(6, 'Pivot by size', 'ordered', 'medium', 'medium'),
  row(7, 'Split', 'ordered', 'medium', 'medium'),
  row(8, 'Spiral', 'ordered', 'medium', 'medium'),
  row(9, 'Hilbert', 'ordered', 'medium', 'medium'),
  row(10, 'Moore', 'ordered', 'medium', 'medium'),
  row(11, 'Squarified', 'unordered', 'low', 'low'),
  row(12, 'Mixed Treemaps', 'unordered', 'low', 'medium'),
  row(13, 'Approximation', 'unordered', 'low', 'medium'),
  row(14, 'Git', 'unordered', 'medium', 'stable'),
  row(15, 'Local moves', 'unordered', 'medium', 'stable'),
]);

/** How many algorithms fall in each class of one property. */
export function partition<K extends 'order' | 'aspect' | 'stability'>(key: K): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of TREEMAPS) out[t[key]] = (out[t[key]] ?? 0) + 1;
  return out;
}

/** The names in ASCII order (code unit by code unit), with their files. */
export function asciiCascade(): { file: number; name: string }[] {
  return [...TREEMAPS]
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .map(({ file, name }) => ({ file, name }));
}
