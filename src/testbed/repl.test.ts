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
    // the agent lifecycle: 300 → 303 → 200 → 304 → 218
    const offer = await fetch(`${base}/port`, { redirect: 'manual' });
    assert.equal(offer.status, 300);
    const choices = (await offer.text()).trim().split('\r\n');
    assert.equal(choices.length, 18); // 16 ports and 2 Hasse diagrams
    const frame = frameIndex({ 'prefers-color-scheme': 'dark' });
    const declared = await fetch(`${base}/port`, { method: 'POST', body: frameText(frame), redirect: 'manual' });
    assert.equal(declared.status, 303);
    const location = declared.headers.get('location')!;
    assert.equal(location, `/port/${framePort(frame)}`);
    const got = await fetch(base + location);
    assert.equal(got.status, 200);
    const etag = got.headers.get('etag')!;
    await got.text();
    assert.equal((await fetch(base + location, { headers: { 'If-None-Match': etag } })).status, 304);
    const permanent = await fetch(`${base}/port/37`, { redirect: 'manual' });
    assert.deepEqual([permanent.status, permanent.headers.get('location')], [308, '/port/5']); // 37 & 15
    const temporary = await fetch(`${base}/dual/7`, { redirect: 'manual' });
    assert.deepEqual([temporary.status, temporary.headers.get('location')], [307, '/port/8']); // 7 ⊕ 15
    // the server speaks HTTP/1.1: the version is the index 11
    const version = await new Promise<string>((ok) => {
      import('node:http').then(({ get }) => get(`${base}/blob`, (r) => { r.resume(); ok(r.httpVersion); }));
    });
    assert.equal(version, '1.1');
    // 206: a byte range is the address of an index
    const whole = await fetch(`${base}/blob`);
    assert.equal(whole.status, 200);
    const tag = whole.headers.get('etag');
    await whole.arrayBuffer();
    const part = await fetch(`${base}/blob`, { headers: { Range: 'bytes=59-59' } });
    assert.equal(part.status, 206);
    assert.equal(part.headers.get('content-range'), 'bytes 59-59/8192');
    assert.equal(part.headers.get('etag'), tag); // the same ETag a 200 carries
    assert.equal(part.headers.get('omi-atom'), '6 Proxy'); // 206 is Proxy
    assert.deepEqual([...new Uint8Array(await part.arrayBuffer())], [60 ^ 59]); // index 59 holds 7, the bell
    assert.equal((await fetch(`${base}/blob`, { headers: { Range: 'bytes=9000-' } })).status, 416);
    const exit = await fetch(`${base}/anything-undecided`); // nothing decided: finally departs with 218
    assert.deepEqual([exit.status, exit.statusText, exit.ok], [218, 'This is fine', true]);
    assert.equal(exit.headers.get('omi-atom'), '2 catch'); // 218 indexes the catch
    assert.equal(await exit.text(), '/anything-undecided'); // the request passes through
  } finally {
    server.close();
  }
});

// ---- The colour gate (SPEC-07 I-90) ----
import { gate, colour, COLOURS, RESET } from '../../repl/src/ansi.ts';

test('ANSI colours are the Fano plane: 30 + n with n = (red, green, blue) bits; complements XOR to white', () => {
  assert.deepEqual([1, 2, 4].map((n) => COLOURS[n]), ['red', 'green', 'blue']);
  assert.equal(COLOURS[1 ^ 2], 'yellow'); // red ⊕ green: the line 1-2-3
  for (const [a, b] of [['red', 'cyan'], ['green', 'magenta'], ['blue', 'yellow']] as const) {
    assert.equal(COLOURS.indexOf(a) ^ COLOURS.indexOf(b), 7); // the three lines through white
  }
  assert.equal(colour(6), '\x1b[36m');
});

