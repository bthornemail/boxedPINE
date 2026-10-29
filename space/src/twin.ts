// THE TWIN: the final check (unbound global.vtt digital-twin, replay-video). Two canvases,
// each handed to a worker by transferControlToOffscreen, draw the same story from the same
// states; only Solomon's icon differs. Each placeholder canvas's captureStream is a live
// video and is recorded, so both play back side by side; the narrative WebVTT rides on both.
// Every frame the two views' pixels are compared: they must differ only inside Solomon's
// icon (XOR, separate) and be identical everywhere else (XNOR, the same).
import { atHue, toFloor } from './plane.ts';
import { CHARACTERS } from './characters.ts';
import type { FromWorker, Icon } from './twin-worker.ts';

const SIZE = 512, TICKS = 48, FPS = 8;
const params = new URLSearchParams(location.search);
const vtt = params.get('vtt') ?? 'http://127.0.0.1:8790/vtt/NARRATIVE/canticle.vtt';
// ?source=plan9: each tick, one snapshot of the Plan 9 floor's states from agentd, given to both views
const plan9 = params.get('source') === 'plan9';
const agentd = params.get('agents') ?? 'http://127.0.0.1:18000/agents';

async function floorStates(): Promise<{ tick: number; states: Record<string, number> }> {
  const r = await (await fetch(agentd, { cache: 'no-store' })).json() as { tick: number; agents: { tag: string; state: string }[] };
  return { tick: r.tick, states: Object.fromEntries(r.agents.map((a) => [a.tag, parseInt(a.state, 16)])) };
}
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

/** Solomon's icon region on the floor: his disc, with room for either icon. */
function iconBox() {
  const solomon = CHARACTERS.find((c) => c.tag === 'SOLOMON')!;
  const [x, y] = toFloor(atHue(solomon.hue), SIZE), r = (SIZE / 70) * 1.3;
  return { x0: Math.floor(x - r), y0: Math.floor(y - r), x1: Math.ceil(x + r), y1: Math.ceil(y + r) };
}

type View = { worker: Worker; recorder: MediaRecorder; chunks: Blob[]; frames: Map<number, Uint8ClampedArray> };

function view(canvasId: string, liveId: string, icon: Icon): View {
  const canvas = $<HTMLCanvasElement>(canvasId);
  const stream = canvas.captureStream(FPS);
  $<HTMLVideoElement>(liveId).srcObject = stream;
  const off = canvas.transferControlToOffscreen();
  const worker = new Worker(new URL('./twin-worker.ts', import.meta.url), { type: 'module' });
  worker.postMessage({ canvas: off, icon }, [off]);
  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  return { worker, recorder, chunks, frames: new Map() };
}

function track(video: HTMLVideoElement) {
  const t = document.createElement('track');
  t.kind = 'captions'; t.label = 'the narrative'; t.src = vtt; t.default = true;
  video.crossOrigin = 'anonymous';
  video.appendChild(t);
}

/** Compare one tick's two frames: how many pixels differ, and how many of them outside the icon. */
function compare(a: Uint8ClampedArray, b: Uint8ClampedArray) {
  const box = iconBox();
  let differ = 0, outside = 0;
  for (let i = 0; i < a.length; i += 4) {
    if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2] || a[i + 3] !== b[i + 3]) {
      differ++;
      const p = i / 4, x = p % SIZE, y = (p - x) / SIZE;
      if (x < box.x0 || x > box.x1 || y < box.y0 || y > box.y1) outside++;
    }
  }
  return { differ, outside };
}

async function run() {
  const A = view('canvas-a', 'live-a', 'disc');
  // ?falsify: B also draws a stray mark away from Solomon, so the check must fail
  const B = view('canvas-b', 'live-b', params.has('falsify') ? 'stray' : 'square');
  const log = $<HTMLPreElement>('log');
  const results: { tick: number; differ: number; outside: number }[] = [];
  const got = (v: View) => (e: MessageEvent<FromWorker>) => {
    v.frames.set(e.data.tick, e.data.pixels);
    const a = A.frames.get(e.data.tick), b = B.frames.get(e.data.tick);
    if (a && b) {
      const r = compare(a, b);
      results.push({ tick: e.data.tick, ...r });
      A.frames.delete(e.data.tick); B.frames.delete(e.data.tick);
      log.textContent = `tick ${e.data.tick}: ${r.differ} pixels differ, ${r.outside} of them outside Solomon's icon\n` + log.textContent;
    }
  };
  A.worker.onmessage = got(A);
  B.worker.onmessage = got(B);
  A.recorder.start(); B.recorder.start();
  const floorTicks: number[] = [];
  for (let t = 0; t < TICKS; t++) {
    if (plan9) {
      const f = await floorStates();
      floorTicks.push(f.tick);
      A.worker.postMessage({ tick: t, states: f.states }); B.worker.postMessage({ tick: t, states: f.states });
    } else {
      A.worker.postMessage({ tick: t }); B.worker.postMessage({ tick: t });
    }
    await new Promise((r) => setTimeout(r, 1000 / FPS));
  }
  await new Promise((r) => setTimeout(r, 400));
  const stopped = (v: View) => new Promise<void>((r) => { v.recorder.onstop = () => r(); v.recorder.stop(); });
  await Promise.all([stopped(A), stopped(B)]);
  for (const [v, id] of [[A, 'replay-a'], [B, 'replay-b']] as const) {
    const video = $<HTMLVideoElement>(id);
    video.src = URL.createObjectURL(new Blob(v.chunks, { type: 'video/webm' }));
    track(video);
  }
  const xor = results.every((r) => r.differ > 0), xnor = results.every((r) => r.outside === 0);
  const verdict = $<HTMLParagraphElement>('verdict');
  const source = plan9 ? `States from the Plan 9 floor (agentd), its ticks ${floorTicks[0]} to ${floorTicks[floorTicks.length - 1]}. ` : 'States stepped by K in the browser. ';
  verdict.textContent = source + `${results.length} ticks compared. Separate (XOR, the icon differs every tick): ${xor ? 'yes' : 'no'}. The same (XNOR, nothing differs outside the icon): ${xnor ? 'yes' : 'no'}.`;
  verdict.dataset.pass = String(xor && xnor);
  document.body.dataset.done = 'true';
}

run();
