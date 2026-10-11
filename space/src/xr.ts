// BREADBOARD SPACE (space/xr.html)
//
// The four XOR builds of breadboard/kernel.mjs in 3D (three.js, WebXR when a
// headset is present), the same reading on the Fano plane in 2D, and the wiki
// walkthrough as a WebVTT track. The 3D canvas is streamed into a <video> that
// carries the track, so the video can go picture-in-picture; the 2D panel can
// go picture-in-picture through the Document Picture-in-Picture API.
//
// One reading in both views: for inputs a, b the index a | b << 1 | (a ⊕ b) << 2
// is 0, 5, 6 or 3, the circle line 3-5-6 with zero (wiki: SPEC-16).
import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { createKernel, evaluate, ledLit } from '../../breadboard/kernel.mjs';
import { LINES } from '../../core/src/verified/fano.ts';
import { breadboardGeometry, type Vec } from './breadboard.geometry.ts';
import trackUrl from '../../rosetta/src/assets/walkthrough.vtt?url';
import { currentFrame, frameIndex, frameText, framePort } from '../../rosetta/src/media.frame.ts';
import { animationTicks, place } from '../../core/src/verified/cycle.ts';

type Circuit = Parameters<typeof breadboardGeometry>[0][number] & { transistorCount: number; led: { net: string; drive: string } };
const kernel = createKernel();
const circuits = kernel.circuits as Circuit[];
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// ?a=1&b=0 sets the inputs, so any reading can be linked
const query = new URLSearchParams(location.search);
let a = query.get('a') === '1' ? 1 : 0, b = query.get('b') === '1' ? 1 : 0;

// ---- 3D ----
const stage = $('stage');
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.xr.enabled = true;
stage.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(css('--paper') || '#f6f6f2');
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(7.2, 7, 11.5);
camera.lookAt(7.2, 0, 0.6);
scene.add(new THREE.HemisphereLight(0xffffff, 0x444455, 2.2));
const sun = new THREE.DirectionalLight(0xffffff, 1.6);
sun.position.set(3, 8, 6);
scene.add(sun);

const board = new THREE.Group();
board.position.set(2.2, 0, -1.5); // clear of the panel on the left
scene.add(board);
const leds: THREE.Mesh[] = [];
const wireMat = new THREE.LineBasicMaterial({ color: 0x8a8f99 });
const V = (p: Vec) => new THREE.Vector3(...p);

// Draw the geometry derived in breadboard.geometry.ts; A-Frame or a canvas can draw the same list.
for (const s of breadboardGeometry(circuits)) {
  if (s.kind === 'box') {
    const m = new THREE.Mesh(new THREE.BoxGeometry(...s.size), new THREE.MeshStandardMaterial({ color: 0xe9e6dc }));
    m.position.copy(V(s.at));
    board.add(m);
  } else if (s.kind === 'cylinder') {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(s.radius, s.radius, s.height, 12), new THREE.MeshStandardMaterial({ color: 0x2b2d33 }));
    m.position.copy(V(s.at));
    board.add(m);
  } else if (s.kind === 'sphere') {
    const m = new THREE.Mesh(new THREE.SphereGeometry(s.radius, 24, 16), new THREE.MeshStandardMaterial({ color: 0x444444, emissive: 0x000000 }));
    m.position.copy(V(s.at));
    board.add(m);
    leds.push(m);
  } else {
    board.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(s.from), V(s.to)]), wireMat));
  }
}

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();
renderer.setAnimationLoop((t) => {
  board.rotation.y = Math.sin(t / 4000) * 0.12;
  renderer.render(scene, camera);
});

const xr = $('xr');
if ('xr' in navigator) {
  navigator.xr!.isSessionSupported('immersive-vr').then((ok) => {
    if (ok) xr.appendChild(VRButton.createButton(renderer));
    else xr.textContent = 'No VR headset here';
  });
} else xr.textContent = 'WebXR not available';

