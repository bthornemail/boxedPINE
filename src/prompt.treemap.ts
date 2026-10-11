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

const proxy = new Proxy({
    noteHistory: {},
    callHistory: [],
    literal: "<=>?",
    expresstion: /<=>\?/,
    exponent: 0,
    template: (strings, ...values) => String.raw({ raw: strings }, ...values)
}, {
    get(obj, prop) {
        // An extra property
        if (prop === "latestBrowser") {
            return obj.callHistory[obj.callHistory.length - 1];
        }

        if (prop === "template") {
                return Reflect.apply(obj.expresstion.exec, /ab/, obj.literal);
        }
        if (prop === "template") {
            return obj.template`Hello, ${"world"}!`;
        }
        // The default behavior to return the value
        return {
            callHistory: [],
            tag: "<=>?"
        };
    },
    set(obj, prop, value) {
        const iterator = document.createNodeIterator(document, NodeFilter.SHOW_COMMENT);
        for (
            let currentNode = iterator.nextNode();
            currentNode;
            currentNode = iterator.nextNode()
        ) {
            console.log(currentNode.textContent?.trim());
        }
        if (prop === "exponent") {
            if (!Number.isInteger(value)) {
                throw new TypeError("The exponent is not an integer");
            }
            if (value > 200) {
                throw new RangeError("The exponent seems invalid");
            }
        }

        obj.callHistory.push(prop);
        // The default behavior to store the value
        obj.callHistory[prop] = value;

        // Indicate success
        return true;
    }
});

// a proxy composes and bojct to work on strings
// I can make the E from Exception to Expression.  Unless moduls 10 and mod 9 dont play out
const port = new Proxy(
    {
        trie,
        root,
        leaf,
        child,
        reference,
        node,
        space,
        spectral,
        domain,
        model,
        meta,
        proxy,
    },
    {
        get(obj, prop) {
            // An extra property
            // if (prop === "proof") {
            //   return obj.browsers[obj.browsers.length - 1];
            // }

            // return function proof(...values) {
            //     const dict = values[values.length - 1] || {};
            //     const result = [strings[0]];
            //     keys.forEach((key, i) => {
            //         const value = Number.isInteger(key) ? values[key] : dict[key];
            //         result.push(value, strings[i + 1]);
            //     });
            //     return function trie() {
            //         const root = new ProofTree(result.join(""));
            //         return root;
            //     }
            // };
            // The default behavior to return the value
            return obj.proxy;
        },
        set(obj, prop, value) {
            // An extra property
            // if (prop === "latestBrowser") {
            // obj.browsers.push(value);
            //  return true;
            // }

            // Convert the value if it is not an array
            if (typeof value === "string") {
                value = [value];
            }

            if (Reflect.defineProperty(target, property, attributes)) {
                // success
            } else {
                // failure
            }
            // The default behavior to store the value
            obj.node(prop, value);

            // Indicate success
            return true;
        },
    },
);

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

proxy.exponent = 100;
console.log(proxy.exponent); // 100
proxy.exponent = "young"; // Throws an exception
proxy.exponent = 300; // Throws an exception
console.log(proxy.callHistory[0] === proxy.callHistory[1]); // true; all evaluations of the same tagged literal would pass in the same strings array

console.log(proxy.template)//`Hi\n${2 + 3}!`);
console.log(proxy.template`Hi\n${2 + 3}!`);
// Hi
// 5!
const products = new Proxy(
    {
        browsers: ["Firefox", "Chrome"],
    },
    {
        get(obj: any, prop) {
            // An extra property
            if (prop === "latestBrowser") {
                return obj.browsers[obj.browsers.length - 1];
            }

            // The default behavior to return the value
            return obj[prop];
        },
        set(obj: any, prop, value) {
            // An extra property
            if (prop === "latestBrowser") {
                obj.browsers.push(value);
                return true;
            }

            // Convert the value if it is not an array
            if (typeof value === "string") {
                value = [value];
            }

            // The default behavior to store the value
            obj[prop] = value;

            // Indicate success
            return true;
        },
    },
);

console.log(products.browsers);
//  ['Firefox', 'Chrome']

products.browsers = "Safari";
//  pass a string (by mistake)

console.log(products.browsers);
//  ['Safari'] <- no problem, the value is an array

products.latestBrowser = "Edge";

console.log(products.browsers);
//  ['Safari', 'Edge']

console.log(products.latestBrowser);
//  'Edge'