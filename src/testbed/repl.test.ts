// Checks the presence probes in repl/src/presence.ts. Run: npm test
// The MQTT check starts a private mosquitto on the loopback for its own length,
// and is skipped where mosquitto is not installed. Nothing is published to any
// public broker.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { udpClaim, mqttProbe, presenceTopic, indexPayload, PRESENCE_PORT } from '../../repl/src/presence.ts';
import { parseMac, foldMac, loopbackAddress } from '../../core/src/verified/index.ts';

const address = loopbackAddress(foldMac(parseMac('02:00:5e:10:20:30'))); // 127.18.32.110

test('UDP: the first claim on an address holds it; a second finds someone already there', async () => {
  const first = await udpClaim(address);
  assert.equal(first.claimed, true);
  const second = await udpClaim(address);
  assert.deepEqual(second, { claimed: false, reason: 'EADDRINUSE' });
  if (first.claimed) first.socket.close();
  const again = await udpClaim(address); // released, so free again
  assert.equal(again.claimed, true);
  if (again.claimed) again.socket.close();
  assert.equal(PRESENCE_PORT, (60 << 8) | 64);
});

const hasMosquitto = spawnSync('which', ['mosquitto']).status === 0;

test('MQTT: the first peer hears no one and announces; the next gets back only the deviation', { skip: !hasMosquitto && 'mosquitto not installed' }, async () => {
  const port = 18000 + (process.pid % 1000);
  const broker = spawn('mosquitto', ['-p', String(port)], { stdio: 'ignore' });
  const clients: { endAsync: () => Promise<void> }[] = [];
  try {
    await new Promise((r) => setTimeout(r, 400));
    const url = `mqtt://127.0.0.1:${port}`;
    const index = foldMac(parseMac('02:00:5e:10:20:30'));
    const a = await mqttProbe(url, address, index, { waitMs: 300 });
    clients.push(a.client);
    assert.deepEqual([a.heard, a.announced], [[], true]);
    const b = await mqttProbe(url, address, index ^ 0x06, { waitMs: 300 });
    clients.push(b.client);
    assert.deepEqual([b.heard, b.deviations, b.announced], [[index], [0x06], false]);
    const c = await mqttProbe(url, address, index, { waitMs: 300, announce: false });
    clients.push(c.client);
    assert.deepEqual(c.deviations, [0]); // same index: the deviation is 0
    assert.equal(indexPayload(index), '12206e');
    assert.equal(presenceTopic(address), 'omi/presence/127.18.32.110');
  } finally {
    await Promise.all(clients.map((x) => x.endAsync()));
    broker.kill();
  }
});

// ---- Frames of reference (I-83), and the ports (I-85) ----
import { crystal, timeFrame, contamination } from '../../repl/src/frames.ts';
import { startPorts } from '../../repl/src/ports.ts';
import { CONSTANTS, readFanoSvg } from '../../core/src/verified/index.ts';
import { frameIndex, frameText, framePort } from '../../rosetta/src/media.frame.ts';
import { execFileSync } from 'node:child_process';

test('Time: the kernel tick reads the same in every time zone; only the wall-clock offset differs', () => {
  const run = (tz: string) => JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e',
    `const f = await import(${JSON.stringify(new URL('../../repl/src/frames.ts', import.meta.url).href)});
     const at = new Date('2026-10-11T12:00:00Z');
     console.log(JSON.stringify({ states: [0,1,2,3].map((k) => f.timeFrame(k, at).state), offset: f.timeFrame(0, at).localOffsetMinutes }));`],
    { env: { ...process.env, TZ: tz } }).toString());
  const utc = run('UTC'), kolkata = run('Asia/Kolkata'), la = run('America/Los_Angeles');
  assert.deepEqual([utc.states, kolkata.states, la.states], [[60, 63, 60, 63], [60, 63, 60, 63], [60, 63, 60, 63]]);
  assert.deepEqual([utc.offset, kolkata.offset, la.offset], [0, 330, -420]);
  assert.equal(crystal(0) ^ crystal(1), 3); // the crystal steps by swap32
  assert.equal(timeFrame(5).state, 63);
});

test('Space: a raw allocation XOR a zeroed one is the pool\'s contamination (0 in Node; native pools are not zeroed)', () => {
  const c = contamination();
  assert.ok(c >= 0 && c <= 65536);
  if (spawnSync('which', ['gcc']).status !== 0) return;
  const dir = new URL('../../repl/native/', import.meta.url);
  const exe = new URL('pool', `file://${process.env.TMPDIR ?? '/tmp'}/`).pathname + process.pid;
  execFileSync('gcc', ['-O0', '-o', exe, new URL('pool.c', dir).pathname]);
  const out = execFileSync(exe).toString();
  const big = /size\s+65536\s+raw nonzero\s+(\d+)\s+deviation raw\^safe\s+(\d+)/.exec(out)!;
  assert.equal(big[1], big[2]); // deviation from a zeroed block is exactly the raw contents
  assert.ok(Number(big[2]) > 0); // the native pool came back with its old contents
});

test('Ports: a request\'s media frame converges to a Fano drawing, and reading the drawing gives the constant back', async () => {
  const server = await startPorts(0);
  try {
    const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    const frames = [0n, frameIndex({ 'prefers-color-scheme': 'dark', 'display-mode': 'picture-in-picture' }), (1n << 35n) - 1n];
    for (const f of frames) {
      const res = await fetch(`${base}/port`, { headers: { 'Omi-Media-Frame': frameText(f) } });
      assert.equal(res.headers.get('content-type'), 'image/svg+xml');
      const i = Number(res.headers.get('omi-fano-constant'));
      assert.equal(i, framePort(f));
      assert.equal(readFanoSvg(await res.text()), CONSTANTS[i]); // the drawing carries its own index
    }
    for (let i = 0; i < 16; i++) assert.equal(readFanoSvg(await (await fetch(`${base}/port/${i}`)).text()), CONSTANTS[i]);
    for (const p of ['/hasse', '/hasse/weights']) assert.ok((await (await fetch(base + p)).text()).includes('<svg'));
    const vtt = await (await fetch(`${base}/trace.vtt`)).text();
    assert.equal((vtt.match(/^tick-\d+$/gm) ?? []).length, frames.length);
    assert.equal((await fetch(`${base}/port?frame=nope`)).status, 400);
  } finally {
    server.close();
  }
});
