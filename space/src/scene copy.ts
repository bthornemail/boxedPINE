import './style.css'
import heroImg from './assets/hero.png'
import typescriptLogo from './assets/typescript.svg'
import viteLogo from './assets/vite.svg'
import { setupCounter } from './counter.ts'
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
const img = new Image(); // Automatically typed as HTMLImageElement

// Hook up the load event first
img.onload = (event: Event) => {
  // TypeScript correctly infers 'img' as HTMLImageElement
  console.log(`Image dimensions: ${img.naturalWidth}x${img.naturalHeight}`);
  
  // Alternative: access via event targeting (requires type casting)
  const target = event.target as HTMLImageElement;
  console.log("Loaded source:", target.src);
  setScene(canvas,uuCanvas,ukCanvas,kuCanvas,kkCanvas,target,messageBoard,signalButton)

};

img.onerror = (err) => {
  console.error("Failed to load image", err);
};

img.src = imgUrl;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

const camera2 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
camera2.position.set(0, 0, 100);
camera2.lookAt(0, 0, 0);
function addLine() {
    //create a blue LineBasicMaterial
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const points = [];
    points.push(new THREE.Vector3(- 10, 0, 0));
    points.push(new THREE.Vector3(0, 10, 0));
    points.push(new THREE.Vector3(10, 0, 0));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line);
    const loader = new GLTFLoader();

    loader.load('path/to/model.glb', function(gltf) {

        scene.add(gltf.scene);

    }, undefined, function(error) {

        console.error(error);

    });
}
function animate(time) {

    cube.rotation.x = time / 2000;
    cube.rotation.y = time / 1000;

    renderer.render(scene, camera);

}
const elem = document.querySelector('#screenshot');
elem.addEventListener('click', () => {
    canvas.toBlob((blob) => {
        saveBlob(blob,
            `screencapture - ${ canvas.width }x${ canvas.height }.png`
        );
    });
});

const saveBlob = (function() {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    return function saveData(blob, fileName) {
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
    };
}());
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<style>
canvas:focus {
  outline:none;
}
canvas:focus {
  outline:none;
}
#c3:focus {
    outline: none;
}
#loading {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: xx-large;
  font-family: sans-serif;
}
#loading>div>div {
  padding: 2px;
}
.progress {
  width: 50vw;
  border: 1px solid black;
}
#progressbar {
  width: 0;
  transition: width ease-out .5s;
  height: 1em;
  background-color: #888;
  background-image: linear-gradient(
    -45deg,
    rgba(255, 255, 255, .5) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, .5) 50%,
    rgba(255, 255, 255, .5) 75%,
    transparent 75%,
    transparent
  );
  background-size: 50px 50px;
  animation: progressanim 2s linear infinite;
}
 
@keyframes progressanim {
  0% {
    background-position: 50px 50px;
  }
  100% {
    background-position: 0 0;
  }
}
</style>
<canvas id="c1"></canvas>
<canvas id="c2" tabindex="0"></canvas>
<canvas id="c3" tabindex="1"></canvas>
<canvas id="c"></canvas>
<div id="loading">
    <div>
      <div>...loading...</div>
      <div class="progress"><div id="progressbar"></div></div>
    </div>
  </div>
