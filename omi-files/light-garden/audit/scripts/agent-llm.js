#!/usr/bin/env node
/**
 * agent-llm.js
 *
 * LLM adapter runner (OpenAI-compatible HTTP).
 *
 * Default backend: Ollama local OpenAI-compatible API at http://127.0.0.1:11434/v1/chat/completions
 * You can also point it at any OpenAI-compatible endpoint (including an OpenCode gateway if you run one).
 *
 * Emits NDJSON only (canon-safe) into the universe replay directory.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const k = a.slice(2);
    const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    out[k] = v;
  }
  return out;
}

function sha256Text(s) {
  return `sha256:${crypto.createHash('sha256').update(String(s), 'utf8').digest('hex')}`;
}

function nowIso() {
  return new Date().toISOString();
}

function tailText(p, maxChars) {
  try {
    const t = fs.readFileSync(p, 'utf8');
    return t.length <= maxChars ? t : t.slice(t.length - maxChars);
  } catch {
    return null;
  }
}

async function fetchJson(url, init) {
  const res = await fetch(url, init);
  const text = await res.text();
  if (!res.ok) throw new Error(`http_${res.status}:${url}:${text.slice(0, 300)}`);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`invalid_json_response:${url}:${text.slice(0, 300)}`);
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const agentId = String(args.agent || args['agent-id'] || 'metatron');
  const intervalTag = String(args.interval || 'manual');
  const strict = String(args.strict || process.env.LG_LLM_STRICT || '').toLowerCase() === 'true';

  const auditRoot = path.resolve(__dirname, '..');
  const replayDir = path.resolve(auditRoot, String(args['replay-dir'] || 'results/bench/replay/universe/latest'));
  fs.mkdirSync(replayDir, { recursive: true });

  const baseUrl = String(args['base-url'] || process.env.LG_LLM_BASE_URL || 'http://127.0.0.1:11434');
  const model = String(args.model || process.env.LG_LLM_MODEL || 'ministral-3');
  const apiKey = String(args['api-key'] || process.env.LG_LLM_API_KEY || '');

  const endpoint = baseUrl.replace(/\/+$/, '') + '/v1/chat/completions';

  const outNdjson = path.resolve(replayDir, String(args.out || `agent-llm.${agentId}.ndjson`));
  const outJson = path.resolve(replayDir, String(args['out-json'] || `agent-llm.${agentId}.json`));

  const events = [];
  let seq = 1;
  const emit = (event, payload) => events.push({ seq: seq++, timestamp: nowIso(), agent_id: agentId, event, payload });

  const gatePath = path.join(replayDir, 'portal-gate.json');
  const probeSolon = path.join(replayDir, 'agent-probe.solon.ndjson');
  const probeAsab = path.join(replayDir, 'agent-probe.asabiyyah.ndjson');
  const probeSolo = path.join(replayDir, 'agent-probe.solomon.ndjson');

  const gateTail = tailText(gatePath, 40_000);
  const solonTail = tailText(probeSolon, 30_000);
  const asabTail = tailText(probeAsab, 30_000);
  const solomonTail = tailText(probeSolo, 30_000);

  const prompt =
    String(args.prompt || '') ||
    [
      'You are a read-only systems narrator.',
      'Summarize the current portal verification status and operational health.',
      'If there are failures, list them and propose next actions.',
      '',
      'portal-gate.json (tail):',
      gateTail || '(missing)',
      '',
      'agent-probe.solon.ndjson (tail):',
      solonTail || '(missing)',
      '',
      'agent-probe.asabiyyah.ndjson (tail):',
      asabTail || '(missing)',
      '',
      'agent-probe.solomon.ndjson (tail):',
      solomonTail || '(missing)'
    ].join('\n');

  emit('agent.llm.start', { interval: intervalTag, endpoint, model, base_url: baseUrl });
  emit('agent.llm.prompt', { sha256: sha256Text(prompt), chars: prompt.length });

  const body = {
    model,
    stream: false,
    messages: [{ role: 'user', content: prompt }]
  };

  const headers = { 'content-type': 'application/json' };
  if (apiKey) headers.authorization = `Bearer ${apiKey}`;

  let ok = true;
  try {
    const resp = await fetchJson(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
    const text =
      resp &&
      resp.choices &&
      resp.choices[0] &&
      resp.choices[0].message &&
      typeof resp.choices[0].message.content === 'string'
        ? resp.choices[0].message.content
        : JSON.stringify(resp);

    const bounded = text.length > 24_000 ? text.slice(0, 24_000) + '\n[truncated]\n' : text;
    emit('agent.llm.response', { sha256: sha256Text(text), chars: text.length, text: bounded });
  } catch (err) {
    ok = false;
    emit('agent.llm.error', { message: String(err && err.message ? err.message : err) });
  }

  emit('agent.llm.end', { ok });

  fs.writeFileSync(outNdjson, `${events.map((e) => JSON.stringify(e)).join('\n')}\n`, 'utf8');
  fs.writeFileSync(
    outJson,
    JSON.stringify(
      {
        schema_version: 1,
        kind: 'agent-llm',
        agent_id: agentId,
        timestamp: nowIso(),
        backend: { base_url: baseUrl, endpoint, model },
        ndjson: { path: path.basename(outNdjson), sha256: sha256Text(fs.readFileSync(outNdjson, 'utf8')) }
      },
      null,
      2
    ) + '\n',
    'utf8'
  );

  process.stdout.write(JSON.stringify({ ok, agent_id: agentId, ndjson: outNdjson, json: outJson }) + '\n');
  if (strict && !ok) process.exit(2);
}

main().catch((err) => {
  process.stderr.write(String(err && err.message ? err.message : err) + '\n');
  process.exit(2);
});
