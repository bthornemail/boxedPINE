// The gate in 3D: its production (production.ts) played in the normalised cube, the cast's forms at the gate,
// a frame a node on the step's clock, recast and replayed, the two traces compared.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { onCue } from './portal.ts';
import { RIM } from './plane.ts';
import { trace, compare, recast, GATE_CAST, type Cast, type Node, type Place, type Named } from './production.ts';

const $ = (id: string) => document.getElementById(id)!;
const [nodes, places, named] = await Promise.all([
  fetch('/narrative/timeline.ndjson').then((r) => r.text()).then((t) => t.trim().split('\n').map((l) => JSON.parse(l) as Node).sort((a, b) => a.seq - b.seq)),
  fetch('/narrative/scene.patch.json').then((r) => r.json()).then((s: { entities: { id: string; position: Place }[] }) => new Map(s.entities.map((e) => [e.id, e.position]))),
  fetch('/narrative/cast.json').then((r) => r.json()).then((c: { nodes: Named[] }) => c.nodes),
]);
const who = new Map(named.map((n) => [n.node_id, n.name]));
const world = (p: Place): [number, number, number] => [(p.x - 0.5) * 2 * RIM, p.y * 2 * RIM, (p.z - 0.5) * 2 * RIM];

const stage = $('stage');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
stage.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1014);
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
camera.position.set(0, RIM * 1.3, RIM * 2.6);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, RIM, 0);
scene.add(new THREE.HemisphereLight(0xddeeff, 0x18202a, 1.8));
const sun = new THREE.DirectionalLight(0xfff2dc, 2);
sun.position.set(5, 12, 8);
scene.add(sun);

// the cube, and the nodes at their places
const box = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2 * RIM, 2 * RIM, 2 * RIM)), new THREE.LineBasicMaterial({ color: 0x74c8c0, transparent: true, opacity: 0.3 }));
box.position.set(0, RIM, 0);
scene.add(box);
const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: 0x8a96a8 }), nodes.length);
nodes.forEach((n, i) => dots.setMatrixAt(i, new THREE.Matrix4().makeTranslation(...world(places.get(n.node_id) ?? { x: 0.5, y: 0.5, z: 0.5 }))));
scene.add(dots);
const cursor = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshBasicMaterial({ color: 0xe8c56a }));
scene.add(cursor);

// the gate: two pillars, and the cast standing in a row before it
for (const x of [-RIM * 0.75, RIM * 0.75]) {
  const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4, 0.4), new THREE.MeshStandardMaterial({ color: 0x8a7638 }));
  pillar.position.set(x, 2, -RIM * 0.6);
  scene.add(pillar);
}
const loader = new GLTFLoader();
const standing = new Map<string, THREE.Group>();	// name -> the group its form stands in
const names = [...new Set(Object.keys(GATE_CAST))].filter((n) => named.some((m) => m.name === n));
names.forEach((name, i) => {
  const g = new THREE.Group();
  g.position.set((i - (names.length - 1) / 2) * 1.6, 0, -RIM * 0.6);
  scene.add(g);
  standing.set(name, g);
});
function stand(cast: Cast) {
  for (const [name, g] of standing) {
    g.clear();
    const tag = cast[name]!;
    loader.load(`/avatars/${tag}.gltf`, (m) => { const h = [...tag].length * 5, s = 2.4 / h; m.scene.scale.setScalar(s); m.scene.position.y = h * s; g.add(m.scene); });
  }
}

// the production, played: a frame a node on the step's clock; recast and replayed, compared
let cast: Cast = GATE_CAST;
const original = trace(nodes, places, named, GATE_CAST);
let start = performance.now() / 1000, frame = -1;
stand(cast);
function show(i: number) {
  frame = i;
  const n = nodes[i]!;
  cursor.position.set(...world(places.get(n.node_id) ?? { x: 0.5, y: 0.5, z: 0.5 }));
  const speaker = who.get(n.node_id);
  for (const [name, g] of standing) g.scale.setScalar(name === speaker ? 1.35 : 1);
  $('frame').textContent = `frame ${i + 1} of ${nodes.length} · ${n.node_id.replace('canon:', '')}${speaker ? ` · ${speaker} as ${cast[speaker]}` : ''}`;
}
$('recast').onclick = () => {
  cast = cast === GATE_CAST ? recast(GATE_CAST, 'Solomon', 'CODEX') : GATE_CAST;
  stand(cast);
  const d = compare(original, trace(nodes, places, named, cast));
  $('compare').textContent = cast === GATE_CAST ? 'the canon cast: the trace as written' : `Solomon recast as CODEX and replayed: ${d.frames.length} frames differ, ${d.inside} bytes inside his slots, ${d.outside} outside`;
  start = performance.now() / 1000;
};
onCue((c) => { if (c.id.startsWith('step-')) start = performance.now() / 1000 - Number(c.id.slice(5)) / 2; });

function resize() { const w = stage.clientWidth, h = Math.max(320, Math.round(w * 0.62)); renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize);
resize();
renderer.setAnimationLoop(() => {
  const t = performance.now() / 1000 - start, i = Math.floor(t * 2) % nodes.length;
  if (i !== frame) show(i);
  controls.update();
  renderer.render(scene, camera);
});
