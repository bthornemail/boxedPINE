// Runs space/sound-check.html in headless Chrome and prints its result.
// Through vite preview, driven over the DevTools protocol (Node's own WebSocket):
// the page renders offline audio, so the script waits until it writes its result.
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const port = 4181, debug = 9333;
const vite = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], { stdio: 'ignore', detached: true });
const chrome = spawn('google-chrome', ['--headless=new', '--disable-gpu', `--remote-debugging-port=${debug}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'sound-check-'))}`, '--autoplay-policy=no-user-gesture-required', '--host-resolver-rules=MAP fonts.googleapis.com 127.0.0.1, MAP fonts.gstatic.com 127.0.0.1', 'about:blank'], { stdio: 'ignore', detached: true });
const stop = (code) => { for (const p of [vite, chrome]) try { process.kill(-p.pid); } catch {} process.exit(code); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  let target;
  for (let i = 0; i < 40 && !target; i++) { await sleep(250); try { target = (await (await fetch(`http://127.0.0.1:${debug}/json`)).json()).find((t) => t.type === 'page'); } catch {} }
  await sleep(2500); // vite preview
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0; const pending = new Map();
  ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); pending.get(d.id)?.(d); });
  const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
  await send('Page.navigate', { url: `http://localhost:${port}/space/sound-check.html` });
  let text = 'running';
  for (let i = 0; i < 120 && text === 'running'; i++) { await sleep(500); const r = await send('Runtime.evaluate', { expression: "document.getElementById('result')?.textContent ?? 'running'" }); text = r.result?.result?.value ?? 'running'; }
  console.log(text);
  stop(text.startsWith('{"ok":true') ? 0 : 1);
} catch (e) { console.error(e); stop(1); }
