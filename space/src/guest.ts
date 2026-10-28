// GUEST FRAME (space/guest.html)
//
// The Plan 9 guest's own screen in the room, as the vault's dimensional ladder
// reads it (wiki/OMI-IMO.md): each frame the guest draws comes from the host's
// frame server (unbound/PLAN9/frames.py, a QEMU screendump as PNG) onto a 2D
// canvas, whose captureStream is a media track (2D); the narrative's WebVTT
// rides that track, and its cuechange is the tick (7D); the video is a texture
// on a plane in a three.js scene (6D), composed with the viewer's pose (4D,
// XRRigidTransform.matrix in a headset) for the observer (0D). It is a flat
// picture: moving round it shows the picture from other angles. The agents
// seen from any angle are the second view, from state Plan 9 serves over 9P.
//
// ?frames= names the frame server (default http://127.0.0.1:8790);
// ?track= the narrative series (default core-octad); ?angle= where the viewer
// starts, in degrees round the frame (0 in front).
import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const query = new URLSearchParams(location.search);
const server = query.get('frames') ?? 'http://127.0.0.1:8790';
const series = (query.get('track') ?? 'core-octad').replace(/[^a-z0-9-]/g, '');

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
