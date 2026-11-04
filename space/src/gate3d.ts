// The gate in 3D: its production (production.ts) played in the normalised cube, the cast's forms at the gate, a
// frame a node on the step's clock; recast and replayed, the two traces compared. The scene: the sun turns with the
// step (12 degrees a frame, its c + r half day and its c - r half night: the author's day four), the narrative read
// as captions and heard as tones panned from the speaker, the speaker's form lifting into a spotlight.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { onCue } from './portal.ts';
import { RIM } from './plane.ts';
import { trace, compare, recast, GATE_CAST, type Cast, type Node, type Place, type Named } from './production.ts';
import { directorOfSpeaker } from './directors.ts';

const $ = (id: string) => document.getElementById(id)!;
type TNode = Node & { event: string; text: string };
type CastNode = Named & { quote: string };
const [nodes, places, named] = await Promise.all([
  fetch('/narrative/timeline.ndjson').then((r) => r.text()).then((t) => t.trim().split('\n').map((l) => JSON.parse(l) as TNode).sort((a, b) => a.seq - b.seq)),
  fetch('/narrative/scene.patch.json').then((r) => r.json()).then((s: { entities: { id: string; position: Place }[] }) => new Map(s.entities.map((e) => [e.id, e.position]))),
  fetch('/narrative/cast.json').then((r) => r.json()).then((c: { nodes: CastNode[] }) => c.nodes),
]);
const who = new Map(named.map((n) => [n.node_id, n]));
const world = (p: Place): [number, number, number] => [(p.x - 0.5) * 2 * RIM, p.y * 2 * RIM, (p.z - 0.5) * 2 * RIM];
const placeAt = (n: TNode) => world(places.get(n.node_id) ?? { x: 0.5, y: 0.5, z: 0.5 });

// ── the renderer, the camera, the glow ──
const stage = $('stage');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.xr.enabled = true;
stage.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05070c, 0.018);
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 300);
camera.position.set(0, 3.4, 10.5);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2, -2.6);
controls.enableDamping = true;
controls.maxDistance = 40;
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.7, 0.45, 0.82);	// only the bright: the sun, the gold, the speaker
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ── the sky and the sun: a turn of 12 degrees a frame, day the c + r half, night the c - r ──
const DAY = new THREE.Color(0x3d5a7a), DUSK = new THREE.Color(0x2a1f3a), NIGHT = new THREE.Color(0x04060b);	// a dim sky, so the lit things read
const hemi = new THREE.HemisphereLight(0xddeeff, 0x10141c, 1.2);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d6, 2.4);
scene.add(sun);
const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffe6a8, fog: false }));
scene.add(sunDisc);
let seed = 0x9e3779b9;	// a fixed seed: the same sky every time
const rand = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
const starPos = new Float32Array(900 * 3);
for (let i = 0; i < 900; i++) { const u = rand() * 2 - 1, a = rand() * Math.PI * 2, r = 90, s = Math.sqrt(1 - u * u); starPos.set([Math.cos(a) * s * r, Math.abs(u) * r * 0.9 + 4, Math.sin(a) * s * r], i * 3); }
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xdfe8ff, size: 0.35, transparent: true, opacity: 0, fog: false }));
scene.add(stars);

