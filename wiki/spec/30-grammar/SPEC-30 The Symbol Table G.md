---
id: SPEC-30
title: "The Symbol Table G"
kind: spec
layer: grammar
status: canonical
spec: OMI-IMO-2026
up: "[[OMI-IMO]]"
down:
  - "[[SPEC-31 Declaration Syntax]]"
  - "[[SPEC-32 Mnemonics and Axes]]"
  - "[[SPEC-33 The Quadratic Forms]]"
  - "[[SPEC-34 Phases Attributes Constraints Configurations]]"
  - "[[SPEC-35 Reflections and Orbits]]"
related:
  - "[[SPEC-00 Canonical Statement]]"
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-25 The Iff]]"
  - "[[SPEC-52 The REPL and the Digest]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-04 Assembly Register Programming]]"
  - "[[SRC-05 Conspiracy Check]]"
code:
  - "rosetta/src/constants.ts"
dimensions: []
symbols:
  - "FRONT"
  - "BACK"
  - "INSIDE"
  - "OUTSIDE"
  - "UP"
  - "DOWN"
  - "LEFT"
  - "RIGHT"
  - "CENTER"
  - "CONSTRAINT"
  - "BOUNDARY"
  - "DEFLECT"
  - "REFLECT"
  - "INFLECT"
  - "AXIS"
  - "MNEMONIC"
tags: [omi-imo, grammar, symbols, regex, G, vocabulary]
---

# The Symbol Table G

## Definition

The regex-constrained vocabulary (G) defines the admissible tokens. From `rosetta/src/constants.ts`:

```typescript
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
```

## The Symbols

| Symbol | Pattern | Meaning |
|--------|---------|---------|
| FRONT | `/^[A-Za-z0-9:+]$/` | the side currently facing the solver |
| BACK | `/^[A-Za-z0-9.-]$/` | the side opposite the front |
| INSIDE | `/^[A-Za-z0-9_]$/` | alphanumeric or underscore |
| OUTSIDE | `/^[^A-Za-z0-9_]$/` | not alphanumeric or underscore |
| UP | `/^[A-Z_]$/` | uppercase or underscore |
| DOWN | `/^[a-z_]$/` | lowercase or underscore |
| LEFT | `/^[0-9+-]\.[^0-9+-]$/` | digit, dot, non-digit |
| RIGHT | `/^[^0-9+-]\.[0-9+-]$/` | non-digit, dot, digit |
| CENTER | `/^[0-9]\.[0-9]$/` | digit, dot, digit |
| CONSTRAINT | `/^[^"]+$/` | any non-quote characters |
| BOUNDARY | `/^"([^"]+)"$/` | quoted string |
| DEFLECT | `/^([^".]+):\1$/` | palindrome with colon separator |
| REFLECT | `/^([".]+):\1$/` | quoted palindrome with colon separator |
| INFLECT | `/^([".]+):([".]+):\2:\1$/` | double palindrome |
| AXIS | `/^(\d\d)[A-Za-z_](\d\d):\2[0-9+-]\1$/` | axis pattern |
| MNEMONIC | `/^(\d\d)([A-Z_]?[a-z_]+)(\d\d):\3\2\1$/` | mnemonic pattern |

## The Helper Functions

```typescript
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
```

## The Deflect, Reflect, Inflect Operations

```typescript
const DEFLECT = /^([^".]+):\1$/;

function deflect(value: string) {
    const match = DEFLECT.exec(value);
    if (!match) return null;
    return { value: match[1] };
}

const REFLECT = /^([".]+):\1$/;

function reflect(value: string) {
    const match = REFLECT.exec(value);
    if (!match) return null;
    return { value: match[1] };
}

const INFLECT = /^([".]+):([".]+):\2:\1$/;

function inflect(value: string) {
    const match = INFLECT.exec(value);
    if (!match) return null;
    return { first: match[1], second: match[2] };
}
```

## The Constraints

```
token matches G.X        →   token admissible
M_p(ruler) = v           →   ruler admissible
```

Both constraints must hold.

## The Symbol Table and the Protocol Handler

The symbol table G is the grammar of the protocol handler. In the closure-based protocol handler, G is the set of regex patterns that define which positions are admissible:

```javascript
const GRAMMAR = new Map([
  ['POINT',    /^(\d+)p$/],
  ['INDEX',    /^(\d+)i$/],
  ['NUMBER',   /^(\d+)n$/],
  ['EXPONENT', /^(\d+)e(\d+)$/],
  ['BINARY',   /^0b(\d+)$/],
  ['OCTAL',    /^0o(\d+)$/],
  ['HEX',      /^0x(\d+)$/],
  ['DECIMAL',  /^(\d+)\.(\d+)$/],
  ['LITERAL',  /^(\d+)([boxd])(\d+)([pin])$/],
  ['STRUCT',   /^(\d+)([e.])(\d+)([boxd])(\d+)([pin])$/],
  ['EXCHANGE', /^0([pn])(\d)([boxd])(\d)0([np])$/],
]);
```

The grammar is mutable. The kernel can extend it with `learn`. The handler reads the grammar from the closure scope chain on every access.
