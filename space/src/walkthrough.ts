// THE WALK-THROUGH OF THE PODCAST (the author: "walk through the podcast with a picture in picture of
// the offscreen canvas, shadow dom, offline audio context and the video elements and vtt cues as walk
// through of the picture in picture view of the 2d, 2.5d,3d and 4d space geometry of the PLan9 agent
// commons then i can verify the walkthrough from the walktrough of the video walkthrough"; the 4D, the
// author's choice: the steps as the fourth axis).
//
// The podcast plays; its own WebVTT cues are the walk's steps, each cue entered one step, the podcast's
// timeline the only clock. Each step, as in the walk (walker.ts): the keys held (or ?auto's path), the
// Plan 9 floor's tick and eight states, the pose folded from the keys, Solomon a sphere in A and the
// glTF model in B, each on an OffscreenCanvas in a worker. The picture in picture is a custom element
// with a shadow root: the four views composited, 2D (the floor from above), 2.5D (the map tilted, each
// agent lifted by its state), 3D (A, inside the frame), 4D (every step's floor stacked by its step, a
// cone of cross-sections, the trace the past and the top slice now); its canvas's stream is a video the
// browser can float over the podcast, and is recorded. The eight voices are rendered by an
// OfflineAudioContext from the trace, each cue's span its own. At the end all is rebuilt from the trace:
// A's frames byte for byte, B differing from A only inside Solomon's region and wherever his icon shows,
// the voices sample for sample, and the last composite, all four views, pixel for pixel.
import { project, atHue, FLOOR, LAYER, MAP_RIM, type PlanePoint } from './plane.ts';
import { CHARACTERS } from './characters.ts';
import type { Icon, Pose } from './twin3d-worker.ts';
import { AUTO, START, TAGS, compare, drawWalker, floor, frame, line, same, stepPose, view, type Step, type View } from './walker.ts';

const Q = 256;	// each view's side; the composite is 2Q square
const params = new URLSearchParams(location.search);
const plan9 = params.get('source') !== 'browser';
const floorNow = floor(plan9, params.get('agents') ?? 'http://127.0.0.1:18000/agents');
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

type Cued = Step & { cue: string; start: number; end: number };
const stamp = (t: number) => `${String(Math.floor(t / 3600)).padStart(2, '0')}:${String(Math.floor(t / 60) % 60).padStart(2, '0')}:${(t % 60).toFixed(3).padStart(6, '0')}`;
const cuedLine = (s: Cued) => `${line(s)} ${stamp(s.start)} --> ${stamp(s.end)}`;

// ── the four views on one composite ───────────────────────────────────
const lift = (state: number) => (state & 0xff) / 64;	// a layer from the state's low byte, 0 to 4
function draw25(ctx: Ctx2D, ox: number, oy: number, states: Record<string, number>, pose: Pose) {
  const k = (Q * 0.42) / MAP_RIM, cx = ox + Q / 2, cy = oy + Q * 0.52;
  const at = (p: PlanePoint): [number, number] => { const [x, y] = project(p.u * MAP_RIM, p.v * MAP_RIM, p.layer, '2.5d'); return [cx + x * k, cy + y * k]; };
  ctx.fillStyle = '#151c24'; ctx.fillRect(ox, oy, Q, Q);
  ctx.strokeStyle = '#34404a'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let a = 0; a <= 72; a++) { const [x, y] = at(atHue(a * 5)); if (a) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
  ctx.stroke();
  for (const c of CHARACTERS) {
    const ground = at(atHue(c.hue)), up = at(atHue(c.hue, 1, lift(states[c.tag] ?? 0)));
    ctx.strokeStyle = '#4a5864'; ctx.beginPath(); ctx.moveTo(...ground); ctx.lineTo(...up); ctx.stroke();
    ctx.fillStyle = c.hue === null ? 'hsl(0 0% 70%)' : `hsl(${c.hue} 70% 55%)`;
    ctx.beginPath(); ctx.arc(up[0], up[1], c.tag === 'SOLOMON' ? 6 : 4.5, 0, 2 * Math.PI); ctx.fill();
  }
  const w = at({ u: pose.x / 7, v: pose.z / 7, layer: 0 });
  ctx.fillStyle = '#ffffff'; ctx.fillRect(w[0] - 3, w[1] - 3, 6, 6);
}

