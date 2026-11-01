// THE WALK: the acceptance test walked (unbound global.vtt digital-twin; the author: "verify the
// narrative can be replayed, and changed, and rebuild both states separate and the same, which means
// like changing a icon for Solomon and being able to walk through the same story as a different icon
// ... and I have to view it from an observer inside and outside the frame").
//
// Inside the frame: the walker's eyes in the 3D Commons, the same step given to two workers, each on
// a transferred canvas (twin3d-worker.ts): Solomon a sphere in A, the glTF model in B. Outside the
// frame: the floor from above (plane.ts drawFloor), the walker on it. Each step is kept as a literal
// line, the step, the keys held, the Plan 9 floor's tick and the eight states, so the walk replays
// without the keyboard or the floor. Replayed: A rendered again from the trace must be A's frames
// byte for byte. Changed and rebuilt: B rendered from the same trace may differ from A only inside
// Solomon's region (separate, XOR) and nowhere else (the same, XNOR). ?falsify gives B a cube held
// before the eyes, which must fail. ?auto walks a fixed path, for a check without hands.
import { atHue, drawFloor, fromWorld, toFloor, FLOOR, type Mark } from './plane.ts';
import { CHARACTERS } from './characters.ts';
import { K } from './gnomon.ts';
import type { FromWorker, Icon, Pose } from './twin3d-worker.ts';

const SIZE = 384, STEP_MS = 250, MAX_STEPS = 480;
const params = new URLSearchParams(location.search);
const plan9 = params.get('source') !== 'browser';
const agentd = params.get('agents') ?? 'http://127.0.0.1:18000/agents';
const vtt = params.get('vtt') ?? 'http://127.0.0.1:8790/vtt/NARRATIVE/canticle.vtt';
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const TAGS = CHARACTERS.map((c) => c.tag);

// ── the walker: a pose folded from the keys, step by step ─────────────
const START: Pose = { x: 0, z: 0, yaw: 0, pitch: 0 };	// the centre, facing north
const STRIDE = 0.22, TURN = Math.PI / 24, REACH = 7.4;
function stepPose(p: Pose, keys: string): Pose {
  let { x, z, yaw } = p;
  const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
  for (const k of keys) {
    if (k === 'w') { x += fx * STRIDE; z += fz * STRIDE; }
    if (k === 's') { x -= fx * STRIDE; z -= fz * STRIDE; }
    if (k === 'a') { x += fz * STRIDE; z -= fx * STRIDE; }
    if (k === 'd') { x -= fz * STRIDE; z += fx * STRIDE; }
    if (k === 'q') yaw += TURN;
    if (k === 'e') yaw -= TURN;
  }
  const r = Math.hypot(x, z);
  if (r > REACH) { x *= REACH / r; z *= REACH / r; }
  return { x, z, yaw, pitch: 0 };
}

// ── a step as a literal line, and back ────────────────────────────────
type Step = { step: number; keys: string; tick: number; states: Record<string, number> };
const line = (s: Step) => `${s.step} ${s.keys || '-'} ${s.tick} ${TAGS.map((t) => (s.states[t] ?? 0).toString(16).toUpperCase().padStart(4, '0')).join(' ')}`;

let browserTick = 0;
const browserStates: Record<string, number> = Object.fromEntries(CHARACTERS.map((c) => [c.tag, c.seed]));
async function floorNow(): Promise<{ tick: number; states: Record<string, number> }> {
  if (!plan9) {
    const out = { tick: browserTick, states: { ...browserStates } };
    for (const c of CHARACTERS) browserStates[c.tag] = K(browserStates[c.tag]!) & 0xffff;
    browserTick++;
    return out;
  }
  const r = await (await fetch(agentd, { cache: 'no-store' })).json() as { tick: number; agents: { tag: string; state: string }[] };
  return { tick: r.tick, states: Object.fromEntries(r.agents.map((a) => [a.tag, parseInt(a.state, 16)])) };
}

