import { Buffer } from 'node:buffer';
#!/data/data / com.termux / files / usr / bin / env node
import Repl from 'node:repl';
import { JSDOM } from 'jsdom';
import { createContext, runInContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import type { REPLServer } from 'node:repl';
import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import { Buffer } from 'node:buffer';

import isRecoverableError from './errors/isRecoverable';
import multilineEval from './eval/multiline';
import writer from './writers/writer';

import initializeContext from './init/context';
import initializeREPLServer from './init/server';
import initializeMemory from './init/memory';
// Construct a module worker
const worker3 = new Worker("worker_module.js", {
    type: "module",
});

function createKnot(_Knot: Record<string, string> = {}) {
    //    const _Knot: Record<string, string> = {};

    return function bind(rule: Buffer = Buffer.allocUnsafe(8).fill(0), ruler: Buffer = Buffer.allocUnsafe(8).fill(0)) {
        const rulerKey = ruler.toString('hex');
        const ruleKey = rule.toString('hex');
        _Knot[rulerKey] = ruleKey;
        _Knot[ruleKey] = rulerKey;
        return _Knot;
    };
}


function rotl(buf, n) {
    return Buffer.from(buf.map((_, i) => buf[(i + n) % buf.length]));
};
function rotr(buf, n) {
    return Buffer.from(buf.map((_, i) => buf[(i - n + buf.length) % buf.length]));
};

function xor(a, b) {
    return Buffer.from(a.map((v, i) => v ^ b[i]));
};
function isRight(t, b, r, l, f, br) {
    return (t ** 2) + (b ** 2) === r ** 2 &&
        (t ** 2) + (f ** 2) === r ** 2 &&
        (t ** 2) + (br ** 2) === r ** 2 &&
        (b ** 2) + (f ** 2) === r ** 2 &&
        (b ** 2) + (br ** 2) === r ** 2 &&
        (f ** 2) + (br ** 2) === r ** 2;
}

function isLeft(t, b, r, l, f, br) {
    return (t ** 2) + (b ** 2) === l ** 2 &&
        (t ** 2) + (f ** 2) === l ** 2 &&
        (t ** 2) + (br ** 2) === l ** 2 &&
        (b ** 2) + (f ** 2) === l ** 2 &&
        (b ** 2) + (br ** 2) === l ** 2 &&
        (f ** 2) + (br ** 2) === l ** 2;
}
function delta(buf, C) {
    return xor(xor(xor(rotl(buf, 1), rotl(buf, 3)), rotr(buf, 2)), C);
};
function delta16(ruler) {
    const state = Buffer.from(ruler.subarray(0, 8));
    const C = Buffer.from(ruler.subarray(8, 16));
    const next = delta(state, C);
    ruler.set(next, 0);
    ruler.set(state, 8);
    return ruler;
}
function calc(metric: number = 16, block = Buffer.allocUnsafe(2).fill(0), context = Buffer.allocUnsafe(8).fill(0)) {
    let count = 0;
    const x = block.length * block.BYTES_PER_ELEMENT;
    const y = context.length * context.BYTES_PER_ELEMENT;
    const xy = x * y;
    const top = Buffer.allocUnsafe(xy).fill("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 'binary');
    const bottom = Buffer.allocUnsafe(xy).fill("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 'binary').reverse();
    const forward = Buffer.allocUnsafe(xy).fill("abcdefghijklmnopqrstuvwxyz", 'binary');
    const backward = Buffer.allocUnsafe(xy).fill("abcdefghijklmnopqrstuvwxyz", 'binary').reverse();
    const left = Buffer.allocUnsafe(xy).fill("0123456789", 'binary');
    const right = Buffer.allocUnsafe(xy).fill("0123456789", 'binary').reverse();
    //const bind = createKnot();
    const rules = [];
    for (let t = 0; t < top.length; t += top.BYTES_PER_ELEMENT) {
        for (let b = 0; b < bottom.length; b += bottom.BYTES_PER_ELEMENT) {
            for (let r = 0; r < right.length; r += right.BYTES_PER_ELEMENT) {
                for (let l = 0; l < left.length; l += left.BYTES_PER_ELEMENT) {
                    for (let f = 0; f < forward.length; f += forward.BYTES_PER_ELEMENT) {
                        for (let br = 0; br < backward.length; br += backward.BYTES_PER_ELEMENT) {
                            const diagonal = top[t] ^ bottom[b] ^ right[r] ^ left[l] ^ forward[f] ^ backward[br];
                            const linear = top[t] + bottom[b] + right[r] + left[l] + forward[f] + backward[br];

                            const ruler = Buffer.allocUnsafe(16).fill(0);
                            ruler[0] = t;
                            ruler[1] = b;
                            ruler[2] = r;
                            ruler[3] = l;
                            ruler[4] = f;
                            ruler[5] = br;
                            ruler[7] = xy;
                            const rule: Buffer = ruler.subarray(8);
                            rule[0] = top[t];
                            rule[1] = bottom[b];
                            rule[2] = right[r];
                            rule[3] = left[l];
                            rule[4] = forward[f];
                            rule[5] = backward[br];
                            rule[6] = linear;
                            rule[7] = diagonal;
                            switch (true) {

                                case isRight(t, b, r, l, f, br, xy):
                                    //                                case (t ** 2) + (b ** 2) === r ** 2:
                                    //                                case (t ** 2) + (f ** 2) === r ** 2:
                                    //                                case (t ** 2) + (br ** 2) == r ** 2:
                                    //                                case (b ** 2) + (f ** 2) === r ** 2:
                                    //                                case (b ** 2) + (br ** 2) == r ** 2:
                                    //                                case (f ** 2) + (br ** 2) == r ** 2:
                                    // right Rotation rule
                                    ruler[2] = ~ruler[2]; rule[2] = ~rule[2];


                                case isLeft(t, b, r, l, f, br, xy):
                                    //				  case (t ** 2) + (b ** 2) === l ** 2:
                                    //                                case (t ** 2) + (f ** 2) === l ** 2:
                                    //                                case (t ** 2) + (br ** 2) === l ** 2:
                                    //                                case (b ** 2) + (f ** 2) === l ** 2:
                                    //                                case (b ** 2) + (br ** 2) === l ** 2:
                                    //                                case (f ** 2) + (br ** 2) === l ** 2:
                                    // left Rotation rule
                                    ruler[3] = ~ruler[3];
                                    rule[3] = ~rule[3];

                                case linear % count === 0:
                                    ruler[6] = ~ruler[6];
                                //                                    lines.push(rule);

                                case xy === diagonal:
                                case (xy ^ diagonal) === 0:
                                    // case diagonal % xy === 0:
                                    //                                    arcs.push(rule);
                                    ruler[7] = ~ruler[7];
                                    rule[7] = ~rule[7];
                                //                                    console.log({ ruler: rules });
                                case diagonal % xy === 0:
                                    rules[count] = delta16(ruler).toString('hex');
                                    //                              console.log(rules[count]);
                                    break;
                                //                                default:
                                //   process.stdout.write('.');

                            }
                            count++;
                        }
                    }
                }
            }
        }
    }


    console.log("count", count);

    console.log("top", top.length);
    console.log("bottom", bottom.length);
    console.log("left", left.length);
    console.log("right", right.length);
    return rules;

}

const buf16 = Buffer.allocUnsafe(2).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 'binary')
const buf64 = Buffer.allocUnsafe(8).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 'binary')
for (let i = 0; i < buf16.length; i++) {
    buf16[i] = i;
}
for (let i = 0; i < buf64.length; i++) {
    buf64[i] = i;
}
console.log(calc(buf16, buf64));


#!/data/data / com.termux / files / usr / bin / env node
import { Buffer } from 'node:buffer';

const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const az = 'abcdefghijklmnopqrstuvwxyz';
const base10 = "0123456789";
const buf256 = Buffer.alloc(256);
for (let i = 0; i <= 255; i++) {
    // 97 is the decimal ASCII value for 'a'.
    buf256[i] = i;
}
for (const value of buf256.values()) {
    console.log(value);

}
console.log(0, 30, buf256.subarray(0, 31).toString('binary'));
console.log(buf256.subarray(-31, 0).toString('binary'));
// Prints: buffe
// (Equivalent to buf.subarray(0, 5).

console.log(buf256.subarray(32, 63).toString('binary'));
console.log(buf256.subarray(-63, -32).toString('binary'));
// Prints: buff
// (Equivalent to buf.subarray(0, 4).)

console.log(buf256.subarray(64, 95).toString('binary'));
console.log(buf256.subarray(-95, -64).toString('binary'));

console.log(buf256.subarray(96, 127).toString('binary'));
console.log(buf256.subarray(-127, -96).toString('binary'));
// Prints: uff
// (Equivalent to buf.subarray(1, 4).)

const buf1 = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8]);

console.log(buf1);
// Prints: <Buffer 01 02 03 04 05 06 07 08>

buf1.swap16();

console.log(buf1);
// Prints: <Buffer 02 01 04 03 06 05 08 07>
const buf2 = Buffer.from('This is little-endian UTF-16', 'utf16le');
buf2.swap16(); // Convert to big-endian UTF-16 text.
const buf4 = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8]);
console.log(buf4);
// Prints: <Buffer 01 02 03 04 05 06 07 08>
buf4.swap32();
console.log(buf4);
// Prints: <Buffer 04 03 02 01 08 07 06 05>
const buf8 = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8]);
console.log(buf8);
// Prints: <Buffer 01 02 03 04 05 06 07 08>
buf8.swap64();
console.log(buf8);
