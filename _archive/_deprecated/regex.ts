const front = /[A-Za-z0-9_-]/;
const back = /[-_A-Za-z0-9]/;
const inside = /[A-Za-z0-9]/;
const outside = /[^A-Za-z0-9]/;
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

function matches(rule, value) {
    return rule.test(value);
}

const isFront = value => FRONT.test(value);
const isBack = value => BACK.test(value);
const isInside = value => INSIDE.test(value);
const isOutside = value => OUTSIDE.test(value);

const isUp = value => UP.test(value);
const isDown = value => DOWN.test(value);

const isLeft = value => LEFT.test(value);
const isRight = value => RIGHT.test(value);
const isCenter = value => CENTER.test(value);

const isConstraint = /[^"]+/;
const isBoundary = /"([^"]+)"/;

const willDeflect = value => DEFLECT.test(value);
const willReflect = value => REFLECT.test(value);
const willInflect = value => INFLECT.test(value);

const DEFLECT = /^([^".]+):\1$/;

function deflect(value) {
    const match = DEFLECT.exec(value);

    if (!match) return null;

    return {
        value: match[1]
    };
}
const REFLECT = /^([".]+):\1$/;
function reflect(value) {
    const match = REFLECT.exec(value);

    if (!match) return null;

    return {
        value: match[1]
    };
}
const INFLECT = /^([".]+):([".]+):\2:\1$/;

function inflect(value) {
    const match = INFLECT.exec(value);

    if (!match) return null;

    return {
        first: match[1],
        second: match[2]
    };
}
const CONSTRAINT = /^[^"]+$/;
const BOUNDARY = /^"([^"]+)"$/;

const isConstraint = value => CONSTRAINT.test(value);
const isBoundary = value => BOUNDARY.test(value);
function boundary(value) {
    const match = BOUNDARY.exec(value);
    if (!match) return null;

    return {
        value: match[1]
    };
}
function boundary(value) {
    const match = BOUNDARY.exec(value);
    if (!match) return null;

    return {
        value: match[1]
    };
}
const AXIS = /^(\d\d)[A-Za-z_](\d\d):\2[0-9+-]\1$/;
const MNEMONIC = /^(\d\d)([A-Z_]?[a-z_]+)(\d\d):\3\2\1$/;
`
const G = Object.freeze({
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
function test(symbol, value) {
    const rule = G[symbol];

    if (!(rule instanceof RegExp)) {
        throw new Error(`Unknown symbol: ${ symbol } `);
    }

    return rule.test(value);
}
function match(symbol, value) {
    const rule = G[symbol];
    if (!(rule instanceof RegExp)) return null;

    const m = rule.exec(value);
    return m ? [...m] : null;
}
`

const re = new RegExp("ab+c");
//Using the constructor function provides runtime compilation of the regular expression. Use the constructor function when you know the regular expression pattern will be changing, or you don't know the pattern and are getting it from another source, such as user input.
// Note: In many cases, when trying match a special character, you can wrap it in a character class as an alternative to escaping, for example /a[*]b/.
