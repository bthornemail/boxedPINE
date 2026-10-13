// THE AGENT CHANNEL: what passes between the page and the coding agent
//
// The author, 2026-10-13: "want to setup a webmcp, webxr and webmedia api to
// communicate with my coding agent". The page (space/agent.html) and the coding
// agent in the terminal meet at a bridge (repl/src/agent-bridge.ts): the page
// talks to it over HTTP, the agent over MCP. Both sides use the messages and
// tools here, so they cannot drift apart.
//
// A message names what it points at by its /A-Z0-9/ tag (the record number in
// base 36, I-141 is 3X): tags name the literals, never a hash.

export type From = 'author' | 'agent';
// `by` names which coding agent spoke (claude-code, opencode), when more than one shares the bridge
export type Message =
  | { kind: 'say'; from: From; text: string; by?: string }
  | { kind: 'point'; from: From; tag: string; how: 'xr' | 'pointer' | 'tool'; by?: string }
  | { kind: 'show'; from: 'agent'; tag: string; by?: string };
export type Posted = Message & { id: number; at: number };

export const BRIDGE_PORT = 8743;
export const TAG = /^[A-Z0-9]{1,8}$/;

/** A record's tag from its id: I-141 -> 3X, I-127b -> 3JB. */
export const tagOf = (id: string) => {
  const m = /^I-(\d+)([a-z]?)$/.exec(id);
  if (!m) throw new Error(`not a record id: ${id}`);
  return (Number(m[1]).toString(36) + m[2]).toUpperCase();
};
/** And back: 3X -> I-141, 3JB -> I-127b. */
export const idOf = (tag: string) => `I-${parseInt(tag.slice(0, 2), 36)}${tag.slice(2).toLowerCase()}`;

/** Check a message arriving from outside; return it, or the reason it is refused. */
export const AGENT_NAME = /^[a-z0-9-]{1,32}$/;
export function check(x: unknown): Message | string {
  const m = x as Record<string, unknown>;
  if (!m || typeof m !== 'object') return 'not an object';
  if (m.from !== 'author' && m.from !== 'agent') return 'from is author or agent';
  if (m.by !== undefined && (m.from !== 'agent' || typeof m.by !== 'string' || !AGENT_NAME.test(m.by))) return 'by names an agent: a-z, 0-9 and -';
  const by = m.by === undefined ? {} : { by: m.by as string };
  if (m.kind === 'say') return typeof m.text === 'string' && m.text.trim() && m.text.length <= 4000 ? { kind: 'say', from: m.from, text: m.text.trim(), ...by } : 'say needs text (1 to 4000 characters)';
  if (m.kind === 'point') return typeof m.tag === 'string' && TAG.test(m.tag) && ['xr', 'pointer', 'tool'].includes(m.how as string) ? { kind: 'point', from: m.from, tag: m.tag, how: m.how as 'xr', ...by } : 'point needs an /A-Z0-9/ tag and how (xr, pointer, tool)';
  if (m.kind === 'show') return m.from === 'agent' && typeof m.tag === 'string' && TAG.test(m.tag) ? { kind: 'show', from: 'agent', tag: m.tag, ...by } : 'show is the agent\'s, with an /A-Z0-9/ tag';
  return 'kind is say, point or show';
}

/** One line for a reader: "[3X I-141] pointed at in XR". */
export function line(p: Posted): string {
  const t = new Date(p.at).toISOString().slice(11, 19);
  const who = p.by ?? p.from;
  if (p.kind === 'say') return `${t} #${p.id} ${who}: ${p.text}`;
  if (p.kind === 'point') return `${t} #${p.id} ${who} pointed at ${p.tag} (${idOf(p.tag)}) by ${p.how}`;
  return `${t} #${p.id} ${who} shows ${p.tag} (${idOf(p.tag)})`;
}

type Schema = { type: 'object'; properties: Record<string, { type: string; description: string }>; required?: string[] };
export type Tool = { name: string; description: string; inputSchema: Schema };

