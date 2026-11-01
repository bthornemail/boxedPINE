// THE TWIN in 3D, one view: the Commons drawn with three.js on a transferred canvas (an
// OffscreenCanvas in a worker). The eight characters stand at their hues on the rim and rise
// and fall with their states, the same in both views; only Solomon differs, a sphere in one
// and a glTF model (space/src/assets/shiba.glb) in the other (global.vtt replay-video, gltf).
// Each frame's pixels go back to the page with Solomon's box on the screen (the union of both
// icons' bounds, projected), inside which the two views may differ and outside which not; or, with
// a pose (the walk, walk.ts), the camera where the walker stands and that region as a mask.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { atHue, toWorld } from './plane.ts';
import { CHARACTERS } from './characters.ts';
import { K } from './gnomon.ts';

export type Icon = 'sphere' | 'gltf' | 'stray';
// 'stray' is the glTF icon and, besides, a cube away from Solomon
// a pose puts the camera where the walker stands (walk.ts): first person, eye height 1.6
export type Pose = { x: number; z: number; yaw: number; pitch: number };
export type ToWorker = { canvas: OffscreenCanvas; icon: Icon; model: string } | { tick: number; states?: Record<string, number>; pose?: Pose };
// with a pose, mask in place of box: 1 where Solomon's region (both icons' bounds) is on the screen,
// rendered alone, so the region holds however the walker stands, behind him or beside him
// and seen: 1 where Solomon's own icon shows in this view, the scene drawn black around it, depth tested
export type FromWorker = { tick: number; pixels: Uint8ClampedArray; box?: { x0: number; y0: number; x1: number; y1: number }; mask?: Uint8Array; seen?: Uint8Array };

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
let stray = false;
// Solomon's region alone, white on black, rendered off screen for the mask
const maskScene = new THREE.Scene();
maskScene.background = new THREE.Color(0x000000);
let maskTarget: THREE.WebGLRenderTarget | null = null;

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
  stray = icon === 'stray';
  if (icon === 'stray') {
    // the falsifier: a small cube away from Solomon, which the comparison must catch
    const cube = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    cube.position.set(0, 0.2, 5.5);
    scene.add(cube);
  }
  // Solomon's region: both icons' bounds at the highest rise, in world space
  const at = figures.get('SOLOMON')!.position;
  solomonBounds = new THREE.Box3(new THREE.Vector3(at.x - 0.75, -0.1, at.z - 0.75), new THREE.Vector3(at.x + 0.75, 1.75, at.z + 0.75));
  const dim = solomonBounds.getSize(new THREE.Vector3()), mid = solomonBounds.getCenter(new THREE.Vector3());
  const region = new THREE.Mesh(new THREE.BoxGeometry(dim.x, dim.y, dim.z), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  region.position.copy(mid);
  maskScene.add(region);
}

// the walker's falsifier: a cube held before the eyes, low and to the left, away from Solomon wherever he is
const held = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: 0xffffff }));
held.position.set(-0.22, -0.16, -0.6);

function stand(pose: Pose) {
  camera.position.set(pose.x, 1.6, pose.z);
  camera.rotation.set(pose.pitch, pose.yaw, 0, 'YXZ');
  camera.updateMatrixWorld();
  if (stray && !held.parent) { camera.add(held); scene.add(camera); }
}

function targetMask(draw: THREE.Scene): Uint8Array {
  if (!maskTarget) maskTarget = new THREE.WebGLRenderTarget(size, size);
  renderer!.setRenderTarget(maskTarget);
  renderer!.render(draw, camera);
  const raw = new Uint8Array(size * size * 4);
  renderer!.readRenderTargetPixels(maskTarget, 0, 0, size, size, raw);
  renderer!.setRenderTarget(null);
  const mask = new Uint8Array(size * size);
  for (let i = 0; i < mask.length; i++) mask[i] = raw[i * 4]! > 0 ? 1 : 0;
  return mask;
}
const regionMask = () => targetMask(maskScene);

// where Solomon's icon shows: every mesh drawn black but his, drawn white, the depth test kept
const black = new THREE.MeshBasicMaterial({ color: 0x000000 }), white = new THREE.MeshBasicMaterial({ color: 0xffffff });
function seenMask(): Uint8Array {
  const his = new Set<THREE.Object3D>();
  figures.get('SOLOMON')?.traverse((o) => his.add(o));
  const saved = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  scene.traverse((o) => { if (o instanceof THREE.Mesh) { saved.set(o, o.material); o.material = his.has(o) ? white : black; } });
  const bg = scene.background;
  scene.background = new THREE.Color(0x000000);
  const mask = targetMask(scene);
  scene.background = bg;
  for (const [o, m] of saved) o.material = m;
  return mask;
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
  const mask = m.pose ? (stand(m.pose), regionMask()) : undefined;
  const seen = m.pose ? seenMask() : undefined;
  renderer!.render(scene, camera);
  const gl = renderer!.getContext();
  const raw = new Uint8Array(size * size * 4);
  gl.readPixels(0, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, raw);
  const pixels = new Uint8ClampedArray(raw.buffer);
  if (mask && seen) (self as unknown as Worker).postMessage({ tick: m.tick, pixels, mask, seen } satisfies FromWorker, [pixels.buffer, mask.buffer, seen.buffer]);
  else (self as unknown as Worker).postMessage({ tick: m.tick, pixels, box: screenBox() } satisfies FromWorker, [pixels.buffer]);
};
