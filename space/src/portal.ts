// THE PORTAL: every page of the Commons a portal to the same architecture (the author: "update
// documentation an vtt cues so that every html page can share text tracks and media streams between
// them so each page is a portal to the same underlying architecture").
//
// One BroadcastChannel joins the open pages. The state: the pages elect one reader of the Plan 9 floor
// with a Web Lock; it asks agentd once a second and tells every page the tick and the eight states, so
// every page shows the same floor, and when it closes another page takes the lock. The text track: the
// narrative WebVTT, one URL for every page; a page playing it tells the others the cue it is on, so
// every page shows the same cue. The media streams: a page offers a stream by name (a canvas's, a
// camera's); any page may watch it, the offer, the answer and the candidates carried by the channel,
// the stream itself by a local RTCPeerConnection (a MediaStream does not cross a channel). And on each
// page the portal itself, a custom element in a shadow root: the shared tick, the cue, every room, and
// the streams on offer, any of which it can show.

export type Floor = { tick: number; states: Record<string, number> };
export type World = { tiles: { space: string; tile: string; state: string }[] };
export type Cue = { id: string; start: number; end: number; text: string; from: string };
type Msg =
  | { kind: 'floor'; floor: Floor; from: string }
  | { kind: 'world'; world: World; from: string }
  | { kind: 'cue'; cue: Cue }
  | { kind: 'hello'; from: string; page: string }
  | { kind: 'streams'; from: string; page: string; names: string[] }
  | { kind: 'want'; name: string; from: string; to?: string }
  | { kind: 'sdp'; to: string; from: string; sdp: RTCSessionDescriptionInit }
  | { kind: 'ice'; to: string; from: string; candidate: RTCIceCandidateInit };

const params = new URLSearchParams(location.search);
export const AGENTD = params.get('agents') ?? 'http://127.0.0.1:18000/agents';
export const WORLD = (params.get('world') ?? 'http://127.0.0.1:18001').replace(/\/$/, '');
export const NARRATIVE = params.get('vtt') ?? 'http://127.0.0.1:8790/vtt/NARRATIVE/canticle.vtt';
export const ROOMS = ['index', 'map', 'twin', 'walk', 'walkthrough', 'guest', 'xr', 'metaverse', 'polytron', 'agent', 'meta', 'gate', 'serial', 'examples', 'sound-check', 'step'];
const page = location.pathname.split('/').pop()?.replace(/\.html$/, '') || 'index';
const me = `${page}-${Math.random().toString(36).slice(2, 8)}`;
const channel = new BroadcastChannel('commons-portal');
const post = (m: Msg) => channel.postMessage(m);

// ── the state: one reader of the floor, every page told ───────────────
let latest: Floor | null = null;
let reader = false;
const floorWatchers = new Set<(f: Floor) => void>();
const told = (f: Floor) => { latest = f; for (const w of floorWatchers) w(f); };
async function readFloor(): Promise<Floor> {
  const r = await (await fetch(AGENTD, { cache: 'no-store' })).json() as { tick: number; agents: { tag: string; state: string }[] };
  return { tick: r.tick, states: Object.fromEntries(r.agents.map((a) => [a.tag, parseInt(a.state, 16)])) };
}
if ('locks' in navigator) {
  navigator.locks.request('commons-portal-floor', async () => {
    reader = true;
    for (;;) {
      try { const f = await readFloor(); post({ kind: 'floor', floor: f, from: me }); told(f); } catch { /* the floor is away; try again */ }
      await new Promise((r) => setTimeout(r, 1000));
    }
  });
}
/** Every floor the portal hears, the latest at once if there is one. */
export function onFloor(watch: (f: Floor) => void) { floorWatchers.add(watch); if (latest) watch(latest); return () => floorWatchers.delete(watch); }
/** The floor now: the latest the portal heard, or read once if it has heard none. */
export async function floorNow(): Promise<Floor> {
  if (!latest) told(await readFloor());
  return latest!;
}

