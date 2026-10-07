export type SPACE = [b: number, o: number, x: number];
export type TIME = [e: number, d: number];
export type CONTINUUM = [p: number, i: number, n: number];
// Domain Literal
export type POINT = `${number}p`;
export type INDEX = `${number}i`;
export type NUMBER = `${number}n`;
// This is often called exponential notation or scientific notation.
// The format follows BaseNumber + e/E + Exponent:
export type EXPONENT = `${number}e${number}` | `${number}e${number}${'p' | 'i' | 'n'}`;
// Dimension Literal
export type BINARY = `0b${number}`;
export type OCTAL = `0o${number}`;
export type HEX = `0x${number}`;
export type DECIMAL = `${number}.${number}` | `${number}.${number}d`;
// Structural Literal
export type LITERAL = `${number}${'b' | 'o' | 'x' | 'd'}${number}${'p' | 'i' | 'n'}`;
export type STRUCT = `${number}${'e' | '.'}${number}${'b' | 'o' | 'x' | 'd'}${number}${'p' | 'i' | 'n'} `;

export type SPECTRAL = [
    p: number,
    i: number
]
export type SPATIAL = [
    b: number,
    o: number,
    x: number,
    e: number,
    d: number,
    n: number
]
export type SCALAR = [
    e: FRONT | BACK,
    d: UP | DOWN,
    n: LEFT | RIGHT
];
export type BOUNDRY = [SPECTRAL, SPATIAL] | COORDINATE;
export type CONSTRAINT = (spectrum: TIME, space: SPACE | CONTINUUM) => BOUNDRY;

export type COORDINATE = [SPECTRAL, SPATIAL, SHAPE, SCALAR?];
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

export function delta(buf: Buffer, C: Buffer) {
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
function admissible(index: any) {
    throw new Error("Function not implemented.");

}
    const handler = {
        get(target: any, index: any) {
            return Reflect.get(target, index);
        },
        set(target: any, index: any, value: any) {
            return Reflect.set(target, index, value);
        },
        has(target: object, index: PropertyKey) {
            return Reflect.has(target, index);
        },
    };
}
class Point implements iExtant{
    Point: number = 0;
    Index: number = 0;
    Number: number = 0;
    bind: REFERENCE = function Bind() { };
    apply: REFERENCE = function Apply() { };
    evaluate: REFERENCE = function Evaluate() { };
    digest: REFERENCE = function Digest() { };

}
class Circle extends Point {
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
    `0, 7, 15`
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

    function get(state: any, index: any) {
        if (!admissible(index)) {
            throw new Deviation(index, 'admissible', 'inadmissible');
        }
        return Reflect.get(state, index);
    }
    function set(state: any, index: any, value: any) {
        if (!admissible(index)) {
            throw new Deviation(index, 'admissible', 'inadmissible');
        }
        return Reflect.set(state, index, value);
    }
    function catcher(error: any, handler: { (position: any, expected: any, actual: any, difference: any): { failed: boolean; position: any; expected: any; actual: any; difference: any; }; (arg0: any, arg1: any, arg2: any, arg3: any): any; }) {
        if (error instanceof Deviation) {
            return handler(error.position, error.expected, error.actual, error.difference);
        }
        throw error;
    }
    function access(state: any, index: any, value: any) {
        try {
            if (arguments.length === 2) {
                return get(state, index);
            }
            return set(state, index, value);
        } catch (error) {
            return catcher(error, (position: any, expected: any, actual: any, difference: any) => ({
                failed: true,
                position,
                expected,
                actual,
                difference,
            }));
        }
    }
}
class Structure extends Simplex {
    Centroid: any;
    Radius: any;
    Up: any;
    Down: any;
    Left: any;
    Right: any;
    Front: any;
    Back: any;
    Expression() { }
    Error() { }
    Exit = (x: any, y: any, z: any) => {
        return `${this.Centroid}${this.Radius}${this.Up}${this.Down}${this.Left}${this.Right}${this.Front}${this.Back} `;
    }
    Escape() { }
    Evaluate() { }
}

class Source extends Simplex {
    input = (op: any) => op(this.bytes);
    output = (op: any) => op(this.bytes);
    bytes = Buffer.allocUnsafe(16);

}
class Stream extends Simplex  {
    reader: any;
    writer: any;
    buffer = Buffer.allocUnsafe(16);;
}
class Substrate extends Simplex  {
    length: any;
    offset: any;
    base = Buffer.allocUnsafe(16);;
}