// ── the ground, the cube, the gate ──
const ground = new THREE.Mesh(new THREE.CircleGeometry(RIM * 2.2, 96), new THREE.MeshStandardMaterial({ color: 0x14181f, roughness: 0.95 }));
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
const grid = new THREE.PolarGridHelper(RIM * 2, 16, 8, 96, 0x2c3440, 0x1c222b);
grid.position.y = 0.002;
scene.add(grid);
const box = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2 * RIM, 2 * RIM, 2 * RIM)), new THREE.LineBasicMaterial({ color: 0x74c8c0, transparent: true, opacity: 0.18 }));
box.position.set(0, RIM, 0);
scene.add(box);
const GATE_Z = -RIM * 0.6;
const stone = new THREE.MeshStandardMaterial({ color: 0x6d5a2c, roughness: 0.7, metalness: 0.2 });
const gold = new THREE.MeshStandardMaterial({ color: 0xe8c56a, emissive: 0xe8c56a, emissiveIntensity: 0.9 });
for (const x of [-RIM * 0.75, RIM * 0.75]) {
  const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.6, 5, 0.6), stone);
  pillar.position.set(x, 2.5, GATE_Z);
  scene.add(pillar);
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.08, 0.64), gold);
  band.position.set(x, 4.2, GATE_Z);
  scene.add(band);
}
const lintel = new THREE.Mesh(new THREE.BoxGeometry(RIM * 1.5 + 0.6, 0.5, 0.7), stone);
lintel.position.set(0, 5.25, GATE_Z);
scene.add(lintel);
const lintelGlow = new THREE.Mesh(new THREE.BoxGeometry(RIM * 1.5, 0.06, 0.72), gold);
lintelGlow.position.set(0, 5.0, GATE_Z);
scene.add(lintelGlow);

// ── the nodes: soft lights at their places, the read ones brighter, the current one gold ──
const EVENT_COLOUR: Record<string, number> = { paragraph: 0x8a96a8, character: 0xe8c56a, insight: 0x74c8c0, voice: 0xc39be8, vision: 0x9bc3e8, warning: 0xe88a7a, closing: 0xb0e89b, question: 0xe8d39b, healing: 0x9be8c7, revelation: 0xf0e0a0 };
const nodeGeo = new THREE.BufferGeometry();
nodeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nodes.flatMap(placeAt)), 3));
const base = nodes.map((n) => new THREE.Color(EVENT_COLOUR[n.event] ?? 0x8a96a8));
const colours = new Float32Array(nodes.length * 3);
const dim = (i: number, k: number) => colours.set([base[i]!.r * k, base[i]!.g * k, base[i]!.b * k], i * 3);
nodes.forEach((_, i) => dim(i, 0.35));
nodeGeo.setAttribute('color', new THREE.BufferAttribute(colours, 3));
const nodePoints = new THREE.Points(nodeGeo, new THREE.PointsMaterial({ size: 0.16, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
scene.add(nodePoints);
const cursor = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe6a8 }));
scene.add(cursor);
const cursorLight = new THREE.PointLight(0xffe6a8, 3, 4);
cursor.add(cursorLight);