// ── the world: Metaverse Kit's, served from Plan 9 (mkd), one reader, every page told ──
let world: World | null = null;
let worldReader = false;
const worldWatchers = new Set<(w: World) => void>();
const toldWorld = (w: World) => { world = w; for (const x of worldWatchers) x(w); };
async function readWorld(): Promise<World> {
  const tiles = (await (await fetch(`${WORLD}/tiles`, { cache: 'no-store' })).text()).split('\n').filter(Boolean).map((l) => l.split(' ') as [string, string]);
  return { tiles: await Promise.all(tiles.map(async ([space, tile]) => ({ space, tile, state: await (await fetch(`${WORLD}/state?${space}&${tile}`, { cache: 'no-store' })).text() }))) };
}
if ('locks' in navigator) {
  navigator.locks.request('commons-portal-world', async () => {
    worldReader = true;
    for (;;) {
      try { const w = await readWorld(); post({ kind: 'world', world: w, from: me }); toldWorld(w); } catch { /* the world is away; try again */ }
      await new Promise((r) => setTimeout(r, 2000));
    }
  });
}
/** Every world the portal hears: each tile's state, as the Plan 9 world server folds it. */
export function onWorld(watch: (w: World) => void) { worldWatchers.add(watch); if (world) watch(world); return () => worldWatchers.delete(watch); }

// ── the text track: one narrative, the cue every page is on ───────────
let cue: Cue | null = null;
const cueWatchers = new Set<(c: Cue) => void>();
const cued = (c: Cue) => { cue = c; for (const w of cueWatchers) w(c); };
export function onCue(watch: (c: Cue) => void) { cueWatchers.add(watch); if (cue) watch(cue); return () => cueWatchers.delete(watch); }
/** Attach a track to a media element (the narrative by default) and tell every page each cue it enters. */
export function attachTrack(media: HTMLMediaElement, src = NARRATIVE, label = 'the narrative') {
  const t = document.createElement('track');
  t.kind = 'captions'; t.label = label; t.src = src; t.default = true;
  media.crossOrigin = 'anonymous';
  media.appendChild(t);
  t.track.mode = 'showing';
  t.addEventListener('load', () => {
    for (const c of Array.from(t.track.cues ?? []) as VTTCue[]) {
      c.addEventListener('enter', () => { const x: Cue = { id: c.id, start: c.startTime, end: c.endTime, text: c.text, from: page }; post({ kind: 'cue', cue: x }); cued(x); });
    }
  });
  return t;
}

// ── the media streams: offered by name, watched over a local connection ─
const offered = new Map<string, MediaStream>();
const peers = new Map<string, RTCPeerConnection>();
const streamsBy = new Map<string, { names: string[]; page: string }>();
const streamWatchers = new Set<() => void>();
const changed = () => { for (const w of streamWatchers) w(); };
export function offer(name: string, stream: MediaStream) {
  offered.set(name, stream);
  post({ kind: 'streams', from: me, page, names: [...offered.keys()] });
}
export function onStreams(watch: () => void) { streamWatchers.add(watch); return () => streamWatchers.delete(watch); }
/** The streams other pages offer: name, and the page offering it. */
export function streams(): { name: string; page: string; from: string }[] {
  return [...streamsBy].flatMap(([from, s]) => s.names.map((name) => ({ name, page: s.page, from })));
}
function peer(key: string, other: string) {
  const pc = new RTCPeerConnection();
  pc.onicecandidate = (e) => { if (e.candidate) post({ kind: 'ice', to: other, from: me, candidate: e.candidate.toJSON() }); };
  peers.set(key, pc);
  return pc;
}
/** Watch a stream another page offers. */
export function watch(name: string): Promise<MediaStream> {
  return new Promise((resolve) => {
    const s = streams().find((x) => x.name === name);
    const pc = peer(`${s?.from ?? '*'}:${name}`, s?.from ?? '*');
    pc.ontrack = (e) => resolve(e.streams[0] ?? new MediaStream([e.track]));
    post({ kind: 'want', name, from: me, to: s?.from });
  });
}

