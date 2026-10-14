// A small driver for headless Chrome over the DevTools protocol (Node's own WebSocket),
// serving the built rooms with vite preview. Used by the browser checks.
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export async function openPage(path, { port = 4181, debug = 9333 } = {}) {
  const vite = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], { stdio: 'ignore', detached: true });
  const chrome = spawn('google-chrome', ['--headless=new', '--disable-gpu', `--remote-debugging-port=${debug}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'cdp-'))}`, '--autoplay-policy=no-user-gesture-required', '--host-resolver-rules=MAP fonts.googleapis.com 127.0.0.1, MAP fonts.gstatic.com 127.0.0.1', 'about:blank'], { stdio: 'ignore', detached: true });
  const close = () => { for (const p of [vite, chrome]) try { process.kill(-p.pid); } catch {} };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let target;
  for (let i = 0; i < 40 && !target; i++) { await sleep(250); try { target = (await (await fetch(`http://127.0.0.1:${debug}/json`)).json()).find((t) => t.type === 'page'); } catch {} }
  await sleep(2500);
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0; const pending = new Map();
  ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); pending.get(d.id)?.(d); });
  const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
  await send('Page.navigate', { url: `http://localhost:${port}${path}` });
  const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;
  const until = async (expression, ms = 60000) => { for (let t = 0; t < ms; t += 500) { const v = await evaluate(expression); if (v) return v; await sleep(500); } return null; };
  return { evaluate, until, sleep, close };
}
