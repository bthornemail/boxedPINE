// THE MAP: the Agent Commons as z-indexed 2D and 2.5D maps (space/map.html)
//
// The author: give the agents an SVG icon "so that we can abstract the frame
// away; we can make them z-indexed 2D and 2.5D maps, and leave 3D as an
// interactive playground" (the Commons, index.html). The 144 colour synsets
// (proofs I-199) stand on the colour wheel: their hue is the angle, their
// depth in WordNet the distance out; those without a hue (the route up to
// entity, and the achromatic) stand on the inner ring. Each wears its avatar
// (avatar.ts). In 2D they are drawn shallowest first, so deeper synsets lie on
// top (the z-index is the depth); in 2.5D the wheel tilts, depth lifts each
// one, and they are drawn back to front. Each steps its own K on its own beat
// and leans to the sector its state names. Speakers on the agent bridge join,
// stepping once per message, and walk to a colour their message names.
import { avatarSvg, hueColor, type AvatarAgent } from './avatar.ts';
import { K } from './gnomon.ts';
import { sectorOf, speakerSeed, namedSynset, type SynsetAgent } from './commons-agents.ts';
import { BRIDGE_PORT } from '../../rosetta/src/agent.ts';

type Color = AvatarAgent & { parent: number | null; hueFrom: string | null };
type Placed = { a: AvatarAgent; x: number; y: number; z: number; state: number; beat: number; next: number; el: SVGGElement; to?: { x: number; y: number } };

const NS = 'http://www.w3.org/2000/svg';
const svg = document.querySelector<SVGSVGElement>('#map')!;
const status = document.querySelector<HTMLElement>('#status')!;
let mode: '2d' | '2.5d' = (new URLSearchParams(location.search).get('view') === '2.5d') ? '2.5d' : '2d';
const placed: Placed[] = [];
let colors: Color[] = [];

/** Where an agent stands on the wheel: hue the angle, depth the distance; no hue, the inner ring. */
export function wheelPlace(c: AvatarAgent, i: number, noHue: number, count: number) {
  if (c.hue === null) { const a = (noHue / Math.max(count, 1)) * 2 * Math.PI; return { x: Math.cos(a) * 85, y: Math.sin(a) * 85 }; }
  const a = ((c.hue - 90) * Math.PI) / 180, r = 150 + (c.depth - 7) * 85 + (i % 3) * 14;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r };
}

function project(x: number, y: number, z: number): [number, number] {
  return mode === '2d' ? [x, y] : [(x - y) * 0.82, (x + y) * 0.41 - z * 14];
}

function icon(a: AvatarAgent, size: number) {
  const g = document.createElementNS(NS, 'g');
  const img = document.createElementNS(NS, 'image');
  img.setAttribute('href', `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg(a))}`);
  img.setAttribute('width', String(size)); img.setAttribute('height', String(size));
  img.setAttribute('x', String(-size / 2)); img.setAttribute('y', String(-size / 2));
  const title = document.createElementNS(NS, 'title');
  title.textContent = `${a.word} · depth ${a.depth} · ${a.hue === null ? 'no hue' : `hue ${a.hue}`}`;
  g.append(title, img);
  return g;
}

function draw() {
  svg.replaceChildren();
  svg.setAttribute('viewBox', mode === '2d' ? '-820 -560 1380 1120' : '-1020 -460 1700 860');
  // the wheel: 12 sectors of 30 (I-199)
  const wheel = document.createElementNS(NS, 'g');
  for (let s = 0; s < 12; s++) {
    const a0 = ((s * 30 - 90 - 15) * Math.PI) / 180, a1 = ((s * 30 - 90 + 15) * Math.PI) / 180, r = 520;
    const pts = [[0, 0], [Math.cos(a0) * r, Math.sin(a0) * r], [Math.cos(a1) * r, Math.sin(a1) * r]].map(([x, y]) => project(x!, y!, 0).join(',')).join(' ');
    const p = document.createElementNS(NS, 'polygon');
    p.setAttribute('points', pts); p.setAttribute('fill', hueColor(s * 30, 14)); p.setAttribute('stroke', '#0c1015'); p.setAttribute('stroke-width', '2');
    wheel.append(p);
  }
  svg.append(wheel);
  // the agents, in z order: 2D by depth (deeper on top), 2.5D back to front
  const order = [...placed].sort((p, q) => (mode === '2d' ? p.a.depth - q.a.depth : (p.x + p.y) - (q.x + q.y)));
  for (const p of order) {
    if (mode === '2.5d') {
      const stem = document.createElementNS(NS, 'line');
      const [x0, y0] = project(p.x, p.y, 0), [x1, y1] = project(p.x, p.y, p.z);
      stem.setAttribute('x1', String(x0)); stem.setAttribute('y1', String(y0)); stem.setAttribute('x2', String(x1)); stem.setAttribute('y2', String(y1));
      stem.setAttribute('stroke', hueColor(p.a.hue, 40)); stem.setAttribute('stroke-width', '1.5');
      svg.append(stem);
    }
    svg.append(p.el);
  }
  place();
  document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === mode)));
}

