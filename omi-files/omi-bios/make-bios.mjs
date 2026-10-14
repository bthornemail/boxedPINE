// make-bios.mjs: write bios.img, the 4 MiB x86 BIOS image that says "hello, world"
//
// The author, 2026-10-13: the image's "Hi" becomes "Hello World", by the reasoning
// of "time to hello world", the one time the protocol counts (how long an
// introduction takes). The program is Kernighan's first, in B (1972):
//
//     main( ) {
//         extrn a, b, c;
//         putchar(a); putchar(b); putchar(c); putchar('!*n');
//     }
//     a 'hell';
//     b 'o, w';
//     c 'orld';
//
// a, b and c are three words of four characters, 12 in all; putchar adds '!' and
// the newline ('*n' in B), 14 characters out. Here, in 16-bit real mode from the
// reset vector, the words sit at the top of the image and a loop writes each byte
// to port 0xE9 (QEMU's debug console; the old image wrote "Hi" there), then halts.
// Everything else stays zero. Run: node omi-files/omi-bios/make-bios.mjs
import { writeFileSync } from 'node:fs';

const SIZE = 4 * 1024 * 1024;
const TOP = SIZE - 0x10000; // the last 64 KiB: CS = F000, base 0xFFFF0000 at reset
const image = new Uint8Array(SIZE);
const put = (ip, bytes) => image.set(bytes, TOP + ip);

// the words of the B program, and putchar's '!*n'
const DATA = 0xff80;
const words = { a: 'hell', b: 'o, w', c: 'orld' };
const text = words.a + words.b + words.c + '!\n';
put(DATA, [...text].map((ch) => ch.charCodeAt(0)));

// main: putchar each byte in turn
const MAIN = 0xff00;
put(MAIN, [
  0xfa,                         // ff00  cli
  0xfc,                         // ff01  cld
  0xbe, DATA & 0xff, DATA >> 8, // ff02  mov si, DATA
  0xb9, text.length, 0x00,      // ff05  mov cx, 14
  0x2e, 0xac,                   // ff08  cs lodsb          ; al = next character
  0xe6, 0xe9,                   // ff0a  out 0xE9, al      ; putchar
  0xe2, 0xfa,                   // ff0c  loop ff08
  0xf4,                         // ff0e  hlt
  0xeb, 0xfd,                   // ff0f  jmp ff0e
]);

// the reset vector (0xFFFFFFF0): jump to main
const rel = (MAIN - (0xfff0 + 3)) & 0xffff;
put(0xfff0, [0xe9, rel & 0xff, rel >> 8]);

writeFileSync(new URL('bios.img', import.meta.url), image);
console.log(`bios.img: ${SIZE} bytes; says ${JSON.stringify(text)} on port 0xE9`);
