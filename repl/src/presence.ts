// IS ANYONE ALREADY BROADCASTING HERE?
//
// The author: "we can use mqtt subscriptions and publication to see if anyone
// is already broadcasting; udp also". Before a peer propagates on its loopback
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

export type Probe = { heard: string[]; announced: boolean; client: MqttClient };

/**
 * Listen on the address's presence topic for waitMs. If no one is heard and
 * announce is set, publish a retained presence, with a will that clears it if
 * this peer drops. The broker is the caller's choice; nothing is published
 * anywhere else.
 */
export async function mqttProbe(broker: string, address: string, payload: string, { waitMs = 500, announce = true } = {}): Promise<Probe> {
  const topic = presenceTopic(address);
  const client = await connectAsync(broker, { will: { topic, payload: '', retain: true, qos: 1 } });
  const heard: string[] = [];
  client.on('message', (t, message) => { if (t === topic && message.length) heard.push(message.toString()); });
  await client.subscribeAsync(topic, { qos: 1 });
  await new Promise((r) => setTimeout(r, waitMs));
  const announced = announce && heard.length === 0;
  if (announced) await client.publishAsync(topic, payload, { retain: true, qos: 1 });
  return { heard, announced, client };
}
