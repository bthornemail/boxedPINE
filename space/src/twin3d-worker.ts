// THE TWIN in 3D, one view: the Commons drawn with three.js on a transferred canvas (an
// OffscreenCanvas in a worker). The eight characters stand at their hues on the rim and rise
// and fall with their states, the same in both views; only Solomon differs, a sphere in one
// and a glTF model (space/src/assets/shiba.glb) in the other (global.vtt replay-video, gltf).
// Each frame's pixels go back to the page with Solomon's box on the screen (the union of both
// icons' bounds, projected), inside which the two views may differ and outside which not.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { atHue, toWorld } from './plane.ts';
import { CHARACTERS } from './characters.ts';
import { K } from './gnomon.ts';

export type Icon = 'sphere' | 'gltf' | 'stray';
// 'stray' is the glTF icon and, besides, a cube away from Solomon
export type ToWorker = { canvas: OffscreenCanvas; icon: Icon; model: string } | { tick: number; states?: Record<string, number> };
export type FromWorker = { tick: number; pixels: Uint8ClampedArray; box?: { x0: number; y0: number; x1: number; y1: number } };

let renderer: THREE.WebGLRenderer | null = null;
let size = 0;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x151c24);
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.set(0, 17, 9);
camera.lookAt(0, 0, 0);
scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 2.2));
const sun = new THREE.DirectionalLight(0xffffff, 1.6);
sun.position.set(4, 10, 6);
scene.add(sun);
const floor = new THREE.Mesh(new THREE.CircleGeometry(7.6, 96), new THREE.MeshStandardMaterial({ color: 0x1f2a33 }));
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const figures = new Map<string, THREE.Object3D>();
let solomonBounds = new THREE.Box3();

function place(tag: string, obj: THREE.Object3D) {
  const c = CHARACTERS.find((x) => x.tag === tag)!;
  const [x, , z] = toWorld(atHue(c.hue));
  obj.position.set(x, 0, z);
  obj.userData.base = 0;
  figures.set(tag, obj);
  scene.add(obj);
}

function sphere(hue: number | null) {
  const color = hue === null ? new THREE.Color(0xdddddd) : new THREE.Color().setHSL(hue / 360, 0.7, 0.55);
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 16), new THREE.MeshStandardMaterial({ color }));
  m.position.y = 0.45;
  const g = new THREE.Group();
  g.add(m);
  return g;
}

async function build(icon: Icon, model: string) {
  for (const c of CHARACTERS) if (c.tag !== 'SOLOMON') place(c.tag, sphere(c.hue));
  const solomon = CHARACTERS.find((c) => c.tag === 'SOLOMON')!;
  const asSphere = sphere(solomon.hue);
  if (icon === 'sphere') place('SOLOMON', asSphere);
  else {
    const gltf = await new GLTFLoader().loadAsync(model);
    const g = new THREE.Group();
    const m = gltf.scene;
    const box = new THREE.Box3().setFromObject(m), dim = box.getSize(new THREE.Vector3());
    m.scale.setScalar(1.1 / Math.max(dim.x, dim.y, dim.z));
    const b2 = new THREE.Box3().setFromObject(m);
    m.position.y -= b2.min.y;
    g.add(m);
    place('SOLOMON', g);
  }
  if (icon === 'stray') {
    // the falsifier: a small cube away from Solomon, which the comparison must catch
    const cube = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    cube.position.set(0, 0.2, 5.5);
    scene.add(cube);
  }
  // Solomon's region: both icons' bounds at the highest rise, in world space
  const at = figures.get('SOLOMON')!.position;
  solomonBounds = new THREE.Box3(new THREE.Vector3(at.x - 0.75, -0.1, at.z - 0.75), new THREE.Vector3(at.x + 0.75, 1.75, at.z + 0.75));
}

function screenBox() {
  const pts: THREE.Vector3[] = [];
  for (const x of [solomonBounds.min.x, solomonBounds.max.x]) for (const y of [solomonBounds.min.y, solomonBounds.max.y]) for (const z of [solomonBounds.min.z, solomonBounds.max.z]) pts.push(new THREE.Vector3(x, y, z).project(camera));
  const xs = pts.map((p) => (p.x + 1) / 2 * size), ys = pts.map((p) => (p.y + 1) / 2 * size); // readPixels rows run from the bottom
  return { x0: Math.floor(Math.min(...xs)) - 2, y0: Math.floor(Math.min(...ys)) - 2, x1: Math.ceil(Math.max(...xs)) + 2, y1: Math.ceil(Math.max(...ys)) + 2 };
}

function statesAt(tick: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of CHARACTERS) { let s = c.seed; for (let t = 0; t < tick; t++) s = K(s); out[c.tag] = s; }
  return out;
}

let ready: Promise<void> = Promise.resolve();

self.onmessage = async (e: MessageEvent<ToWorker>) => {
  const m = e.data;
  if ('canvas' in m) {
    size = m.canvas.width;
    renderer = new THREE.WebGLRenderer({ canvas: m.canvas, antialias: false, preserveDrawingBuffer: true });
    renderer.setSize(size, size, false);
    ready = build(m.icon, m.model);
    return;
  }
  await ready;
  const states = m.states ?? statesAt(m.tick);
  // each rises with its state's low byte: the story as motion, the same in both views
  for (const [tag, obj] of figures) obj.position.y = ((states[tag] ?? 0) & 0xff) / 255 * 0.6;
  renderer!.render(scene, camera);
  const gl = renderer!.getContext();
  const raw = new Uint8Array(size * size * 4);
  gl.readPixels(0, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, raw);
  const pixels = new Uint8ClampedArray(raw.buffer);
  (self as unknown as Worker).postMessage({ tick: m.tick, pixels, box: screenBox() } satisfies FromWorker, [pixels.buffer]);
};
