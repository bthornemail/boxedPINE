// AGENT CHANNEL (space/agent.html): the author's side of the coding agent's bridge
//
// Talks to repl/src/agent-bridge.ts on 127.0.0.1:8743 with the messages of
// rosetta/src/agent.ts. Four ways in:
//   - typed text;
//   - speech: the microphone (getUserMedia, MediaRecorder) heard by the browser's
//     own model (the Prompt API, LanguageModel, with audio input), on this device;
//   - pointing: the proofs records on a ring, in WebXR when a headset is present,
//     selected by controller or pointer;
//   - WebMCP: the page's tools registered for the browser's agent.
// The conversation is tracked on the sixteen Fano icons: message n lands on
// ticket 1 + (n - 1) mod 14, one Hasse diagram per side (rosetta/src/agent.ts).
import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import catalog from '../../proofs/js/catalog.json';
import { Chain, newEntropy, tagsOf, wordsOf } from './identity.ts';
import { BRIDGE_PORT, PAGE_TOOLS, INDEX16, HASSE16, slotOf, track, idOf, type Message, type Posted, type From } from '../../rosetta/src/agent.ts';

// ?bridge=8799 talks to a bridge on another port (for trying it out beside the agent's own)
const bridge = `http://127.0.0.1:${Number(new URLSearchParams(location.search).get('bridge')) || BRIDGE_PORT}`;
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const icons = import.meta.glob('../../proofs/svg/fano/*.svg', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const iconUrl = (i: number) => icons[`../../proofs/svg/fano/${INDEX16[i]}.svg`]!;
const records = (catalog as { id: string; tag: string; title: string }[]).map((r) => ({ id: r.id, tag: r.tag, title: r.title }));
const messages: Posted[] = [];
const caps: string[] = [];

// ---- the identity and its chain (identity.ts): made on first visit, kept in this browser ----
// The identity is a name, not a secret: its tag is its entropy, so its words are public too.
const store = { get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* not kept */ } } };
const kept = store.get('omi-identity');
const entropy = kept && /^[0-9a-f]{32}$/.test(kept) ? Uint8Array.from(kept.match(/../g)!, (h) => parseInt(h, 16)) : newEntropy();
store.set('omi-identity', [...entropy].map((b) => b.toString(16).padStart(2, '0')).join(''));
const chain = new Chain(entropy);
for (const t of JSON.parse(store.get('omi-chain') ?? '[]') as string[]) chain.add(t);
const showIdentity = () => { $('identity').textContent = `identity ${tagsOf(entropy).join('-')} · chain 0x${chain.sid.toString(16).padStart(4, '0')} after ${chain.links.length}`; };
showIdentity();
$('identity').title = 'words: ' + 'loading';
fetch(new URL('../identity/bip39_english.txt', location.href)).then((r) => r.text()).then((t) => { $('identity').title = 'words (a name, not a secret): ' + wordsOf(entropy, t.trim().split('\n')).join(' '); }).catch(() => {});

// ---- the bridge ----
async function send(m: Message) {
  const record = m.kind === 'say' ? m.text : `${m.kind} ${m.tag}`;
  const sid = chain.sid, length = chain.links.length;
  const link = chain.add(record);
  try {
    const r = await fetch(`${bridge}/message`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...m, who: link.by, sid: link.sid }) });
    if (!r.ok) throw new Error(await r.text());
    store.set('omi-chain', JSON.stringify(chain.links.map((l) => l.text)));
    showIdentity();
    receive((await r.json()) as Posted);
  } catch (e) {
    chain.sid = sid; chain.links.length = length; // not sent: the chain does not move
    $('status').textContent = `not sent: ${(e as Error).message}. Is the bridge running?`;
  }
}
function receive(p: Posted) {
  if (messages.some((m) => m.id === p.id)) return;
  messages.push(p);
  messages.sort((a, b) => a.id - b.id);
  const row = document.createElement('div');
  row.className = p.from;
  row.dataset.id = String(p.id);
  const t = new Date(p.at).toLocaleTimeString();
  row.textContent = `${t} [${INDEX16[slotOf(p.id)]!.replace('Fano_', '')}] ${p.from === 'author' ? 'you' : p.by ?? 'agent'}: ` +
    (p.kind === 'say' ? p.text : p.kind === 'point' ? `pointed at ${p.tag} (${idOf(p.tag)})` : `shows ${p.tag} (${idOf(p.tag)})`);
  $('log').append(row);
  $('log').scrollTop = $('log').scrollHeight;
  if (p.from === 'agent' && p.kind === 'say' && speaking) speechSynthesis.speak(new SpeechSynthesisUtterance(p.text));
  if (p.kind === 'show') highlight(p.tag);
  // the History API: each message is an entry, so back and forward walk the conversation
  const q = new URLSearchParams(location.search);
  q.set('n', String(p.id));
  if (viewing === null && Number(new URLSearchParams(location.search).get('n')) !== p.id) history.pushState({ n: p.id }, '', `?${q}`);
  drawHasse();
}
// null: follow the conversation as it arrives; a number: show it as it stood at that message
let viewing: number | null = null;
addEventListener('popstate', (e) => {
  const n = (e.state as { n?: number } | null)?.n ?? 0;
  const last = messages.at(-1)?.id ?? 0;
  viewing = n >= last ? null : n;
  for (const row of $('log').children) (row as HTMLElement).style.opacity = viewing !== null && Number((row as HTMLElement).dataset.id) > viewing ? '0.3' : '1';
  $('status').textContent = viewing === null ? 'connected to the bridge' : `as it stood at message #${viewing} (forward to return)`;
  drawHasse();
});
const events = new EventSource(`${bridge}/events`);
events.onopen = () => { $('status').textContent = 'connected to the bridge'; };
events.onerror = () => { $('status').textContent = 'the bridge is not answering (it runs while the coding agent has it open, or by hand: node repl/src/agent-bridge.ts)'; };
events.onmessage = (e) => receive(JSON.parse(e.data) as Posted);