/** The tools the coding agent gets over MCP. */
export const AGENT_TOOLS: Tool[] = [
  { name: 'inbox', description: 'Read what the author said or pointed at on the page since message id `since` (0 for everything held). The bridge keeps messages only while it runs.', inputSchema: { type: 'object', properties: { since: { type: 'number', description: 'the last message id already read' } } } },
  { name: 'say', description: 'Send a reply to the page; it is shown, and read aloud if the author turned speech on.', inputSchema: { type: 'object', properties: { text: { type: 'string', description: 'the reply' } }, required: ['text'] } },
  { name: 'show', description: 'Light a record on the page and in XR, by its /A-Z0-9/ tag (I-141 is 3X).', inputSchema: { type: 'object', properties: { tag: { type: 'string', description: 'the record tag' } }, required: ['tag'] } },
];

/** The tools the page registers with the browser's own agent (WebMCP). */
export const PAGE_TOOLS: Tool[] = [
  { name: 'tell_coding_agent', description: 'Pass a message to the author\'s coding agent in the terminal.', inputSchema: { type: 'object', properties: { text: { type: 'string', description: 'the message' } }, required: ['text'] } },
  { name: 'point_at_record', description: 'Point the coding agent at a proofs record by its /A-Z0-9/ tag.', inputSchema: { type: 'object', properties: { tag: { type: 'string', description: 'the record tag, e.g. 3X' } }, required: ['tag'] } },
  { name: 'read_agent_replies', description: 'Read the coding agent\'s replies shown on this page.', inputSchema: { type: 'object', properties: {} } },
];

// ---- Tracking the conversation on the 16-index ----
// The author, 2026-10-13: "use a set of the 14 Fano planes and 2 Hasse diagrams
// to track the conversation". The sixteen Fano icons are the 16-index (the
// Fano constants, I-101; proofs/svg-docs): 0 the empty plane, 1-7 the points,
// 8-14 the lines, 15 the full plane. The fourteen between the ends are the
// tickets of the Fano lottery (I-191: points 1-7 and lines 8-14, the two halves).
// Message n lands on slot 1 + (n - 1) mod 14; each side (author, agent) has its
// own Hasse diagram, lighting the slots its messages landed on; when all 14 are
// lit the round is complete and the full plane lights.

/** The icon at each place of the 16-index (proofs/svg/fano). */
export const INDEX16 = ['Fano_empty', 'Fano_point_1', 'Fano_point_2', 'Fano_point_3', 'Fano_point_4', 'Fano_point_5', 'Fano_point_6', 'Fano_point_7',
  'Fano_line_3_5_6', 'Fano_line_1_7_6', 'Fano_line_2_7_5', 'Fano_line_1_3_2', 'Fano_line_4_7_3', 'Fano_line_1_5_4', 'Fano_line_2_6_4', 'Fano_full'];
/** Which points each place holds: point n is bit n - 1 (the masks the icons read as). */
export const MASK16 = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x34, 0x61, 0x52, 0x07, 0x4c, 0x19, 0x2a, 0x7f];

/** The slot of message n: one of the fourteen tickets, 1..14. */
export const slotOf = (id: number) => 1 + ((id - 1) % 14);

/** Hasse diagram edges of the 16-index: a covers b when b's points are inside a's and a is one level up. */
export const HASSE16: [number, number][] = (() => {
  const level = (i: number) => (i === 0 ? 0 : i <= 7 ? 1 : i <= 14 ? 2 : 3);
  const edges: [number, number][] = [];
  for (let a = 0; a < 16; a++) for (let b = 0; b < 16; b++)
    if (level(a) === level(b) + 1 && (MASK16[a]! & MASK16[b]!) === MASK16[b]) edges.push([a, b]);
  return edges;
})();

/** Each side's lit slots and completed rounds, from the messages so far. */
export function track(messages: Posted[]) {
  const side = (from: From) => {
    const mine = messages.filter((m) => m.from === from);
    const lit = new Set<number>();
    let rounds = 0;
    for (const m of mine) { lit.add(slotOf(m.id)); if (lit.size === 14) { rounds++; lit.clear(); } }
    return { lit: lit.size ? new Set([0, ...lit]) : new Set([0]), rounds, last: mine.length ? slotOf(mine.at(-1)!.id) : 0 };
  };
  return { author: side('author'), agent: side('agent') };
}
