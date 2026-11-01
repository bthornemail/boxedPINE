// THE WORLD: Metaverse Kit's world as its Plan 9 server gives it (unbound PLAN9/src/mkfs.c, mkd.c; zmk's
// fold), read by the Living World (metaverse.ts) and, through the portal (portal.ts), by every page.
// A tile's state is one line a node, as zmk writes it.

export type WorldNode = { id: string; kind: string; deleted: boolean; transform: string[]; properties: [string, string][]; links: [string, string][]; blocks: string[] };
export const BLOCKS = ['geometry', 'media', 'text', 'document'];

/** One state line: node_id N kind K [deleted] transform (10) properties (k v)... links (rel to)... [block ...]... */
export function parse(line: string): WorldNode {
  const t = line.split(' ');
  const n: WorldNode = { id: t[1], kind: t[3], deleted: t[4] === 'deleted', transform: [], properties: [], links: [], blocks: [] };
  let i = t.indexOf('transform', 4) + 1;
  n.transform = t.slice(i, i + 10);
  i += 11; // past "properties"
  for (; i < t.length && t[i] !== 'links'; i += 2) n.properties.push([t[i], t[i + 1]]);
  for (i++; i < t.length && !BLOCKS.includes(t[i]); i += 2) n.links.push([t[i], t[i + 1]]);
  if (i < t.length) n.blocks = t.slice(i).join(' ').split(new RegExp(` (?=${BLOCKS.join('|')} kind )`));
  return n;
}

/** A tile's state: its nodes, one a line. */
export const parseState = (text: string) => text.split('\n').filter((l) => l.startsWith('node_id ')).map(parse);
/** The kind's hue, as the Living World colours it. */
export const hue = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
