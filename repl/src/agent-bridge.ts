// THE AGENT BRIDGE: the page on one side, the coding agent on the other
//
// The coding agent starts this as an MCP server (JSON-RPC 2.0, one message per
// line on stdin and stdout) and gets the tools of rosetta/src/agent.ts. While it
// runs, it also serves the page (space/agent.html) on 127.0.0.1:8743:
//   POST /message   the page posts what the author said or pointed at
//   GET  /events    the page listens to the conversation, both sides (server-sent events)
//   GET  /health    whether the bridge is up, and how many messages it holds
// Messages are held in memory only, while the bridge runs; nothing is written to
// disk. stdout carries MCP alone; anything else goes to stderr.
//
// More than one coding agent (Claude Code, OpenCode) can share it. Each starts
// its own copy with AGENT_NAME set; the first holds the port, and any later one
// finds the port taken and relays its tools through the first, over
//   GET  /agent/inbox?since=n   and   POST /agent/message
// which answer only requests without an Origin header (a program on this
// machine, never a web page: browsers always send Origin on those).
//
// Run by hand to try the page without the agent: node repl/src/agent-bridge.ts
import { createServer, type ServerResponse } from 'node:http';
import { createInterface } from 'node:readline';
import { AGENT_TOOLS, BRIDGE_PORT, TAG, check, line, idOf, type Message, type Posted } from '../../rosetta/src/agent.ts';

const port = Number(process.env.AGENT_BRIDGE_PORT ?? BRIDGE_PORT);
const agent = process.env.AGENT_NAME ?? 'claude-code';
let relay = false; // true when another agent's bridge already holds the port
const posted: Posted[] = [];
const listeners = new Set<ServerResponse>();
let nextId = 1;
const log = (...a: unknown[]) => console.error('[agent-bridge]', ...a);

function post(m: Message): Posted {
  const p = { ...m, id: nextId++, at: Date.now() } as Posted;
  posted.push(p);
  if (posted.length > 1000) posted.shift();
  for (const res of listeners) res.write(`id: ${p.id}\ndata: ${JSON.stringify(p)}\n\n`);
  return p;
}

// ---- the page's side: HTTP on the loopback address only ----
const allowed = (origin = '') => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
const http = createServer((req, res) => {
  const origin = req.headers.origin;
  if (origin && !allowed(origin)) { res.writeHead(403).end('only pages served from localhost'); return; }
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') { res.writeHead(204).end(); return; }
  if (req.url?.startsWith('/agent/')) {
    if (origin) { res.writeHead(403).end('agents only'); return; }
    const url = new URL(req.url, 'http://bridge');
    if (req.method === 'GET' && url.pathname === '/agent/inbox') {
      const since = Number(url.searchParams.get('since') ?? 0);
      res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(posted.filter((p) => p.id > since && p.from === 'author')));
      return;
    }
    if (req.method === 'POST' && url.pathname === '/agent/message') {
      let body = '';
      req.on('data', (d) => { body += d; if (body.length > 16384) req.destroy(); });
      req.on('end', () => {
        let m: Message | string;
        try { m = check(JSON.parse(body)); } catch { m = 'not JSON'; }
        if (typeof m === 'string' || m.from !== 'agent') { res.writeHead(400).end(typeof m === 'string' ? m : 'agents speak as agent'); return; }
        const p = post(m);
        log(line(p));
        res.writeHead(201, { 'content-type': 'application/json' }).end(JSON.stringify({ posted: p, listening: listeners.size }));
      });
      return;
    }
    res.writeHead(404).end();
    return;
  }
  if (req.method === 'GET' && req.url === '/health') { res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ ok: true, held: posted.length })); return; }
  if (req.method === 'GET' && req.url?.startsWith('/events')) {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
    const since = Number(req.headers['last-event-id'] ?? 0);
    for (const p of posted) if (p.id > since) res.write(`id: ${p.id}\ndata: ${JSON.stringify(p)}\n\n`);
    listeners.add(res);
    req.on('close', () => listeners.delete(res));
    return;
  }
  if (req.method === 'POST' && req.url === '/message') {
    let body = '';
    req.on('data', (d) => { body += d; if (body.length > 16384) req.destroy(); });
    req.on('end', () => {
      let m: Message | string;
      try { m = check(JSON.parse(body)); } catch { m = 'not JSON'; }
      if (typeof m === 'string' || m.from !== 'author') { res.writeHead(400).end(typeof m === 'string' ? m : 'the page speaks for the author'); return; }
      const p = post(m);
      log(line(p));
      res.writeHead(201, { 'content-type': 'application/json' }).end(JSON.stringify(p));
    });
    return;
  }
  res.writeHead(404).end();
});
http.on('error', (e) => {
  if ((e as NodeJS.ErrnoException).code === 'EADDRINUSE') { relay = true; log(`port ${port} is held by another agent's bridge; ${agent} relays through it`); }
  else log(`the page's side is not up: ${(e as Error).message}`);
});
http.listen(port, '127.0.0.1', () => log(`page side on http://127.0.0.1:${port}`));

