#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const net = require('net');
const { spawn } = require('child_process');
const { requestJson, requestText } = require('./lib');

const auditRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(auditRoot, '..');
const logsDir = path.join(auditRoot, 'artifacts', 'logs');
fs.mkdirSync(logsDir, { recursive: true });

const WORDNET_PORT = Number(process.env.WORDNET_PORT || 4096);
const CSERVER_PORT = Number(process.env.CSERVER_PORT || 8080);
const CSERVER_WS_PORT = Number(process.env.CSERVER_WS_PORT || 8081);
const CSERVER_RATE_LIMIT = Number(process.env.CSERVER_RATE_LIMIT || 100);
const WORDNET_SIMILARITY_MODE =
  String(process.env.WORDNET_SIMILARITY_MODE || 'strict').toLowerCase() === 'fallback'
    ? 'fallback'
    : 'strict';

const WORDNET_BASE_URL =
  process.env.WORDNET_BASE_URL || `http://127.0.0.1:${WORDNET_PORT}`;
const CSERVER_BASE_URL =
  process.env.CSERVER_BASE_URL || `http://127.0.0.1:${CSERVER_PORT}`;

const processes = [];
let shuttingDown = false;

function stamp() {
  const d = new Date();
  return d.toISOString().replace(/[:.]/g, '-');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    const finish = (open) => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve(open);
    };
    socket.setTimeout(500);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
    socket.connect(port, host);
  });
}

async function assertPortFree(port, label) {
  const retries = Number(process.env.VALIDATE_PORT_FREE_RETRIES || 60);
  const delayMs = Number(process.env.VALIDATE_PORT_FREE_DELAY_MS || 250);
  for (let i = 0; i < retries; i++) {
    if (!(await isPortOpen(port))) return;
    await sleep(delayMs);
  }
  if (await isPortOpen(port)) {
    throw new Error(
      `${label} port ${port} is already in use; refusing to attach to unknown service`
    );
  }
}

function spawnService(name, cmd, args, cwd, extraEnv = {}) {
  const logPath = path.join(logsDir, `${stamp()}-${name}.log`);
  const log = fs.createWriteStream(logPath, { flags: 'a' });
  const child = spawn(cmd, args, {
    cwd,
    env: { ...process.env, ...extraEnv },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  child.stdout.pipe(log);
  child.stderr.pipe(log);
  processes.push({ name, child, logPath });
  return child;
}

async function waitFor(checkFn, timeoutMs, label) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      if (await checkFn()) return;
    } catch (_) {
      // keep polling until timeout
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${label} after ${timeoutMs}ms`);
}

async function ensureCServerBinary() {
  await new Promise((resolve, reject) => {
    const p = spawn('make', [], { cwd: path.join(repoRoot, 'c-server'), stdio: 'inherit' });
    p.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`make failed with code ${code}`));
    });
    p.on('error', reject);
  });
}

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const p of processes) {
    if (p.child.exitCode === null) p.child.kill('SIGTERM');
  }

  await sleep(800);
  for (const p of processes) {
    if (p.child.exitCode === null) p.child.kill('SIGKILL');
  }
}

async function main() {
  process.on('SIGINT', async () => {
    await shutdown();
    process.exit(130);
  });
  process.on('SIGTERM', async () => {
    await shutdown();
    process.exit(143);
  });
  process.on('exit', () => {
    for (const p of processes) {
      if (p.child.exitCode === null) p.child.kill('SIGTERM');
    }
  });

  console.log('validate orchestration:');
  console.log(`  WORDNET_BASE_URL=${WORDNET_BASE_URL}`);
  console.log(`  CSERVER_BASE_URL=${CSERVER_BASE_URL}`);
  console.log(`  WORDNET_PORT=${WORDNET_PORT}`);
  console.log(`  CSERVER_PORT=${CSERVER_PORT}`);
  console.log(`  CSERVER_WS_PORT=${CSERVER_WS_PORT}`);
  console.log(`  CSERVER_RATE_LIMIT=${CSERVER_RATE_LIMIT}`);
  console.log(`  WORDNET_SIMILARITY_MODE=${WORDNET_SIMILARITY_MODE}`);

  const uniquePorts = Array.from(new Set([WORDNET_PORT, CSERVER_PORT, CSERVER_WS_PORT]));
  for (const port of uniquePorts) {
    const label =
      port === WORDNET_PORT ? 'wordnet' : port === CSERVER_PORT ? 'c-server' : 'c-server-ws';
    await assertPortFree(port, label);
  }

  await ensureCServerBinary();

  const wordnetChild = spawnService(
    'wordnet',
    process.execPath,
    ['server.js'],
    path.join(repoRoot, 'wordnet'),
    {
      PORT: String(WORDNET_PORT),
      WORDNET_SIMILARITY_MODE
    }
  );
  const cServerChild = spawnService(
    'c-server',
    './fano_server',
    [],
    path.join(repoRoot, 'c-server'),
    {
      CSERVER_PORT: String(CSERVER_PORT),
      CSERVER_WS_PORT: String(CSERVER_WS_PORT),
      CSERVER_RATE_LIMIT: String(CSERVER_RATE_LIMIT)
    }
  );

  for (const p of [wordnetChild, cServerChild]) {
    p.on('exit', (code, signal) => {
      if (shuttingDown) return;
      if (code === 0) return;
      if (code === null && signal) {
        console.error(`Service exited unexpectedly with signal ${signal}`);
        return;
      }
      if (code !== null) {
        console.error(`Service exited unexpectedly with code ${code}`);
      }
    });
  }

  await waitFor(async () => {
    const r = await requestJson(`${WORDNET_BASE_URL}/api/wordnet/lookup?word=wisdom`);
    return r.ok && Array.isArray(r.data);
  }, 15000, 'wordnet readiness');

  await waitFor(async () => {
    const r = await requestText(`${CSERVER_BASE_URL}/`);
    return r.ok && r.status === 200;
  }, 15000, 'c-server readiness');

  console.log('services ready, running audit...');
  const audit = spawn(process.execPath, [path.join(__dirname, 'run-audit.js')], {
    cwd: auditRoot,
    env: {
      ...process.env,
      WORDNET_PORT: String(WORDNET_PORT),
      CSERVER_PORT: String(CSERVER_PORT),
      WORDNET_BASE_URL,
      CSERVER_BASE_URL
    },
    stdio: 'inherit'
  });

  const code = await new Promise((resolve, reject) => {
    audit.on('exit', (c) => resolve(c ?? 1));
    audit.on('error', reject);
  });

  await shutdown();
  console.log('service logs:');
  for (const p of processes) console.log(`  ${p.name}: ${p.logPath}`);
  process.exit(code);
}

main().catch(async (err) => {
  console.error(err.stack || String(err));
  await shutdown();
  process.exit(1);
});
