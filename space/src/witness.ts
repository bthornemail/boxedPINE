// THE WITNESS: an agent's walk drawn on an OffscreenCanvas, heard, and recorded to video
//
// The author, 2026-10-14: each agent "tested through OffscreenCanvas, Offline
// AudioContext, with a panner and listener node", and "video elements to
// witness the interaction of the 2 Hasse diagrams as the stereo panner ...
// and then we can see if we can replay and scrub". Each animation frame is
// drawn on an OffscreenCanvas: the plane (its 7 points and 7 lines, the step's
// point and line lit), the gate's 128 bytes, the pan (read left, write right)
// and the frame number; the bitmap goes onto a visible canvas, whose stream is
// recorded with the agent's live sound (sound.ts) by a MediaRecorder. The
// recording is the witness: a video element replays and scrubs it exactly.
// The score stays the literal (sound.ts: a re-render is not bit-identical).
import { LINES } from './story.ts';
import { buildAgent, play } from './sound.ts';
import { scoreOf, BEAT, type Step } from './score.ts';
import { newState, frameGate, READ } from './exchange.ts';

// The plane drawn as the icons draw it: a triangle, its midpoints, its centre.
// Those places are known for the XOR labelling (lines {a, b, a ^ b}: 1, 2, 4
// the corners, 3, 5, 6 the midpoints on the circle, 7 the centre); the story's
// plane is the cyclic one (story.ts LINES), so the places are carried over by
// the relabelling that sends the XOR lines onto the cyclic lines, found among
// the 5040 orders of the seven points.
const corner: Record<number, [number, number]> = { 1: [0.18, 0.86], 4: [0.82, 0.86], 2: [0.5, 0.86 - 0.64 * Math.sqrt(3) / 2] }; // equilateral
const mid = (a: number, b: number): [number, number] => [(corner[a]![0] + corner[b]![0]) / 2, (corner[a]![1] + corner[b]![1]) / 2];
const XOR_PLACE: Record<number, [number, number]> = { ...corner, 3: mid(1, 2), 5: mid(1, 4), 6: mid(2, 4), 7: [(corner[1]![0] + corner[2]![0] + corner[4]![0]) / 3, (corner[1]![1] + corner[2]![1] + corner[4]![1]) / 3] };
const XOR_LINES = [1, 2, 3, 4, 5, 6, 7].flatMap((a) => [1, 2, 3, 4, 5, 6, 7].filter((b) => b > a && (a ^ b) > b).map((b) => [a, b, a ^ b]));
function relabel(): number[] {
  const want = new Set(LINES.map((l) => [...l].sort().join()));
  const perms = (xs: number[]): number[][] => (xs.length ? xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((r) => [x, ...r])) : [[]]);
  for (const p of perms([1, 2, 3, 4, 5, 6, 7])) if (XOR_LINES.every((l) => want.has(l.map((x) => p[x - 1]!).sort().join()))) return p;
  throw new Error('no relabelling');
}
const SIGMA = relabel();
export const P: Record<number, [number, number]> = Object.fromEntries(Object.entries(XOR_PLACE).map(([x, at]) => [SIGMA[Number(x) - 1]!, at]));
/** The line drawn as the circle: the image of the XOR plane's {3, 5, 6}. */
export const CIRCLE = [3, 5, 6].map((x) => SIGMA[x - 1]!).sort().join();
export const CENTRE = SIGMA[6]!;

export type FrameInfo = { tag: string; frame: number; step: Step | null; bytes: Uint8Array; hue: number };

