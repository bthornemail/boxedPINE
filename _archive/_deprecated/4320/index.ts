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

export type FRONT = number;
export type BACK = number;
export type UP = number;
export type DOWN = number;
export type LEFT = number;
export type RIGHT = number;
export type SHAPE = [
    POINT: number,
    INDEX: number,
    FRONT: number, // F(Front): the side currently facing the solver
    BACK: number, // B(Back): the side opposite the front
    UP: number, // U(Up): the side above or on top of the front side
    DOWN: number, // D(Down): the side opposite the top, underneath the Cube
    LEFT: number, // L(Left): the side directly to the left of the front
    RIGHT: number, // R(Right): the side directly to the right of the front
];
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