// ── a view: a worker drawing on a canvas, its frames returned one step at a time ──
type View = { worker: Worker; pending: Map<number, (f: FromWorker) => void> };
function view(canvas: OffscreenCanvas, icon: Icon): View {
  const worker = new Worker(new URL('./twin3d-worker.ts', import.meta.url), { type: 'module' });
  worker.postMessage({ canvas, icon, model: new URL('./assets/shiba.glb', import.meta.url).href }, [canvas]);
  const v: View = { worker, pending: new Map() };
  worker.onmessage = (e: MessageEvent<FromWorker>) => { v.pending.get(e.data.tick)?.(e.data); v.pending.delete(e.data.tick); };
  return v;
}
const frame = (v: View, s: Step, pose: Pose) => new Promise<FromWorker>((resolve) => {
  v.pending.set(s.step, resolve);
  v.worker.postMessage({ tick: s.step, states: s.states, pose });
});

/** Two frames: how many pixels differ, and how many of them outside Solomon's region. */
function compare(a: Uint8ClampedArray, b: Uint8ClampedArray, mask: Uint8Array) {
  let differ = 0, outside = 0, region = 0;
  for (let p = 0; p < mask.length; p++) {
    region += mask[p]!;
    const i = p * 4;
    if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2] || a[i + 3] !== b[i + 3]) {
      differ++;
      if (!mask[p]) outside++;
    }
  }
  return { differ, outside, region };
}
const same = (a: Uint8ClampedArray, b: Uint8ClampedArray) => a.length === b.length && a.every((x, i) => x === b[i]);

