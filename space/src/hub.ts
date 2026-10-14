import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { gnomon, hex16 } from './gnomon.ts';
import { daliCross, grow, type Cell } from './polyform.ts';
import { namedSynset, placeOf, speakerSeed, stepAgent, synsetDeclaration, synsetSeed, type SynsetAgent } from './commons-agents.ts';
import { BRIDGE_PORT } from '../../rosetta/src/agent.ts';

type Station = {
  title: string;
  room: string;
  description: string;
  color: number;
  position: [number, number, number];
  shape: 'ring' | 'column' | 'orb' | 'panel' | 'dali';
};

const stations: Station[] = [
  { title: 'Breadboard', room: './xr.html', description: 'four XOR builds in 3D', color: 0xe2b66c, position: [-3.2, 1.05, -.4], shape: 'panel' },
  { title: 'Meta', room: './meta.html', description: 'sixteen generated readings', color: 0xa999e8, position: [3.2, 1.05, -.4], shape: 'ring' },
  { title: 'Agent channel', room: './agent.html', description: 'conversation, records, and XR', color: 0xef8068, position: [0, 1.05, -3.4], shape: 'orb' },
  { title: 'Examples', room: './examples.html', description: 'small browser experiments', color: 0x74c8c0, position: [0, .9, 2.9], shape: 'column' },
  { title: 'Polytron', room: './polytron.html', description: 'polyforms + GPU pipeline', color: 0xd68be8, position: [-3.2, 1.05, 2.5], shape: 'dali' },
  { title: 'Living world', room: './metaverse.html', description: 'event-sourced simulation', color: 0x80b8e8, position: [3.2, 1.05, 2.5], shape: 'orb' },
];

const host = document.querySelector<HTMLElement>('#scene')!;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c1015);
scene.fog = new THREE.Fog(0x0c1015, 9, 25);

const camera = new THREE.PerspectiveCamera(45, 1, .1, 40);
camera.position.set(7, 5.8, 9.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.xr.enabled = true;
host.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.enableDamping = true;
controls.minDistance = 5;
controls.maxDistance = 16;
controls.maxPolarAngle = Math.PI * .48;

scene.add(new THREE.HemisphereLight(0xddeeff, 0x18202a, 1.8));
const key = new THREE.DirectionalLight(0xfff2dc, 2.2);
key.position.set(-4, 8, 5);
key.castShadow = true;
scene.add(key);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(8, 64),
  new THREE.MeshStandardMaterial({ color: 0x151c24, roughness: .82, metalness: .08 }),
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(16, 32, 0x35444d, 0x202c34);
grid.position.y = .015;
scene.add(grid);

const center = new THREE.Group();
scene.add(center);
const core = new THREE.Mesh(
  new THREE.IcosahedronGeometry(.78, 1),
  new THREE.MeshStandardMaterial({ color: 0x74c8c0, emissive: 0x123c3b, emissiveIntensity: 1.8, roughness: .3, metalness: .3 }),
);
core.position.y = 1.7;
core.castShadow = true;
center.add(core);
const halo = new THREE.Mesh(
  new THREE.TorusGeometry(1.08, .018, 8, 64),
  new THREE.MeshBasicMaterial({ color: 0x74c8c0, transparent: true, opacity: .7 }),
);
halo.rotation.x = Math.PI / 2;
halo.position.y = 1.7;
center.add(halo);

const selectable: THREE.Object3D[] = [];
const stationGroups: THREE.Group[] = [];
const labelCanvas = (station: Station) => {
  const canvas = document.createElement('canvas');
  canvas.width = 768; canvas.height = 180;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#edf0e9'; ctx.font = '600 42px JetBrains Mono, monospace'; ctx.fillText(station.title, 24, 62);
  ctx.fillStyle = '#9da6ad'; ctx.font = '28px JetBrains Mono, monospace'; ctx.fillText(station.description, 24, 112);
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2.9, .68, 1);
  sprite.position.y = 1.55;
  return sprite;
};

/** A polyform as cubes, centred over its footprint. */
function cellsMesh(cells: Cell[], size: number, material: THREE.Material) {
  const group = new THREE.Group(), box = new THREE.BoxGeometry(size * .94, size * .94, size * .94);
  const mid = (i: 0 | 2) => (Math.min(...cells.map((c) => c[i])) + Math.max(...cells.map((c) => c[i]))) / 2;
  const mx = mid(0), mz = mid(2), my = Math.max(...cells.map((c) => c[1])) / 2;
  for (const [x, y, z] of cells) {
    const cube = new THREE.Mesh(box, material);
    cube.position.set((x - mx) * size, (y - my) * size, (z - mz) * size);
    cube.castShadow = true;
    group.add(cube);
  }
  return group;
}

