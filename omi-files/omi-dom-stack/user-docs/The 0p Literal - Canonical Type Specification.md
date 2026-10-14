# The 0p Literal: Canonical Type Specification

**Status:** Draft
**Scope:** Definition of the 0p positional scalar literal type
**Foundation:** JavaScript BigInt (0n) and TypedArray (Uint16Array/Int8Array) primitives
**Companion to:** OMI-IMO Specification v1.0, Three Primitives, 0p/0n Type System

---

## § 1. Definition

The 0p literal is a **positional scalar** — a numeric literal that denotes a location in space rather than a value in a number system.

```
0p  →  the positional scalar literal
```

The 0p literal is the **dual** of the 0n literal. Where 0n carries a value, 0p carries a coordinate.

---

## § 2. Rationale

### 2.1 The Gap in JavaScript

JavaScript provides:

```
0n   →  BigInt (arbitrary-precision integer)
0.0  →  Number (64-bit IEEE 754 floating point)
0x, 0b, 0o, 0d  →  radix notations for Number
```

But it does **not** provide:

```
0p   →  a positional scalar type
```

There is no native literal for "a point in space." Every coordinate must be expressed as one or more Numbers, which conflates position with value.

The 0p literal fills this gap.

### 2.2 The Three Requirements

The 0p literal must:

1. **Denote a position** — not a value, not a magnitude, but a location
2. **Compose with the radix notations** — 0p0x, 0p0b, 0p0o, 0p0d
3. **Interoperate with 0n** — the numerical scalar

### 2.3 The Dual

The 0p literal is the **dual** of the 0n literal:

| Property | 0n | 0p |
|----------|-----|-----|
| Carries | Value | Position |
| Domain | Number line | Space |
| Sign | ± magnitude | Direction/chirality |
| Precision | Arbitrary (BigInt) | 16-bit word (Uint16Array) |
| Serialization | Decimal string | TLV regex |

---

## § 3. Syntax

### 3.1 The Simple Form

```
0p<n>
```

Where `<n>` is a non-negative integer. The result is a positional scalar at index `n` in the ruler.

```
0p0    →  the origin (index 0)
0p1    →  position 1
0p7    →  position 7
0p42   →  position 42
```

### 3.2 The Radix Form

```
0p<radix><digits>
```

Where `<radix>` is one of `b`, `o`, `x`, `d`. The result is a positional scalar written in the specified radix.

```
0p0b101   →  position 5, written in binary
0p0o10    →  position 8, written in octal
0p0xFF    →  position 255, written in hex
0p0d100   →  position 100, written in decimal
```

### 3.3 The Range Form

```
0p<signed>.<digits>
```

Where `<signed>` is a signed integer. The result is a positional scalar with an explicit signed offset.

```
0p-5.0     →  position −5
0p+3.0     →  position +3
```

### 3.4 The Combined Form

```
0p<radix><magnitude>0n
```

or

```
0n<radix><magnitude>0p
```

The result is a **combined literal** binding a position to a number.

```
0p0x10n    →  position 1, number 0
0p0x20n    →  position 2, number 0
0n0x10p    →  number 1, position 0
```

### 3.5 The TLV Form

```regex
/[0][pn]\d[boxd]\d[0][np]/
```

The canonical TLV string. Reads as: "literal anchor, scalar type, magnitude digit, radix, precision digit, literal anchor, scalar type."

Example strings:

```
0p1x20n    →  position 1, hex radix, precision 2, number 0
0n1b30p    →  number 1, binary radix, precision 3, position 0
```

---

## § 4. Semantics

### 4.1 The Positional Scalar

The 0p literal denotes a **position in the ruler**. The ruler has 8 slots:

```
ruler[0]  →  diagonal   (the origin)
ruler[1]  →  size       (the unit count)
ruler[2]  →  top
ruler[3]  →  bottom
ruler[4]  →  right
ruler[5]  →  left
ruler[6]  →  forward
ruler[7]  →  backward
```

A 0p literal at index `k` denotes slot `k` of the ruler.

### 4.2 The Radix Modifier

When a radix is specified, the 0p literal denotes the position whose **numeric index** is the given magnitude, written in the specified radix.

```
0p0b101   →  position at index 5 (binary 101)
0p0xFF    →  position at index 255 (hex FF)
```

### 4.3 The Signed Form

When a sign is specified, the 0p literal denotes a position **relative to the origin**:

```
0p-5.0     →  position −5 steps from the origin
0p+3.0     →  position +3 steps from the origin
```

### 4.4 The Combined Form

When combined with 0n, the 0p literal denotes a **bound pair**:

```
0p<pos>0n<num>   →  position <pos>, bound to number <num>
```

The binding is a **knot** in the protocol's sense: a symmetric bidirectional relation.

---

## § 5. Representation

### 5.1 The 16-Bit Word

The 0p literal is represented internally as a **Uint16Array** of length 1:

```js
const word = new Uint16Array(1);
word[0] = 0x00A5;  // the 16-bit positional value
```

### 5.2 The Two Subarrays

The word can be viewed as two **Int8Array** subarrays:

