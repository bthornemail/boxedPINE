import { Buffer } from 'node:buffer';

export type SPACE = [b: number, o: number, x: number];
export type TIME = [e: number, d: number];
export type CONTINUUM = [P: number, I: number, N: number];
// Domain Literal
export type POINT = `${number}P`;
export type INDEX = `${number}I`;
export type NUMBER = `${number}N`;
// This is often called exponential notation or scientific notation.
// The format follows BaseNumber + e/E + Exponent:
export type EXPONENT = `${number}e${number}` | `${number}e${number}${'P' | 'I' | 'N'}`;
export type EXCEPTION = `${number}E${number}` | `${number}E${number}${'P' | 'I' | 'N'}`;
// Dimension Literal
export type BINARY = `0b${number}`;
export type OCTAL = `0o${number}`;
export type HEX = `0x${number}`;
export type DECIMAL = `${number}.${number}` | `${number}.${number}d`;
// Structural Literal
export type LITERAL = `${number}${'b' | 'o' | 'x' | 'd'}${number}${'P' | 'I' | 'N'}`;
export type STRUCT = `${number}${'b' | 'o' | 'x'}${number}${'E' | 'e' | 'd' | '.'}${number}${'P' | 'I' | 'N'} `;

export type SPATIAL = [
    b: BINARY,
    o: OCTAL,
    x: HEX,
    d: DECIMAL
]
export type SPECTRAL = [
    P: POINT,
    I: INDEX,
    N: NUMBER
]
export type SCALAR = [
    e: EXPONENT,
    E: EXCEPTION
];
export type BOUNDRY = [SPECTRAL, SPATIAL] | COORDINATE;
export type CONSTRAINT = (spectrum: TIME, space: SPACE | CONTINUUM) => BOUNDRY;

export type COORDINATE = [SPECTRAL, SPATIAL, SCALAR?];
export type RULER = (boundry: BOUNDRY, constraint: CONSTRAINT) => [COORDINATE, COORDINATE];
export type RULE = (boundry: BOUNDRY, constraint: CONSTRAINT) => [COORDINATE];

export type DECLARATION = RegExp;
export type DEFINITION = [number, string];
export type EXPRESSION = (declarations: DECLARATION[], definitions: DEFINITION[]) => string
export type TEMPLATES = (p: number, i: number, n: number, E: number, b: number, o: number, x: number, e: number, d: number) => string
export type CONFIGURATION = [
    declarations?: DECLARATION[],
    definitions?: DEFINITION[],
    expressions?: EXPRESSION[],
    templates?: TEMPLATES[]
];


// F (Front): the side currently facing the solver
// B (Back): the side opposite the front
// U (Up): the side above or on top of the front side
// D (Down): the side opposite the top, underneath the Cube
// L (Left): the side directly to the left of the front
// R (Right): the side directly to the right of the front

const inside = /[A-Za-z0-9]/;
const outside = /[^A-Za-z0-9]/;

const front = /[A-Za-z0-9_-]/;
const back = /[-_A-Za-z0-9]/;
const up = /[A-Z]/;
const down = /[a-z]/;
const left = /[0-9_-]\.[^0-9_-]/;
const right = /[^0-9_-]\.[-_0-9]/;

const center = /[0-9]\.[0-9]/;
const constraint = /[^"]+/; //to match all the content between certain delimiters (in this case double quotes), or with atomic groups.
const boundry = /"([^"]+)"/;
`
[abc] is functionally equivalent to (?:a|b|c).
`
const FRONT = /^[A-Za-z0-9:+]$/;
const BACK = /^[A-Za-z0-9.-]$/;

const INSIDE = /^[A-Za-z0-9_]$/;
const OUTSIDE = /^[^A-Za-z0-9_]$/;

const UP = /^[A-Z_]$/;
const DOWN = /^[a-z_]$/;

const LEFT = /^[0-9+-]\.[^0-9+-]$/;
const RIGHT = /^[^0-9+-]\.[0-9+-]$/;
const CENTER = /^[0-9]\.[0-9]$/;

function matches(rule: RegExp, value: string) {
    return rule.test(value);
}

const isFront = (value: string) => FRONT.test(value);
const isBack = (value: string) => BACK.test(value);
const isInside = (value: string) => INSIDE.test(value);
const isOutside = (value: string) => OUTSIDE.test(value);

const isUp = (value: string) => UP.test(value);
const isDown = (value: string) => DOWN.test(value);

