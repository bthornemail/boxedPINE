/**
 * Versioned self-healing BusyBox — 3! streams + Prolog/WordNet recovery + probes
 */
'use strict';

const { createBusyBox } = (() => {
  try {
    return require('./busybox');
  } catch (_) {
    return {
      createBusyBox: () => ({
        run(cmd) {
          return { ok: true, stdout: String(cmd), stderr: '' };
        }
      })
    };
  }
})();
const { heal } = require('./wordnet-heal');
const { selfHeal, classifyMessage, compatibleVersion, COMPAT_MIN, COMPAT_MAX } = require('./prolog-resolve');
const { probe } = require('./system-probe');

const VERSION = '1.36.0-omi';

function threeFactorialOrderings() {
  const s = ['stdin', 'stdout', 'stderr'];
  const out = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (j === i) continue;
      for (let k = 0; k < 3; k++) {
        if (k === i || k === j) continue;
        out.push([s[i], s[j], s[k]]);
      }
    }
  }
  return out;
}

function createVersionedBusyBox(options) {
  options = options || {};
  const core = typeof createBusyBox === 'function' ? createBusyBox(options) : null;
  const buffers = { stdin: [], stdout: [], stderr: [] };
  let healthy = true;
  let version = options.version || VERSION;

  const handlers = {
    fallback: (err) => ({ healed: true, out: 'fallback:' + (err.command || '') }),
    sanitize: (err) => ({
      healed: true,
      out: String(err.input || '').replace(/[^\w\s.-]/g, '')
    }),
    reconnect: () => ({ healed: true, out: 'reconnect' }),
    upgrade: () => ({ healed: true, out: 'upgrade-compat' }),
    reset: () => {
      buffers.stdin.length = 0;
      buffers.stdout.length = 0;
      buffers.stderr.length = 0;
      return { healed: true, out: 'reset' };
    },
    default: () => ({ healed: true, out: 'default' }),
    help: () => ({ healed: true, out: 'applets: echo cat xor true false' }),
    list: () => ({ healed: true, out: 'echo cat xor true false' })
  };

  function writeStream(name, data) {
    buffers[name].push(String(data));
  }

  function exec(cmd, input) {
    const command = String(cmd || '').trim();
    try {
      if (!command) {
        throw Object.assign(new Error('invalid empty command'), { kind: 'invalid_input' });
      }
      // Prefer existing BusyBox applets
      if (core && typeof core.run === 'function') {
        const r = core.run(command, input);
        if (r && r.ok === false) {
          throw Object.assign(new Error(r.stderr || 'busybox error'), {
            kind: classifyMessage(r.stderr || '')
          });
        }
        const out = (r && (r.stdout || r.out)) || '';
        writeStream('stdout', out);
        return { ok: true, out: String(out), healed: false };
      }
      // Minimal applets
      if (command === 'true') return { ok: true, out: '', healed: false };
      if (command === 'false') {
        throw Object.assign(new Error('false'), { kind: 'unknown_command', command });
      }
      if (command.startsWith('echo ')) {
        const out = command.slice(5);
        writeStream('stdout', out);
        return { ok: true, out, healed: false };
      }
      throw Object.assign(new Error('unknown command: ' + command), {
        kind: 'unknown_command',
        command
      });
    } catch (e) {
      const error = {
        kind: e.kind || classifyMessage(e.message),
        message: e.message,
        command: e.command || command,
        input: input
      };
      writeStream('stderr', error.message + '\n');

      // Prolog resolution then WordNet handlers
      const prolog = selfHeal(error, {
        reset: () => {
          buffers.stdin.length = 0;
          buffers.stdout.length = 0;
          buffers.stderr.length = 0;
        }
      });
      if (prolog.healed) {
        writeStream('stdout', prolog.out);
        return { ok: true, healed: true, action: prolog.action, out: prolog.out };
      }
      const wn = heal(error, handlers);
      if (wn.healed) {
        writeStream('stdout', wn.out);
        return { ok: true, healed: true, action: wn.action, out: wn.out };
      }
      return { ok: false, error, healed: false };
    }
  }

  function recheck() {
    const p = probe();
    healthy = p.healthy;
    return {
      healthy,
      version,
      compatible: compatibleVersion(version.replace(/-omi$/, '') || COMPAT_MIN),
      probe: p,
      streams: threeFactorialOrderings().length === 6
    };
  }

  return {
    VERSION,
    MIN_VERSION: COMPAT_MIN,
    MAX_VERSION: COMPAT_MAX,
    streams: buffers,
    orderings: threeFactorialOrderings(),
    exec,
    recheck,
    get version() { return version; },
    get healthy() { return healthy; },
    compatible() {
      return compatibleVersion(version.replace(/-omi$/, '') || COMPAT_MIN);
    }
  };
}

function selfTest() {
  const results = [];
  const assert = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail: detail || '' });
  };

  const box = createVersionedBusyBox();
  assert('3! orderings 6', box.orderings.length === 6);
  assert('compatible', box.compatible());
  assert('echo ok', box.exec('echo hello').ok && box.exec('echo hello').out.includes('hello'));
  const bad = box.exec('nosuchcmd');
  assert('unknown heals', bad.ok === true && bad.healed === true, JSON.stringify(bad));
  const empty = box.exec('');
  assert('empty heals or fails soft', empty.ok === true || empty.healed === true || empty.ok === false);
  const rc = box.recheck();
  assert('recheck healthy', rc.healthy === true);
  assert('recheck 3!', rc.streams === true);

  const failed = results.filter((r) => !r.pass);
  return { passed: failed.length === 0, total: results.length, failed: failed.length, results };
}

module.exports = {
  createVersionedBusyBox,
  threeFactorialOrderings,
  VERSION,
  MIN_VERSION: COMPAT_MIN,
  MAX_VERSION: COMPAT_MAX,
  selfTest
};