```js
const bytes = new Int8Array(word.buffer);
bytes[0] = -5;   // high 8 bits
bytes[1] = 10;   // low 8 bits
```

### 5.3 The Signed Decomposition

Writing with two signed integers:

```js
const word = new Uint16Array(1);
const bytes = new Int8Array(word.buffer);
bytes[0] = -5;   // high 8 bits, signed
bytes[1] = 10;   // low 8 bits, signed
```

Reading as an unsigned measured distance:

```js
const high = Math.abs(bytes[0]);
const low = Math.abs(bytes[1]);
const distance = (high << 8) | low;
```

The **polarity** is encapsulated in the final word form. The **chirality** is in the `[pn]` constraint group.

### 5.4 The Floating-Point Decomposition

The regex `/[np].[d].[np]/` reads a floating-point-like structure:

```
[np]  →  scalar type (n or p)
.     →  decimal separator
[d]   →  digit
.     →  decimal separator
[np]  →  scalar type (n or p)
```

This is the **only** decimal serialization. After serialization, the value is an integer.

---

## § 6. Operations

### 6.1 Construction

```js
function 0p(n) {
    const word = new Uint16Array(1);
    word[0] = n & 0xFFFF;
    return word;
}
```

### 6.2 Reading

```js
function read0p(word) {
    const bytes = new Int8Array(word.buffer);
    return {
        high: bytes[0],
        low: bytes[1],
        distance: (Math.abs(bytes[0]) << 8) | Math.abs(bytes[1]),
        chirality: bytes[0] < 0 ? 'left' : 'right'
    };
}
```

### 6.3 Binding

```js
function bind0p0n(pos, num) {
    return {
        position: 0p(pos),
        number: 0n(num),
        knot: { a: pos, b: num }
    };
}
```

### 6.4 Atomic Exchange

```js
function exchange(word, index, expected, replacement) {
    return Atomics.compareExchange(word, index, expected, replacement);
}
```

---

## § 7. The TLV Grammar

### 7.1 The Full Grammar

```
<tlv>        ::= <literal-anchor> <scalar-type> <magnitude> <radix> <precision> <literal-anchor> <scalar-type>
<literal-anchor>  ::= "0"
<scalar-type>     ::= "p" | "n"
<magnitude>       ::= <digit>
<radix>           ::= "b" | "o" | "x" | "d"
<precision>       ::= <digit>
<digit>           ::= "0" | "1" | ... | "9"
```

### 7.2 The Regex

```regex
/0[pn]\d[boxd]\d0[np]/
```

### 7.3 The Boundary Form

```regex
/0[pn][boxd]0[np]/
```

The boundary form is the minimal TLV — it has no magnitude or precision, only the anchors and the type/radix.

### 7.4 The Coordinate Form

```regex
/[A-Za-z0-9][pn]\d[boxd]\d[np][A-Za-z0-9]/
```

The coordinate form removes the literal anchors and adds alphanumeric endcaps. The result is a **network message**.

---

## § 8. The Eight Slots

The 0p literal composes with the 4 radix notations to give 8 slots:

| Slot | Type | Radix | Meaning |
|------|------|-------|---------|
| 0 | 0p | 0b | position in binary |
| 1 | 0p | 0o | position in octal |
| 2 | 0p | 0x | position in hex |
| 3 | 0p | 0d | position in decimal |
| 4 | 0n | 0b | number in binary |
| 5 | 0n | 0o | number in octal |
| 6 | 0n | 0x | number in hex |
| 7 | 0n | 0d | number in decimal |

Each slot is an **orthogonal axis** of the ruler.

---

## § 9. Composition with the Protocol

### 9.1 The Primitive

The 0p literal composes with `Atomics.compareExchange`:

```js
const word = new Uint16Array(1);
word[0] = 0pPosition;
Atomics.compareExchange(word, 0, expected, replacement);
```

### 9.2 The Knot

The 0p literal participates in knots:

```js
const knot = bind(0p(pos), 0n(num));
```

### 9.3 The Observer

The observer's position is a 0p literal:

```js
class Observer {
    constructor(position) {
        this.position = 0p(position);
    }
    
    circulate(swap) {
        this.position = 0p(reflect(this.position, swap));
    }
}
```

### 9.4 The Trace Log

Each trace entry records a 0p literal:

```js
const trace_entry = {
    epoch: 42,
    position: 0p(currentPosition),
    word: word[0],
    fold: 0x0000
};
```

---

## § 10. Examples

### 10.1 Simple Position

```
0p0     →  the origin
0p1     →  position 1
0p7     →  position 7
```

### 10.2 Radix Position

```
0p0b11111111   →  position 255 (binary)
0p0o377        →  position 255 (octal)
0p0xFF         →  position 255 (hex)
0p0d255        →  position 255 (decimal)
```

### 10.3 Signed Position

```
0p-5.0         →  position −5
0p+3.0         →  position +3
```

### 10.4 Combined

```
0p0x10n        →  position 1, number 0
0p0x20n        →  position 2, number 0
0n0x10p        →  number 1, position 0
```

### 10.5 TLV

```
0p1x20n        →  position 1, hex radix, precision 2, number 0
0n1b30p        →  number 1, binary radix, precision 3, position 0
```