<button id="screenshot" type="button">Save...</button>
`
document.querySelectorAll('canvas').forEach((canvas) => {
    const ctx = canvas.getContext('2d');

    function draw(str) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(str, canvas.width / 2, canvas.height / 2);
    }
    draw(canvas.id);

    canvas.addEventListener('focus', () => {
        draw('has focus press a key');
    });

    canvas.addEventListener('blur', () => {
        draw('lost focus');
    });

    canvas.addEventListener('keydown', (e) => {
        draw(
            keyCode: ${ e.keyCode }
        );
    });
});
setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)


const manager = new THREE.LoadingManager();
manager.onLoad = init;
const models = {
    pig: { url: 'resources/models/animals/Pig.gltf' },
    cow: { url: 'resources/models/animals/Cow.gltf' },
    llama: { url: 'resources/models/animals/Llama.gltf' },
    pug: { url: 'resources/models/animals/Pug.gltf' },
    sheep: { url: 'resources/models/animals/Sheep.gltf' },
    zebra: { url: 'resources/models/animals/Zebra.gltf' },
    horse: { url: 'resources/models/animals/Horse.gltf' },
    knight: { url: 'resources/models/knight/KnightCharacter.gltf' },
};
{
    const gltfLoader = new GLTFLoader(manager);
    for (const model of Object.values(models)) {
        gltfLoader.load(model.url, (gltf) => {
            model.gltf = gltf;
        });
    }
}

const progressbarElem = document.querySelector('#progressbar');
manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    progressbarElem.style.width =
        ${ itemsLoaded / itemsTotal * 100 | 0 }%
;
};
function prepModelsAndAnimations() {
    Object.values(models).forEach(model => {
        const animsByName = {};
        model.gltf.animations.forEach((clip) => {
            animsByName[clip.name] = clip;
        });
        model.animations = animsByName;
    });
}

function init() {
    // hide the loading bar
    const loadingElem = document.querySelector('#loading');
    loadingElem.style.display = 'none';

    prepModelsAndAnimations();
}
const geometry = new THREE.TetrahedronGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const tetrahedron = new THREE.Mesh(geometry, material);
scene.add(tetrahedron);
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
const box = new THREE.Box3();
box.setFromCenterAndSize(new THREE.Vector3(1, 1, 1), new THREE.Vector3(2, 1, 3));
const helper = new THREE.Box3Helper(box, 0xffff00);
scene.add(helper)

const size = 10;
const divisions = 10;
const gridHelper = new THREE.GridHelper(size, divisions, 0x444444, 0x888888);

scene.add(gridHelper);
const radius = 10;
const sectors = 16;
const rings = 8;
const divisions = 64;
const helper = new THREE.PolarGridHelper(radius, sectors, rings, divisions, 0x444444, 0x888888);
scene.add(helper);


const root = new THREE.Bone();
const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const child = new THREE.Bone();
root.add(child);
child.position.y = 5;
const helper = new THREE.SkeletonHelper(new THREE.SkinnedMesh(root, material));
scene.add(helper);

const map = new THREE.TextureLoader().load('sprite.png');
const material = new THREE.SpriteMaterial({ map: map });
const sprite = new THREE.Sprite(material);
scene.add(sprite);
const people = new PersonGenerator();
scene.add(people.build(placements)); // placements: Matrix4[]
new ColorWheel()
new LUT3DStyle()
import { Octree } from 'three/addons/math/Octree.js';
const octree = new Octree().fromGraphNode(scene);
const result = octree.capsuleIntersect(playerCollider); // collision detection
import { SVGRenderer } from 'three/addons/renderers/SVGRenderer.js';

new SVGRenderer()

import * as Text2D from 'three/addons/webxr/Text2D.js';
Text2D.createText(message : string, height : number) : Mesh(inner)

const timer = new Timer();
timer.connect(document); // use Page Visibility API
new RenderTarget3D(width : number, height : number, depth : number, options : RenderTarget~Options)

new RenderTarget(width : number, height : number, options : RenderTarget~Options)
new Raycaster(origin : Vector3, direction : Vector3, near : number, far : number)
Layers
A layers object assigns an 3D object to 1 or more of 32 layers numbered 0 to 31 - internally the layers are stored as a bit mask], and by default all 3D objects are a member of layer 0.

This can be used to control visibility - an object must share a layer with a camera to be visible when that camera's view is rendered.

All classes that inherit from Object3D have an layers property which is an instance of this class.

Constructor
new Layers()
Constructs a new layers instance, with membership initially set to layer 0.

class Car extends EventDispatcher {
    start() {
        this.dispatchEvent({ type: 'start', message: 'vroom vroom!' });
    }
};
// Using events with the custom object
const car = new Car();
car.addEventListener('start', function(event) {
    alert(event.message);
});
car.start();
const geometry = new THREE.BufferGeometry();
// create a simple square shape. We duplicate the top left and bottom right
// vertices because each vertex needs to appear once per triangle.
const vertices = new Float32Array([
    -1.0, -1.0, 1.0, // v0
    1.0, -1.0, 1.0, // v1
    1.0, 1.0, 1.0, // v2
    1.0, 1.0, 1.0, // v3
    -1.0, 1.0, 1.0, // v4
    -1.0, -1.0, 1.0  // v5
]);
// itemSize = 3 because there are 3 values (components) per vertex
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const mesh = new THREE.Mesh(geometry, material);
const camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000);
scene.add(camera);

Constructor
new OrthographicCamera(left : number, right : number, top : number, bottom : number, near : number, far : number)

new HTMLTexture(element : HTMLElement, mapping : number, wrapS : number, wrapT : number, magFilter : number, minFilter : number, format : number, type : number, anisotropy : number)
