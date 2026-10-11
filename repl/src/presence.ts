// IS ANYONE ALREADY BROADCASTING HERE?
//
// The author: "we can use mqtt subscriptions and publication to see if anyone
// is already broadcasting; udp also", and "we only get back deviation".
// Before a peer propagates on its loopback
// address (core/src/verified/loopback.ts), it asks two ways:
//
//   UDP  — try to bind the address. Binding is a compare-exchange: it succeeds
//          when the address was free (and now holds it), and throws when
//          someone already holds it. The exception is the reading.
//   MQTT — subscribe to the address's presence topic and listen briefly. A
//          retained message means someone has announced; silence means no one
//          has, and the peer may announce itself (retained, cleared by its will).
import dgram from 'node:dgram';
import { connectAsync, type MqttClient } from 'mqtt';

/** DECISION: the port is 60 and 64 as two bytes, 0x3C40 = 15424. */
export const PRESENCE_PORT = 0x3c40;

export type Claim =
  | { claimed: true; socket: dgram.Socket }
  | { claimed: false; reason: string };

/** Try to hold address:port over UDP. claimed: false means someone is already there. */
export function udpClaim(address: string, port = PRESENCE_PORT): Promise<Claim> {
  return new Promise((resolve) => {
    const socket = dgram.createSocket({ type: 'udp4', reuseAddr: false });
    socket.once('error', (err: NodeJS.ErrnoException) => {
      socket.close();
      resolve({ claimed: false, reason: err.code ?? err.message });
    });
    socket.bind(port, address, () => resolve({ claimed: true, socket }));
  });
}

export const presenceTopic = (address: string) => `omi/presence/${address}`;

export type Probe = { heard: number[]; deviations: number[]; announced: boolean; client: MqttClient };

/** A presence payload is only the 24-bit loopback index, as six hex digits. */
export const indexPayload = (index: number) => (index & 0xffffff).toString(16).padStart(6, '0');

/**
 * Listen on the address's presence topic for waitMs. What comes back is only
 * the deviation: each heard index ⊕ this peer's index. 0 means the same index
 * (convergence); anything else is the reading. If no one is heard and announce
 * is set, publish this peer's index retained, with a will that clears it if the
 * peer drops. The broker is the caller's choice.
 */
export async function mqttProbe(broker: string, address: string, index: number, { waitMs = 500, announce = true } = {}): Promise<Probe> {
  const topic = presenceTopic(address);
  const client = await connectAsync(broker, { reconnectPeriod: 0, will: { topic, payload: '', retain: true, qos: 1 } });
  const collected: number[] = [];
  const onMessage = (t: string, message: Buffer) => {
    if (t === topic && /^[0-9a-f]{6}$/.test(message.toString())) collected.push(parseInt(message.toString(), 16));
  };
  client.on('message', onMessage);
  await client.subscribeAsync(topic, { qos: 1 });
  await new Promise((r) => setTimeout(r, waitMs));
  client.off('message', onMessage); // stop before announcing, so a peer never hears itself
  const heard = [...collected];
  const announced = announce && heard.length === 0;
  if (announced) await client.publishAsync(topic, indexPayload(index), { retain: true, qos: 1 });
  return { heard, deviations: heard.map((h) => h ^ (index & 0xffffff)), announced, client };
}

/** Clear this address's retained presence (an empty retained message). */
export const clearPresence = (client: MqttClient, address: string) =>
  client.publishAsync(presenceTopic(address), '', { retain: true, qos: 1 });