$('say').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = $<HTMLInputElement>('text').value.trim();
  if (text) { send({ kind: 'say', from: 'author', text }); $<HTMLInputElement>('text').value = ''; }
});

// ---- speech: microphone -> the browser's own model -> text ----
let speaking = false;
$('speak').onclick = () => { speaking = !speaking; $('speak').setAttribute('aria-pressed', String(speaking)); };
type LM = { availability(o: object): Promise<string>; create(o: object): Promise<{ prompt(input: unknown): Promise<string> }> };
const LanguageModel = (globalThis as unknown as { LanguageModel?: LM }).LanguageModel;
const audioOptions = { expectedInputs: [{ type: 'audio' }], expectedOutputs: [{ type: 'text', languages: ['en'] }] };
let recorder: MediaRecorder | null = null;
let held = false; // whether the button is still down once the microphone opens
async function hear(blob: Blob) {
  if (!LanguageModel) return;
  $('status').textContent = 'listening to the recording …';
  const session = await LanguageModel.create(audioOptions);
  const text = (await session.prompt([{ role: 'user', content: [
    { type: 'text', value: 'Transcribe this speech exactly, as plain text, with nothing added.' },
    { type: 'audio', value: blob },
  ] }])).trim();
  $('status').textContent = 'connected to the bridge';
  if (text) send({ kind: 'say', from: 'author', text });
}
async function startMic() {
  if (!LanguageModel) return;
  held = true;
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks: Blob[] = [];
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.onstop = () => { stream.getTracks().forEach((t) => t.stop()); hear(new Blob(chunks, { type: recorder!.mimeType })); };
  recorder.start();
  $('mic').setAttribute('aria-pressed', 'true');
  if (!held) stopMic(); // released while the microphone was opening
}
function stopMic() { held = false; if (recorder?.state === 'recording') recorder.stop(); $('mic').setAttribute('aria-pressed', 'false'); }
// Hold to speak, with the Observable API (on in Chrome by default): each press records
// until the button is released or the pointer leaves it, whichever comes first.
type Sub<T> = { filter(f: (v: T) => boolean): Sub<T>; subscribe(f: (v: T) => void, o?: { signal: AbortSignal }): void };
type When = { when?: (type: string) => Sub<PointerEvent> };
const mic = $('mic') as HTMLElement & When;
if (mic.when) {
  mic.when('pointerdown').filter((e) => e.button === 0).subscribe(() => {
    startMic();
    const end = new AbortController();
    const stop = () => { end.abort(); stopMic(); };
    mic.when!('pointerup').subscribe(stop, { signal: end.signal });
    mic.when!('pointerleave').subscribe(stop, { signal: end.signal });
  });
  caps.push('Observable API: on');
} else {
  mic.addEventListener('pointerdown', startMic);
  mic.addEventListener('pointerup', stopMic);
  mic.addEventListener('pointerleave', stopMic);
  caps.push('Observable API: not here (using event listeners)');
}
if (LanguageModel) {
  LanguageModel.availability(audioOptions).then((a) => { caps.push(`speech: the browser's model is ${a}`); showCaps(); if (a === 'unavailable') $('mic').setAttribute('disabled', ''); });
} else { $('mic').setAttribute('disabled', ''); caps.push('speech: no Prompt API here (Chrome, with the Prompt API flag on)'); }

// ---- WebMCP: the page's tools for the browser's own agent ----
type MC = { registerTool(t: object): unknown };
const modelContext = (document as unknown as { modelContext?: MC }).modelContext ?? (navigator as unknown as { modelContext?: MC }).modelContext;
if (modelContext) {
  const run: Record<string, (a: Record<string, string>) => unknown> = {
    tell_coding_agent: ({ text }) => send({ kind: 'say', from: 'author', text }).then(() => 'passed to the coding agent'),
    point_at_record: ({ tag }) => send({ kind: 'point', from: 'author', tag: String(tag).toUpperCase(), how: 'tool' }).then(() => `pointed at ${tag}`),
    read_agent_replies: () => messages.filter((m) => m.from === 'agent').map((m) => (m.kind === 'say' ? m.text : `shows ${m.kind === 'show' ? m.tag : ''}`)).join('\n') || 'no replies yet',
  };
  for (const t of PAGE_TOOLS) modelContext.registerTool({ ...t, execute: (args: Record<string, string>) => run[t.name]!(args ?? {}) });
  caps.push(`WebMCP: ${PAGE_TOOLS.length} tools registered`);
} else caps.push('WebMCP: not in this browser (Chrome, with the WebMCP flag on)');
function showCaps() { $('caps').textContent = caps.join(' · '); }
showCaps();

