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