const isLeft = (value: string) => LEFT.test(value);
const isRight = (value: string) => RIGHT.test(value);
const isCenter = (value: string) => CENTER.test(value);

const willDeflect = (value: string) => DEFLECT.test(value);
const willReflect = (value: string) => REFLECT.test(value);
const willInflect = (value: string) => INFLECT.test(value);

const DEFLECT = /^([^".]+):\1$/;

function deflect(value: string) {
    const match = DEFLECT.exec(value);

    if (!match) return null;

    return {
        value: match[1]
    };
}
const REFLECT = /^([".]+):\1$/;
function reflect(value: string) {
    const match = REFLECT.exec(value);

    if (!match) return null;

    return {
        value: match[1]
    };
}
const INFLECT = /^([".]+):([".]+):\2:\1$/;

function inflect(value: string) {
    const match = INFLECT.exec(value);

    if (!match) return null;

    return {
        first: match[1],
        second: match[2]
    };
}
const CONSTRAINT = /^[^"]+$/;
const BOUNDARY = /^"([^"]+)"$/;

const isConstraint = (value: string) => CONSTRAINT.test(value);
const isBoundary = (value: string) => BOUNDARY.test(value);
function boundary(value: string) {
    const match = BOUNDARY.exec(value);
    if (!match) return null;

    return {
        value: match[1]
    };
}
const AXIS = /^(\d\d)[A-Za-z_](\d\d):\2[0-9+-]\1$/;
const MNEMONIC = /^(\d\d)([A-Z_]?[a-z_]+)(\d\d):\3\2\1$/;

export const Declarations: RegExp[] = [
    /0[b,o,x,d,n,p]+\d/,
    /0p[\d][boxd][\d]0n/, // Reads as: "position, a digit, a radix marker, a digit, number."
    /0[pn][boxd]0[np]/, // Reads as: "zero, either p or n, a radix marker, zero, either n or p."
    /0p[\d][^\d]0[b,o,x,d][^\d][\d]0n/, // Reads as: "position, digit, non-digit delimiter, zero, radix, non-digit delimiter, digit, number."
    /[0][pn]\d[boxd]\d[0][np]/, // This is the **canonical implementation** of `Atomics.compareExchange` as message syntax
    /*
    ```
    [0]      →  the literal anchor
    [pn]     →  the scalar type (position or number)
    \d       →  the magnitude digit
    [boxd]   →  the radix
    \d       →  the precision digit
    [0]      →  the literal anchor
    [np]     →  the scalar type (number or position)
    ```
    
    The **left side** is the **self-described encoding precision**. The **right side** is the **precision − 1**.
    */
    /[A-Za-z0-9][pn]\d[boxd]\d[np][A-Za-z0-9]/, // Reads: "alphanumeric, scalar type, digit, radix, digit, scalar type, alphanumeric." // The alphanumeric **endcaps** (`[A-Za-z0-9]`) make it a **full spatial, spectral, network message**.
    /[0][pn]\d[boxd]\d[0][np]/, // Reads: "zero, scalar type, radix, zero, scalar type." // This is a **self-described TLV (Type-Length-Value) string**
    /*
    This is a **self-described TLV (Type-Length-Value) string** with:
    
    - **Cardinality** built in — the `\d` after `[pn]`
    - **Chirality** built in — the `[np]` at the end
    - **Spatial** — the position (0p)
    - **Spectral** — the radix (0b, 0o, 0x, 0d)
    - **Network** — the alphanumeric endcaps
    
    ### The Reading
    
    | Part | Type | Value |
    |------|------|-------|
    | `[0]` | Literal anchor | 0 |
    | `[pn]` | Scalar type | p or n |
    | `\d` | Magnitude | 0-9 |
    | `[boxd]` | Radix | b, o, x, or d |
    | `\d` | Precision | 0-9 |
    | `[0]` | Literal anchor | 0 |
    | `[np]` | Scalar type | n or p |
    
    Seven components. **7 = the Fano plane.**
    
    */
    /[np].[d].[np]/, // Reads: "scalar type, dot, digit, dot, scalar type."
];
export const Expressions: EXPRESSION[] = []
export const Configurations: CONFIGURATION[] = [
    [
        Declarations,
        [[8, `{\${p}p, \${n}n}  \U+00d7  {0b\${b}, 0o\${o}, 0x\${x}, 0d\${d}}`]],
        Expressions,
        [(p, i, n, E, b, o, x, e, d) => '']
    ]
]

type SYMBOL = Partial<{
    FRONT: RegExp;
    BACK: RegExp;
    INSIDE: RegExp;
    OUTSIDE: RegExp;
    UP: RegExp;
    DOWN: RegExp;
    LEFT: RegExp;
    RIGHT: RegExp;
    CENTER: RegExp;
    CONSTRAINT: RegExp;
    BOUNDARY: RegExp;
    DEFLECT: RegExp;
    REFLECT: RegExp;
    INFLECT: RegExp;
    AXIS: RegExp;
    MNEMONIC: RegExp;
}>
const G: SYMBOL = Object.freeze({
    FRONT: /^[A-Za-z0-9:+]$/,
    BACK: /^[A-Za-z0-9.-]$/,

    INSIDE: /^[A-Za-z0-9_]$/,
    OUTSIDE: /^[^A-Za-z0-9_]$/,

    UP: /^[A-Z_]$/,
    DOWN: /^[a-z_]$/,

    LEFT: /^[0-9+-]\.[^0-9+-]$/,
    RIGHT: /^[^0-9+-]\.[0-9+-]$/,
    CENTER: /^[0-9]\.[0-9]$/,

    CONSTRAINT: /^[^"]+$/,
    BOUNDARY: /^"([^"]+)"$/,

    DEFLECT: /^([^".]+):\1$/,
    REFLECT: /^([".]+):\1$/,
    INFLECT: /^([".]+):([".]+):\2:\1$/,

    AXIS: /^(\d\d)[A-Za-z_](\d\d):\2[0-9+-]\1$/,
    MNEMONIC: /^(\d\d)([A-Z_]?[a-z_]+)(\d\d):\3\2\1$/
});
function test(symbol: any, value: string) {
    const rule = G[symbol];

    if (!(rule instanceof RegExp)) {
        throw new Error(`Unknown symbol: ${symbol} `);
    }

    return rule.test(value);
}
function match(symbol: any, value: string) {
    const rule = G[symbol];
    if (!(rule instanceof RegExp)) return null;

    const m = rule.exec(value);
    return m ? [...m] : null;
}

function rotl(buf: Buffer, n: number) {
    return Buffer.from(buf.map((_, i) => buf[(i + n) % buf.length]!));
};
function rotr(buf: Buffer, n: number) {
    return Buffer.from(buf.map((_, i) => buf[(i - n + buf.length) % buf.length]!));
};

function xor(a: Buffer, b: Buffer) {
    return Buffer.from(a.map((v, i) => v ^ b[i]!));
};

export function delta64(buf: Buffer, C: Buffer) {
    return xor(xor(xor(rotl(buf, 1), rotl(buf, 3)), rotr(buf, 2)), C);
};

export function arcRight(t: number, b: number, r: number, l: number, f: number, br: number) {
    return (t ** 2) + (b ** 2) === r ** 2 &&
        (t ** 2) + (f ** 2) === r ** 2 &&
        (t ** 2) + (br ** 2) === r ** 2 &&
        (b ** 2) + (f ** 2) === r ** 2 &&
        (b ** 2) + (br ** 2) === r ** 2 &&
        (f ** 2) + (br ** 2) === r ** 2;
}

export function arcLeft(t: number, b: number, r: number, l: number, f: number, br: number) {
    return (t ** 2) + (b ** 2) === l ** 2 &&
        (t ** 2) + (f ** 2) === l ** 2 &&
        (t ** 2) + (br ** 2) === l ** 2 &&
        (b ** 2) + (f ** 2) === l ** 2 &&
        (b ** 2) + (br ** 2) === l ** 2 &&
        (f ** 2) + (br ** 2) === l ** 2;
}

function delta16(ruler: Buffer) {
    const state = Buffer.from(ruler.subarray(0, 8));
    const C = Buffer.from(ruler.subarray(8, 16));
    const next = delta(state, C);
    ruler.set(next, 0);
    ruler.set(state, 8);
    return ruler;
}
type REFERENCE = (declaration: RegExp, definition: string) => Point


interface iExtant {
    Exponent: number = 0; // Entropy
    Exception: string = 0; // Extant
    get: REFERENCE = function get (state: any, index: any) {
    if (!admissible(index)) {
    throw new Deviation(index, 'admissible', 'inadmissible');
    }
    return Reflect.get (state, index);
    },
    set: REFERENCE = function set (state: any, index: any, value: any) {
    if (!admissible(index)) {
    throw new Deviation(index, 'admissible', 'inadmissible');
    }
    return Reflect.set (state, index, value);
    },
    has: REFERENCE = function has(target: object, index: PropertyKey) {
    return Reflect.has(target, index);
    },
    catcher: REFERENCE = function catcher(error: any, handler: { (position: any, expected: any, actual: any, difference: any): { failed: boolean; position: any; expected: any; actual: any; difference: any; }; (arg0: any, arg1: any, arg2: any, arg3: any): any; }) {
    if (error instanceof Deviation) {
    return handler(error.position, error.expected, error.actual, error.difference);
    }
    throw error;
    },
    access: REFERENCE = function access(state: any, index: any, value: any) {
    try {
    if (arguments.length === 2) {
    return get (state, index);
    }
    return set (state, index, value);
    } catch (error) {
    return catcher(error, (position: any, expected: any, actual: any, difference: any) => ({
    failed: true,
    position,
    expected,
    actual,
    difference,
    }));
    }
    },
    bind: REFERENCE = function Bind() { },
    apply: REFERENCE = function Apply() { },
    evaluate: REFERENCE = function Evaluate() { },
    digest: REFERENCE = function Digest() { },
};
class Point {
    Point: number = 0;
    Index: number = 0;
    Number: number = 0;

}
class Circle extends Point implements iExtant {
    Centroid: number = 0;
    Radius: number = 0;
}
class Triangle extends Circle {
    X(Equator: number, Up: number, Down: number) {
        Atomics.compareExchange(omi, 0, 2, 1)
        Atomics.compareExchange(omi, 1, 0, 2)
        Atomics.compareExchange(omi, 2, 1, 0)
        if (Atomics.compareExchange(omi, 0, 2, 1)) { throw (new Float64Array(tensor)); }
        `Base 0 ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]}`;
        `Base 1 ${[1, 0, 3, 2, 5, 4, 7, 6, 9, 8, 11, 10, 13, 12, 15, 14]}`;
        `Base 2 ${[2, 3, 0, 1, 6, 7, 4, 5, 10, 11, 8, 9, 14, 15, 12, 13]}`;
        return Atomics.compareExchange(Equator, this.Index, this.Point, this.Number);
    };
    Y(Middle: number, Left: number, Right: number) {
        return Atomics.compareExchange(omi, 3, 12, 3) ^
            Atomics.compareExchange(omi, 7, 8, 7) ^
            Atomics.compareExchange(omi, 11, 4, 11) ^
            Atomics.compareExchange(omi, 15, 0, 15)
                // ends 12,8,4,0, 26/24
                `base 3: 3 2 1 0 | 7 6 5 4 | 11 10 9 8 | 15 14 13 12      four - block family, starts at 0 - 7`;
        `base 7: 7 6 5 4 | 3 2 1 0 | 15 14 13 12 | 11 10 9 8      fulcrum, splits 0 - 7 and 8 - 15`;
        `base 11: 11 10 9 8 | 15 14 13 12 | 3 2 1 0 | 7 6 5 4      orthogonal base, mixed blocks`;
        `base 15: 15 14 13 12 | 11 10 9 8 | 7 6 5 4 | 3 2 1 0      four - block family, starts at 12 - 15`;

    };
    Z(Standing: number, Front: number, Back: number) {
        return Atomics.compareExchange(omi, 17, 30, 17) ^
            Atomics.compareExchange(omi, 19, 28, 19)
                `base 17: 17 16 19 18 | 21 20 23 22 | 25 24 27 26 | 29 28 31 30   the 5 - bit base, alternating`;
        `base 19: 19 18 17 16 | 23 22 21 20 | 27 26 25 24 | 31 30 29 28   the orbital base`;
    };
}
class Square extends Circle {
    Up: number = 0;
    Down: number = 0;
    Left: number = 0;
    Right: number = 0;
    Front: number = 0;
    Back: number = 0;
}
class Tetrahedron extends Square {
    Binary: number = 0;
    Octal: number = 0;
    heXadecimal: number = 0;
    Decimal: number = 0;
}

class Simplex {
    Declarations: RegExp[] = [
        /0[b,o,x,d,n,p]+\d/,
        /0p[\d][boxd][\d]0n/, // Reads as: "position, a digit, a radix marker, a digit, number."
        /0[pn][boxd]0[np]/, // Reads as: "zero, either p or n, a radix marker, zero, either n or p."
        /0p[\d][^\d]0[b,o,x,d][^\d][\d]0n/, // Reads as: "position, digit, non-digit delimiter, zero, radix, non-digit delimiter, digit, number."
        /[0][pn]\d[boxd]\d[0][np]/, // This is the **canonical implementation** of `Atomics.compareExchange` as message syntax
        /*
        ```
        [0]      →  the literal anchor
        [pn]     →  the scalar type (position or number)
        \d       →  the magnitude digit
        [boxd]   →  the radix
        \d       →  the precision digit
        [0]      →  the literal anchor
        [np]     →  the scalar type (number or position)
        ```
        
        The **left side** is the **self-described encoding precision**. The **right side** is the **precision − 1**.
        */
        /[A-Za-z0-9][pn]\d[boxd]\d[np][A-Za-z0-9]/, // Reads: "alphanumeric, scalar type, digit, radix, digit, scalar type, alphanumeric." // The alphanumeric **endcaps** (`[A-Za-z0-9]`) make it a **full spatial, spectral, network message**.
        /[0][pn]\d[boxd]\d[0][np]/, // Reads: "zero, scalar type, radix, zero, scalar type." // This is a **self-described TLV (Type-Length-Value) string**
        /*
        This is a **self-described TLV (Type-Length-Value) string** with:
        
        - **Cardinality** built in — the `\d` after `[pn]`
        - **Chirality** built in — the `[np]` at the end
        - **Spatial** — the position (0p)
        - **Spectral** — the radix (0b, 0o, 0x, 0d)
        - **Network** — the alphanumeric endcaps
        
        ### The Reading
        
        | Part | Type | Value |
        |------|------|-------|
        | `[0]` | Literal anchor | 0 |
        | `[pn]` | Scalar type | p or n |
        | `\d` | Magnitude | 0-9 |
        | `[boxd]` | Radix | b, o, x, or d |
        | `\d` | Precision | 0-9 |
        | `[0]` | Literal anchor | 0 |
        | `[np]` | Scalar type | n or p |
        
        Seven components. **7 = the Fano plane.**
        
        */
        /[np].[d].[np]/, // Reads: "scalar type, dot, digit, dot, scalar type."
    ];
    Expressions: EXPRESSION[] = []
    Configurations: CONFIGURATION[] = [
        [
            Declarations,
            [[8, `{\${p}p, \${n}n}  \U+00d7  {0b\${b}, 0o\${o}, 0x\${x}, 0d\${d}}`]],
            Expressions,
            [(p, i, n, E, b, o, x, e, d) => '']
        ]
    ]
}
class Structure extends Simplex {
    Centroid?: Triangle;
    Radius?: Triangle;
    Up?: Tetrahedron;
    Down?: Tetrahedron;
    Left?: Tetrahedron;
    Right?: Tetrahedron;
    Front?: Tetrahedron;
    Back?: Tetrahedron;
    toLiteral() {
        return `${this.Centroid}${this.Radius}${this.Up}${this.Down}${this.Left}${this.Right}${this.Front}${this.Back} `;
    }
}

class Source extends Simplex {
    input = (op: any) => op(this.bytes);
    output = (op: any) => op(this.bytes);
    bytes = Buffer.allocUnsafe(16);

}
class Stream extends Simplex {
    reader: any;
    writer: any;
    buffer = Buffer.allocUnsafe(16);;
}
class Substrate extends Simplex {
    length: any;
    offset: any;
    base = Buffer.allocUnsafe(16);;
}
export class Node {
    Structure?: Structure;
    Source?: Source;
    Stream?: Stream;
    Substrate?: Substrate;
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
    }    // Entering editor mode (Ctrl+D to finish, Ctrl+C to cancel)
    q = (x, y) => 15 * (x ** 2) + 4 * (x * y) + (y ** 2)
    e = (x, y) => 16 * (x ** 2) + 16 * (x * y) + 4 * (y ** 2)
    E = (x, y) => 60 * (x ** 2) + 16 * (x * y) + 4 * (y ** 2)
    x;
    y;

    eventHistory: string[] = [];
    set(eventString: string) {
        const eventReflection = `WEBVTT Q${this.Q(this.x, this.y)}\n\n${eventString}`;

        this.eventHistory.push(eventReflection);
        return eventReflection;
    }
    proxy(response, eventString = 'id: 1\nevent: flightStateUpdate\ndata: {"flight": "I768", "state": "landing"}\n\n') {
        setInterval(() => {
            if (!response.finished) {
                response.write(this.set(eventString));
            }
        }, 3000);
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
        this.x = x;
        this.y = y;
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
    * cycle() {
        function lucasRecursive(n) {
            if (n === 0) return 2;
            if (n === 1) return 1;
            return lucasRecursive(n - 1) + lucasRecursive(n - 2);
        }

        // Test the recursive function
        console.log(lucasRecursive(10)); // Output: 123


        // Iterative function to find nth Lucas Number

        function lucas(n) {
            // Base values for positions 0 and 1
            let a = 2, b = 1, c;

            if (n === 0) {
                return a;
            }

            // Generating Lucas number for position n
            for (let i = 2; i <= n; i++) {
                c = a + b;
                a = b;
                b = c;
            }

            return b;
        }

        // Example: Compute the 9th Lucas number
        let n = 9;
        console.log(lucas(n));

        function fibonacci(num: number): number {
            if (num <= 1) {
                return 1;
            }
            return fibonacci(num - 1) + fibonacci(num - 2);
        }
    }
    Expression() { }
    Error() { }
    Exit() { }
    Escape() { }
    Evaluate() { }
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

const b0e = (x: number, y: number) => (2 * x) + (y ** 2);
const o0e = (x: number, y: number) => (11 * (x ** 2)) + (4 * (x ** 2)) + (4 * x * y) + (y ** 2);
const x0e = (x: number, y: number, z: number) => ((4 * (x + y)) + (15 * z)) ** 2;
const d0e = (x: number, y: number, z: number) => ((16 * x) * (4 * y) * (60 * z)) ** 2;
const p0e = (x: number, y: number, z: number) => (((4 * x) + y) + (15 * z)) ** 2;
const i0e = (x: number, y: number, z: number) => ((16 * x) * (4 * y) * (60 * z)) ** 2;
const n0e = (x: number, y: number, z: number) => ((4 * x) + y + (15 * z)) ** 2;
const e0e = (x: number, y: number, z: number) => ((16 * x) * (4 * y) * (60 * z)) ** 2;
// (2x + y)²
const S = (x: number, y: number) => ((2 * x) + y) ** 2
// 44x² + 4(2x + y)²
const FS = (x: number, y: number) => ((44 * x) ** 2) + (4 * S(x, y));
// 4[11x² + (2x + y)²]
const GS = (x: number, y: number) => [
    ((11 * x) ** 2) + S(x, y),
    ((11 * x) ** 2) + S(x, y),
    ((11 * x) ** 2) + S(x, y),
    ((11 * x) ** 2) + S(x, y)
];
// 4(15x² + 4xy + y²)
const RS = (x: number, y: number) => 4 * (((15 * x) ** 2) + (4 * x * y) + (y ** 2));
// 60x² + 16xy + 4y²
const US = (x: number, y: number) => ((60 * x) ** 2) + (16 * x * y) + ((4 * y) ** 2)
const reflections = [0, 1, 2, 4, 5, 8, 9, 10, 13, 16, 17, 18, 20, 25, 26, 29, 32]
console.log(b0e(1, 1));
console.log(o0e(1, 1));
console.log(x0e(1, 1, 1));
console.log(d0e(1, 1, 1));
console.log(p0e(1, 1, 1));
console.log(i0e(1, 1, 1));
console.log(n0e(1, 1, 1));
console.log(e0e(1, 1, 1));
console.log('fs', FS(1, 1));
console.log('gs', GS(1, 1));
console.log('rs', RS(1, 1));
console.log('us', US(1, 1));
const mnemonic = Buffer.from(`0 1 2 3 4 5 6 7 8 9 A B C D E F G H I J K L M N O P Q R S T U V W X Y Z`);

const alpha = Buffer.from('α');
const beta = Buffer.from('β');
const gamma = Buffer.from('γ');
const delta = Buffer.from('δ');
const trig = [
    [`45 triples of type [ ${alpha}, ${alpha}, ${beta} ]`, [[3, 13, 14], [3, 21, 22], [3, 25, 26], [5, 11, 14], [5, 19, 22], [5, 25, 28], [6, 11, 13], [6, 19, 21], [6, 26, 28], [7, 9, 14], [7, 10, 13], [7, 11, 12], [7, 17, 22], [7, 18, 21], [7, 19, 20], [7, 25, 30], [7, 26, 29], [7, 27, 28], [9, 19, 26], [9, 21, 28], [10, 19, 25], [10, 22, 28], [11, 17, 26], [11, 18, 25], [11, 19, 24], [11, 21, 30], [11, 22, 29], [11, 23, 28], [12, 21, 25], [12, 22, 26], [13, 17, 28], [13, 19, 30], [13, 20, 25], [13, 21, 24], [13, 22, 27], [13, 23, 26], [14, 18, 28], [14, 19, 29], [14, 20, 26], [14, 21, 27], [14, 22, 24], [14, 23, 25], [15, 19, 28], [3, 5, 6], [3, 9, 10], [3, 17, 18], [3, 29, 30], [5, 9, 12], [5, 17, 20], [5, 27, 30], [6, 10, 12], [6, 18, 20], [6, 27, 29], [9, 17, 24], [9, 23, 30], [10, 18, 24], [10, 23, 29], [12, 20, 24], [12, 23, 27], [15, 17, 30], [15, 18, 29], [15, 20, 27], [15, 23, 24]]],
    [`15 triples of type [ ${beta}, ${beta}, ${beta} ]`, [[3, 12, 15], [3, 20, 23], [3, 24, 27], [5, 10, 15], [5, 18, 23], [5, 24, 29], [6, 9, 15], [6, 17, 23], [6, 24, 30], [9, 18, 27], [9, 20, 29], [10, 17, 27], [10, 20, 30], [12, 17, 29], [12, 18, 30]]],
    [`60 triples of type [ ${alpha}, ${beta}, ${gamma} ]`, [[1, 6, 7], [1, 10, 11], [1, 12, 13], [1, 14, 15], [1, 18, 19], [1, 20, 21], [1, 22, 23], [1, 24, 25], [1, 26, 27], [1, 28, 29], [2, 5, 7], [2, 9, 11], [2, 12, 14], [2, 13, 15], [2, 17, 19], [2, 20, 22], [2, 21, 23], [2, 24, 26], [2, 25, 27], [2, 28, 30], [3, 4, 7], [3, 8, 11], [3, 16, 19], [3, 28, 31], [4, 9, 13], [4, 10, 14], [4, 11, 15], [4, 17, 21], [4, 18, 22], [4, 19, 23], [4, 24, 28], [4, 25, 29], [4, 26, 30], [5, 8, 13], [5, 16, 21], [5, 26, 31], [6, 8, 14], [6, 16, 22], [6, 25, 31], [7, 8, 15], [7, 16, 23], [7, 24, 31], [8, 17, 25], [8, 18, 26], [8, 19, 27], [8, 20, 28], [8, 21, 29], [8, 22, 30], [9, 16, 25], [9, 22, 31], [10, 16, 26], [10, 21, 31], [11, 16, 27], [11, 20, 31], [12, 16, 28], [12, 19, 31], [13, 16, 29], [13, 18, 31], [14, 16, 30], [14, 17, 31]]],
    [`15 triples of type [ ${beta}, ${gamma}, ${gamma} ]`, [[1, 2, 3], [1, 4, 5], [1, 8, 9], [1, 16, 17], [1, 30, 31], [2, 4, 6], [2, 8, 10], [2, 16, 18], [2, 29, 31], [4, 8, 12], [4, 16, 20], [4, 27, 31], [8, 16, 24], [8, 23, 31], [15, 16, 31]]]
]

const code = (NULL0: ArrayBuffer, NULL00: ArrayBuffer) => {
    const x0000 = ArrayBuffer.bind([NULL0,NULL00])
    return 0x0000 ^
        Atomics.compareExchange(x0000,0x00 ,0x20,0x20);
        Atomics.compareExchange(x0000,0x7F ,0x20,0x20);
        Atomics.compareExchange(x0000,0x00 ,0x20,0x20);
        Atomics.compareExchange(x0000,0x00 ,0x20,0x20);
        Atomics.compareExchange(x0000,0x00 ,0x20,0x20);
    0x20 ^ 0x7F -> 0x5F
    0x7F ^ 0xFF -> 0x80
    0xFF ^ 0x00 -> 0xFF
    0x20 ^ 0x5F ^ 0x80 ^ 0xFF -> 0x00
}
