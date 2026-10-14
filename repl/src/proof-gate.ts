// THE PROOF GATE: the proof tree served on request, with the Sabbath as the stop
//
// The author, 2026-10-13: a stop "so that proof trees can be gated on request";
// "the sabbath protocol was to establish a point where the rest doesn't start
// from the past state, by having an abort-like or escape control". So:
//   request  a proof record, by its /A-Z0-9/ tag: read from the eMMC and replayed
//            (I-190), and the result returned. Nothing replays unless asked.
//   suspend  the stop: every request still in flight is aborted, its result
//            dropped, never attested; requests are refused until resumed.
//   resume   the restart, not from the past state: the machine holding the
//            drive is reset, and every record the scrub finds damaged is written
//            back from the proof tree's literals, so what follows starts from
//            the tree.
// Which events are allowed is the Sabbath contract (types/src/OMI/Sabbath.hs),
// with a request as an attestation, suspend as AttestationSuspended and resume
// as AttestationResumed: a request during the Sabbath is a SabbathViolation;
// resuming with nothing suspended, or suspending twice, is an
// InvalidModeTransition. Over HTTP (serveGate, loopback only):
//   GET  /proof/<tag>  200 the record and whether it holds; 423 Locked during the
//                      Sabbath; 404 no record by that tag; 409 aborted by a stop
//   POST /suspend      200, or 409 Conflict if already suspended
//   POST /resume       200 with what was restored, or 409 if not suspended
import { createServer, type Server } from 'node:http';
import { join } from 'node:path';
import { readNbd } from './emmc.ts';
import { readIndex, replay, restore, resetSignal, scrub } from './proof-emmc.ts';

export type Mode = 'Normal' | 'Sabbath';
export type Kind = 'request' | 'suspend' | 'resume';
export type Refusal = 'SabbathViolation' | 'InvalidModeTransition';

/** The Sabbath contract (OMI.Sabbath.validate), for the gate's three kinds of event. */
export function contract(mode: Mode, kind: Kind): { next: Mode } | { refused: Refusal } {
  if (mode === 'Sabbath' && kind === 'request') return { refused: 'SabbathViolation' };
  if (mode === 'Normal' && kind === 'resume') return { refused: 'InvalidModeTransition' };
  if (mode === 'Sabbath' && kind === 'suspend') return { refused: 'InvalidModeTransition' };
  return { next: kind === 'suspend' ? 'Sabbath' : kind === 'resume' ? 'Normal' : mode };
}

export type Answer =
  | { seq: number; status: 200; tag: string; id: string; holds: boolean; result: string | null }
  | { seq: number; status: 200; mode: Mode; aborted?: number; restored?: number; clean?: boolean; signal?: { event: string; reason: string } }
  | { seq: number; status: 404; tag: string }
  | { seq: number; status: 409 | 423; refused: Refusal | 'aborted by a stop'; mode: Mode };

export class ProofGate {
  mode: Mode = 'Normal';
  private seq = 0;
  private inFlight = new Set<AbortController>();
  private nbdSocket: string;
  private qmpSocket: string;
  private scratch: string;
  constructor(nbdSocket: string, qmpSocket: string, scratch: string) {
    this.nbdSocket = nbdSocket;
    this.qmpSocket = qmpSocket;
    this.scratch = scratch;
  }

  private refuse(seq: number, r: Refusal): Answer {
    return { seq, status: r === 'SabbathViolation' ? 423 : 409, refused: r, mode: this.mode };
  }

  /** A request for one proof record: read from the drive and replayed, unless a stop comes first. */
  async request(tag: string): Promise<Answer> {
    const seq = ++this.seq;
    const c = contract(this.mode, 'request');
    if ('refused' in c) return this.refuse(seq, c.refused);
    const abort = new AbortController();
    this.inFlight.add(abort);
    try {
      const image = readNbd(this.nbdSocket, join(this.scratch, `gate-${seq}.img`));
      const entry = readIndex(image).find((e) => e.tag === tag);
      if (!entry) return { seq, status: 404, tag };
      const [r] = await replay(image, [tag]);
      if (abort.signal.aborted) return { seq, status: 409, refused: 'aborted by a stop', mode: this.mode };
      return { seq, status: 200, tag, id: entry.id, holds: r!.result === null, result: r!.result };
    } finally {
      this.inFlight.delete(abort);
    }
  }

  /** The stop: abort everything in flight. */
  suspend(): Answer {
    const seq = ++this.seq;
    const c = contract(this.mode, 'suspend');
    if ('refused' in c) return this.refuse(seq, c.refused);
    const aborted = this.inFlight.size;
    for (const a of this.inFlight) a.abort();
    this.inFlight.clear();
    this.mode = c.next;
    return { seq, status: 200, mode: this.mode, aborted };
  }

  /** The restart from the tree: reset the machine, restore damaged records from the literals. */
  async resume(): Promise<Answer> {
    const seq = ++this.seq;
    const c = contract(this.mode, 'resume');
    if ('refused' in c) return this.refuse(seq, c.refused);
    const signal = await resetSignal(this.qmpSocket);
    const restored = restore(this.nbdSocket, scrub(readNbd(this.nbdSocket, join(this.scratch, `gate-${seq}-before.img`))).damaged);
    const after = scrub(readNbd(this.nbdSocket, join(this.scratch, `gate-${seq}-after.img`)));
    this.mode = c.next;
    return { seq, status: 200, mode: this.mode, restored, clean: after.indexIntact && after.difference === 0, signal };
  }
}

/** Serve the gate over HTTP on the loopback address. */
export function serveGate(gate: ProofGate, port: number): Promise<Server> {
  const server = createServer(async (req, res) => {
    const send = (a: Answer) => res.writeHead(a.status, { 'content-type': 'application/json' }).end(JSON.stringify(a));
    try {
      const proof = /^\/proof\/([A-Z0-9]{1,8})$/.exec(req.url ?? '');
      if (req.method === 'GET' && proof) return send(await gate.request(proof[1]!));
      if (req.method === 'POST' && req.url === '/suspend') return send(gate.suspend());
      if (req.method === 'POST' && req.url === '/resume') return send(await gate.resume());
      res.writeHead(404).end();
    } catch (e) {
      res.writeHead(500).end((e as Error).message);
    }
  });
  return new Promise((ok) => server.listen(port, '127.0.0.1', () => ok(server)));
}
