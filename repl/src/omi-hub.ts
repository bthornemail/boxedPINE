// THE OMI HUB: the BIOS in QEMU and the agent bridge, kept running for the session
//
// The author, 2026-10-13: the hub that outlives the agents, with the "Qemu bios
// image omi-files/omi-bios ... systemd". Started at login by the user service
// repl/systemd/omi-hub.service, it runs two things side by side:
//   - QEMU booting omi-files/omi-bios/bios.img. The image is 4 MiB of zeros but
//     for nine bytes at the reset vector (0xFFFFFFF0, I-179): it writes "Hi"
//     (0x48, 0x69) to port 0xE9, QEMU's debug console, and halts. Its QMP socket
//     is left open, so the machine can be inspected and reset (the reset is
//     the signal of I-190);
//   - the agent bridge, as the hub (AGENT_NAME=hub, kept up without an agent):
//     the page talks to it, and Claude Code and OpenCode relay through it.
// Files go in $XDG_RUNTIME_DIR/omi-hub: e9.log (the BIOS's output) and qmp.sock.
// If either part stops, the hub stops too, and systemd starts it again.
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const repo = new URL('../../', import.meta.url).pathname;
const dir = join(process.env.XDG_RUNTIME_DIR ?? '/tmp', 'omi-hub');
mkdirSync(dir, { recursive: true });
const e9 = join(dir, 'e9.log'), qmp = join(dir, 'qmp.sock');
for (const f of [e9, qmp]) rmSync(f, { force: true });
const log = (...a: unknown[]) => console.error('[omi-hub]', ...a);

const children: ChildProcess[] = [];
function stop(code: number) { for (const c of children) c.kill('SIGTERM'); process.exit(code); }
process.on('SIGTERM', () => stop(0));
process.on('SIGINT', () => stop(0));
function run(name: string, cmd: string, args: string[], env: NodeJS.ProcessEnv = {}) {
  const c = spawn(cmd, args, { stdio: ['ignore', 'ignore', 'inherit'], env: { ...process.env, ...env } });
  c.on('exit', (code, signal) => { log(`${name} stopped (${signal ?? code}); stopping the hub`); stop(1); });
  children.push(c);
  return c;
}

run('qemu', 'qemu-system-x86_64', [
  '-name', 'omi-bios', '-bios', join(repo, 'omi-files/omi-bios/bios.img'),
  '-nodefaults', '-display', 'none', '-monitor', 'none', '-serial', 'none',
  '-debugcon', `file:${e9}`, '-qmp', `unix:${qmp},server=on,wait=off`,
]);
// wait for the BIOS's greeting on port 0xE9
for (let i = 0; i < 50 && !(existsSync(e9) && readFileSync(e9, 'latin1').includes('Hi')); i++) await new Promise((r) => setTimeout(r, 100));
const said = existsSync(e9) ? readFileSync(e9, 'latin1') : '';
log(said.includes('Hi') ? `the BIOS booted and said ${JSON.stringify(said)} on port 0xE9` : 'the BIOS has not spoken on port 0xE9 yet');

run('bridge', process.execPath, [join(repo, 'repl/src/agent-bridge.ts')], { AGENT_NAME: 'hub', AGENT_BRIDGE_STAY: '1' });
log(`running; files in ${dir}`);