// ---- WebXR: the records on a ring; select one to point at it ----
const stage = $('stage');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.xr.enabled = true;
stage.append(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 50);
camera.position.set(0, 1.6, 0.01);
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));
const ring = new THREE.Group();
ring.position.set(0, 1.5, 0);
scene.add(ring);
const base = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--agent').trim() || '#1f4e96');
const hot = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--hot').trim() || '#b23a2a');
const balls = records.map((r, i) => {
  const a = (i / records.length) * Math.PI * 2;
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), new THREE.MeshStandardMaterial({ color: base }));
  m.position.set(Math.sin(a) * 1.2, Math.cos(i * 0.9) * 0.18, -Math.cos(a) * 1.2);
  m.userData = r;
  ring.add(m);
  return m;
});
function highlight(tag: string) {
  for (const b of balls) { const on = b.userData.tag === tag; (b.material as THREE.MeshStandardMaterial).color.copy(on ? hot : base); b.scale.setScalar(on ? 1.8 : 1); }
}
const ray = new THREE.Raycaster();
function pick(how: 'xr' | 'pointer') {
  const hit = ray.intersectObjects(balls)[0];
  if (!hit) return;
  const r = hit.object.userData as { tag: string };
  highlight(r.tag);
  send({ kind: 'point', from: 'author', tag: r.tag, how });
}
renderer.domElement.addEventListener('pointerdown', (e) => {
  const box = renderer.domElement.getBoundingClientRect();
  ray.setFromCamera(new THREE.Vector2(((e.clientX - box.left) / box.width) * 2 - 1, -((e.clientY - box.top) / box.height) * 2 + 1), camera);
  pick('pointer');
});
for (const n of [0, 1]) {
  const c = renderer.xr.getController(n);
  c.addEventListener('select', () => { ray.ray.origin.setFromMatrixPosition(c.matrixWorld); ray.ray.direction.set(0, 0, -1).applyQuaternion(c.getWorldQuaternion(new THREE.Quaternion())); pick('xr'); });
  scene.add(c);
}
if ('xr' in navigator) {
  stage.append(VRButton.createButton(renderer));
  navigator.xr!.isSessionSupported('immersive-vr').then((ok) => { $('xrcaps').textContent = ok ? 'WebXR: a headset is available' : 'WebXR: no headset; drag to look, click a record to point at it'; });
} else $('xrcaps').textContent = 'WebXR: not in this browser; click a record to point at it';
let look = 0, drag: number | null = null;
renderer.domElement.addEventListener('pointermove', (e) => { if (drag !== null && e.buttons) { look += (e.clientX - drag) * 0.005; drag = e.clientX; } });
renderer.domElement.addEventListener('pointerdown', (e) => { drag = e.clientX; });
function resize() { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize);
resize();
renderer.setAnimationLoop(() => { if (!renderer.xr.isPresenting) camera.rotation.y = look; renderer.render(scene, camera); });

// ---- the two Hasse diagrams: the 16-index, one per side ----
function drawHasse() {
  const t = track(viewing === null ? messages : messages.filter((m) => m.id <= viewing!));
  for (const from of ['author', 'agent'] as From[]) {
    const s = t[from];
    const level = (i: number) => (i === 0 ? 0 : i <= 7 ? 1 : i <= 14 ? 2 : 3);
    const at = (i: number) => {
      const row = level(i), k = row === 1 ? i - 1 : row === 2 ? i - 8 : 0, n = row === 1 || row === 2 ? 7 : 1;
      return { x: n === 1 ? 240 : 30 + k * 70, y: 300 - row * 90 };
    };
    const lit = (i: number) => s.lit.has(i) || (i === 15 && s.rounds > 0);
    const edges = HASSE16.map(([a, b]) => { const p = at(a), q = at(b); return `<line class="edge" x1="${p.x}" y1="${p.y + 22}" x2="${q.x}" y2="${q.y - 22}"/>`; }).join('');
    const nodes = INDEX16.map((_, i) => { const p = at(i); return `<image href="${iconUrl(i)}" x="${p.x - 25}" y="${p.y - 22}" width="50" height="45" class="${lit(i) ? 'lit' : ''} ${s.last === i ? 'last' : ''}"><title>${INDEX16[i]}</title></image>`; }).join('');
    const label = `<text x="8" y="16">${s.lit.size - 1} of 14 this round · ${s.rounds} round${s.rounds === 1 ? '' : 's'} complete</text>`;
    $(`hasse-${from}`).innerHTML = `<svg viewBox="0 0 480 340" role="img" aria-label="${from}'s tickets">${label}${edges}${nodes}</svg>`;
  }
}
drawHasse();
