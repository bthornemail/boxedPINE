// Agent avatars as z-indexed SVG parts, in Light Garden's avatar record format.
//
// omi-files/light-garden/templates/avatar-builder.html composes an avatar from
// parts, each with a z-index, drawn lowest first in a 200 x 200 view, and writes
// them as NDJSON records (avatar.part, then avatar.manifest). An agent's avatar
// here is built the same way from what the agent is: its hue (the colour wheel,
// proofs I-199) as the ring, its depth in WordNet as the head's shape (Light
// Garden's head shapes), its polyform (polyform.ts) as the body, its word as
// the label. The records carry no hash: an avatar is named by its parts' ids.
import { grow, type Declaration } from './polyform.ts';

export type AvatarAgent = { id: number; word: string; depth: number; hue: number | null };
export type Part = { id: string; category: 'ring' | 'head' | 'body' | 'label'; zIndex: number; svg: string };

const HEADS = [
  (f: string, s: string) => `<circle cx="100" cy="92" r="48" fill="${f}" stroke="${s}" stroke-width="3"/>`,
  (f: string, s: string) => `<polygon points="100,44 140,66 140,114 100,136 60,114 60,66" fill="${f}" stroke="${s}" stroke-width="3"/>`,
  (f: string, s: string) => `<polygon points="100,42 142,90 100,138 58,90" fill="${f}" stroke="${s}" stroke-width="3"/>`,
  (f: string, s: string) => `<polygon points="100,42 148,128 52,128" fill="${f}" stroke="${s}" stroke-width="3"/>`,
  (f: string, s: string) => `<polygon points="120,44 140,64 140,116 120,136 80,136 60,116 60,64 80,44" fill="${f}" stroke="${s}" stroke-width="3"/>`,
] as const;
export const HEAD_NAMES = ['circle', 'hex', 'diamond', 'tetra', 'octagon'] as const;

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const hueColor = (hue: number | null, light: number) => (hue === null ? `hsl(0 0% ${light}%)` : `hsl(${hue} 70% ${light}%)`);

/** The agent's polyform: deeper synsets have more cells (2D, 3 to 8). */
export const avatarDeclaration = (a: AvatarAgent): Declaration => ({ basis: 0, degree: Math.min(3 + Math.max(a.depth - 5, 0), 8), dimension: 1, group: 0 });

/** The parts, by z-index: ring 0, head 5, body 10, label 20. */
export function avatarParts(a: AvatarAgent): Part[] {
  const fill = hueColor(a.hue, 22), stroke = hueColor(a.hue, 62), bright = hueColor(a.hue, 55);
  const cells = grow(avatarDeclaration(a), a.id & 0xffff);
  const xs = cells.map((c) => c[0]), zs = cells.map((c) => c[2]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2, u = 13;
  const body = cells.map(([x, , z]) => `<rect x="${100 + (x - cx) * u - u / 2}" y="${92 + (z - cz) * u - u / 2}" width="${u - 1}" height="${u - 1}" fill="${bright}"/>`).join('');
  const ring = a.hue === null
    ? `<circle cx="100" cy="92" r="70" fill="none" stroke="${stroke}" stroke-width="4" stroke-dasharray="6 6"/>`
    : `<circle cx="100" cy="92" r="70" fill="none" stroke="${stroke}" stroke-width="6"/>`;
  return [
    { id: `ring.${a.hue === null ? 'none' : a.hue}`, category: 'ring', zIndex: 0, svg: ring },
    { id: `head.${HEAD_NAMES[a.depth % 5]}`, category: 'head', zIndex: 5, svg: HEADS[a.depth % 5]!(fill, stroke) },
    { id: `body.${cells.length}`, category: 'body', zIndex: 10, svg: body },
    { id: `label.${a.id}`, category: 'label', zIndex: 20, svg: `<text x="100" y="188" text-anchor="middle" font-family="monospace" font-size="18" fill="${stroke}">${esc(a.word.slice(0, 16))}</text>` },
  ];
}

/** The parts drawn lowest z-index first, as one SVG. */
export function avatarSvg(a: AvatarAgent): string {
  const parts = [...avatarParts(a)].sort((p, q) => p.zIndex - q.zIndex);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${parts.map((p) => `<g data-part="${p.id}">${p.svg}</g>`).join('')}</svg>`;
}

/** Light Garden's NDJSON records for the avatar: one avatar.part per part, then avatar.manifest. */
export function avatarRecords(a: AvatarAgent): string {
  const parts = [...avatarParts(a)].sort((p, q) => p.zIndex - q.zIndex);
  let seq = 0;
  const lines = parts.map((p) => ({ schema_version: 1, kind: 'avatar.part', lane: 'avatar', seq: ++seq, event: 'avatar.part.add', payload: { part_id: p.id, category: p.category, name: a.word, z_index: p.zIndex, svg_source: 'inline' } }));
  lines.push({ schema_version: 1, kind: 'avatar.manifest', lane: 'avatar', seq: ++seq, event: 'avatar.compose.end', payload: { pass: true, part_ids: parts.map((p) => p.id), z_order: parts.map((p) => p.zIndex) } } as never);
  return lines.map((l) => JSON.stringify(l)).join('\n') + '\n';
}
