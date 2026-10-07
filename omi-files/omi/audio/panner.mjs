// Can PannerNode / StereoPannerNode / AudioListener play the part of transistors?
import { OfflineAudioContext } from 'node-web-audio-api';

const SR = 8000;
const f = (v) => v.toFixed(4);

async function render(build, len = 256) {
  const ctx = new OfflineAudioContext(2, len, SR);
  build(ctx).connect(ctx.destination);
  const b = await ctx.startRendering();
  return [b.getChannelData(0), b.getChannelData(1)];
}
const constant = (ctx, v) => { const n = ctx.createConstantSource(); n.offset.value = v; n.start(); return n; };

// ---------- 1. The listener ----------
{
  const ctx = new OfflineAudioContext(2, 128, SR);
  const L = ctx.listener;
  console.log('--- 1. AudioListener ---');
  console.log('has connect()/disconnect() (is it a wirable node)?', typeof L.connect, typeof L.disconnect);
  console.log('same object every time (one per context)?', ctx.listener === ctx.listener);
  console.log('its parameters:', ['positionX','positionY','positionZ','forwardX','forwardY','forwardZ','upX','upY','upZ'].filter((k) => k in L).join(', '));
  const p = ctx.createPanner();
  console.log('PannerNode inputs/outputs:', p.numberOfInputs, '/', p.numberOfOutputs);
  console.log('PannerNode params:', ['positionX','positionY','positionZ','orientationX','orientationY','orientationZ'].filter((k) => k in p).join(', '));
  const s = ctx.createStereoPanner();
  console.log('StereoPannerNode inputs/outputs:', s.numberOfInputs, '/', s.numberOfOutputs, '  params:', ['pan'].filter((k) => k in s).join(', '));
}

// ---------- 2. Panner: output level vs position (listener at origin) ----------
console.log('\n--- 2. PannerNode level (input = constant 1, listener at origin) ---');
const spots = [[0,0,-1],[1,0,0],[-1,0,0],[0,0,-2],[0,0,-5],[0,0,-10],[3,4,0]];
for (const [x, y, z] of spots) {
  const [l, r] = await render((ctx) => {
    const p = ctx.createPanner();
    p.positionX.value = x; p.positionY.value = y; p.positionZ.value = z;
    constant(ctx, 1).connect(p);
    return p;
  });
  const dist = Math.hypot(x, y, z);
  console.log(`pos (${x},${y},${z}) dist=${f(dist)}  L=${f(l[255])} R=${f(r[255])}`);
}

// ---------- 3. Do x,y,z work as three signal-driven control pins? ----------
console.log('\n--- 3. Drive x,y,z from signals instead of fixed values ---');
{
  const [sl, sr] = await render((ctx) => {
    const p = ctx.createPanner();
    p.positionX.value = 3; p.positionY.value = 0; p.positionZ.value = -1;
    constant(ctx, 1).connect(p);
    return p;
  });
  const [dl, dr] = await render((ctx) => {
    const p = ctx.createPanner();
    p.positionX.value = 0; p.positionY.value = 0; p.positionZ.value = 0;
    constant(ctx, 3).connect(p.positionX);
    constant(ctx, 0).connect(p.positionY);
    constant(ctx, -1).connect(p.positionZ);
    constant(ctx, 1).connect(p);
    return p;
  });
  console.log(`fixed (3,0,-1):  L=${f(sl[255])} R=${f(sr[255])}`);
  console.log(`driven (3,0,-1): L=${f(dl[255])} R=${f(dr[255])}`);
  console.log('match?', Math.abs(sl[255]-dl[255]) < 1e-4 && Math.abs(sr[255]-dr[255]) < 1e-4);
}

// ---------- 4. Is the output a product of two signals (multiplier)? ----------
console.log('\n--- 4. Is panner output linear in a driven position (could it multiply)? ---');
for (const x of [-1, -0.5, 0, 0.5, 1]) {
  const [l, r] = await render((ctx) => {
    const p = ctx.createPanner();
    p.positionZ.value = -1;
    constant(ctx, x).connect(p.positionX);
    constant(ctx, 1).connect(p);
    return p;
  });
  console.log(`x=${String(x).padStart(4)}  L=${f(l[255])} R=${f(r[255])}`);
}
{
  const [l1] = await render((ctx) => { const p = ctx.createPanner(); p.positionX.value = 0.5; p.positionZ.value = -1; constant(ctx, 1).connect(p); return p; });
  const [l2] = await render((ctx) => { const p = ctx.createPanner(); p.positionX.value = 0.5; p.positionZ.value = -1; constant(ctx, 2).connect(p); return p; });
  console.log(`input 1 -> L=${f(l1[255])}, input 2 -> L=${f(l2[255])}  (doubles? ${Math.abs(l2[255]/l1[255]-2) < 1e-3})`);
}

// ---------- 5. How often does a driven position update? ----------
console.log('\n--- 5. Position steps from z=-1 to z=-5 at sample 64 (block = 128 samples) ---');
{
  const [l] = await render((ctx) => {
    const p = ctx.createPanner();
    p.positionZ.value = 0;
    const c = ctx.createConstantSource();
    c.offset.setValueAtTime(-1, 0);
    c.offset.setValueAtTime(-5, 64 / SR);
    c.start();
    c.connect(p.positionZ);
    constant(ctx, 1).connect(p);
    return p;
  }, 512);
  console.log('L at samples 60, 63, 70, 127, 130, 200:', [60,63,70,127,130,200].map((i) => f(l[i])).join('  '));
  console.log('(0.2 would mean the new distance of 5 took effect; 1.0 means still the old one)');
}

// ---------- 6. Stereo panner ----------
console.log('\n--- 6. StereoPannerNode (input = constant 1) ---');
for (const pan of [-1, -0.5, 0, 0.5, 1]) {
  const [l, r] = await render((ctx) => {
    const s = ctx.createStereoPanner();
    s.pan.value = pan;
    constant(ctx, 1).connect(s);
    return s;
  });
  console.log(`pan=${String(pan).padStart(4)}  L=${f(l[255])} R=${f(r[255])}  L^2+R^2=${f(l[255]**2 + r[255]**2)}`);
}
