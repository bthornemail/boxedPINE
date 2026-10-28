// GUEST FRAME (space/guest.html)
//
// The Plan 9 guest's own screen in the room, as the vault's dimensional ladder
// reads it (wiki/OMI-IMO.md): each frame the guest draws comes from the host's
// frame server (unbound/PLAN9/frames.py, a QEMU screendump as PNG) onto a 2D
// canvas, whose captureStream is a media track (2D); the narrative's WebVTT
// rides that track, and its cuechange is the tick (7D); the video is a texture
// on a plane in a three.js scene (6D), composed with the viewer's pose (4D,
// XRRigidTransform.matrix in a headset) for the observer (0D). It is a flat
// picture: moving round it shows the picture from other angles.
//
// The second view is the agents themselves, from the state Plan 9 serves
// (unbound/PLAN9/space/agentd.c, read from the running floor with mach(2)):
// each on the floor at its hue (plane.ts atHue), the Observer above the centre
// (characters.ts), its state on its label. The viewer is the Observer, outside
// every agent: read (the default) shows an agent; constrain asks without
// writing; interject writes, only after a second, deliberate click.
//
// ?frames= names the frame server (default http://127.0.0.1:8790);
// ?track= the narrative series (default core-octad); ?angle= where the viewer
// starts, in degrees round the frame (0 in front); ?agents= agentd
// (default http://127.0.0.1:18000).
import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { atHue } from './plane.ts';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const query = new URLSearchParams(location.search);
const server = query.get('frames') ?? 'http://127.0.0.1:8790';
const series = (query.get('track') ?? 'core-octad').replace(/[^a-z0-9-]/g, '');
const agentd = query.get('agents') ?? 'http://127.0.0.1:18000';

// ---- the frame: guest screen -> canvas -> media track ----
const frame = $<HTMLCanvasElement>('frame');
const ctx = frame.getContext('2d')!;
const video = $<HTMLVideoElement>('video');
video.srcObject = frame.captureStream(30);
const track = document.createElement('track');
track.kind = 'metadata';
track.src = `${server}/vtt/NARRATIVE/${series}.vtt`;
track.default = true;
video.appendChild(track);
video.textTracks[0]!.mode = 'hidden';
video.textTracks[0]!.addEventListener('cuechange', () => {
  const cue = video.textTracks[0]!.activeCues?.[0] as VTTCue | undefined;
  // the words only: the ruby's Aegean and braille readings (<rt>) and the tags dropped
  const words = cue?.text.replace(/<rt>[\s\S]*?<\/rt>/g, '').replace(/<[^>]*>/g, '');
  $('cue').textContent = cue ? `${cue.id}: ${words}` : '—';
});
video.play().catch(() => {});

const status = $('status');
let frames = 0;
async function pull() {
  try {
    const r = await fetch(`${server}/frame.png`, { cache: 'no-store' });
    if (!r.ok) throw new Error(String(r.status));
    const img = await createImageBitmap(await r.blob());
    if (frame.width !== img.width) { frame.width = img.width; frame.height = img.height; }
    ctx.drawImage(img, 0, 0);
    img.close();
    frames++;
    status.textContent = `${frames} frames from ${server}`;
    status.className = '';
  } catch {
    status.textContent = `no frame from ${server}: is frames.py running and the guest up?`;
    status.className = 'off';
    await new Promise((ok) => setTimeout(ok, 1000));
  }
  requestAnimationFrame(pull);
}
pull();

// ---- the room: the video on a plane, seen from any angle ----
const stage = $('stage');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.xr.enabled = true;
stage.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(css('--paper') || '#f6f6f2');
const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 100);
const angle = (Number(query.get('angle')) || 0) * Math.PI / 180;
camera.position.set(3.2 * Math.sin(angle), 1.6, 3.2 * Math.cos(angle));
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.5, 0);
controls.update();

const texture = new THREE.VideoTexture(video);
texture.colorSpace = THREE.SRGBColorSpace;
const aspect = frame.width / frame.height;
const screen = new THREE.Mesh(
  new THREE.PlaneGeometry(2.4 * aspect / (4 / 3), 1.8),
  new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }),
);
screen.position.set(0, 1.5, 0);
scene.add(screen);
const grid = new THREE.GridHelper(8, 16, css('--rule') || '#999', css('--rule') || '#ccc');
scene.add(grid);

// ---- the agents, from the guest's own state ----
type Agent = { tag: string; point: number; hue: number; state: string };
type Shown = { agent: Agent; ball: THREE.Mesh; label: THREE.Sprite; canvas: HTMLCanvasElement; drawn: string };
const FLOOR_R = 2.2;                 // the rim on the room's floor, in metres
const shown = new Map<string, Shown>();
let tick = 0, selected: string | null = null;
const color = (hue: number) => hue < 0 ? new THREE.Color('#f2f2ee') : new THREE.Color().setHSL(hue / 360, 0.7, 0.55);

