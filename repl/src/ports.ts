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
  let trace: Reading[] = [];
  let tick = 0;
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://loopback');
    const svg = (body: string, headers: Record<string, string> = {}) => {
      res.writeHead(200, { 'Content-Type': 'image/svg+xml', ...headers });
      res.end(body);
    };
    try {
      if (url.pathname === '/trace.vtt') { res.writeHead(200, { 'Content-Type': 'text/vtt' }); return res.end(traceVtt(trace)); }
      if (hasse[url.pathname]) return svg(hasse[url.pathname]!);
      const fixed = /^\/port\/(\d+)$/.exec(url.pathname);
      if (fixed && Number(fixed[1]) < 16) return svg(svgs[Number(fixed[1])]!, { 'Omi-Fano-Constant': fixed[1]! });
      if (url.pathname === '/port') {
        const text = url.searchParams.get('frame') ?? String(req.headers[FRAME_HEADER.toLowerCase()] ?? '0x0');
        const frame = parseFrameText(text);
        const i = framePort(frame);
        trace = propagate(trace, { tick: tick++, frame: frameText(frame), port: i, deviation: 0 });
        return svg(svgs[i]!, { [FRAME_HEADER]: frameText(frame), 'Omi-Fano-Constant': String(i) });
      }
      res.writeHead(404).end();
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'text/plain' }).end(String((e as Error).message));
    }
  });
  return new Promise((resolve) => server.listen(port, host, () => resolve(server)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = await startPorts(Number(process.argv[2] ?? 0x3c40));
  console.log(`ports on http://127.0.0.1:${(server.address() as { port: number }).port}/port`);
}
