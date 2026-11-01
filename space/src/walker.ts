// THE WALKER: what the walk (walk.ts) and the walk-through of the podcast (walkthrough.ts) share: the
// pose folded from the keys, a step as a literal line, the eight states from the Plan 9 floor or K, a
// view on a worker (twin3d-worker.ts), the comparison of two frames, and the walker drawn on the floor.
import { atHue, drawFloor, fromWorld, toFloor, FLOOR, type Mark } from './plane.ts';
import { CHARACTERS } from './characters.ts';
import { K } from './gnomon.ts';
import type { FromWorker, Icon, Pose } from './twin3d-worker.ts';

export const TAGS = CHARACTERS.map((c) => c.tag);

// ── the walker: a pose folded from the keys, step by step ─────────────
export const START: Pose = { x: 0, z: 0, yaw: 0, pitch: 0 };	// the centre, facing north
const STRIDE = 0.22, TURN = Math.PI / 24, REACH = 7.4;
export function stepPose(p: Pose, keys: string): Pose {
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
export type Step = { step: number; keys: string; tick: number; states: Record<string, number> };
export const line = (s: Step) => `${s.step} ${s.keys || '-'} ${s.tick} ${TAGS.map((t) => (s.states[t] ?? 0).toString(16).toUpperCase().padStart(4, '0')).join(' ')}`;

/** The eight states, step by step: one snapshot of the Plan 9 floor from agentd, or K stepped here. */
export function floor(plan9: boolean, agentd: string) {
  let browserTick = 0;
  const browserStates: Record<string, number> = Object.fromEntries(CHARACTERS.map((c) => [c.tag, c.seed]));
  return async (): Promise<{ tick: number; states: Record<string, number> }> => {
    if (!plan9) {
      const out = { tick: browserTick, states: { ...browserStates } };
      for (const c of CHARACTERS) browserStates[c.tag] = K(browserStates[c.tag]!) & 0xffff;
      browserTick++;
      return out;
    }
    const r = await (await fetch(agentd, { cache: 'no-store' })).json() as { tick: number; agents: { tag: string; state: string }[] };
    return { tick: r.tick, states: Object.fromEntries(r.agents.map((a) => [a.tag, parseInt(a.state, 16)])) };
  };
}

// ── a view: a worker drawing on a canvas, its frames returned one step at a time ──
export type View = { worker: Worker; pending: Map<number, (f: FromWorker) => void> };
export function view(canvas: OffscreenCanvas, icon: Icon): View {
  const worker = new Worker(new URL('./twin3d-worker.ts', import.meta.url), { type: 'module' });
  worker.postMessage({ canvas, icon, model: new URL('./assets/shiba.glb', import.meta.url).href }, [canvas]);
  const v: View = { worker, pending: new Map() };
  worker.onmessage = (e: MessageEvent<FromWorker>) => { v.pending.get(e.data.tick)?.(e.data); v.pending.delete(e.data.tick); };
  return v;
}
export const frame = (v: View, s: Step, pose: Pose) => new Promise<FromWorker>((resolve) => {
  v.pending.set(s.step, resolve);
  v.worker.postMessage({ tick: s.step, states: s.states, pose });
});

/** Two frames: how many pixels differ, and how many of them outside Solomon's region. */
export function compare(a: Uint8ClampedArray, b: Uint8ClampedArray, mask: Uint8Array) {
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
export const same = (a: Uint8ClampedArray, b: Uint8ClampedArray) => a.length === b.length && a.every((x, i) => x === b[i]);

// ── the floor from above, the walker and the path on it, on any 2D context ──
export const marks: Mark[] = CHARACTERS.map((c) => ({ at: atHue(c.hue), hue: c.hue, name: c.tag }));
type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
export function drawWalker(ctx: Ctx2D, size: number, pose: Pose, path: Pose[]) {
  drawFloor(ctx, size, marks, 'SOLOMON');
  ctx.strokeStyle = '#e8c36a'; ctx.lineWidth = 1.5; ctx.beginPath();
  path.forEach((p, i) => { const [x, y] = toFloor(fromWorld([p.x, 0, p.z]), size); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
  ctx.stroke();
  const [x, y] = toFloor(fromWorld([pose.x, 0, pose.z]), size), k = size / 2 / FLOOR;
  const fx = -Math.sin(pose.yaw), fz = -Math.cos(pose.yaw);
  ctx.fillStyle = '#ffffff'; ctx.beginPath();
  ctx.moveTo(x + fx * k * 0.5, y + fz * k * 0.5);
  ctx.lineTo(x - fz * k * 0.22 - fx * k * 0.2, y + fx * k * 0.22 - fz * k * 0.2);
  ctx.lineTo(x + fz * k * 0.22 - fx * k * 0.2, y - fx * k * 0.22 - fz * k * 0.2);
  ctx.closePath(); ctx.fill();
}

// ?auto: a fixed path, north toward Metatron, round to Solomon, past him and back to the centre
export const AUTO = [...Array(10).fill('w'), ...Array(5).fill('e'), ...Array(8).fill('w'), ...Array(12).fill('q'), ...Array(6).fill('w'), ...Array(6).fill('dw'), ...Array(12).fill('e'), ...Array(10).fill('w'), '-', '-'];
