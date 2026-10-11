// A SANDBOXED eMMC OVER NBD, IN A QEMU virt MACHINE
//
// The author: "test through qemu virt eMMC for nbd and sandboxed eMMC
// virtualization". Everything runs in user space: an image file, qemu-nbd on a
// Unix socket, QEMU's own block layer reading and writing through NBD, and a
// RISC-V virt machine started paused with the drive on its SD bus, inspected
// over QMP and shut down. No root, no installs, no system changes.
//
// QEMU 8.2 has no "emmc" device (it arrived in 9.1); the SD card on an SDHCI
// controller stands in: SD and eMMC are both MMC-family block devices.
// wiki: SPEC-07 I-94.
import { spawn, execFileSync, type ChildProcess } from 'node:child_process';
import { createConnection } from 'node:net';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { proofBlob } from '../../rosetta/src/proof.blob.ts';
import { CONSTANTS } from '../../core/src/verified/fano.ts';

/** The image: 1 MiB (an SD card's size must be a power of two). */
export const IMAGE_BYTES = 1 << 20;
/** Where the sixteen constants sit: right after the 8,192-byte proof Blob. */
export const CONSTANTS_AT = 8192;

export function makeImage(path: string): Uint8Array {
  const image = new Uint8Array(IMAGE_BYTES);
  image.set(proofBlob(), 0);
  image.set(CONSTANTS, CONSTANTS_AT);
  writeFileSync(path, image);
  return image;
}

const nbdUrl = (socket: string) => `nbd+unix:///?socket=${socket}`;
const waitFor = async (path: string) => { for (let i = 0; i < 100 && !existsSync(path); i++) await new Promise((r) => setTimeout(r, 50)); };

/** Serve the image over NBD on a Unix socket. */
export async function serveNbd(image: string, socket: string): Promise<ChildProcess> {
  const nbd = spawn('qemu-nbd', ['-f', 'raw', '--persistent', '--shared=4', `--socket=${socket}`, image], { stdio: 'ignore' });
  await waitFor(socket);
  return nbd;
}

/** Read the whole device back through NBD. */
export function readNbd(socket: string, out: string): Uint8Array {
  execFileSync('qemu-img', ['convert', '-f', 'raw', '-O', 'raw', nbdUrl(socket), out]);
  return new Uint8Array(readFileSync(out));
}

/** Write one byte value over a range through NBD (qemu-io's pattern write). */
export function writeNbd(socket: string, offset: number, value: number, length: number): void {
  execFileSync('qemu-io', ['-f', 'raw', '-c', `write -P ${value} ${offset} ${length}`, nbdUrl(socket)], { stdio: 'ignore' });
}

/** Send QMP commands to a QEMU control socket; return each command's reply. */
export function qmp(socket: string, commands: object[]): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const conn = createConnection(socket);
    const replies: unknown[] = [];
    let buffer = '', sent = 0;
    const send = () => conn.write(JSON.stringify(commands[sent++]) + '\n');
    conn.on('data', (d) => {
      buffer += d;
      let nl;
      while ((nl = buffer.indexOf('\n')) >= 0) {
        const msg = JSON.parse(buffer.slice(0, nl));
        buffer = buffer.slice(nl + 1);
        if (msg.QMP) { conn.write(JSON.stringify({ execute: 'qmp_capabilities' }) + '\n'); continue; }
        if ('return' in msg && sent === 0) { send(); continue; } // capabilities accepted
        if ('return' in msg || 'error' in msg) {
          replies.push(msg.return ?? msg.error);
          if (sent < commands.length) send(); else { conn.end(); resolve(replies); }
        }
      }
    });
    conn.on('error', reject);
  });
}

/** Start a RISC-V virt machine, paused, with the NBD drive on an SD bus; return its process. */
export async function bootVirt(nbdSocket: string, qmpSocket: string): Promise<ChildProcess> {
  const vm = spawn('qemu-system-riscv64', [
    '-machine', 'virt', '-nographic', '-S', '-display', 'none', '-serial', 'none', '-monitor', 'none',
    '-qmp', `unix:${qmpSocket},server=on,wait=off`,
    '-device', 'sdhci-pci',
    '-drive', `if=none,id=emmc,format=raw,file=${nbdUrl(nbdSocket)}`,
    '-device', 'sd-card,drive=emmc',
  ], { stdio: 'ignore' });
  await waitFor(qmpSocket);
  return vm;
}