function stationMesh(station: Station) {
  const group = new THREE.Group();
  group.position.set(...station.position);
  const color = new THREE.Color(station.color);
  const material = new THREE.MeshStandardMaterial({ color, emissive: color.clone().multiplyScalar(.18), emissiveIntensity: 1.4, roughness: .36, metalness: .25 });
  let mesh: THREE.Object3D;
  if (station.shape === 'dali') mesh = cellsMesh(daliCross(), .24, material);
  else if (station.shape === 'ring') mesh = new THREE.Mesh(new THREE.TorusKnotGeometry(.62, .16, 96, 12), material);
  else if (station.shape === 'orb') mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(.72, 2), material);
  else if (station.shape === 'column') mesh = new THREE.Mesh(new THREE.CylinderGeometry(.58, .78, 1.45, 6), material);
  else mesh = new THREE.Mesh(new THREE.BoxGeometry(1.65, .8, .3), material);
  mesh.castShadow = true;
  mesh.traverse((o) => { o.userData.station = station; if (o !== mesh) selectable.push(o); });
  group.add(mesh);
  selectable.push(mesh);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.15, .12, 32), new THREE.MeshStandardMaterial({ color: 0x202b34, emissive: color, emissiveIntensity: .22, metalness: .4, roughness: .4 }));
  base.position.y = .12;
  base.userData.station = station;
  group.add(base);
  selectable.push(base);
  const light = new THREE.PointLight(station.color, 2.2, 4.2);
  light.position.y = 1;
  group.add(light);
  group.add(labelCanvas(station));
  scene.add(group);
  stationGroups.push(group);
}
stations.forEach(stationMesh);

// Polytron's gnomon (tetra-gnomon-anim.c) at the Polytron station: K(p, 0x1D) from
// 0x4242, a dial of 8 points, one lit per step, with the state and its SID.
const steps = gnomon(0x4242);
const polytron = stationGroups[stations.findIndex((s) => s.title === 'Polytron')]!;
const dialPoints = steps.map((_, i) => {
  const a = Math.PI / 2 - (i * 2 * Math.PI) / steps.length;
  const point = new THREE.Mesh(new THREE.SphereGeometry(.07, 16, 12), new THREE.MeshStandardMaterial({ color: 0x3a2f40, emissive: 0xd68be8, emissiveIntensity: 0 }));
  point.position.set(Math.cos(a) * 1.25, .26, -Math.sin(a) * 1.25);
  polytron.add(point);
  return point;
});
const dialCanvas = document.createElement('canvas');
dialCanvas.width = 512; dialCanvas.height = 96;
const dialTexture = new THREE.CanvasTexture(dialCanvas);
const dialLabel = new THREE.Sprite(new THREE.SpriteMaterial({ map: dialTexture, transparent: true, depthTest: false }));
dialLabel.scale.set(1.9, .36, 1);
dialLabel.position.y = -.12;
polytron.add(dialLabel);
let shown = -1;
function showStep(n: number) {
  if (n === shown) return;
  shown = n;
  dialPoints.forEach((p, i) => { (p.material as THREE.MeshStandardMaterial).emissiveIntensity = i === n ? 2.4 : 0; });
  const ctx = dialCanvas.getContext('2d')!, s = steps[n]!;
  ctx.clearRect(0, 0, dialCanvas.width, dialCanvas.height);
  ctx.fillStyle = '#d68be8'; ctx.font = '30px JetBrains Mono, monospace';
  ctx.fillText(`step ${s.step}  ${hex16(s.state)} → ${hex16(s.sid)}`, 12, 58);
  dialTexture.needsUpdate = true;
}

// ── The autonomous agents ───────────────────────────────────
// Synset agents (polytron's barcodes on WordNet synsets) step their own K and
// walk; bridge agents step once per message. See commons-agents.ts.
type Walker = { group: THREE.Group; label: THREE.Sprite; lane: number; state: number; target: THREE.Vector2; beat: number; next: number; synset?: SynsetAgent };
const walkers: Walker[] = [];
const speakers = new Map<string, Walker>();
let synsets: SynsetAgent[] = [];

function textSprite(lines: string[], color: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 40 + lines.length * 34;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color; ctx.font = '600 30px JetBrains Mono, monospace'; ctx.fillText(lines[0]!, 10, 34);
  ctx.fillStyle = '#9da6ad'; ctx.font = '24px JetBrains Mono, monospace';
  lines.slice(1).forEach((l, i) => ctx.fillText(l.slice(0, 34), 10, 70 + i * 34));
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthTest: false }));
  sprite.scale.set(1.6, 1.6 * canvas.height / canvas.width, 1);
  return sprite;
}