function draw4(ctx: Ctx2D, ox: number, oy: number, history: { states: Record<string, number>; pose: Pose }[]) {
  ctx.fillStyle = '#0c1015'; ctx.fillRect(ox, oy, Q, Q);
  const n = history.length, cx = ox + Q / 2, base = oy + Q - 18, dy = n > 1 ? (Q - 48) / (n - 1) : 0;
  // slice i: the floor at step i, an ellipse whose radius grows with the step, the first at the apex
  const slice = (i: number) => ({ y: base - i * dy, r: 6 + (Q * 0.42 - 6) * (n > 1 ? i / (n - 1) : 1) });
  const pt = (i: number, hue: number | null, layer: number): [number, number] => {
    const { y, r } = slice(i), p = atHue(hue);
    return [cx + p.u * r, y + p.v * r * 0.3 - layer * (LAYER / 14) * 3];
  };
  ctx.strokeStyle = '#26323c'; ctx.lineWidth = 1;
  for (let i = 0; i < n; i += Math.max(1, Math.floor(n / 24))) { const { y, r } = slice(i); ctx.beginPath(); ctx.ellipse(cx, y, r, r * 0.3, 0, 0, 2 * Math.PI); ctx.stroke(); }
  for (const c of CHARACTERS) {	// each agent's world line through the steps
    ctx.strokeStyle = c.hue === null ? 'hsl(0 0% 60%)' : `hsl(${c.hue} 70% 55%)`; ctx.lineWidth = c.tag === 'SOLOMON' ? 2 : 1;
    ctx.beginPath();
    history.forEach((h, i) => { const [x, y] = pt(i, c.hue, lift(h.states[c.tag] ?? 0)); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
    ctx.stroke();
  }
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.beginPath();	// the walker's world line
  history.forEach((h, i) => { const { y, r } = slice(i); const x = cx + (h.pose.x / FLOOR) * r, yy = y + (h.pose.z / FLOOR) * r * 0.3; if (i) ctx.lineTo(x, yy); else ctx.moveTo(x, yy); });
  ctx.stroke();
}

function composite(ctx: Ctx2D, three: Uint8ClampedArray, states: Record<string, number>, pose: Pose, path: Pose[], history: { states: Record<string, number>; pose: Pose }[]) {
  const off = new OffscreenCanvas(Q, Q), oc = off.getContext('2d')!;
  drawWalker(oc, Q, pose, path);
  ctx.drawImage(off, 0, 0);
  draw25(ctx, Q, 0, states, pose);
  const img = new ImageData(Q, Q);	// readPixels rows run from the bottom
  for (let y = 0; y < Q; y++) img.data.set(three.subarray((Q - 1 - y) * Q * 4, (Q - y) * Q * 4), y * Q * 4);
  ctx.putImageData(img, 0, Q);
  draw4(ctx, Q, Q, history);
  ctx.font = '600 11px monospace'; ctx.fillStyle = '#edf0e9';
  for (const [t, x, y] of [['2D', 6, 14], ['2.5D', Q + 6, 14], ['3D · A', 6, Q + 14], ['4D · steps', Q + 6, Q + 14]] as const) ctx.fillText(t, x, y);
}

// ── the picture in picture: a custom element, its parts in a shadow root ──
class CommonsPip extends HTMLElement {
  canvas: HTMLCanvasElement; video: HTMLVideoElement; verdict: HTMLParagraphElement;
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>
      :host { position: fixed; right: 16px; bottom: 16px; width: min(46vw, 420px); z-index: 5; }
      .box { background: #151c24; border: 1px solid #34404a; border-radius: 6px; padding: 8px; display: grid; gap: 6px; }
      canvas, video { width: 100%; height: auto; aspect-ratio: 1; display: block; border-radius: 4px; background: #000; }
      canvas { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
      button { justify-self: start; font: 600 .8rem system-ui, sans-serif; color: #edf0e9; background: #0c1015; border: 1px solid #34404a; border-radius: 4px; padding: 4px 10px; cursor: pointer; }
      p { margin: 0; font: .78rem/1.4 system-ui, sans-serif; color: #9fb0bd; }
      p[data-pass="true"] { color: #7fd3a4; } p[data-pass="false"] { color: #f08a7a; }
    </style><div class="box"><canvas width="${2 * Q}" height="${2 * Q}"></canvas><video muted playsinline autoplay></video><button type="button">Picture in picture</button><p>The Commons, four ways.</p></div>`;
    this.canvas = root.querySelector('canvas')!;
    this.video = root.querySelector('video')!;
    this.verdict = root.querySelector('p')!;
    root.querySelector('button')!.addEventListener('click', () => { this.video.requestPictureInPicture?.().catch(() => {}); });
  }
}
customElements.define('commons-pip', CommonsPip);

// ── the voices: rendered offline from the trace, each cue's span its own ──
// Each voice on its own channel: Chrome sums a node's inputs in no fixed order, so eight voices mixed
// by the renderer differ from render to render by a float's last place; on eight channels nothing is
// summed there, and the mix to listen to is made here, in the voices' order.
const RATE = 8000;
async function voices(trace: Cued[]): Promise<AudioBuffer> {
  const t0 = trace.length ? trace[0]!.start : 0, span = trace.length ? Math.max(0.05, trace[trace.length - 1]!.end - t0) : 0.05;
  const ctx = new OfflineAudioContext(CHARACTERS.length, Math.ceil(span * RATE), RATE);
  const merge = new ChannelMergerNode(ctx, { numberOfInputs: CHARACTERS.length });
  merge.connect(ctx.destination);
  for (const [n, c] of CHARACTERS.entries()) {
    const osc = new OscillatorNode(ctx, { frequency: 220 * 2 ** ((c.hue ?? -360) / 360) });
    const gain = new GainNode(ctx, { gain: 0 });
    osc.connect(gain).connect(merge, 0, n);
    for (const s of trace) {
      let ones = 0; for (let v = s.states[c.tag] ?? 0; v; v &= v - 1) ones++;
      gain.gain.setValueAtTime((ones / 16) * 0.09, s.start - t0);
    }
    osc.start(0);
  }
  return ctx.startRendering();
}
const channels = (buf: AudioBuffer) => Array.from({ length: buf.numberOfChannels }, (_, c) => buf.getChannelData(c));
function wav(buf: AudioBuffer): Blob {
  const d = new Float32Array(buf.length);
  for (const ch of channels(buf)) for (let i = 0; i < d.length; i++) d[i] += ch[i]!;
  const out = new DataView(new ArrayBuffer(44 + d.length * 2));
  const w = (o: number, s: string) => [...s].forEach((ch, i) => out.setUint8(o + i, ch.charCodeAt(0)));
  w(0, 'RIFF'); out.setUint32(4, 36 + d.length * 2, true); w(8, 'WAVEfmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 1, true);
  out.setUint32(24, RATE, true); out.setUint32(28, RATE * 2, true); out.setUint16(32, 2, true); out.setUint16(34, 16, true); w(36, 'data'); out.setUint32(40, d.length * 2, true);
  d.forEach((x, i) => out.setInt16(44 + i * 2, Math.max(-1, Math.min(1, x)) * 0x7fff, true));
  return new Blob([out], { type: 'audio/wav' });
}

// ── the walk-through ──────────────────────────────────────────────────
async function begin(media: string, vtt: string) {
  const pip = document.querySelector('commons-pip') as CommonsPip;
  const ctx = pip.canvas.getContext('2d')!;
  const stream = pip.canvas.captureStream(8);
  pip.video.srcObject = stream;
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

  const podcast = $<HTMLVideoElement>('podcast');
  podcast.crossOrigin = 'anonymous';
  podcast.src = media;
  const track = document.createElement('track');
  track.kind = 'captions'; track.label = 'the podcast'; track.src = vtt; track.default = true;
  podcast.appendChild(track);
  podcast.playbackRate = Number(params.get('rate') ?? 1);

  const falsify = params.has('falsify');
  const A: View = view(new OffscreenCanvas(Q, Q), 'sphere'), B: View = view(new OffscreenCanvas(Q, Q), (falsify ? 'stray' : 'gltf') as Icon);
  const held = new Set<string>();
  addEventListener('keydown', (e) => { const k = e.key.toLowerCase(); if (k.length === 1 && 'wasdqe'.includes(k)) held.add(k); });
  addEventListener('keyup', (e) => held.delete(e.key.toLowerCase()));

  const trace: Cued[] = [], aLive: Uint8ClampedArray[] = [], path: Pose[] = [], history: { states: Record<string, number>; pose: Pose }[] = [];
  let pose = START, liveOutside = 0, lastComposite: ImageData | null = null, chain = Promise.resolve(), ended = false;
  const log = $<HTMLPreElement>('log');
  const limit = Number(params.get('steps') ?? Infinity);

  const walked = new Set<VTTCue>();	// each cue one step, once
  const step = async (cue: VTTCue) => {
    if (ended || trace.length >= limit || walked.has(cue)) return;
    walked.add(cue);
    const i = trace.length;
    const keys = params.has('auto') ? (AUTO[i % AUTO.length] === '-' ? '' : AUTO[i % AUTO.length]!) : [...held].sort().join('');
    const f = await floorNow();
    const s: Cued = { step: i, keys, tick: f.tick, states: f.states, cue: cue.id, start: cue.startTime, end: cue.endTime };
    trace.push(s);
    pose = stepPose(pose, keys);
    path.push(pose); history.push({ states: s.states, pose });
    const [fa, fb] = await Promise.all([frame(A, s, pose), frame(B, s, pose)]);
    aLive.push(fa.pixels);
    liveOutside += compare(fa.pixels, fb.pixels, fa.mask!).outside;
    composite(ctx, fa.pixels, s.states, pose, path, history);
    lastComposite = ctx.getImageData(0, 0, 2 * Q, 2 * Q);
    log.textContent = `${cuedLine(s)}  ·  ${cue.text.replace(/\s+/g, ' ').slice(0, 80)}\n` + log.textContent;
    if (trace.length >= limit) end();
  };

  track.addEventListener('load', () => {
    for (const cue of Array.from(track.track.cues ?? []) as VTTCue[]) cue.onenter = () => { chain = chain.then(() => step(cue)); };
  });
  track.track.mode = 'showing';

  const end = async () => {
    if (ended) return;
    ended = true;
    podcast.pause();
    await chain;
    await new Promise<void>((r) => { recorder.onstop = () => r(); recorder.stop(); });
    const replay = $<HTMLVideoElement>('replay');
    replay.src = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }));
    const t = document.createElement('track');
    t.kind = 'captions'; t.label = 'the podcast'; t.src = vtt; t.default = true;
    replay.crossOrigin = 'anonymous'; replay.appendChild(t);
    const traceLink = $<HTMLAnchorElement>('trace');
    traceLink.href = URL.createObjectURL(new Blob([trace.map(cuedLine).join('\n') + '\n'], { type: 'text/plain' }));
    traceLink.hidden = false;

    pip.verdict.textContent = `Rebuilding ${trace.length} steps from the trace…`;
    const A2 = view(new OffscreenCanvas(Q, Q), 'sphere'), B2 = view(new OffscreenCanvas(Q, Q), (falsify ? 'stray' : 'gltf') as Icon);
    let replayed = 0, inView = 0, separate = 0, outside = 0, p2 = START, last: Uint8ClampedArray | null = null;
    const path2: Pose[] = [], hist2: { states: Record<string, number>; pose: Pose }[] = [];
    for (const s of trace) {
      p2 = stepPose(p2, s.keys);
      path2.push(p2); hist2.push({ states: s.states, pose: p2 });
      const [fa, fb] = await Promise.all([frame(A2, s, p2), frame(B2, s, p2)]);
      if (same(fa.pixels, aLive[s.step]!)) replayed++;
      const c = compare(fa.pixels, fb.pixels, fa.mask!);
      if (fa.seen!.some((x) => x) || fb.seen!.some((x) => x)) { inView++; if (c.differ > 0) separate++; }
      outside += c.outside;
      last = fa.pixels;
    }
    // the last composite, all four views, drawn again from the replay
    let fourSame = trace.length === 0;
    if (last && lastComposite) {
      const oc = new OffscreenCanvas(2 * Q, 2 * Q), octx = oc.getContext('2d')!;
      const s = trace[trace.length - 1]!;
      composite(octx, last, s.states, p2, path2, hist2);
      fourSame = same(octx.getImageData(0, 0, 2 * Q, 2 * Q).data, lastComposite.data);
    }
    // the voices, rendered twice from the trace
    const [v1, v2] = [await voices(trace), await voices(trace)];
    const audioSame = channels(v1).every((ch, c) => same(new Uint8ClampedArray(ch.slice().buffer), new Uint8ClampedArray(channels(v2)[c]!.slice().buffer)));
    $<HTMLAudioElement>('voices').src = URL.createObjectURL(wav(v1));

    const pass = trace.length > 0 && replayed === trace.length && separate === inView && inView > 0 && outside === 0 && fourSame && audioSame;
    const ticks = trace.length ? `${trace[0]!.tick} to ${trace[trace.length - 1]!.tick}` : '';
    const text = `${trace.length} cues walked, the podcast's own, ${stamp(trace[0]?.start ?? 0)} to ${stamp(trace[trace.length - 1]?.end ?? 0)}; the states from ${plan9 ? `the Plan 9 floor (agentd), its ticks ${ticks}` : 'K stepped in the browser'}. `
      + `Replayed: ${replayed} of ${trace.length} frames of A the same byte for byte; the four views' last frame the same: ${fourSame ? 'yes' : 'no'}; the eight voices, ${v1.length} samples each, rendered twice, the same: ${audioSame ? 'yes' : 'no'}. `
      + `Changed: Solomon's icon showing in ${inView} steps, differing in ${separate} (XOR). Rebuilt: ${outside} pixels differ outside his region (XNOR${outside ? ', broken' : ''}); live, ${liveOutside}. `
      + (pass ? 'The walk-through holds.' : 'The walk-through does not hold.');
    for (const el of [pip.verdict, $<HTMLParagraphElement>('verdict')]) { el.textContent = text; el.dataset.pass = String(pass); }
    document.body.dataset.done = 'true';
    document.body.dataset.result = JSON.stringify({ steps: trace.length, replayed, fourSame, audioSame, samples: v1.length, inView, separate, outside, liveOutside, pass });
  };
  $<HTMLButtonElement>('end').onclick = () => end();
  podcast.addEventListener('ended', () => end());

  composite(ctx, new Uint8ClampedArray(Q * Q * 4), Object.fromEntries(TAGS.map((t) => [t, 0])), START, [START], []);
  recorder.start();
  await podcast.play().catch(() => { $<HTMLParagraphElement>('verdict').textContent = 'Press play on the podcast to begin.'; });
  $<HTMLParagraphElement>('verdict').textContent = params.has('auto') ? 'Walking the fixed path through the podcast…' : 'Walk with W S A D, turn with Q E; each cue is a step.';
}

// the podcast and its cues: ?media= and ?vtt=, or chosen from disk
const fromParams = params.get('media') && params.get('vtt');
if (fromParams) begin(params.get('media')!, params.get('vtt')!);
$<HTMLButtonElement>('start').onclick = () => {
  const files = [...($<HTMLInputElement>('files').files ?? [])];
  const media = files.find((f) => /\.(mp4|m4a|mp3|webm)$/i.test(f.name)), vtt = files.find((f) => /\.vtt$/i.test(f.name));
  if (!media || !vtt) { $<HTMLParagraphElement>('verdict').textContent = 'Choose a podcast and its .vtt together.'; return; }
  begin(URL.createObjectURL(media), URL.createObjectURL(vtt));
};
