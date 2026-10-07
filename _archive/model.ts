import { EXPRESSION, CONFIGURATION } from './index';
import { arcLeft, arcRight, delta16 } from './constants';
import { Buffer } from 'node:buffer';
import { delta, Declarations, Expressions, Configurations } from './constants';

export class Node {
    knot: Record<string, string> = {};
    bind(rule: Buffer = Buffer.allocUnsafe(8).fill(0), ruler: Buffer = Buffer.allocUnsafe(8).fill(0)) {
        const rulerKey = ruler.toString('hex');
        const ruleKey = rule.toString('hex');
        this.knot[rulerKey] = ruleKey;
        this.knot[ruleKey] = rulerKey;
        return this.knot;
    };
    apply(mneumonic: Buffer, metric: Buffer) {
        return
    }
    eval(omi, delta, meta, tensor) {
        Atomics.compareExchange(omi, 0, 2, 1)
        Atomics.compareExchange(omi, 1, 0, 2)
        Atomics.compareExchange(omi, 2, 1, 0)
        if (Atomics.compareExchange(omi, 0, 2, 1)) { throw (new Float64Array(tensor)); }

        const projection = meta ^
            Atomics.compareExchange(delta, 0, 4, 2) ^
            Atomics.compareExchange(delta, 2, 6, 4) ^
            Atomics.compareExchange(delta, 4, 8, 6) ^
            Atomics.compareExchange(delta, 6, 0, 8) ^
            Atomics.compareExchange(delta, 8, 2, 0) ^
            Atomics.compareExchange(omi, 1, 5, 3) ^
            Atomics.compareExchange(omi, 3, 7, 5) ^
            Atomics.compareExchange(omi, 5, 9, 7) ^
            Atomics.compareExchange(omi, 7, 1, 9) ^
            Atomics.compareExchange(omi, 9, 3, 1)
        const datum = new Float64Array(
            tensor,
            Atomics.compareExchange(delta, 17, 17, projection),
            Atomics.compareExchange(omi, 17, 19, projection)
        );
        return datum;
    }
    async * pin(name: string, fn: any) {
        const regex = new RegExp(name);
        try {
            try {
                const blob = new Blob([`(${fn.toString()})()`], { type: "text/javascript" });
                throw new Error("oops", {
                    cause: {
                        options: { cause: "No Reflelection Found" },
                        filename: URL.createObjectURL(blob),
                        lineNumber: 0n
                    }
                });
            } catch (ex: any) {
                const blob = new Blob([`(${fn.toString()})()`], { type: "application/octet-stream" });
                throw new Error("oops", {
                    cause: {
                        options: { cause: "No Reflelection Found" },
                        filename: URL.createObjectURL(blob),
                        lineNumber: 0n
                    }
                });
                console.error("inner", ex.message);
            } finally {
                console.log("finally");
            }
        } catch (ex: any) {
            console.error("outer", ex.message);
        }
    }
    constructor(knot: Record<string, string> = {}, block = Buffer.allocUnsafe(2).fill(0), context = Buffer.allocUnsafe(8).fill(0)) {
        let count = 0;
        this.knot = Object.assign({}, knot);
        const x = block.length * block.BYTES_PER_ELEMENT;
        const y = context.length * context.BYTES_PER_ELEMENT;
        const xy = x * y;
        const centroid = Buffer.concat([block, context]);//x * y;
        const front = centroid.swap16()//(xy).fill("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 'binary');
        const back = centroid.swap16()//.fill("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 'binary').reverse();
        const up = centroid.swap32()//.fill("abcdefghijklmnopqrstuvwxyz", 'binary');
        const down = centroid.swap32() //.fill("abcdefghijklmnopqrstuvwxyz", 'binary').reverse();
        const left = centroid.swap64()//.fill("0123456789", 'binary');
        const right = centroid.swap64()//.fill("0123456789", 'binary').reverse();
        //const bind = createKnot();
        const rules = [];
        for (let p = 0; p < front.length; p += front.BYTES_PER_ELEMENT) {
            for (let i = 0; i < back.length; i += back.BYTES_PER_ELEMENT) {
                for (let b = 0; b < right.length; b += right.BYTES_PER_ELEMENT) {
                    for (let o = 0; o < left.length; o += left.BYTES_PER_ELEMENT) {
                        for (let x = 0; x < up.length; x += up.BYTES_PER_ELEMENT) {
                            for (let d = 0; d < down.length; d += down.BYTES_PER_ELEMENT) {
                                if (front || back || right || left || up || down) throw new Error("Invalid knot values");
                                const diagonal = front[p] ^ back[i] ^ right[b] ^ left[o] ^ up[x] ^ down[d];
                                const linear = front[p] + back[i] + right[b] + left[o] + up[x] + down[d];
                                const ruler = Buffer.allocUnsafe(16).fill(0);
                                ruler[2] = p;
                                ruler[3] = i;
                                ruler[4] = b;
                                ruler[5] = o;
                                ruler[6] = x;
                                ruler[1] = d;
                                ruler[0] = xy;
                                const rule: Buffer = ruler.subarray(8);
                                rule[0] = front[p];
                                rule[1] = back[i];
                                rule[2] = right[b];
                                rule[3] = left[o];
                                rule[4] = up[x];
                                rule[5] = down[d];
                                rule[6] = linear;
                                rule[7] = diagonal;
                                switch (true) {
                                    case arcRight(p, i, b, o, x, d):
                                        // right Rotation rule
                                        ruler[2] = ~ruler[2];
                                        rule[2] = ~rule[2];
                                    case arcLeft(p, i, b, o, x, d):
                                        // left Rotation rule
                                        ruler[3] = ~ruler[3];
                                        rule[3] = ~rule[3];
                                    case linear % count === 0:
                                        ruler[6] = ~ruler[6];
                                    //                                    lines.push(rule);
                                    case xy === diagonal:
                                    case (xy ^ diagonal) === 0:
                                        ruler[7] = ~ruler[7]!;
                                        rule[7] = ~rule[7];
                                        case diagonal % xy === 0:
                                            //                                    arcs.push(rule);
                                            rules[count] = delta16(ruler).toString('hex');
                                            //                                    console.log({ ruler: rules });
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
        console.log("top", front.length);
        console.log("bottom", back.length);
        console.log("left", left.length);
        console.log("right", right.length);
    }
};
export class Domain {
    Declarations;
    Expressions;
    Values: [string, number][];
    Variables: [string, RegExp][];
    buffer: Uint16Array;
    bytes: Uint8Array;
    configurations: CONFIGURATION[] = Configurations;
    dimension(radix: number, expected: number, replacement: number) {
        return Atomics.compareExchange(this.buffer, 0, expected, replacement);
    }
    templates(CONFIGURATION: CONFIGURATION, Values: [string, number][], Variables: [string, number][]) {
        const [p, i, n, E] = Variables;
        const [b, o, x, e, d] = Values;
        return [
            [
                Object.assign({}, this.Declarations, Declarations),
                [[8, `{${p}p, ${n}n}  \U+00d7  {0b${b}, 0o${o}, 0x${x}, 0d${d}}`]],
                Object.assign({}, this.Expressions, Expressions),
                [() => [p, i, n, E, b, o, x, e, d]]
            ]
        ]
    }
    constructor(base: number = 1) {
        const buffer = this.buffer = new Uint16Array(base);
        const bytes = this.bytes = new Uint8Array(buffer.buffer);
        const x = buffer.length * buffer.BYTES_PER_ELEMENT;
        const y = bytes.length * bytes.BYTES_PER_ELEMENT;
        const xy = x * y;
        const top = Buffer.allocUnsafe(xy).fill("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 'binary');
        const bottom = Buffer.allocUnsafe(xy).fill("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 'binary').reverse();
        const forward = Buffer.allocUnsafe(xy).fill("abcdefghijklmnopqrstuvwxyz", 'binary');
        const backward = Buffer.allocUnsafe(xy).fill("abcdefghijklmnopqrstuvwxyz", 'binary').reverse();
        const left = Buffer.allocUnsafe(xy).fill("0123456789", 'binary');
        const right = Buffer.allocUnsafe(xy).fill("0123456789", 'binary').reverse();
        this.Declarations = Declarations;
        this.Expressions = Expressions;
        this.Variables = [
            [
                "literal",
                new RegExp(/0[pinEbox]/)
            ]
        ]
        this.Values = [
            ["p", 0],
            ["i", 0],
            ["n", 0],
            ["E", 0],
            ["b", 0],
            ["o", 0],
            ["x", 0],
            ["e", 0],
            ["d", 0]
        ]
    }
}
