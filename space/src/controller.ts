import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
export default function setController (
    canvas: HTMLCanvasElement,
    eventSource: EventSource,
    spoSource: EventSource,
    kSource: EventSource,
    uSource: EventSource,
    uuSource: EventSource,
    ukSource: EventSource,
    kuSource: EventSource,
    kkSource: EventSource,
    signalButton: HTMLButtonElement
) {

    // const elem = document.querySelector<HTMLButtonElement>('#screenshot');
    signalButton.addEventListener('click', () => {
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
}