function addWalker(cells: Cell[], color: number, lines: string[], seed: number, beat: number, synset?: SynsetAgent) {
  const lane = walkers.length;
  const material = new THREE.MeshStandardMaterial({ color, emissive: new THREE.Color(color).multiplyScalar(.25), roughness: .4, metalness: .2 });
  const body = cellsMesh(cells, .16, material);
  const group = new THREE.Group();
  body.position.y = .5;
  group.add(body);
  const label = textSprite(lines, `#${color.toString(16).padStart(6, '0')}`);
  label.position.y = 1.35;
  group.add(label);
  const [x, z] = placeOf(seed, lane);
  group.position.set(x, 0, z);
  scene.add(group);
  const w: Walker = { group, label, lane, state: seed, target: new THREE.Vector2(x, z), beat, next: 0, synset };
  walkers.push(w);
  return w;
}

function step(w: Walker) {
  const s = stepAgent(w.state, w.lane);
  w.state = s.state;
  w.target.set(...s.at);
}

function addBillboard(w: Walker, url: string) {
  new THREE.TextureLoader().load(url, (texture) => {
    const board = new THREE.Mesh(new THREE.PlaneGeometry(.55, .55), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }));
    board.position.y = 2.05;
    w.group.add(board);
  });
}

fetch(new URL('../polytron/commons.json', location.href)).then((r) => r.json()).then((m: { agents: SynsetAgent[] }) => {
  synsets = m.agents;
  synsets.forEach((a, i) => {
    const w = addWalker(grow(synsetDeclaration(a), synsetSeed(a)), 0xd68be8, [a.word, `${a.geometry} · depth ${a.depth ?? '?'}`, `${a.id}`], synsetSeed(a), 2600 + i * 370, a);
    if (a.svg.beetag) addBillboard(w, new URL(`../${a.svg.beetag}`, location.href).href);
  });
}).catch(() => { /* no manifest: run node scripts/polytron-commons.mjs */ });

const bridgeURL = `http://127.0.0.1:${Number(new URLSearchParams(location.search).get('bridge')) || BRIDGE_PORT}`;
const events = new EventSource(`${bridgeURL}/events`);
events.onmessage = (e) => {
  const p = JSON.parse(e.data) as { kind: string; from: string; by?: string; text?: string };
  const name = p.by ?? p.from;
  let w = speakers.get(name);
  if (!w) {
    w = addWalker(grow({ basis: 0, degree: 5, dimension: 1, group: 0 }, speakerSeed(name)), name === 'author' ? 0xe2b66c : 0x74c8c0, [name, 'on the bridge'], speakerSeed(name), Infinity);
    speakers.set(name, w);
  }
  step(w);
  const to = p.text ? namedSynset(p.text, synsets) : undefined;
  const at = to && walkers.find((x) => x.synset === to);
  if (at) w.target.set(at.target.x + .7, at.target.y + .7);
};
events.onerror = () => { /* the bridge is not running; the synset agents walk on their own */ };

const links = [
  [[-3.2, .18, -.4], [0, .18, 0]], [[3.2, .18, -.4], [0, .18, 0]],
  [[0, .18, -3.4], [0, .18, 0]], [[0, .18, 2.9], [0, .18, 0]],
  [[-3.2, .18, 2.5], [0, .18, 0]],
  [[3.2, .18, 2.5], [0, .18, 0]],
] as const;
for (const [from, to] of links) {
  const material = new THREE.LineBasicMaterial({ color: 0x3d6770, transparent: true, opacity: .7 });
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...from), new THREE.Vector3(...to)]), material));
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
function choose(event: PointerEvent) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(selectable, false)[0]?.object;
  const station = hit?.userData.station as Station | undefined;
  if (!station) return;
  window.location.href = station.room;
}
renderer.domElement.addEventListener('pointerup', choose);

function resize() {
  const width = host.clientWidth, height = host.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

if ('xr' in navigator) {
  navigator.xr!.isSessionSupported('immersive-vr').then((supported) => {
    if (supported) document.body.appendChild(VRButton.createButton(renderer));
  });
}

renderer.setAnimationLoop((time) => {
  controls.update();
  center.rotation.y = time / 7000;
  core.rotation.x = time / 5000;
  halo.rotation.z = time / 4500;
  stationGroups.forEach((group, i) => {
    group.rotation.y = Math.sin(time / 2800 + i) * .12;
    group.position.y = stations[i]!.position[1] + Math.sin(time / 1800 + i * 1.4) * .035;
  });
  showStep(Math.floor(time / 900) % steps.length);
  for (const w of walkers) {
    if (Number.isFinite(w.beat) && time >= w.next) { step(w); w.next = time + w.beat; }
    const p = w.group.position;
    p.x += (w.target.x - p.x) * .02; p.z += (w.target.y - p.z) * .02;
    w.group.rotation.y = time / 4000 + w.lane;
  }
  renderer.render(scene, camera);
});