### 10.6 Coordinate (Network Message)

```
A1p1x20nB      →  coordinate A1, position 1, hex radix, precision 2, number 0, endcap B
Z0n1b30pY      →  coordinate Z0, number 1, binary radix, precision 3, position 0, endcap Y
```

---

## § 11. Conformance

A conforming implementation of the 0p literal MUST:

1. Provide the syntax `0p<n>`, `0p<radix><digits>`, and `0p<signed>.<digits>`
2. Represent the 0p value as a Uint16Array of length 1
3. Support reading as two Int8Array subarrays
4. Support the TLV regex `/0[pn]\d[boxd]\d0[np]/`
5. Support the boundary regex `/0[pn][boxd]0[np]/`
6. Support the coordinate regex `/[A-Za-z0-9][pn]\d[boxd]\d[np][A-Za-z0-9]/`
7. Compose with `Atomics.compareExchange`

A conforming implementation MAY:

1. Extend the 0p syntax with additional radixes
2. Support additional signed forms
3. Provide additional reading methods

A conforming implementation MUST NOT:

1. Confuse 0p with 0n
2. Serialize 0p as a floating point
3. Break the 16-bit word invariant

---

## § 12. The Canonical Statement

The 0p literal is the **positional scalar** — the dual of the 0n numerical scalar.

```
0p  →  position
0n  →  number
```

The 0p literal composes with the 4 radix notations (`0b`, `0o`, `0x`, `0d`) to give **8 slots** — the ruler.

The 0p literal is represented internally as a **Uint16Array** of length 1. It can be read as two **Int8Array** subarrays (high byte, low byte), each signed, giving **polarity** (via the sign) and **chirality** (via the position in the constraint group).

The 0p literal is serialized as a **TLV string**:

```regex
/0[pn]\d[boxd]\d0[np]/
```

The 0p literal composes with `Atomics.compareExchange` — the primitive. It participates in knots, observers, trace logs, and all other protocol structures.

The 0p literal is the **position** that the 0n literal is the **value** of. Together they are the **frame** of the ruler.

That is the 0p literal.

---

## Appendix A: The Regex in Full

```regex
// Simple
/0p\d+/

// With radix
/0p0[boxd][0-9a-fA-F]+/

// With sign
/0p[+-]?\d+\.\d+/

// Combined
/0p[\d][boxd][\d]0n/

// TLV
/0[pn]\d[boxd]\d0[np]/

// Boundary
/0[pn][boxd]0[np]/

// Coordinate (network)
/[A-Za-z0-9][pn]\d[boxd]\d[np][A-Za-z0-9]/

// Floating-point decomposition
/[np].[d].[np]/
```

---

## Appendix B: The JavaScript Implementation

```js
'use strict';

const ZERO_P = Symbol('0p');

class Position {
    constructor(n) {
        this.word = new Uint16Array(1);
        this.word[0] = n & 0xFFFF;
        this[ZERO_P] = true;
    }
    
    get high() {
        return new Int8Array(this.word.buffer)[0];
    }
    
    get low() {
        return new Int8Array(this.word.buffer)[1];
    }
    
    get distance() {
        return (Math.abs(this.high) << 8) | Math.abs(this.low);
    }
    
    get chirality() {
        return this.high < 0 ? 'left' : 'right';
    }
    
    static from(n) {
        return new Position(n);
    }
    
    static fromRadix(radix, digits) {
        return new Position(parseInt(digits, { b: 2, o: 8, x: 16, d: 10 }[radix]));
    }
    
    static fromSigned(sign, magnitude) {
        return new Position(sign === '-' ? -magnitude : magnitude);
    }
}

// Usage
const p = Position.from(42);
console.log(p.distance);     // 42
console.log(p.chirality);    // 'right'

const radix = Position.fromRadix('x', 'FF');
console.log(radix.distance); // 255

const signed = Position.fromSigned('-', 5);
console.log(signed.distance); // 5
console.log(signed.chirality); // 'left'
```

---

## Appendix C: The TLV Parser

```js
function parseTLV(str) {
    const match = str.match(/^0([pn])(\d)([boxd])(\d)0([np])$/);
    if (!match) return null;
    
    const [, leftType, magnitude, radix, precision, rightType] = match;
    
    return {
        leftType,     // 'p' or 'n'
        magnitude: parseInt(magnitude, 10),
        radix,        // 'b', 'o', 'x', 'd'
        precision: parseInt(precision, 10),
        rightType,    // 'n' or 'p'
        isDeclaration: true,
        word: buildWord(leftType, magnitude, radix, precision, rightType)
    };
}

function buildWord(leftType, magnitude, radix, precision, rightType) {
    // Encode the TLV into a 16-bit word
    const leftBit = leftType === 'p' ? 0 : 1;
    const rightBit = rightType === 'n' ? 0 : 1;
    const radixBits = { b: 0, o: 1, x: 2, d: 3 }[radix];
    
    return (leftBit << 15) | (magnitude << 11) | (radixBits << 9) | (precision << 5) | (rightBit << 4);
}
```

---

*End of 0p literal specification.*