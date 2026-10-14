import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const stage = $('stage');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c1015);
scene.fog = new THREE.Fog(0x0c1015, 10, 28);
const camera = new THREE.PerspectiveCamera(42, 1, .1, 40);
camera.position.set(8, 6.5, 10);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.xr.enabled = true;
stage.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * .48;
scene.add(new THREE.HemisphereLight(0xddeeff, 0x18202a, 1.8));
const light = new THREE.DirectionalLight(0xfff2dc, 2.1);
light.position.set(-4, 8, 6);
scene.add(light);
const floor = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.MeshStandardMaterial({ color: 0x151c24, roughness: .84 }));
floor.rotation.x = -Math.PI / 2;
scene.add(floor);
scene.add(new THREE.GridHelper(18, 36, 0x35444d, 0x202c34));

const colors = [0x74c8c0, 0xe2b66c, 0xa999e8, 0xef8068];
const forms = new THREE.Group();
forms.position.y = .05;
scene.add(forms);
const formGroups: THREE.Group[] = [];

function material(color: number) {
  return new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .2, roughness: .38, metalness: .18 });
}
function cell(group: THREE.Group, x: number, y: number, z: number, color: number, scale = .52) {
  const cube = new THREE.Mesh(new THREE.BoxGeometry(scale * .88, scale * .88, scale * .88), material(color));
  cube.position.set(x * scale, y * scale + scale / 2, z * scale);
  cube.castShadow = true;
  group.add(cube);
}
function pedestal(x: number, z: number, color: number) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.65, .12, 32), material(0x202b34));
  base.material.emissive.set(color);
  base.material.emissiveIntensity = .16;
  group.add(base);
  forms.add(group);
  formGroups.push(group);
  return group;
}

// Polyform.h: DIM_1D, a polystick represented by its edge path.
const stick = pedestal(-3.8, -1.4, colors[0]!);
const stickPoints = [new THREE.Vector3(-1.1, .24, 0), new THREE.Vector3(-.4, .24, 0), new THREE.Vector3(-.4, .24, .7), new THREE.Vector3(.4, .24, .7), new THREE.Vector3(.9, .24, 0)];
stick.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(stickPoints), new THREE.LineBasicMaterial({ color: colors[0] })));
stickPoints.forEach((point) => { const node = new THREE.Mesh(new THREE.SphereGeometry(.12, 12, 8), material(colors[0]!)); node.position.copy(point); stick.add(node); });

// Polyform.h: DIM_2D, a degree-7 square polyomino.
const domino = pedestal(0, -1.4, colors[1]!);
[[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [1, 2], [2, 2]].forEach(([x, y]) => cell(domino, x - 1, y, 0, colors[1]!));

// Polyform.h: DIM_2_5D, the same 2D base extruded through three layers.
const extrusion = pedestal(3.8, -1.4, colors[2]!);
[[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([x, z]) => [0, 1, 2].forEach((y) => cell(extrusion, x - .5, y, z - .5, colors[2]!, .42)));

// Polyform.h: DIM_3D, a degree-8 polycube grown in a 2 x 2 x 2 block.
const polycube = pedestal(0, 2.5, colors[3]!);
for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) for (let z = 0; z < 2; z++) cell(polycube, x - .5, y, z - .5, colors[3]!, .58);

// Polytron's K(p,C) from polyform.h and tetra-gpu.h: rotl(p,1)^rotl(p,3)^rotr(p,2)^C.
const rotateLeft = (x: number, n: number) => ((x << n) | (x >>> (16 - n))) & 0xffff;
const rotateRight = (x: number, n: number) => ((x >>> n) | (x << (16 - n))) & 0xffff;
const kernel = (p: number, c: number) => rotateLeft(p, 1) ^ rotateLeft(p, 3) ^ rotateRight(p, 2) ^ c;
let pair = 0x0001;
const constant = 0x001d;
function status() {
  $('status').innerHTML = `<span>dimension</span><span>1D · 2D · 2.5D · 3D</span><span>basis</span><span>stick · square · cube</span><span>K(p, C)</span><span>0x${pair.toString(16).padStart(4, '0')} with C = 0x${constant.toString(16)}</span><span>SID</span><span>0x${kernel(pair, constant).toString(16).padStart(4, '0')}</span>`;
}
status();
$('step').onclick = () => { pair = kernel(pair, constant); status(); };
$('reset').onclick = () => { pair = 1; status(); };

if ('xr' in navigator) navigator.xr!.isSessionSupported('immersive-vr').then((supported) => { if (supported) $('xr').appendChild(VRButton.createButton(renderer)); });
function resize() { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize);
resize();
renderer.setAnimationLoop((time) => { controls.update(); formGroups.forEach((group, i) => { group.rotation.y = Math.sin(time / 3000 + i) * .1; }); renderer.render(scene, camera); });
