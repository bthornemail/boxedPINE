// THE SERIAL BRIDGE: the Commons to real silicon over Web Serial (space/serial.html)
//
// The ESP32-S3 is the go-between: the breadboard's XOR circuit on one side, the
// logic here on the other. It speaks the parity organ (rosetta/src/organ.ts):
// unprompted it reflects its state every 256 cycles, prompted it answers and
// departs with 218. This page opens the port with a click (navigator.serial
// needs a user gesture, so connecting is itself a Yes), shows the 128-byte
// exchange (exchange.ts) as the board holds it, and reads each line. An AT mode
// sends read-only modem commands for when a Quectel-style modem is the port
// instead; nothing here writes a modem's configuration.
import { parseReflect, ORGAN_CHOICES } from '../../rosetta/src/organ.ts';
import { STATE_BYTES, READ, WRITE, indexOf, fileOf, newState } from './exchange.ts';

type Port = { open(o: { baudRate: number }): Promise<void>; readable: ReadableStream<Uint8Array>; writable: WritableStream<Uint8Array> };
type Serial = { requestPort(): Promise<Port> };
const serial = (navigator as unknown as { serial?: Serial }).serial;

/** Read-only AT queries: identity and SIM, never a write of the modem's configuration. */
export const AT_CHOICES = ['ATI', 'AT+CGMR', 'AT+CGMM', 'AT+CGSN', 'AT+CPIN?', 'AT+QCCID', 'AT+QNWINFO', 'AT+COPS?'] as const;

export type Line =
  | { kind: 'reflect'; parity: number; pole: number; dev: number; count: number }
  | { kind: 'answer-open'; text: string }
  | { kind: 'answer-close'; text: string }
  | { kind: 'ok'; text: string }
  | { kind: 'error'; text: string }
  | { kind: 'other'; text: string };

/** Classify one line from the port: an organ reflection, a numbered answer (opened by NNN, closed by 218), or a modem's OK/ERROR. */
export function classify(line: string): Line {
  const r = parseReflect(line);
  if (r) return { kind: 'reflect', ...r };
  if (line === 'OK') return { kind: 'ok', text: line };
  if (line === 'ERROR' || line.startsWith('+CME ERROR') || line.startsWith('+CMS ERROR')) return { kind: 'error', text: line };
  if (line.startsWith('218 ')) return { kind: 'answer-close', text: line };
  if (/^\d{3} /.test(line)) return { kind: 'answer-open', text: line };
  return { kind: 'other', text: line };
}

/** Lines of an ICCID response carry a 19- or 20-digit code; the last digit is a Luhn check over the rest. */
export function luhnOk(digits: string): boolean {
  const ds = [...digits].filter((c) => c >= '0' && c <= '9').map(Number);
  if (ds.length < 2) return false;
  let sum = 0;
  for (let i = 0; i < ds.length; i++) {
    let d = ds[ds.length - 1 - i]!;
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
}

// ── the page ─────────────────────────────────────────────────
if (typeof document !== 'undefined') {
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
  const NS = 'http://www.w3.org/2000/svg';
  const bytesSvg = $('bytes') as unknown as SVGSVGElement;
  const cells = [...Array(STATE_BYTES).keys()].map((i) => {
    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('x', String(i % 16)); r.setAttribute('y', String(i >> 4));
    r.setAttribute('width', '.92'); r.setAttribute('height', '.92');
    bytesSvg.append(r); return r;
  });
  const state = newState();
  const paint = (lit?: number) => cells.forEach((c, i) => c.setAttribute('fill', i === lit ? '#ffffff' : state[i] === READ ? '#e2b66c' : '#5b8de0'));
  paint();

  const status = $('status'), log = $('log');
  const ask = $<HTMLSelectElement>('ask'), send = $<HTMLButtonElement>('send'), mode = $<HTMLSelectElement>('mode');
  const fillChoices = () => { ask.replaceChildren(); const list = mode.value === 'at' ? AT_CHOICES : ORGAN_CHOICES.map((c) => `GET ${c}`); for (const c of list) ask.add(new Option(c, c)); };
  mode.onchange = fillChoices; fillChoices();

  let writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  let frame = 0;
  const line = (text: string, cls = '') => { const d = document.createElement('div'); if (cls) d.className = cls; d.textContent = text; log.append(d); log.scrollTop = log.scrollHeight; };

  function onLine(raw: string) {
    if (!raw) return;
    const l = classify(raw);
    if (l.kind === 'reflect') {
      status.textContent = `reflect · parity ${l.parity.toString(16)} · pole ${l.pole} · deviation ${l.dev.toString(16).padStart(2, '0')} · ${l.count} × 256 cycles`;
      // the board advanced a frame; mirror the exchange it would have done here
      const i = indexOf(frame); state[i] = state[i] === READ ? WRITE : READ; paint(i); frame++;
      return;
    }
    if (l.kind === 'other' && /^\d{18,20}$/.test(l.text.trim())) line(`${l.text}  (ICCID, Luhn ${luhnOk(l.text) ? 'ok' : 'FAILS'})`, 'ok');
    else line(l.text, l.kind === 'error' ? 'err' : l.kind === 'ok' ? 'ok' : '');
  }

  $('connect').onclick = async () => {
    if (!serial) { status.textContent = 'Web Serial is not available in this browser (Chrome or Edge, over https or localhost).'; return; }
    try {
      const port = await serial.requestPort();
      await port.open({ baudRate: 115200 });
      writer = port.writable.getWriter();
      ask.disabled = send.disabled = false;
      status.textContent = `Connected (${mode.value === 'at' ? 'AT' : 'organ'} mode). ${fileOf(frame)} next.`;
      const reader = (port.readable.pipeThrough(new TextDecoderStream() as unknown as ReadableWritablePair<string, Uint8Array>)).getReader();
      let rest = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        const parts = (rest + value).split(/\r?\n/);
        rest = parts.pop() ?? '';
        parts.forEach((p) => onLine(p.trim()));
      }
    } catch (e) { status.textContent = `not connected: ${(e as Error).message}`; }
  };
  send.onclick = () => { const cmd = mode.value === 'at' ? ask.value : ask.value.replace(/^GET /, ''); line(`→ ${cmd}`, 'sent'); writer?.write(new TextEncoder().encode(`${cmd}\r\n`)); };
}