// ---- 2D: the Fano plane ----
const P: Record<number, [number, number]> = { 1: [13.5, 72.3], 2: [47.5, 13.5], 3: [30.5, 42.9], 4: [81.4, 72.3], 5: [47.5, 72.3], 6: [64.5, 42.9], 7: [47.5, 52.7] };
const NS = 'http://www.w3.org/2000/svg';
const fano = $('fano') as unknown as SVGSVGElement;
const mk = (tag: string, attrs: Record<string, string | number>) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  fano.appendChild(e);
  return e;
};
const lineEl: Record<string, Element> = {};
for (const L of LINES) {
  const key = [...L].sort().join('');
  if (key === '356') { lineEl[key] = mk('circle', { cx: 47.5, cy: 52.7, r: 19.6, class: 'ln' }); continue; }
  const pts = L.map((n) => P[n]!).sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  lineEl[key] = mk('line', { x1: pts[0]![0], y1: pts[0]![1], x2: pts[2]![0], y2: pts[2]![1], class: 'ln' });
}
const ptEl: Record<number, Element> = {};
for (const n of [1, 2, 3, 4, 5, 6, 7]) {
  ptEl[n] = mk('circle', { cx: P[n]![0], cy: P[n]![1], r: 5.2, class: 'pt' });
  mk('text', { x: P[n]![0], y: P[n]![1] + 0.3 }).textContent = String(n);
}

// ---- one reading, both views ----
function update() {
  const inA = $('inA'), inB = $('inB');
  inA.textContent = `A = ${a}`; inA.setAttribute('aria-pressed', String(!!a));
  inB.textContent = `B = ${b}`; inB.setAttribute('aria-pressed', String(!!b));
  const rows = circuits.map((c, i) => {
    const lit = ledLit(c, evaluate(c, a, b));
    const m = leds[i]!.material as THREE.MeshStandardMaterial;
    m.color.set(lit ? css('--ok') || '#2f7d4f' : '#444444');
    m.emissive.set(lit ? css('--ok') || '#2f7d4f' : '#000000');
    return `<tr><td>${c.id}</td><td>${c.transistorCount} transistors</td><td class="${lit ? 'lit' : ''}">LED ${lit ? 'on' : 'off'}</td></tr>`;
  });
  $('builds').innerHTML = rows.join('');
  const point = a | (b << 1) | ((a ^ b) << 2);
  $('out').textContent = `a ⊕ b = ${a ^ b} · point ${point || '0 (the zero)'}`;
  Object.values(ptEl).forEach((e) => e.classList.remove('on'));
  if (point) ptEl[point]!.classList.add('on');
  lineEl['356']!.classList.add('hit');
}
$('inA').onclick = () => { a ^= 1; update(); };
$('inB').onclick = () => { b ^= 1; update(); };
update();

// ---- this device's media frame, and the Fano port it converges to (SPEC-07 I-82, I-85) ----
function showFrame() {
  const frame = frameIndex(currentFrame((q) => matchMedia(q)));
  const port = framePort(frame);
  $('frame').textContent = `${frameText(frame)} → port ${port}`;
}
showFrame();

// ---- the meta-cycle, ticked by animation frames (the kernel ticks it anywhere else; SPEC-07 I-88) ----
const meta = $('meta');
animationTicks((cb) => requestAnimationFrame(cb), (m) => { meta.textContent = `place ${place(m.ring)} · ${String.fromCharCode(m.crystal)} (${m.crystal})`; });
for (const q of ['(prefers-color-scheme: dark)', '(display-mode: picture-in-picture)', '(prefers-reduced-motion: reduce)']) matchMedia(q).addEventListener('change', showFrame);

// ---- the walkthrough track on a video of the 3D canvas ----
const video = $<HTMLVideoElement>('video');
video.srcObject = renderer.domElement.captureStream(30);
const track = document.createElement('track');
Object.assign(track, { kind: 'captions', label: 'Walkthrough', srclang: 'en', src: trackUrl, default: true });
video.appendChild(track);
track.track.mode = 'hidden';
track.track.addEventListener('cuechange', () => {
  const cue = track.track.activeCues?.[0] as VTTCue | undefined;
  const box = $('cue');
  box.replaceChildren(cue ? cue.getCueAsHTML() : document.createTextNode(''));
});
$('play').onclick = () => { video.play(); };

$('pip3d').onclick = async () => {
  await video.play();
  if (document.pictureInPictureEnabled) await video.requestPictureInPicture();
};
$('pip2d').onclick = async () => {
  const dpip = (window as unknown as { documentPictureInPicture?: { requestWindow(o: object): Promise<Window> } }).documentPictureInPicture;
  if (!dpip) { $('pip2d').textContent = '2D PiP not supported here'; return; }
  const win = await dpip.requestWindow({ width: 400, height: 640 });
  [...document.styleSheets].forEach((s) => {
    try { const st = win.document.createElement('style'); st.textContent = [...s.cssRules].map((r) => r.cssText).join('\n'); win.document.head.appendChild(st); } catch { /* cross-origin font sheet */ }
  });
  const panel = $('panel');
  win.document.body.appendChild(panel);
  win.addEventListener('pagehide', () => document.body.appendChild(panel));
};