/** Draw one frame of the witness. */
export function drawFrame(g: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, w: number, h: number, f: FrameInfo) {
  g.fillStyle = '#0c1015'; g.fillRect(0, 0, w, h);
  const s = Math.min(w * 0.62, h * 0.8), ox = 12, oy = (h - s) / 2;
  const at = (p: number): [number, number] => [ox + P[p]![0] * s, oy + P[p]![1] * s];
  LINES.forEach((pts, i) => {
    const lit = f.step?.line === i + 1;
    g.strokeStyle = lit ? `hsl(${f.hue} 80% 62%)` : '#34404a'; g.lineWidth = lit ? 4 : 1.5;
    g.beginPath();
    if ([...pts].sort().join() === CIRCLE) { const [cx, cy] = at(CENTRE); const [mx, my] = at(pts[0]!); g.arc(cx, cy, Math.hypot(mx - cx, my - cy), 0, 2 * Math.PI); }
    else { const [a, b, c] = pts.map(at); const ends = [a!, b!, c!].sort((u, v) => u[0] - v[0] || u[1] - v[1]); g.moveTo(...ends[0]!); g.lineTo(...ends[2]!); }
    g.stroke();
  });
  for (let p = 1; p <= 7; p++) {
    const [x, y] = at(p), lit = f.step?.point === p;
    g.fillStyle = lit ? `hsl(${f.hue} 90% 70%)` : '#9da6ad';
    g.beginPath(); g.arc(x, y, lit ? 11 : 6, 0, 2 * Math.PI); g.fill();
  }
  // the gate's 128 bytes, 16 x 8
  const bx = ox + s + 24, cell = Math.min((w - bx - 12) / 16, 14);
  for (let i = 0; i < 128; i++) { g.fillStyle = f.bytes[i] === READ ? '#e2b66c' : '#5b8de0'; g.fillRect(bx + (i % 16) * cell, oy + (i >> 4) * cell, cell - 1, cell - 1); }
  // the pan: the Hasse pair, read left, write right
  const py = oy + 8 * cell + 22, pw = 16 * cell;
  g.fillStyle = '#34404a'; g.fillRect(bx, py, pw, 4);
  g.fillStyle = '#edf0e9'; g.beginPath(); g.arc(bx + (f.step?.state === 'write' ? pw : 0), py + 2, 7, 0, 2 * Math.PI); g.fill();
  g.font = '14px monospace'; g.fillStyle = '#edf0e9';
  g.fillText(`${f.tag}  frame ${f.frame}`, bx, py + 30);
  g.fillText(f.step ? `P${f.step.point} L${f.step.line} ${f.step.state === 'read' ? 'XOR read' : 'XNOR write'}` : '', bx, py + 50);
}

/** Record a walk: draw each frame on an OffscreenCanvas, play the score live, and record both; resolves to the video's URL. */
export async function recordWitness(canvas: HTMLCanvasElement, tag: string, hue: number, steps: Step[]): Promise<string> {
  const off = new OffscreenCanvas(canvas.width, canvas.height), g = off.getContext('2d')!;
  const shown = canvas.getContext('bitmaprenderer')!;
  const audio = new AudioContext();
  const dest = audio.createMediaStreamDestination();
  const graph = buildAgent(audio, [0, 0, -1], dest);
  const stream = new MediaStream([...canvas.captureStream(30).getVideoTracks(), ...dest.stream.getAudioTracks()]);
  const rec = new MediaRecorder(stream), chunks: Blob[] = [];
  rec.ondataavailable = (e) => chunks.push(e.data);
  const done = new Promise<string>((ok) => { rec.onstop = () => ok(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType }))); });
  const state = newState(), gate = frameGate(state);
  const start = audio.currentTime + 0.1, seconds = steps.length * BEAT;
  play(graph, scoreOf(steps), start);
  rec.start();
  let frame = 0;
  await new Promise<void>((finish) => {
    const tick = () => {
      const t = audio.currentTime - start;
      gate.frame = frame;
      drawFrame(g, off.width, off.height, { tag, frame, step: t >= 0 ? steps[Math.min(Math.floor(t / BEAT), steps.length - 1)] ?? null : null, bytes: state, hue });
      shown.transferFromImageBitmap(off.transferToImageBitmap());
      frame++;
      if (t < seconds) requestAnimationFrame(tick); else finish();
    };
    requestAnimationFrame(tick);
  });
  rec.stop();
  for (const s of graph.sources) s.stop();
  const url = await done;
  await audio.close();
  return url;
}