function place() {
  for (const p of placed) {
    const lean = p.to ? 0 : (sectorOf(p.state) - 3.5) * 2.2;
    const [x, y] = project(p.x + lean, p.y - lean, p.z);
    p.el.setAttribute('transform', `translate(${x} ${y})`);
  }
}

function add(a: AvatarAgent, x: number, y: number, beat: number) {
  const size = a.depth <= 6 ? 46 : 36;
  const p: Placed = { a, x, y, z: a.depth, state: a.id & 0xffff, beat, next: 0, el: icon(a, size) };
  placed.push(p);
  return p;
}

fetch(new URL('../polytron/colors.json', location.href)).then((r) => r.json()).then((m: { colors: Color[] }) => {
  colors = m.colors;
  let noHue = 0;
  const count = colors.filter((c) => c.hue === null).length;
  colors.forEach((c, i) => { const at = wheelPlace(c, i, c.hue === null ? noHue++ : 0, count); add(c, at.x, at.y, 2000 + (c.id % 13) * 150); });
  // Light Garden's eight characters (docs/index.md): ratio x 360 is the hue; the Observer, white, at the centre
  CHARACTERS.forEach(([word, ratio], i) => {
    const hue = ratio === null ? null : Math.round(ratio * 360);
    const a = ((hue ?? 0) - 90) * Math.PI / 180, r = hue === null ? 0 : 480;
    add({ id: 0x10000 + i, word, depth: 6, hue }, Math.cos(a) * r, Math.sin(a) * r, 3000 + i * 211);
  });
  status.textContent = `${colors.length} colour synsets: ${colors.filter((c) => c.hue !== null).length} on the wheel by hue, ${count} on the inner ring`;
  draw();
}).catch(() => { status.textContent = 'no colours: run node scripts/polytron-commons.mjs'; });

/** Light Garden's characters and their ratios of the circle (omi-files/light-garden/docs/index.md). */
export const CHARACTERS: [string, number | null][] = [['Metatron', 0], ['Solomon', 1 / 12], ['Solon', 1 / 6], ['ʿAsabiyyah', 1 / 3], ['Enoch', 2 / 3], ['Speaker', 3 / 4], ['Genesis', 5 / 6], ['Observer', null]];

const speakers = new Map<string, Placed>();
const events = new EventSource(`http://127.0.0.1:${Number(new URLSearchParams(location.search).get('bridge')) || BRIDGE_PORT}/events`);
events.onmessage = (e) => {
  const m = JSON.parse(e.data) as { from: string; by?: string; text?: string };
  const name = m.by ?? m.from;
  let p = speakers.get(name);
  if (!p) { p = add({ id: speakerSeed(name), word: name, depth: 0, hue: null }, 0, 0, Infinity); speakers.set(name, p); draw(); }
  p.state = K(p.state);
  const named = m.text ? namedSynset(m.text, colors.map((c) => ({ ...c, gloss: '', geometry: '', svg: {} }) as SynsetAgent)) : undefined;
  const target = named && placed.find((q) => q.a.id === named.id);
  if (target) p.to = { x: target.x + 18, y: target.y + 18 };
};

document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((b) => b.addEventListener('click', () => {
  mode = b.dataset.view as typeof mode;
  history.replaceState(null, '', `?view=${mode}`);
  draw();
}));

function tick(time: number) {
  for (const p of placed) {
    if (Number.isFinite(p.beat) && time >= p.next) { p.state = K(p.state); p.next = time + p.beat; }
    if (p.to) { p.x += (p.to.x - p.x) * .05; p.y += (p.to.y - p.y) * .05; }
  }
  place();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
