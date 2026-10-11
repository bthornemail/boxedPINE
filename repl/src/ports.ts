// BROWSER PORTS: THE SIXTEEN FANO DRAWINGS AND THE TWO HASSE DIAGRAMS
//
// The author: media queries in HTTP/1.1 headers and VTT cues, through bind and
// media constraints, set up browser ports to the 16 Fano plane SVGs and the 2
// Hasse diagrams, "so that any entity that can observe the logic of the svg in
// any form can participate". A request carries its media frame in the
// Omi-Media-Frame header (or ?frame=); the frame converges to one of sixteen
// constants (rosetta/src/media.frame.ts, framePort), and the port serves that
// constant's drawing. Reading the drawing (core fano.ts, readFanoSvg) gives the
// constant back. Each request is propagated into a WebVTT trace (/trace.vtt).
// Loopback only. wiki: SPEC-07 I-85.
import { createServer, type Server } from 'node:http';
import { readdirSync, readFileSync } from 'node:fs';
import { CONSTANTS, readFanoSvg } from '../../core/src/verified/fano.ts';
import { FRAME_HEADER, frameText, parseFrameText, framePort } from '../../rosetta/src/media.frame.ts';
import { propagate, traceVtt, type Reading } from '../../rosetta/src/trace.vtt.ts';
import { proofBlob } from '../../rosetta/src/proof.blob.ts';

/** The departure's status (author: the finally is 218). Non-standard; clients read an unknown 2xx as 200. */
export const DEPARTURE = 218;
export const DEPARTURE_PHRASE = 'This is fine';

const FANO = new URL('../../space/src/assets/fano/', import.meta.url);
const HASSE = new URL('../../space/src/assets/hasse/', import.meta.url);

/** Each constant's drawing, found by reading the files, not by their names. */
export function drawings(): string[] {
  const out: string[] = [];
  for (const name of readdirSync(FANO).filter((f) => f.endsWith('.svg')).sort()) {
    const text = readFileSync(new URL(name, FANO), 'utf8');
    const i = CONSTANTS.indexOf(readFanoSvg(text));
    if (i >= 0 && out[i] === undefined) out[i] = text;
  }
  return out;
}

