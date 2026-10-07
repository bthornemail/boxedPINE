import './style.css'
import heroImg from './assets/hero.png'
import typescriptLogo from './assets/typescript.svg'
import viteLogo from './assets/vite.svg'
import { setupCounter } from './counter.ts'
import * as THREE from 'three';
export function setupCounter(element: HTMLButtonElement) {
  let counter = 0
  const setCounter = (count: number) => {
    counter = count
    element.innerHTML = `Count is ${counter}`
  }
  element.addEventListener('click', () => setCounter(counter + 1))
  setCounter(0)
}
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<style>
canvas:focus {
  outline:none;
}
canvas:focus {
  outline:none;
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
<map name="primary">
  <area
    shape="circle"
    coords="75,75,75"
    href="left.html"
    alt="Click to go Left" />
  <area
    shape="circle"
    coords="275,75,75"
    href="right.html"
    alt="Click to go Right" />
</map>
<img
  usemap="#primary"
  src="https://dummyimage.com/350x150"
alt="350 x 150 pic" />

rect: the value is x1,y1,x2,y2. The value specifies the coordinates of the top-left and bottom-right corner of the rectangle. For example, in <area shape="rect" coords="0,0,253,27" href="#" target="_blank" alt="Mozilla"> the coordinates are 0,0 and 253,27, indicating the top-left and bottom-right corners of the rectangle, respectively.
circle: the value is x,y,radius. Value specifies the coordinates of the circle center and the radius. For example: <area shape="circle" coords="130,136,60" href="#" target="_blank" alt="MDN">
poly: the value is x1,y1,x2,y2,..,xn,yn
<button id="screenshot" type="button">Save...</button>
`
