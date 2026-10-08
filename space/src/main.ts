// import './style.css'
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import setScene from './scene';
import setController from './controller';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<dialog id="known-known">
<canvas width="360" height="240" id="k-k"></canvas>
</dialog>
<dialog id="known-unknown">
  <canvas width="360" height="240" id="k-u"></canvas>
  </dialog>
  <dialog id="unknown-known">
<canvas width="360" height="240" id="u-k"></canvas>
  </dialog>
  <dialog id="unknown-unknown">
  <canvas width="360" height="240" id="u-u"></canvas>
  </dialog>
  <dialog id="unknown-known-unknown">
    <canvas width="360" height="240" id="k-u-k"></canvas>
  </dialog>
  <dialog id="known-unknown-known">
    <canvas width="360" height="240" id="u-k-u"></canvas>
  </dialog>
  <canvas width="360" height="240" id="canvas"></canvas>
  <div id="controller">
    <img id="icon" width="360" height="240" src="/ascii.table.svg"/>
    <button id="signal-button">Signal</button>
    <button id="screenshot" type="button">Save...</button>
  </div>
`
const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!;
const uuCanvas = document.querySelector<HTMLCanvasElement>('#u-u')!;
const ukCanvas = document.querySelector<HTMLCanvasElement>('#u-k')!;
const kuCanvas = document.querySelector<HTMLCanvasElement>('#k-u')!;
const kkCanvas = document.querySelector<HTMLCanvasElement>('#k-k')!;
const kukCanvas = document.querySelector<HTMLCanvasElement>('#k-u-k')!;
const ukuCanvas = document.querySelector<HTMLCanvasElement>('#u-k-u')!;
const icon = document.querySelector<HTMLImageElement>("#icon")!;
const messageBoard = document.querySelector<HTMLDListElement>("#datalist")!;
const signalButton = document.querySelector<HTMLButtonElement>("#signal-button")!;

const eventSource = new EventSource('/events');
const spoSource = new EventSource('/subject/predicate/object');
const kSource = new EventSource('/events/known');
const uSource = new EventSource('/events/unknown');
const uuSource = new EventSource('/events/unknown/known');
const ukSource = new EventSource('/events/unknown/known');
const kuSource = new EventSource('/events/known/unknown');
const kkSource = new EventSource('/events/known/known');

// const renderer = new THREE.WebGLRenderer();
const renderer = new THREE.WebGLRenderer({
  canvas: canvas!,
  antialias: true,
  preserveDrawingBuffer: true,
  alpha: true,
});
renderer.setSize(360, 240);
// renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);

const [scene, camera, camera2] = setScene(canvas,ukuCanvas,kukCanvas, uuCanvas, ukCanvas, kuCanvas, kkCanvas,messageBoard, signalButton);
const controller = setController(canvas, eventSource, spoSource, kSource, uSource, uuSource, ukSource, kuSource, kkSource, messageBoard,signalButton);

const cube = function addCube() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  return cube;
}()
const boxd = function addBOXD() {
  //create a blue LineBasicMaterial
  const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
  const points = [];
  points.push(new THREE.Vector3(- 10, 0, 0));
  points.push(new THREE.Vector3(0, 10, 0));
  points.push(new THREE.Vector3(10, 0, 0));

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  scene.add(line);
  return line;
}()

function addPIN(): Promise<THREE.Group<THREE.Object3DEventMap>> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load('./src/assets/shiba.2mb.glb', function (gltf) {
      scene.add(gltf.scene);
      resolve(gltf.scene.clone(true))
    }, undefined, function (error) {
      console.error(error);
      reject(error);
    });
  });
}


camera2.lookAt(0, 0, 0);
function animate(time: number) {
  cube.rotation.x = time / 2000;
  cube.rotation.y = time / 1000;
  boxd.rotation.x = time / 2000;
  boxd.rotation.y = time / 1000;
  // if (_pined?.rotation) {
  //   _pined.rotation.x = time / 2000;
  //   _pined.rotation.y = time / 1000;
  // }

  renderer.render(scene, camera);

}

icon.onload = () => {

}


const screenshotButton = document.querySelector<HTMLButtonElement>('#screenshot');
screenshotButton!.addEventListener('click', () => {
  canvas!.toBlob((blob: Blob | null) => {
    saveBlob(blob!,
      `screencapture-${canvas!.width}x${canvas!.height}.png`
    );
  });
});

const saveBlob = (function () {
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  return function saveData(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
  };
}());