export function startPorts(port = 0, host = '127.0.0.1'): Promise<Server> {
  const svgs = drawings();
  const hasse = {
    '/hasse': readFileSync(new URL('Fano_plane_Hasse_diagram.svg', HASSE), 'utf8'),
    '/hasse/weights': readFileSync(new URL('Fano_plane_Hasse_diagram_weights.svg', HASSE), 'utf8'),
  } as Record<string, string>;
  const blob = proofBlob();
  // The Blob's ETag: its sixteen-bit XOR fold, so any change to it changes the tag.
  let fold = 0;
  for (let i = 0; i < blob.length; i += 2) fold ^= (blob[i]! << 8) | blob[i + 1]!;
  const blobTag = `"blob-${fold.toString(16).padStart(4, '0')}"`;
  let trace: Reading[] = [];
  let tick = 0;
  const body = (req: import('node:http').IncomingMessage) => new Promise<string>((ok) => { let t = ''; req.on('data', (c) => { t += c; }); req.on('end', () => ok(t.trim())); });
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://loopback');
    const svg = (body: string, headers: Record<string, string> = {}) => {
      res.writeHead(200, { 'Content-Type': 'image/svg+xml', ...headers });
      res.end(body);
    };
    // try / catch / finally as the circulator (SPEC-06), and the codes as an agent's
    // lifecycle (SPEC-07 I-87): 300 offers the ports (agent-driven negotiation),
    // 303 sends a declared frame to its port, 200 serves it, 304 when the agent
    // already holds it, 206 for a byte range of the Blob (the address of an
    // index), 307 to a dual port, 308 from a port past 15 to its nibble, 400 a
    // caught raise, 416 a range outside the Blob, and finally, the departure, 218.
    try {
      if (url.pathname === '/trace.vtt') { res.writeHead(200, { 'Content-Type': 'text/vtt' }); res.end(traceVtt(trace)); return; }
      if (hasse[url.pathname]) return svg(hasse[url.pathname]!);
      if (url.pathname === '/blob') {
        // 206: a Range is the address of an index; the agent prompts it and gets just those bytes.
        const headers = { 'Content-Type': 'application/octet-stream', 'Accept-Ranges': 'bytes', ETag: blobTag };
        const range = /^bytes=(\d+)-(\d*)$/.exec(String(req.headers.range ?? ''));
        if (!req.headers.range) { res.writeHead(200, headers); res.end(blob); return; }
        const first = range ? Number(range[1]) : NaN;
        const last = range && range[2] ? Math.min(Number(range[2]), blob.length - 1) : blob.length - 1;
        if (!range || first > last || first >= blob.length) {
          res.writeHead(416, { 'Content-Range': `bytes */${blob.length}` }); res.end(); return;
        }
        res.writeHead(206, { ...headers, 'Content-Range': `bytes ${first}-${last}/${blob.length}` });
        res.end(blob.subarray(first, last + 1));
        return;
      }
      const fixed = /^\/port\/(\d+)$/.exec(url.pathname);
      // 308: a port number past 15 folds, for good, to its nibble.
      if (fixed && Number(fixed[1]) > 15) { res.writeHead(308, { Location: `/port/${Number(fixed[1]) & 15}` }); res.end(); return; }
      // 307: the dual of port i is port i ⊕ 15 (I-67); a reading, so the move is temporary.
      const dual = /^\/dual\/(\d+)$/.exec(url.pathname);
      if (dual && Number(dual[1]) < 16) { res.writeHead(307, { Location: `/port/${Number(dual[1]) ^ 15}` }); res.end(); return; }
      if (fixed && Number(fixed[1]) < 16) {
        const i = Number(fixed[1]);
        // 304: the agent already holds this constant (its ETag); the deviation is 0, nothing to resend.
        if (req.headers['if-none-match'] === `"${i}"`) { res.writeHead(304, { ETag: `"${i}"` }); res.end(); return; }
        return svg(svgs[i]!, { 'Omi-Fano-Constant': String(i), ETag: `"${i}"` });
      }
      if (url.pathname === '/port') {
        const declared = url.searchParams.get('frame') ?? req.headers[FRAME_HEADER.toLowerCase()];
        if (declared === undefined && req.method !== 'POST') {
          // 300: agent-driven negotiation. The agent arrives with no frame; offer every port.
          const choices = [...svgs.keys()].map((i) => `/port/${i}`).concat(Object.keys(hasse));
          res.writeHead(300, { 'Content-Type': 'text/uri-list', Link: choices.map((c) => `<${c}>; rel="alternate"`).join(', ') });
          res.end(choices.join('\r\n') + '\r\n');
          return;
        }
        const frame = parseFrameText(String(declared ?? await body(req)));
        const i = framePort(frame);
        trace = propagate(trace, { tick: tick++, frame: frameText(frame), port: i, deviation: 0 });
        if (req.method === 'POST') {
          // 303: the agent declared its frame; see the port it converges to.
          res.writeHead(303, { Location: `/port/${i}`, [FRAME_HEADER]: frameText(frame), 'Omi-Fano-Constant': String(i) });
          res.end();
          return;
        }
        return svg(svgs[i]!, { [FRAME_HEADER]: frameText(frame), 'Omi-Fano-Constant': String(i), ETag: `"${i}"` });
      }
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'text/plain' }).end(String((e as Error).message));
    } finally {
      if (!res.headersSent) res.writeHead(DEPARTURE, DEPARTURE_PHRASE, { 'Content-Type': 'text/plain' }).end(url.pathname);
    }
  });
  return new Promise((resolve) => server.listen(port, host, () => resolve(server)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = await startPorts(Number(process.argv[2] ?? 0x3c40));
  console.log(`ports on http://127.0.0.1:${(server.address() as { port: number }).port}/port`);
}