test('The gate lets no control byte through: no BEL, and every escape is a colour or the reset', () => {
  const orbit = Array.from({ length: 65536 }, (_, i) => (60 ^ i) & 0xff);
  const out = gate(orbit);
  assert.equal(out.includes('\x07'), false); // the 256 bells are gone
  const escapes = out.match(/\x1b[^m]*m/g)!;
  assert.ok(escapes.every((e) => /^\x1b\[(3[0-7]|0)m$/.test(e)));
  assert.equal(escapes.length, 65536 + 1); // one colour per byte, then the reset
  assert.equal(out.replace(/\x1b\[(3[0-7]|0)m/g, '').length, 65536); // one glyph per byte
  assert.ok(out.endsWith(RESET));
});

test('The base atoms are revealed in 60 ⊕ 0..63: each octet shows all eight colours once, in the order j ⊕ 4', () => {
  const colours = Array.from({ length: 64 }, (_, m) => (60 ^ m) & 7);
  for (let m = 0; m < 64; m++) assert.equal(colours[m], 4 ^ (m & 7));
  for (let o = 0; o < 64; o += 8) assert.deepEqual([...colours.slice(o, o + 8)].sort(), [0, 1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(colours.slice(0, 8).map((n) => COLOURS[n]), ['blue', 'magenta', 'cyan', 'white', 'black', 'red', 'green', 'yellow']);
  assert.equal((60 ^ 64) & 7, 4); // the pole 124 carries the same atom as 60: blue
});

// ---- A sandboxed eMMC over NBD in a QEMU virt machine (SPEC-07 I-94) ----
import { makeImage, serveNbd, readNbd, writeNbd, bootVirt, qmp, CONSTANTS_AT } from '../../repl/src/emmc.ts';
import { proofBlob as blob, xorProof as xorBlob } from '../../rosetta/src/proof.blob.ts';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const hasQemu = ['qemu-nbd', 'qemu-img', 'qemu-io', 'qemu-system-riscv64'].every((c) => spawnSync('which', [c]).status === 0);

test('eMMC over NBD: the proof Blob reads back to 0n; a write reads back; a paused virt machine holds the drive', { skip: !hasQemu && 'QEMU tools not installed' }, async () => {
  const dir = mkdtempSync(join(tmpdir(), 'emmc-'));
  const nbd = await serveNbd((makeImage(join(dir, 'emmc.img')), join(dir, 'emmc.img')), join(dir, 'nbd.sock'));
  try {
    let back = readNbd(join(dir, 'nbd.sock'), join(dir, 'r1.raw'));
    assert.equal(xorBlob(back.slice(0, 8192), blob()).n, 0n);
    assert.deepEqual([...back.slice(CONSTANTS_AT, CONSTANTS_AT + 16)], [...CONSTANTS]);
    writeNbd(join(dir, 'nbd.sock'), 16384, 60, 512);
    back = readNbd(join(dir, 'nbd.sock'), join(dir, 'r2.raw'));
    assert.ok(back.slice(16384, 16896).every((b) => b === 60));
    assert.deepEqual([back[16383], back[16896]], [0, 0]);
    const vm = await bootVirt(join(dir, 'nbd.sock'), join(dir, 'qmp.sock'));
    try {
      const [status, block] = (await qmp(join(dir, 'qmp.sock'), [{ execute: 'query-status' }, { execute: 'query-block' }])) as [{ status: string }, { device: string; inserted?: { image: { filename: string } } }[]];
      assert.equal(status.status, 'prelaunch');
      assert.match(block.find((b) => b.device === 'emmc')!.inserted!.image.filename, /^nbd\+unix:/);
    } finally {
      vm.kill();
    }
  } finally {
    nbd.kill();
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---- Lines of addresses and the 404 substatus block (SPEC-07 I-99, I-100; SRC-12) ----
import { line, ip } from '../../repl/src/ping.ts';

test('1.1.1.1, 8.8.8.8 and 9.9.9.9 are an XOR line; a wall is marked where a point does not return', () => {
  const [a, b, c] = ['1.1.1.1', '8.8.8.8', '9.9.9.9'].map(ip.toInt) as [number, number, number];
  assert.equal((a ^ b) >>> 0, c);
  assert.equal((a ^ c) >>> 0, b);
  assert.equal(ip.fromInt((a ^ b ^ c) >>> 0), '0.0.0.0');
  const p = (address: string, reachable: boolean) => ({ address, port: 443, samples: [], reachable });
  const l = line(p('1.1.1.1', true), p('8.8.8.8', true), p('9.9.9.9', false));
  assert.deepEqual([l.closes, l.wall], [true, 2]);
  const open = line(p('104.20.23.154', true), p('142.251.155.119', true), p('54.36.178.49', true));
  assert.equal(open.closes, false); // the control triple is not a line
});

test('404.N: 60 cancels, the expected value is 404 ⊕ N, and all 21 stay in 404\'s block of 32', () => {
  for (let n = 0; n <= 20; n++) {
    const expected = (60 ^ 404) ^ (60 ^ n);
    assert.equal(expected, 404 ^ n);
    assert.equal(expected >> 5, 404 >> 5); // 384 to 415
    assert.equal(expected & 7, (n & 7) ^ 4); // N's atom, flipped by 404's atom 4
  }
});

// ---- Another architecture over serial (SPEC-07 I-101) ----
import { readFileSync, existsSync } from 'node:fs';
import { reflectsOn } from '../../rosetta/src/organ.ts';
import { parseReading, parseReflect, expectedReading, expectedOrgan, respondTwin, askOrgan, deviation, readBoard } from '../../repl/src/serial.ts';

test('An ESP32 (Xtensa LX6) reading, captured 2026-10-11, deviates by 0 on every line from this frame', () => {
  const board = parseReading(readFileSync(new URL('./fixtures/esp32-reading.txt', import.meta.url), 'utf8'));
  for (const [key, d] of Object.entries(deviation(board, expectedReading()))) {
    assert.notEqual(d, 'missing', key);
    assert.ok((d as number[]).every((v) => v === 0), key);
  }
  assert.deepEqual(board.orbit!.slice(0, 2), [0x4242, 0x061b]); // polytron's chain root, K(0x4242, 0x1D)
});

test('The parity organ: every octet of 60 ⊕ 0…128 reads 0x69, the Thue-Morse byte flipped; the poles agree', () => {
  assert.deepEqual(expectedOrgan(), { parity: [0x69], pole: [1], dev: [0] });
  const thueMorse = [0, 1, 2, 3, 4, 5, 6, 7].reduce((p, a) => p | (((a ^ (a >> 1) ^ (a >> 2)) & 1) << a), 0);
  assert.equal(thueMorse, 0x96);
  assert.equal(0x69, thueMorse ^ 0xff); // 4 has odd parity, so the flip complements every parity
  const board = parseReading(readFileSync(new URL('./fixtures/esp32-organ.txt', import.meta.url), 'utf8'));
  for (const d of Object.values(deviation(board, expectedOrgan()))) assert.ok(d !== 'missing' && d.every((v) => v === 0));
});

test('The organ reflects its state unprompted; its answers to prompts are the lifecycle codes, departing with 218', () => {
  const text = readFileSync(new URL('./fixtures/esp32-organ.txt', import.meta.url), 'utf8');
  const reflected = text.split('\n').map(parseReflect).filter((r) => r);
  assert.equal(reflected.length, 3);
  for (const r of reflected) assert.deepEqual([r!.parity, r!.pole, r!.dev], [0x69, 1, 0]);
  // the board's answers on 2026-10-11, as the twin makes them here
  assert.deepEqual(respondTwin('GET /atom/5'), ['200 OK', 'atom 5 parity 0 dual a', '218 This is fine']);
  assert.deepEqual(respondTwin('GET /atom/b'), ['307 Temporary Redirect', 'location /atom/4', '218 This is fine']);
  assert.deepEqual(respondTwin('GET /m/60-70'), ['206 Partial Content', 'content-range m 60-70/129', 'bits 01101001011', '218 This is fine']);
  assert.deepEqual(respondTwin('GET /m/120-130'), ['416 Range Not Satisfiable', 'content-range m */129', '218 This is fine']);
  assert.deepEqual(respondTwin('GET /parity 69'), ['304 Not Modified', '218 This is fine']);
  assert.deepEqual(respondTwin('POST /x'), ['400 Bad Request', '218 This is fine']);
  assert.equal(respondTwin('GET /')[0], '300 Multiple Choices');
});

const live = !(process.env.OMI_SERIAL && existsSync(process.env.OMI_SERIAL)) && 'set OMI_SERIAL=/dev/ttyUSB0';

test('A live organ reads the same', { skip: live }, () => {
  const board = parseReading(readBoard(process.env.OMI_SERIAL));
  for (const d of Object.values(deviation(board, expectedOrgan()))) assert.ok(d !== 'missing' && d.every((v) => v === 0));
});

test('A live organ answers every negotiation strategy as this frame does', { skip: live }, () => {
  const timing = /^(us|wall|cycles) /;
  for (const request of ['GET /', 'GET /parity', 'GET /parity 69', 'GET /parity 00', 'GET /atom/0', 'GET /atom/7', 'GET /atom/8', 'GET /m/0-128', 'GET /m/64-64', 'GET /m/0-129', 'GET /m/9-3', 'PUT /'])
    assert.deepEqual(askOrgan(process.env.OMI_SERIAL!, request).filter((l) => !timing.test(l)), respondTwin(request), request);
});

test('The organ reflects three ticks in four: silent exactly when the tick is 2 mod 4', () => {
  const ticks = Array.from({ length: 16 }, (_, n) => n).filter(reflectsOn);
  assert.deepEqual(ticks, [0, 1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15]);
  for (let n = 0; n < 1 << 16; n++) assert.equal(reflectsOn(n), (n % 4 === 0) || (n % 2 !== 0 && n % 4 !== 0)); // the author's words
});

test('A live organ is silent on the ticks that are 2 mod 4, and only those', { skip: live }, () => {
  const text = readBoard(process.env.OMI_SERIAL, '', 4000, /(?:reflect [^\n]*\n[^]*){40}/);
  const counts = text.split(/\r?\n/).map(parseReflect).filter((r) => r).map((r) => r!.count);
  assert.ok(counts.length >= 30);
  for (const n of counts) assert.ok(reflectsOn(n), `reflected on tick ${n}`);
  for (let i = 1; i < counts.length; i++) {
    const gap = Array.from({ length: counts[i]! - counts[i - 1]! - 1 }, (_, k) => counts[i - 1]! + 1 + k);
    assert.ok(gap.every((n) => !reflectsOn(n)), `missing ticks ${gap}`);
  }
});
