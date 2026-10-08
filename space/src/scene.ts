import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
export default function setScene(
    canvas: HTMLCanvasElement,
    ukuCanvas: HTMLCanvasElement,
    kukCanvas: HTMLCanvasElement,
    uuCanvas: HTMLCanvasElement,
    ukCanvas: HTMLCanvasElement,
    kuCanvas: HTMLCanvasElement,
    kkCanvas: HTMLCanvasElement,
    messageBoard: HTMLDListElement,
    signalButton: HTMLButtonElement
): [scene: THREE.Scene, camera: THREE.PerspectiveCamera, camera2: THREE.PerspectiveCamera] {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    const camera2 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
    camera2.position.set(0, 0, 100);
    return [scene, camera, camera2];
}