// ---- the agent's side: MCP over stdio ----
const primary = `http://127.0.0.1:${port}`;
async function deliver(m: Message): Promise<{ id: number; listening: number }> {
  if (!relay) return { id: post(m).id, listening: listeners.size };
  const r = await fetch(`${primary}/agent/message`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(m) });
  if (!r.ok) throw new Error(`the shared bridge refused it: ${await r.text()}`);
  const { posted: p, listening } = (await r.json()) as { posted: Posted; listening: number };
  return { id: p.id, listening };
}
async function authorSince(since: number): Promise<Posted[]> {
  if (!relay) return posted.filter((p) => p.id > since && p.from === 'author');
  const r = await fetch(`${primary}/agent/inbox?since=${since}`);
  if (!r.ok) throw new Error(`the shared bridge did not answer: ${r.status}`);
  return (await r.json()) as Posted[];
}
async function call(name: string, args: Record<string, unknown>): Promise<string> {
  if (name === 'inbox') {
    const since = Number(args.since ?? 0);
    const mine = await authorSince(since);
    return mine.length ? mine.map(line).join('\n') + `\n(last id ${mine.at(-1)!.id})` : `nothing new since #${since}`;
  }
  if (name === 'say') {
    const m = check({ kind: 'say', from: 'agent', text: args.text, by: agent });
    if (typeof m === 'string') throw new Error(m);
    const d = await deliver(m);
    return `sent #${d.id} as ${agent} (${d.listening} page${d.listening === 1 ? '' : 's'} listening)`;
  }
  if (name === 'show') {
    const tag = String(args.tag ?? '').toUpperCase();
    if (!TAG.test(tag)) throw new Error('tag is /A-Z0-9/, e.g. 3X for I-141');
    return `showing ${tag} (${idOf(tag)}) as #${(await deliver({ kind: 'show', from: 'agent', tag, by: agent })).id}`;
  }
  throw new Error(`no tool ${name}`);
}

const reply = (id: unknown, result?: unknown, error?: { code: number; message: string }) =>
  process.stdout.write(JSON.stringify(error ? { jsonrpc: '2.0', id, error } : { jsonrpc: '2.0', id, result }) + '\n');

createInterface({ input: process.stdin }).on('line', (text) => {
  if (!text.trim()) return;
  let msg: { id?: unknown; method?: string; params?: Record<string, unknown> };
  try { msg = JSON.parse(text); } catch { reply(null, undefined, { code: -32700, message: 'parse error' }); return; }
  const { id, method, params = {} } = msg;
  if (id === undefined) return; // a notification (notifications/initialized and the like)
  if (method === 'initialize') reply(id, { protocolVersion: (params.protocolVersion as string) ?? '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: `boxedpine-agent-bridge (${agent})`, version: '1.1.0' } });
  else if (method === 'ping') reply(id, {});
  else if (method === 'tools/list') reply(id, { tools: AGENT_TOOLS });
  else if (method === 'tools/call') {
    call(String(params.name), (params.arguments as Record<string, unknown>) ?? {})
      .then((text) => reply(id, { content: [{ type: 'text', text }] }))
      .catch((e) => reply(id, { content: [{ type: 'text', text: (e as Error).message }], isError: true }));
  } else reply(id, undefined, { code: -32601, message: `no method ${method}` });
}).on('close', () => { if (!process.env.AGENT_BRIDGE_STAY) process.exit(0); });