channel.onmessage = async (e: MessageEvent<Msg>) => {
  const m = e.data;
  switch (m.kind) {
    case 'floor': if (!reader) told(m.floor); break;
    case 'world': if (!worldReader) toldWorld(m.world); break;
    case 'cue': cued(m.cue); break;
    case 'hello':
      if (offered.size) post({ kind: 'streams', from: me, page, names: [...offered.keys()] });
      if (latest && reader) post({ kind: 'floor', floor: latest, from: me });
      if (world && worldReader) post({ kind: 'world', world, from: me });
      if (cue) post({ kind: 'cue', cue });
      break;
    case 'streams': streamsBy.set(m.from, { names: m.names, page: m.page }); changed(); break;
    case 'want': {
      const stream = offered.get(m.name);
      if (!stream || (m.to && m.to !== me)) break;
      const pc = peer(`${m.from}:${m.name}`, m.from);
      for (const t of stream.getTracks()) pc.addTrack(t, stream);
      await pc.setLocalDescription(await pc.createOffer());
      post({ kind: 'sdp', to: m.from, from: me, sdp: pc.localDescription!.toJSON() });
      break;
    }
    case 'sdp': {
      if (m.to !== me) break;
      if (m.sdp.type === 'offer') {
        const pc = [...peers].find(([k]) => k.startsWith(`${m.from}:`) || k.startsWith('*:'))?.[1];
        if (!pc) break;
        peers.set(`${m.from}:answered`, pc);
        await pc.setRemoteDescription(m.sdp);
        await pc.setLocalDescription(await pc.createAnswer());
        post({ kind: 'sdp', to: m.from, from: me, sdp: pc.localDescription!.toJSON() });
      } else {
        const pc = [...peers].find(([k]) => k.startsWith(`${m.from}:`))?.[1];
        await pc?.setRemoteDescription(m.sdp);
      }
      break;
    }
    case 'ice': {
      if (m.to !== me) break;
      const pc = [...peers].find(([k]) => k.startsWith(`${m.from}:`) || k.startsWith('*:'))?.[1];
      await pc?.addIceCandidate(m.candidate).catch(() => {});
      break;
    }
  }
};
post({ kind: 'hello', from: me, page });

// ── the portal on the page: a custom element in a shadow root ─────────
class CommonsPortal extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>
      :host { position: fixed; left: 12px; bottom: 12px; z-index: 50; font: 12px/1.4 system-ui, sans-serif; color: #edf0e9; }
      details { background: rgba(21, 28, 36, .94); border: 1px solid #34404a; border-radius: 6px; max-width: min(340px, calc(100vw - 24px)); }
      summary { cursor: pointer; padding: 6px 10px; font: 600 11px monospace; color: #9fb0bd; list-style: none; }
      .body { padding: 0 10px 10px; display: grid; gap: 6px; }
      .cue { color: #edf0e9; max-height: 4.2em; overflow: hidden; }
      nav { display: flex; flex-wrap: wrap; gap: 4px 8px; }
      a { color: #8fd0e8; text-decoration: none; } a[aria-current] { color: #e8c36a; }
      button { font: 600 11px system-ui, sans-serif; color: #edf0e9; background: #0c1015; border: 1px solid #34404a; border-radius: 4px; padding: 2px 8px; cursor: pointer; }
      video { width: 100%; border-radius: 4px; background: #000; }
      .muted { color: #9fb0bd; }
    </style><details><summary>portal · <span class="tick">no floor yet</span></summary><div class="body">
      <div class="cue muted">no cue yet</div>
      <div class="world muted">no world yet</div>
      <nav></nav>
      <div class="streams muted">no streams on offer</div>
      <video muted playsinline autoplay hidden></video>
    </div></details>`;
    const $ = (s: string) => root.querySelector(s) as HTMLElement;
    $('nav').innerHTML = ROOMS.map((r) => `<a href="./${r}.html"${r === page ? ' aria-current="page"' : ''}>${r}</a>`).join('');
    onFloor((f) => { $('.tick').textContent = `tick ${f.tick} · ${Object.values(f.states).map((s) => s.toString(16).toUpperCase().padStart(4, '0')).join(' ')}`; });
    onWorld((w) => { const el = $('.world'); el.textContent = `world: ${w.tiles.map((t) => `${t.space} ${t.tile} ${t.state.split('\n').filter((l) => l.startsWith('node_id ') && !/ deleted /.test(l)).length} nodes`).join(' · ')}`; el.classList.remove('muted'); });
    onCue((c) => { const el = $('.cue'); el.textContent = `${c.from}: ${c.text}`; el.classList.remove('muted'); });
    const video = root.querySelector('video')!;
    const list = () => {
      const s = streams(), box = $('.streams');
      box.replaceChildren(...(s.length ? s.map((x) => { const b = document.createElement('button'); b.textContent = `${x.page} · ${x.name}`; b.onclick = async () => { video.srcObject = await watch(x.name); video.hidden = false; }; return b; }) : [document.createTextNode('no streams on offer')]));
    };
    onStreams(list);
    list();
  }
}
if (!customElements.get('commons-portal')) customElements.define('commons-portal', CommonsPortal);
if (!document.querySelector('commons-portal')) document.body?.appendChild(document.createElement('commons-portal'));

(window as unknown as { portal: unknown }).portal = { onFloor, floorNow, onCue, attachTrack, offer, watch, streams, get reader() { return reader; }, get latest() { return latest; }, get cue() { return cue; }, get world() { return world; }, onWorld };
