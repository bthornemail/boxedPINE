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
import { newState, frameGate, written, READ } from './exchange.ts';
import { CHARACTER_TAGS } from './border.ts';
import { LINES, choices, linesThrough, newWalker, step as storyStep, type Passage } from './story.ts';
import { parseTerms, BEAT } from './score.ts';
import { recordWitness } from './witness.ts';
import { fileOf } from './exchange.ts';

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

// ── A character's state: Atomics.compareExchange(svg, 60 ^ frame, 127, 63), the frame handed over through a Proxy (exchange.ts) ──
const pick = document.querySelector<HTMLSelectElement>('#character')!;
for (const tag of Object.values(CHARACTER_TAGS)) pick.add(new Option(tag, tag));
const bytesSvg = document.querySelector<SVGSVGElement>('#bytes')!;
const cells = [...Array(128).keys()].map((i) => { const r = document.createElementNS(NS, 'rect'); r.setAttribute('x', String(i % 16)); r.setAttribute('y', String(i >> 4)); r.setAttribute('width', '.92'); r.setAttribute('height', '.92'); bytesSvg.append(r); return r; });
let state = newState(), gate = frameGate(state), frame = 0, shown = '';
pick.addEventListener('change', () => { state = newState(); gate = frameGate(state); frame = 0; });
function exchangeFrame() {
  gate.frame = frame++;
  const outcome = gate.last;
  if (!outcome || !outcome.ok) { document.querySelector('#exchange')!.textContent = `frame ${frame - 1}: ${outcome && !outcome.ok ? String(outcome.error) : 'no exchange'}`; return; }
  const { index, read, file } = outcome.value;
  cells.forEach((c, i) => c.setAttribute('fill', state[i] === READ ? '#e2b66c' : '#5b8de0'));
  cells[index]!.setAttribute('fill', '#ffffff');
  const src = new URL(`../characters/${pick.value}/${file}.svg`, location.href).href;
  if (src !== shown) { document.querySelector<HTMLImageElement>('#hasse')!.src = src; shown = src; }
  document.querySelector('#exchange')!.textContent = `frame ${frame - 1} · byte ${index} read ${read} · ${file} · ${written(state)}/128 written`;
}

// ── The story: the selected character walks the plane (story.ts) ──
let passages: Passage[] = [];
let walker = newWalker(0);
const names = (line: number) => LINES[line - 1]!.map((p) => CHARACTER_TAGS[p]).join(' · ');
function startWalk() {
  const point = Number(Object.entries(CHARACTER_TAGS).find(([, t]) => t === pick.value)?.[0] ?? 8);
  const line = point <= 7 ? linesThrough(point)[0]! : 1;
  walker = newWalker([...pick.value].reduce((v, c) => ((v << 8) | c.charCodeAt(0)) & 0xffff, 0), line);
  showStory(null);
}
function showStory(last: ReturnType<typeof storyStep> | null) {
  const here = last?.passage ?? passages.find((p) => p.on === 'line' && p.at === walker.line);
  document.querySelector('#story-where')!.textContent = `${pick.value} on line ${walker.line} {${LINES[walker.line - 1]!.join(',')}}: ${names(walker.line)}${last ? ` · came through ${last.character} (${last.decision?.series ?? ''})` : ''}`;
  document.querySelector('#story-text')!.textContent = here ? `${here.series} · ${here.event ?? ''}: ${here.text}` : '(no passage on this line)';
  const box = document.querySelector('#story-choices')!;
  box.replaceChildren();
  for (const c of choices(walker.line)) for (const l of c.lines) {
    const b = document.createElement('button');
    b.textContent = `${c.character} → line ${l}`;
    b.title = `through ${c.character} to {${LINES[l - 1]!.join(',')}}: ${names(l)}`;
    b.addEventListener('click', () => showStory(storyStep(walker, passages, { point: c.point, line: l })));
    box.append(b);
  }
  const k = document.createElement('button');
  k.textContent = 'by K';
  k.title = 'let K choose (alone, a walk closes into a loop and may not reach every line)';
  k.addEventListener('click', () => showStory(storyStep(walker, passages)));
  box.append(k);
}
pick.addEventListener('change', startWalk);

// ── The witness: the selected agent's next 8 steps by K, recorded to video (witness.ts) ──
document.querySelector('#witness-go')!.addEventListener('click', async () => {
  const button = document.querySelector<HTMLButtonElement>('#witness-go')!, canvas = document.querySelector<HTMLCanvasElement>('#witness-canvas')!, video = document.querySelector<HTMLVideoElement>('#witness-video')!;
  const ahead = structuredClone(walker);
  const steps = [...Array(8).keys()].map((i) => { const s = storyStep(ahead, passages); return { point: s.point, line: s.line, state: fileOf(Math.round(i * BEAT * 60)) === 'Hasse_XOR' ? 'read' as const : 'write' as const }; });
  const hue = colors.find((c) => c.word.toUpperCase() === pick.value)?.hue ?? (Object.entries(CHARACTER_TAGS).findIndex(([, t]) => t === pick.value) * 51) % 360;
  button.disabled = true; button.textContent = 'recording…'; canvas.style.display = 'block'; video.style.display = 'none';
  try { video.src = await recordWitness(canvas, pick.value, hue, steps); video.style.display = 'block'; canvas.style.display = 'none'; }
  catch (e) { document.querySelector('#terms-said')!.textContent = `the witness could not record: ${(e as Error).message}`; }
  button.disabled = false; button.textContent = 'record the witness';
});

// ── Uppercase terms: METATRON P2 L6 takes a step; CATCH n moves the reset (score.ts parseTerms) ──
document.querySelector('#terms-form')!.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.querySelector<HTMLInputElement>('#terms')!, said = document.querySelector('#terms-said')!;
  const cmd = parseTerms(input.value);
  if ('error' in cmd) { said.textContent = cmd.error; return; }
  if ('catch' in cmd) { gate.catchAt = cmd.catch; said.textContent = `the reset fires at byte ${cmd.catch}, frame ${60 ^ cmd.catch} of each half`; input.value = ''; return; }
  if (pick.value !== cmd.agent) { pick.value = cmd.agent; startWalk(); }
  if (cmd.point && cmd.line) {
    try { showStory(storyStep(walker, passages, { point: cmd.point, line: cmd.line })); said.textContent = `${cmd.agent} through P${cmd.point} to L${cmd.line}`; }
    catch (err) { said.textContent = (err as Error).message; return; }
  } else said.textContent = `${cmd.agent}`;
  input.value = '';
});
fetch(new URL('../story/passages.json', location.href)).then((r) => r.json()).then((m: { passages: Passage[] }) => { passages = m.passages; startWalk(); }).catch(() => { document.querySelector('#story-text')!.textContent = 'no story: run node scripts/story-index.mjs'; });

function tick(time: number) {
  exchangeFrame();
  for (const p of placed) {
    if (Number.isFinite(p.beat) && time >= p.next) { p.state = K(p.state); p.next = time + p.beat; }
    if (p.to) { p.x += (p.to.x - p.x) * .05; p.y += (p.to.y - p.y) * .05; }
  }
  place();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
