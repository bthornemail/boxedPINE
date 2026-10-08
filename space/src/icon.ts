// import './style.css'
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div>
  <canvas width="360" height="240" id="kk" tabindex="3"></canvas>
  <canvas width="360" height="240" id="ku" tabindex="2"></canvas>
  <canvas width="360" height="240" id="uk" tabindex="1"></canvas>
  <canvas width="360" height="240" id="uu" tabindex="0"></canvas>
  <img
    id="image"
    src="/shared-assets/images/examples/favicon144.png"
    alt="MDN logo"
    width="72" />
  <div><button>Reload</button></div>
  <button id="screenshot" type="button">Save...</button>
</div>
`
const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!;
const uuCanvas = document.querySelector<HTMLCanvasElement>('#uu')!;
const ukCanvas = document.querySelector<HTMLCanvasElement>('#uk')!;
const kuCanvas = document.querySelector<HTMLCanvasElement>('#ku')!;
const kkCanvas = document.querySelector<HTMLCanvasElement>('#kk')!;
const image = document.querySelector<HTMLImageElement>("#image")!;
const messageBoard = document.querySelector<HTMLDListElement>("#datalist")!;
const screenshot = document.querySelector("button")!
image.onload = () => {

}
  document.body.appendChild(document.createElement("div")).textContent =
    "loaded!";

  screenshot.addEventListener("click", reload);

  function reload() {
    image.src = "/shared-assets/images/examples/favicon144.png";
  }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  // const renderer = new THREE.WebGLRenderer();
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas!,
    antialias: true,
    preserveDrawingBuffer: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);
  const cube = function addCube() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    return cube;
  }()
  camera.position.z = 5;

  const camera2 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
  camera2.position.set(0, 0, 100);
  camera2.lookAt(0, 0, 0);
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
  const elem = document.querySelector<HTMLButtonElement>('#screenshot');
  elem!.addEventListener('click', () => {
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
  // Selecting elements from the DOM
const list: HTMLDListElement | null = document.querySelector('dl');
const term: HTMLElement | null = document.querySelector('dt');
const description: HTMLElement | null = document.querySelector('dd');

// Creating elements dynamically
const myDl = document.createElement('dl'); // Automatically typed as HTMLDListElement
const myDt = document.createElement('dt'); // Automatically typed as HTMLElement
