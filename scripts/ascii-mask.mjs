// The 65,536-pixel mask of the ASCII pairs (space/src/trace.ts), as a PNG.
//
// Pixel (x, y) is the 16-bit index y * 256 + x: the pair (y, x). Every pixel
// is shaded by its order under K with the constant replicated (0x1D1D): order
// 8 dark, 4 lighter, 2 lighter still, 1 (the 8 fixed indices) white. The
// 1,296 pairs of /A-Z0-9/ characters are coloured by where their XOR lands:
// the control codes (letter with letter, digit with digit) gold, the lowercase
// column (letter with digit) blue.
//   node scripts/ascii-mask.mjs  ->  public/mask/ascii-pairs.png
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { orderOf, columnOf } from '../space/src/trace.ts';

const W = 256, px = Buffer.alloc(W * W * 3);
const shade = { 8: [20, 26, 34], 4: [60, 74, 92], 2: [140, 160, 180], 1: [255, 255, 255] };
for (let i = 0; i < 65536; i++) px.set(shade[orderOf(i)], i * 3);
const tag = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'].map((c) => c.charCodeAt(0));
for (const a of tag) for (const b of tag) px.set(columnOf(a ^ b) === 0 ? [226, 182, 108] : [91, 141, 224], ((a << 8) | b) * 3);

const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(W, 4); ihdr[8] = 8; ihdr[9] = 2;
const raw = Buffer.concat(Array.from({ length: W }, (_, y) => Buffer.concat([Buffer.from([0]), px.subarray(y * W * 3, (y + 1) * W * 3)])));
mkdirSync(new URL('../public/mask/', import.meta.url), { recursive: true });
writeFileSync(new URL('../public/mask/ascii-pairs.png', import.meta.url), Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
console.log('ascii-mask: public/mask/ascii-pairs.png, 256 x 256: every index shaded by its order, the 1296 tag pairs by their XOR column');