function labelOf(s: Shown) {
  const text = `${s.agent.tag} ${s.agent.state}`;
  if (s.drawn === text) return;
  const g = s.canvas.getContext('2d')!;
  g.clearRect(0, 0, s.canvas.width, s.canvas.height);
  g.fillStyle = s.agent.tag === selected ? '#2b5fa8' : '#1d1f24cc';
  g.fillRect(0, 0, s.canvas.width, s.canvas.height);
  g.fillStyle = '#ffffff';
  g.font = '600 34px JetBrains Mono, ui-monospace, monospace';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, s.canvas.width / 2, s.canvas.height / 2);
  (s.label.material as THREE.SpriteMaterial).map!.needsUpdate = true;
  s.drawn = text;
}

function place(a: Agent) {
  let s = shown.get(a.tag);
  if (!s) {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 16), new THREE.MeshBasicMaterial({ color: color(a.hue) }));
    const p = atHue(a.hue < 0 ? null : a.hue);
    ball.position.set(p.u * FLOOR_R, a.hue < 0 ? 2.9 : 0.12, p.v * FLOOR_R);
    ball.userData.tag = a.tag;
    const canvas = document.createElement('canvas');
    canvas.width = 320; canvas.height = 56;
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: false }));
    label.scale.set(0.8, 0.14, 1);
    label.position.copy(ball.position).add(new THREE.Vector3(0, 0.28, 0));
    scene.add(ball, label);
    s = { agent: a, ball, label, canvas, drawn: '' };
    shown.set(a.tag, s);
  }
  s.agent = a;
  labelOf(s);
}

const astatus = $('astatus');
async function agents() {
  try {
    const r = await fetch(`${agentd}/agents`, { cache: 'no-store' });
    if (!r.ok) throw new Error(String(r.status));
    const d = await r.json() as { tick: number; agents: Agent[] };
    tick = d.tick;
    d.agents.forEach(place);
    astatus.textContent = `${d.agents.length} agents, tick ${tick}, from ${agentd}`;
    astatus.className = '';
    if (selected) showAgent();
  } catch {
    astatus.textContent = `no agents from ${agentd}: is agentd running in the guest?`;
    astatus.className = 'off';
  }
  setTimeout(agents, 250);
}
agents();

// ---- the Observer: read (default), constrain, interject ----
const mode = () => (document.querySelector('input[name=mode]:checked') as HTMLInputElement).value;
const answer = $('answer');
function showAgent() {
  const s = selected ? shown.get(selected) : undefined;
  if (!s) { $('agent').textContent = 'Pick an agent on the floor.'; return; }
  const a = s.agent;
  $('agent').textContent = `${a.tag}: point ${a.point}, ${a.hue < 0 ? 'no hue (the camera)' : `hue ${a.hue}`}, state ${a.state}, tick ${tick}`;
}
function showMode() {
  $('ask').hidden = mode() !== 'constrain' || !selected;
  $('write').hidden = mode() !== 'interject' || !selected;
  $('confirm').hidden = true;
  answer.textContent = '';
}
document.querySelectorAll('input[name=mode]').forEach((r) => r.addEventListener('change', showMode));
function select(tag: string | null) {
  const before = selected;
  selected = tag;
  for (const t of [before, tag]) { const s = t ? shown.get(t) : undefined; if (s) { s.drawn = ''; labelOf(s); } }
  showAgent();
  showMode();
}
$('ask').addEventListener('submit', async (e) => {
  e.preventDefault();
  const r = await fetch(`${agentd}/constrain?${selected}&${encodeURIComponent($<HTMLInputElement>('spec').value).replace(/%3D/g, '=').replace(/%2C/g, ',')}`);
  answer.textContent = await r.text();
});
$('write').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = $<HTMLInputElement>('state').value.toUpperCase().padStart(4, '0');
  $('yes').textContent = `Write ${v} to ${selected}`;
  $('confirm').hidden = false;
});
$('no').addEventListener('click', () => { $('confirm').hidden = true; });
$('yes').addEventListener('click', async () => {
  const v = $<HTMLInputElement>('state').value.toUpperCase().padStart(4, '0');
  const r = await fetch(`${agentd}/interject?${selected}&${v}`, { method: 'POST' });
  answer.textContent = await r.text();
  $('confirm').hidden = true;
});

const pointer = new THREE.Vector2(), ray = new THREE.Raycaster();
renderer.domElement.addEventListener('click', (e) => {
  const r = renderer.domElement.getBoundingClientRect();
  pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(pointer, camera);
  const hit = ray.intersectObjects([...shown.values()].map((s) => s.ball))[0];
  select(hit ? hit.object.userData.tag as string : null);
});
if (query.get('agent')) setTimeout(() => select(query.get('agent')), 600);

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();
renderer.setAnimationLoop(() => renderer.render(scene, camera));

if (navigator.xr) {
  navigator.xr.isSessionSupported('immersive-vr').then((ok) => {
    if (ok) $('xr').appendChild(VRButton.createButton(renderer));
  });
}
