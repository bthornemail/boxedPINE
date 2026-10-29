// The Living World: Metaverse Kit's world, served native from Plan 9 (unbound PLAN9 src/mkfs.c,
// the world as a 9P file server, and src/mkd.c, it over HTTP, normally 127.0.0.1:18001). Each tile's
// state is the kit's fold (src/zmk.c) of its append-only events, one node a line; this room draws the
// nodes from above (x and z of each position), their links, and appends an event when the grammar
// (wsn/mkevent.wsn) accepts it. The kit's own client stays reachable below.
const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const canvas = $<HTMLCanvasElement>('#world');
const source = $<HTMLInputElement>('#src');
const tileSel = $<HTMLSelectElement>('#tile');
const status = $<HTMLElement>('#status');
const lines = $<HTMLPreElement>('#lines');
const draft = $<HTMLTextAreaElement>('#event');
const client = $<HTMLAnchorElement>('#client');

type Node = { id: string; kind: string; deleted: boolean; transform: string[]; properties: [string, string][]; links: [string, string][]; blocks: string[] };
const BLOCKS = ['geometry', 'media', 'text', 'document'];

function validSource(value: string) {
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && ['localhost', '127.0.0.1'].includes(url.hostname);
  } catch {
    return false;
  }
}

/** One state line: node_id N kind K [deleted] transform (10) properties (k v)... links (rel to)... [block ...]... */
function parse(line: string): Node {
  const t = line.split(' ');
  const n: Node = { id: t[1], kind: t[3], deleted: t[4] === 'deleted', transform: [], properties: [], links: [], blocks: [] };
  let i = t.indexOf('transform', 4) + 1;
  n.transform = t.slice(i, i + 10);
  i += 11; // past "properties"
  for (; i < t.length && t[i] !== 'links'; i += 2) n.properties.push([t[i], t[i + 1]]);
  for (i++; i < t.length && !BLOCKS.includes(t[i]); i += 2) n.links.push([t[i], t[i + 1]]);
  if (i < t.length) n.blocks = t.slice(i).join(' ').split(new RegExp(` (?=${BLOCKS.join('|')} kind )`));
  return n;
}

const hue = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

function draw(nodes: Node[]) {
  const ctx = canvas.getContext('2d')!;
  const dpr = devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#0c1015'; ctx.fillRect(0, 0, w, h);
  const live = nodes.filter((n) => !n.deleted);
  const at = new Map(live.map((n) => [n.id, [Number(n.transform[0]), Number(n.transform[2])] as const]));
  const xs = [...at.values()].map((p) => p[0]), zs = [...at.values()].map((p) => p[1]);
  const [x0, x1, z0, z1] = [Math.min(...xs, -1), Math.max(...xs, 1), Math.min(...zs, -1), Math.max(...zs, 1)];
  const pad = 70, s = Math.min((w - 2 * pad) / (x1 - x0), (h - 2 * pad) / (z1 - z0));
  const screen = ([x, z]: readonly [number, number]) => [w / 2 + (x - (x0 + x1) / 2) * s, h / 2 + (z - (z0 + z1) / 2) * s];
  ctx.strokeStyle = '#34404a'; ctx.lineWidth = 1;
  for (const n of live) for (const [, to] of n.links) {
    const a = at.get(n.id), b = at.get(to);
    if (!a || !b) continue;
    const [ax, ay] = screen(a), [bx, by] = screen(b);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
  }
  ctx.font = '12px ui-monospace, monospace'; ctx.textAlign = 'center';
  for (const n of live) {
    const [x, y] = screen(at.get(n.id)!);
    ctx.fillStyle = `hsl(${hue(n.kind)} 60% 60%)`;
    if (n.kind.endsWith('rectangle')) ctx.fillRect(x - 7, y - 7, 14, 14);
    else { ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#edf0e9'; ctx.fillText(n.id, x, y - 13);
  }
}

const base = () => source.value.trim().replace(/\/$/, '');

async function loadTiles() {
  const r = await fetch(`${base()}/tiles`, { cache: 'no-store' });
  const tiles = (await r.text()).trim().split('\n').filter(Boolean);
  const keep = tileSel.value;
  tileSel.replaceChildren(...tiles.map((t) => new Option(t, t.replace(' ', '&'))));
  if (tiles.some((t) => t.replace(' ', '&') === keep)) tileSel.value = keep;
}

async function refresh() {
  if (!validSource(source.value.trim())) { status.textContent = 'Use a localhost or 127.0.0.1 world URL.'; return; }
  try {
    if (!tileSel.value) await loadTiles();
    const [state, events] = await Promise.all(['state', 'events'].map(async (f) => (await fetch(`${base()}/${f}?${tileSel.value}`, { cache: 'no-store' })).text()));
    const nodes = state.trim().split('\n').filter(Boolean).map(parse);
    draw(nodes);
    lines.textContent = state;
    const deleted = nodes.filter((n) => n.deleted).length;
    status.textContent = `${tileSel.value.replace('&', ' ')}: ${events.trim().split('\n').filter(Boolean).length} events, ${nodes.length - deleted} nodes live, ${deleted} deleted. From Plan 9 at ${new URL(base()).host}.`;
  } catch {
    status.textContent = `No world at ${base()}. In the Plan 9 guest: rc mkworld.rc -s (unbound PLAN9/src).`;
  }
}

async function append() {
  const r = await fetch(`${base()}/events?${tileSel.value}`, { method: 'POST', body: draft.value.trim() + '\n' });
  status.textContent = r.ok ? `Appended. ${(await r.text()).trim()}` : `Refused: ${(await r.text()).trim()}`;
  if (r.ok) await refresh();
}

$('#connect').addEventListener('click', async () => { tileSel.replaceChildren(); await refresh(); });
source.addEventListener('keydown', (e) => { if (e.key === 'Enter') $<HTMLButtonElement>('#connect').click(); });
tileSel.addEventListener('change', refresh);
$('#append').addEventListener('click', append);
addEventListener('resize', refresh);

async function loadEnvironment() {
  try {
    const response = await fetch('./environment.json', { cache: 'no-store' });
    if (!response.ok) return;
    const environment = await response.json() as { runtime?: { worldUrl?: string; clientUrl?: string } };
    const { worldUrl, clientUrl } = environment.runtime ?? {};
    if (worldUrl && validSource(worldUrl)) source.value = worldUrl;
    if (clientUrl && validSource(clientUrl)) client.href = clientUrl;
  } catch {
    // The static room keeps its defaults when no manifest is served.
  }
}
await loadEnvironment();
await refresh();
setInterval(refresh, 3000);