// ── the cast at the gate: a place a figure (Enoch and Metatron one place, one at a time, Enoch becoming Metatron) ──
const loader = new GLTFLoader();
const placeOf = (name: string) => (name === 'Enoch' || name === 'Metatron' || name === 'Metatron/Enoch' ? 'Enoch · Metatron' : name);
const standing = new Map<string, { g: THREE.Group; tag: string; lift: number }>();
const places3 = [...new Set(Object.keys(GATE_CAST).filter((n) => named.some((m) => m.name === n)).map(placeOf))];
places3.forEach((place, i) => {
  const g = new THREE.Group();
  g.position.set((i - (places3.length - 1) / 2) * 2.1, 0, GATE_Z + 1.2);
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.12, 32), stone);
  plinth.position.y = 0.06;
  g.add(plinth);
  scene.add(g);
  standing.set(place, { g, tag: '', lift: 0 });
});
const glow = (o: THREE.Object3D, k: number) => o.traverse((m) => { const mat = (m as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined; if (mat?.emissive) { mat.emissive.copy(mat.color); mat.emissiveIntensity = k; } });
function put(place: string, tag: string) {
  const at = standing.get(place)!;
  if (at.tag === tag) return;
  at.tag = tag;
  at.g.children.filter((c) => c.name === 'form').forEach((c) => at.g.remove(c));
  loader.load(`/avatars/${tag}.gltf`, (m) => {
    if (at.tag !== tag) return;
    const h = [...tag].length * 5, s = 3.2 / h;
    m.scene.name = 'form';
    m.scene.scale.setScalar(s);
    m.scene.position.y = h * s + 0.12;
    glow(m.scene, 0.25);
    at.g.add(m.scene);
  });
}
const stand = (cast: Cast) => { for (const place of standing.keys()) put(place, place === 'Enoch · Metatron' ? cast['Enoch']! : cast[place]!); };
const spot = new THREE.SpotLight(0xfff0d6, 0, 14, Math.PI / 9, 0.5, 1.2);
spot.position.set(0, 9, GATE_Z + 4);
scene.add(spot, spot.target);

// ── sound: a soft tone a line, panned from where it is spoken ──
let audio: AudioContext | null = null;
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16];
function tone(at: THREE.Vector3, step: number, loud: number) {
  if (!audio) return;
  const t = audio.currentTime, osc = audio.createOscillator(), gain = audio.createGain(), pan = audio.createPanner();
  osc.type = 'sine';
  osc.frequency.value = 220 * 2 ** (PENTA[step % PENTA.length]! / 12);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(loud, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
  pan.panningModel = 'HRTF';
  pan.positionX.value = at.x; pan.positionY.value = at.y; pan.positionZ.value = at.z;
  osc.connect(gain).connect(pan).connect(audio.destination);
  osc.start(t);
  osc.stop(t + 1.9);
}

// ── the production, played on the step's clock: a node holds as many half-second frames as reading it takes ──
let cast: Cast = GATE_CAST;
const original = trace(nodes, places, named, GATE_CAST);
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const hold = nodes.map((n) => Math.max(2, Math.ceil((words(who.get(n.node_id)?.quote || n.text) / 2.6) * 2)));
let tick = 0, node = 0, left = hold[0]!, stepFrame = 0, began = false;
const focus = new THREE.Vector3(0, 2, -2.6);
stand(cast);
function show(i: number) {
  const n = nodes[i]!, c = who.get(n.node_id), here = new THREE.Vector3(...placeAt(n));
  cursor.position.copy(here);
  for (let k = 0; k < nodes.length; k++) dim(k, k === i ? 1.6 : k < i ? 0.7 : 0.35);
  nodeGeo.attributes.color!.needsUpdate = true;
  const speaker = c?.name;
  if (speaker && placeOf(speaker) === 'Enoch · Metatron') put('Enoch · Metatron', cast[speaker]!);
  for (const [place, at] of standing) at.lift = speaker && placeOf(speaker) === place ? 1 : 0;
  const line = c?.quote || n.text;
  const bound = speaker ? directorOfSpeaker(speaker) : undefined;	// the speaker's term and colour (directors.ts)
  $('who').textContent = speaker ? `${speaker}${bound ? ` · ${bound.term.toLowerCase()}` : ''}${cast[speaker] !== GATE_CAST[speaker] ? ` · recast as ${cast[speaker]}` : ''}` : n.event === 'paragraph' ? '' : n.event;
  $('who').style.color = bound ? (bound.hue === null ? '#e8e8e3' : `hsl(${bound.hue} 80% 68%)`) : '';
  if (line) $('line').textContent = line;
  $('caption').style.opacity = line ? '1' : '0.35';
  $('frame').textContent = `node ${i + 1} of ${nodes.length} · ${n.node_id.replace('canon:canon-', '').replace('.ndjson#L', ' · line ')} · step frame ${stepFrame} · ${stepFrame < 15 ? 'day (c + r)' : 'night (c - r)'}`;
  const at = speaker ? standing.get(placeOf(speaker))!.g.position : here;
  focus.set(at.x * 0.6, speaker ? 2.4 : Math.min(4, here.y), at.z * 0.5 + (speaker ? 0 : -1));
  tone(speaker ? standing.get(placeOf(speaker))!.g.position.clone().setY(2) : here, speaker ? places3.indexOf(placeOf(speaker)) * 2 + 2 : (n.seq % 5), speaker ? 0.18 : 0.05);
}
function onFrame() {
  stepFrame = tick % 30;
  tick++;
  if (!began) return;
  if (--left <= 0) { node = (node + 1) % nodes.length; left = hold[node]!; show(node); }
}
setInterval(onFrame, 500);
onCue((c) => { if (c.id.startsWith('step-')) tick = Number(c.id.slice(5)); });

$('recast').onclick = () => {
  cast = cast === GATE_CAST ? recast(GATE_CAST, 'Solomon', 'CODEX') : GATE_CAST;
  for (const at of standing.values()) at.tag = '';
  stand(cast);
  const d = compare(original, trace(nodes, places, named, cast));
  $('recast').textContent = cast === GATE_CAST ? 'recast Solomon' : 'restore the canon cast';
  $('compare').textContent = cast === GATE_CAST ? 'the canon cast: the trace as written' : `Solomon recast as CODEX and replayed: ${d.frames.length} frames differ, ${d.inside} bytes inside his slots, ${d.outside} outside`;
  node = 0; left = hold[0]!; show(0);
};
$('go').onclick = () => {
  audio = new AudioContext();
  $('enter').classList.add('gone');
  began = true;
  show(0);
};

// ── the frame: sky, sun, glow, the speaker lifting, the camera easing toward who speaks ──
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h); composer.setSize(w, h); bloom.resolution.set(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize);
resize();
const sky = new THREE.Color();
let smooth = 0, lastMs = 0;
renderer.setAnimationLoop((ms) => {
  const t = ms / 1000, dt = lastMs ? Math.min(1, (ms - lastMs) / 1000) : 0;
  lastMs = ms;
  smooth += (tick - smooth) * (1 - Math.exp(-dt * 6));	// eased by time, not by frames drawn: the same at any frame rate
  const angle = (smooth / 30) * Math.PI * 2;	// the step's turn: 12 degrees a frame
  const elev = Math.sin(angle);
  sun.position.set(Math.cos(angle) * 60, elev * 60, -30);
  sunDisc.position.copy(sun.position);
  const day = THREE.MathUtils.clamp(elev * 1.6 + 0.3, 0, 1);
  sky.copy(NIGHT).lerp(DUSK, THREE.MathUtils.clamp(1 - Math.abs(elev) * 2.5, 0, 1) * 0.6).lerp(DAY, day);
  scene.background = sky;
  (scene.fog as THREE.FogExp2).color.copy(sky);
  hemi.intensity = 0.35 + day * 1.2;
  sun.intensity = day * 2.4;
  (stars.material as THREE.PointsMaterial).opacity = 1 - day;
  sunDisc.visible = elev > -0.1;
  for (const at of standing.values()) {
    at.g.position.y += (at.lift * 0.6 - at.g.position.y) * (1 - Math.exp(-dt * 5));
    at.g.rotation.y += at.lift ? 0.01 : 0;
    const form = at.g.children.find((c) => c.name === 'form');
    if (form) glow(form, 0.25 + at.lift * 1.1);
  }
  const lifted = [...standing.values()].find((at) => at.lift);
  spot.intensity += ((lifted ? 60 : 0) - spot.intensity) * (1 - Math.exp(-dt * 6));
  if (lifted) spot.target.position.copy(lifted.g.position);
  cursor.scale.setScalar(1 + Math.sin(t * 4) * 0.15);
  controls.target.lerp(focus, 1 - Math.exp(-dt * 1.2));
  controls.update();
  if (audio) { const l = audio.listener; l.positionX.value = camera.position.x; l.positionY.value = camera.position.y; l.positionZ.value = camera.position.z; }
  if (renderer.xr.isPresenting) renderer.render(scene, camera);
  else composer.render();
});
