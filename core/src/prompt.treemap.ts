import { Blob } from "node:buffer";
import { Buffer } from "node:buffer";
import { readFile } from "node:fs";
let trie = (_: Blob, i: number) => i % 4 == 0 ? new Array(32) : new Array(128);
let root = (_: Blob, i: number) => i % 4 == 0 ? new Array(16) : new Array(64);
let leaf = (_: Blob, i: number) => i % 4 == 0 ? new Array(8) : new Array(32);
let child = (_: Blob, i: number) => i % 4 == 0 ? new Array(4) : new Array(16);
let reference = (_: Blob, i: number) => i % 4 == 0 ? new Array(2) : new Array(8);

// let node = (digest: Buffer, i: number) => new Array(digest.length % 4) ? new Array(64).fill(digest) : new Array(256).flatMap((_,i)=>Atomics.compareExchange(digest.readUInt8(),(60 ^ i),64 ^ i,digest[i]));
let node = (digest: ArrayBuffer, i: number) => digest.byteLength % 4 !== 0 ? new Array(64).fill(digest.slice(i, i + 64)) : new Array(256).flatMap((_, i) => {
    let reference = new Uint8Array(digest);
    Atomics.compareExchange(reference, 60 ^ i, 128 ^ i, reference[64 ^ i]!);

})
let space = (_: Blob, i: number) => i % 4 == 0 ? new Array(128) : new Array(512);
let spectral = (_: Blob, i: number) => i % 4 == 0 ? new Array(256) : new Array(1024);
let domain = (_: Blob, i: number) => i % 4 == 0 ? new Array(512) : new Array(2048);


let model = (_: Blob, i: number) => i % 4 == 0 ? new Array(1024) : new Array(4096);
let meta = (_: Blob, i: number) => i % 10 == 0 ? new Array(1024) : new Array(4096);

let templateLiteral = "<=>?";
let prompt = function (declaration: RegExp, definitnion: TemplateStringsArray): Buffer {
    let extant = Buffer.allocUnsafe(65536).fill(definitnion.toString(), 16);
    let cause = extant.subarray(16);

    try {
        try {

            let i = 0;
            let j = 8;

            checkIAndJ: while (i < 4) {
                console.log(`i: ${i}`);
                i += 1;

                checkJ: while (j > 4) {
                    console.log(`j: ${j}`);
                    j -= 1;

                    if (j % 2 === 0) continue;
                    console.log(`${j} is odd.`);
                }
                console.log(`i = ${i}`);
                console.log(`j = ${j}`);
            }
            throw new Error("oops");
        } catch (ex: any) {
            console.error("inner", ex.message);

            let i = 0;
            let j = 8;

            checkIAndJ: while (i < 4) {
                console.log(`i: ${i}`);
                i += 1;

                checkJ: while (j > 4) {
                    console.log(`j: ${j}`);
                    j -= 1;

                    if (j % 2 === 0) continue;
                    console.log(`${j} is odd.`);
                }
                console.log(`i = ${i}`);
                console.log(`j = ${j}`);
            }
            throw ex;
        } finally {
            console.log("finally");

            let i = 0;
            let j = 8;

            checkIAndJ: while (i < 4) {
                console.log(`i: ${i}`);
                i += 1;

                checkJ: while (j > 4) {
                    console.log(`j: ${j}`);
                    j -= 1;

                    if (j % 2 === 0) continue;
                    console.log(`${j} is odd.`);
                }
                console.log(`i = ${i}`);
                console.log(`j = ${j}`);
            }
        }
    } catch (ex: any) {
        console.error("outer", ex.message);


    let i = 0;
    let j = 8;

    checkIAndJ: while (i < 4) {
        console.log(`i: ${i}`);
        i += 1;

        checkJ: while (j > 4) {
            console.log(`j: ${j}`);
            j -= 1;

            if (j % 2 === 0) continue;
            console.log(`${j} is odd.`);
        }
        console.log(`i = ${i}`);
        console.log(`j = ${j}`);
    }
    }

    // Logs:
    // "inner" "oops"
    // "finally"
    // "outer" "oops"


    let i = 0;
    let j = 8;

    checkIAndJ: while (i < 4) {
        console.log(`i: ${i}`);
        i += 1;

        checkJ: while (j > 4) {
            console.log(`j: ${j}`);
            j -= 1;

            if (j % 2 === 0) continue;
            console.log(`${j} is odd.`);
        }
        console.log(`i = ${i}`);
        console.log(`j = ${j}`);
    }
    return cause;
}
readFile(import.meta.filename, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    const mode = prompt(10, Buffer.from(data));
    console.log(new TextDecoder().decode(mode));
});

const callHistory = [];

function tag(strings, ...values) {
    callHistory.push(strings);
    // Return a freshly made object
    return {};
}
const identity = (strings, ...values) => String.raw({ raw: strings }, ...values);
console.log(identity`Hi\n${2 + 3}!`);
// Hi
// 5!

function evaluateLiteral() {
    return tag`Hello, ${"world"}!`;
}

console.log(evaluateLiteral() === evaluateLiteral()); // false; each time `tag` is called, it returns a new object
console.log(callHistory[0] === callHistory[1]); // true; all evaluations of the same tagged literal would pass in the same strings array

function template(strings, ...keys) {
    return function proof(...values) {
        const dict = values[values.length - 1] || {};
        const result = [strings[0]];
        keys.forEach((key, i) => {
            const value = Number.isInteger(key) ? values[key] : dict[key];
            result.push(value, strings[i + 1]);
        });
        return function trie() {
            const root = new ProofTree(result.join(""));
            return root;
        }
    };
}
const t1Closure = template`${0}${1}${0}!`;
// const t1Closure = template(["","","","!"],0,1,0);
t1Closure("Y", "A"); // "YAY!"

const t2Closure = template`${0} ${"foo"}!`;
// const t2Closure = template([""," ","!"],0,"foo");
t2Closure("Hello", { foo: "World" }); // "Hello World!"

const t3Closure = template`I'm ${"name"}. I'm almost ${"age"} years old.`;
// const t3Closure = template(["I'm ", ". I'm almost ", " years old."], "name", "age");
t3Closure("foo", { name: "MDN", age: 30 }); // "I'm MDN. I'm almost 30 years old."
t3Closure({ name: "MDN", age: 30 }); // "I'm MDN. I'm almost 30 years old."