// ── outside the frame: the floor from above, the walker on it ─────────
const marks: Mark[] = CHARACTERS.map((c) => ({ at: atHue(c.hue), hue: c.hue, name: c.tag }));
function drawMap(pose: Pose, path: Pose[]) {
  const ctx = $<HTMLCanvasElement>('map').getContext('2d')!;
  drawFloor(ctx, SIZE, marks, 'SOLOMON');
  ctx.strokeStyle = '#e8c36a'; ctx.lineWidth = 1.5; ctx.beginPath();
  path.forEach((p, i) => { const [x, y] = toFloor(fromWorld([p.x, 0, p.z]), SIZE); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
  ctx.stroke();
  const [x, y] = toFloor(fromWorld([pose.x, 0, pose.z]), SIZE), k = SIZE / 2 / FLOOR;
  const fx = -Math.sin(pose.yaw), fz = -Math.cos(pose.yaw);
  ctx.fillStyle = '#ffffff'; ctx.beginPath();
  ctx.moveTo(x + fx * k * 0.5, y + fz * k * 0.5);
  ctx.lineTo(x - fz * k * 0.22 - fx * k * 0.2, y + fx * k * 0.22 - fz * k * 0.2);
  ctx.lineTo(x + fz * k * 0.22 - fx * k * 0.2, y - fx * k * 0.22 - fz * k * 0.2);
  ctx.closePath(); ctx.fill();
}

// ?auto: a fixed path, north toward Metatron, round to Solomon, past him and back to the centre
const AUTO = [...Array(10).fill('w'), ...Array(5).fill('e'), ...Array(8).fill('w'), ...Array(12).fill('q'), ...Array(6).fill('w'), ...Array(6).fill('dw'), ...Array(12).fill('e'), ...Array(10).fill('w'), '-', '-'];

async function run() {
  const log = $<HTMLPreElement>('log'), verdict = $<HTMLParagraphElement>('verdict');
  const falsify = params.has('falsify');
  // live: two canvases handed to workers, each a video recorded as it plays
  const live = (id: string, vid: string, icon: Icon) => {
    const canvas = $<HTMLCanvasElement>(id);
    const stream = canvas.captureStream(1000 / STEP_MS);
    $<HTMLVideoElement>(vid).srcObject = stream;
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    return { v: view(canvas.transferControlToOffscreen(), icon), recorder, chunks };
  };
  const A = live('canvas-a', 'live-a', 'sphere'), B = live('canvas-b', 'live-b', falsify ? 'stray' : 'gltf');
  if (falsify) $('cap-b').textContent = 'B · live · the glTF model, and a cube held before the eyes (the falsifier)';

  const held = new Set<string>();
  addEventListener('keydown', (e) => { const k = e.key.toLowerCase(); if ('wasdqe'.includes(k) && k.length === 1) { held.add(k); e.preventDefault(); } });
  addEventListener('keyup', (e) => held.delete(e.key.toLowerCase()));
  let ending = false;
  $<HTMLButtonElement>('end').onclick = () => { ending = true; };

  const trace: Step[] = [], aLive: Uint8ClampedArray[] = [], path: Pose[] = [];
  let pose = START, liveOutside = 0;
  A.recorder.start(); B.recorder.start();
  verdict.textContent = params.has('auto') ? 'Walking the fixed path…' : 'Walk: W S forward and back, A D aside, Q E turn. End the walk to replay it.';
  for (let i = 0; i < MAX_STEPS && !ending; i++) {
    const keys = params.has('auto') ? (AUTO[i] === '-' ? '' : AUTO[i] ?? null) : [...held].sort().join('');
    if (keys === null) break;
    const f = await floorNow();
    const s: Step = { step: i, keys, tick: f.tick, states: f.states };
    trace.push(s);
    pose = stepPose(pose, keys);
    path.push(pose);
    const [fa, fb] = await Promise.all([frame(A.v, s, pose), frame(B.v, s, pose)]);
    aLive.push(fa.pixels);
    const c = compare(fa.pixels, fb.pixels, fa.mask!);
    liveOutside += c.outside;
    drawMap(pose, path);
    log.textContent = `${line(s)}  ·  ${c.differ} differ, ${c.outside} outside Solomon's region\n` + log.textContent;
    await new Promise((r) => setTimeout(r, STEP_MS));
  }
  const stopped = (x: typeof A) => new Promise<void>((r) => { x.recorder.onstop = () => r(); x.recorder.stop(); });
  await Promise.all([stopped(A), stopped(B)]);
  for (const [x, id] of [[A, 'replay-a'], [B, 'replay-b']] as const) {
    const video = $<HTMLVideoElement>(id);
    video.src = URL.createObjectURL(new Blob(x.chunks, { type: 'video/webm' }));
    const t = document.createElement('track');
    t.kind = 'captions'; t.label = 'the narrative'; t.src = vtt; t.default = true;
    video.crossOrigin = 'anonymous'; video.appendChild(t);
  }
  const text = trace.map(line).join('\n') + '\n';
  const a = $<HTMLAnchorElement>('trace');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  a.hidden = false;

  // replayed, changed and rebuilt: two new workers, A and B, from the trace alone
  verdict.textContent = `Replaying ${trace.length} steps from the trace…`;
  const A2 = view(new OffscreenCanvas(SIZE, SIZE), 'sphere'), B2 = view(new OffscreenCanvas(SIZE, SIZE), falsify ? 'stray' : 'gltf');
  let replayed = 0, inView = 0, separate = 0, outside = 0;
  pose = START;
  for (const s of trace) {
    pose = stepPose(pose, s.keys);
    const [fa, fb] = await Promise.all([frame(A2, s, pose), frame(B2, s, pose)]);
    if (same(fa.pixels, aLive[s.step]!)) replayed++;
    const c = compare(fa.pixels, fb.pixels, fa.mask!);
    // in view: his icon shows in either view, after what stands before it
    if (fa.seen!.some((x) => x) || fb.seen!.some((x) => x)) { inView++; if (c.differ > 0) separate++; }
    outside += c.outside;
  }
  const pass = replayed === trace.length && separate === inView && inView > 0 && outside === 0;
  const ticks = trace.length ? `${trace[0]!.tick} to ${trace[trace.length - 1]!.tick}` : '';
  verdict.textContent = `${trace.length} steps walked, the eight states from ${plan9 ? `the Plan 9 floor (agentd), its ticks ${ticks}` : 'K stepped in the browser'}. `
    + `Replayed: ${replayed} of ${trace.length} frames of A the same byte for byte. `
    + `Changed: Solomon's icon showing in ${inView} steps, his icon differing in ${separate} (separate, XOR). `
    + `Rebuilt: ${outside} pixels differ outside his region (the same, XNOR${outside ? ', broken' : ''}); live, ${liveOutside}. `
    + (pass ? 'The walk holds.' : 'The walk does not hold.');
  verdict.dataset.pass = String(pass);
  document.body.dataset.done = 'true';
  document.body.dataset.result = JSON.stringify({ steps: trace.length, replayed, inView, separate, outside, liveOutside, pass });
}

drawMap(START, [START]);
run();
