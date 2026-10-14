// Records the witness on the map page in headless Chrome and reports the video it makes.
import { openPage } from './cdp.mjs';
const page = await openPage('/space/map.html?bridge=1');
try {
  await page.until("document.querySelector('#story-choices button') !== null");
  await page.evaluate("document.querySelector('#witness-go').click()");
  const src = await page.until("document.querySelector('#witness-video').src || ''", 30000);
  const report = src && await page.evaluate(`(async () => { const v = document.querySelector('#witness-video'); const b = await (await fetch(v.src)).blob(); await new Promise((r) => { if (v.readyState >= 1) r(); else v.onloadedmetadata = r; }); v.currentTime = 1e9; await new Promise((r) => { v.ontimeupdate = r; setTimeout(r, 3000); }); return JSON.stringify({ ok: b.size > 0, type: b.type, bytes: b.size, seconds: v.duration, width: v.videoWidth, height: v.videoHeight }); })()`);
  console.log(report || JSON.stringify({ ok: false, said: await page.evaluate("document.querySelector('#terms-said').textContent") }));
} finally { page.close(); }
